-- Create enum for agent tiers
CREATE TYPE public.agent_tier AS ENUM ('free', 'standard', 'premium', 'enterprise');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'inactive', 'pending', 'expired');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'deployed');

-- Create enum for request types
CREATE TYPE public.request_type AS ENUM ('subscribe', 'upgrade', 'custom');

-- Enhanced agent catalog table
CREATE TABLE public.agent_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tier agent_tier NOT NULL DEFAULT 'free',
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  metrics JSONB DEFAULT '{}',
  version TEXT NOT NULL DEFAULT '1.0.0',
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  icon TEXT,
  tags TEXT[] DEFAULT '{}',
  documentation_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User subscriptions to agents
CREATE TABLE public.agent_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.agent_catalog(id) ON DELETE CASCADE,
  tier agent_tier NOT NULL,
  status subscription_status NOT NULL DEFAULT 'pending',
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Agent requests workflow
CREATE TABLE public.agent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.agent_catalog(id) ON DELETE CASCADE,
  request_type request_type NOT NULL,
  justification TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  requested_tier agent_tier,
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent usage tracking
CREATE TABLE public.agent_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.agent_catalog(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Enable Row Level Security
ALTER TABLE public.agent_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_catalog (public read)
CREATE POLICY "Anyone can view agent catalog" ON public.agent_catalog
FOR SELECT USING (true);

-- RLS Policies for agent_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.agent_subscriptions
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own subscriptions" ON public.agent_subscriptions
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own subscriptions" ON public.agent_subscriptions
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for agent_requests
CREATE POLICY "Users can view their own requests" ON public.agent_requests
FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = approved_by::text);

CREATE POLICY "Users can create their own requests" ON public.agent_requests
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own requests" ON public.agent_requests
FOR UPDATE USING (auth.uid()::text = user_id::text OR auth.uid()::text = approved_by::text);

-- RLS Policies for agent_usage
CREATE POLICY "Users can view their own usage" ON public.agent_usage
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own usage" ON public.agent_usage
FOR ALL USING (auth.uid()::text = user_id::text);

-- Insert sample data into agent_catalog
INSERT INTO public.agent_catalog (name, description, category, tier, provider, status, metrics, tags, documentation_url) VALUES
('Customer Service Bot', 'AI-powered customer service automation with natural language processing', 'Customer Support', 'standard', 'OpenAI', 'available', '{"uptime": 99.9, "response_time": 0.5, "satisfaction": 4.8}', ARRAY['customer-service', 'nlp', 'automation'], 'https://docs.example.com/customer-bot'),
('Fraud Detection AI', 'Advanced machine learning model for real-time fraud detection', 'Security', 'premium', 'TensorFlow', 'available', '{"accuracy": 98.5, "false_positive_rate": 0.2, "processing_speed": 1000}', ARRAY['fraud', 'security', 'ml'], 'https://docs.example.com/fraud-detection'),
('Network Analytics Agent', 'Real-time network performance monitoring and optimization', 'Network', 'enterprise', 'Custom', 'available', '{"coverage": 100, "latency_reduction": 35, "uptime": 99.99}', ARRAY['network', 'monitoring', 'analytics'], 'https://docs.example.com/network-agent'),
('Content Moderation AI', 'Automated content moderation for social platforms', 'Content', 'standard', 'Google', 'available', '{"accuracy": 95.2, "speed": 500, "languages": 15}', ARRAY['content', 'moderation', 'ai'], 'https://docs.example.com/content-mod'),
('Predictive Maintenance', 'IoT-based predictive maintenance for industrial equipment', 'Operations', 'premium', 'AWS', 'available', '{"prediction_accuracy": 92.8, "cost_savings": 25, "downtime_reduction": 40}', ARRAY['iot', 'maintenance', 'predictive'], 'https://docs.example.com/predictive-maintenance'),
('Personal Finance Advisor', 'AI financial planning and investment recommendations', 'Finance', 'free', 'Fintech AI', 'available', '{"user_satisfaction": 4.6, "accuracy": 88.5, "roi_improvement": 15}', ARRAY['finance', 'advisory', 'personal'], 'https://docs.example.com/finance-advisor');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_catalog_updated_at BEFORE UPDATE ON public.agent_catalog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_subscriptions_updated_at BEFORE UPDATE ON public.agent_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_requests_updated_at BEFORE UPDATE ON public.agent_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_usage_updated_at BEFORE UPDATE ON public.agent_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
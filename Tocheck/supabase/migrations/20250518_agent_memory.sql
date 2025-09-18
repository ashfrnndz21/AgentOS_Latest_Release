
-- Create agent memory table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  chat_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  memory_type TEXT NOT NULL DEFAULT 'conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on agent_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_id ON public.agent_memory (agent_id);

-- Create RAG queries table to track queries and results
CREATE TABLE IF NOT EXISTS public.rag_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  result JSONB NOT NULL,
  vector_store TEXT NOT NULL,
  model_provider TEXT NOT NULL,
  model_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

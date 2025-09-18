import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Search, 
  Filter, 
  Star, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Package,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Brain,
  Settings,
  Play,
  FileText,
  ExternalLink
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: 'free' | 'standard' | 'premium' | 'enterprise';
  provider: string;
  status: string;
  metrics: any;
  version: string;
  rating: number;
  total_reviews: number;
  icon?: string;
  tags: string[];
  documentation_url?: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  agent_id: string;
  tier: string;
  status: 'active' | 'inactive' | 'pending' | 'expired';
  subscribed_at: string;
  expires_at?: string;
  usage_limit?: number;
}

interface AgentRequest {
  id: string;
  agent_id: string;
  request_type: 'subscribe' | 'upgrade' | 'custom';
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'deployed';
  requested_tier?: 'free' | 'standard' | 'premium' | 'enterprise';
  requested_at: string;
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'free': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'standard': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'premium': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'enterprise': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'expired': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'inactive': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'customer support': return <Users className="h-4 w-4" />;
    case 'security': return <Shield className="h-4 w-4" />;
    case 'network': return <Globe className="h-4 w-4" />;
    case 'content': return <FileText className="h-4 w-4" />;
    case 'operations': return <Settings className="h-4 w-4" />;
    case 'finance': return <TrendingUp className="h-4 w-4" />;
    default: return <Brain className="h-4 w-4" />;
  }
};

// Helper functions for agent-specific metadata
const getLLMProvider = (agentName: string) => {
  const providers = {
    'Network Performance Monitor': 'Claude Sonnet 4',
    'Customer Care Assistant': 'GPT-4.1',
    'Revenue Assurance Agent': 'Claude Opus 4', 
    'Field Service Optimizer': 'GPT-4.1',
    'Spectrum Management AI': 'Claude Opus 4',
    'Churn Prediction Engine': 'GPT-4.1',
    'Network Capacity Planner': 'Claude Sonnet 4',
    'Regulatory Compliance Monitor': 'GPT-4.1'
  };
  return providers[agentName as keyof typeof providers] || 'GPT-4.1';
};

const getDataSources = (agentName: string) => {
  const dataSources = {
    'Network Performance Monitor': ['Cell Tower DB', 'Signal Metrics', 'Fault Logs', 'Performance KPIs'],
    'Customer Care Assistant': ['CRM Database', 'Billing System', 'Service History', 'Knowledge Base'],
    'Revenue Assurance Agent': ['Billing Records', 'Usage Data', 'Payment History', 'Fraud Database'],
    'Field Service Optimizer': ['Work Orders', 'Technician Schedules', 'Inventory DB', 'Traffic Data'],
    'Spectrum Management AI': ['Spectrum Database', 'Interference Logs', 'Regulatory DB', 'RF Measurements'],
    'Churn Prediction Engine': ['Customer Analytics', 'Usage Patterns', 'Payment Data', 'Support Tickets'],
    'Network Capacity Planner': ['Traffic Analytics', 'Network Topology', 'Growth Forecasts', 'Infrastructure DB'],
    'Regulatory Compliance Monitor': ['Compliance DB', 'Audit Logs', 'Regulatory Updates', 'QoS Metrics']
  };
  return dataSources[agentName as keyof typeof dataSources] || ['Internal Database', 'Analytics Platform'];
};

const getToolsIntegrations = (agentName: string) => {
  const tools = {
    'Network Performance Monitor': ['NetAct', 'Grafana', 'AlertManager', 'OSS/BSS'],
    'Customer Care Assistant': ['ServiceNow', 'Salesforce', 'Zendesk', 'SMS Gateway'],
    'Revenue Assurance Agent': ['AMDOCS', 'Oracle BRM', 'Risk Engine', 'Fraud Detection'],
    'Field Service Optimizer': ['SAP FSM', 'Google Maps', 'Mobile App', 'Inventory System'],
    'Spectrum Management AI': ['Spectrum Analyzer', 'RFSIM', 'Compliance Portal', 'RF Planning Tools'],
    'Churn Prediction Engine': ['Tableau', 'Campaign Manager', 'Email Platform', 'ML Pipeline'],
    'Network Capacity Planner': ['NetPlanner', 'Forecast Engine', 'Asset Management', 'GIS Platform'],
    'Regulatory Compliance Monitor': ['Audit Portal', 'Document System', 'Reporting Engine', 'Alert System']
  };
  return tools[agentName as keyof typeof tools] || ['API Gateway', 'Dashboard', 'Reporting'];
};

export const ModernAgentMarketplace: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('marketplace');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch agents
      const { data: agentsData, error: agentsError } = await supabase
        .from('agent_catalog')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;
      setAgents(agentsData || []);

      // Fetch user subscriptions and requests if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [subscriptionsRes, requestsRes] = await Promise.all([
          supabase
            .from('agent_subscriptions')
            .select('*')
            .eq('user_id', user.id),
          supabase
            .from('agent_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('requested_at', { ascending: false })
        ]);

        if (subscriptionsRes.error) throw subscriptionsRes.error;
        if (requestsRes.error) throw requestsRes.error;

        setSubscriptions(subscriptionsRes.data || []);
        setRequests(requestsRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeRequest = async (agent: Agent, tier: string, justification: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to subscribe to agents",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('agent_requests')
        .insert({
          user_id: user.id,
          agent_id: agent.id,
          request_type: 'subscribe' as const,
          justification,
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: `Your subscription request for ${agent.name} has been submitted for approval.`,
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit subscription request",
        variant: "destructive",
      });
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || agent.tier === selectedTier;
    
    return matchesSearch && matchesCategory && matchesTier;
  });

  const categories = [...new Set(agents.map(agent => agent.category))];
  const tiers = ['free', 'standard', 'premium', 'enterprise'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Agent Marketplace</h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Discover and subscribe to AI agents that transform your workflow
          </p>
          <div className="flex items-center justify-center mt-4">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30" variant="outline">
              <Package className="h-3 w-3 mr-1" />
              {agents.length} Agents Available
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 backdrop-blur-md border-white/10">
            <TabsTrigger value="marketplace" className="text-white data-[state=active]:bg-purple-500/30">Marketplace</TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-white data-[state=active]:bg-purple-500/30">My Subscriptions</TabsTrigger>
            <TabsTrigger value="requests" className="text-white data-[state=active]:bg-purple-500/30">My Requests</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-purple-500/30">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-8">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
                <Input
                  placeholder="Search agents by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-purple-200 focus:border-purple-400"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Tiers</SelectItem>
                  {tiers.map(tier => (
                    <SelectItem key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map(agent => {
                const isSubscribed = subscriptions.some(sub => 
                  sub.agent_id === agent.id && sub.status === 'active'
                );
                const hasPendingRequest = requests.some(req => 
                  req.agent_id === agent.id && req.status === 'pending'
                );

                return (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSubscribed={isSubscribed}
                    hasPendingRequest={hasPendingRequest}
                    onSubscribeRequest={handleSubscribeRequest}
                  />
                );
              })}
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                <Bot className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">No agents found</h3>
                <p className="text-purple-200">Try adjusting your search criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <SubscriptionsTab subscriptions={subscriptions} agents={agents} />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <RequestsTab requests={requests} agents={agents} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab subscriptions={subscriptions} requests={requests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Agent Card Component with glassmorphism design
const AgentCard: React.FC<{
  agent: Agent;
  isSubscribed: boolean;
  hasPendingRequest: boolean;
  onSubscribeRequest: (agent: Agent, tier: string, justification: string) => void;
}> = ({ agent, isSubscribed, hasPendingRequest, onSubscribeRequest }) => {
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  return (
    <Card className="h-full flex flex-col bg-white/5 backdrop-blur-md border-white/10 hover:border-purple-400/50 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500">
              <AvatarImage src={agent.icon} />
              <AvatarFallback className="bg-transparent text-white">
                {getCategoryIcon(agent.category)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-white truncate">{agent.name}</CardTitle>
              <CardDescription className="text-purple-200">{getLLMProvider(agent.name)}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-purple-100 line-clamp-3">
          {agent.description}
        </p>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-white">{agent.rating}</span>
            <span className="text-sm text-purple-200">
              ({agent.total_reviews} reviews)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {agent.tags.slice(0, 3).map(tag => (
            <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30" variant="outline">
              {tag}
            </Badge>
          ))}
          {agent.tags.length > 3 && (
            <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30" variant="outline">
              +{agent.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Enhanced Metadata */}
        <div className="space-y-4 bg-white/5 rounded-lg p-4">
          <div className="text-sm font-medium text-white mb-3">Agent Capabilities</div>
          
          {/* Capability Description */}
          <div className="text-sm text-white mb-4">
            {agent.description}
          </div>

          {/* Data Access */}
          <div className="space-y-2">
            <div className="text-xs text-purple-200 uppercase tracking-wide">Data Sources</div>
            <div className="flex flex-wrap gap-1">
              {getDataSources(agent.name).map(source => (
                <Badge key={source} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs" variant="outline">
                  {source}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tools & Integrations */}
          <div className="space-y-2">
            <div className="text-xs text-purple-200 uppercase tracking-wide">Tools & Integrations</div>
            <div className="flex flex-wrap gap-1">
              {getToolsIntegrations(agent.name).map(tool => (
                <Badge key={tool} className="bg-green-500/20 text-green-300 border-green-500/30 text-xs" variant="outline">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          {/* Model & Performance */}
          {agent.metrics && Object.keys(agent.metrics).length > 0 && (
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
              {Object.entries(agent.metrics).slice(0, 2).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="text-purple-200 capitalize">{key.replace(/_/g, ' ')}</div>
                  <div className="text-white font-medium">
                    {typeof value === 'number' ? value.toFixed(1) : String(value)}
                    {key.includes('accuracy') || key.includes('rate') ? '%' : key.includes('time') ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 space-y-2">
        <div className="flex gap-2 w-full">
          {isSubscribed ? (
            <Button className="flex-1 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30" variant="outline" disabled>
              <CheckCircle className="h-4 w-4 mr-2" />
              Subscribed
            </Button>
          ) : hasPendingRequest ? (
            <Button className="flex-1 bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30" variant="outline" disabled>
              <Clock className="h-4 w-4 mr-2" />
              Request Pending
            </Button>
          ) : (
            <Button 
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
              onClick={() => setShowRequestDialog(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              Request Access
            </Button>
          )}
          
          {agent.documentation_url && (
            <Button variant="outline" size="icon" className="bg-white/5 border-white/10 text-white hover:bg-white/10" asChild>
              <a href={agent.documentation_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>

      {showRequestDialog && (
        <RequestDialog
          agent={agent}
          onSubmit={onSubscribeRequest}
          onClose={() => setShowRequestDialog(false)}
        />
      )}
    </Card>
  );
};

// Request Dialog Component with glassmorphism design
const RequestDialog: React.FC<{
  agent: Agent;
  onSubmit: (agent: Agent, tier: string, justification: string) => void;
  onClose: () => void;
}> = ({ agent, onSubmit, onClose }) => {
  const [justification, setJustification] = useState('');

  const handleSubmit = () => {
    if (justification.trim()) {
      onSubmit(agent, '', justification); // No tier needed
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800/90 backdrop-blur-md border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Request Agent Access</CardTitle>
          <CardDescription className="text-purple-200">
            Submit a subscription request for {agent.name} from {agent.provider}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Business Justification</label>
            <textarea
              className="w-full p-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-purple-200 focus:border-purple-400 text-sm"
              rows={4}
              placeholder="Explain why your department needs access to this agent and how it will be used in your workflow..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
            disabled={!justification.trim()}
          >
            Submit Request
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Subscriptions Tab with dark theme styling
const SubscriptionsTab: React.FC<{
  subscriptions: Subscription[];
  agents: Agent[];
}> = ({ subscriptions, agents }) => {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">My Subscriptions</h2>
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          {subscriptions.filter(sub => sub.status === 'active').length} Active
        </Badge>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
          <Package className="h-12 w-12 text-purple-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No subscriptions yet</h3>
          <p className="text-purple-200">Start by requesting access to agents from the marketplace</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map(subscription => {
            const agent = agents.find(a => a.id === subscription.agent_id);
            if (!agent) return null;

            return (
              <Card key={subscription.id} className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500">
                        <AvatarImage src={agent.icon} />
                        <AvatarFallback className="bg-transparent text-white">
                          {getCategoryIcon(agent.category)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{agent.name}</div>
                        <div className="text-sm text-purple-200">{agent.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTierColor(subscription.tier)} variant="outline">
                        {subscription.tier}
                      </Badge>
                      <Badge className={getStatusColor(subscription.status)} variant="outline">
                        {subscription.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Requests Tab with dark theme styling
const RequestsTab: React.FC<{
  requests: AgentRequest[];
  agents: Agent[];
}> = ({ requests, agents }) => {
  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'rejected': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'deployed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">My Requests</h2>
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          {requests.filter(req => req.status === 'pending').length} Pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
          <Clock className="h-12 w-12 text-purple-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No requests yet</h3>
          <p className="text-purple-200">Submit requests for agent access from the marketplace</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(request => {
            const agent = agents.find(a => a.id === request.agent_id);
            if (!agent) return null;

            return (
              <Card key={request.id} className="bg-white/5 backdrop-blur-md border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500">
                        <AvatarImage src={agent.icon} />
                        <AvatarFallback className="bg-transparent text-white">
                          {getCategoryIcon(agent.category)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{agent.name}</div>
                        <div className="text-sm text-purple-200">
                          {request.request_type} - {request.requested_tier}
                        </div>
                      </div>
                    </div>
                    <Badge className={getRequestStatusColor(request.status)} variant="outline">
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-200">
                    {request.justification}
                  </p>
                  <div className="text-xs text-purple-300 mt-2">
                    Requested: {new Date(request.requested_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Analytics Tab with dark theme styling
const AnalyticsTab: React.FC<{
  subscriptions: Subscription[];
  requests: AgentRequest[];
}> = ({ subscriptions, requests }) => {
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  const approvedRequests = requests.filter(req => req.status === 'approved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold text-white">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{activeSubscriptions}</div>
                <div className="text-sm text-purple-300">Active Subscriptions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{pendingRequests}</div>
                <div className="text-sm text-purple-300">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
              <div>
                <div className="text-2xl font-bold text-white">{approvedRequests}</div>
                <div className="text-sm text-purple-300">Approved Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0}%
                </div>
                <div className="text-sm text-purple-300">Approval Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalSubscriptions > 0 && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Subscription Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-purple-300">
                <span>Active Subscriptions</span>
                <span>{activeSubscriptions}/{totalSubscriptions}</span>
              </div>
              <Progress value={(activeSubscriptions / totalSubscriptions) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModernAgentMarketplace;

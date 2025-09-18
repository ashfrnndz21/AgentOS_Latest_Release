import React, { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  framework: string;
  status: 'active' | 'deploying' | 'failed' | 'stopped';
  endpoint: string;
  created_at: string;
  updated_at: string;
  last_activity: string;
  performance_metrics: {
    requests_per_minute?: number;
    avg_response_time?: number;
    success_rate?: number;
    memory_usage?: number;
    cpu_usage?: number;
  };
}

interface MemoryStore {
  id: string;
  name: string;
  description: string;
  strategies: string[];
  created_at: string;
}

interface WorkloadIdentity {
  id: string;
  name: string;
  credential_providers: Array<{
    name: string;
    type: string;
    client_id: string;
    client_secret: string;
  }>;
  created_at: string;
}

interface SystemMetrics {
  total_agents: number;
  active_agents: number;
  deploying_agents: number;
  failed_agents: number;
  avg_response_time: number;
  success_rate: number;
  requests_per_minute: number;
}

type TabType = 'aws-config' | 'runtime' | 'memory' | 'identity' | 'gateway' | 'monitoring';

export const AgentControlPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('runtime');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [memoryStores, setMemoryStores] = useState<MemoryStore[]>([]);
  const [workloadIdentities, setWorkloadIdentities] = useState<WorkloadIdentity[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    total_agents: 0,
    active_agents: 0,
    deploying_agents: 0,
    failed_agents: 0,
    avg_response_time: 0,
    success_rate: 0,
    requests_per_minute: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateMemoryStore, setShowCreateMemoryStore] = useState(false);
  const [showCreateIdentity, setShowCreateIdentity] = useState(false);
  const [showDeployAgent, setShowDeployAgent] = useState(false);

  // API Base URL
  const API_BASE = 'http://localhost:5001/api';

  // Delete agent function
  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/agents/${agentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh the agents list
        fetchAgents();
        // Show success message (you can add a toast here if needed)
        console.log('Agent deleted successfully');
      } else {
        console.error('Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  // Delete memory store function
  const deleteMemoryStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this memory store? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/memory-stores/${storeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh the memory stores list
        fetchMemoryStores();
        console.log('Memory store deleted successfully');
      } else {
        console.error('Failed to delete memory store');
      }
    } catch (error) {
      console.error('Error deleting memory store:', error);
    }
  };

  // Delete workload identity function
  const deleteWorkloadIdentity = async (identityId: string) => {
    if (!confirm('Are you sure you want to delete this workload identity? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/workload-identities/${identityId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh the workload identities list
        fetchWorkloadIdentities();
        console.log('Workload identity deleted successfully');
      } else {
        console.error('Failed to delete workload identity');
      }
    } catch (error) {
      console.error('Error deleting workload identity:', error);
    }
  };

  // Fetch data from backend
  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_BASE}/agents`);
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchMemoryStores = async () => {
    try {
      const response = await fetch(`${API_BASE}/memory-stores`);
      const data = await response.json();
      setMemoryStores(data.memory_stores || []);
    } catch (error) {
      console.error('Error fetching memory stores:', error);
    }
  };

  const fetchWorkloadIdentities = async () => {
    try {
      const response = await fetch(`${API_BASE}/workload-identities`);
      const data = await response.json();
      setWorkloadIdentities(data.workload_identities || []);
    } catch (error) {
      console.error('Error fetching workload identities:', error);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/monitoring/system`);
      const data = await response.json();
      setSystemMetrics(data);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAgents(),
        fetchMemoryStores(),
        fetchWorkloadIdentities(),
        fetchSystemMetrics()
      ]);
      setLoading(false);
    };

    loadData();

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchAgents();
      fetchSystemMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Agent Control Panel</h1>
                  <p className="text-sm text-gray-400">Manage AI agents with AWS Bedrock AgentCore services</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30">
                Demo Mode Enabled
              </span>
              <span className="text-xs text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
          <button 
            onClick={() => setActiveTab('aws-config')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'aws-config' 
                ? 'text-white bg-green-600' 
                : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
            }`}
          >
            AWS Config
          </button>
          <button 
            onClick={() => setActiveTab('runtime')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'runtime' 
                ? 'text-white bg-green-600' 
                : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Runtime
          </button>
          <button 
            onClick={() => setActiveTab('memory')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'memory' 
                ? 'text-white bg-green-600' 
                : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Memory
          </button>
          <button 
            onClick={() => setActiveTab('identity')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'identity' 
                ? 'text-white bg-green-600' 
                : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Identity
          </button>
          <button 
            onClick={() => setActiveTab('gateway')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'gateway' 
                ? 'text-white bg-green-600' 
                : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Gateway
          </button>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'monitoring' 
                ? 'text-white bg-green-600' 
                : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Monitoring
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AWS Config Tab */}
            {activeTab === 'aws-config' && (
              <AWSConfigTab />
            )}

            {/* Runtime Tab */}
            {activeTab === 'runtime' && (
              <RuntimeTab 
                agents={agents}
                systemMetrics={systemMetrics}
                onDeployAgent={() => setShowDeployAgent(true)}
                onRefresh={fetchAgents}
                onDeleteAgent={deleteAgent}
              />
            )}

            {/* Memory Tab */}
            {activeTab === 'memory' && (
              <MemoryTab 
                memoryStores={memoryStores}
                onCreateStore={() => setShowCreateMemoryStore(true)}
                onRefresh={fetchMemoryStores}
                onDeleteStore={deleteMemoryStore}
              />
            )}

            {/* Identity Tab */}
            {activeTab === 'identity' && (
              <IdentityTab 
                workloadIdentities={workloadIdentities}
                onCreateIdentity={() => setShowCreateIdentity(true)}
                onRefresh={fetchWorkloadIdentities}
                onDeleteIdentity={deleteWorkloadIdentity}
              />
            )}

            {/* Gateway Tab */}
            {activeTab === 'gateway' && (
              <GatewayTab />
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <MonitoringTab systemMetrics={systemMetrics} />
            )}
          </div>
        )}

        {/* Modals */}
        {showCreateMemoryStore && (
          <CreateMemoryStoreModal 
            onClose={() => setShowCreateMemoryStore(false)}
            onSuccess={() => {
              setShowCreateMemoryStore(false);
              fetchMemoryStores();
            }}
          />
        )}

        {showCreateIdentity && (
          <CreateIdentityModal 
            onClose={() => setShowCreateIdentity(false)}
            onSuccess={() => {
              setShowCreateIdentity(false);
              fetchWorkloadIdentities();
            }}
          />
        )}

        {showDeployAgent && (
          <DeployAgentModal 
            onClose={() => setShowDeployAgent(false)}
            onSuccess={() => {
              setShowDeployAgent(false);
              fetchAgents();
            }}
          />
        )}
      </div>
    </div>
  );
};

// AWS Config Tab Component
const AWSConfigTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">AWS Configuration</h2>
          <p className="text-gray-400">Configure AWS Bedrock AgentCore services and credentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">AWS Credentials</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">AWS Region</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                <option>us-east-1</option>
                <option>us-west-2</option>
                <option>eu-west-1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Access Key ID</label>
              <input 
                type="password" 
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="AKIA..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Secret Access Key</label>
              <input 
                type="password" 
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="••••••••"
              />
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              Save Configuration
            </button>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Bedrock Runtime</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">AgentCore</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Lambda</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">S3</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Runtime Tab Component
interface RuntimeTabProps {
  agents: Agent[];
  systemMetrics: SystemMetrics;
  onDeployAgent: () => void;
  onRefresh: () => void;
  onDeleteAgent: (agentId: string) => void;
}

const RuntimeTab: React.FC<RuntimeTabProps> = ({ agents, systemMetrics, onDeployAgent, onRefresh, onDeleteAgent }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'deploying': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'stopped': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'deploying': return '🔄';
      case 'failed': return '❌';
      case 'stopped': return '⏹️';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Runtime</h2>
          <p className="text-gray-400">Deploy and manage agents using AWS Bedrock AgentCore Runtime</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={() => window.open('/agent-command', '_blank')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            🧠 Advanced Creation
          </button>
          <button 
            onClick={onDeployAgent}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            ➕ Quick Deploy
          </button>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Deployed Agents</h3>
              <p className="text-sm text-gray-400">Deploy New</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-400 border-b border-gray-700 pb-2">
              <div>Name</div>
              <div>Status</div>
              <div>Endpoint</div>
              <div>Created</div>
              <div>Actions</div>
            </div>

            {/* Agent Rows */}
            {agents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No agents deployed yet. Click "Deploy Agent" to get started.
              </div>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="grid grid-cols-5 gap-4 items-center py-3 border-b border-gray-700/50">
                  <div className="flex flex-col">
                    <div className="text-white font-medium">{agent.name}</div>
                    <div className="flex gap-1 mt-1">
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        agent.framework === 'bedrock-agentcore' ? 'bg-orange-500/20 text-orange-400' :
                        agent.framework === 'strands' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {agent.framework}
                      </span>
                      {agent.config?.creation_type === 'complex' && (
                        <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                          Advanced
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs border flex items-center gap-1 w-fit ${getStatusColor(agent.status)}`}>
                      {getStatusIcon(agent.status)} <span className="capitalize">{agent.status}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-sm font-mono truncate max-w-xs">
                      {agent.endpoint}
                    </span>
                    <button className="text-gray-400 hover:text-blue-400">🔗</button>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 border border-gray-600 rounded text-white hover:bg-gray-700" title="Start">
                      ▶️
                    </button>
                    <button className="p-1 border border-gray-600 rounded text-white hover:bg-gray-700" title="Stop">
                      ⏹️
                    </button>
                    <button 
                      onClick={() => onDeleteAgent(agent.id)}
                      className="p-1 border border-red-600 text-red-400 rounded hover:bg-red-900/20" 
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Agents</p>
              <p className="text-2xl font-bold text-white">{systemMetrics.total_agents}</p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-400">{systemMetrics.active_agents}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">{systemMetrics.success_rate.toFixed(1)}%</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-yellow-400">{Math.round(systemMetrics.avg_response_time)}ms</p>
            </div>
            <div className="text-2xl">⏱️</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memory Tab Component
interface MemoryTabProps {
  memoryStores: MemoryStore[];
  onCreateStore: () => void;
  onRefresh: () => void;
  onDeleteStore: (storeId: string) => void;
}

const MemoryTab: React.FC<MemoryTabProps> = ({ memoryStores, onCreateStore, onRefresh, onDeleteStore }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Memory Management</h2>
          <p className="text-gray-400">Configure agent memory using AWS Bedrock AgentCore Memory</p>
        </div>
        <button 
          onClick={onCreateStore}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          ➕ Create Memory Store
        </button>
      </div>

      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6 w-fit">
        <button className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md">
          Memory Stores
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-md">
          Create New
        </button>
      </div>

      {/* Memory Stores Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-6">
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-400 border-b border-gray-700 pb-2">
              <div>Name</div>
              <div>Description</div>
              <div>Strategies</div>
              <div>Actions</div>
            </div>

            {/* Memory Store Rows */}
            {memoryStores.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No memory stores configured yet. Click "Create Memory Store" to get started.
              </div>
            ) : (
              memoryStores.map((store) => (
                <div key={store.id} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-white">📁</span>
                    <span className="text-white font-medium">{store.name}</span>
                  </div>
                  <div className="text-gray-300">{store.description}</div>
                  <div className="flex gap-1">
                    {store.strategies.map((strategy, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {strategy}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 border border-gray-600 rounded text-white hover:bg-gray-700" title="Configure">
                      ⚙️
                    </button>
                    <button 
                      onClick={() => onDeleteStore(store.id)}
                      className="p-1 border border-red-600 text-red-400 rounded hover:bg-red-900/20" 
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Identity Tab Component
interface IdentityTabProps {
  workloadIdentities: WorkloadIdentity[];
  onCreateIdentity: () => void;
  onRefresh: () => void;
  onDeleteIdentity: (identityId: string) => void;
}

const IdentityTab: React.FC<IdentityTabProps> = ({ workloadIdentities, onCreateIdentity, onRefresh, onDeleteIdentity }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Workload Identity</h2>
          <p className="text-gray-400">Manage agent identities using AWS Bedrock AgentCore Identity</p>
        </div>
        <button 
          onClick={onCreateIdentity}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          ➕ Create Identity
        </button>
      </div>

      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6 w-fit">
        <button className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md">
          Workload Identities
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-md">
          Create New
        </button>
      </div>

      {/* Identities Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="p-6">
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-400 border-b border-gray-700 pb-2">
              <div>Name</div>
              <div>Credential Providers</div>
              <div>Actions</div>
            </div>

            {/* Identity Rows */}
            {workloadIdentities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No workload identities configured yet. Click "Create Identity" to get started.
              </div>
            ) : (
              workloadIdentities.map((identity) => (
                <div key={identity.id} className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-white">🔐</span>
                    <span className="text-white font-medium">{identity.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {identity.credential_providers.map((provider, index) => (
                      <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        {provider.name} ({provider.type})
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 border border-gray-600 rounded text-white hover:bg-gray-700" title="Configure">
                      ⚙️
                    </button>
                    <button 
                      onClick={() => onDeleteIdentity(identity.id)}
                      className="p-1 border border-red-600 text-red-400 rounded hover:bg-red-900/20" 
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Gateway Tab Component
const GatewayTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">API Gateway</h2>
          <p className="text-gray-400">Configure API Gateway for agent endpoints</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2">
          ➕ Create Gateway
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Gateway Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gateway Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="agent-api-gateway"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                <option>prod</option>
                <option>dev</option>
                <option>staging</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Throttling (requests/sec)</label>
              <input 
                type="number" 
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="1000"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Gateways</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div>
                <div className="text-white font-medium">agent-api-gateway</div>
                <div className="text-sm text-gray-400">https://api.gateway.amazonaws.com/prod</div>
              </div>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Monitoring Tab Component
interface MonitoringTabProps {
  systemMetrics: SystemMetrics;
}

const MonitoringTab: React.FC<MonitoringTabProps> = ({ systemMetrics }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Real-Time Monitoring</h2>
          <p className="text-gray-400">Monitor agent performance and system health</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            📊 View Logs
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            📈 Metrics Dashboard
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">System Health</p>
              <p className="text-2xl font-bold text-green-400">100%</p>
            </div>
            <div className="text-2xl">🛡️</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Agents</p>
              <p className="text-2xl font-bold text-blue-400">{systemMetrics.active_agents}</p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Requests/Min</p>
              <p className="text-2xl font-bold text-green-400">{Math.round(systemMetrics.requests_per_minute)}</p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-yellow-400">{Math.round(systemMetrics.avg_response_time)}ms</p>
            </div>
            <div className="text-2xl">⏱️</div>
          </div>
        </div>
      </div>

      {/* Performance Charts Placeholder */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="h-64 bg-gray-700 rounded flex items-center justify-center">
          <div className="text-gray-400">📊 Real-time performance charts would be displayed here</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">INFO</span>
              <span className="text-white">Customer Service Agent processed request</span>
            </div>
            <span className="text-gray-400 text-sm">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">DEPLOY</span>
              <span className="text-white">Risk Assessment Agent deployment started</span>
            </div>
            <span className="text-gray-400 text-sm">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Components
interface CreateMemoryStoreModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMemoryStoreModal: React.FC<CreateMemoryStoreModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    strategies: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/memory-stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating memory store:', error);
    }
  };

  const toggleStrategy = (strategy: string) => {
    setFormData(prev => ({
      ...prev,
      strategies: prev.strategies.includes(strategy)
        ? prev.strategies.filter(s => s !== strategy)
        : [...prev.strategies, strategy]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Create Memory Store</h2>
        <p className="text-gray-400 mb-6">Configure a new memory store for agent context and learning</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Store Name</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="Enter memory store name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24"
              placeholder="Describe what this memory store will contain..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Memory Strategies</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={formData.strategies.includes('semantic')}
                  onChange={() => toggleStrategy('semantic')}
                  className="rounded"
                />
                <span className="text-white">Semantic Memory - Vector-based similarity search for contextual retrieval</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  checked={formData.strategies.includes('summarization')}
                  onChange={() => toggleStrategy('summarization')}
                  className="rounded"
                />
                <span className="text-white">Summarization - Automatic summarization of long conversations</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Create Memory Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CreateIdentityModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateIdentityModal: React.FC<CreateIdentityModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    credential_providers: [{
      name: '',
      type: 'oauth2',
      client_id: '',
      client_secret: ''
    }]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/workload-identities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating workload identity:', error);
    }
  };

  const addProvider = () => {
    setFormData(prev => ({
      ...prev,
      credential_providers: [...prev.credential_providers, {
        name: '',
        type: 'oauth2',
        client_id: '',
        client_secret: ''
      }]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Create Workload Identity</h2>
        <p className="text-gray-400 mb-6">Configure a new workload identity with credential providers</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Identity Name</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="Enter identity name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Credential Providers</label>
            {formData.credential_providers.map((provider, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Provider Name</label>
                    <input 
                      type="text"
                      value={provider.name}
                      onChange={(e) => {
                        const newProviders = [...formData.credential_providers];
                        newProviders[index].name = e.target.value;
                        setFormData(prev => ({ ...prev, credential_providers: newProviders }));
                      }}
                      className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                      placeholder="e.g., Salesforce OAuth"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Type</label>
                    <select 
                      value={provider.type}
                      onChange={(e) => {
                        const newProviders = [...formData.credential_providers];
                        newProviders[index].type = e.target.value;
                        setFormData(prev => ({ ...prev, credential_providers: newProviders }));
                      }}
                      className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                    >
                      <option value="oauth2">OAuth2</option>
                      <option value="api-key">API Key</option>
                      <option value="jwt">JWT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Client ID</label>
                    <input 
                      type="text"
                      value={provider.client_id}
                      onChange={(e) => {
                        const newProviders = [...formData.credential_providers];
                        newProviders[index].client_id = e.target.value;
                        setFormData(prev => ({ ...prev, credential_providers: newProviders }));
                      }}
                      className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                      placeholder="OAuth2 Client ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Client Secret</label>
                    <input 
                      type="password"
                      value={provider.client_secret}
                      onChange={(e) => {
                        const newProviders = [...formData.credential_providers];
                        newProviders[index].client_secret = e.target.value;
                        setFormData(prev => ({ ...prev, credential_providers: newProviders }));
                      }}
                      className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                      placeholder="OAuth2 Client Secret"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button"
              onClick={addProvider}
              className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
            >
              ➕ Add Provider
            </button>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Create Identity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeployAgentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const DeployAgentModal: React.FC<DeployAgentModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    framework: 'bedrock-agentcore',
    config: {
      model: 'claude-3-sonnet',
      region: 'us-east-1'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error deploying agent:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Deploy New Agent</h2>
        <p className="text-gray-400 mb-6">Deploy a new agent to AWS Bedrock AgentCore Runtime</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="Enter agent name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Framework</label>
            <select 
              value={formData.framework}
              onChange={(e) => setFormData(prev => ({ ...prev, framework: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="bedrock-agentcore">AWS Bedrock AgentCore</option>
              <option value="strands">Strands</option>
              <option value="generic">Generic</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
              <select 
                value={formData.config.model}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, model: e.target.value }
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
                <option value="titan-text">Amazon Titan Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
              <select 
                value={formData.config.region}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, region: e.target.value }
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="us-east-1">us-east-1</option>
                <option value="us-west-2">us-west-2</option>
                <option value="eu-west-1">eu-west-1</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Deploy Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
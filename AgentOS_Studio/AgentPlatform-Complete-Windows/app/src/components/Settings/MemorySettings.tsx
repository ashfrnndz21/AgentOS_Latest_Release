
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useMem0Service, Mem0Service } from '@/utils/mem0Service';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const MemorySettings = () => {
  // Memory settings
  const [memoryEnabled, setMemoryEnabled] = useState(localStorage.getItem('memory-enabled') === 'true');
  const [memoryType, setMemoryType] = useState(localStorage.getItem('memory-type') || 'conversation');
  const [bufferSize, setBufferSize] = useState(localStorage.getItem('memory-buffer-size') || "10");
  const [summaryFrequency, setSummaryFrequency] = useState(localStorage.getItem('memory-summary-frequency') || "5");
  const [agentId, setAgentId] = useState(localStorage.getItem('memory-agent-id') || "default-agent");
  
  // Added state for storing agent memories list
  const [agentMemories, setAgentMemories] = useState<Array<{
    agent_id: string;
    memory_type: string;
    message_count: number;
    updated_at: string;
  }>>([]);
  
  const [connectionStatus, setConnectionStatus] = useState({
    memory: "Not Connected",
  });
  
  const { getMem0Service } = useMem0Service();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isConnectedToDatabase, setIsConnectedToDatabase] = useState(false);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  const supabaseConnection = useSupabaseConnection('memory', 'memory' as any);
  
  // Check if the agent_memory table exists
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoadingMemories(true);
        const { data, error } = await supabase.rpc('check_table_exists', { 
          table_name: 'agent_memory' 
        });
        
        setIsConnectedToDatabase(data === true);
        
        if (data === true) {
          loadAgentMemories();
        }
      } catch (error) {
        console.error('Error checking connection to agent_memory table:', error);
        setIsConnectedToDatabase(false);
      } finally {
        setIsLoadingMemories(false);
      }
    };
    
    if (memoryEnabled) {
      checkConnection();
    }
  }, [memoryEnabled]);
  
  // Load agent memories from database using the RPC function
  const loadAgentMemories = async () => {
    try {
      setIsLoadingMemories(true);
      const memories = await Mem0Service.listAgentMemories();
      setAgentMemories(memories);
    } catch (error) {
      console.error('Error loading agent memories:', error);
    } finally {
      setIsLoadingMemories(false);
    }
  };
  
  // Test connection
  const testConnection = async () => {
    try {
      setIsTestingConnection(true);
      toast.loading("Testing connection to memory service...");
      
      if (!memoryEnabled) {
        toast.error("Memory service is not enabled");
        setConnectionStatus({ memory: "Not Connected" });
        return;
      }
      
      // Try to initialize Mem0 service
      const mem0Service = await getMem0Service(agentId, {
        memoryType: memoryType as any,
        bufferSize: parseInt(bufferSize),
        summaryFrequency: parseInt(summaryFrequency)
      });
      
      if (mem0Service) {
        // Test adding a message
        await mem0Service.addUserMessage("This is a test message");
        await mem0Service.addAssistantMessage("This is a test response");
        
        // Get chat history
        const history = await mem0Service.getChatHistory();
        console.log('Memory test - chat history:', history);
        
        // Clear test messages
        await mem0Service.clearMemory();
        
        setConnectionStatus({ memory: "Connected" });
        toast.success("Successfully connected to memory service");
        
        // Refresh agent memories list
        loadAgentMemories();
      } else {
        setConnectionStatus({ memory: "Not Connected" });
        toast.error("Failed to connect to memory service");
      }
    } catch (error: any) {
      console.error('Error testing memory connection:', error);
      setConnectionStatus({ memory: "Not Connected" });
      toast.error(`Failed to connect to memory service: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
      toast.dismiss();
    }
  };
  
  // Enable/disable memory service
  const handleMemoryToggle = (enabled: boolean) => {
    setMemoryEnabled(enabled);
    if (enabled) {
      toast.info("Memory service enabled. Don't forget to save your settings!");
    } else {
      toast.info("Memory service disabled");
      setConnectionStatus({ memory: "Not Connected" });
    }
  };
  
  // Save settings
  const saveSettings = () => {
    // Save memory settings to localStorage
    localStorage.setItem('memory-enabled', String(memoryEnabled));
    localStorage.setItem('memory-type', memoryType);
    localStorage.setItem('memory-buffer-size', bufferSize);
    localStorage.setItem('memory-summary-frequency', summaryFrequency);
    localStorage.setItem('memory-agent-id', agentId);
    
    toast.success('Memory settings saved successfully');
    
    // Check database connection after saving
    if (memoryEnabled) {
      testConnection();
    }
  };

  return (
    <Card className="bg-beam-dark-accent/30 border-gray-700/50">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Memory Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-500">
                    <path d="M17.5 12h.5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h.5"></path>
                    <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
                    <rect x="8" y="6" width="8" height="6" rx="1"></rect>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Memory Service</h3>
                  <p className="text-sm text-gray-400">Configure agent memory for better conversational context</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  <Label htmlFor="memory-enable" className="text-white text-sm mr-2">Enable</Label>
                  <Switch 
                    id="memory-enable" 
                    checked={memoryEnabled}
                    onCheckedChange={handleMemoryToggle}
                  />
                </div>
                <span className={`text-sm ${connectionStatus.memory === "Connected" ? "text-green-500" : "text-amber-500"}`}>
                  {connectionStatus.memory}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-3"
                  onClick={testConnection}
                  disabled={isTestingConnection || !memoryEnabled}
                >
                  {isTestingConnection ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : "Test"}
                </Button>
              </div>
            </div>
            
            {memoryEnabled && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="agent-id" className="text-white">Agent ID</Label>
                  <Input 
                    id="agent-id"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="bg-beam-dark border-gray-700 text-white"
                    placeholder="Enter a unique agent identifier"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="memory-type" className="text-white">Memory Type</Label>
                  <Select 
                    value={memoryType} 
                    onValueChange={setMemoryType}
                  >
                    <SelectTrigger id="memory-type" className="bg-beam-dark border-gray-700 text-white">
                      <SelectValue placeholder="Select memory type" />
                    </SelectTrigger>
                    <SelectContent className="bg-beam-dark border-gray-700 text-white">
                      <SelectItem value="conversation">Conversation Memory</SelectItem>
                      <SelectItem value="fact">Fact Memory</SelectItem>
                      <SelectItem value="entity">Entity Memory</SelectItem>
                      <SelectItem value="summary">Summary Memory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="buffer-size" className="text-white">Buffer Size</Label>
                  <Input 
                    id="buffer-size"
                    type="number"
                    value={bufferSize}
                    onChange={(e) => setBufferSize(e.target.value)}
                    className="bg-beam-dark border-gray-700 text-white"
                    min="1"
                    max="100"
                  />
                  <p className="text-xs text-gray-400">Number of messages to keep in memory buffer</p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="summary-frequency" className="text-white">Summary Frequency</Label>
                  <Input 
                    id="summary-frequency"
                    type="number"
                    value={summaryFrequency}
                    onChange={(e) => setSummaryFrequency(e.target.value)}
                    className="bg-beam-dark border-gray-700 text-white"
                    min="1"
                    max="50"
                  />
                  <p className="text-xs text-gray-400">How often to generate conversation summaries</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Agent Memories Section */}
          {isConnectedToDatabase && agentMemories.length > 0 && (
            <div className="mt-6 border border-gray-700 rounded-md">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-md font-medium text-white">Existing Agent Memories</h3>
                <p className="text-sm text-gray-400">Agent memory data stored in the database</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                    <tr>
                      <th scope="col" className="px-4 py-3">Agent ID</th>
                      <th scope="col" className="px-4 py-3">Memory Type</th>
                      <th scope="col" className="px-4 py-3">Messages</th>
                      <th scope="col" className="px-4 py-3">Last Updated</th>
                      <th scope="col" className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentMemories.map((memory) => (
                      <tr key={memory.agent_id} className="border-b border-gray-700 hover:bg-gray-700/30">
                        <td className="px-4 py-3">{memory.agent_id}</td>
                        <td className="px-4 py-3">{memory.memory_type}</td>
                        <td className="px-4 py-3">{memory.message_count}</td>
                        <td className="px-4 py-3">
                          {new Date(memory.updated_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => {
                              const mem0Service = new Mem0Service({
                                agentId: memory.agent_id,
                                memoryType: memory.memory_type as any
                              });
                              mem0Service.initialize().then(() => {
                                mem0Service.clearMemory().then(() => {
                                  toast.success(`Cleared memory for agent ${memory.agent_id}`);
                                  loadAgentMemories();
                                });
                              });
                            }}
                          >
                            Clear
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {isLoadingMemories && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveSettings}
              disabled={!memoryEnabled}
            >
              Save Memory Settings
            </Button>
          </div>
          
          {isConnectedToDatabase && (
            <div className="mt-4 p-4 border border-green-500/30 bg-green-500/10 rounded-md">
              <p className="text-green-300 text-sm">
                Database connection successful! Agent memory is being persisted to the database.
              </p>
            </div>
          )}
          
          {!isConnectedToDatabase && memoryEnabled && (
            <div className="mt-4 p-4 border border-amber-500/30 bg-amber-500/10 rounded-md">
              <p className="text-amber-300 text-sm">
                Using in-memory storage for agent memories. Connect to a database for persistent storage.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

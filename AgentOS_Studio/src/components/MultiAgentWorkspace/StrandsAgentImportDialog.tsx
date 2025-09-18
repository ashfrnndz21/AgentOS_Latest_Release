/**
 * Safe Agent Import Dialog for Strands Intelligence Workspace
 * Allows users to browse and import Ollama agents as independent Strands agents
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Bot, 
  Shield, 
  Settings, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react';

import { 
  strandsAgentImportService, 
  ImportableAgent, 
  StrandsNativeAgent 
} from '@/lib/services/StrandsAgentImportService';

interface StrandsAgentImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentImported: (agent: StrandsNativeAgent) => void;
}

export const StrandsAgentImportDialog: React.FC<StrandsAgentImportDialogProps> = ({
  isOpen,
  onClose,
  onAgentImported
}) => {
  const [importableAgents, setImportableAgents] = useState<ImportableAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<ImportableAgent | null>(null);
  const [importing, setImporting] = useState(false);
  
  // Customization form
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [customTemperature, setCustomTemperature] = useState(0.7);
  const [customMaxTokens, setCustomMaxTokens] = useState(1000);

  // Load importable agents
  const loadImportableAgents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const agents = await strandsAgentImportService.getImportableAgents();
      setImportableAgents(agents);
      
      if (agents.length === 0) {
        setError('No Ollama agents found. Create agents in Ollama Agent Management first.');
      }
    } catch (err) {
      setError('Failed to load Ollama agents. Make sure the Ollama service is running.');
      setImportableAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load agents when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadImportableAgents();
    }
  }, [isOpen]);

  // Update form when agent is selected
  useEffect(() => {
    if (selectedAgent) {
      setCustomName(`${selectedAgent.name} (Strands)`);
      setCustomRole(selectedAgent.role || 'Assistant');
      setCustomDescription(selectedAgent.description || 'Imported from Ollama');
      setCustomSystemPrompt(selectedAgent.systemPrompt || '');
      setCustomTemperature(selectedAgent.temperature || 0.7);
      setCustomMaxTokens(selectedAgent.maxTokens || 1000);
    }
  }, [selectedAgent]);

  // Import agent
  const handleImport = async () => {
    if (!selectedAgent) return;
    
    setImporting(true);
    
    try {
      const strandsAgent = await strandsAgentImportService.importAgent(selectedAgent, {
        name: customName,
        role: customRole,
        description: customDescription,
        systemPrompt: customSystemPrompt,
        temperature: customTemperature,
        maxTokens: customMaxTokens
      });
      
      onAgentImported(strandsAgent);
      onClose();
      
      // Reset form
      setSelectedAgent(null);
      setCustomName('');
      setCustomRole('');
      setCustomDescription('');
      setCustomSystemPrompt('');
      setCustomTemperature(0.7);
      setCustomMaxTokens(1000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import agent');
    } finally {
      setImporting(false);
    }
  };

  const getAgentIcon = (agent: ImportableAgent) => {
    if (agent.capabilities.includes('Research')) return '🔍';
    if (agent.capabilities.includes('Writing')) return '✍️';
    if (agent.capabilities.includes('Coding')) return '💻';
    if (agent.capabilities.includes('Chat')) return '💬';
    if (agent.capabilities.includes('Math')) return '🧮';
    return '🤖';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700 text-white overflow-hidden">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Download className="h-6 w-6 text-blue-400" />
            Import Ollama Agents to Strands
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-2">
            Browse and import your Ollama agents as independent Strands agents. 
            Imported agents can be fully customized and operate independently.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="browse" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-4">
              <TabsTrigger value="browse" className="data-[state=active]:bg-gray-700">
                <Bot className="h-4 w-4 mr-2" />
                Browse Agents
              </TabsTrigger>
              <TabsTrigger value="customize" className="data-[state=active]:bg-gray-700" disabled={!selectedAgent}>
                <Settings className="h-4 w-4 mr-2" />
                Customize & Import
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="browse" className="mt-0 h-full">
                <div className="space-y-4">
                  {/* Header with refresh */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">Available Ollama Agents</h3>
                      <Badge variant="outline" className="text-xs">
                        {importableAgents.length} found
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadImportableAgents}
                      disabled={loading}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>

                  {/* Loading state */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading Ollama agents...</p>
                    </div>
                  )}

                  {/* Error state */}
                  {error && (
                    <Card className="bg-red-900/20 border-red-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">Error</span>
                        </div>
                        <p className="text-red-300 text-sm mt-1">{error}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Agents grid */}
                  {!loading && !error && importableAgents.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {importableAgents.map((agent) => (
                        <Card 
                          key={agent.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedAgent?.id === agent.id
                              ? 'bg-blue-900/30 border-blue-500/50'
                              : 'bg-gray-800/40 border-gray-600/30 hover:border-blue-400/50 hover:bg-gray-800/60'
                          }`}
                          onClick={() => setSelectedAgent(agent)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{getAgentIcon(agent)}</div>
                                <div>
                                  <CardTitle className="text-white text-base">{agent.name}</CardTitle>
                                  <p className="text-gray-400 text-sm">{agent.role}</p>
                                </div>
                              </div>
                              {selectedAgent?.id === agent.id && (
                                <CheckCircle className="h-5 w-5 text-blue-400" />
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                              {agent.description}
                            </p>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Model:</span>
                                <Badge variant="outline" className="text-xs">
                                  {agent.model}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {agent.capabilities.map((cap) => (
                                  <Badge key={cap} variant="secondary" className="text-xs">
                                    {cap}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  {agent.hasGuardrails && (
                                    <div className="flex items-center gap-1 text-green-400">
                                      <Shield className="h-3 w-3" />
                                      <span>Protected</span>
                                    </div>
                                  )}
                                  {agent.isConfigured && (
                                    <div className="flex items-center gap-1 text-blue-400">
                                      <Zap className="h-3 w-3" />
                                      <span>Configured</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-gray-500">
                                  {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Unknown'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {!loading && !error && importableAgents.length === 0 && (
                    <div className="text-center py-12">
                      <Bot className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">No Ollama Agents Found</h3>
                      <p className="text-gray-400 mb-4">
                        Create agents in Ollama Agent Management first, then return here to import them.
                      </p>
                      <Button
                        variant="outline"
                        onClick={loadImportableAgents}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Check Again
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="customize" className="mt-0 h-full">
                {selectedAgent && (
                  <div className="space-y-6">
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-400 mb-2">
                        <Info className="h-5 w-5" />
                        <span className="font-medium">Import Configuration</span>
                      </div>
                      <p className="text-blue-300 text-sm">
                        Customize how "{selectedAgent.name}" will be imported as a Strands agent. 
                        The imported agent will be completely independent and can be modified later.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="customName" className="text-gray-300">Agent Name</Label>
                          <Input
                            id="customName"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="Enter agent name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="customRole" className="text-gray-300">Role</Label>
                          <Input
                            id="customRole"
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="Enter agent role"
                          />
                        </div>

                        <div>
                          <Label htmlFor="customDescription" className="text-gray-300">Description</Label>
                          <Textarea
                            id="customDescription"
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="Enter agent description"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="customSystemPrompt" className="text-gray-300">System Prompt</Label>
                          <Textarea
                            id="customSystemPrompt"
                            value={customSystemPrompt}
                            onChange={(e) => setCustomSystemPrompt(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                            placeholder="Enter system prompt"
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="customTemperature" className="text-gray-300">Temperature</Label>
                            <Input
                              id="customTemperature"
                              type="number"
                              min="0"
                              max="2"
                              step="0.1"
                              value={customTemperature}
                              onChange={(e) => setCustomTemperature(parseFloat(e.target.value))}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>

                          <div>
                            <Label htmlFor="customMaxTokens" className="text-gray-300">Max Tokens</Label>
                            <Input
                              id="customMaxTokens"
                              type="number"
                              min="100"
                              max="4000"
                              step="100"
                              value={customMaxTokens}
                              onChange={(e) => setCustomMaxTokens(parseInt(e.target.value))}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Original Agent Info</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                        <div>Model: {selectedAgent.model}</div>
                        <div>Source: Ollama Agent Management</div>
                        <div>Capabilities: {selectedAgent.capabilities.join(', ')}</div>
                        <div>Guardrails: {selectedAgent.hasGuardrails ? 'Enabled' : 'Disabled'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {selectedAgent ? `Selected: ${selectedAgent.name}` : 'Select an agent to import'}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedAgent || importing || !customName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Import Agent
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
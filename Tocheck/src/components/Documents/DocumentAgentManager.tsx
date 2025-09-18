import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Trash2, 
  Bot, 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  Loader2,
  Edit,
  Eye,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string;
  personality: string;
  model: string;
  description: string;
  document_ready: boolean;
  predefined?: boolean;
  source: 'user_created' | 'predefined';
  created_at?: string;
}

interface DocumentAgentManagerProps {
  agents: Agent[];
  onAgentDeleted: () => void;
  selectedAgent?: Agent | null;
}

export const DocumentAgentManager: React.FC<DocumentAgentManagerProps> = ({
  agents,
  onAgentDeleted,
  selectedAgent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deletingAgent, setDeletingAgent] = useState<string | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const userCreatedAgents = agents.filter(agent => agent.source === 'user_created');
  const predefinedAgents = agents.filter(agent => agent.source === 'predefined');

  const handleDeleteAgent = async (agent: Agent) => {
    setDeletingAgent(agent.id);
    
    try {
      const response = await fetch(`http://localhost:5002/api/document-agents/${agent.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Agent deleted successfully:', agent.name);
        onAgentDeleted();
        setShowDeleteConfirm(false);
        setAgentToDelete(null);
        
        // Show success message
        alert(`✅ Agent "${agent.name}" deleted successfully!`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('❌ Failed to delete agent:', error);
      alert(`❌ Failed to delete agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingAgent(null);
    }
  };

  const confirmDelete = (agent: Agent) => {
    setAgentToDelete(agent);
    setShowDeleteConfirm(true);
  };

  const AgentCard: React.FC<{ agent: Agent; isSelected?: boolean }> = ({ agent, isSelected }) => (
    <Card className={`transition-colors ${
      isSelected 
        ? 'border-purple-500 bg-purple-500/10' 
        : 'border-gray-700 hover:border-gray-600'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              {agent.source === 'user_created' ? (
                <Brain size={16} className="text-white" />
              ) : (
                <Sparkles size={16} className="text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-white">{agent.name}</h4>
                {isSelected && (
                  <Badge variant="secondary" className="text-xs">
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-purple-400">{agent.role}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{agent.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {agent.model}
                </Badge>
                <Badge variant={agent.source === 'user_created' ? 'default' : 'secondary'} className="text-xs">
                  {agent.source === 'user_created' ? 'Custom' : 'Predefined'}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye size={16} className="mr-2" />
                View Details
              </DropdownMenuItem>
              {agent.source === 'user_created' && (
                <DropdownMenuItem>
                  <Edit size={16} className="mr-2" />
                  Edit Agent
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-400 focus:text-red-400"
                onClick={() => confirmDelete(agent)}
                disabled={deletingAgent === agent.id}
              >
                {deletingAgent === agent.id ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Delete Agent
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings size={16} />
            Manage Agents
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Bot className="text-purple-400" />
              Document Agent Manager
            </DialogTitle>
            <DialogDescription>
              View, edit, and delete your document agents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{agents.length}</div>
                  <div className="text-sm text-gray-400">Total Agents</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{userCreatedAgents.length}</div>
                  <div className="text-sm text-gray-400">Custom Agents</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{predefinedAgents.length}</div>
                  <div className="text-sm text-gray-400">Predefined Agents</div>
                </CardContent>
              </Card>
            </div>

            {/* Custom Agents */}
            {userCreatedAgents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Custom Agents</h3>
                  <Badge variant="outline">{userCreatedAgents.length} agents</Badge>
                </div>
                <div className="grid gap-3">
                  {userCreatedAgents.map(agent => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent} 
                      isSelected={selectedAgent?.id === agent.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Predefined Agents */}
            {predefinedAgents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Predefined Agents</h3>
                  <Badge variant="outline">{predefinedAgents.length} agents</Badge>
                </div>
                <div className="grid gap-3">
                  {predefinedAgents.map(agent => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent} 
                      isSelected={selectedAgent?.id === agent.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Agents */}
            {agents.length === 0 && (
              <div className="text-center py-12">
                <Bot size={64} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Agents Available</h3>
                <p className="text-gray-500 mb-4">Create your first document agent to get started</p>
                <Button onClick={() => setIsOpen(false)} className="bg-purple-600 hover:bg-purple-700">
                  Create Agent
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={20} />
              Delete Agent
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {agentToDelete && (
            <div className="space-y-4">
              <Alert className="border-red-500 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription>
                  You are about to permanently delete the {agentToDelete.source === 'predefined' ? 'predefined' : 'custom'} agent "{agentToDelete.name}".
                  {agentToDelete.source === 'predefined' && (
                    <span className="block mt-2 font-medium">
                      ⚠️ Warning: This is a predefined agent. Deleting it will remove it from all users.
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Brain size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{agentToDelete.name}</h4>
                      <p className="text-sm text-purple-400">{agentToDelete.role}</p>
                      <p className="text-xs text-gray-400 mt-1">{agentToDelete.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {agentToDelete.model}
                        </Badge>
                        <Badge variant={agentToDelete.source === 'user_created' ? 'default' : 'secondary'} className="text-xs">
                          {agentToDelete.source === 'user_created' ? 'Custom Agent' : 'Predefined Agent'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirm(false);
                setAgentToDelete(null);
              }}
              disabled={deletingAgent !== null}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => agentToDelete && handleDeleteAgent(agentToDelete)}
              disabled={deletingAgent !== null}
            >
              {deletingAgent ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Delete Agent
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
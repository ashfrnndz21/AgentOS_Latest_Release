import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Cpu, 
  Settings, 
  Shield, 
  Brain, 
  Database,
  Clock,
  Thermometer,
  Hash,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye
} from 'lucide-react';
import { OllamaAgentConfig } from '@/lib/services/OllamaAgentService';

interface AgentConfigDialogProps {
  agent: OllamaAgentConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgentConfigDialog: React.FC<AgentConfigDialogProps> = ({
  agent,
  open,
  onOpenChange
}) => {
  if (!agent) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const renderCapabilities = () => {
    if (!agent.capabilities) return null;
    
    return (
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(agent.capabilities).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-2 bg-gray-800 rounded">
            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            {typeof value === 'boolean' ? (
              value ? (
                <CheckCircle className="text-green-400" size={16} />
              ) : (
                <XCircle className="text-red-400" size={16} />
              )
            ) : (
              <Badge variant="secondary">{String(value)}</Badge>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderGuardrails = () => {
    if (!agent.guardrails) return <p className="text-gray-400 text-sm">No guardrails configured</p>;
    
    return (
      <div className="space-y-4">
        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-2 bg-gray-900 rounded text-xs">
            <p className="text-gray-500 mb-1">Debug Info:</p>
            <p className="text-gray-500">Guardrails keys: {Object.keys(agent.guardrails || {}).join(', ')}</p>
            <p className="text-gray-500">Enhanced at top level: {(agent as any).enhancedGuardrails ? 'Yes' : 'No'}</p>
            <p className="text-gray-500">Enhanced in guardrails: {(agent.guardrails as any)?.enhancedGuardrails ? 'Yes' : 'No'}</p>
            <p className="text-gray-500">Enhanced as property: {agent.enhancedGuardrails ? 'Yes' : 'No'}</p>
          </div>
        )}
        
        {/* Basic Guardrails */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
            <span className="font-medium">Enabled</span>
            {agent.guardrails.enabled ? (
              <CheckCircle className="text-green-400" size={16} />
            ) : (
              <XCircle className="text-red-400" size={16} />
            )}
          </div>
          
          {agent.guardrails.safetyLevel && (
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <span className="font-medium">Safety Level</span>
              <Badge 
                variant={
                  agent.guardrails.safetyLevel === 'high' ? 'destructive' :
                  agent.guardrails.safetyLevel === 'medium' ? 'default' : 'secondary'
                }
              >
                {agent.guardrails.safetyLevel}
              </Badge>
            </div>
          )}

          {agent.guardrails.contentFilters && agent.guardrails.contentFilters.length > 0 && (
            <div className="p-3 bg-gray-800 rounded">
              <p className="font-medium mb-2">Content Filters</p>
              <div className="flex flex-wrap gap-2">
                {agent.guardrails.contentFilters.map((filter, index) => (
                  <Badge key={index} variant="outline">{filter}</Badge>
                ))}
              </div>
            </div>
          )}

          {agent.guardrails.rules && agent.guardrails.rules.length > 0 && (
            <div className="p-3 bg-gray-800 rounded">
              <p className="font-medium mb-2">Custom Rules</p>
              <div className="space-y-2">
                {agent.guardrails.rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded text-sm">
                    <AlertTriangle className="text-yellow-400" size={14} />
                    <span>{typeof rule === 'string' ? rule : rule.name || rule.description || 'Custom Rule'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Guardrails */}
        {(agent.enhancedGuardrails || (agent as any).enhancedGuardrails || (agent.guardrails as any)?.enhancedGuardrails) && (
          <div className="space-y-3">
            <h4 className="font-medium text-purple-400">Enhanced Guardrails</h4>
            {renderEnhancedGuardrails(agent.enhancedGuardrails || (agent as any).enhancedGuardrails || (agent.guardrails as any).enhancedGuardrails)}
          </div>
        )}
      </div>
    );
  };

  const renderEnhancedGuardrails = (enhanced: any) => {
    return (
      <div className="space-y-4">
        {/* Global and Local Guardrails */}
        {(enhanced.global || enhanced.local) && (
          <div className="p-3 bg-gray-800 rounded">
            <p className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              Guardrails Scope
            </p>
            <div className="flex gap-2">
              {enhanced.global && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Global Guardrails
                </Badge>
              )}
              {enhanced.local && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Local Guardrails
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Content Filter */}
        {enhanced.contentFilter?.enabled && (
          <div className="p-3 bg-gray-800 rounded">
            <p className="font-medium mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-red-400" />
              Content Filter
            </p>
            
            {/* Filter Level */}
            {enhanced.contentFilter.level && (
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-1">Filter Level:</p>
                <Badge variant={
                  enhanced.contentFilter.level === 'strict' ? 'destructive' :
                  enhanced.contentFilter.level === 'moderate' ? 'default' : 'secondary'
                } className="text-xs">
                  {enhanced.contentFilter.level === 'basic' ? 'Basic - Minimal filtering' :
                   enhanced.contentFilter.level === 'moderate' ? 'Moderate - Balanced filtering' :
                   enhanced.contentFilter.level === 'strict' ? 'Strict - Conservative filtering' :
                   enhanced.contentFilter.level}
                </Badge>
              </div>
            )}

            {/* Blocked Keywords */}
            {enhanced.contentFilter.customKeywords?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">Blocked Keywords ({enhanced.contentFilter.customKeywords.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {enhanced.contentFilter.customKeywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="destructive" className="text-xs">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Blocked Phrases */}
            {enhanced.contentFilter.blockedPhrases?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">Blocked Phrases ({enhanced.contentFilter.blockedPhrases.length}):</p>
                <div className="space-y-1">
                  {enhanced.contentFilter.blockedPhrases.map((phrase: string, index: number) => (
                    <div key={index} className="p-2 bg-gray-700 rounded text-xs">
                      <span className="text-red-300">"{phrase}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allowed Domains */}
            {enhanced.contentFilter.allowedDomains?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">Allowed Domains ({enhanced.contentFilter.allowedDomains.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {enhanced.contentFilter.allowedDomains.map((domain: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs text-green-400 border-green-400">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PII Redaction */}
        {enhanced.piiRedaction?.enabled && (
          <div className="p-3 bg-gray-800 rounded">
            <p className="font-medium mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-yellow-400" />
              PII Redaction
            </p>
            
            {/* Strategy */}
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-1">Strategy:</p>
              <Badge variant="outline" className="text-xs">
                {enhanced.piiRedaction.strategy === 'mask' ? 'Mask with characters' :
                 enhanced.piiRedaction.strategy === 'remove' ? 'Remove completely' :
                 enhanced.piiRedaction.strategy === 'placeholder' ? 'Replace with placeholder' :
                 enhanced.piiRedaction.strategy}
              </Badge>
            </div>

            {/* Custom Types */}
            {enhanced.piiRedaction.customTypes?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">Custom PII Types ({enhanced.piiRedaction.customTypes.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {enhanced.piiRedaction.customTypes.map((type: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Patterns */}
            {enhanced.piiRedaction.customPatterns?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">Custom Patterns ({enhanced.piiRedaction.customPatterns.length}):</p>
                <div className="space-y-1">
                  {enhanced.piiRedaction.customPatterns.map((pattern: string, index: number) => (
                    <div key={index} className="p-2 bg-gray-700 rounded">
                      <code className="text-xs text-yellow-300">{pattern}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mask Character and Placeholder */}
            <div className="grid grid-cols-2 gap-3">
              {enhanced.piiRedaction.maskCharacter && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Mask Character:</p>
                  <Badge variant="outline" className="text-xs font-mono">
                    "{enhanced.piiRedaction.maskCharacter}"
                  </Badge>
                </div>
              )}
              {enhanced.piiRedaction.placeholderText && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Placeholder Text:</p>
                  <Badge variant="outline" className="text-xs">
                    {enhanced.piiRedaction.placeholderText}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Behavior Limits */}
        {enhanced.behaviorLimits?.enabled && (
          <div className="p-3 bg-gray-800 rounded">
            <p className="font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-400" />
              Behavior Limits
            </p>
            
            {/* Response Length */}
            {enhanced.behaviorLimits.maxResponseLength && (
              <div className="mb-2">
                <p className="text-sm text-gray-400">Max Response Length:</p>
                <Badge variant="outline" className="text-xs">
                  {enhanced.behaviorLimits.maxResponseLength} characters
                </Badge>
              </div>
            )}

            {/* Custom Limits */}
            {enhanced.behaviorLimits.customLimits?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-2">Custom Limits ({enhanced.behaviorLimits.customLimits.length}):</p>
                <div className="space-y-2">
                  {enhanced.behaviorLimits.customLimits.map((limit: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-700 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{limit.name}</span>
                        <Badge variant={limit.enabled ? "default" : "secondary"} className="text-xs">
                          {limit.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      {limit.description && (
                        <p className="text-xs text-gray-400">{limit.description}</p>
                      )}
                      {limit.value && (
                        <p className="text-xs text-purple-300 mt-1">Value: {limit.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Rules */}
        {enhanced.customRules?.length > 0 && (
          <div className="p-3 bg-gray-800 rounded">
            <p className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              Custom Rules ({enhanced.customRules.length})
            </p>
            <div className="space-y-2">
              {enhanced.customRules.map((rule: any, index: number) => (
                <div key={index} className="p-3 bg-gray-700 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{rule.name}</span>
                    <div className="flex gap-2">
                      <Badge variant={rule.enabled ? "default" : "secondary"} className="text-xs">
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      {rule.action && (
                        <Badge variant="outline" className="text-xs">
                          {rule.action}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {rule.description && (
                    <p className="text-xs text-gray-400 mb-2">{rule.description}</p>
                  )}
                  {rule.pattern && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Pattern:</p>
                      <code className="text-xs text-orange-300 bg-gray-800 p-1 rounded">{rule.pattern}</code>
                    </div>
                  )}
                  {rule.replacement && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Replacement:</p>
                      <span className="text-xs text-green-300">"{rule.replacement}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRAGConfig = () => {
    if (!agent.ragConfig) return <p className="text-gray-400 text-sm">No RAG configuration</p>;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded">
          <span className="font-medium">RAG Enabled</span>
          {agent.ragConfig.enabled ? (
            <CheckCircle className="text-green-400" size={16} />
          ) : (
            <XCircle className="text-red-400" size={16} />
          )}
        </div>

        {agent.ragConfig.enabled && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800 rounded">
                <p className="text-sm text-gray-400">Max Chunks</p>
                <p className="font-medium">{agent.ragConfig.maxChunks || 'Not set'}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded">
                <p className="text-sm text-gray-400">Similarity Threshold</p>
                <p className="font-medium">{agent.ragConfig.similarityThreshold || 'Not set'}</p>
              </div>
            </div>

            {agent.ragConfig.documentIds && agent.ragConfig.documentIds.length > 0 && (
              <div className="p-3 bg-gray-800 rounded">
                <p className="font-medium mb-2">Connected Documents</p>
                <div className="space-y-1">
                  {agent.ragConfig.documentIds.map((docId, index) => (
                    <div key={index} className="text-sm text-gray-300 font-mono">{docId}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderBehaviorConfig = () => {
    if (!agent.behavior) return <p className="text-gray-400 text-sm">No behavior configuration</p>;
    
    return (
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(agent.behavior).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-gray-800 rounded">
            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <Badge variant="secondary">{String(value)}</Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="text-purple-400" size={20} />
            Agent Configuration: {agent.name}
          </DialogTitle>
          <DialogDescription>
            Complete configuration details for this agent
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="text-purple-400" size={18} />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Agent ID</p>
                      <p className="font-mono text-sm">{agent.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <Badge variant="default">{agent.status || 'Active'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Role</p>
                      <p className="text-sm">{agent.role || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Created</p>
                      <p className="text-sm">{agent.createdAt ? formatDate(agent.createdAt) : 'Unknown'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Description</p>
                    <p className="text-sm">{agent.description || 'No description provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Personality</p>
                    <p className="text-sm">{agent.personality || 'No personality defined'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Expertise</p>
                    <p className="text-sm">{agent.expertise || 'No expertise specified'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">System Prompt</p>
                    <div className="p-3 bg-gray-700 rounded text-sm font-mono">
                      {agent.systemPrompt || 'No system prompt configured'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="model" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="text-blue-400" size={18} />
                    Model Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Model</p>
                      <p className="font-medium">{agent.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Provider</p>
                      <Badge variant="secondary">Ollama</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="text-orange-400" size={16} />
                      <div>
                        <p className="text-sm text-gray-400">Temperature</p>
                        <p className="font-medium">{agent.temperature}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="text-green-400" size={16} />
                      <div>
                        <p className="text-sm text-gray-400">Max Tokens</p>
                        <p className="font-medium">{agent.maxTokens}</p>
                      </div>
                    </div>
                  </div>

                  {agent.tools && agent.tools.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Available Tools</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.tools.map((tool, index) => (
                          <Badge key={index} variant="outline">{tool}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capabilities" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="text-green-400" size={18} />
                    Agent Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderCapabilities()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guardrails" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="text-red-400" size={18} />
                    Safety Guardrails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderGuardrails()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="text-yellow-400" size={18} />
                      RAG Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderRAGConfig()}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="text-purple-400" size={18} />
                      Behavior Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderBehaviorConfig()}
                  </CardContent>
                </Card>

                {agent.memory && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="text-indigo-400" size={18} />
                        Memory Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(agent.memory).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            {typeof value === 'boolean' ? (
                              value ? (
                                <CheckCircle className="text-green-400" size={16} />
                              ) : (
                                <XCircle className="text-red-400" size={16} />
                              )
                            ) : (
                              <Badge variant="secondary">{String(value)}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  Brain, 
  Wrench, 
  Shield,
  Database,
  Loader2
} from 'lucide-react';
import { AgentConfig } from '../AgentCreationWizard';

interface AgentValidationProps {
  config: AgentConfig;
  apiStatus?: {
    openai: boolean;
    anthropic: boolean;
    bedrock: boolean;
  };
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const AgentValidation: React.FC<AgentValidationProps> = ({
  config,
  apiStatus,
  onSubmit,
  isSubmitting
}) => {
  const getValidationStatus = () => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check API key availability
    if (config.framework === 'generic') {
      if (!apiStatus?.openai && !apiStatus?.anthropic) {
        issues.push('No API keys available for Generic agents (requires OpenAI or Anthropic)');
      }
    } else if (config.framework === 'strands' || config.framework === 'agentcore') {
      if (!apiStatus?.bedrock) {
        issues.push(`No AWS Bedrock credentials available for ${config.framework} agents`);
      }
    }

    // Check configuration completeness
    if (!config.name?.trim()) {
      issues.push('Agent name is required');
    }
    if (!config.description?.trim()) {
      issues.push('Agent description is required');
    }
    if (!config.model?.provider || !config.model?.modelId) {
      issues.push('Model configuration is incomplete');
    }

    // Warnings
    if (config.capabilities.tools.length === 0) {
      warnings.push('No tools selected - agent will have limited capabilities');
    }
    if (!config.capabilities.memory.shortTerm && !config.capabilities.memory.longTerm) {
      warnings.push('No memory enabled - agent won\'t remember conversation context');
    }

    return { issues, warnings, canCreate: issues.length === 0 };
  };

  const { issues, warnings, canCreate } = getValidationStatus();

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'generic': return 'purple';
      case 'strands': return 'green';
      case 'agentcore': return 'blue';
      default: return 'gray';
    }
  };

  const frameworkColor = getFrameworkColor(config.framework);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Review & Create Agent</h3>
        <p className="text-sm text-gray-400">
          Review your agent configuration and resolve any issues before creation.
        </p>
      </div>

      {/* Validation Status */}
      {issues.length > 0 && (
        <Alert className="border-red-500 bg-red-500/10">
          <XCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <div className="font-medium mb-2">Configuration Issues:</div>
            <ul className="list-disc list-inside space-y-1">
              {issues.map((issue, index) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <div className="font-medium mb-2">Warnings:</div>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {canCreate && (
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Configuration is valid and ready for agent creation.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <User className="h-4 w-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-300">Name:</span>
              <p className="text-white">{config.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-300">Description:</span>
              <p className="text-gray-300 text-sm">{config.description}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-300">Framework:</span>
              <Badge className={`bg-${frameworkColor}-600 text-white ml-2`}>
                {config.framework}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Brain className="h-4 w-4" />
              Model Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-300">Provider:</span>
              <span className="text-white ml-2">{config.model.provider}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-300">Model:</span>
              <span className="text-white ml-2">{config.model.modelId}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-300">API Status:</span>
              {apiStatus?.[config.model.provider as keyof typeof apiStatus] ? (
                <Badge className="bg-green-600 text-white ml-2">Available</Badge>
              ) : (
                <Badge className="bg-red-600 text-white ml-2">Missing</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Wrench className="h-4 w-4" />
              Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-300">Tools:</span>
              <div className="mt-1">
                {config.capabilities.tools.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {config.capabilities.tools.slice(0, 3).map((tool) => (
                      <Badge key={tool} variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {tool.replace('_', ' ')}
                      </Badge>
                    ))}
                    {config.capabilities.tools.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                        +{config.capabilities.tools.length - 3} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No tools selected</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-300">Memory:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(config.capabilities.memory)
                  .filter(([_, enabled]) => enabled)
                  .map(([type, _]) => (
                    <Badge key={type} variant="outline" className="text-xs border-gray-600 text-gray-300">
                      {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Badge>
                  ))
                }
                {!Object.values(config.capabilities.memory).some(Boolean) && (
                  <span className="text-gray-400 text-sm">Basic memory only</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Shield className="h-4 w-4" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-300">Guardrails:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {config.capabilities.guardrails.global && (
                  <Badge variant="outline" className="text-xs border-green-600 text-green-300">
                    Global
                  </Badge>
                )}
                {config.capabilities.guardrails.local && (
                  <Badge variant="outline" className="text-xs border-green-600 text-green-300">
                    Local
                  </Badge>
                )}
                {!config.capabilities.guardrails.global && !config.capabilities.guardrails.local && (
                  <span className="text-gray-400 text-sm">Basic guardrails</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Database Access:</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  config.databaseAccess 
                    ? 'border-green-600 text-green-300' 
                    : 'border-gray-600 text-gray-400'
                }`}
              >
                {config.databaseAccess ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onSubmit}
          disabled={!canCreate || isSubmitting}
          className={`px-8 py-3 text-lg ${
            canCreate 
              ? `bg-${frameworkColor}-600 hover:bg-${frameworkColor}-700 text-white` 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Agent...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create {config.framework} Agent
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
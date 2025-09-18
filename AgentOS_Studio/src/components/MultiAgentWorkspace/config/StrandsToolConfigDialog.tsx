import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Key, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  ExternalLink,
  Info,
  Zap,
  Shield
} from 'lucide-react';
import { StrandsNativeTool } from '@/hooks/useStrandsNativeTools';

interface StrandsToolConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  tool: StrandsNativeTool;
  initialConfig?: any;
}

export const StrandsToolConfigDialog: React.FC<StrandsToolConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  tool,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize config with existing values or defaults
      const newConfig = { ...initialConfig };
      
      // Set default values for fields that don't have values
      tool.apiConfig?.fields.forEach(field => {
        if (!newConfig[field.key] && field.placeholder) {
          newConfig[field.key] = '';
        }
      });
      
      setConfig(newConfig);
      setErrors([]);
      validateConfig(newConfig);
    }
  }, [isOpen, initialConfig, tool]);

  const validateConfig = (configToValidate: Record<string, any>) => {
    const newErrors: string[] = [];
    
    if (tool.apiConfig) {
      tool.apiConfig.fields.forEach(field => {
        if (field.required && (!configToValidate[field.key] || configToValidate[field.key].trim() === '')) {
          newErrors.push(`${field.label} is required`);
        }
        
        if (field.type === 'number' && configToValidate[field.key] && isNaN(Number(configToValidate[field.key]))) {
          newErrors.push(`${field.label} must be a valid number`);
        }
        
        // Additional validation based on field key
        if (field.key.includes('api_key') && configToValidate[field.key] && configToValidate[field.key].length < 10) {
          newErrors.push(`${field.label} appears to be too short`);
        }
        
        if (field.key.includes('email') && configToValidate[field.key] && !configToValidate[field.key].includes('@')) {
          newErrors.push(`${field.label} must be a valid email address`);
        }
      });
    }
    
    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    const newConfig = { ...config, [fieldKey]: value };
    setConfig(newConfig);
    validateConfig(newConfig);
  };

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleSave = () => {
    if (isValid) {
      const toolConfig = {
        name: tool.name,
        toolId: tool.id,
        category: tool.category,
        apiConfig: config,
        isConfigured: true,
        configuredAt: new Date().toISOString()
      };
      
      onSave(toolConfig);
      onClose();
    }
  };

  const getDocumentationUrl = (tool: StrandsNativeTool) => {
    const urlMap: Record<string, string> = {
      'tavily_search': 'https://docs.tavily.com',
      'exa_search': 'https://docs.exa.ai',
      'mem0_memory': 'https://docs.mem0.ai',
      'slack': 'https://api.slack.com/start',
      'use_aws': 'https://docs.aws.amazon.com',
      'speak': 'https://platform.openai.com/docs/guides/text-to-speech',
      'image_generator': 'https://platform.openai.com/docs/guides/images'
    };
    return urlMap[tool.id];
  };

  const renderField = (field: any) => {
    const fieldValue = config[field.key] || '';
    const isPassword = field.type === 'password';
    const showPassword = showPasswords[field.key];

    return (
      <div key={field.key} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.key} className="text-sm font-medium text-gray-200">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </Label>
          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => togglePasswordVisibility(field.key)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          )}
        </div>
        
        {field.type === 'select' ? (
          <Select value={fieldValue} onValueChange={(value) => handleFieldChange(field.key, value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field.key}
            type={isPassword && !showPassword ? 'password' : field.type === 'number' ? 'number' : 'text'}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        )}
        
        {field.description && (
          <p className="text-xs text-gray-400 mt-1">{field.description}</p>
        )}
      </div>
    );
  };

  if (!tool.requiresApi) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${tool.color}20` }}>
              <tool.icon className="h-5 w-5" style={{ color: tool.color }} />
            </div>
            Configure {tool.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tool Information */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-400" />
                Tool Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-300">{tool.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {tool.category}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {tool.complexity}
                </Badge>
                {tool.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {getDocumentationUrl(tool) && (
                <div className="flex items-center gap-2 mt-3">
                  <ExternalLink className="h-4 w-4 text-blue-400" />
                  <a 
                    href={getDocumentationUrl(tool)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View Documentation
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Configuration */}
          {tool.apiConfig && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="h-4 w-4 text-yellow-400" />
                  {tool.apiConfig.name}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure API credentials and settings for this tool
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tool.apiConfig.fields.map(renderField)}
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Alert className="bg-blue-900/20 border-blue-700">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>Security Notice:</strong> API credentials are encrypted and stored securely. 
              They are only used for tool execution within your workflows.
            </AlertDescription>
          </Alert>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <Alert className="bg-red-900/20 border-red-700">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                <div className="space-y-1">
                  <strong>Please fix the following issues:</strong>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Indicator */}
          {isValid && Object.keys(config).length > 0 && (
            <Alert className="bg-green-900/20 border-green-700">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                Configuration is valid and ready to save.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator className="bg-gray-700" />

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Zap className="h-4 w-4" />
            <span>Tool will be available in workflows after configuration</span>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
            >
              <Settings className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
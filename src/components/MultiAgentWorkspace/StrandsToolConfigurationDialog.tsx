import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings, CheckCircle, AlertCircle, Sparkles, Code } from 'lucide-react';

interface ToolConfiguration {
  name: string;
  description: string;
  category: string;
  configurable: boolean;
  configuration: {
    [key: string]: {
      type: 'text' | 'number' | 'textarea' | 'select' | 'boolean' | 'password' | 'multiselect';
      default?: any;
      description: string;
      required?: boolean;
      min?: number;
      max?: number;
      options?: string[];
    };
  };
}

interface StrandsToolConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolName: string;
  onConfigurationSave: (toolName: string, configuration: Record<string, any>) => void;
}

export function StrandsToolConfigurationDialog({
  open,
  onOpenChange,
  toolName,
  onConfigurationSave
}: StrandsToolConfigurationDialogProps) {
  const [configuration, setConfiguration] = useState<ToolConfiguration | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && toolName) {
      loadToolConfiguration();
    }
  }, [open, toolName]);

  const loadToolConfiguration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5006/api/strands-sdk/tools/configuration/${toolName}`);
      const data = await response.json();
      
      if (data.success) {
        setConfiguration(data.configuration);
        // Initialize form data with defaults
        const initialData: Record<string, any> = {};
        Object.entries(data.configuration.configuration).forEach(([key, config]: [string, any]) => {
          initialData[key] = config.default || '';
        });
        setFormData(initialData);
      } else {
        setError(data.error || 'Failed to load tool configuration');
      }
    } catch (err) {
      setError('Failed to load tool configuration');
      console.error('Error loading tool configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onConfigurationSave(toolName, formData);
      onOpenChange(false);
    } catch (err) {
      setError('Failed to save configuration');
      console.error('Error saving configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderFormField = (key: string, config: any) => {
    const value = formData[key] || config.default || '';

    switch (config.type) {
      case 'text':
      case 'password':
        return (
          <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium text-white">
              {key.replace('_', ' ').toUpperCase()}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={key}
              type={config.type === 'password' ? 'password' : 'text'}
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              placeholder={config.description}
              required={config.required}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400">{config.description}</p>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium text-white">
              {key.replace('_', ' ').toUpperCase()}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={key}
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              placeholder={config.description}
              rows={4}
              required={config.required}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400">{config.description}</p>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium text-white">
              {key.replace('_', ' ').toUpperCase()}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={key}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(key, Number(e.target.value))}
              min={config.min}
              max={config.max}
              required={config.required}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400">{config.description}</p>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium text-white">
              {key.replace('_', ' ').toUpperCase()}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(key, val)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder={config.description} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {config.options?.map((option: string) => (
                  <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">{config.description}</p>
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={key}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(key, checked)}
            />
            <Label htmlFor={key} className="text-sm font-medium text-white">
              {key.replace('_', ' ').toUpperCase()}
            </Label>
            <p className="text-xs text-gray-400">{config.description}</p>
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">
              {key.replace('_', ' ').toUpperCase()}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {config.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${key}-${option}`}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleInputChange(key, [...currentValue, option]);
                      } else {
                        handleInputChange(key, currentValue.filter((v: string) => v !== option));
                      }
                    }}
                    className="rounded border-gray-300 bg-gray-700"
                  />
                  <Label htmlFor={`${key}-${option}`} className="text-sm text-white">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">{config.description}</p>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium text-white">
              {key.replace('_', ' ').toUpperCase()}
            </Label>
            <Input
              id={key}
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              placeholder={config.description}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400">{config.description}</p>
          </div>
        );
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader className="bg-gray-800 border-b border-gray-700 p-6 -m-6 mb-6">
          <DialogTitle className="flex items-center gap-3 text-xl text-white">
            <Settings className="h-6 w-6 text-purple-400" />
            Configure Tool: {toolName}
            <Badge variant="outline" className="ml-auto bg-purple-900/20 text-purple-300 border-purple-600">
              Official SDK
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading tool configuration...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {configuration && !loading && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="bg-gray-800 border-b border-gray-700">
                <CardTitle className="flex items-center gap-3 text-white">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  {configuration.name}
                  <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-600">
                    {configuration.category}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {configuration.description}
                </CardDescription>
              </CardHeader>
            </Card>

            <Separator className="bg-gray-700" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-400" />
                Configuration
              </h3>
              {Object.entries(configuration.configuration).map(([key, config]) => (
                <Card key={key} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    {renderFormField(key, config)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="bg-gray-800 border-t border-gray-700 p-6 -m-6 mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || loading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

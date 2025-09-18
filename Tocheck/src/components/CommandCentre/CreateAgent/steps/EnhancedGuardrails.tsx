import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  MessageCircleX,
  Info,
  Plus,
  X,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface CustomRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  action: 'block' | 'warn' | 'replace';
  replacement?: string;
  enabled: boolean;
}

interface DynamicGuardrails {
  global: boolean;
  local: boolean;
  piiRedaction: {
    enabled: boolean;
    strategy: 'mask' | 'remove' | 'placeholder';
    customTypes: string[];
    customPatterns: string[];
    maskCharacter: string;
    placeholderText: string;
  };
  contentFilter: {
    enabled: boolean;
    level: 'basic' | 'moderate' | 'strict';
    customKeywords: string[];
    allowedDomains: string[];
    blockedPhrases: string[];
  };
  behaviorLimits: {
    enabled: boolean;
    customLimits: string[];
    responseMaxLength: number;
    requireApproval: boolean;
  };
  customRules: CustomRule[];
}

interface DynamicGuardrailsProps {
  guardrails: DynamicGuardrails;
  onUpdate: (guardrails: DynamicGuardrails) => void;
}

export const EnhancedGuardrails: React.FC<DynamicGuardrailsProps> = ({
  guardrails,
  onUpdate
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [newPiiType, setNewPiiType] = useState('');
  const [newCustomLimit, setNewCustomLimit] = useState('');
  const [newRule, setNewRule] = useState<Partial<CustomRule>>({
    name: '',
    description: '',
    pattern: '',
    action: 'block',
    replacement: '',
    enabled: true
  });

  const updateGuardrails = (updates: Partial<DynamicGuardrails>) => {
    onUpdate({ ...guardrails, ...updates });
  };

  const updateNestedConfig = (
    section: keyof DynamicGuardrails,
    updates: any
  ) => {
    const currentSection = guardrails[section];
    if (typeof currentSection === 'object' && currentSection !== null) {
      updateGuardrails({
        [section]: {
          ...currentSection,
          ...updates
        }
      });
    }
  };

  const addToArray = (section: keyof DynamicGuardrails, arrayName: string, value: string) => {
    if (!value.trim()) return;
    const currentSection = guardrails[section] as any;
    const currentArray = currentSection[arrayName] || [];
    if (!currentArray.includes(value.trim())) {
      updateNestedConfig(section, {
        [arrayName]: [...currentArray, value.trim()]
      });
    }
  };

  const removeFromArray = (section: keyof DynamicGuardrails, arrayName: string, value: string) => {
    const currentSection = guardrails[section] as any;
    const currentArray = currentSection[arrayName] || [];
    updateNestedConfig(section, {
      [arrayName]: currentArray.filter((item: string) => item !== value)
    });
  };

  const addCustomRule = () => {
    if (!newRule.name || !newRule.description) return;
    
    const rule: CustomRule = {
      id: Date.now().toString(),
      name: newRule.name,
      description: newRule.description,
      pattern: newRule.pattern || '',
      action: newRule.action || 'block',
      replacement: newRule.replacement || '',
      enabled: true
    };

    updateGuardrails({
      customRules: [...guardrails.customRules, rule]
    });

    setNewRule({
      name: '',
      description: '',
      pattern: '',
      action: 'block',
      replacement: '',
      enabled: true
    });
  };

  const removeCustomRule = (ruleId: string) => {
    updateGuardrails({
      customRules: guardrails.customRules.filter(rule => rule.id !== ruleId)
    });
  };

  const updateCustomRule = (ruleId: string, updates: Partial<CustomRule>) => {
    updateGuardrails({
      customRules: guardrails.customRules.map(rule =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Safety & Guardrails</h3>
        <p className="text-sm text-gray-400">
          Configure custom safety measures and define your own rules for your agent. Enable each section to see customization options.
        </p>
        <Alert className="border-blue-500 bg-blue-500/10 mt-3">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            💡 Tip: Enable PII Redaction, Content Filtering, or Behavior Limits to see custom configuration options where you can add your own rules, patterns, and restrictions.
          </AlertDescription>
        </Alert>
      </div>

      {/* System Guardrails */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-purple-400" />
            System Guardrails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-white">Global Guardrails</Label>
                <p className="text-xs text-gray-400">Apply organization-wide safety rules</p>
              </div>
              <Switch
                checked={guardrails.global}
                onCheckedChange={(checked) => updateGuardrails({ global: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-white">Local Guardrails</Label>
                <p className="text-xs text-gray-400">Apply project-specific safety rules</p>
              </div>
              <Switch
                checked={guardrails.local}
                onCheckedChange={(checked) => updateGuardrails({ local: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PII Redaction with Custom Configuration */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="h-5 w-5 text-blue-400" />
            PII Redaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-white">Enable PII Protection</Label>
              <p className="text-xs text-gray-400">Automatically redact personally identifiable information</p>
            </div>
            <Switch
              checked={guardrails.piiRedaction.enabled}
              onCheckedChange={(enabled) => updateNestedConfig('piiRedaction', { enabled })}
            />
          </div>

          {guardrails.piiRedaction.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-white">Redaction Strategy</Label>
                  <Select
                    value={guardrails.piiRedaction.strategy}
                    onValueChange={(strategy) => updateNestedConfig('piiRedaction', { strategy })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mask">Mask with characters</SelectItem>
                      <SelectItem value="remove">Remove completely</SelectItem>
                      <SelectItem value="placeholder">Replace with placeholder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {guardrails.piiRedaction.strategy === 'mask' && (
                  <div>
                    <Label className="text-sm font-medium text-white">Mask Character</Label>
                    <Input
                      value={guardrails.piiRedaction.maskCharacter}
                      onChange={(e) => updateNestedConfig('piiRedaction', { maskCharacter: e.target.value.slice(0, 1) })}
                      placeholder="*"
                      maxLength={1}
                      className="bg-gray-700 border-gray-600 mt-2"
                    />
                  </div>
                )}

                {guardrails.piiRedaction.strategy === 'placeholder' && (
                  <div>
                    <Label className="text-sm font-medium text-white">Placeholder Text</Label>
                    <Input
                      value={guardrails.piiRedaction.placeholderText}
                      onChange={(e) => updateNestedConfig('piiRedaction', { placeholderText: e.target.value })}
                      placeholder="[REDACTED]"
                      className="bg-gray-700 border-gray-600 mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Custom PII Types */}
              <div>
                <Label className="text-sm font-medium text-white">Custom PII Types</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newPiiType}
                    onChange={(e) => setNewPiiType(e.target.value)}
                    placeholder="e.g., Employee ID, Badge Number"
                    className="bg-gray-700 border-gray-600"
                  />
                  <Button
                    onClick={() => {
                      addToArray('piiRedaction', 'customTypes', newPiiType);
                      setNewPiiType('');
                    }}
                    size="sm"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {guardrails.piiRedaction.customTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {guardrails.piiRedaction.customTypes.map((type, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {type}
                        <X
                          size={12}
                          className="cursor-pointer"
                          onClick={() => removeFromArray('piiRedaction', 'customTypes', type)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Patterns */}
              <div>
                <Label className="text-sm font-medium text-white">Custom Regex Patterns</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newPattern}
                    onChange={(e) => setNewPattern(e.target.value)}
                    placeholder="e.g., \\b\\d{3}-\\d{2}-\\d{4}\\b for SSN"
                    className="bg-gray-700 border-gray-600"
                  />
                  <Button
                    onClick={() => {
                      addToArray('piiRedaction', 'customPatterns', newPattern);
                      setNewPattern('');
                    }}
                    size="sm"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {guardrails.piiRedaction.customPatterns.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {guardrails.piiRedaction.customPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                        <code className="text-sm text-green-400">{pattern}</code>
                        <X
                          size={16}
                          className="cursor-pointer text-red-400"
                          onClick={() => removeFromArray('piiRedaction', 'customPatterns', pattern)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Filtering with Custom Keywords */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageCircleX className="h-5 w-5 text-red-400" />
            Content Filtering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-white">Enable Content Filter</Label>
              <p className="text-xs text-gray-400">Filter harmful or inappropriate content</p>
            </div>
            <Switch
              checked={guardrails.contentFilter.enabled}
              onCheckedChange={(enabled) => updateNestedConfig('contentFilter', { enabled })}
            />
          </div>

          {guardrails.contentFilter.enabled && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-white">Filter Level</Label>
                <Select
                  value={guardrails.contentFilter.level}
                  onValueChange={(level) => updateNestedConfig('contentFilter', { level })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic - Block clearly harmful content</SelectItem>
                    <SelectItem value="moderate">Moderate - Balanced filtering</SelectItem>
                    <SelectItem value="strict">Strict - Conservative filtering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Keywords */}
              <div>
                <Label className="text-sm font-medium text-white">Custom Blocked Keywords</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Enter keyword to block"
                    className="bg-gray-700 border-gray-600"
                  />
                  <Button
                    onClick={() => {
                      addToArray('contentFilter', 'customKeywords', newKeyword);
                      setNewKeyword('');
                    }}
                    size="sm"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {guardrails.contentFilter.customKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {guardrails.contentFilter.customKeywords.map((keyword, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {keyword}
                        <X
                          size={12}
                          className="cursor-pointer"
                          onClick={() => removeFromArray('contentFilter', 'customKeywords', keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Blocked Phrases */}
              <div>
                <Label className="text-sm font-medium text-white">Blocked Phrases</Label>
                <Textarea
                  placeholder="Enter phrases to block (one per line)"
                  value={guardrails.contentFilter.blockedPhrases.join('\n')}
                  onChange={(e) => updateNestedConfig('contentFilter', { 
                    blockedPhrases: e.target.value.split('\n').filter(p => p.trim()) 
                  })}
                  className="bg-gray-700 border-gray-600 mt-2"
                  rows={3}
                />
              </div>

              {/* Allowed Domains */}
              <div>
                <Label className="text-sm font-medium text-white">Allowed Domains (Optional)</Label>
                <Textarea
                  placeholder="Enter allowed domains (one per line, e.g., company.com)"
                  value={guardrails.contentFilter.allowedDomains.join('\n')}
                  onChange={(e) => updateNestedConfig('contentFilter', { 
                    allowedDomains: e.target.value.split('\n').filter(d => d.trim()) 
                  })}
                  className="bg-gray-700 border-gray-600 mt-2"
                  rows={2}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Behavior Limits with Custom Configuration */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5 text-orange-400" />
            Behavior Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-white">Enable Behavior Limits</Label>
              <p className="text-xs text-gray-400">Restrict harmful advice and inappropriate responses</p>
            </div>
            <Switch
              checked={guardrails.behaviorLimits.enabled}
              onCheckedChange={(enabled) => updateNestedConfig('behaviorLimits', { enabled })}
            />
          </div>

          {guardrails.behaviorLimits.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-white">Max Response Length</Label>
                  <Input
                    type="number"
                    value={guardrails.behaviorLimits.responseMaxLength}
                    onChange={(e) => updateNestedConfig('behaviorLimits', { responseMaxLength: parseInt(e.target.value) || 1000 })}
                    className="bg-gray-700 border-gray-600 mt-2"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-white">Require Approval</Label>
                    <p className="text-xs text-gray-400">Require human approval for responses</p>
                  </div>
                  <Switch
                    checked={guardrails.behaviorLimits.requireApproval}
                    onCheckedChange={(checked) => updateNestedConfig('behaviorLimits', { requireApproval: checked })}
                  />
                </div>
              </div>

              {/* Custom Behavior Limits */}
              <div>
                <Label className="text-sm font-medium text-white">Custom Behavior Restrictions</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newCustomLimit}
                    onChange={(e) => setNewCustomLimit(e.target.value)}
                    placeholder="e.g., No investment advice, No legal counsel"
                    className="bg-gray-700 border-gray-600"
                  />
                  <Button
                    onClick={() => {
                      addToArray('behaviorLimits', 'customLimits', newCustomLimit);
                      setNewCustomLimit('');
                    }}
                    size="sm"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {guardrails.behaviorLimits.customLimits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {guardrails.behaviorLimits.customLimits.map((limit, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {limit}
                        <X
                          size={12}
                          className="cursor-pointer"
                          onClick={() => removeFromArray('behaviorLimits', 'customLimits', limit)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Rules */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-purple-400" />
            Custom Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Rule */}
          <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
            <h4 className="text-sm font-medium text-white mb-3">Create Custom Rule</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-white">Rule Name</Label>
                <Input
                  value={newRule.name || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Block Competitor Names"
                  className="bg-gray-700 border-gray-600 mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-white">Action</Label>
                <Select
                  value={newRule.action || 'block'}
                  onValueChange={(action) => setNewRule(prev => ({ ...prev, action: action as any }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block completely</SelectItem>
                    <SelectItem value="warn">Show warning</SelectItem>
                    <SelectItem value="replace">Replace with text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4">
              <Label className="text-sm text-white">Description</Label>
              <Textarea
                value={newRule.description || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this rule does"
                className="bg-gray-700 border-gray-600 mt-1"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="text-sm text-white">Pattern (Optional)</Label>
                <Input
                  value={newRule.pattern || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, pattern: e.target.value }))}
                  placeholder="Regex pattern or keyword"
                  className="bg-gray-700 border-gray-600 mt-1"
                />
              </div>
              {newRule.action === 'replace' && (
                <div>
                  <Label className="text-sm text-white">Replacement Text</Label>
                  <Input
                    value={newRule.replacement || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, replacement: e.target.value }))}
                    placeholder="Text to replace with"
                    className="bg-gray-700 border-gray-600 mt-1"
                  />
                </div>
              )}
            </div>

            <Button onClick={addCustomRule} className="w-full mt-4" disabled={!newRule.name || !newRule.description}>
              <Plus size={16} className="mr-2" />
              Add Custom Rule
            </Button>
          </div>

          {/* Existing Custom Rules */}
          {guardrails.customRules.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Active Custom Rules</h4>
              {guardrails.customRules.map(rule => (
                <div key={rule.id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{rule.name}</span>
                        <Badge variant={rule.action === 'block' ? 'destructive' : rule.action === 'warn' ? 'default' : 'secondary'} className="text-xs">
                          {rule.action}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{rule.description}</p>
                      {rule.pattern && (
                        <p className="text-xs text-purple-400 mt-1">Pattern: <code>{rule.pattern}</code></p>
                      )}
                      {rule.replacement && (
                        <p className="text-xs text-green-400 mt-1">Replacement: "{rule.replacement}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => updateCustomRule(rule.id, { enabled })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomRule(rule.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guardrails Summary */}
      <Card className="bg-orange-500/10 border-orange-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-orange-400 mb-3">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Guardrails Summary</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-orange-300 font-medium">System:</span>
              <div className="mt-1">
                <span className="text-white">
                  {guardrails.global || guardrails.local ? 'Enabled' : 'None'}
                </span>
              </div>
            </div>
            
            <div>
              <span className="text-orange-300 font-medium">PII Protection:</span>
              <div className="mt-1">
                <span className="text-white">
                  {guardrails.piiRedaction.enabled ? `${guardrails.piiRedaction.strategy} (${guardrails.piiRedaction.customTypes.length + guardrails.piiRedaction.customPatterns.length} custom)` : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div>
              <span className="text-orange-300 font-medium">Content Filter:</span>
              <div className="mt-1">
                <span className="text-white">
                  {guardrails.contentFilter.enabled ? `${guardrails.contentFilter.level} (${guardrails.contentFilter.customKeywords.length} keywords)` : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div>
              <span className="text-orange-300 font-medium">Custom Rules:</span>
              <div className="mt-1">
                <span className="text-white">
                  {guardrails.customRules.filter(r => r.enabled).length} active
                </span>
              </div>
            </div>
          </div>

          {(guardrails.piiRedaction.enabled || guardrails.contentFilter.enabled || guardrails.behaviorLimits.enabled || guardrails.customRules.length > 0) && (
            <Alert className="border-green-500 bg-green-500/10 mt-4">
              <AlertTriangle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                Your agent is protected with {[
                  guardrails.piiRedaction.enabled && 'PII redaction',
                  guardrails.contentFilter.enabled && 'content filtering',
                  guardrails.behaviorLimits.enabled && 'behavior limits',
                  guardrails.customRules.length > 0 && `${guardrails.customRules.length} custom rules`
                ].filter(Boolean).join(', ')}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
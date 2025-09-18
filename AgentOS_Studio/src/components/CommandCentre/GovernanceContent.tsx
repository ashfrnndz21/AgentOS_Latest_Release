import React, { useState } from 'react';
import { Shield, Database, Clock, FileText, Globe, Map, Plus, AlertTriangle, Lock, Eye, Server, Hash, Settings, Upload, FileUp, Brain, CheckCircle2, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner";
import { GuardrailType } from '@/components/AgentTraceability/types';
import { StepNavigation } from './StepNavigation';

const guardrailSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["pii", "sensitive", "regex", "llm", "custom"]),
  scope: z.enum(["global", "local"]),
  severity: z.enum(["low", "medium", "high"]),
  action: z.enum(["log", "warn", "block", "redact"]),
  pattern: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

const piiPolicySchema = z.object({
  policyName: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  detectionType: z.enum(["rule-based", "ml-based", "hybrid"]),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  redactionMethod: z.enum(["full", "partial", "hash", "tokenize"]),
  actionOnDetection: z.enum(["log", "warn", "block", "redact"]),
  automatedReasoning: z.boolean(),
  reasoningLevel: z.enum(["basic", "advanced", "comprehensive"]).optional(),
  enableAudit: z.boolean(),
});

export const GovernanceContent: React.FC<{ industry?: string }> = ({ industry = 'industrial' }) => {
  const [activeTab, setActiveTab] = useState("global");
  const [guardrails, setGuardrails] = useState<GuardrailType[]>(() => {
    if (industry === 'telco') {
      return [
        {
          id: "g1",
          name: "Global Network Data Filter",
          description: "Organization-wide filter for network infrastructure information",
          type: "pii",
          scope: "global",
          severity: "high",
          action: "block",
          enabled: true,
          categories: ["Network Config", "IP Addresses", "Equipment Serial Numbers", "Access Credentials"],
          createdAt: "2025-03-01"
        },
        {
          id: "g2",
          name: "Global Customer Data Protection",
          description: "Organization-wide filter for telecom customer information",
          type: "sensitive",
          scope: "global",
          severity: "high",
          action: "redact",
          enabled: true,
          categories: ["IMSI", "Phone Numbers", "Location Data", "Usage Patterns"],
          createdAt: "2025-03-05"
        },
        {
          id: "g3",
          name: "Network Operations Security",
          description: "Project-specific filter for network operations data",
          type: "custom",
          scope: "local",
          severity: "high",
          action: "block",
          enabled: true,
          categories: ["Cell Tower Config", "Network Passwords", "Traffic Analysis", "Spectrum Data"],
          createdAt: "2025-04-01"
        },
        {
          id: "g4",
          name: "Billing Information Protection",
          description: "Project-specific filter for customer billing data",
          type: "sensitive",
          scope: "local",
          severity: "high",
          action: "block",
          enabled: true,
          categories: ["Payment Methods", "Billing History", "Account Numbers", "Credit Information"],
          createdAt: "2025-04-02"
        },
        {
          id: "g5",
          name: "Telecom Regulatory Compliance",
          description: "Ensures compliance with telecom regulations and standards",
          type: "custom",
          scope: "global",
          severity: "high",
          action: "warn",
          enabled: true,
          categories: ["GDPR Compliance", "Telecom Act", "Data Retention", "Emergency Services"],
          createdAt: "2025-04-05"
        }
      ];
    } else {
      return [
        {
          id: "g1",
          name: "Global PII Filter",
          description: "Organization-wide filter for personally identifiable information",
          type: "pii",
          scope: "global",
          severity: "high",
          action: "block",
          enabled: true,
          categories: ["SSN", "Credit Card", "Phone Number", "Address"],
          createdAt: "2025-03-01"
        },
        {
          id: "g2",
          name: "Global Sensitive Info Filter",
          description: "Organization-wide filter for sensitive business information",
          type: "sensitive",
          scope: "global",
          severity: "medium",
          action: "warn",
          enabled: true,
          categories: ["Financial Data", "Business Strategy", "Client Information"],
          createdAt: "2025-03-05"
        },
        {
          id: "g3",
          name: "Industrial Network Data Filter",
          description: "Project-specific filter for industrial network infrastructure data",
          type: "custom",
          scope: "local",
          severity: "high",
          action: "block",
          enabled: true,
          categories: ["Network Config", "Database Credentials", "API Keys"],
          createdAt: "2025-04-01"
        },
        {
          id: "g4",
          name: "Customer Financial Information",
          description: "Project-specific filter for customer financial information",
          type: "sensitive",
          scope: "local",
          severity: "high",
          action: "block",
          enabled: true,
          categories: ["Production Data", "Process Parameters", "Safety Records"],
          createdAt: "2025-04-02"
        }
      ];
    }
  });

  const form = useForm<z.infer<typeof guardrailSchema>>({
    resolver: zodResolver(guardrailSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "pii",
      scope: "global",
      severity: "medium",
      action: "warn",
      pattern: "",
      categories: [],
    }
  });

  const handleSubmit = (values: z.infer<typeof guardrailSchema>) => {
    const newGuardrail: GuardrailType = {
      id: `g${guardrails.length + 1}`,
      name: values.name,
      description: values.description,
      type: values.type,
      scope: values.scope,
      severity: values.severity,
      action: values.action,
      enabled: true,
      createdAt: new Date().toISOString().split('T')[0],
      pattern: values.pattern,
      categories: values.categories || []
    };
    
    setGuardrails([...guardrails, newGuardrail]);
    toast.success(`New ${values.scope} guardrail created: ${values.name}`);
    form.reset();
  };

  const toggleGuardrail = (id: string) => {
    setGuardrails(guardrails.map(g => 
      g.id === id ? {...g, enabled: !g.enabled} : g
    ));
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case "pii": return Shield;
      case "sensitive": return Eye;
      case "regex": return Hash;
      case "llm": return Server;
      case "custom": return Settings;
      default: return AlertTriangle;
    }
  };

  const getBadgeForSeverity = (severity: string) => {
    switch(severity) {
      case "high": 
        return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">High</Badge>;
      case "medium": 
        return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Medium</Badge>;
      case "low": 
        return <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">Low</Badge>;
      default: 
        return null;
    }
  };

  const getBadgeForAction = (action: string) => {
    switch(action) {
      case "block": 
        return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Block</Badge>;
      case "warn": 
        return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">Warn</Badge>;
      case "log": 
        return <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">Log</Badge>;
      default: 
        return null;
    }
  };

  const globalGuardrails = guardrails.filter(g => g.scope === "global");
  const localGuardrails = guardrails.filter(g => g.scope === "local");

  const renderGuardrailList = (guardrailList: GuardrailType[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {guardrailList.map((guardrail) => {
        const IconComponent = getIconForType(guardrail.type);
        return (
          <Card key={guardrail.id} className="bg-beam-dark-accent/40 border border-gray-600/40 hover:border-purple-500/30 transition-all duration-300 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${guardrail.enabled ? 'bg-purple-500/20 border-purple-500/30' : 'bg-gray-500/20 border-gray-500/30'} border`}>
                    <IconComponent size={16} className={guardrail.enabled ? "text-purple-400" : "text-gray-400"} />
                  </div>
                  <div>
                    <CardTitle className="text-white text-sm">{guardrail.name}</CardTitle>
                    <CardDescription className="text-gray-400 text-xs">
                      Created: {guardrail.createdAt}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={guardrail.enabled} 
                    onCheckedChange={() => toggleGuardrail(guardrail.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 mb-3">{guardrail.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {guardrail.categories?.map((category, index) => (
                  <Badge key={index} variant="outline" className="bg-beam-dark-accent/60 border-gray-600/40">
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getBadgeForSeverity(guardrail.severity)}
                  {getBadgeForAction(guardrail.action)}
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs border-beam-blue text-beam-blue">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const [policySetupStep, setPolicySetupStep] = useState(1);
  const [showPolicySetup, setShowPolicySetup] = useState(false);
  const [selectedPiiCategories, setSelectedPiiCategories] = useState<string[]>([]);
  const [uploadedPolicies, setUploadedPolicies] = useState<Array<{name: string, type: string, size: string}>>([]);
  const [automatedReasoningEnabled, setAutomatedReasoningEnabled] = useState(false);

  const piiCategories = [
    { id: 'names', label: 'Names', description: 'Personal names like John Doe' },
    { id: 'addresses', label: 'Addresses', description: 'Physical addresses' },
    { id: 'emails', label: 'Email Addresses', description: 'john@example.com' },
    { id: 'phone', label: 'Phone Numbers', description: '+1 555-123-4567' },
    { id: 'ssn', label: 'Social Security Numbers', description: '123-45-6789' },
    { id: 'cc', label: 'Credit Card Numbers', description: '4111-1111-1111-1111' },
    { id: 'dob', label: 'Dates of Birth', description: '01/01/1990' },
    { id: 'passport', label: 'Passport Numbers', description: 'A12345678' },
    { id: 'license', label: 'License Numbers', description: 'DL1234567' },
    { id: 'medical', label: 'Medical Information', description: 'Health records, conditions' },
    { id: 'financial', label: 'Financial Details', description: 'Cost data, budget information, financial records' },
  ];

  const piiPolicyForm = useForm<z.infer<typeof piiPolicySchema>>({
    resolver: zodResolver(piiPolicySchema),
    defaultValues: {
      policyName: '',
      description: '',
      detectionType: 'hybrid',
      categories: [],
      redactionMethod: 'partial',
      actionOnDetection: 'redact',
      automatedReasoning: false,
      reasoningLevel: 'basic',
      enableAudit: true,
    }
  });

  const handleCreatePiiPolicy = (data: z.infer<typeof piiPolicySchema>) => {
    console.log('Creating PII Policy:', data);
    
    const newGuardrail: GuardrailType = {
      id: `g${guardrails.length + 1}`,
      name: data.policyName,
      description: data.description,
      type: 'pii',
      scope: 'global',
      severity: 'high',
      action: data.actionOnDetection,
      enabled: true,
      createdAt: new Date().toISOString().split('T')[0],
      categories: data.categories
    };
    
    setGuardrails([...guardrails, newGuardrail]);
    toast.success(`Global PII Policy created: ${data.policyName}`);
    setShowPolicySetup(false);
    setPolicySetupStep(1);
    piiPolicyForm.reset();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPolicies = Array.from(files).map(file => ({
        name: file.name,
        type: file.name.endsWith('.json') ? 'JSON Policy' : 'Text Policy',
        size: `${(file.size / 1024).toFixed(1)} KB`
      }));
      
      setUploadedPolicies([...uploadedPolicies, ...newPolicies]);
      toast.success(`${files.length} policy file(s) uploaded successfully`);
    }
  };

  const handleNextStep = () => {
    if (policySetupStep < 3) {
      setPolicySetupStep(policySetupStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (policySetupStep > 1) {
      setPolicySetupStep(policySetupStep - 1);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const currentCategories = piiPolicyForm.getValues().categories || [];
    
    if (currentCategories.includes(categoryId)) {
      piiPolicyForm.setValue('categories', currentCategories.filter(id => id !== categoryId));
    } else {
      piiPolicyForm.setValue('categories', [...currentCategories, categoryId]);
    }
  };

  const toggleAutomatedReasoning = (enabled: boolean) => {
    setAutomatedReasoningEnabled(enabled);
    piiPolicyForm.setValue('automatedReasoning', enabled);
  };

  const renderPolicySetupContent = () => {
    switch (policySetupStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Shield size={18} className="text-purple-400" />
              </div>
              <h3 className="text-white font-medium">Basic Policy Information</h3>
            </div>
            
            <FormField
              control={piiPolicyForm.control}
              name="policyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Policy Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Global PII Protection Policy" 
                      className="bg-beam-dark border-gray-700" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    A descriptive name for this guardrail policy
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={piiPolicyForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Organization-wide policy for detecting and redacting personally identifiable information" 
                      className="bg-beam-dark border-gray-700" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Detailed description of this policy's purpose and scope
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={piiPolicyForm.control}
              name="detectionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Detection Method</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-beam-dark border-gray-700">
                        <SelectValue placeholder="Select detection method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-beam-dark border-gray-700">
                      <SelectItem value="rule-based">Rule-Based Detection</SelectItem>
                      <SelectItem value="ml-based">ML-Based Detection</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Rules + ML)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-gray-400">
                    How PII will be detected across your agents
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Eye size={18} className="text-blue-400" />
              </div>
              <h3 className="text-white font-medium">Detection Categories & Actions</h3>
            </div>
            
            <FormField
              control={piiPolicyForm.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">PII Categories to Detect</FormLabel>
                  <FormDescription className="text-gray-400 mb-2">
                    Select which types of personally identifiable information to detect
                  </FormDescription>
                  <ScrollArea className="h-64 rounded-md border border-gray-700 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {piiCategories.map(category => (
                        <div 
                          key={category.id}
                          className={`p-3 rounded-md cursor-pointer border transition-colors ${
                            field.value.includes(category.id) 
                              ? 'border-purple-500 bg-purple-500/10' 
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded mr-2 ${
                              field.value.includes(category.id) ? 'bg-purple-500' : 'bg-gray-700'
                            }`}></div>
                            <span className="text-white font-medium">{category.label}</span>
                          </div>
                          <p className="text-gray-400 text-sm ml-6">{category.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={piiPolicyForm.control}
                name="redactionMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Redaction Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-beam-dark border-gray-700">
                          <SelectValue placeholder="Select redaction method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-beam-dark border-gray-700">
                        <SelectItem value="full">Full Redaction (****)</SelectItem>
                        <SelectItem value="partial">Partial Redaction (J*** D**)</SelectItem>
                        <SelectItem value="hash">Hash (a1b2c3d4)</SelectItem>
                        <SelectItem value="tokenize">Tokenize (replace with tokens)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gray-400">
                      How detected PII will be redacted
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={piiPolicyForm.control}
                name="actionOnDetection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Action on Detection</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-beam-dark border-gray-700">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-beam-dark border-gray-700">
                        <SelectItem value="log">Log Only</SelectItem>
                        <SelectItem value="warn">Warn User</SelectItem>
                        <SelectItem value="redact">Automatically Redact</SelectItem>
                        <SelectItem value="block">Block Interaction</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gray-400">
                      What happens when PII is detected
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="p-4 rounded-lg border border-gray-700 bg-gray-900/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileUp size={18} className="text-gray-400" />
                  <h4 className="text-white font-medium">Upload Existing Policies</h4>
                </div>
                <label className="cursor-pointer">
                  <Input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept=".json,.txt" 
                    onChange={handleFileUpload}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    Choose Files
                  </Button>
                </label>
              </div>
              
              {uploadedPolicies.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm text-gray-400 mb-2">Uploaded Files:</h5>
                  <ScrollArea className="h-24 rounded-md border border-gray-700 p-2">
                    <div className="space-y-2">
                      {uploadedPolicies.map((policy, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-gray-400" />
                            <span className="text-sm text-white">{policy.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {policy.type}
                            </Badge>
                            <span className="text-xs text-gray-400">{policy.size}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                <Brain size={18} className="text-green-400" />
              </div>
              <h3 className="text-white font-medium">Automated Reasoning & Auditing</h3>
            </div>
            
            <div className="p-4 rounded-lg border border-gray-700 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Brain size={16} className="text-green-400" />
                    Automated Reasoning
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Enables AI to automatically reason about and explain policy violations
                  </p>
                </div>
                <Switch 
                  checked={automatedReasoningEnabled} 
                  onCheckedChange={toggleAutomatedReasoning}
                />
              </div>
              
              {automatedReasoningEnabled && (
                <FormField
                  control={piiPolicyForm.control}
                  name="reasoningLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Reasoning Comprehensiveness</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-beam-dark border-gray-700">
                            <SelectValue placeholder="Select reasoning level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-beam-dark border-gray-700">
                          <SelectItem value="basic">Basic (Simple Explanations)</SelectItem>
                          <SelectItem value="advanced">Advanced (Detailed Analysis)</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive (In-depth Rationale)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-gray-400">
                        How detailed the reasoning about policy violations should be
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
              
              <div className="pt-4 border-t border-gray-700">
                <Card className="bg-green-500/5 border border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-400" />
                      Benefits of Automated Reasoning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-5">
                      <li>Automatically explains why content was flagged</li>
                      <li>Provides continuous learning from policy applications</li>
                      <li>Helps identify policy gaps and false positives</li>
                      <li>Improves transparency and accountability</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <FormField
              control={piiPolicyForm.control}
              name="enableAudit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border border-gray-700">
                  <div className="space-y-0.5">
                    <FormLabel className="text-white flex items-center gap-2">
                      <RefreshCw size={16} className="text-blue-400" />
                      Enable Audit Logging
                    </FormLabel>
                    <FormDescription className="text-gray-400">
                      Keep detailed logs of all policy applications and violations
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="p-4 rounded-lg border border-gray-700 bg-gray-900/50">
              <h4 className="text-white font-medium mb-2">Policy Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Policy Name:</span>
                  <span className="text-white">{piiPolicyForm.getValues().policyName || '(Not set)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Detection Method:</span>
                  <span className="text-white">
                    {piiPolicyForm.getValues().detectionType === 'rule-based' ? 'Rule-Based' : 
                     piiPolicyForm.getValues().detectionType === 'ml-based' ? 'ML-Based' : 'Hybrid'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Categories:</span>
                  <span className="text-white">{piiPolicyForm.getValues().categories?.length || 0} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Redaction:</span>
                  <span className="text-white">
                    {piiPolicyForm.getValues().redactionMethod === 'full' ? 'Full Redaction' : 
                     piiPolicyForm.getValues().redactionMethod === 'partial' ? 'Partial Redaction' : 
                     piiPolicyForm.getValues().redactionMethod === 'hash' ? 'Hash' : 'Tokenize'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Action:</span>
                  <span className="text-white">
                    {piiPolicyForm.getValues().actionOnDetection === 'log' ? 'Log Only' : 
                     piiPolicyForm.getValues().actionOnDetection === 'warn' ? 'Warn User' : 
                     piiPolicyForm.getValues().actionOnDetection === 'redact' ? 'Auto-Redact' : 'Block'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Automated Reasoning:</span>
                  <span className="text-white">{piiPolicyForm.getValues().automatedReasoning ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Audit Logging:</span>
                  <span className="text-white">{piiPolicyForm.getValues().enableAudit ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="glass-panel p-6 backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <Shield size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-medium text-white">Governance Controls</h2>
          <p className="text-gray-300 text-sm">Manage policies, guardrails, and compliance settings for your agents.</p>
        </div>
      </div>
      
      <Tabs defaultValue="global" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-beam-dark-accent/50">
            <TabsTrigger value="global" className="data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              <Globe size={14} className="mr-2" />
              Global Guardrail Policy
            </TabsTrigger>
            <TabsTrigger value="local" className="data-[state=active]:bg-beam-blue data-[state=active]:text-white">
              <Map size={14} className="mr-2" />
              Local Guardrail Policy
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              className="bg-beam-blue hover:bg-blue-600"
              onClick={() => setShowPolicySetup(true)}
            >
              <Plus size={16} className="mr-2" />
              Setup Policy
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-700 text-white">
                  <Plus size={16} className="mr-2" />
                  Add Guardrail
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-beam-dark-accent border-gray-700 text-white max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Guardrail</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Configure a new guardrail to protect sensitive information.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guardrail Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="E.g., Customer PII Filter" 
                              className="bg-beam-dark border-gray-700" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the purpose of this guardrail" 
                              className="bg-beam-dark border-gray-700" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardrail Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-beam-dark border-gray-700">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-beam-dark border-gray-700">
                                <SelectItem value="pii">PII Detection</SelectItem>
                                <SelectItem value="sensitive">Sensitive Info</SelectItem>
                                <SelectItem value="regex">Regex Pattern</SelectItem>
                                <SelectItem value="llm">LLM Content Filter</SelectItem>
                                <SelectItem value="custom">Custom Logic</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="scope"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scope</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-beam-dark border-gray-700">
                                  <SelectValue placeholder="Select scope" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-beam-dark border-gray-700">
                                <SelectItem value="global">Global (Org-wide)</SelectItem>
                                <SelectItem value="local">Local (Project)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("type") === "regex" && (
                      <FormField
                        control={form.control}
                        name="pattern"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regex Pattern</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="E.g., \b\d{3}-\d{2}-\d{4}\b" 
                                className="bg-beam-dark border-gray-700 font-mono" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Enter a regular expression pattern to match sensitive data
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severity Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-beam-dark border-gray-700">
                                  <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-beam-dark border-gray-700">
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-beam-dark border-gray-700">
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-beam-dark border-gray-700">
                                <SelectItem value="log">Log Only</SelectItem>
                                <SelectItem value="warn">Warn</SelectItem>
                                <SelectItem value="block">Block</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" className="bg-beam-blue hover:bg-blue-600">
                        Create Guardrail
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="global" className="mt-0">
          {showPolicySetup ? (
            <div className="glass-panel bg-beam-dark-accent/40 border border-gray-600/40 rounded-lg p-5">
              <div className="mb-6">
                <h3 className="text-white text-lg font-medium">Global Guardrail Policy Setup</h3>
                <p className="text-gray-400 text-sm">Configure organization-wide policies for PII detection, redaction, and governance</p>
              </div>
              
              <Form {...piiPolicyForm}>
                <form onSubmit={piiPolicyForm.handleSubmit(handleCreatePiiPolicy)}>
                  {renderPolicySetupContent()}
                  
                  <div className="mt-6">
                    <StepNavigation 
                      step={policySetupStep}
                      prevStep={handlePreviousStep}
                      nextStep={handleNextStep}
                      isLastStep={policySetupStep === 3}
                      isSubmitting={piiPolicyForm.formState.isSubmitting}
                    />
                  </div>
                </form>
              </Form>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-lg bg-beam-dark-accent/50 border border-gray-600/40 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Globe size={18} className="text-purple-400" />
                  <h3 className="text-white font-medium">Organization-Wide Guardrail Policies</h3>
                </div>
                <p className="text-gray-300 text-sm ml-7">
                  Global guardrails are applied across all projects and agents in your organization. 
                  These policies cannot be overridden by project-level settings.
                </p>
              </div>
              
              {globalGuardrails.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {globalGuardrails.map((guardrail) => {
                    const IconComponent = getIconForType(guardrail.type);
                    return (
                      <Card key={guardrail.id} className="bg-beam-dark-accent/40 border border-gray-600/40 hover:border-purple-500/30 transition-all duration-300 shadow-lg">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${guardrail.enabled ? 'bg-purple-500/20 border-purple-500/30' : 'bg-gray-500/20 border-gray-500/30'} border`}>
                                <IconComponent size={16} className={guardrail.enabled ? "text-purple-400" : "text-gray-400"} />
                              </div>
                              <div>
                                <CardTitle className="text-white text-sm">{guardrail.name}</CardTitle>
                                <CardDescription className="text-gray-400 text-xs">
                                  Created: {guardrail.createdAt}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={guardrail.enabled} 
                                onCheckedChange={() => toggleGuardrail(guardrail.id)}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-300 mb-3">{guardrail.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {guardrail.categories?.map((category, index) => (
                              <Badge key={index} variant="outline" className="bg-beam-dark-accent/60 border-gray-600/40">
                                {category}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {getBadgeForSeverity(guardrail.severity)}
                              {getBadgeForAction(guardrail.action)}
                            </div>
                            <Button variant="outline" size="sm" className="h-7 text-xs border-beam-blue text-beam-blue">
                              Configure
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <Shield size={40} className="mx-auto mb-4 opacity-30" />
                  <p>No global guardrails configured yet</p>
                  <Button 
                    onClick={() => setShowPolicySetup(true)} 
                    variant="link" 
                    className="text-beam-blue"
                  >
                    Set up your first global policy
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="local" className="mt-0">
          <div className="p-4 rounded-lg bg-beam-dark-accent/50 border border-gray-600/40 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Map size={18} className="text-blue-400" />
              <h3 className="text-white font-medium">Project-Specific Guardrail Policies</h3>
            </div>
            <p className="text-gray-300 text-sm ml-7">
              Local guardrails apply only to this specific project and its agents. 
              These are enforced in addition to global guardrails.
            </p>
          </div>
          
          {localGuardrails.length > 0 ? (
            renderGuardrailList(localGuardrails)
          ) : (
            <div className="text-center py-10 text-gray-400">
              <Map size={40} className="mx-auto mb-4 opacity-30" />
              <p>No local guardrails configured for this project</p>
              <Button 
                onClick={() => {
                  form.setValue("scope", "local");
                  document.querySelector("[data-state='closed'][data-trigger]")?.dispatchEvent(
                    new MouseEvent("click", { bubbles: true })
                  );
                }}
                variant="link" 
                className="text-beam-blue"
              >
                Add your first local guardrail
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

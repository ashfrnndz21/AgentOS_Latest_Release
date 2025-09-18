
import React, { useState } from 'react';
import { Database, BarChart2, Wrench, Code, Sparkles, Plus, Wifi, Smartphone, TowerControl, Antenna, Router, Cable, Network, LayoutGrid, GridIcon, FolderIcon, Bot, Brain, Microchip, Terminal, FileCode, FileTerminal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define telecom-specific tool categories with added AI-agent specific categories
const TOOL_CATEGORIES = [
  { id: 'ai-agents', name: 'AI Agent Tools', icon: Bot },
  { id: 'code', name: 'Code & Development', icon: Code },
  { id: 'data', name: 'Data Processing', icon: Database },
  { id: 'network', name: 'Network Management', icon: Network },
  { id: 'customer', name: 'Customer Operations', icon: Smartphone },
  { id: 'infrastructure', name: 'Infrastructure', icon: TowerControl },
  { id: 'analytics', name: 'Analytics & Insights', icon: BarChart2 },
  { id: 'integration', name: 'Integration', icon: Cable },
  { id: 'service', name: 'Service Monitoring', icon: Antenna },
];

export const ToolsContent: React.FC<{ industry?: string }> = ({ industry = 'banking' }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'category'>('category');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [tools, setTools] = useState(() => {
    if (industry === 'telco') {
      return [
        // AI Agent Tools
        {
          id: 'code-interpreter',
          name: 'Code Interpreter',
          description: 'Execute and analyze code across various programming languages',
          category: 'ai-agents',
          icon: Terminal
        },
        {
          id: 'reasoning-engine',
          name: 'Reasoning Engine',
          description: 'Advanced reasoning capabilities for complex problem-solving',
          category: 'ai-agents',
          icon: Brain
        },
        {
          id: 'knowledge-graph',
          name: 'Knowledge Graph Navigator',
          description: 'Navigate and query complex knowledge relationships',
          category: 'ai-agents',
          icon: Microchip
        },
        {
          id: 'memory-management',
          name: 'Agent Memory System',
          description: 'Long and short-term memory management for AI agents',
          category: 'ai-agents',
          icon: Database
        },
        // Telecom-specific tools
        {
          id: 'network-analyzer',
          name: 'Network Performance Analyzer',
          description: 'Monitor and optimize network performance across nodes',
          category: 'network',
          icon: Network
        },
        {
          id: 'spectrum-analyzer',
          name: 'Spectrum Analyzer',
          description: 'Analyze frequency spectrum usage and interference',
          category: 'network',
          icon: Antenna
        },
        {
          id: 'customer-insights',
          name: 'Customer Experience Insights',
          description: 'Analyze customer journey and experience metrics',
          category: 'customer',
          icon: Smartphone
        },
        {
          id: 'tower-monitor',
          name: 'Cell Tower Monitoring System',
          description: 'Real-time monitoring of cell tower operations',
          category: 'infrastructure',
          icon: TowerControl
        },
        {
          id: 'traffic-analysis',
          name: 'Network Traffic Analysis',
          description: 'Deep packet inspection and traffic pattern analysis',
          category: 'analytics',
          icon: BarChart2
        },
        {
          id: 'predictive-maintenance',
          name: 'Infrastructure Predictive Maintenance',
          description: 'AI-driven predictions for telecom infrastructure maintenance',
          category: 'analytics',
          icon: BarChart2
        },
        {
          id: 'api-gateway',
          name: 'Telecom API Gateway',
          description: 'Centralized API management for telecom service integrations',
          category: 'integration',
          icon: Cable
        },
        {
          id: 'service-health',
          name: 'Service Health Dashboard',
          description: 'Monitor telecom service availability and health metrics',
          category: 'service',
          icon: Antenna
        },
        {
          id: 'billing-engine',
          name: 'Usage-Based Billing Engine',
          description: 'Real-time billing calculations based on network usage',
          category: 'customer',
          icon: Smartphone
        },
        {
          id: 'fraud-detection',
          name: 'Telecom Fraud Detection',
          description: 'Detect and prevent telecom fraud and revenue leakage',
          category: 'analytics',
          icon: BarChart2
        }
      ];
    } else {
      return [
        // AI Agent Tools
        {
          id: 'code-interpreter',
          name: 'Code Interpreter',
          description: 'Execute and analyze code across various programming languages',
          category: 'ai-agents',
          icon: Terminal
        },
        {
          id: 'reasoning-engine',
          name: 'Reasoning Engine',
          description: 'Advanced reasoning capabilities for complex problem-solving',
          category: 'ai-agents',
          icon: Brain
        },
        {
          id: 'knowledge-graph',
          name: 'Knowledge Graph Navigator',
          description: 'Navigate and query complex knowledge relationships',
          category: 'ai-agents',
          icon: Microchip
        },
        {
          id: 'memory-management',
          name: 'Agent Memory System',
          description: 'Long and short-term memory management for AI agents',
          category: 'ai-agents',
          icon: Database
        },
        // Banking-specific tools
        {
          id: 'kyc-processor',
          name: 'KYC Document Processor',
          description: 'Automated Know Your Customer document verification',
          category: 'data',
          icon: Database
        },
        {
          id: 'fraud-detection',
          name: 'Banking Fraud Detection',
          description: 'Real-time fraud detection for banking transactions',
          category: 'analytics',
          icon: BarChart2
        },
        {
          id: 'credit-scorer',
          name: 'Credit Risk Scorer',
          description: 'AI-powered credit risk assessment and scoring',
          category: 'analytics',
          icon: BarChart2
        },
        {
          id: 'compliance-checker',
          name: 'Regulatory Compliance Checker',
          description: 'Automated compliance verification for banking regulations',
          category: 'integration',
          icon: Cable
        },
        {
          id: 'transaction-analyzer',
          name: 'Transaction Pattern Analyzer',
          description: 'Analyze customer transaction patterns and behaviors',
          category: 'data',
          icon: Database
        },
        {
          id: 'loan-processor',
          name: 'Loan Application Processor',
          description: 'Automated loan application processing and evaluation',
          category: 'data',
          icon: Database
        },
        {
          id: 'api-gateway',
          name: 'Banking API Gateway',
          description: 'Centralized API management for banking service integrations',
          category: 'integration',
          icon: Cable
        },
        {
          id: 'customer-insights',
          name: 'Customer Financial Insights',
          description: 'Analyze customer financial behavior and preferences',
          category: 'analytics',
          icon: BarChart2
        }
      ];
    }
  });

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
    }
  });

  const handleAddTool = (data: any) => {
    const newTool = {
      id: `tool-${Date.now()}`,
      name: data.name,
      description: data.description,
      category: data.category,
      icon: TOOL_CATEGORIES.find(cat => cat.id === data.category)?.icon || Wrench
    };
    
    setTools([...tools, newTool]);
    toast.success("Tool added successfully!");
    form.reset();
  };
  
  // Filter tools by category if a category is selected
  const filteredTools = activeCategory 
    ? tools.filter(tool => tool.category === activeCategory)
    : tools;

  return (
    <div className="glass-panel p-6 backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <Bot size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">Agent Tools</h2>
            <p className="text-gray-300 text-sm">
              Specialized tools for AI agents and {industry === 'telco' ? 'telecom operations' : 'banking operations'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'category')}>
            <ToggleGroupItem value="category" aria-label="View by category" className="bg-beam-dark-accent border border-gray-700 text-white hover:bg-gray-700">
              <FolderIcon size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="View as grid" className="bg-beam-dark-accent border border-gray-700 text-white hover:bg-gray-700">
              <GridIcon size={16} />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-beam-blue hover:bg-blue-600">
                <Plus size={16} className="mr-2" />
                Add Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-beam-dark-accent border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add New {industry === 'telco' ? 'Telecom' : 'Banking'} Tool</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new tool for your agent to use in {industry === 'telco' ? 'telecom' : 'banking'} operations.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddTool)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tool Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Network Traffic Analyzer" 
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
                          <Input 
                            placeholder="Analyzes network traffic patterns" 
                            className="bg-beam-dark border-gray-700" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-beam-dark border-gray-700">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-beam-dark border-gray-700">
                            {TOOL_CATEGORIES.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" className="bg-beam-blue hover:bg-blue-600">
                      Add Tool
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Category View */}
      {viewMode === 'category' && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Category Sidebar */}
          <div className="w-full md:w-64 bg-beam-dark-accent/50 rounded-lg border border-gray-700/50 p-4">
            <h3 className="text-white font-medium mb-3">Categories</h3>
            <div className="space-y-1">
              <button 
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${activeCategory === null ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300 hover:bg-gray-700/50'}`}
                onClick={() => setActiveCategory(null)}
              >
                <Wrench size={16} className="text-blue-400" />
                <span>All Tools</span>
              </button>
              
              {TOOL_CATEGORIES.map(category => {
                const IconComponent = category.icon;
                const toolCount = tools.filter(tool => tool.category === category.id).length;
                
                if (toolCount === 0) return null;
                
                return (
                  <button 
                    key={category.id}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${activeCategory === category.id ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <IconComponent size={16} className="text-blue-400" />
                    <span>{category.name}</span>
                    <span className="ml-auto text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{toolCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Tools List */}
          <div className="flex-1">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                {filteredTools.map(tool => {
                  const IconComponent = tool.icon;
                  const category = TOOL_CATEGORIES.find(cat => cat.id === tool.category);
                  
                  return (
                    <Card key={tool.id} className="bg-gradient-to-br from-beam-dark-accent/50 to-beam-dark-accent/20 border border-gray-700/40 group hover:border-blue-500/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all duration-300">
                            <IconComponent size={20} className="text-blue-300" />
                          </div>
                          <CardTitle className="text-white text-base">{tool.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-300 mb-2">{tool.description}</p>
                        {category && (
                          <div className="flex items-center mt-2">
                            <span className="text-xs px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 flex items-center gap-1">
                              {React.createElement(category.icon, { size: 12, className: "text-blue-300" })}
                              {category.name}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <div>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 bg-beam-dark-accent/40 border border-gray-700/50 rounded-xl p-1 gap-1">
              <TabsTrigger 
                value="all" 
                className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                All Tools
              </TabsTrigger>
              
              {TOOL_CATEGORIES.map(category => {
                const toolCount = tools.filter(tool => tool.category === category.id).length;
                if (toolCount === 0) return null;
                
                return (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id} 
                    className="rounded-lg data-[state=active]:bg-beam-blue data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    {category.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
                  {tools.map(tool => {
                    const IconComponent = tool.icon;
                    
                    return (
                      <Card key={tool.id} className="bg-gradient-to-br from-beam-dark-accent/50 to-beam-dark-accent/20 border border-gray-700/40 group hover:border-blue-500/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all duration-300">
                              <IconComponent size={24} className="text-blue-300" />
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{tool.name}</h3>
                              <p className="text-xs text-gray-300 mt-1">{tool.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {TOOL_CATEGORIES.map(category => {
              const categoryTools = tools.filter(tool => tool.category === category.id);
              if (categoryTools.length === 0) return null;
              
              return (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
                      {categoryTools.map(tool => {
                        const IconComponent = tool.icon;
                        
                        return (
                          <Card key={tool.id} className="bg-gradient-to-br from-beam-dark-accent/50 to-beam-dark-accent/20 border border-gray-700/40 group hover:border-blue-500/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                            <CardContent className="p-4">
                              <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all duration-300">
                                  <IconComponent size={24} className="text-blue-300" />
                                </div>
                                <div>
                                  <h3 className="text-white font-medium">{tool.name}</h3>
                                  <p className="text-xs text-gray-300 mt-1">{tool.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      )}
    </div>
  );
};

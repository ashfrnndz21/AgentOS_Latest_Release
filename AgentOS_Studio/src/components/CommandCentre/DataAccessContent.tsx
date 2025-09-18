
import React, { useState, useEffect } from 'react';
import { Database, Lock, Shield, AlertTriangle, CheckCircle2, Clock, Plus, CreditCard, Users, BarChart2, FileText, DollarSign, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";

// Industry-specific database categories
const getBankingCategories = () => [
  { id: 'customer', name: 'Customer Data', icon: Users },
  { id: 'accounts', name: 'Accounts & Deposits', icon: CreditCard },
  { id: 'transactions', name: 'Transaction Data', icon: DollarSign },
  { id: 'loans', name: 'Loans & Credit', icon: Building2 },
  { id: 'compliance', name: 'Compliance & Risk', icon: Shield },
  { id: 'analytics', name: 'Analytics & Reporting', icon: BarChart2 },
];

const getIndustrialCategories = () => [
  { id: 'production', name: 'Production Data', icon: Users },
  { id: 'quality', name: 'Quality Control', icon: CreditCard },
  { id: 'safety', name: 'Safety Monitoring', icon: DollarSign },
  { id: 'maintenance', name: 'Maintenance & Assets', icon: Building2 },
  { id: 'compliance', name: 'Environmental Compliance', icon: Shield },
  { id: 'analytics', name: 'Process Analytics', icon: BarChart2 },
];

const getTelcoCategories = () => [
  { id: 'network', name: 'Network Infrastructure', icon: Database },
  { id: 'customer', name: 'Customer Data', icon: Users },
  { id: 'billing', name: 'Billing & Usage', icon: CreditCard },
  { id: 'traffic', name: 'Traffic Analytics', icon: BarChart2 },
  { id: 'infrastructure', name: 'Physical Infrastructure', icon: Building2 },
  { id: 'compliance', name: 'Telecom Compliance', icon: Shield },
];

// Database access levels
const ACCESS_LEVELS = [
  { id: 'read-only', name: 'Read-Only' },
  { id: 'read-write', name: 'Read-Write' },
  { id: 'admin', name: 'Admin' },
  { id: 'restricted', name: 'Restricted' },
];

export const DataAccessContent: React.FC<{ industry?: string }> = ({ industry = 'banking' }) => {
  // Get the appropriate categories based on industry
  const DATABASE_CATEGORIES = industry === 'telco' ? getTelcoCategories() : industry === 'banking' ? getBankingCategories() : getIndustrialCategories();
  
  // Industry-specific data sources
  const getInitialDataSources = () => {
    if (industry === 'telco') {
      return [
        {
          id: 1,
          name: 'Network Topology Database',
          type: 'Graph Database',
          category: 'network',
          accessLevel: 'Read-Only',
          status: 'Active',
          lastAccessed: '5 mins ago',
          queries: 38
        },
        {
          id: 2,
          name: 'Customer Service Database',
          type: 'SQL Database',
          category: 'customer',
          accessLevel: 'Read-Write',
          status: 'Active',
          lastAccessed: '15 mins ago',
          queries: 22
        },
        {
          id: 3,
          name: 'Billing & Usage Data Lake',
          type: 'Data Lake',
          category: 'billing',
          accessLevel: 'Read-Only',
          status: 'Active',
          lastAccessed: '2 hours ago',
          queries: 14
        },
        {
          id: 4,
          name: 'Network Traffic Analytics',
          type: 'Time Series DB',
          category: 'traffic',
          accessLevel: 'Read-Only',
          status: 'Active',
          lastAccessed: '30 mins ago',
          queries: 67
        },
        {
          id: 5,
          name: 'Infrastructure Management System',
          type: 'CMDB',
          category: 'infrastructure',
          accessLevel: 'Read-Only',
          status: 'Active',
          lastAccessed: '1 hour ago',
          queries: 12
        },
        {
          id: 6,
          name: 'Telecom Regulatory Database',
          type: 'Compliance Database',
          category: 'compliance',
          accessLevel: 'Restricted',
          status: 'Active',
          lastAccessed: '4 hours ago',
          queries: 3
        }
      ];
    } else {
      return [
        {
          id: 1,
          name: 'Customer Profile Database',
          type: 'SQL Database',
          category: 'customer',
          accessLevel: 'Read-Only',
          status: 'Active',
          lastAccessed: '10 mins ago',
          queries: 24
        },
        {
          id: 2,
          name: industry === 'banking' ? 'Core Banking System' : 'Production Control System',
          type: industry === 'banking' ? 'Legacy Database' : 'Industrial Database',
          category: industry === 'banking' ? 'accounts' : 'production',
          accessLevel: 'Read-Write',
          status: 'Active',
          lastAccessed: '2 hours ago',
          queries: 18
        },
        {
          id: 3,
          name: industry === 'banking' ? 'Transaction History Data Lake' : 'Process History Data Lake',
          type: 'Data Lake',
          category: industry === 'banking' ? 'transactions' : 'safety',
          accessLevel: 'Read-Only',
          status: 'Active',
          lastAccessed: '1 day ago',
          queries: 7
        },
        {
          id: 4,
          name: industry === 'banking' ? 'Credit Risk Assessment DB' : 'Quality Assessment Database',
          type: 'Analytics Database',
          category: industry === 'banking' ? 'loans' : 'quality',
          accessLevel: 'Read-Only',
          status: 'Restricted',
          lastAccessed: '5 days ago',
          queries: 2
        },
        {
          id: 5,
          name: industry === 'banking' ? 'Anti-Money Laundering System' : 'Environmental Compliance System',
          type: 'Compliance Database',
          category: 'compliance',
          accessLevel: 'Read-Only',
          status: 'Active',
          lastAccessed: '30 mins ago',
          queries: 42
        },
        {
          id: 6,
          name: industry === 'banking' ? 'Customer Analytics Warehouse' : 'Process Analytics Warehouse',
          type: 'Data Warehouse',
          category: 'analytics',
          accessLevel: 'Read-Only',
          status: 'Active',
          lastAccessed: '3 hours ago',
          queries: 15
        }
      ];
    }
  };
  
  // Initial industry-specific data sources
  const [dataSources, setDataSources] = useState(getInitialDataSources());

  // Update data sources when industry changes
  useEffect(() => {
    setDataSources(getInitialDataSources());
  }, [industry]);

  const form = useForm({
    defaultValues: {
      name: '',
      type: '',
      category: '',
      accessLevel: 'read-only',
    }
  });

  const handleAddDataSource = (data: any) => {
    const newDataSource = {
      id: dataSources.length + 1,
      name: data.name,
      type: data.type,
      category: data.category,
      accessLevel: ACCESS_LEVELS.find(level => level.id === data.accessLevel)?.name || 'Read-Only',
      status: 'Active',
      lastAccessed: 'Just now',
      queries: 0
    };
    
    setDataSources([...dataSources, newDataSource]);
    toast.success("Database connector added successfully!");
    form.reset();
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-gray-800/30 bg-gradient-to-br from-beam-dark-accent/70 to-beam-dark-accent/40 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border border-blue-500/20">
                <Database size={20} className="text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-medium text-white">
                  {industry === 'telco' ? 'Telecom Data Access Management' : industry === 'banking' ? 'Banking Data Access Management' : 'Industrial Data Access Management'}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Connect to {industry === 'telco' ? 'telecom-specific' : industry === 'banking' ? 'banking-specific' : 'industrial-specific'} data sources and systems
                </CardDescription>
              </div>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-beam-blue hover:bg-blue-600">
                  <Plus size={16} className="mr-2" />
                  Add Database
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-beam-dark-accent border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Database Connector</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Connect your agent to a {industry === 'telco' ? 'telecom' : industry === 'banking' ? 'banking' : 'industrial'} database or data source.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddDataSource)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Customer Transaction Database" 
                              className="bg-beam-dark border-gray-700" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Type</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={industry === 'banking' ? "Core Banking System, Data Warehouse, etc." : "Production Control System, Process Data Warehouse, etc."} 
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
                              {DATABASE_CATEGORIES.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-beam-dark border-gray-700">
                                <SelectValue placeholder="Select access level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-beam-dark border-gray-700">
                              {ACCESS_LEVELS.map(level => (
                                <SelectItem key={level.id} value={level.id}>
                                  {level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" className="bg-beam-blue hover:bg-blue-600">
                        Add Database
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Data Source Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-beam-dark/70 border border-gray-700/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={18} className="text-beam-blue" />
                    <CardTitle className="text-base font-medium text-white">Active Sources</CardTitle>
                  </div>
                  <div className="text-3xl font-bold text-white">{dataSources.filter(src => src.status === 'Active').length}</div>
                  <CardDescription className="text-gray-400">
                    Across {industry === 'telco' ? 'telecom' : industry === 'banking' ? 'banking' : 'industrial'} systems
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="bg-beam-dark/70 border border-gray-700/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-beam-blue" />
                    <CardTitle className="text-base font-medium text-white">Queries Today</CardTitle>
                  </div>
                  <div className="text-3xl font-bold text-white">{dataSources.reduce((sum, src) => sum + src.queries, 0)}</div>
                  <CardDescription className="text-gray-400">+12% from yesterday</CardDescription>
                </CardContent>
              </Card>
              
              <Card className="bg-beam-dark/70 border border-gray-700/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={18} className="text-beam-blue" />
                    <CardTitle className="text-base font-medium text-white">Compliance Status</CardTitle>
                  </div>
                  <div className="text-3xl font-bold text-green-400">Secure</div>
                  <CardDescription className="text-gray-400">
                    {industry === 'telco' ? 'Telecom regulations enforced' : industry === 'banking' ? 'Banking regulations enforced' : 'Industrial regulations enforced'}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
            
            {/* Data Sources Table */}
            <Card className="bg-beam-dark/70 border border-gray-700/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white">
                  {industry === 'telco' ? 'Telecom Data Sources' : industry === 'banking' ? 'Banking Data Sources' : 'Industrial Data Sources'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {industry === 'telco' ? 'Telecom-specific' : industry === 'banking' ? 'Banking-specific' : 'Industrial-specific'} data sources available to this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-white/5">
                        <TableHead className="text-white">Name</TableHead>
                        <TableHead className="text-white">Type</TableHead>
                        <TableHead className="text-white">Category</TableHead>
                        <TableHead className="text-white">Access Level</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Last Accessed</TableHead>
                        <TableHead className="text-white">Query Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataSources.map((source) => {
                        // Get the icon based on the category
                        const categoryInfo = DATABASE_CATEGORIES.find(cat => cat.id === source.category);
                        const IconComponent = categoryInfo?.icon || Database;
                        
                        return (
                          <TableRow key={source.id} className="hover:bg-white/5 border-white/10">
                            <TableCell className="font-medium text-white">{source.name}</TableCell>
                            <TableCell className="text-gray-300">{source.type}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <IconComponent size={14} className="text-blue-400" />
                                <span className="text-gray-300">{categoryInfo?.name || source.category}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`
                                ${source.accessLevel === 'Read-Only' ? 'bg-blue-900/20 text-blue-300 border-blue-600/30' : 
                                  source.accessLevel === 'Read-Write' ? 'bg-amber-900/20 text-amber-300 border-amber-600/30' : 
                                  source.accessLevel === 'Admin' ? 'bg-purple-900/20 text-purple-300 border-purple-600/30' :
                                  'bg-red-900/20 text-red-300 border-red-600/30'}
                              `}>
                                {source.accessLevel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                source.status === 'Active' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {source.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-gray-300">{source.lastAccessed}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-300">{source.queries}</span>
                                <Progress value={source.queries * 2} className="h-1.5 w-12" />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            {/* Data Access Policies */}
            <Card className="bg-beam-dark/70 border border-gray-700/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white">Industrial Data Access Policies</CardTitle>
                <CardDescription className="text-gray-400">
                  Industrial-specific enforced policies for data access and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-green-400" />
                      <span className="text-sm text-white">PII Data Masking (Customer Information)</span>
                      <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-600/30">Active</Badge>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 pl-6">
                      Automatically detects and masks customer personally identifiable information.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-green-400" />
                      <span className="text-sm text-white">Account Number Encryption</span>
                      <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-600/30">Active</Badge>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 pl-6">
                      All account numbers are encrypted and access is logged for audit trails.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-400" />
                      <span className="text-sm text-white">Transaction Amount Thresholds</span>
                      <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-600/30">Active</Badge>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 pl-6">
                      Large transaction data requires elevated access permissions and approval.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-400" />
                      <span className="text-sm text-white">Query Rate Limiting</span>
                      <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-600/30">Warning</Badge>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 pl-6">
                      Approaching query rate limit of 200/day (current: 143).
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-400" />
                      <span className="text-sm text-white">SOX & Basel III Compliance Logging</span>
                      <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-600/30">Active</Badge>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 pl-6">
                      All data access requests are logged for financial regulatory compliance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  RefreshCcw, 
  Eye, 
  Link2, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown,
  ArrowUpDown,
  FileCode,
  FileText,
  Share2,
  Code,
  User,
  Signal,
  Smartphone,
  Server,
  Clock,
  Shield,
  Settings,
  PlusCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DataLineageGraph } from '@/components/DataLineage';
import { DecisionPathGraph } from '@/components/DecisionPath';
import { toast } from '@/components/ui/use-toast';

import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';

// Telecom-specific data source categories
const DATA_CATEGORIES = [
  { 
    id: 'customer', 
    name: 'Customer Data', 
    description: 'Subscriber profiles, demographics, and account information',
    icon: User 
  },
  { 
    id: 'network', 
    name: 'Network Data', 
    description: 'Network performance, coverage, and quality metrics',
    icon: Signal
  },
  { 
    id: 'device', 
    name: 'Device Data', 
    description: 'Device types, capabilities, and usage patterns',
    icon: Smartphone 
  },
  { 
    id: 'service', 
    name: 'Service Data', 
    description: 'Service subscriptions, usage, and billing information',
    icon: Server 
  },
  { 
    id: 'temporal', 
    name: 'Temporal Data', 
    description: 'Historical usage patterns and time-series data',
    icon: Clock 
  },
  { 
    id: 'security', 
    name: 'Security Data', 
    description: 'Authentication, authorization, and compliance data',
    icon: Shield 
  }
];

// Mock data for data sources
const initialDataSources = [
  {
    id: 'DS1001',
    name: 'Subscriber Profiles DB',
    type: 'Database',
    description: 'PostgreSQL database containing subscriber profiles and demographics',
    category: 'customer',
    owner: 'Data Governance Team',
    accessLevel: 'Restricted',
    lastUpdated: '2023-11-15',
    refreshFrequency: 'Daily',
    status: 'Active',
    quality: 'High',
    schema: [
      { name: 'subscriber_id', type: 'INT', description: 'Unique subscriber identifier' },
      { name: 'name', type: 'VARCHAR', description: 'Subscriber name' },
      { name: 'age', type: 'INT', description: 'Subscriber age' },
      { name: 'location', type: 'VARCHAR', description: 'Subscriber location' },
    ],
    preview: [
      { subscriber_id: 1001, name: 'Alice Smith', age: 32, location: 'New York' },
      { subscriber_id: 1002, name: 'Bob Johnson', age: 45, location: 'Los Angeles' },
    ],
    lineage: true,
    metrics: [
      { name: 'Record Count', value: 5000000, unit: 'records' },
      { name: 'Average Age', value: 38.5, unit: 'years' },
    ],
  },
  {
    id: 'DS1002',
    name: 'Network Performance API',
    type: 'API',
    description: 'REST API providing real-time network performance metrics',
    category: 'network',
    owner: 'Network Operations',
    accessLevel: 'Public',
    lastUpdated: '2023-11-18',
    refreshFrequency: 'Real-time',
    status: 'Active',
    quality: 'Medium',
    schema: [
      { name: 'timestamp', type: 'TIMESTAMP', description: 'Timestamp of the metric' },
      { name: 'cell_id', type: 'VARCHAR', description: 'Cell identifier' },
      { name: 'latency', type: 'FLOAT', description: 'Network latency in ms' },
      { name: 'throughput', type: 'FLOAT', description: 'Network throughput in Mbps' },
    ],
    preview: [
      { timestamp: '2023-11-18 10:00:00', cell_id: 'CELL001', latency: 25.6, throughput: 45.2 },
      { timestamp: '2023-11-18 10:00:05', cell_id: 'CELL002', latency: 30.1, throughput: 50.5 },
    ],
    lineage: true,
    metrics: [
      { name: 'Average Latency', value: 28.3, unit: 'ms' },
      { name: 'Average Throughput', value: 47.8, unit: 'Mbps' },
    ],
  },
  {
    id: 'DS1003',
    name: 'Device Usage Logs',
    type: 'File',
    description: 'S3 bucket containing device usage logs in CSV format',
    category: 'device',
    owner: 'Device Management',
    accessLevel: 'Restricted',
    lastUpdated: '2023-11-10',
    refreshFrequency: 'Weekly',
    status: 'Maintenance',
    quality: 'Low',
    schema: [
      { name: 'device_id', type: 'VARCHAR', description: 'Device identifier' },
      { name: 'user_id', type: 'INT', description: 'User identifier' },
      { name: 'app_name', type: 'VARCHAR', description: 'Application name' },
      { name: 'usage_duration', type: 'INT', description: 'Usage duration in seconds' },
    ],
    preview: [
      { device_id: 'DEVICE001', user_id: 2001, app_name: 'Facebook', usage_duration: 3600 },
      { device_id: 'DEVICE002', user_id: 2002, app_name: 'YouTube', usage_duration: 7200 },
    ],
    lineage: false,
    metrics: [
      { name: 'Total Usage Duration', value: 1500000, unit: 'hours' },
      { name: 'Most Used App', value: 'YouTube', unit: null },
    ],
  },
  {
    id: 'DS1004',
    name: 'Service Subscription Data',
    type: 'Database',
    description: 'MySQL database containing service subscription details',
    category: 'service',
    owner: 'Service Management',
    accessLevel: 'Confidential',
    lastUpdated: '2023-11-20',
    refreshFrequency: 'Daily',
    status: 'Active',
    quality: 'High',
    schema: [
      { name: 'subscription_id', type: 'INT', description: 'Subscription identifier' },
      { name: 'user_id', type: 'INT', description: 'User identifier' },
      { name: 'service_name', type: 'VARCHAR', description: 'Service name' },
      { name: 'start_date', type: 'DATE', description: 'Subscription start date' },
      { name: 'end_date', type: 'DATE', description: 'Subscription end date' },
    ],
    preview: [
      { subscription_id: 3001, user_id: 1001, service_name: 'Premium Plan', start_date: '2023-01-01', end_date: '2023-12-31' },
      { subscription_id: 3002, user_id: 1002, service_name: 'Basic Plan', start_date: '2023-02-15', end_date: '2024-02-15' },
    ],
    lineage: true,
    metrics: [
      { name: 'Total Subscriptions', value: 1200000, unit: 'subscriptions' },
      { name: 'Churn Rate', value: 0.05, unit: 'rate' },
    ],
  },
  {
    id: 'DS1005',
    name: 'Customer Call Records',
    type: 'File',
    description: 'CSV files containing customer call records',
    category: 'temporal',
    owner: 'Customer Service',
    accessLevel: 'Restricted',
    lastUpdated: '2023-11-22',
    refreshFrequency: 'Daily',
    status: 'Active',
    quality: 'Medium',
    schema: [
      { name: 'call_id', type: 'VARCHAR', description: 'Call identifier' },
      { name: 'caller_id', type: 'VARCHAR', description: 'Caller identifier' },
      { name: 'receiver_id', type: 'VARCHAR', description: 'Receiver identifier' },
      { name: 'call_duration', type: 'INT', description: 'Call duration in seconds' },
      { name: 'call_timestamp', type: 'TIMESTAMP', description: 'Call timestamp' },
    ],
    preview: [
      { call_id: 'CALL001', caller_id: 'USER001', receiver_id: 'AGENT001', call_duration: 120, call_timestamp: '2023-11-22 09:00:00' },
      { call_id: 'CALL002', caller_id: 'USER002', receiver_id: 'AGENT002', call_duration: 300, call_timestamp: '2023-11-22 10:30:00' },
    ],
    lineage: false,
    metrics: [
      { name: 'Total Calls', value: 50000, unit: 'calls' },
      { name: 'Average Call Duration', value: 180, unit: 'seconds' },
    ],
  },
  {
    id: 'DS1006',
    name: 'Security Event Logs',
    type: 'Stream',
    description: 'Kafka stream containing security event logs',
    category: 'security',
    owner: 'Security Operations',
    accessLevel: 'Sensitive',
    lastUpdated: '2023-11-21',
    refreshFrequency: 'Real-time',
    status: 'Active',
    quality: 'High',
    schema: [
      { name: 'event_id', type: 'VARCHAR', description: 'Event identifier' },
      { name: 'event_type', type: 'VARCHAR', description: 'Event type' },
      { name: 'timestamp', type: 'TIMESTAMP', description: 'Event timestamp' },
      { name: 'source_ip', type: 'VARCHAR', description: 'Source IP address' },
      { name: 'destination_ip', type: 'VARCHAR', description: 'Destination IP address' },
    ],
    preview: [
      { event_id: 'EVT001', event_type: 'Login Failure', timestamp: '2023-11-21 14:00:00', source_ip: '192.168.1.100', destination_ip: '10.0.0.1' },
      { event_id: 'EVT002', event_type: 'Firewall Block', timestamp: '2023-11-21 14:00:05', source_ip: '192.168.1.101', destination_ip: '10.0.0.2' },
    ],
    lineage: true,
    metrics: [
      { name: 'Total Events', value: 1000000, unit: 'events' },
      { name: 'Failed Login Attempts', value: 5000, unit: 'attempts' },
    ],
  },
];

type DataSource = {
  id: string;
  name: string;
  type: string;
  description: string;
  category: string;
  owner: string;
  accessLevel: string;
  lastUpdated: string;
  refreshFrequency: string;
  status: string;
  quality: string;
  schema?: SchemaField[];
  preview?: any[];
  lineage?: boolean;
  metrics?: Metric[];
};

type SchemaField = {
  name: string;
  type: string;
  description: string;
};

type Metric = {
  name: string;
  value: number | string;
  unit: string | null;
};

type DataSourceView = 'schema' | 'preview' | 'lineage' | 'metrics';

export const DataSourcesTab = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [dataSourceView, setDataSourceView] = useState<DataSourceView>('schema');
  const [isAddingSource, setIsAddingSource] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: 'type' | 'name' | 'category' | 'accessLevel'; direction: 'asc' | 'desc' }>({ 
    key: 'name', 
    direction: 'asc' 
  });

  const form = useForm({
    defaultValues: {
      sourceName: '',
      sourceType: 'api',
      category: 'customer',
      accessLevel: 'restricted'
    }
  });

  const handleAddSource = (values: any) => {
    const newSource: DataSource = {
      id: `DS${Math.floor(Math.random() * 10000)}`,
      name: values.sourceName,
      type: values.sourceType,
      description: 'Custom data source',
      category: values.category,
      owner: 'User',
      accessLevel: values.accessLevel,
      lastUpdated: new Date().toLocaleDateString(),
      refreshFrequency: 'Manual',
      status: 'Active',
      quality: 'Medium'
    };
    setDataSources([...dataSources, newSource]);
    setIsAddingSource(false);
    toast({
      title: "Data Source Added",
      description: "New data source has been successfully added.",
    });
  };

  const handleRefreshConnections = () => {
    toast({
      title: "Refreshing Connections",
      description: "Data source connections are being refreshed. Please wait.",
    });
  };

  const getCategoryIcon = (categoryId: string): LucideIcon => {
    const category = DATA_CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || Database;
  };

  const sortedSources = [...dataSources].sort((a, b) => {
    if (sortConfig.key) {
      return sortConfig.direction === 'asc' 
        ? a[sortConfig.key].localeCompare(b[sortConfig.key]) 
        : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    }
    return 0;
  });

  // Sample mock data for DataLineageGraph
  const mockLineageNodes = [
    {
      id: 'node1',
      type: 'source',
      label: 'Source Data',
      content: 'Customer Data',
      position: { x: 50, y: 100 },
      operations: [
        { name: 'Extract', description: 'Extract data from source', status: 'success' as const, executionTime: '120ms' }
      ]
    },
    {
      id: 'node2',
      type: 'transform',
      label: 'Data Processing',
      content: 'Transform and clean',
      position: { x: 300, y: 100 },
      operations: [
        { name: 'Transform', description: 'Apply transformations', status: 'success' as const, executionTime: '85ms' }
      ]
    },
    {
      id: 'node3',
      type: 'destination',
      label: 'Data Warehouse',
      content: 'Stored Data',
      position: { x: 550, y: 100 },
      operations: [
        { name: 'Load', description: 'Load into warehouse', status: 'success' as const, executionTime: '150ms' }
      ]
    }
  ];

  const mockLineageEdges = [
    { source: 'node1', target: 'node2', type: 'dataflow' },
    { source: 'node2', target: 'node3', type: 'dataflow' }
  ];

  const mockLineageMetadata = {
    width: 800,
    height: 400,
    nodeSize: { width: 180, height: 100 },
    nodeTypes: {
      source: { color: '#3B82F6', icon: 'Database' },
      transform: { color: '#10B981', icon: 'RefreshCw' },
      destination: { color: '#8B5CF6', icon: 'HardDrive' }
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Sources Overview Card */}
      <Card className="shadow-lg border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white">Data Sources Management</CardTitle>
              <CardDescription className="text-gray-300">
                Connect, manage, and monitor all your telecom data sources
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-beam-blue hover:bg-blue-600">
                    <PlusCircle size={16} className="mr-1" />
                    New Connection
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-beam-dark border-gray-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Data Source</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Connect to a new data source or create a custom connector
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddSource)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="sourceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Source Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter a name for this data source" 
                                className="bg-beam-dark/70 border-gray-600" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-gray-500">
                              This name will be used to identify the data source in the system.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sourceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Source Type</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="bg-beam-dark/70 border-gray-600">
                                  <SelectValue placeholder="Select source type" />
                                </SelectTrigger>
                                <SelectContent className="bg-beam-dark border-gray-700">
                                  <SelectItem value="api">API</SelectItem>
                                  <SelectItem value="database">Database</SelectItem>
                                  <SelectItem value="file">File Storage</SelectItem>
                                  <SelectItem value="stream">Data Stream</SelectItem>
                                  <SelectItem value="custom">Custom Connector</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription className="text-gray-500">
                              The type of data source you want to connect to.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Category</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="bg-beam-dark/70 border-gray-600">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-beam-dark border-gray-700">
                                  {DATA_CATEGORIES.map(category => (
                                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription className="text-gray-500">
                              The category this data source belongs to.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="accessLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Access Level</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="bg-beam-dark/70 border-gray-600">
                                  <SelectValue placeholder="Select access level" />
                                </SelectTrigger>
                                <SelectContent className="bg-beam-dark border-gray-700">
                                  <SelectItem value="public">Public</SelectItem>
                                  <SelectItem value="restricted">Restricted</SelectItem>
                                  <SelectItem value="confidential">Confidential</SelectItem>
                                  <SelectItem value="sensitive">Sensitive</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription className="text-gray-500">
                              This determines who can access this data source.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit" className="bg-beam-blue hover:bg-blue-600">
                          Add Data Source
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" onClick={handleRefreshConnections}>
                <RefreshCcw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Data Sources Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Data Sources</p>
                  <h3 className="text-2xl font-semibold text-white mt-1">{dataSources.length}</h3>
                </div>
                <div className="p-2 bg-blue-900/30 rounded-full text-blue-400">
                  <Database size={18} />
                </div>
              </div>
            </div>
            
            <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">User Profile Sources</p>
                  <h3 className="text-2xl font-semibold text-white mt-1">12</h3>
                </div>
                <div className="p-2 bg-green-900/30 rounded-full text-green-400">
                  <User size={18} />
                </div>
              </div>
            </div>
            
            <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Real-time Feeds</p>
                  <h3 className="text-2xl font-semibold text-white mt-1">8</h3>
                </div>
                <div className="p-2 bg-amber-900/30 rounded-full text-amber-400">
                  <Clock size={18} />
                </div>
              </div>
            </div>
            
            <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Protected Sources</p>
                  <h3 className="text-2xl font-semibold text-white mt-1">27</h3>
                </div>
                <div className="p-2 bg-purple-900/30 rounded-full text-purple-400">
                  <Shield size={18} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Data Sources Table */}
          <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Available Data Sources</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search data sources..."
                    className="pl-10 bg-beam-dark/70 border-gray-600 w-64"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter size={16} />
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Category</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Owner</TableHead>
                    <TableHead className="text-white">Last Updated</TableHead>
                    <TableHead className="text-white">Quality</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Access</TableHead>
                    <TableHead className="text-white"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSources.map((source) => {
                    // Get the icon based on the category
                    const IconComponent = getCategoryIcon(source.category);
                    const categoryInfo = DATA_CATEGORIES.find(cat => cat.id === source.category);
                    
                    return (
                      <TableRow 
                        key={source.id} 
                        className={`border-gray-700 hover:bg-gray-800/30 cursor-pointer ${selectedDataSource?.id === source.id ? 'bg-gray-800/50' : ''}`}
                        onClick={() => setSelectedDataSource(source)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full ${
                              source.category === 'customer' ? 'bg-green-900/30 text-green-400' :
                              source.category === 'network' ? 'bg-blue-900/30 text-blue-400' :
                              source.category === 'device' ? 'bg-amber-900/30 text-amber-400' :
                              source.category === 'service' ? 'bg-purple-900/30 text-purple-400' :
                              source.category === 'temporal' ? 'bg-pink-900/30 text-pink-400' :
                              'bg-slate-900/30 text-slate-400'
                            }`}>
                              <IconComponent size={14} />
                            </div>
                            <span className="font-medium text-white">{source.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {categoryInfo?.name || source.category}
                        </TableCell>
                        <TableCell>
                          <Badge className={`
                            ${source.type === 'API' ? 'bg-blue-900/30 text-blue-400 border-blue-600' : 
                              source.type === 'Database' ? 'bg-green-900/30 text-green-400 border-green-600' :
                              source.type === 'File' ? 'bg-amber-900/30 text-amber-400 border-amber-600' :
                              'bg-purple-900/30 text-purple-400 border-purple-600'}
                          `}>
                            {source.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{source.owner}</TableCell>
                        <TableCell className="text-gray-300">{source.lastUpdated}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={source.quality === 'High' ? 90 : source.quality === 'Medium' ? 65 : 35} className="h-1.5 w-16" />
                            <span className={`text-xs font-medium ${
                              source.quality === 'High' ? 'text-green-400' : 
                              source.quality === 'Medium' ? 'text-amber-400' : 
                              'text-red-400'
                            }`}>{source.quality}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            source.status === 'Active' ? 'bg-green-900/30 text-green-400 border-green-600' : 
                            source.status === 'Maintenance' ? 'bg-amber-900/30 text-amber-400 border-amber-600' :
                            'bg-red-900/30 text-red-400 border-red-600'
                          }>
                            {source.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Lock size={14} className={
                              source.accessLevel === 'Public' ? 'text-green-400' :
                              source.accessLevel === 'Restricted' ? 'text-amber-400' :
                              source.accessLevel === 'Confidential' ? 'text-orange-400' :
                              'text-red-400'
                            } />
                            <span className="text-gray-300">{source.accessLevel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Eye size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Selected Data Source Details */}
          {selectedDataSource && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    selectedDataSource.category === 'customer' ? 'bg-green-900/30 text-green-400' :
                    selectedDataSource.category === 'network' ? 'bg-blue-900/30 text-blue-400' :
                    selectedDataSource.category === 'device' ? 'bg-amber-900/30 text-amber-400' :
                    selectedDataSource.category === 'service' ? 'bg-purple-900/30 text-purple-400' :
                    selectedDataSource.category === 'temporal' ? 'bg-pink-900/30 text-pink-400' :
                    'bg-slate-900/30 text-slate-400'
                  }`}>
                    {(() => {
                      const IconComponent = getCategoryIcon(selectedDataSource.category);
                      return <IconComponent size={18} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-white">{selectedDataSource.name}</h2>
                    <p className="text-gray-400">{selectedDataSource.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Tabs 
                    value={dataSourceView} 
                    onValueChange={(value: DataSourceView) => setDataSourceView(value)} 
                    className="w-auto"
                  >
                    <TabsList className="bg-beam-dark/70 border border-gray-700/50">
                      <TabsTrigger value="schema">Schema</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="lineage">Lineage</TabsTrigger>
                      <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button variant="outline" size="sm">
                    <Settings size={14} className="mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <h3 className="text-white font-medium mb-3">Security Details</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Access Level</dt>
                      <dd className="text-white flex items-center gap-1">
                        <Shield size={14} className={
                          selectedDataSource.accessLevel === 'Public' ? 'text-green-400' :
                          selectedDataSource.accessLevel === 'Restricted' ? 'text-amber-400' :
                          selectedDataSource.accessLevel === 'Confidential' ? 'text-orange-400' :
                          'text-red-400'
                        } />
                        {selectedDataSource.accessLevel}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Owner</dt>
                      <dd className="text-white">{selectedDataSource.owner}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Last Updated</dt>
                      <dd className="text-white">{selectedDataSource.lastUpdated}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <h3 className="text-white font-medium mb-3">Connection Details</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Type</dt>
                      <dd className="text-white flex items-center gap-1">
                        <Smartphone size={14} />
                        {selectedDataSource.type}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Status</dt>
                      <dd className="text-white">
                        <Badge className={
                          selectedDataSource.status === 'Active' ? 'bg-green-900/30 text-green-400 border-green-600' : 
                          selectedDataSource.status === 'Maintenance' ? 'bg-amber-900/30 text-amber-400 border-amber-600' :
                          'bg-red-900/30 text-red-400 border-red-600'
                        }>
                          {selectedDataSource.status}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Refresh</dt>
                      <dd className="text-white">{selectedDataSource.refreshFrequency}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <h3 className="text-white font-medium mb-3">Quality Metrics</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Overall Quality</dt>
                      <dd className="text-white">
                        <div className="flex items-center gap-2">
                          <Progress value={selectedDataSource.quality === 'High' ? 90 : selectedDataSource.quality === 'Medium' ? 65 : 35} className="h-1.5 w-16" />
                          <span className={`text-xs font-medium ${
                            selectedDataSource.quality === 'High' ? 'text-green-400' : 
                            selectedDataSource.quality === 'Medium' ? 'text-amber-400' : 
                            'text-red-400'
                          }`}>{selectedDataSource.quality}</span>
                        </div>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Completeness</dt>
                      <dd className="text-white">
                        <Progress value={75} className="h-1.5 w-16" />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Accuracy</dt>
                      <dd className="text-white">
                        <Progress value={85} className="h-1.5 w-16" />
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <h3 className="text-white font-medium mb-3">Usage Stats</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Services Using</dt>
                      <dd className="text-white">8</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Last Accessed</dt>
                      <dd className="text-white">Today</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Query Count</dt>
                      <dd className="text-white">1,204</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Data Source Content Tabs */}
              <TabsContent value="schema" className="pt-3">
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-medium">Schema Definition</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileCode size={14} className="mr-1" />
                        Export DDL
                      </Button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-white">Field Name</TableHead>
                          <TableHead className="text-white">Type</TableHead>
                          <TableHead className="text-white">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDataSource.schema?.map((field, index) => (
                          <TableRow key={index} className="border-gray-700">
                            <TableCell className="font-medium text-white">{field.name}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-900/30 text-blue-400 border-blue-600">
                                {field.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">{field.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="pt-3">
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-medium">Data Preview</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText size={14} className="mr-1" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                  
                  {selectedDataSource.preview && selectedDataSource.preview.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            {Object.keys(selectedDataSource.preview[0]).map((key) => (
                              <TableHead key={key} className="text-white">{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedDataSource.preview.map((row, rowIdx) => (
                            <TableRow key={rowIdx} className="border-gray-700">
                              {Object.values(row).map((value, cellIdx) => (
                                <TableCell key={cellIdx} className="text-gray-300">
                                  {String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No preview data available for this source
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="lineage" className="pt-3">
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-medium">Data Lineage</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Share2 size={14} className="mr-1" />
                        Export Diagram
                      </Button>
                    </div>
                  </div>
                  
                  {selectedDataSource.lineage ? (
                    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 min-h-[400px]">
                      <DataLineageGraph 
                        nodes={mockLineageNodes}
                        edges={mockLineageEdges}
                        metadata={mockLineageMetadata}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No lineage information available for this source
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="metrics" className="pt-3">
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-medium">Data Metrics</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Code size={14} className="mr-1" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                  
                  {selectedDataSource.metrics && selectedDataSource.metrics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDataSource.metrics.map((metric, index) => (
                        <div key={index} className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                          <h4 className="text-gray-300 mb-1">{metric.name}</h4>
                          <div className="flex items-end gap-2">
                            <span className="text-2xl font-semibold text-white">{metric.value}</span>
                            {metric.unit && <span className="text-gray-400 text-sm">{metric.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No metrics available for this source
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

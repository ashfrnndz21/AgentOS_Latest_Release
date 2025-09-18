
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Download, RefreshCw, AlertOctagon, DollarSign, ShoppingCart, PackageCheck, LogOut, BarChart2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Model performance data
const churnModelData = [
  { month: 'Jan', precision: 82, recall: 78, f1: 80, baseline: 70 },
  { month: 'Feb', precision: 83, recall: 79, f1: 81, baseline: 70 },
  { month: 'Mar', precision: 84, recall: 80, f1: 82, baseline: 70 },
  { month: 'Apr', precision: 83, recall: 81, f1: 82, baseline: 70 },
  { month: 'May', precision: 85, recall: 82, f1: 83, baseline: 70 },
  { month: 'Jun', precision: 86, recall: 83, f1: 84, baseline: 70 },
];

// Sample list of propensity models
const propensityModels = [
  { 
    id: 'M001', 
    name: 'Churn Prediction', 
    icon: LogOut, 
    type: 'Classification', 
    accuracy: 86, 
    lastUpdated: '2023-05-10', 
    dataSources: ['Customer Database', 'Usage Patterns', 'Payment History'],
    features: 85,
    dataPoints: '4.5M',
    status: 'Active'
  },
  { 
    id: 'M002', 
    name: 'Postpaid Plan Propensity', 
    icon: DollarSign,
    type: 'Classification', 
    accuracy: 82, 
    lastUpdated: '2023-05-05', 
    dataSources: ['Customer Database', 'Campaign History', 'Service Usage'],
    features: 72,
    dataPoints: '2.8M',
    status: 'Active'
  },
  { 
    id: 'M003', 
    name: 'Prepaid Plan Propensity', 
    icon: ShoppingCart,
    type: 'Classification', 
    accuracy: 84, 
    lastUpdated: '2023-05-02', 
    dataSources: ['Customer Database', 'Recharge Patterns', 'Service Usage'],
    features: 68,
    dataPoints: '3.2M',
    status: 'Active'
  },
  { 
    id: 'M004', 
    name: 'Add-on Purchase Propensity', 
    icon: PackageCheck,
    type: 'Classification', 
    accuracy: 79, 
    lastUpdated: '2023-04-28', 
    dataSources: ['Customer Database', 'Service Usage', 'App Behavior'],
    features: 64,
    dataPoints: '3.8M',
    status: 'Active'
  },
  { 
    id: 'M005', 
    name: 'Risk of Default', 
    icon: AlertOctagon,
    type: 'Classification', 
    accuracy: 88, 
    lastUpdated: '2023-04-25', 
    dataSources: ['Payment History', 'Credit Score', 'Customer Database'],
    features: 78,
    dataPoints: '2.1M',
    status: 'Active'
  },
];

// Top predictive features for churn
const churnFeatures = [
  { name: 'Service Calls (last 30 days)', importance: 18 },
  { name: 'Bill Amount Variability', importance: 16 },
  { name: 'Tenure (months)', importance: 14 },
  { name: 'Payment Delays (last 6 months)', importance: 12 },
  { name: 'Data Usage Trend', importance: 10 },
  { name: 'Network Drops (last 30 days)', importance: 9 },
  { name: 'Contract Type', importance: 8 },
  { name: 'Device Age', importance: 7 },
  { name: 'Competitor Offers (region)', importance: 6 },
];

// Sample customer predictions
const customerPredictions = [
  { 
    id: '1001', 
    name: 'Alex Johnson', 
    segment: 'High Value', 
    churnScore: 0.12, 
    postpaidScore: 0.85, 
    prepaidScore: 0.15, 
    addOnScore: 0.67 
  },
  { 
    id: '1002', 
    name: 'Samantha Lee', 
    segment: 'High Value', 
    churnScore: 0.08, 
    postpaidScore: 0.92, 
    prepaidScore: 0.05, 
    addOnScore: 0.78 
  },
  { 
    id: '1003', 
    name: 'David Wilson', 
    segment: 'Medium Value', 
    churnScore: 0.45, 
    postpaidScore: 0.38, 
    prepaidScore: 0.62, 
    addOnScore: 0.29 
  },
  { 
    id: '1004', 
    name: 'Mei Zhang', 
    segment: 'Low Value', 
    churnScore: 0.75, 
    postpaidScore: 0.22, 
    prepaidScore: 0.78, 
    addOnScore: 0.15 
  },
  { 
    id: '1005', 
    name: 'James Brown', 
    segment: 'New Customers', 
    churnScore: 0.35, 
    postpaidScore: 0.65, 
    prepaidScore: 0.35, 
    addOnScore: 0.48 
  },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const PropensityModelsTab = () => {
  const [selectedModel, setSelectedModel] = useState(propensityModels[0]);
  const [modelView, setModelView] = useState('performance');

  const handleRefreshModel = () => {
    toast({
      title: "Model Refresh Initiated",
      description: "The model is being refreshed with the latest data. This may take a few minutes.",
    });
  };

  const handleExportInsights = () => {
    toast({
      title: "Export Started",
      description: "Propensity model insights are being exported in CSV format.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white">Propensity Models</CardTitle>
              <CardDescription className="text-gray-300">
                Track and leverage ML models for customer behavior prediction
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefreshModel}>
                <RefreshCw size={16} className="mr-1" />
                Refresh Models
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportInsights}>
                <Download size={16} className="mr-1" />
                Export Insights
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Model Selection Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
            {propensityModels.map(model => (
              <Card 
                key={model.id} 
                className={`
                  bg-beam-dark/70 border border-gray-700/30 hover:border-gray-500/50 transition-colors cursor-pointer
                  ${selectedModel.id === model.id ? 'border-beam-blue/50 shadow-md shadow-beam-blue/10' : ''}
                `}
                onClick={() => setSelectedModel(model)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`
                        p-1.5 rounded-md ${
                          model.name.includes('Churn') ? 'bg-red-900/20 text-red-400' : 
                          model.name.includes('Postpaid') ? 'bg-blue-900/20 text-blue-400' : 
                          model.name.includes('Prepaid') ? 'bg-green-900/20 text-green-400' : 
                          model.name.includes('Add-on') ? 'bg-purple-900/20 text-purple-400' : 
                          'bg-amber-900/20 text-amber-400'
                        }
                      `}>
                        <model.icon size={16} />
                      </div>
                      <span className="font-medium text-white">{model.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mb-2">
                    <span>{model.type}</span>
                    <span className="text-gray-600">•</span>
                    <span>Updated {model.lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">{model.accuracy}% accuracy</span>
                    <Progress value={model.accuracy} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Selected Model Details */}
          {selectedModel && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium text-white flex items-center gap-2">
                    <div className={`
                      p-1.5 rounded-md ${
                        selectedModel.name.includes('Churn') ? 'bg-red-900/20 text-red-400' : 
                        selectedModel.name.includes('Postpaid') ? 'bg-blue-900/20 text-blue-400' : 
                        selectedModel.name.includes('Prepaid') ? 'bg-green-900/20 text-green-400' : 
                        selectedModel.name.includes('Add-on') ? 'bg-purple-900/20 text-purple-400' : 
                        'bg-amber-900/20 text-amber-400'
                      }
                    `}>
                      <selectedModel.icon size={18} />
                    </div>
                    {selectedModel.name}
                  </h2>
                  <p className="text-gray-400">Model ID: {selectedModel.id}</p>
                </div>
                <div className="flex gap-2">
                  <Tabs value={modelView} onValueChange={setModelView} className="w-auto">
                    <TabsList className="bg-beam-dark/70 border border-gray-700/50">
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                      <TabsTrigger value="predictions">Predictions</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              
              {/* Model Performance View */}
              <TabsContent value="performance" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Model Stats */}
                  <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Model Statistics</h3>
                    <dl className="space-y-4">
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Accuracy:</dt>
                        <dd className="font-medium text-white">{selectedModel.accuracy}%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Data Sources:</dt>
                        <dd className="font-medium text-white">{selectedModel.dataSources.length}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Features:</dt>
                        <dd className="font-medium text-white">{selectedModel.features}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Data Points:</dt>
                        <dd className="font-medium text-white">{selectedModel.dataPoints}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Last Updated:</dt>
                        <dd className="font-medium text-white">{selectedModel.lastUpdated}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Status:</dt>
                        <dd className="font-medium text-green-400">{selectedModel.status}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  {/* Performance Chart */}
                  <div className="lg:col-span-2 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Performance Metrics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={churnModelData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="month" stroke="#aaa" />
                        <YAxis stroke="#aaa" domain={[60, 90]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} 
                          formatter={(value) => [`${value}%`, '']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="precision" 
                          name="Precision" 
                          stroke="#0088FE" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="recall" 
                          name="Recall" 
                          stroke="#00C49F" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="f1" 
                          name="F1 Score" 
                          stroke="#FFBB28" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="baseline" 
                          name="Baseline" 
                          stroke="#FF8042" 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Data Sources */}
                  <div className="lg:col-span-3 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Data Sources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedModel.dataSources.map((source, index) => (
                        <Card key={index} className="bg-beam-dark border border-gray-700/30">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{index + 1}</Badge>
                              <h4 className="text-white font-medium">{source}</h4>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Connection:</span>
                                <span className="text-green-400">Active</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Records:</span>
                                <span className="text-white">{(Math.random() * 5 + 1).toFixed(1)}M</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Last Sync:</span>
                                <span className="text-white">3 hours ago</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Features View */}
              <TabsContent value="features" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Feature Importance Chart */}
                  <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Feature Importance</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        layout="vertical"
                        data={churnFeatures}
                        margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
                        <XAxis type="number" stroke="#aaa" />
                        <YAxis dataKey="name" type="category" stroke="#aaa" width={110} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} 
                          formatter={(value) => [`${value}%`, 'Importance']}
                        />
                        <Bar dataKey="importance" name="Importance" fill="#0088FE">
                          {churnFeatures.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Feature Correlations */}
                  <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Feature Correlation Strength</h3>
                    <div className="space-y-4">
                      {churnFeatures.map((feature, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-white">{feature.name}</span>
                            <span className="text-gray-300">{feature.importance}%</span>
                          </div>
                          <Progress value={feature.importance * 5} className="h-2" 
                            style={{
                              background: 'linear-gradient(90deg, rgba(0,136,254,0.2) 0%, rgba(0,196,159,0.2) 50%, rgba(255,187,40,0.2) 100%)',
                            }}
                          />
                          <div className="text-xs text-gray-400">
                            {index === 0 && 'Higher call volumes strongly indicate dissatisfaction'}
                            {index === 1 && 'Unexpected bill changes are a key churn indicator'}
                            {index === 2 && 'Longer-tenured customers are less likely to churn'}
                            {index === 3 && 'Frequent payment issues predict churn risk'}
                            {index === 4 && 'Decreasing data usage often precedes churn'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Feature Engineering */}
                  <div className="lg:col-span-2 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Feature Engineering Insights</h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-900/10 border border-blue-600/20 rounded-lg">
                        <h4 className="text-white font-medium mb-1">Data Transformations</h4>
                        <p className="text-gray-300 text-sm">
                          Key features undergo log transformation to normalize distributions. Customer tenure, ARPU metrics, and usage patterns are standardized with z-score normalization to improve model reliability.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-900/10 border border-green-600/20 rounded-lg">
                        <h4 className="text-white font-medium mb-1">Time-based Features</h4>
                        <p className="text-gray-300 text-sm">
                          Rolling 30-day and 90-day aggregations of usage metrics, network quality indicators, and customer service interactions provide time-sensitive predictors of changing customer behavior.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-purple-900/10 border border-purple-600/20 rounded-lg">
                        <h4 className="text-white font-medium mb-1">Categorical Encoding</h4>
                        <p className="text-gray-300 text-sm">
                          One-hot encoding is applied to location data, service plans, and device types. Target encoding is used for high-cardinality variables like cell tower IDs to maintain predictive power while reducing dimensionality.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-amber-900/10 border border-amber-600/20 rounded-lg">
                        <h4 className="text-white font-medium mb-1">Interaction Features</h4>
                        <p className="text-gray-300 text-sm">
                          Custom interaction terms between network quality metrics and customer service contacts revealed strong predictive patterns. Similarly, combinations of payment behavior and service plan changes significantly improved model performance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Predictions View */}
              <TabsContent value="predictions" className="m-0">
                <div className="space-y-6">
                  {/* Customer Predictions Table */}
                  <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Individual Customer Predictions</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-white">ID</TableHead>
                            <TableHead className="text-white">Customer Name</TableHead>
                            <TableHead className="text-white">Segment</TableHead>
                            <TableHead className="text-white">Churn Risk</TableHead>
                            <TableHead className="text-white">Postpaid Propensity</TableHead>
                            <TableHead className="text-white">Prepaid Propensity</TableHead>
                            <TableHead className="text-white">Add-on Propensity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerPredictions.map((customer) => (
                            <TableRow key={customer.id} className="border-gray-700 hover:bg-gray-800/30">
                              <TableCell className="text-white">{customer.id}</TableCell>
                              <TableCell className="text-white">{customer.name}</TableCell>
                              <TableCell>
                                <Badge className={`
                                  ${customer.segment === 'High Value' ? 'bg-green-900/30 text-green-400 border-green-600' : 
                                    customer.segment === 'Medium Value' ? 'bg-blue-900/30 text-blue-400 border-blue-600' :
                                    customer.segment === 'Low Value' ? 'bg-amber-900/30 text-amber-400 border-amber-600' :
                                    'bg-purple-900/30 text-purple-400 border-purple-600'}
                                `}>
                                  {customer.segment}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={customer.churnScore * 100} 
                                    className="h-2 w-16"
                                    style={{
                                      background: 'linear-gradient(90deg, rgba(34,197,94,0.2) 0%, rgba(234,179,8,0.2) 50%, rgba(239,68,68,0.2) 100%)',
                                    }}
                                  />
                                  <span className={
                                    customer.churnScore < 0.3 ? 'text-green-400' : 
                                    customer.churnScore < 0.6 ? 'text-amber-400' : 
                                    'text-red-400'
                                  }>
                                    {(customer.churnScore * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={customer.postpaidScore * 100} className="h-2 w-16 bg-blue-900/20" />
                                  <span className="text-white">{(customer.postpaidScore * 100).toFixed(0)}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={customer.prepaidScore * 100} className="h-2 w-16 bg-green-900/20" />
                                  <span className="text-white">{(customer.prepaidScore * 100).toFixed(0)}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={customer.addOnScore * 100} className="h-2 w-16 bg-purple-900/20" />
                                  <span className="text-white">{(customer.addOnScore * 100).toFixed(0)}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-between mt-4">
                      <div className="text-sm text-gray-400">Showing 5 of 4,500,000 customers</div>
                      <Button variant="outline" size="sm">
                        <Download size={14} className="mr-1" />
                        Export Predictions
                      </Button>
                    </div>
                  </div>
                  
                  {/* Aggregate Predictions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                      <h3 className="text-white font-medium mb-4">Segment-level Propensities</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={[
                            { name: 'High Value', churn: 12, postpaid: 85, prepaid: 15, addon: 62 },
                            { name: 'Medium Value', churn: 28, postpaid: 65, prepaid: 35, addon: 48 },
                            { name: 'Low Value', churn: 45, postpaid: 30, prepaid: 70, addon: 25 },
                            { name: 'New Customers', churn: 32, postpaid: 52, prepaid: 48, addon: 44 },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="name" stroke="#aaa" angle={-45} textAnchor="end" height={60} />
                          <YAxis stroke="#aaa" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} />
                          <Legend />
                          <Bar dataKey="churn" name="Churn Risk %" fill="#ff4d4f" />
                          <Bar dataKey="postpaid" name="Postpaid %" fill="#0088FE" />
                          <Bar dataKey="prepaid" name="Prepaid %" fill="#00C49F" />
                          <Bar dataKey="addon" name="Add-on %" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                      <h3 className="text-white font-medium mb-4">Score Distribution</h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white">Churn Risk Distribution</span>
                            <span className="text-gray-400">Mean: 28%</span>
                          </div>
                          <div className="h-8 rounded-md bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
                            <div className="absolute inset-0 flex">
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5"></div>
                            </div>
                            <div className="absolute bottom-full left-[28%] transform -translate-x-1/2 mb-1">
                              <div className="w-1 h-3 bg-white mx-auto"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>0%</span>
                            <span>20%</span>
                            <span>40%</span>
                            <span>60%</span>
                            <span>80%</span>
                            <span>100%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white">Postpaid Propensity Distribution</span>
                            <span className="text-gray-400">Mean: 58%</span>
                          </div>
                          <div className="h-8 rounded-md bg-gradient-to-r from-gray-500 via-blue-400 to-blue-600 relative">
                            <div className="absolute inset-0 flex">
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5"></div>
                            </div>
                            <div className="absolute bottom-full left-[58%] transform -translate-x-1/2 mb-1">
                              <div className="w-1 h-3 bg-white mx-auto"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>0%</span>
                            <span>20%</span>
                            <span>40%</span>
                            <span>60%</span>
                            <span>80%</span>
                            <span>100%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white">Add-on Propensity Distribution</span>
                            <span className="text-gray-400">Mean: 45%</span>
                          </div>
                          <div className="h-8 rounded-md bg-gradient-to-r from-gray-500 via-purple-400 to-purple-600 relative">
                            <div className="absolute inset-0 flex">
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5 border-r border-gray-700/50"></div>
                              <div className="w-1/5"></div>
                            </div>
                            <div className="absolute bottom-full left-[45%] transform -translate-x-1/2 mb-1">
                              <div className="w-1 h-3 bg-white mx-auto"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>0%</span>
                            <span>20%</span>
                            <span>40%</span>
                            <span>60%</span>
                            <span>80%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

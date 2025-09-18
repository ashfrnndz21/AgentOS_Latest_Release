
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Users, Download, SlidersHorizontal, Save, Filter, BarChart2, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Mock segment data
const segmentData = [
  { name: 'High Value', value: 28, count: 1260000, arpu: 42, churn: 5, tenure: 48 },
  { name: 'Medium Value', value: 35, count: 1575000, arpu: 28, churn: 12, tenure: 24 },
  { name: 'Low Value', value: 22, count: 990000, arpu: 15, churn: 20, tenure: 12 },
  { name: 'New Customers', value: 15, count: 675000, arpu: 22, churn: 25, tenure: 3 },
];

const barChartData = [
  { name: 'High Value', prepaid: 320000, postpaid: 940000 },
  { name: 'Medium Value', prepaid: 875000, postpaid: 700000 },
  { name: 'Low Value', prepaid: 790000, postpaid: 200000 },
  { name: 'New Customers', prepaid: 475000, postpaid: 200000 },
];

// Customer distribution by service type
const serviceTypeData = [
  { name: 'Voice Only', value: 15 },
  { name: 'Data Only', value: 25 },
  { name: 'Voice & Data', value: 40 },
  { name: 'Voice, Data & VAS', value: 20 },
];

// Sample customer data
const customers = [
  { id: '1001', name: 'Alex Johnson', segment: 'High Value', arpu: 45, tenure: 36, churn: 'Low', dataUsage: '12GB', services: 'Voice, Data, VAS', lastRecharge: '2023-05-01' },
  { id: '1002', name: 'Samantha Lee', segment: 'High Value', arpu: 38, tenure: 48, churn: 'Low', dataUsage: '15GB', services: 'Voice, Data, VAS', lastRecharge: '2023-05-03' },
  { id: '1003', name: 'David Wilson', segment: 'Medium Value', arpu: 25, tenure: 24, churn: 'Medium', dataUsage: '8GB', services: 'Voice & Data', lastRecharge: '2023-04-28' },
  { id: '1004', name: 'Mei Zhang', segment: 'Low Value', arpu: 18, tenure: 12, churn: 'High', dataUsage: '3GB', services: 'Data Only', lastRecharge: '2023-04-15' },
  { id: '1005', name: 'James Brown', segment: 'New Customers', arpu: 22, tenure: 2, churn: 'Medium', dataUsage: '5GB', services: 'Voice & Data', lastRecharge: '2023-05-05' },
];

export const SegmentationTab = () => {
  const [viewMode, setViewMode] = useState<'chart' | 'pie' | 'table'>('chart');
  const [selectedFilters, setSelectedFilters] = useState({
    segment: 'all',
    arpuMin: 0,
    arpuMax: 50,
    tenureMin: 0,
    tenureMax: 60,
  });

  const handleRunSegmentation = () => {
    toast({
      title: "Segmentation Analysis Complete",
      description: "Customer segments have been updated based on your criteria.",
    });
  };

  const handleSaveSegment = () => {
    toast({
      title: "Segment Saved",
      description: "Your custom segment definition has been saved for future use.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Customer segment data is being exported to CSV format.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Segmentation Controls */}
      <Card className="shadow-lg border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white">Customer Segmentation Analysis</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('chart')} className={viewMode === 'chart' ? 'bg-beam-blue/20' : ''}>
                <BarChart2 size={16} className="mr-1" />
                Bar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('pie')} className={viewMode === 'pie' ? 'bg-beam-blue/20' : ''}>
                <PieChartIcon size={16} className="mr-1" />
                Pie
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('table')} className={viewMode === 'table' ? 'bg-beam-blue/20' : ''}>
                <Users size={16} className="mr-1" />
                Table
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Segment</label>
              <Select defaultValue="all" onValueChange={(value) => setSelectedFilters({...selectedFilters, segment: value})}>
                <SelectTrigger className="bg-beam-dark/70 border-gray-700">
                  <SelectValue placeholder="All Segments" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="high">High Value</SelectItem>
                  <SelectItem value="medium">Medium Value</SelectItem>
                  <SelectItem value="low">Low Value</SelectItem>
                  <SelectItem value="new">New Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Service Type</label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-beam-dark/70 border-gray-700">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="voice">Voice Only</SelectItem>
                  <SelectItem value="data">Data Only</SelectItem>
                  <SelectItem value="voice-data">Voice & Data</SelectItem>
                  <SelectItem value="full">Voice, Data & VAS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">ARPU Range ($ per month)</label>
              <div className="pl-2 pr-4">
                <Slider 
                  defaultValue={[0, 50]} 
                  max={50} 
                  step={1} 
                  onValueChange={(value) => setSelectedFilters({...selectedFilters, arpuMin: value[0], arpuMax: value[1]})}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>${selectedFilters.arpuMin}</span>
                  <span>${selectedFilters.arpuMax}</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Tenure (months)</label>
              <div className="pl-2 pr-4">
                <Slider 
                  defaultValue={[0, 60]} 
                  max={60} 
                  step={1}
                  onValueChange={(value) => setSelectedFilters({...selectedFilters, tenureMin: value[0], tenureMax: value[1]})}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{selectedFilters.tenureMin}m</span>
                  <span>{selectedFilters.tenureMax}m</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-end gap-2">
              <Button className="bg-beam-blue hover:bg-blue-600" onClick={handleRunSegmentation}>
                <SlidersHorizontal size={16} className="mr-2" />
                Run Segmentation
              </Button>
              <Button variant="outline">
                <Filter size={16} className="mr-1" />
                More Filters
              </Button>
            </div>
          </div>
          
          {/* Visualization Section */}
          <div className="space-y-6">
            {viewMode === 'chart' && (
              <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                <h3 className="text-white font-medium mb-4">Customer Segments by Service Type</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} 
                      formatter={(value) => [`${value.toLocaleString()} subscribers`, '']}
                    />
                    <Legend />
                    <Bar dataKey="prepaid" name="Prepaid" fill="#0088FE" />
                    <Bar dataKey="postpaid" name="Postpaid" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={handleSaveSegment}>
                    <Save size={14} className="mr-1" />
                    Save View
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download size={14} className="mr-1" />
                    Export Data
                  </Button>
                </div>
              </div>
            )}
            
            {viewMode === 'pie' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <h3 className="text-white font-medium mb-4">Customer Value Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                  <h3 className="text-white font-medium mb-4">Customer Service Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {viewMode === 'table' && (
              <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                <h3 className="text-white font-medium mb-4">Customer Details</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-white">ID</TableHead>
                        <TableHead className="text-white">Customer Name</TableHead>
                        <TableHead className="text-white">Segment</TableHead>
                        <TableHead className="text-white">ARPU ($)</TableHead>
                        <TableHead className="text-white">Tenure (m)</TableHead>
                        <TableHead className="text-white">Churn Risk</TableHead>
                        <TableHead className="text-white">Data Usage</TableHead>
                        <TableHead className="text-white">Services</TableHead>
                        <TableHead className="text-white">Last Recharge</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
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
                          <TableCell className="text-white">${customer.arpu}</TableCell>
                          <TableCell className="text-white">{customer.tenure}</TableCell>
                          <TableCell>
                            <Badge className={`
                              ${customer.churn === 'Low' ? 'bg-green-900/30 text-green-400 border-green-600' : 
                                customer.churn === 'Medium' ? 'bg-amber-900/30 text-amber-400 border-amber-600' :
                                'bg-red-900/30 text-red-400 border-red-600'}
                            `}>
                              {customer.churn}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{customer.dataUsage}</TableCell>
                          <TableCell className="text-white">{customer.services}</TableCell>
                          <TableCell className="text-white">{customer.lastRecharge}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="text-sm text-gray-400">Showing 5 of 4,500,000 customers</div>
                  <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download size={14} className="mr-1" />
                    Export Data
                  </Button>
                </div>
              </div>
            )}
            
            {/* Segment Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {segmentData.map((segment, index) => (
                <Card key={index} className={`
                  bg-beam-dark/70 border-l-4 ${
                    index === 0 ? 'border-l-green-500' : 
                    index === 1 ? 'border-l-blue-500' : 
                    index === 2 ? 'border-l-amber-500' : 
                    'border-l-purple-500'
                  } border-t-0 border-r-0 border-b-0 rounded-tr-lg rounded-br-lg
                `}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white">{segment.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Subscribers:</dt>
                        <dd className="font-medium text-white">{segment.count.toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Avg. ARPU:</dt>
                        <dd className="font-medium text-white">${segment.arpu}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Churn Rate:</dt>
                        <dd className="font-medium text-white">{segment.churn}%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Avg. Tenure:</dt>
                        <dd className="font-medium text-white">{segment.tenure} months</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

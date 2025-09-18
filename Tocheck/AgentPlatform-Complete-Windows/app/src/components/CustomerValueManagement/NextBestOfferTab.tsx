
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, TrendingUp, Download, PlusCircle, Database, Filter, BarChart2, ChevronRight, Play, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Mock data for offers
const offers = [
  { 
    id: 'NBO001', 
    name: 'Premium 5G Upgrade', 
    type: 'Upsell', 
    targetSegment: 'High Value', 
    conversionRate: 8.2, 
    revenueImpact: 'High',
    priority: 95,
    arpu: '+$15/mo',
    retention: '+18%'
  },
  { 
    id: 'NBO002', 
    name: 'Family Plan Bundle', 
    type: 'Cross-sell', 
    targetSegment: 'Medium Value', 
    conversionRate: 6.5, 
    revenueImpact: 'High',
    priority: 88,
    arpu: '+$28/mo',
    retention: '+22%'
  },
  { 
    id: 'NBO003', 
    name: 'International Calling Pack', 
    type: 'Add-on', 
    targetSegment: 'High Value', 
    conversionRate: 7.8, 
    revenueImpact: 'Medium',
    priority: 82,
    arpu: '+$10/mo',
    retention: '+8%'
  },
  { 
    id: 'NBO004', 
    name: 'Extended Data Bundle', 
    type: 'Upsell', 
    targetSegment: 'Medium Value', 
    conversionRate: 5.1, 
    revenueImpact: 'Medium',
    priority: 78,
    arpu: '+$12/mo',
    retention: '+14%'
  },
  { 
    id: 'NBO005', 
    name: 'Premium Content Subscription', 
    type: 'Add-on', 
    targetSegment: 'All Segments', 
    conversionRate: 4.2, 
    revenueImpact: 'Medium',
    priority: 75,
    arpu: '+$9/mo',
    retention: '+7%'
  },
  { 
    id: 'NBO006', 
    name: 'Loyalty Discount Bundle', 
    type: 'Retention', 
    targetSegment: 'At Risk', 
    conversionRate: 12.5, 
    revenueImpact: 'Low',
    priority: 92,
    arpu: '-$5/mo',
    retention: '+35%'
  },
];

// Sample customer recommendations
const customerRecommendations = [
  { 
    id: '1001', 
    name: 'Alex Johnson', 
    segment: 'High Value', 
    primaryOffer: 'Premium 5G Upgrade',
    secondaryOffer: 'International Calling Pack',
    churnRisk: 'Low',
    lifetime: '$2,450',
    lastContact: '7 days ago'
  },
  { 
    id: '1002', 
    name: 'Samantha Lee', 
    segment: 'High Value', 
    primaryOffer: 'Family Plan Bundle',
    secondaryOffer: 'Premium Content Subscription',
    churnRisk: 'Low',
    lifetime: '$3,200',
    lastContact: '14 days ago'
  },
  { 
    id: '1003', 
    name: 'David Wilson', 
    segment: 'Medium Value', 
    primaryOffer: 'Extended Data Bundle',
    secondaryOffer: 'Premium Content Subscription',
    churnRisk: 'Medium',
    lifetime: '$1,850',
    lastContact: '5 days ago'
  },
  { 
    id: '1004', 
    name: 'Mei Zhang', 
    segment: 'Low Value', 
    primaryOffer: 'Loyalty Discount Bundle',
    secondaryOffer: 'Premium Content Subscription',
    churnRisk: 'High',
    lifetime: '$780',
    lastContact: '3 days ago'
  },
  { 
    id: '1005', 
    name: 'James Brown', 
    segment: 'New Customers', 
    primaryOffer: 'Extended Data Bundle',
    secondaryOffer: 'Premium Content Subscription',
    churnRisk: 'Medium',
    lifetime: '$950',
    lastContact: '1 day ago'
  },
];

// Offer comparison data
const offerRadarData = [
  { attribute: 'Conversion', NBO001: 82, NBO002: 65, NBO003: 78, fullmark: 100 },
  { attribute: 'Revenue', NBO001: 90, NBO002: 85, NBO003: 60, fullmark: 100 },
  { attribute: 'Retention', NBO001: 75, NBO002: 88, NBO003: 50, fullmark: 100 },
  { attribute: 'Cost', NBO001: 65, NBO002: 55, NBO003: 45, fullmark: 100 },
  { attribute: 'Customer Satisfaction', NBO001: 85, NBO002: 80, NBO003: 70, fullmark: 100 },
];

// Channel efficacy data
const channelData = [
  { channel: 'SMS', efficacy: 78, volume: 520000 },
  { channel: 'Email', efficacy: 65, volume: 780000 },
  { channel: 'App Notification', efficacy: 82, volume: 620000 },
  { channel: 'Call Center', efficacy: 92, volume: 180000 },
  { channel: 'Web Portal', efficacy: 58, volume: 420000 },
];

export const NextBestOfferTab = () => {
  const [selectedOffer, setSelectedOffer] = useState(offers[0]);
  const [offerView, setOfferView] = useState('overview');

  const handleCreateOffer = () => {
    toast({
      title: "Create New Offer",
      description: "Offer creation workflow started.",
    });
  };

  const handleRunSimulation = () => {
    toast({
      title: "Simulation Started",
      description: "NBO engine simulation is running. Results will be available shortly.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "NBO recommendations are being exported to CSV format.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white">Next Best Offer Engine</CardTitle>
              <CardDescription className="text-gray-300">
                Automated offer optimization and arbitration for personalized customer recommendations
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button className="bg-beam-blue hover:bg-blue-600" onClick={handleCreateOffer}>
                <Gift size={16} className="mr-1" />
                Create New Offer
              </Button>
              <Button variant="outline" size="sm" onClick={handleRunSimulation}>
                <Play size={16} className="mr-1" />
                Run Simulation
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* NBO Filter Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Offer Type</label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-beam-dark/70 border-gray-700">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="upsell">Upsell</SelectItem>
                  <SelectItem value="cross-sell">Cross-sell</SelectItem>
                  <SelectItem value="add-on">Add-on</SelectItem>
                  <SelectItem value="retention">Retention</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Target Segment</label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-beam-dark/70 border-gray-700">
                  <SelectValue placeholder="All Segments" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="high">High Value</SelectItem>
                  <SelectItem value="medium">Medium Value</SelectItem>
                  <SelectItem value="low">Low Value</SelectItem>
                  <SelectItem value="new">New Customers</SelectItem>
                  <SelectItem value="risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Revenue Impact</label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-beam-dark/70 border-gray-700">
                  <SelectValue placeholder="All Impact Levels" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="all">All Impact Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Priority</label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-beam-dark/70 border-gray-700">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent className="bg-beam-dark border-gray-700">
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority (90+)</SelectItem>
                  <SelectItem value="medium">Medium Priority (75-90)</SelectItem>
                  <SelectItem value="low">Low Priority (Below 75)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Offers Table */}
          <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30 mb-6">
            <h3 className="text-white font-medium mb-4">Active Offer Catalog</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-white">ID</TableHead>
                    <TableHead className="text-white">Offer Name</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Target Segment</TableHead>
                    <TableHead className="text-white">Conversion</TableHead>
                    <TableHead className="text-white">Revenue Impact</TableHead>
                    <TableHead className="text-white">Priority Score</TableHead>
                    <TableHead className="text-white">ARPU Change</TableHead>
                    <TableHead className="text-white">Retention Effect</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow 
                      key={offer.id} 
                      className={`border-gray-700 hover:bg-gray-800/30 cursor-pointer ${selectedOffer.id === offer.id ? 'bg-gray-800/50' : ''}`}
                      onClick={() => setSelectedOffer(offer)}
                    >
                      <TableCell className="text-white">{offer.id}</TableCell>
                      <TableCell className="text-white font-medium">{offer.name}</TableCell>
                      <TableCell>
                        <Badge className={`
                          ${offer.type === 'Upsell' ? 'bg-blue-900/30 text-blue-400 border-blue-600' : 
                            offer.type === 'Cross-sell' ? 'bg-green-900/30 text-green-400 border-green-600' :
                            offer.type === 'Add-on' ? 'bg-purple-900/30 text-purple-400 border-purple-600' :
                            'bg-amber-900/30 text-amber-400 border-amber-600'}
                        `}>
                          {offer.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{offer.targetSegment}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-white">{offer.conversionRate}%</span>
                          <Progress value={offer.conversionRate * 8} className="h-1.5 w-12" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`
                          ${offer.revenueImpact === 'High' ? 'bg-green-900/30 text-green-400 border-green-600' : 
                            offer.revenueImpact === 'Medium' ? 'bg-blue-900/30 text-blue-400 border-blue-600' :
                            'bg-amber-900/30 text-amber-400 border-amber-600'}
                        `}>
                          {offer.revenueImpact}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-white">{offer.priority}</span>
                          <Progress 
                            value={offer.priority} 
                            className="h-1.5 w-12"
                            style={{
                              background: 'linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(234,179,8,0.2) 50%, rgba(34,197,94,0.2) 100%)',
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className={`font-medium ${offer.arpu.startsWith('+') ? 'text-green-400' : 'text-amber-400'}`}>
                        {offer.arpu}
                      </TableCell>
                      <TableCell className="text-green-400 font-medium">
                        {offer.retention}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm" onClick={handleCreateOffer}>
                <PlusCircle size={14} className="mr-1" />
                Add New Offer
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download size={14} className="mr-1" />
                Export Catalog
              </Button>
            </div>
          </div>
          
          {/* Selected Offer Details */}
          {selectedOffer && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium text-white flex items-center gap-2">
                    <Gift size={18} className="text-beam-blue" />
                    {selectedOffer.name}
                  </h2>
                  <p className="text-gray-400">Offer ID: {selectedOffer.id}</p>
                </div>
                <div className="flex gap-2">
                  <Tabs value={offerView} onValueChange={setOfferView} className="w-auto">
                    <TabsList className="bg-beam-dark/70 border border-gray-700/50">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="comparison">Comparison</TabsTrigger>
                      <TabsTrigger value="channels">Channels</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              
              {/* Offer Overview View */}
              <TabsContent value="overview" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Offer Details */}
                  <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Offer Details</h3>
                    <dl className="space-y-4">
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Offer Type:</dt>
                        <dd className="font-medium text-white">{selectedOffer.type}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Target Segment:</dt>
                        <dd className="font-medium text-white">{selectedOffer.targetSegment}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Conversion Rate:</dt>
                        <dd className="font-medium text-white">{selectedOffer.conversionRate}%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">ARPU Change:</dt>
                        <dd className={`font-medium ${selectedOffer.arpu.startsWith('+') ? 'text-green-400' : 'text-amber-400'}`}>
                          {selectedOffer.arpu}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Retention Effect:</dt>
                        <dd className="font-medium text-green-400">{selectedOffer.retention}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Priority Score:</dt>
                        <dd className="font-medium text-white">{selectedOffer.priority}/100</dd>
                      </div>
                    </dl>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="lg:col-span-2 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Performance By Segment</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={[
                          { segment: 'High Value', conversion: selectedOffer.id === 'NBO001' ? 9.2 : selectedOffer.id === 'NBO003' ? 8.4 : 7.5 },
                          { segment: 'Medium Value', conversion: selectedOffer.id === 'NBO002' ? 8.5 : selectedOffer.id === 'NBO004' ? 7.2 : 5.8 },
                          { segment: 'Low Value', conversion: selectedOffer.id === 'NBO006' ? 7.4 : 4.2 },
                          { segment: 'New Customers', conversion: selectedOffer.id === 'NBO005' ? 6.8 : 5.4 },
                          { segment: 'At Risk', conversion: selectedOffer.id === 'NBO006' ? 14.5 : 6.2 },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="segment" stroke="#aaa" angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#aaa" label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft', style: { fill: '#aaa' } }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} />
                        <Bar dataKey="conversion" name="Conversion Rate (%)" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Customer Recommendations Table */}
                  <div className="lg:col-span-3 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">Customer Recommendations</h3>
                      <Button variant="outline" size="sm">
                        <Filter size={14} className="mr-1" />
                        Filter
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-white">ID</TableHead>
                            <TableHead className="text-white">Customer Name</TableHead>
                            <TableHead className="text-white">Segment</TableHead>
                            <TableHead className="text-white">Churn Risk</TableHead>
                            <TableHead className="text-white">Primary Offer</TableHead>
                            <TableHead className="text-white">Secondary Offer</TableHead>
                            <TableHead className="text-white">Lifetime Value</TableHead>
                            <TableHead className="text-white">Last Contact</TableHead>
                            <TableHead className="text-white">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customerRecommendations.map((customer) => (
                            <TableRow key={customer.id} className="border-gray-700 hover:bg-gray-800/30">
                              <TableCell className="text-white">{customer.id}</TableCell>
                              <TableCell className="text-white font-medium">{customer.name}</TableCell>
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
                                <Badge className={`
                                  ${customer.churnRisk === 'Low' ? 'bg-green-900/30 text-green-400 border-green-600' : 
                                    customer.churnRisk === 'Medium' ? 'bg-amber-900/30 text-amber-400 border-amber-600' :
                                    'bg-red-900/30 text-red-400 border-red-600'}
                                `}>
                                  {customer.churnRisk}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-blue-600/30 text-blue-400 font-normal">
                                  {customer.primaryOffer}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-gray-600/30 text-gray-400 font-normal">
                                  {customer.secondaryOffer}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white">{customer.lifetime}</TableCell>
                              <TableCell className="text-gray-400">{customer.lastContact}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ChevronRight size={14} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-between mt-4">
                      <div className="text-sm text-gray-400">Showing 5 of 12,500 recommendations</div>
                      <Button variant="outline" size="sm" onClick={handleExportData}>
                        <Download size={14} className="mr-1" />
                        Export Recommendations
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Offer Comparison View */}
              <TabsContent value="comparison" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar Comparison Chart */}
                  <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Offer Comparison</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart outerRadius={150} data={offerRadarData}>
                        <PolarGrid stroke="#444" />
                        <PolarAngleAxis dataKey="attribute" stroke="#aaa" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#aaa" />
                        <Radar name="Premium 5G Upgrade" dataKey="NBO001" stroke="#0088FE" fill="#0088FE" fillOpacity={0.2} />
                        <Radar name="Family Plan Bundle" dataKey="NBO002" stroke="#00C49F" fill="#00C49F" fillOpacity={0.2} />
                        <Radar name="International Calling Pack" dataKey="NBO003" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.2} />
                        <Legend />
                        <Tooltip contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Offer Priority Chart */}
                  <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Offer Priority Ranking</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        layout="vertical"
                        data={[
                          { name: 'Premium 5G Upgrade', value: 95 },
                          { name: 'Loyalty Discount Bundle', value: 92 },
                          { name: 'Family Plan Bundle', value: 88 },
                          { name: 'International Calling Pack', value: 82 },
                          { name: 'Extended Data Bundle', value: 78 },
                          { name: 'Premium Content Subscription', value: 75 },
                        ]}
                        margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
                        <XAxis type="number" stroke="#aaa" domain={[70, 100]} />
                        <YAxis dataKey="name" type="category" stroke="#aaa" width={110} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} 
                          formatter={(value) => [`${value} priority score`, '']}
                        />
                        <Bar dataKey="value" name="Priority Score" fill="#0088FE">
                          {offers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* NBO Engine Logic */}
                  <div className="lg:col-span-2 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">NBO Engine Arbitration Logic</h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-900/10 border border-blue-600/20 rounded-lg">
                        <h4 className="text-white font-medium mb-1">Customer Profile Analysis</h4>
                        <p className="text-gray-300 text-sm">
                          The NBO engine first analyzes the complete customer profile, including service history, usage patterns, payment behavior, and demographics. This information is combined with propensity model scores to determine customer needs and preferences.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-900/10 border border-green-600/20 rounded-lg">
                        <h4 className="text-white font-medium mb-1">Objective Function</h4>
                        <p className="text-gray-300 text-sm">
                          Recommendations are prioritized based on a weighted objective function that considers revenue impact (40%), conversion likelihood (30%), retention effect (20%), and strategic alignment (10%). This ensures that offers maximize both customer value and business outcomes.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-purple-900/10 border border-purple-600/20 rounded-lg">
                        <h4 className="text-white font-medium mb-1">Contextual Relevance</h4>
                        <p className="text-gray-300 text-sm">
                          The system evaluates the timing and context for each offer. For example, international calling packages are prioritized for customers who recently made international calls, while family plans are suggested for customers with multiple lines.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-amber-900/10 border border-amber-600/20 rounded-lg">
                        <h4 className="text-white font-medium mb-1">Fallback Logic</h4>
                        <p className="text-gray-300 text-sm">
                          If a customer has declined primary offers multiple times, the system automatically switches to alternative categories. For customers with high churn risk, retention offers take precedence over upsell recommendations regardless of potential revenue.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Channel Optimization View */}
              <TabsContent value="channels" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Channel Efficacy Chart */}
                  <div className="lg:col-span-2 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Channel Performance for Offers</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={channelData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="channel" stroke="#aaa" />
                        <YAxis yAxisId="left" orientation="left" stroke="#0088FE" label={{ value: 'Efficacy (%)', angle: -90, position: 'insideLeft', style: { fill: '#0088FE' } }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#FFBB28" label={{ value: 'Volume', angle: 90, position: 'insideRight', style: { fill: '#FFBB28' } }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="efficacy" name="Response Rate (%)" fill="#0088FE" />
                        <Bar yAxisId="right" dataKey="volume" name="Volume" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Channel Recommendations */}
                  <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Optimal Channel Mix</h3>
                    <div className="space-y-4">
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-white font-medium mb-1">Primary Channel</dt>
                          <dd className="text-gray-300 flex items-center gap-2">
                            <Badge className="bg-green-900/30 text-green-400 border-green-600">Call Center</Badge>
                            <span className="text-sm">92% efficacy</span>
                          </dd>
                        </div>
                        
                        <div>
                          <dt className="text-white font-medium mb-1">Secondary Channel</dt>
                          <dd className="text-gray-300 flex items-center gap-2">
                            <Badge className="bg-blue-900/30 text-blue-400 border-blue-600">App Notification</Badge>
                            <span className="text-sm">82% efficacy</span>
                          </dd>
                        </div>
                        
                        <div>
                          <dt className="text-white font-medium mb-1">Tertiary Channel</dt>
                          <dd className="text-gray-300 flex items-center gap-2">
                            <Badge className="bg-purple-900/30 text-purple-400 border-purple-600">SMS</Badge>
                            <span className="text-sm">78% efficacy</span>
                          </dd>
                        </div>
                      </dl>
                      
                      <div className="pt-3 border-t border-gray-700/30">
                        <h4 className="text-white font-medium mb-2">Channel Strategy</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-green-400 flex-shrink-0"></div>
                            <span>Use call center for high-value customers and premium offers</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                            <span>App notifications for tech-savvy users and immediate offers</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-purple-400 flex-shrink-0"></div>
                            <span>SMS for time-sensitive and location-based promotions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-amber-400 flex-shrink-0"></div>
                            <span>Email for detailed offers with supporting information</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Multi-channel Campaign Design */}
                  <div className="lg:col-span-3 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
                    <h3 className="text-white font-medium mb-4">Multi-channel Campaign Design</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Badge>1</Badge>
                          Initial Contact
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-blue-900/30 text-blue-400 border-blue-600">App Notification</Badge>
                            <span className="text-gray-300">Initial awareness</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Personalized app notification based on recent customer activity, highlighting key offer benefits.
                          </p>
                          <div className="pt-2 border-t border-gray-700/30 text-xs text-gray-400">
                            Timing: Day 1
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Badge>2</Badge>
                          Detailed Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-purple-900/30 text-purple-400 border-purple-600">Email</Badge>
                            <span className="text-gray-300">Feature details</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Comprehensive email with complete offer details, personalized savings calculator, and testimonials.
                          </p>
                          <div className="pt-2 border-t border-gray-700/30 text-xs text-gray-400">
                            Timing: Day 2 (morning)
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Badge>3</Badge>
                          Reminder
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-amber-900/30 text-amber-400 border-amber-600">SMS</Badge>
                            <span className="text-gray-300">Quick reminder</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Brief SMS with limited-time offer reminder and direct activation link or code.
                          </p>
                          <div className="pt-2 border-t border-gray-700/30 text-xs text-gray-400">
                            Timing: Day 3 (afternoon)
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Badge>4</Badge>
                          Direct Engagement
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-green-900/30 text-green-400 border-green-600">Call Center</Badge>
                            <span className="text-gray-300">Personal discussion</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Targeted outbound call to high-value customers who showed interest but haven't converted.
                          </p>
                          <div className="pt-2 border-t border-gray-700/30 text-xs text-gray-400">
                            Timing: Day 5 (for selected customers)
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Badge>5</Badge>
                          Final Opportunity
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-red-900/30 text-red-400 border-red-600">Multi-channel</Badge>
                            <span className="text-gray-300">Last chance</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Final reminder through primary channel with enhanced offer value for 24-hour limited time.
                          </p>
                          <div className="pt-2 border-t border-gray-700/30 text-xs text-gray-400">
                            Timing: Day 7 (offer expiry)
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Badge>6</Badge>
                          Analysis & Optimization
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className="bg-gray-900/30 text-gray-400 border-gray-600">Internal</Badge>
                            <span className="text-gray-300">Performance review</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Campaign performance analysis and optimization for future campaigns based on channel efficacy.
                          </p>
                          <div className="pt-2 border-t border-gray-700/30 text-xs text-gray-400">
                            Timing: Day 10-14
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        <FileText size={14} className="mr-1" />
                        Campaign Template
                      </Button>
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

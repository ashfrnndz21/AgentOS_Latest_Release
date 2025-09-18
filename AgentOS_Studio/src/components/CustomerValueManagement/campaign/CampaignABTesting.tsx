
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { TestTube, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CampaignType } from './types';
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CampaignABTestingProps {
  selectedCampaign: CampaignType;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'Running' | 'Completed' | 'Draft';
  startDate: string;
  endDate: string;
  variants: {
    id: string;
    name: string;
    description: string;
    metrics: {
      impressions: number;
      clicks: number;
      conversions: number;
      conversionRate: number;
      revenue: number;
    };
  }[];
}

export const CampaignABTesting = ({ selectedCampaign }: CampaignABTestingProps) => {
  const [activeTest, setActiveTest] = useState<ABTest | null>(null);
  
  // Mock A/B test data
  const tests: ABTest[] = [
    {
      id: 'test1',
      name: 'Offer Message Variation',
      description: 'Testing different messaging approaches for the main offer',
      status: 'Running',
      startDate: '2023-05-10',
      endDate: '2023-06-10',
      variants: [
        {
          id: 'var1',
          name: 'Price-focused',
          description: 'Emphasize cost savings and value',
          metrics: {
            impressions: 25000,
            clicks: 1250,
            conversions: 175,
            conversionRate: 7.0,
            revenue: 87500,
          },
        },
        {
          id: 'var2',
          name: 'Benefits-focused',
          description: 'Emphasize product benefits and features',
          metrics: {
            impressions: 25000,
            clicks: 1375,
            conversions: 165,
            conversionRate: 6.6,
            revenue: 82500,
          },
        },
      ],
    },
    {
      id: 'test2',
      name: 'Call-to-Action Test',
      description: 'Testing different CTA button texts and colors',
      status: 'Completed',
      startDate: '2023-04-15',
      endDate: '2023-05-15',
      variants: [
        {
          id: 'var1',
          name: 'Direct CTA',
          description: '"Get Started" with blue button',
          metrics: {
            impressions: 30000,
            clicks: 1800,
            conversions: 216,
            conversionRate: 7.2,
            revenue: 108000,
          },
        },
        {
          id: 'var2',
          name: 'FOMO CTA',
          description: '"Don\'t Miss Out" with orange button',
          metrics: {
            impressions: 30000,
            clicks: 1650,
            conversions: 165,
            conversionRate: 5.5,
            revenue: 82500,
          },
        },
      ],
    },
  ];

  const handleCreateTest = () => {
    toast({
      title: "A/B Test Created",
      description: "New A/B test has been created for this campaign.",
    });
  };

  const handleSelectTest = (test: ABTest) => {
    setActiveTest(test);
  };

  // Convert test data to chart format
  const getChartData = (test: ABTest) => {
    return test.variants.map(variant => ({
      name: variant.name,
      clickRate: (variant.metrics.clicks / variant.metrics.impressions) * 100,
      conversionRate: variant.metrics.conversionRate,
      revenuePerImpression: variant.metrics.revenue / variant.metrics.impressions,
    }));
  };

  // Determine the winning variant
  const getWinningVariant = (test: ABTest) => {
    if (test.status !== 'Completed') return null;
    
    return test.variants.reduce((prev, current) => 
      (current.metrics.conversionRate > prev.metrics.conversionRate) ? current : prev, 
      test.variants[0]
    );
  };

  return (
    <Card className="border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TestTube size={18} />
            A/B Testing
          </CardTitle>
          
          <Button 
            className="bg-beam-blue hover:bg-blue-600 text-white" 
            size="sm"
            onClick={handleCreateTest}
          >
            Create A/B Test
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTest ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">{activeTest.name}</h3>
                <p className="text-gray-400 text-sm">{activeTest.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 h-8"
                onClick={() => setActiveTest(null)}
              >
                Back to all tests
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded p-3">
                <h4 className="text-gray-400 text-sm">Status</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2 w-2 rounded-full ${
                    activeTest.status === 'Running' ? 'bg-green-400' :
                    activeTest.status === 'Completed' ? 'bg-blue-400' :
                    'bg-gray-400'
                  }`}></span>
                  <span className="text-white">{activeTest.status}</span>
                </div>
              </div>
              
              <div className="bg-gray-800/30 border border-gray-700/50 rounded p-3">
                <h4 className="text-gray-400 text-sm">Timeline</h4>
                <div className="text-white mt-1">
                  {activeTest.startDate} <ArrowRight size={12} className="inline mx-1" /> {activeTest.endDate}
                </div>
              </div>
              
              <div className="bg-gray-800/30 border border-gray-700/50 rounded p-3">
                <h4 className="text-gray-400 text-sm">Variants</h4>
                <div className="text-white mt-1">{activeTest.variants.length} variants</div>
              </div>
            </div>
            
            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData(activeTest)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fill: '#aaa' }} />
                  <YAxis tick={{ fill: '#aaa' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value.toFixed(2)}`, '']}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Bar dataKey="clickRate" name="Click Rate %" fill="#3b82f6" />
                  <Bar dataKey="conversionRate" name="Conversion Rate %" fill="#10b981" />
                  <Bar dataKey="revenuePerImpression" name="Revenue per Impression ($)" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              {activeTest.variants.map(variant => {
                const isWinner = getWinningVariant(activeTest)?.id === variant.id;
                
                return (
                  <div 
                    key={variant.id} 
                    className={`border rounded-lg p-4 ${
                      isWinner 
                        ? 'border-green-600/50 bg-green-900/10' 
                        : 'border-gray-700/50 bg-gray-800/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        {variant.name}
                        {isWinner && (
                          <span className="flex items-center text-green-400 text-xs gap-1">
                            <CheckCircle2 size={12} />
                            Winner
                          </span>
                        )}
                      </h4>
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        Variant {activeTest.variants.findIndex(v => v.id === variant.id) + 1}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mt-1">{variant.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div>
                        <div className="text-gray-400 text-xs">Impressions</div>
                        <div className="text-white">{variant.metrics.impressions.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Clicks</div>
                        <div className="text-white">{variant.metrics.clicks.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Conversions</div>
                        <div className="text-white">{variant.metrics.conversions.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Conversion Rate</div>
                        <div className="text-white">{variant.metrics.conversionRate}%</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-gray-400 text-xs">Revenue</div>
                        <div className="text-white">${variant.metrics.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map(test => (
                <div 
                  key={test.id}
                  className="border border-gray-700/50 rounded-lg p-4 bg-gray-800/30 cursor-pointer hover:bg-gray-800/50"
                  onClick={() => handleSelectTest(test)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-medium">{test.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      test.status === 'Running' ? 'bg-green-900/50 text-green-400' :
                      test.status === 'Completed' ? 'bg-blue-900/50 text-blue-400' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mt-1">{test.description}</p>
                  
                  <div className="flex justify-between mt-3 text-sm">
                    <div className="text-gray-400">
                      {test.startDate} - {test.endDate}
                    </div>
                    <div className="text-white">
                      {test.variants.length} variants
                    </div>
                  </div>
                  
                  {test.status === 'Completed' && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Winner:</span>
                        <span className="text-sm text-green-400 flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          {getWinningVariant(test)?.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CampaignType, PerformanceDataType } from '../types';

interface PerformanceTabProps {
  selectedCampaign: CampaignType;
  performanceData: PerformanceDataType[];
}

export const PerformanceTab = ({ selectedCampaign, performanceData }: PerformanceTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Campaign KPIs */}
      <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
        <h3 className="text-white font-medium mb-4">Campaign KPIs</h3>
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="text-gray-400">Target Size:</dt>
            <dd className="font-medium text-white">{selectedCampaign.targetSize.toLocaleString()} subscribers</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Conversion Rate:</dt>
            <dd className="font-medium text-white">{selectedCampaign.conversion}%</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">ROI:</dt>
            <dd className="font-medium text-white">{selectedCampaign.roi}x</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Revenue Generated:</dt>
            <dd className="font-medium text-white">${(selectedCampaign.revenue / 1000000).toFixed(2)}M</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Campaign Cost:</dt>
            <dd className="font-medium text-white">${(selectedCampaign.cost / 1000000).toFixed(2)}M</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Net Profit:</dt>
            <dd className="font-medium text-green-400">${((selectedCampaign.revenue - selectedCampaign.cost) / 1000000).toFixed(2)}M</dd>
          </div>
        </dl>
      </div>
      
      {/* Performance Chart */}
      <div className="lg:col-span-2 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
        <h3 className="text-white font-medium mb-4">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={performanceData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="conversion" 
              name="Conversion Rate (%)" 
              stroke="#0088FE" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="roi" 
              name="ROI (x)" 
              stroke="#00C49F" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="targetConversion" 
              name="Target Conversion (%)" 
              stroke="#FF8042" 
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

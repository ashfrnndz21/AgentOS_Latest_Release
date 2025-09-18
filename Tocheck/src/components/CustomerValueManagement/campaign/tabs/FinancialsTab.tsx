
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CampaignType } from '../types';

interface FinancialsTabProps {
  selectedCampaign: CampaignType;
}

export const FinancialsTab = ({ selectedCampaign }: FinancialsTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Financial Summary */}
      <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
        <h3 className="text-white font-medium mb-4">Financial Summary</h3>
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="text-gray-400">Total Revenue:</dt>
            <dd className="font-medium text-white">${(selectedCampaign.revenue / 1000000).toFixed(2)}M</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Total Cost:</dt>
            <dd className="font-medium text-white">${(selectedCampaign.cost / 1000000).toFixed(2)}M</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Net Profit:</dt>
            <dd className="font-medium text-green-400">${((selectedCampaign.revenue - selectedCampaign.cost) / 1000000).toFixed(2)}M</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">ROI:</dt>
            <dd className="font-medium text-white">{selectedCampaign.roi}x</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Cost per Acquisition:</dt>
            <dd className="font-medium text-white">
              ${(selectedCampaign.cost / (selectedCampaign.targetSize * (Number(selectedCampaign.conversion) / 100))).toFixed(2)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Lifetime Value (est.):</dt>
            <dd className="font-medium text-white">
              ${((selectedCampaign.revenue / (selectedCampaign.targetSize * (Number(selectedCampaign.conversion) / 100))) * 3).toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>
      
      {/* Revenue Breakdown */}
      <div className="lg:col-span-2 bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
        <h3 className="text-white font-medium mb-4">Revenue vs Cost Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { 
                name: 'High Value', 
                revenue: selectedCampaign.revenue * 0.35, 
                cost: selectedCampaign.cost * 0.3 
              },
              { 
                name: 'Medium Value', 
                revenue: selectedCampaign.revenue * 0.25, 
                cost: selectedCampaign.cost * 0.35 
              },
              { 
                name: 'Low Value', 
                revenue: selectedCampaign.revenue * 0.15, 
                cost: selectedCampaign.cost * 0.15 
              },
              { 
                name: 'New Customers', 
                revenue: selectedCampaign.revenue * 0.1, 
                cost: selectedCampaign.cost * 0.1 
              },
              { 
                name: 'At Risk', 
                revenue: selectedCampaign.revenue * 0.15, 
                cost: selectedCampaign.cost * 0.1 
              },
            ]}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#aaa" angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#aaa" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }}
              formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`, '']}
            />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
            <Bar dataKey="cost" name="Cost" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

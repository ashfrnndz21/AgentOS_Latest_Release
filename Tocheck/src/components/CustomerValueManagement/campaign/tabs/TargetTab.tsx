
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TargetBreakdownType {
  name: string;
  value: number;
}

interface TargetTabProps {
  targetBreakdown: TargetBreakdownType[];
  colors: string[];
}

export const TargetTab = ({ targetBreakdown, colors }: TargetTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Target Breakdown */}
      <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
        <h3 className="text-white font-medium mb-4">Target Segment Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={targetBreakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {targetBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Percentage']}
              contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Target Response */}
      <div className="bg-beam-dark/70 p-4 rounded-lg border border-gray-700/30">
        <h3 className="text-white font-medium mb-4">Segment Response Rates</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: 'High Value', response: 7.8 },
              { name: 'Medium Value', response: 5.5 },
              { name: 'Low Value', response: 3.2 },
              { name: 'New Customers', response: 4.4 },
              { name: 'At Risk', response: 6.7 },
            ]}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#aaa" angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#aaa" label={{ value: 'Response Rate (%)', angle: -90, position: 'insideLeft', style: { fill: '#aaa' } }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#444', color: '#fff' }} />
            <Bar dataKey="response" name="Response Rate (%)" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

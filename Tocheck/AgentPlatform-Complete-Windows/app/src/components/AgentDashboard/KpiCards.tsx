
import React from 'react';
import { BarChart2, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export const KpiCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-beam-dark-accent/70 border-gray-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={18} className="text-beam-blue" />
            <CardTitle className="text-base font-medium">Active Agents</CardTitle>
          </div>
          <div className="text-3xl font-bold">24</div>
          <CardDescription className="text-gray-400">Across 5 departments</CardDescription>
        </CardContent>
      </Card>
      
      <Card className="bg-beam-dark-accent/70 border-gray-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} className="text-beam-blue" />
            <CardTitle className="text-base font-medium">Governance Status</CardTitle>
          </div>
          <div className="text-3xl font-bold text-green-400">Strong</div>
          <CardDescription className="text-gray-400">All policies enforced</CardDescription>
        </CardContent>
      </Card>
      
      <Card className="bg-beam-dark-accent/70 border-gray-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-beam-blue" />
            <CardTitle className="text-base font-medium">Issues</CardTitle>
          </div>
          <div className="text-3xl font-bold text-amber-400">2</div>
          <CardDescription className="text-gray-400">Require attention</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

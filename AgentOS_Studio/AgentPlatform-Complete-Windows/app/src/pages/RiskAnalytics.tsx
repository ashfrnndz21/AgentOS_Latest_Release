
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Shield, BarChart3 } from 'lucide-react';

const RiskAnalytics = () => {
  return (
    <Layout>
      <div className="p-6 space-y-6 bg-black min-h-screen">
        <Card className="shadow-lg border-gray-800/30 bg-gradient-to-br from-beam-dark-accent/70 to-beam-dark-accent/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-400 text-sm">Active</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Risk Analytics</CardTitle>
            <CardDescription className="text-gray-300">
              Monitor and analyze risk factors across your banking operations
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-beam-dark-accent/50 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">Credit Risk</CardTitle>
                <TrendingUp className="h-4 w-4 text-true-red" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12.3%</div>
              <p className="text-xs text-gray-400">Default probability</p>
            </CardContent>
          </Card>
          
          <Card className="bg-beam-dark-accent/50 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">Market Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">8.7%</div>
              <p className="text-xs text-gray-400">VaR (Value at Risk)</p>
            </CardContent>
          </Card>
          
          <Card className="bg-beam-dark-accent/50 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">Operational Risk</CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">5.2%</div>
              <p className="text-xs text-gray-400">Risk score</p>
            </CardContent>
          </Card>
          
          <Card className="bg-beam-dark-accent/50 border-gray-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">Liquidity Risk</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">15.8%</div>
              <p className="text-xs text-gray-400">Coverage ratio</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-beam-dark-accent/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Risk Dashboard</CardTitle>
              <CardDescription className="text-gray-300">
                Real-time risk monitoring and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-400">Risk analytics dashboard will be displayed here</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-beam-dark-accent/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Risk Models</CardTitle>
              <CardDescription className="text-gray-300">
                AI-powered risk prediction models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-400">Risk models interface will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RiskAnalytics;

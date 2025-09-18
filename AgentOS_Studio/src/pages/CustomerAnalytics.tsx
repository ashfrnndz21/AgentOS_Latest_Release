import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CvmAgenticDecisioning } from '@/components/CustomerValueManagement/CvmAgenticDecisioning';
import { CvmProvider } from '@/components/CustomerValueManagement/context/CvmContext';
import { CvmChatProvider } from '@/components/CustomerValueManagement/context/CvmChatContext';

export default function CustomerAnalytics() {
  return (
    <Layout>
      <CvmProvider>
        <CvmChatProvider>
          <div className="p-6 space-y-6 bg-black min-h-screen">
            <Card className="shadow-lg border-gray-800/30 bg-gradient-to-br from-beam-dark-accent/70 to-beam-dark-accent/40 backdrop-blur-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Customer Analytics</CardTitle>
                    <CardDescription className="text-gray-300">
                      AI-powered customer analytics with agentic decisioning for campaign simulation, profitability scenarios, and churn analysis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            <CvmAgenticDecisioning />
          </div>
        </CvmChatProvider>
      </CvmProvider>
    </Layout>
  );
}
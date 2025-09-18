
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CvmDashboard } from '@/components/CustomerValueManagement/CvmDashboard';
import { CvmProvider } from '@/components/CustomerValueManagement/context/CvmContext';
import { CvmModeToggle } from '@/components/CustomerValueManagement/CvmModeToggle';
import { CvmChatInterface } from '@/components/CustomerValueManagement/CvmChatInterface';
import { useCvmChatContext } from '@/components/CustomerValueManagement/context/CvmChatContext';

// Content component that has access to context
const CvmContent = () => {
  const { chatMode } = useCvmChatContext();

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      <Card className="shadow-lg border-gray-800/30 bg-gradient-to-br from-beam-dark-accent/70 to-beam-dark-accent/40 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white">Customer Value Management</CardTitle>
              <CardDescription className="text-gray-300">
                Segment, analyze, and maximize customer lifetime value across services
              </CardDescription>
            </div>
            <CvmModeToggle />
          </div>
        </CardHeader>
      </Card>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`${chatMode ? 'w-full lg:w-8/12' : 'w-full'}`}>
          <CvmDashboard />
        </div>
        
        {chatMode && (
          <div className="w-full lg:w-4/12">
            <CvmChatInterface />
          </div>
        )}
      </div>
    </div>
  );
};

export default function CustomerValueManagement() {
  return (
    <Layout>
      <CvmProvider>
        <CvmContent />
      </CvmProvider>
    </Layout>
  );
}

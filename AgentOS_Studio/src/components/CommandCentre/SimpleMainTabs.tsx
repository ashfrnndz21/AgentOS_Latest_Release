import React, { useState } from 'react';
import { BarChart2, History, Wrench, Database, Shield, CircleDollarSign, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SimpleMainTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SimpleMainTabs: React.FC<SimpleMainTabsProps> = ({
  activeTab,
  setActiveTab
}) => {
  console.log('🔍 SimpleMainTabs render - activeTab:', activeTab);

  const handleTabChange = (value: string) => {
    console.log('🔄 SimpleMainTabs - Tab change requested:', value);
    setActiveTab(value);
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-7 mb-6 bg-beam-dark-accent/40 border border-gray-700/50 rounded-xl p-1 gap-1 w-full">
          <TabsTrigger value="dashboard" className="rounded-lg flex items-center gap-2">
            <BarChart2 size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="traceability" className="rounded-lg flex items-center gap-2">
            <History size={16} />
            <span className="hidden sm:inline">Traceability</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="rounded-lg flex items-center gap-2">
            <Wrench size={16} />
            <span className="hidden sm:inline">Tools</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-lg flex items-center gap-2">
            <Database size={16} />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="rounded-lg flex items-center gap-2">
            <Shield size={16} />
            <span className="hidden sm:inline">Governance</span>
          </TabsTrigger>
          <TabsTrigger value="cost" className="rounded-lg flex items-center gap-2">
            <CircleDollarSign size={16} />
            <span className="hidden sm:inline">Cost</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="rounded-lg flex items-center gap-2">
            <Activity size={16} />
            <span className="hidden sm:inline">Monitor</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0">
          <div className="p-6 bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Dashboard</h2>
            <p className="text-gray-300">Dashboard content goes here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="traceability" className="mt-0">
          <div className="p-6 bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Traceability</h2>
            <p className="text-gray-300">Traceability content goes here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="tools" className="mt-0">
          <div className="p-6 bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Tools</h2>
            <p className="text-gray-300">Tools content goes here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="data" className="mt-0">
          <div className="p-6 bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Data</h2>
            <p className="text-gray-300">Data content goes here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="governance" className="mt-0">
          <div className="p-6 bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Governance</h2>
            <p className="text-gray-300">Governance content goes here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="cost" className="mt-0">
          <div className="p-6 bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Cost</h2>
            <p className="text-gray-300">Cost content goes here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="monitoring" className="mt-0">
          <div className="p-6 bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Monitor</h2>
            <p className="text-gray-300">Monitor content goes here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
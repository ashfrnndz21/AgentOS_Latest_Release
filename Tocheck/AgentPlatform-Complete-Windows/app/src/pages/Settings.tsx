
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/Settings/GeneralSettings";
import { ApiSettings } from "@/components/Settings/ApiSettings";
import { BackendControlPanel } from "@/components/Settings/BackendControlPanel";
import { BackendServices } from "@/components/Settings/BackendServices";
import { MemorySettings } from "@/components/Settings/MemorySettings";
import { toast } from 'sonner';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  // Function to handle tab change with validation
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Show a toast when changing to memory tab to guide users
    if (value === "memory") {
      toast.info("Configure memory settings for agents to maintain conversation context");
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-beam-dark-accent/30 border-gray-700/50 grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="backend-control">Control Panel</TabsTrigger>
          <TabsTrigger value="backend-services">AI Services</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="api-keys" className="space-y-4">
          <ApiSettings />
        </TabsContent>
        
        <TabsContent value="backend-control" className="space-y-4">
          <BackendControlPanel />
        </TabsContent>
        
        <TabsContent value="backend-services" className="space-y-4">
          <BackendServices />
        </TabsContent>
        
        <TabsContent value="memory" className="space-y-4">
          <MemorySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

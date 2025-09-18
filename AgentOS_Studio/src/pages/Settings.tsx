
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/Settings/GeneralSettings";
import { ApiSettings } from "@/components/Settings/ApiSettings";
import { BackendControlPanel } from "@/components/Settings/BackendControlPanel";
import { BackendServices } from "@/components/Settings/BackendServices";
import { MemorySettings } from "@/components/Settings/MemorySettings";
import { LogoSettings } from "@/components/Settings/LogoSettings";
import MCPSettings from "@/components/Settings/MCPSettings";
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
      
      {/* Debug info */}
      <div className="text-white mb-4">Active Tab: {activeTab}</div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-gray-800 border border-gray-600 flex w-full">
          <TabsTrigger value="general" className="text-white hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1">
            General
          </TabsTrigger>
          <TabsTrigger value="logo" className="text-white hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1">
            Logo
          </TabsTrigger>
          <TabsTrigger value="mcp" className="text-white hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1">
            MCP Servers
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="text-white hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1">
            API Keys
          </TabsTrigger>
          <TabsTrigger value="backend-control" className="text-white hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1">
            Control Panel
          </TabsTrigger>
          <TabsTrigger value="backend-services" className="text-white hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1">
            AI Services
          </TabsTrigger>
          <TabsTrigger value="memory" className="text-white hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-1">
            Memory
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="logo" className="space-y-4">
          <div className="text-white p-4 bg-gray-800 rounded">
            <h2>Logo Settings Component</h2>
            <LogoSettings />
          </div>
        </TabsContent>
        
        <TabsContent value="mcp" className="space-y-4">
          <MCPSettings />
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

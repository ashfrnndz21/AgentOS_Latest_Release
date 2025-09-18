import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TestBasicTabs = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Basic Tabs Test</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tab1">
          <div className="p-4 border rounded">
            <h2>Tab 1 Content</h2>
            <p>This is the content for tab 1.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="tab2">
          <div className="p-4 border rounded">
            <h2>Tab 2 Content</h2>
            <p>This is the content for tab 2.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="tab3">
          <div className="p-4 border rounded">
            <h2>Tab 3 Content</h2>
            <p>This is the content for tab 3.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>Current active tab: <strong>{activeTab}</strong></p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => setActiveTab('tab1')}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Set Tab 1
          </button>
          <button 
            onClick={() => setActiveTab('tab2')}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Set Tab 2
          </button>
          <button 
            onClick={() => setActiveTab('tab3')}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Set Tab 3
          </button>
        </div>
      </div>
    </div>
  );
};
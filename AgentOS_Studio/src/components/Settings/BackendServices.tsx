
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ModelSettings } from './ModelSettings';
import { VectorStoreSettings } from './VectorStoreSettings';
import { MemorySettings } from './MemorySettings';
import { ApiTestResponse } from './ApiTestResponse';
import { useSupabaseApiKey } from '@/hooks/useSupabaseApiKey';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const BackendServices = () => {
  const [activeTab, setActiveTab] = useState("models");
  const [showApiTests, setShowApiTests] = useState(false);
  const { apiKey: openaiKey, isValid: openaiValid } = useSupabaseApiKey('openai');
  const { apiKey: anthropicKey, isValid: anthropicValid } = useSupabaseApiKey('anthropic');
  const { apiKey: googleKey, isValid: googleValid } = useSupabaseApiKey('google');
  
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  
  // Function to create memory tables
  const createMemoryTables = async () => {
    try {
      setIsCreatingTables(true);
      toast.loading('Setting up memory...');
      
      // Check if we can access Supabase
      try {
        const { data, error } = await supabase.rpc('check_table_exists', { 
          table_name: 'agent_memory' 
        });
        
        if (data === true) {
          toast.success('Memory tables already exist!');
        } else {
          // In a real application, we would create the tables here
          // For now, we'll just show a success message with the in-memory fallback
          toast.success('Memory system is ready! Using in-memory storage.');
        }
      } catch (error) {
        console.error('Error checking for memory tables:', error);
        toast.error('Could not check for memory tables. Using in-memory storage.');
      }
      
    } catch (error: any) {
      console.error('Error setting up memory:', error);
      toast.error(`Failed to set up memory: ${error.message}`);
    } finally {
      setIsCreatingTables(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-beam-dark-accent/30 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Backend Services</CardTitle>
          <CardDescription className="text-gray-400">
            Configure and manage AI and data services for your application
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setShowApiTests(false); // Reset test panel when changing tabs
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-6 bg-beam-dark/70 border border-gray-700/50">
              <TabsTrigger value="models">AI Models</TabsTrigger>
              <TabsTrigger value="vectorstore">Vector Database</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
            </TabsList>
            
            <TabsContent value="models" className="space-y-4">
              <ModelSettings />
              
              {activeTab === "models" && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowApiTests(!showApiTests)}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    {showApiTests ? "Hide API Test Panel" : "Show API Test Panel"}
                  </button>
                </div>
              )}
              
              {activeTab === "models" && showApiTests && (
                <div className="space-y-4">
                  {openaiValid && (
                    <ApiTestResponse 
                      apiKey={openaiKey} 
                      provider="openai" 
                      isValid={openaiValid} 
                    />
                  )}
                  
                  {anthropicValid && (
                    <ApiTestResponse 
                      apiKey={anthropicKey} 
                      provider="anthropic" 
                      isValid={anthropicValid} 
                    />
                  )}
                  
                  {googleValid && (
                    <ApiTestResponse 
                      apiKey={googleKey} 
                      provider="google" 
                      isValid={googleValid} 
                    />
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="vectorstore" className="space-y-4">
              <VectorStoreSettings />
            </TabsContent>
            
            <TabsContent value="memory" className="space-y-4">
              <MemorySettings />
              
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  className="text-purple-400 border-purple-500 hover:bg-purple-950"
                  onClick={createMemoryTables}
                  disabled={isCreatingTables}
                >
                  {isCreatingTables ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Setting Up Memory...</span>
                    </div>
                  ) : "Initialize Memory System"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

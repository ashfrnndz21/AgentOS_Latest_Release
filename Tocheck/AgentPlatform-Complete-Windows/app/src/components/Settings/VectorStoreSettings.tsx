
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiKeyInput } from '@/components/AgentWorkspace/ApiKeyInput';
import { useSupabaseApiKey } from '@/hooks/useSupabaseApiKey';
import { toast } from 'sonner';
import { useVectorStore } from '@/utils/vectorStore';

export const VectorStoreSettings = () => {
  // API Keys
  const { apiKey: pineconeKey, setApiKey: setPineconeKey, isValid: pineconeValid } = useSupabaseApiKey('pinecone');
  const { apiKey: openaiKey, isValid: openaiValid } = useSupabaseApiKey('openai');
  
  // Vector store settings
  const [vectorStoreProvider, setVectorStoreProvider] = useState(localStorage.getItem('vectorstore-provider') || 'pinecone');
  const [vectorStoreIndex, setVectorStoreIndex] = useState(localStorage.getItem('vectorstore-index') || 'telco-knowledge');
  const [vectorStoreEnvironment, setVectorStoreEnvironment] = useState(localStorage.getItem('vectorstore-environment') || 'gcp-starter');
  
  const [connectionStatus, setConnectionStatus] = useState({
    vectorstore: pineconeValid && openaiValid ? "Connected" : "Not Connected",
  });
  
  const { getVectorStoreService } = useVectorStore();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Check if settings are valid
  const areSettingsValid = () => {
    if (vectorStoreProvider === 'pinecone') {
      return pineconeValid && openaiValid;
    }
    // For other providers, just check OpenAI (needed for embeddings)
    return openaiValid;
  };
  
  // Test connection
  const testConnection = async () => {
    try {
      setIsTestingConnection(true);
      toast.loading(`Testing connection to ${vectorStoreProvider}...`);
      
      if (!areSettingsValid()) {
        toast.error('API keys are missing or invalid');
        setConnectionStatus({ vectorstore: "Not Connected" });
        return;
      }
      
      // Try to initialize vector store service
      const vectorStore = await getVectorStoreService(
        vectorStoreProvider as any,
        vectorStoreIndex,
        {
          environment: vectorStoreEnvironment
        }
      );
      
      if (vectorStore) {
        setConnectionStatus({ vectorstore: "Connected" });
        toast.success(`Successfully connected to ${vectorStoreProvider}`);
        
        // Try to add a test document
        const testDoc = {
          id: `test-${Date.now()}`,
          content: 'This is a test document to verify vector store functionality.',
          metadata: {
            source: 'vector-store-test',
            timestamp: new Date().toISOString()
          }
        };
        
        await vectorStore.addDocuments([testDoc]);
        
        // Try to search for the document
        const results = await vectorStore.search('test document');
        console.log('Search results:', results);
        
        toast.success('Successfully added and retrieved test document');
      } else {
        setConnectionStatus({ vectorstore: "Not Connected" });
        toast.error(`Failed to connect to ${vectorStoreProvider}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus({ vectorstore: "Not Connected" });
      toast.error(`Failed to connect to ${vectorStoreProvider}: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  // Save settings
  const saveSettings = () => {
    // Save vector store settings to localStorage
    localStorage.setItem('vectorstore-provider', vectorStoreProvider);
    localStorage.setItem('vectorstore-index', vectorStoreIndex);
    localStorage.setItem('vectorstore-environment', vectorStoreEnvironment);
    
    toast.success('Vector store settings saved successfully');
  };

  return (
    <Card className="bg-beam-dark-accent/30 border-gray-700/50">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Pinecone Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Vector Database</h3>
                  <p className="text-sm text-gray-400">Configure vector store for RAG and semantic search</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-sm ${connectionStatus.vectorstore === "Connected" ? "text-green-500" : "text-amber-500"}`}>
                  {connectionStatus.vectorstore}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-3"
                  onClick={testConnection}
                  disabled={isTestingConnection || !areSettingsValid()}
                >
                  {isTestingConnection ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div>
                  ) : "Test"}
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vector-provider" className="text-white">Vector Database Provider</Label>
                <Select 
                  value={vectorStoreProvider} 
                  onValueChange={setVectorStoreProvider}
                >
                  <SelectTrigger id="vector-provider" className="bg-beam-dark border-gray-700 text-white">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-beam-dark border-gray-700 text-white">
                    <SelectItem value="pinecone">Pinecone</SelectItem>
                    <SelectItem value="supabase">Supabase</SelectItem>
                    <SelectItem value="chroma">Chroma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!openaiValid && (
                <div className="p-3 bg-amber-900/30 border border-amber-800 rounded-md">
                  <p className="text-sm text-amber-300">
                    OpenAI API key is required for generating vector embeddings. Please add it in the Models tab.
                  </p>
                </div>
              )}
              
              {vectorStoreProvider === 'pinecone' && (
                <ApiKeyInput
                  serviceTitle="Pinecone API Key"
                  apiKey={pineconeKey}
                  setApiKey={setPineconeKey}
                  isValid={pineconeValid}
                />
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="vector-index" className="text-white">Index Name</Label>
                <Input 
                  id="vector-index"
                  value={vectorStoreIndex}
                  onChange={(e) => setVectorStoreIndex(e.target.value)}
                  className="bg-beam-dark border-gray-700 text-white"
                />
              </div>
              
              {vectorStoreProvider === 'pinecone' && (
                <div className="grid gap-2">
                  <Label htmlFor="vector-environment" className="text-white">Environment</Label>
                  <Input 
                    id="vector-environment"
                    value={vectorStoreEnvironment}
                    onChange={(e) => setVectorStoreEnvironment(e.target.value)}
                    className="bg-beam-dark border-gray-700 text-white"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveSettings}
            >
              Save Vector Store Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

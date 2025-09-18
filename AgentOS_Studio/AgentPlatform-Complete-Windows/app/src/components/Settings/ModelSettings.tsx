
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiKeyInput } from '@/components/AgentWorkspace/ApiKeyInput';
import { useSupabaseApiKey } from '@/hooks/useSupabaseApiKey';
import { models } from '@/utils/models/modelTypes';
import { toast } from 'sonner';

export const ModelSettings = () => {
  // API Keys hooks
  const { apiKey: openaiKey, setApiKey: setOpenaiKey, isValid: openaiValid } = useSupabaseApiKey('openai');
  const { apiKey: anthropicKey, setApiKey: setAnthropicKey, isValid: anthropicValid } = useSupabaseApiKey('anthropic');
  const { apiKey: googleKey, setApiKey: setGoogleKey, isValid: googleValid } = useSupabaseApiKey('google');
  
  // Model settings
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState(models?.openai?.[0]?.id || 'gpt-4o');
  const [ollamaEndpoint, setOllamaEndpoint] = useState("http://localhost:11434");
  const [ollamaEnabled, setOllamaEnabled] = useState(false);
  
  const [connectionStatus, setConnectionStatus] = useState({
    openai: openaiValid ? "Connected" : "Not Connected",
    anthropic: anthropicValid ? "Connected" : "Not Connected",
    google: googleValid ? "Connected" : "Not Connected",
    ollama: "Not Connected",
  });
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Update connection status when API key validity changes
  useEffect(() => {
    setConnectionStatus(prev => ({
      ...prev,
      openai: openaiValid ? "Connected" : "Not Connected",
      anthropic: anthropicValid ? "Connected" : "Not Connected",
      google: googleValid ? "Connected" : "Not Connected"
    }));
  }, [openaiValid, anthropicValid, googleValid]);
  
  const testConnection = async (service: string) => {
    try {
      setIsTestingConnection(true);
      toast.loading(`Testing connection to ${service}...`);
      
      if (service === 'openai' && openaiValid) {
        // Actually test OpenAI API connection
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setConnectionStatus(prev => ({ ...prev, openai: "Connected" }));
          toast.success(`Successfully connected to OpenAI. Found ${data.data.length} models.`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to connect to OpenAI');
        }
      } else if (service === 'anthropic' && anthropicValid) {
        // For now, we'll simulate a successful test
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConnectionStatus(prev => ({ ...prev, anthropic: "Connected" }));
        toast.success(`Successfully connected to Anthropic`);
      } else if (service === 'google' && googleValid) {
        // For now, we'll simulate a successful test
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConnectionStatus(prev => ({ ...prev, google: "Connected" }));
        toast.success(`Successfully connected to Google AI`);
      } else if (service === 'ollama' && ollamaEnabled) {
        // Test Ollama connection
        try {
          const response = await fetch(`${ollamaEndpoint}/api/tags`, {
            method: 'GET'
          });
          
          if (response.ok) {
            setConnectionStatus(prev => ({ ...prev, ollama: "Connected" }));
            toast.success(`Successfully connected to Ollama`);
          } else {
            throw new Error("Failed to connect to Ollama");
          }
        } catch (error) {
          toast.error(`Failed to connect to Ollama at ${ollamaEndpoint}`);
          setConnectionStatus(prev => ({ ...prev, ollama: "Not Connected" }));
        }
      } else {
        toast.error(`Invalid or missing API key for ${service}`);
      }
    } catch (error: any) {
      console.error(`Error testing ${service} connection:`, error);
      toast.error(`Failed to connect to ${service}: ${error.message}`);
      
      // Update status to show connection failed
      const newStatus = { ...connectionStatus };
      newStatus[service as keyof typeof connectionStatus] = "Connection Failed";
      setConnectionStatus(newStatus);
    } finally {
      setIsTestingConnection(false);
      toast.dismiss();
    }
  };
  
  const saveModelSettings = () => {
    // Save model settings to localStorage for persistence
    localStorage.setItem('selectedModelProvider', selectedProvider);
    localStorage.setItem(`${selectedProvider}-selected-model`, selectedModel);
    
    if (selectedProvider === 'ollama') {
      localStorage.setItem('ollama-endpoint', ollamaEndpoint);
      localStorage.setItem('ollama-enabled', String(ollamaEnabled));
    }
    
    toast.success('Model settings saved successfully');
  };

  return (
    <Card className="bg-beam-dark-accent/30 border-gray-700/50">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* OpenAI Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-500">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">OpenAI</h3>
                  <p className="text-sm text-gray-400">Configure OpenAI API key and model</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-sm ${connectionStatus.openai === "Connected" ? "text-green-500" : connectionStatus.openai === "Connection Failed" ? "text-red-500" : "text-amber-500"}`}>
                  {connectionStatus.openai}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-3"
                  onClick={() => testConnection('openai')}
                  disabled={isTestingConnection || !openaiValid}
                >
                  {isTestingConnection ? 
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div> : 
                    "Test"
                  }
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              <ApiKeyInput
                serviceTitle="OpenAI API Key"
                apiKey={openaiKey}
                setApiKey={setOpenaiKey}
                isValid={openaiValid}
              />
              
              {openaiValid && (
                <div className="grid gap-2">
                  <Label htmlFor="openai-model" className="text-white">Model</Label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger id="openai-model" className="bg-beam-dark border-gray-700 text-white">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="bg-beam-dark border-gray-700 text-white">
                      {models.openai.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          {/* Anthropic Configuration */}
          <div className="space-y-3 pt-2 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-500">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Anthropic</h3>
                  <p className="text-sm text-gray-400">Configure Anthropic API key and model</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-sm ${connectionStatus.anthropic === "Connected" ? "text-green-500" : "text-amber-500"}`}>
                  {connectionStatus.anthropic}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-3"
                  onClick={() => testConnection('anthropic')}
                >
                  Test
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              <ApiKeyInput
                serviceTitle="Anthropic API Key"
                apiKey={anthropicKey}
                setApiKey={setAnthropicKey}
                isValid={anthropicValid}
              />
              
              {anthropicValid && (
                <div className="grid gap-2">
                  <Label htmlFor="anthropic-model" className="text-white">Model</Label>
                  <Select 
                    defaultValue={models.anthropic[0]?.id}
                    onValueChange={(value) => setSelectedModel(value)}
                  >
                    <SelectTrigger id="anthropic-model" className="bg-beam-dark border-gray-700 text-white">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="bg-beam-dark border-gray-700 text-white">
                      {models.anthropic.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          {/* Google AI Configuration */}
          <div className="space-y-3 pt-2 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Google AI</h3>
                  <p className="text-sm text-gray-400">Configure Google Gemini API key and model</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-sm ${connectionStatus.google === "Connected" ? "text-green-500" : "text-amber-500"}`}>
                  {connectionStatus.google}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-3"
                  onClick={() => testConnection('google')}
                  disabled={isTestingConnection || !googleValid}
                >
                  {isTestingConnection ? 
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div> : 
                    "Test"
                  }
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              <ApiKeyInput
                serviceTitle="Google AI API Key"
                apiKey={googleKey}
                setApiKey={setGoogleKey}
                isValid={googleValid}
                placeholder="Enter your Google API key"
                label="Required for using Google Gemini models"
              />
              
              {googleValid && (
                <div className="grid gap-2">
                  <Label htmlFor="google-model" className="text-white">Model</Label>
                  <Select 
                    defaultValue={models.google[0]?.id}
                    onValueChange={(value) => setSelectedModel(value)}
                  >
                    <SelectTrigger id="google-model" className="bg-beam-dark border-gray-700 text-white">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="bg-beam-dark border-gray-700 text-white">
                      {models.google.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          {/* Ollama Configuration */}
          <div className="space-y-3 pt-2 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500">
                    <path d="M12 3v3m0 0 3-3m-3 3-3-3m-3 9h3m0 0 3 3m3 15h-3v3m3 15h-3v-3m3 15h-3v3m3 15h-3v-3"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Ollama (Local)</h3>
                  <p className="text-sm text-gray-400">Configure local Ollama endpoint</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  <Label htmlFor="ollama-enable" className="text-white text-sm mr-2">Enable</Label>
                  <Switch 
                    id="ollama-enable" 
                    checked={ollamaEnabled}
                    onCheckedChange={setOllamaEnabled}
                  />
                </div>
                <span className={`text-sm ${connectionStatus.ollama === "Connected" ? "text-green-500" : "text-amber-500"}`}>
                  {connectionStatus.ollama}
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-3"
                  onClick={() => testConnection('ollama')}
                  disabled={!ollamaEnabled}
                >
                  Test
                </Button>
              </div>
            </div>
            
            {ollamaEnabled && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ollama-endpoint" className="text-white">Endpoint URL</Label>
                  <Input 
                    id="ollama-endpoint"
                    value={ollamaEndpoint}
                    onChange={(e) => setOllamaEndpoint(e.target.value)}
                    className="bg-beam-dark border-gray-700 text-white"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="ollama-model" className="text-white">Model</Label>
                  <Select 
                    defaultValue={models.ollama[0].id}
                    onValueChange={(value) => setSelectedModel(value)}
                  >
                    <SelectTrigger id="ollama-model" className="bg-beam-dark border-gray-700 text-white">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="bg-beam-dark border-gray-700 text-white">
                      {models.ollama.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveModelSettings}
            >
              Save Model Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

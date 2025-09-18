
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useLangChainKey } from '@/components/AgentWorkspace/hooks/useLangChainKey';
import { ApiKeyInput } from '@/components/AgentWorkspace/ApiKeyInput';
import { 
  Bot, 
  Database, 
  Server, 
  Layout, 
  Layers, 
  Code,
  Key
} from 'lucide-react';

export const BackendControlPanel = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { apiKey, setApiKey, isValid } = useLangChainKey();
  const [ollamaEnabled, setOllamaEnabled] = useState(false);
  const [ollamaEndpoint, setOllamaEndpoint] = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("llama3.2:latest");
  const [crewAiEnabled, setCrewAiEnabled] = useState(false);
  const [langfuseEnabled, setLangfuseEnabled] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [memoryType, setMemoryType] = useState("memgpt");
  const [vectorDbEnabled, setVectorDbEnabled] = useState(false);
  const [vectorDbType, setVectorDbType] = useState("pinecone");
  const [connectionStatus, setConnectionStatus] = useState({
    langchain: isValid ? "Connected" : "Not Connected",
    ollama: "Not Connected",
    crewai: "Not Connected",
    langfuse: "Not Connected",
    memory: "Not Connected",
    vectordb: "Not Connected"
  });
  
  const testConnection = (service: string) => {
    // In a real implementation, this would test the connection to the service
    // For now, we'll simulate a successful connection for the demo
    
    setTimeout(() => {
      const newStatus = { ...connectionStatus };
      
      if (service === 'langchain' && isValid) {
        newStatus.langchain = "Connected";
      } else if (service === 'ollama' && ollamaEnabled) {
        newStatus.ollama = "Connected";
      } else if (service === 'crewai' && crewAiEnabled) {
        newStatus.crewai = "Connected";
      } else if (service === 'langfuse' && langfuseEnabled) {
        newStatus.langfuse = "Connected";
      } else if (service === 'memory' && memoryEnabled) {
        newStatus.memory = "Connected";
      } else if (service === 'vectordb' && vectorDbEnabled) {
        newStatus.vectordb = "Connected";
      }
      
      setConnectionStatus(newStatus);
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-beam-dark-accent/30 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">AI Backend Control Panel</CardTitle>
          <CardDescription className="text-gray-400">
            Configure and manage AI backend services and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-beam-dark/70 border border-gray-700/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-purple-400" />
                      LLM Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">LangChain (OpenAI)</span>
                        <Badge variant={connectionStatus.langchain === "Connected" ? "default" : "outline"}>
                          {connectionStatus.langchain}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Ollama (Local)</span>
                        <Badge variant={connectionStatus.ollama === "Connected" ? "default" : "outline"}>
                          {connectionStatus.ollama}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-blue-400" />
                      Orchestration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">CrewAI</span>
                        <Badge variant={connectionStatus.crewai === "Connected" ? "default" : "outline"}>
                          {connectionStatus.crewai}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">LangChain</span>
                        <Badge variant={connectionStatus.langchain === "Connected" ? "default" : "outline"}>
                          {connectionStatus.langchain}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg flex items-center">
                      <Database className="h-4 w-4 mr-2 text-green-400" />
                      Storage & Memory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Vector Database</span>
                        <Badge variant={connectionStatus.vectordb === "Connected" ? "default" : "outline"}>
                          {connectionStatus.vectordb}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Memory Manager</span>
                        <Badge variant={connectionStatus.memory === "Connected" ? "default" : "outline"}>
                          {connectionStatus.memory}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg flex items-center">
                      <Server className="h-4 w-4 mr-2 text-amber-400" />
                      Observability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Langfuse</span>
                        <Badge variant={connectionStatus.langfuse === "Connected" ? "default" : "outline"}>
                          {connectionStatus.langfuse}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">OpenTelemetry</span>
                        <Badge variant="outline">Not Configured</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-400 text-sm mb-6">
                  Configure these services in the Connections and Orchestration tabs. For production use,
                  we recommend connecting to Supabase for secure storage of API keys and backend functionality.
                </p>
                
                <Button variant="default" className="mr-2">
                  Run Diagnostics
                </Button>
                <Button variant="outline">
                  Save Configuration
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="connections">
              <div className="space-y-6">
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Key className="h-4 w-4 mr-2 text-purple-400" />
                      LangChain (OpenAI)
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Connect to OpenAI's API through LangChain
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="langchain-toggle"
                          checked={isValid}
                          onCheckedChange={() => {}}
                          disabled={!isValid}
                        />
                        <Label htmlFor="langchain-toggle">Enable LangChain Integration</Label>
                      </div>
                      
                      <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testConnection('langchain')}
                          disabled={!isValid}
                        >
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Server className="h-4 w-4 mr-2 text-green-400" />
                      Ollama (Local LLM)
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Connect to locally running Ollama instance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="ollama-toggle"
                          checked={ollamaEnabled}
                          onCheckedChange={setOllamaEnabled}
                        />
                        <Label htmlFor="ollama-toggle">Enable Ollama Integration</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ollama-endpoint">Ollama API Endpoint</Label>
                        <Input
                          id="ollama-endpoint"
                          placeholder="http://localhost:11434"
                          value={ollamaEndpoint}
                          onChange={(e) => setOllamaEndpoint(e.target.value)}
                          className="bg-beam-dark border-gray-700 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ollama-model">Ollama Model</Label>
                        <Select
                          value={ollamaModel}
                          onValueChange={setOllamaModel}
                        >
                          <SelectTrigger className="bg-beam-dark border-gray-700 text-white">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="llama3">Llama 3</SelectItem>
                            <SelectItem value="mistral">Mistral</SelectItem>
                            <SelectItem value="codellama">CodeLlama</SelectItem>
                            <SelectItem value="phi3">Phi-3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testConnection('ollama')}
                          disabled={!ollamaEnabled}
                        >
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Database className="h-4 w-4 mr-2 text-blue-400" />
                      Vector Database
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Connect to a vector database for semantic search and retrieval
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="vectordb-toggle"
                          checked={vectorDbEnabled}
                          onCheckedChange={setVectorDbEnabled}
                        />
                        <Label htmlFor="vectordb-toggle">Enable Vector Database</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vectordb-type">Vector Database Type</Label>
                        <Select
                          value={vectorDbType}
                          onValueChange={setVectorDbType}
                        >
                          <SelectTrigger className="bg-beam-dark border-gray-700 text-white">
                            <SelectValue placeholder="Select database" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pinecone">Pinecone</SelectItem>
                            <SelectItem value="qdrant">Qdrant</SelectItem>
                            <SelectItem value="chroma">ChromaDB</SelectItem>
                            <SelectItem value="weaviate">Weaviate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vectordb-api-key">API Key</Label>
                        <Input
                          id="vectordb-api-key"
                          type="password"
                          placeholder="Enter API key"
                          className="bg-beam-dark border-gray-700 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vectordb-endpoint">Environment</Label>
                        <Input
                          id="vectordb-endpoint"
                          placeholder="Enter environment name or URL"
                          className="bg-beam-dark border-gray-700 text-white"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testConnection('vectordb')}
                          disabled={!vectorDbEnabled}
                        >
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Code className="h-4 w-4 mr-2 text-amber-400" />
                      Langfuse (Observability)
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Connect to Langfuse for LLM observability and monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="langfuse-toggle"
                          checked={langfuseEnabled}
                          onCheckedChange={setLangfuseEnabled}
                        />
                        <Label htmlFor="langfuse-toggle">Enable Langfuse Integration</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="langfuse-public-key">Public Key</Label>
                        <Input
                          id="langfuse-public-key"
                          placeholder="pk-..."
                          className="bg-beam-dark border-gray-700 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="langfuse-secret-key">Secret Key</Label>
                        <Input
                          id="langfuse-secret-key"
                          type="password"
                          placeholder="sk-..."
                          className="bg-beam-dark border-gray-700 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="langfuse-host">Host (Optional)</Label>
                        <Input
                          id="langfuse-host"
                          placeholder="https://cloud.langfuse.com"
                          className="bg-beam-dark border-gray-700 text-white"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testConnection('langfuse')}
                          disabled={!langfuseEnabled}
                        >
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="orchestration">
              <div className="space-y-6">
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-blue-400" />
                      CrewAI
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure CrewAI for agent orchestration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="crewai-toggle"
                          checked={crewAiEnabled}
                          onCheckedChange={setCrewAiEnabled}
                        />
                        <Label htmlFor="crewai-toggle">Enable CrewAI</Label>
                      </div>
                      
                      <div className="p-4 rounded bg-gray-800/50">
                        <p className="text-amber-400 text-sm mb-2">Note:</p>
                        <p className="text-gray-300 text-sm">
                          CrewAI requires a backend server to run effectively. For production use,
                          we recommend connecting to Supabase and deploying Edge Functions.
                        </p>
                      </div>
                      
                      <Separator className="bg-gray-700/50" />
                      
                      <div className="space-y-2">
                        <Label>LLM Provider</Label>
                        <Select defaultValue="openai">
                          <SelectTrigger className="bg-beam-dark border-gray-700 text-white">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                            <SelectItem value="ollama">Ollama (Local)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testConnection('crewai')}
                          disabled={!crewAiEnabled}
                        >
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-beam-dark/70 border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Database className="h-4 w-4 mr-2 text-green-400" />
                      Memory Management
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure memory management system for agents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="memory-toggle"
                          checked={memoryEnabled}
                          onCheckedChange={setMemoryEnabled}
                        />
                        <Label htmlFor="memory-toggle">Enable Advanced Memory</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="memory-type">Memory System</Label>
                        <Select
                          value={memoryType}
                          onValueChange={setMemoryType}
                        >
                          <SelectTrigger className="bg-beam-dark border-gray-700 text-white">
                            <SelectValue placeholder="Select memory system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="memgpt">MemGPT</SelectItem>
                            <SelectItem value="leta">LetaAI</SelectItem>
                            <SelectItem value="langchain">LangChain Memory</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="p-4 rounded bg-gray-800/50">
                        <p className="text-amber-400 text-sm mb-2">Note:</p>
                        <p className="text-gray-300 text-sm">
                          Advanced memory systems require persistent storage. For production use,
                          we recommend connecting to Supabase for database storage.
                        </p>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => testConnection('memory')}
                          disabled={!memoryEnabled}
                        >
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

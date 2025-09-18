import React, { useState, useEffect } from 'react';
import { FileText, MessageCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OllamaService } from '@/lib/services/OllamaService';

export const MinimalDocumentWorkspace: React.FC = () => {
  const [ollamaService] = useState(() => new OllamaService());
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await ollamaService.listModels();
        const modelNames = models.map(model => model.name);
        setAvailableModels(modelNames);
        if (modelNames.length > 0) {
          setSelectedModel(modelNames[0]);
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [ollamaService]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="text-purple-400" />
            Document Chat with Ollama
          </h1>
          <p className="text-gray-400">
            Upload documents and chat with them using local Ollama models
          </p>
        </div>

        {isLoading ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <p className="text-center">Loading Ollama models...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Model Selection */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Available Models</CardTitle>
              </CardHeader>
              <CardContent>
                {availableModels.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      Found {availableModels.length} models:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {availableModels.map(model => (
                        <Button
                          key={model}
                          variant={selectedModel === model ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedModel(model)}
                        >
                          {model}
                        </Button>
                      ))}
                    </div>
                    <p className="text-sm text-green-400 mt-2">
                      Selected: {selectedModel}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-400">No Ollama models found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Make sure Ollama is running and you have models installed
                    </p>
                    <div className="mt-4 text-xs text-gray-500">
                      <p>To install models:</p>
                      <code className="block mt-1 p-2 bg-gray-900 rounded">
                        ollama pull mistral<br/>
                        ollama pull llama3.2
                      </code>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Area */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-400">Document upload coming soon...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This is a minimal version to test Ollama integration
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle size={20} />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-700 rounded-lg text-center">
                  <p className="text-gray-400">Chat functionality coming soon...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    First, let's make sure Ollama models are loading correctly
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
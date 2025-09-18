import React from 'react';
import { OllamaTerminal } from '@/components/OllamaTerminal';
import { BackendControl } from '@/components/BackendControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, Download, Info, Trash2 } from 'lucide-react';

export default function OllamaTerminalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-beam-dark via-beam-dark-accent to-beam-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🤖 Ollama Terminal
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your local AI models and execute Ollama commands
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Terminal */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Interactive Terminal</h2>
              <OllamaTerminal />
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Backend Control */}
            <BackendControl />

            {/* Popular Models */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download size={18} />
                  Popular Models
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <div>
                      <div className="text-sm font-medium text-white">llama3.2</div>
                      <div className="text-xs text-gray-400">2.0GB • General</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <div>
                      <div className="text-sm font-medium text-white">mistral</div>
                      <div className="text-xs text-gray-400">4.1GB • General</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <div>
                      <div className="text-sm font-medium text-white">codellama</div>
                      <div className="text-xs text-gray-400">3.8GB • Code</div>
                    </div>
                    <Badge variant="outline" className="text-xs">Specialized</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-green-400 font-medium mb-2">List Models</h3>
              <code className="text-sm text-gray-300 bg-gray-900 px-2 py-1 rounded">
                ollama list
              </code>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2">Pull Model</h3>
              <code className="text-sm text-gray-300 bg-gray-900 px-2 py-1 rounded">
                ollama pull llama3.2
              </code>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-purple-400 font-medium mb-2">Show Model Info</h3>
              <code className="text-sm text-gray-300 bg-gray-900 px-2 py-1 rounded">
                ollama show llama3.2
              </code>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-red-400 font-medium mb-2">Remove Model</h3>
              <code className="text-sm text-gray-300 bg-gray-900 px-2 py-1 rounded">
                ollama rm model_name
              </code>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-blue-400 font-medium mb-2">Connection Status</h3>
          <p className="text-white">
            Terminal connects to backend on <span className="font-mono bg-gray-800 px-2 py-1 rounded">localhost:5002</span>
          </p>
          <p className="text-gray-300 text-sm mt-2">
            Make sure your backend server is running to execute Ollama commands
          </p>
        </div>


      </div>
    </div>
  );
}
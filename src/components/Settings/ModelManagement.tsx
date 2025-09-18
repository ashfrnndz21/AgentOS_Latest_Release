import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Database, Cpu, Trash2, Power, Download } from 'lucide-react';

interface Model {
  name: string;
  size_gb: number;
  modified: string;
  details?: any;
}

interface LoadedModel {
  name: string;
  size_gb: number;
  context_size: number;
  context_used: number;
}

interface ModelData {
  cached_models: {
    models: Model[];
    total_size_gb: number;
  };
  loaded_models: {
    loaded_models: LoadedModel[];
    total_loaded_gb: number;
  };
}

export const ModelManagement: React.FC = () => {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [defaultModel, setDefaultModel] = useState<string>('llama3.2:latest');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchModelData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5011/api/resource-monitor/ollama-models');
      if (response.ok) {
        const data = await response.json();
        setModelData(data);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to fetch model data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unloadModel = async (modelName: string) => {
    try {
      const response = await fetch('http://localhost:5011/api/resource-monitor/unload-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_name: modelName }),
      });

      if (response.ok) {
        // Refresh data after unloading
        await fetchModelData();
      }
    } catch (error) {
      console.error('Failed to unload model:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const formatSize = (sizeGb: number) => {
    if (sizeGb >= 1) {
      return `${sizeGb.toFixed(1)} GB`;
    } else {
      return `${(sizeGb * 1024).toFixed(0)} MB`;
    }
  };

  useEffect(() => {
    fetchModelData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchModelData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!modelData) {
    return (
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            Model Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400">
            <Database className="h-8 w-8 animate-pulse mx-auto mb-2" />
            <p>Loading model data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-beam-dark/70 border border-gray-700/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            Model Management
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Updated: {lastUpdate}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchModelData}
              disabled={loading}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currently Loaded Models */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-green-400" />
              Currently Loaded ({modelData.loaded_models.loaded_models.length})
            </h4>
            <Badge variant="outline" className="text-green-400 border-green-400">
              {formatSize(modelData.loaded_models.total_loaded_gb)} in memory
            </Badge>
          </div>
          
          {modelData.loaded_models.loaded_models.length > 0 ? (
            <div className="space-y-2">
              {modelData.loaded_models.loaded_models.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-md border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-white">{model.name}</div>
                      <div className="text-xs text-gray-400">
                        {formatSize(model.size_gb)} • Context: {model.context_used}/{model.context_size}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unloadModel(model.name)}
                    className="text-red-400 border-red-400 hover:bg-red-900/20"
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    modelData.loaded_models.loaded_models.forEach(model => unloadModel(model.name));
                  }}
                  className="text-red-400 border-red-400 hover:bg-red-900/20"
                >
                  Unload All Models
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-4">
              <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No models currently loaded in memory</p>
            </div>
          )}
        </div>

        {/* Cached Models */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" />
              Cached Models ({modelData.cached_models.models.length})
            </h4>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {formatSize(modelData.cached_models.total_size_gb)} on disk
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {modelData.cached_models.models.map((model, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-md border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-white">{model.name}</div>
                    <div className="text-xs text-gray-400">
                      {formatSize(model.size_gb)} • Modified: {formatDate(model.modified)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Note: This would need to be implemented in the backend
                    console.log('Delete model:', model.name);
                  }}
                  className="text-red-400 border-red-400 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Default Model Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">Default Model for New Agents</h4>
          <Select value={defaultModel} onValueChange={setDefaultModel}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select default model" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-600">
              {modelData.cached_models.models.map((model, index) => (
                <SelectItem key={index} value={model.name}>
                  {model.name} ({formatSize(model.size_gb)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400">
            This model will be used as the default when creating new agents.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

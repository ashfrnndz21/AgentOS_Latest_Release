import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Plus, Trash2, Eye, FileText, AlertCircle, CheckCircle, Loader2, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Database {
  name: string;
  path: string;
  size: number;
  created_at: string;
}

interface DatabaseTable {
  name: string;
  columns: number;
  schema: Array<{
    name: string;
    type: string;
    not_null: boolean;
    primary_key: boolean;
  }>;
}

interface ModelInfo {
  name: string;
  primary_model: string;
  available_models: string[];
}

export const DatabaseAgentInterface: React.FC = () => {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [newDatabase, setNewDatabase] = useState({
    name: '',
    description: '',
    model: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isPreviewingSchema, setIsPreviewingSchema] = useState(false);
  const [schemaPreview, setSchemaPreview] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDatabases();
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const response = await fetch('http://localhost:5041/api/models/status');
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.available_models || []);
        setSelectedModel(data.primary_model || '');
        setNewDatabase(prev => ({ ...prev, model: data.primary_model || '' }));
      }
    } catch (error) {
      console.error('Failed to load available models:', error);
    }
  };

  const loadDatabases = async () => {
    try {
      const response = await fetch('http://localhost:5044/api/utility/database/list');
      if (response.ok) {
        const data = await response.json();
        setDatabases(data.databases || []);
      }
    } catch (error) {
      console.error('Failed to load databases:', error);
    }
  };

  const deleteDatabase = async (databaseName: string) => {
    if (!window.confirm(`Are you sure you want to delete the database "${databaseName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5044/api/utility/database/${databaseName}/delete`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        // Remove from local state
        setDatabases(prev => prev.filter(db => db.name !== databaseName));
        
        // Clear selected database if it was the one deleted
        if (selectedDatabase === databaseName) {
          setSelectedDatabase(null);
          setDatabaseTables([]);
        }
        
        toast({
          title: "Database Deleted",
          description: `Database '${databaseName}' has been deleted successfully`,
        });
      } else {
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete database",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to delete database:', error);
      toast({
        title: "Error",
        description: "Failed to delete database",
        variant: "destructive"
      });
    }
  };

  const loadDatabaseTables = async (databaseName: string) => {
    setIsLoadingTables(true);
    try {
      const response = await fetch(`http://localhost:5044/api/utility/database/${databaseName}/tables`);
      if (response.ok) {
        const data = await response.json();
        setDatabaseTables(data.tables || []);
      } else {
        toast({
          title: "Failed to Load Tables",
          description: `Could not load tables for database ${databaseName}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to load database tables:', error);
      toast({
        title: "Error",
        description: "Failed to load database tables",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTables(false);
    }
  };

  const previewSchema = async () => {
    if (!newDatabase.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a database description",
        variant: "destructive"
      });
      return;
    }

    if (!newDatabase.model) {
      toast({
        title: "Missing Model",
        description: "Please select an LLM model",
        variant: "destructive"
      });
      return;
    }

    setIsPreviewingSchema(true);
    toast({
      title: "Generating Schema",
      description: `Using ${newDatabase.model} to analyze your request. This may take 30-60 seconds...`,
    });

    try {
      const response = await fetch('http://localhost:5044/api/utility/database/preview-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newDatabase.description,
          model: newDatabase.model
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setSchemaPreview(result);
        toast({
          title: "Schema Generated Successfully!",
          description: `${newDatabase.model} created ${result.parsed_tables?.length || 0} tables. Review and confirm.`,
        });
      } else {
        toast({
          title: "Preview Failed",
          description: result.error || "Failed to generate schema. Try a different model.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to preview schema:', error);
      toast({
        title: "Error",
        description: "LLM took too long or failed. Try a faster model like llama3.2:1b",
        variant: "destructive"
      });
    } finally {
      setIsPreviewingSchema(false);
    }
  };

  const confirmAndCreateDatabase = async () => {
    if (!newDatabase.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a database name",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:5044/api/utility/database/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDatabase)
      });
      
      const result = await response.json();
      if (result.success) {
        loadDatabases(); // Reload the list
        setNewDatabase({ name: '', description: '', model: selectedModel });
        setSchemaPreview(null); // Clear preview
        toast({
          title: "Database Created",
          description: `Database '${newDatabase.name}' created successfully!`,
        });
      } else {
        toast({
          title: "Creation Failed",
          description: result.error || "Failed to create database",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create database:', error);
      toast({
        title: "Error",
        description: "Failed to create database",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Create Database Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="text-blue-400" />
            Create New Database
          </CardTitle>
          <CardDescription>
            Describe what kind of database you want to create in natural language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="db-name">Database Name</Label>
            <Input
              id="db-name"
              value={newDatabase.name}
              onChange={(e) => setNewDatabase(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., customer_database, inventory_system, employee_records"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="llm-model">LLM Model</Label>
            <Select 
              value={newDatabase.model} 
              onValueChange={(value) => setNewDatabase(prev => ({ ...prev, model: value }))}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select an LLM model">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    {newDatabase.model || 'Select model'}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model} className="text-white">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      {model}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400 mt-1">
              Choose which AI model will generate your database schema
            </p>
          </div>
          
          <div>
            <Label htmlFor="db-description">Description</Label>
            <Textarea
              id="db-description"
              value={newDatabase.description}
              onChange={(e) => setNewDatabase(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the database structure, tables, and fields you need. For example: 'A customer database with customer information, orders, and products. Customers should have name, email, phone. Orders should link to customers and have order date, total amount. Products should have name, price, stock quantity.'"
              className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
            />
          </div>
          {!schemaPreview ? (
            <Button 
              onClick={previewSchema} 
              disabled={isPreviewingSchema || !newDatabase.description.trim() || !newDatabase.model}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isPreviewingSchema ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI is analyzing... (30-60s)
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4 mr-2" />
                  Let AI Generate Schema
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={confirmAndCreateDatabase} 
                disabled={isCreating || !newDatabase.name.trim()}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm & Create Database
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setSchemaPreview(null)}
                disabled={isCreating}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/20"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schema Preview */}
      {schemaPreview && (
        <Card className="bg-gray-800 border-gray-700 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="text-purple-400" />
              Proposed Database Schema
              <Badge variant="outline" className="text-xs bg-purple-500/20">
                AI-Suggested
              </Badge>
            </CardTitle>
            <CardDescription>
              The AI model <strong>{schemaPreview.model_used}</strong> analyzed your request and proposed the schema below. Review the tables, fields, and data types, then enter a database name and click "Confirm & Create" to save it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Parsed Tables Display */}
              {schemaPreview.parsed_tables && schemaPreview.parsed_tables.length > 0 && (
                <div className="space-y-4">
                  {schemaPreview.parsed_tables.map((table: any, index: number) => (
                    <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-400" />
                        Table: {table.table_name}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {table.columns.map((column: any, colIndex: number) => (
                          <div key={colIndex} className="bg-gray-800 p-2 rounded text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-white">{column.name}</span>
                              <span className="text-xs text-gray-400">{column.type}</span>
                            </div>
                            {column.constraints && column.constraints.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {column.constraints.map((constraint: string, cIndex: number) => (
                                  <Badge key={cIndex} variant="outline" className="text-xs">
                                    {constraint}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Raw SQL Display (always show as reference) */}
              {schemaPreview.schema && schemaPreview.schema.tables && (
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-400" />
                    Generated SQL Code
                  </h4>
                  <div className="bg-black/50 p-3 rounded font-mono text-xs text-green-300 overflow-x-auto">
                    {schemaPreview.schema.tables.map((sql: string, index: number) => (
                      <div key={index} className="mb-2">
                        {sql}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Generated by: {schemaPreview.generated_by} using {schemaPreview.model_used}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Databases */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="text-blue-400" />
          Created Databases ({databases.length})
        </h3>
        
        {databases.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <Database size={64} className="mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Databases Created</h3>
              <p className="text-gray-400 mb-6">
                Create your first database to get started with utility agents
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases.map((db) => (
              <Card key={db.name} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="text-blue-400" />
                    {db.name}
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(db.size)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Created: {formatDate(db.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedDatabase(selectedDatabase === db.name ? null : db.name);
                        if (selectedDatabase !== db.name) {
                          loadDatabaseTables(db.name);
                        }
                      }}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {selectedDatabase === db.name ? 'Hide' : 'View'} Tables
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteDatabase(db.name)}
                      className="border-red-500 text-red-400 hover:bg-red-500/20 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Database Tables */}
                  {selectedDatabase === db.name && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Tables
                        {isLoadingTables && <Loader2 className="h-3 w-3 animate-spin" />}
                      </h4>
                      
                      {databaseTables.length === 0 && !isLoadingTables ? (
                        <p className="text-xs text-gray-500">No tables found</p>
                      ) : (
                        <div className="space-y-2">
                          {databaseTables.map((table) => (
                            <div key={table.name} className="bg-gray-700/50 p-2 rounded text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-white">{table.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {table.columns} columns
                                </Badge>
                              </div>
                              <div className="text-gray-400">
                                {table.schema.slice(0, 3).map((col) => (
                                  <span key={col.name} className="mr-2">
                                    {col.name} ({col.type})
                                  </span>
                                ))}
                                {table.schema.length > 3 && (
                                  <span className="text-gray-500">+{table.schema.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

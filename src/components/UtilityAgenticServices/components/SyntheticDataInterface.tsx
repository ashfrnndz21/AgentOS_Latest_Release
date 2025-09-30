import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Database, Loader2, CheckCircle, AlertCircle, RefreshCw, Cpu, Eye } from 'lucide-react';
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

interface GenerationResult {
  success: boolean;
  result?: any;
  database_name?: string;
  table_name?: string;
  records_generated?: number;
  error?: string;
}

interface DataPreview {
  table_name: string;
  data: any[];
  schema: any[];
}

export const SyntheticDataInterface: React.FC = () => {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [recordCount, setRecordCount] = useState<number>(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [dataPreview, setDataPreview] = useState<DataPreview[]>([]);
  const [isInserting, setIsInserting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDatabases();
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const response = await fetch('http://localhost:5042/api/models/status');
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.available_models || []);
        setSelectedModel(data.primary_model || '');
      }
    } catch (error) {
      console.error('Failed to load available models:', error);
    }
  };

  useEffect(() => {
    if (selectedDatabase) {
      loadDatabaseTables(selectedDatabase);
    } else {
      setDatabaseTables([]);
      setSelectedTables([]);
    }
  }, [selectedDatabase]);

  const toggleTableSelection = (tableName: string) => {
    setSelectedTables(prev => {
      if (prev.includes(tableName)) {
        return prev.filter(t => t !== tableName);
      } else {
        return [...prev, tableName];
      }
    });
  };

  const toggleAllTables = () => {
    if (selectedTables.length === databaseTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(databaseTables.map(t => t.name));
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

  const loadDatabaseTables = async (databaseName: string) => {
    setIsLoadingTables(true);
    try {
      const response = await fetch(`http://localhost:5044/api/utility/database/${databaseName}/tables`);
      if (response.ok) {
        const data = await response.json();
        setDatabaseTables(data.tables || []);
        if (data.tables && data.tables.length > 0) {
          setSelectedTable(data.tables[0].name);
        }
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

  const previewGeneratedData = async () => {
    if (!selectedDatabase || selectedTables.length === 0) {
      toast({
        title: "Missing Selection",
        description: "Please select a database and at least one table",
        variant: "destructive"
      });
      return;
    }

    if (recordCount <= 0 || recordCount > 10000) {
      toast({
        title: "Invalid Count",
        description: "Record count must be between 1 and 10000",
        variant: "destructive"
      });
      return;
    }

    if (!selectedModel) {
      toast({
        title: "Missing Model",
        description: "Please select an LLM model",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    toast({
      title: "Generating Data Preview",
      description: `Using ${selectedModel} to generate data for ${selectedTables.length} table(s). This may take 30-90 seconds...`,
    });

    try {
      const previews: DataPreview[] = [];
      
      // Generate data for each selected table
      for (const tableName of selectedTables) {
        const response = await fetch('http://localhost:5044/api/utility/synthetic-data/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database_name: selectedDatabase,
            table_name: tableName,
            count: Math.min(recordCount, 10), // Preview only first 10 records
            model: selectedModel
          })
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          const tableInfo = databaseTables.find(t => t.name === tableName);
          previews.push({
            table_name: tableName,
            data: result.data,
            schema: tableInfo?.schema || []
          });
        }
      }
      
      if (previews.length > 0) {
        setDataPreview(previews);
        toast({
          title: "Data Preview Ready!",
          description: `Generated sample data for ${previews.length} table(s). Review and confirm to insert into database.`,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate data for any tables",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to preview data:', error);
      toast({
        title: "Error",
        description: "Failed to generate data preview",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmAndInsertData = async () => {
    setIsInserting(true);
    toast({
      title: "Inserting Data",
      description: `Inserting ${recordCount} records into ${selectedTables.length} table(s)...`,
    });

    try {
      const results = [];
      
      for (const tableName of selectedTables) {
        const response = await fetch('http://localhost:5044/api/utility/synthetic-data/populate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database_name: selectedDatabase,
            table_name: tableName,
            count: recordCount,
            model: selectedModel
          })
        });
        
        const result = await response.json();
        results.push({
          success: result.success,
          table_name: tableName,
          records_generated: result.records_generated,
          error: result.error
        });
      }
      
      const successCount = results.filter(r => r.success).length;
      
      setGenerationResults(prev => [...results, ...prev.slice(0, 9)]);
      
      if (successCount === results.length) {
        toast({
          title: "Data Inserted Successfully!",
          description: `Inserted data into ${successCount} table(s)`,
        });
        setDataPreview([]);
        setSelectedTables([]);
      } else {
        toast({
          title: "Partial Success",
          description: `Inserted data into ${successCount}/${results.length} tables`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to insert data:', error);
      toast({
        title: "Error",
        description: "Failed to insert data into database",
        variant: "destructive"
      });
    } finally {
      setIsInserting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Data Generation Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="text-blue-400" />
            Generate Synthetic Data
          </CardTitle>
          <CardDescription>
            Generate realistic synthetic data for your database tables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="database-select">Select Database</Label>
              <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Choose a database" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {databases.map((db) => (
                    <SelectItem key={db.name} value={db.name} className="text-white">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {db.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="model-select">LLM Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Choose AI model">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      {selectedModel || 'Select model'}
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
                AI model for data generation
              </p>
            </div>
          </div>
          
          {/* Table Multi-Select */}
          {selectedDatabase && databaseTables.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Select Tables to Populate</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={toggleAllTables}
                  className="text-xs"
                >
                  {selectedTables.length === databaseTables.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {databaseTables.map((table) => (
                  <div 
                    key={table.name}
                    onClick={() => toggleTableSelection(table.name)}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedTables.includes(table.name)
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selectedTables.includes(table.name) ? 'bg-blue-500 border-blue-500' : 'border-gray-500'
                      }`}>
                        {selectedTables.includes(table.name) && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">{table.name}</div>
                        <div className="text-xs text-gray-400">{table.columns} columns</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="record-count">Number of Records per Table</Label>
            <Input
              id="record-count"
              type="number"
              value={recordCount}
              onChange={(e) => setRecordCount(parseInt(e.target.value) || 0)}
              placeholder="Enter number of records to generate"
              min="1"
              max="10000"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter a number between 1 and 10,000 (will be generated for each selected table)
            </p>
          </div>
          
          {!dataPreview || dataPreview.length === 0 ? (
            <Button 
              onClick={previewGeneratedData}
              disabled={isGenerating || !selectedDatabase || selectedTables.length === 0 || !selectedModel || recordCount <= 0}
              className="bg-purple-600 hover:bg-purple-700 w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI Generating Preview... (30-90s)
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview AI-Generated Data
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={confirmAndInsertData}
                disabled={isInserting}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {isInserting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Inserting {recordCount} records...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm & Insert into Database
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setDataPreview([])}
                disabled={isInserting}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/20"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Preview */}
      {dataPreview && dataPreview.length > 0 && (
        <Card className="bg-gray-800 border-gray-700 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="text-purple-400" />
              AI-Generated Data Preview
              <Badge variant="outline" className="text-xs bg-purple-500/20">
                {dataPreview.length} table(s)
              </Badge>
            </CardTitle>
            <CardDescription>
              Review the sample data generated by {selectedModel}. Click "Confirm & Insert" to add {recordCount} records per table to your database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {dataPreview.map((preview, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  <h4 className="font-semibold text-white">{preview.table_name}</h4>
                  <Badge variant="outline">{preview.data.length} sample records</Badge>
                </div>
                
                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-600 rounded">
                    <thead className="bg-gray-700">
                      <tr>
                        {Object.keys(preview.data[0] || {}).map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-white font-medium border-b border-gray-600">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/50">
                      {preview.data.slice(0, 5).map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-gray-700">
                          {Object.values(row).map((value: any, colIdx) => (
                            <td key={colIdx} className="px-3 py-2 text-gray-300">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.data.length > 5 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Showing 5 of {preview.data.length} generated samples. {recordCount - preview.data.length} more will be generated on confirmation.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Generation Results */}
      {generationResults.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="text-blue-400" />
              Recent Generation Results
            </CardTitle>
            <CardDescription>
              History of synthetic data generation operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generationResults.map((result, index) => (
                <div key={index} className="bg-gray-700/50 p-3 rounded border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="font-medium text-white">
                        {result.database_name} → {result.table_name}
                      </span>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    {result.success ? (
                      <p>Generated {result.records_generated} records successfully</p>
                    ) : (
                      <p className="text-red-400">Error: {result.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Databases Message */}
      {databases.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-12">
            <Database size={64} className="mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Databases Available</h3>
            <p className="text-gray-400 mb-6">
              Create a database first using the Database Agent tab
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

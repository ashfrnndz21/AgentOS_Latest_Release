import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Hash, 
  Clock, 
  Database, 
  Zap, 
  RefreshCw,
  Eye,
  BarChart3,
  Search
} from 'lucide-react';

interface DocumentMetadata {
  document_id: string;
  filename: string;
  chunks_created: number;
  pages_processed: number;
  model_name: string;
  ingested_at: string;
  vector_store_type: string;
  embeddings_type: string;
  file_size?: number;
  processing_time?: number;
}

interface ChunkDetails {
  chunk_id: string;
  content: string;
  metadata: {
    document_id: string;
    chunk_index: number;
    page_number?: number;
    char_start: number;
    char_end: number;
  };
  embedding_vector?: number[];
}

interface RAGStats {
  total_documents: number;
  total_chunks: number;
  vector_stores: number;
  active_chains: number;
  embeddings_type: string;
  vector_db_type: string;
}

export const DocumentMetadataPanel: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [chunks, setChunks] = useState<ChunkDetails[]>([]);
  const [ragStats, setRagStats] = useState<RAGStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load documents and stats
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load documents
      const docsResponse = await fetch('http://localhost:5002/api/rag/documents');
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setDocuments(docsData.documents || []);
      }

      // Load RAG stats
      const statsResponse = await fetch('http://localhost:5002/api/rag/status');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setRagStats(statsData.stats);
      }
    } catch (error) {
      console.error('Failed to load metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load chunks for selected document
  const loadChunks = async (documentId: string) => {
    try {
      const response = await fetch(`http://localhost:5002/api/rag/documents/${documentId}/chunks`);
      if (response.ok) {
        const data = await response.json();
        setChunks(data.chunks || []);
      }
    } catch (error) {
      console.error('Failed to load chunks:', error);
      setChunks([]);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedDoc) {
      loadChunks(selectedDoc);
    }
  }, [selectedDoc]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4 text-blue-400" />
              Document Metadata & Chunks
            </CardTitle>
            <CardDescription>
              Real-time RAG pipeline processing details
            </CardDescription>
          </div>
          <Button
            onClick={loadData}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="chunks">Chunks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {ragStats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Total Documents:</span>
                    <Badge variant="secondary">{ragStats.total_documents}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Total Chunks:</span>
                    <Badge variant="secondary">{ragStats.total_chunks}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Vector Stores:</span>
                    <Badge variant="secondary">{ragStats.vector_stores}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Embeddings:</span>
                    <Badge variant="outline">{ragStats.embeddings_type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Vector DB:</span>
                    <Badge variant="outline">{ragStats.vector_db_type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Active Chains:</span>
                    <Badge variant="outline">{ragStats.active_chains}</Badge>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <ScrollArea className="h-64">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No documents processed yet</p>
                  <p className="text-xs">Upload a document to see metadata</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card 
                      key={doc.document_id} 
                      className={`bg-gray-900 border-gray-600 cursor-pointer transition-colors ${
                        selectedDoc === doc.document_id ? 'border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedDoc(doc.document_id)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm truncate">{doc.filename}</span>
                            <Badge variant="secondary" className="text-xs">
                              {doc.chunks_created} chunks
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              Pages: {doc.pages_processed}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Model: {doc.model_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(doc.ingested_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {doc.vector_store_type}
                            </div>
                          </div>
                          
                          {doc.file_size && (
                            <div className="text-xs text-gray-500">
                              Size: {formatFileSize(doc.file_size)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chunks" className="space-y-4">
            {!selectedDoc ? (
              <div className="text-center py-8 text-gray-400">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a document to view chunks</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {chunks.map((chunk, index) => (
                    <Card key={chunk.chunk_id} className="bg-gray-900 border-gray-600">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              Chunk {chunk.metadata.chunk_index + 1}
                            </Badge>
                            <div className="text-xs text-gray-400">
                              {chunk.metadata.char_start}-{chunk.metadata.char_end}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-300 bg-gray-800 p-2 rounded max-h-20 overflow-y-auto">
                            {chunk.content.substring(0, 200)}
                            {chunk.content.length > 200 && '...'}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {chunk.metadata.page_number && (
                              <span>Page {chunk.metadata.page_number}</span>
                            )}
                            <span>Length: {chunk.content.length} chars</span>
                            {chunk.embedding_vector && (
                              <span>Vector: {chunk.embedding_vector.length}D</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
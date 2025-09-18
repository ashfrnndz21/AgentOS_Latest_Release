
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Database, Bot, Brain, AlertCircle } from 'lucide-react';
import { useRagWorkflow } from '@/hooks/useRagWorkflow';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupabaseApiKey } from '@/hooks/useSupabaseApiKey';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface RagDemoProps {
  query?: string;
}

export const RagDemo: React.FC<RagDemoProps> = ({ query = "What are the most common network issues in the downtown area?" }) => {
  const { executeQuery, isLoading, result, error } = useRagWorkflow('openai');
  const [hasRun, setHasRun] = useState(false);
  const { apiKey: openaiKey, isValid: openaiValid } = useSupabaseApiKey('openai');
  const { apiKey: pineconeKey, isValid: pineconeValid } = useSupabaseApiKey('pinecone');
  
  // Check if vector store configuration exists
  const [vectorStoreConfigured, setVectorStoreConfigured] = useState(false);

  useEffect(() => {
    // Check if vector store configuration exists in localStorage
    const provider = localStorage.getItem('vectorstore-provider');
    const index = localStorage.getItem('vectorstore-index');
    setVectorStoreConfigured(!!provider && !!index);
  }, []);
  
  const handleRunQuery = async () => {
    if (!openaiValid) {
      toast.error("OpenAI API key is required for embeddings. Please add it in Settings > API Keys.");
      return;
    }
    
    if (!pineconeValid && localStorage.getItem('vectorstore-provider') === 'pinecone') {
      toast.error("Pinecone API key is required. Please add it in Settings > AI Services > Vector Database.");
      return;
    }
    
    if (!vectorStoreConfigured) {
      toast.error("Vector store is not configured. Please configure it in Settings > AI Services > Vector Database.");
      return;
    }
    
    try {
      await executeQuery(query);
      setHasRun(true);
    } catch (err: any) {
      toast.error(`RAG query failed: ${err.message}`);
    }
  };
  
  // Determine if all requirements are met
  const isConfigured = openaiValid && 
    ((localStorage.getItem('vectorstore-provider') === 'pinecone' && pineconeValid) || 
     localStorage.getItem('vectorstore-provider') !== 'pinecone') && 
    vectorStoreConfigured;
  
  return (
    <Card className="bg-beam-dark-accent/30 border-gray-700/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Search className="h-4 w-4 mr-2 text-blue-400" />
              RAG Query Demonstration
            </h3>
            <Button 
              size="sm" 
              onClick={handleRunQuery}
              disabled={isLoading || !isConfigured}
            >
              {isLoading ? 'Processing...' : (hasRun ? 'Run Again' : 'Run Demo')}
            </Button>
          </div>
          
          <div className="bg-beam-dark/50 p-4 rounded-md border border-gray-700/50">
            <p className="text-gray-300 italic">"{query}"</p>
          </div>
          
          {!isConfigured && (
            <div className="bg-amber-950/20 p-4 rounded-md border border-amber-900/30">
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-300 text-sm font-medium mb-2">Configuration Required</p>
                  <ul className="text-amber-200/80 text-sm space-y-1 list-disc list-inside">
                    {!openaiValid && (
                      <li>OpenAI API key is required for embeddings</li>
                    )}
                    {!pineconeValid && localStorage.getItem('vectorstore-provider') === 'pinecone' && (
                      <li>Pinecone API key is required for vector storage</li>
                    )}
                    {!vectorStoreConfigured && (
                      <li>Vector database needs to be configured</li>
                    )}
                    <li className="mt-2">
                      <Link to="/settings" className="text-blue-400 hover:text-blue-300 underline">
                        Configure in Settings → AI Services
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-blue-400" />
                <span className="text-blue-400 text-sm">Retrieving relevant documents...</span>
              </div>
              <Skeleton className="h-24 w-full bg-beam-dark/50" />
              
              <div className="flex items-center">
                <Brain className="h-4 w-4 mr-2 text-purple-400" />
                <span className="text-purple-400 text-sm">Generating response...</span>
              </div>
              <Skeleton className="h-32 w-full bg-beam-dark/50" />
            </div>
          )}
          
          {error && !isLoading && (
            <div className="bg-red-950/20 p-4 rounded-md border border-red-900/30">
              <p className="text-red-400 text-sm">Error: {error}</p>
            </div>
          )}
          
          {!isLoading && result && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <Bot className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-white text-sm font-semibold">Answer</span>
                </div>
                <div className="bg-beam-dark/30 p-4 rounded-md border border-green-900/30 text-white">
                  {result.answer}
                </div>
              </div>
              
              {result.reasoning && (
                <div>
                  <div className="flex items-center mb-2">
                    <Brain className="h-4 w-4 mr-2 text-purple-400" />
                    <span className="text-white text-sm font-semibold">Reasoning</span>
                  </div>
                  <div className="bg-beam-dark/30 p-4 rounded-md border border-purple-900/30 text-gray-300">
                    {result.reasoning}
                  </div>
                </div>
              )}
              
              <div>
                <div className="flex items-center mb-2">
                  <Database className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-white text-sm font-semibold">Retrieved Documents</span>
                </div>
                <div className="space-y-3">
                  {result.documents.map((doc, index) => (
                    <div 
                      key={index}
                      className="bg-beam-dark/30 p-4 rounded-md border border-blue-900/30"
                    >
                      <h4 className="text-white text-sm font-semibold mb-1">{doc.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{doc.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(doc.metadata).map(([key, value]) => (
                          <span 
                            key={key}
                            className="bg-beam-dark/50 px-2 py-1 rounded-md text-gray-400 text-xs"
                          >
                            {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {!isLoading && !result && !hasRun && isConfigured && (
            <div className="bg-blue-950/20 p-4 rounded-md border border-blue-900/30">
              <p className="text-blue-300 text-sm">
                This demo shows a Retrieval-Augmented Generation (RAG) workflow in action. 
                Click "Run Demo" to see how the system retrieves relevant documents from a
                vector database and uses them to generate a contextually relevant response.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

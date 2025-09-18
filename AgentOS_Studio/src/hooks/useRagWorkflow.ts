
import { useState } from 'react';
import { useVectorStore } from '@/utils/vectorStore';
import { useModelProvider, ModelProvider } from '@/hooks/useModelProvider';
import { useRAGService, RAGConfig } from '@/utils/ragService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface RAGWorkflowResult {
  answer: string;
  documents: {
    id: string;
    title: string;
    content: string;
    metadata: Record<string, any>;
  }[];
  reasoning?: string;
  confidence?: number;
}

// In-memory storage for RAG queries since we can't use the rag_queries table
const ragQueriesStorage: {
  query: string;
  result: RAGWorkflowResult;
  vector_store: string;
  model_provider: string;
  model_id: string;
  timestamp: string;
}[] = [];

export const useRagWorkflow = (provider: ModelProvider = 'openai') => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RAGWorkflowResult | null>(null);
  
  const { getVectorStoreService } = useVectorStore();
  const { 
    selectedModel, 
    validateConfiguration 
  } = useModelProvider(provider);
  const { getRAGService } = useRAGService();
  
  const executeQuery = async (
    query: string, 
    vectorStoreProvider: string = localStorage.getItem('vectorstore-provider') || 'pinecone', 
    vectorStoreName: string = localStorage.getItem('vectorstore-index') || 'telco-knowledge',
    options?: {
      topK?: number;
      reranker?: {
        enabled: boolean;
        model?: string;
        threshold?: number;
      };
    }
  ): Promise<RAGWorkflowResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Executing RAG query: "${query}" using provider: ${vectorStoreProvider}, store: ${vectorStoreName}`);
      
      // Check if vector store provider and name are configured
      if (!vectorStoreProvider || !vectorStoreName) {
        throw new Error('Vector store not configured. Please configure it in Settings > AI Services > Vector Database.');
      }
      
      // Validate model configuration
      const isModelConfigValid = validateConfiguration();
      
      if (!isModelConfigValid) {
        throw new Error(`Invalid model configuration for ${provider}. Please check your API key in Settings > API Keys.`);
      }
      
      // Get OpenAI API key for embeddings
      const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('service_name', 'openai')
        .single();
      
      if (keyError) {
        console.error('Error fetching OpenAI API key:', keyError);
        throw new Error('Failed to retrieve OpenAI API key. Please check it is configured in Settings > API Keys.');
      }
      
      if (!keyData?.key_value) {
        throw new Error('OpenAI API key is required for embeddings. Please add it in Settings > API Keys.');
      }
      
      // Get vector store service
      const vectorStore = await getVectorStoreService(
        vectorStoreProvider as any, 
        vectorStoreName,
        {
          environment: localStorage.getItem('vectorstore-environment') || 'gcp-starter'
        }
      );
      
      if (!vectorStore) {
        throw new Error(`Failed to initialize vector store ${vectorStoreProvider}. Please check your configuration in Settings.`);
      }
      
      // Configure RAG service
      const ragConfig: RAGConfig = {
        vectorStoreProvider: vectorStoreProvider as any,
        vectorStoreName,
        modelProvider: provider,
        modelId: selectedModel || '',
        topK: options?.topK || 3,
        reranker: options?.reranker
      };
      
      // Get RAG service
      const ragService = await getRAGService(ragConfig, vectorStore);
      
      if (!ragService) {
        throw new Error('Failed to initialize RAG service. Please check your API keys and vector store configuration.');
      }
      
      // Execute query
      const queryResult = await ragService.query(query);
      setResult(queryResult);
      
      // Store query in in-memory storage
      ragQueriesStorage.push({
        query,
        result: queryResult,
        vector_store: vectorStoreProvider,
        model_provider: provider,
        model_id: selectedModel || '',
        timestamp: new Date().toISOString()
      });
      
      // Log for debugging
      console.log('RAG Query result:', queryResult);
      
      return queryResult;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to execute RAG query';
      console.error('RAG query error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    executeQuery,
    isLoading,
    error,
    result
  };
};

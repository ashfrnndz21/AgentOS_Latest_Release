
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

// Define our custom vector store interface to ensure consistent API
export interface CustomVectorStore {
  search(query: string, options?: { topK?: number }): Promise<any[]>;
  addDocuments(documents: any[]): Promise<any>;
}

export type VectorStoreProvider = 'pinecone' | 'supabase' | 'chroma';

export class VectorStoreService {
  private provider: VectorStoreProvider;
  private indexName: string;
  private options: Record<string, any>;
  private vectorStore: CustomVectorStore | null = null;
  
  constructor(provider: VectorStoreProvider, indexName: string, options: Record<string, any> = {}) {
    this.provider = provider;
    this.indexName = indexName;
    this.options = options;
  }
  
  async initialize(): Promise<boolean> {
    try {
      console.log(`Initializing vector store: ${this.provider}, index: ${this.indexName}`);
      
      // Get OpenAI API key for embeddings
      const { data: keyData } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('service_name', 'openai')
        .single();
      
      if (!keyData?.key_value) {
        throw new Error('OpenAI API key is required for embeddings');
      }
      
      const embeddings = new OpenAIEmbeddings({ 
        openAIApiKey: keyData.key_value 
      });
      
      if (this.provider === 'pinecone') {
        return await this.initializePinecone(embeddings);
      } else if (this.provider === 'supabase') {
        return await this.initializeSupabase(embeddings);
      } else if (this.provider === 'chroma') {
        return await this.initializeChroma(embeddings);
      } else {
        throw new Error(`Unsupported vector store provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Error initializing vector store:', error);
      return false;
    }
  }
  
  private async initializePinecone(embeddings: any): Promise<boolean> {
    try {
      // Get Pinecone API key
      const { data: keyData } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('service_name', 'pinecone')
        .single();
      
      if (!keyData?.key_value) {
        throw new Error('Pinecone API key is required');
      }
      
      // Initialize Pinecone client
      const pinecone = new Pinecone({
        apiKey: keyData.key_value,
      });
      
      // Check if the index exists
      const indexes = await pinecone.listIndexes();
      const indexExists = indexes.indexes?.find((index: any) => index.name === this.indexName);
      
      if (!indexExists) {
        console.log(`Creating new Pinecone index: ${this.indexName}`);
        await pinecone.createIndex({
          name: this.indexName,
          dimension: 1536, // OpenAI embeddings dimensions
          metric: 'cosine',
          spec: { serverless: { cloud: 'aws', region: 'us-west-2' } }
        });
        
        // Wait a bit for the index to initialize
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Get index
      const index = pinecone.index(this.indexName);
      
      // Create a Pinecone vector store
      const pineconeStore = await PineconeStore.fromExistingIndex(
        embeddings,
        { pineconeIndex: index }
      );
      
      // Create a wrapper to adapt the PineconeStore to our CustomVectorStore interface
      this.vectorStore = {
        async search(query: string, options?: { topK?: number }) {
          const results = await pineconeStore.similaritySearch(
            query, 
            options?.topK || 5
          );
          
          return results.map(result => ({
            id: result.id || Math.random().toString(36).substring(2, 15),
            content: result.pageContent,
            metadata: result.metadata || {}
          }));
        },
        
        async addDocuments(documents: any[]) {
          // Format documents for Pinecone
          const formattedDocs = documents.map(doc => ({
            pageContent: doc.content,
            metadata: doc.metadata || {}
          }));
          
          await pineconeStore.addDocuments(formattedDocs);
          return documents.map(doc => doc.id);
        }
      };
      
      return true;
    } catch (error) {
      console.error('Error initializing Pinecone:', error);
      return false;
    }
  }
  
  private async initializeSupabase(embeddings: any): Promise<boolean> {
    // Not implemented yet
    console.log('Supabase vector store not implemented yet');
    return false;
  }
  
  private async initializeChroma(embeddings: any): Promise<boolean> {
    try {
      // Not implemented yet, using in-memory fallback for now
      console.log('Using in-memory fallback for Chroma');
      
      // Create a simple in-memory vector store
      const documents: any[] = [];
      
      this.vectorStore = {
        async search(query: string, options?: { topK?: number }) {
          // Very simple search that just returns all documents
          // In a real implementation, we would use embeddings to find similar documents
          return documents.slice(0, options?.topK || 5);
        },
        
        async addDocuments(newDocuments: any[]) {
          // Just add the documents to the in-memory array
          documents.push(...newDocuments);
          return newDocuments;
        }
      };
      
      return true;
    } catch (error) {
      console.error('Error initializing Chroma:', error);
      return false;
    }
  }
  
  async search(query: string, options?: { topK?: number }): Promise<any[]> {
    try {
      if (!this.vectorStore) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize vector store');
        }
      }
      
      return await this.vectorStore!.search(query, options);
    } catch (error) {
      console.error('Error searching vector store:', error);
      return [];
    }
  }
  
  async addDocuments(documents: any[]): Promise<boolean> {
    try {
      if (!this.vectorStore) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize vector store');
        }
      }
      
      await this.vectorStore!.addDocuments(documents);
      return true;
    } catch (error) {
      console.error('Error adding documents to vector store:', error);
      return false;
    }
  }
}

export const useVectorStore = () => {
  const getVectorStoreService = async (
    provider: VectorStoreProvider,
    indexName: string,
    options: Record<string, any> = {}
  ): Promise<VectorStoreService | null> => {
    try {
      const service = new VectorStoreService(provider, indexName, options);
      const initialized = await service.initialize();
      
      if (initialized) {
        toast.success(`Vector store ${provider} initialized successfully`);
        
        // Get session to check if we're authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        
        // Record service in backend_connections if we're authenticated
        if (sessionData?.session?.user?.id) {
          const { error } = await supabase
            .from('backend_connections')
            .upsert({
              service_type: 'vector_store',
              service_name: provider,
              connection_status: 'Connected',
              is_enabled: true,
              settings: JSON.stringify({
                provider,
                indexName,
                ...options
              }),
              user_id: sessionData.session.user.id
            });
          
          if (error) {
            console.error('Failed to record vector store service:', error);
          }
        }
        
        return service;
      } else {
        toast.error(`Failed to initialize vector store ${provider}`);
        return null;
      }
    } catch (error: any) {
      console.error('Error creating vector store service:', error);
      toast.error(`Failed to create vector store service: ${error.message}`);
      return null;
    }
  };
  
  return { getVectorStoreService };
};


import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { ModelProvider } from '@/utils/models/modelTypes';

export interface RAGConfig {
  vectorStoreProvider: 'pinecone' | 'supabase' | 'chroma';
  vectorStoreName: string;
  modelProvider: ModelProvider;
  modelId: string;
  topK?: number;
  reranker?: {
    enabled: boolean;
    model?: string;
    threshold?: number;
  };
}

export interface RAGDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  title?: string;
}

export interface RAGResult {
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

export class RAGService {
  private config: RAGConfig;
  private vectorStore: any;
  private model: any;
  
  constructor(config: RAGConfig, vectorStore: any) {
    this.config = config;
    this.vectorStore = vectorStore;
  }
  
  async initializeModel(): Promise<boolean> {
    try {
      const { data: keyData } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('service_name', this.config.modelProvider)
        .single();
      
      if (!keyData?.key_value && this.config.modelProvider !== 'ollama') {
        throw new Error(`API key not found for ${this.config.modelProvider}`);
      }
      
      const apiKey = keyData?.key_value;
      
      // Initialize the model based on the provider
      if (this.config.modelProvider === 'openai') {
        this.model = new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: this.config.modelId,
          temperature: 0.2
        });
      } else if (this.config.modelProvider === 'anthropic') {
        // We'll handle Anthropic without dynamic import since the package might not be installed
        console.log("Anthropic support was requested but might not be available");
        try {
          // Instead of using dynamic import which may cause issues, we'll import it directly at runtime
          this.model = new (require('@langchain/anthropic').ChatAnthropic)({
            anthropicApiKey: apiKey,
            modelName: this.config.modelId,
            temperature: 0.2
          });
        } catch (error) {
          console.error("Failed to load Anthropic module:", error);
          throw new Error("Anthropic module is not available. Please install @langchain/anthropic package");
        }
      } else if (this.config.modelProvider === 'google') {
        // Handle Google AI similarly
        console.log("Google AI support was requested");
        try {
          this.model = new (require('@langchain/google-genai').ChatGoogleGenerativeAI)({
            apiKey,
            model: this.config.modelId,
            temperature: 0.2
          });
        } catch (error) {
          console.error("Failed to load Google Generative AI module:", error);
          throw new Error("Google Generative AI module is not available");
        }
      } else {
        // Local model (Ollama)
        // Currently not implemented
        throw new Error('Ollama integration is not yet implemented');
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing RAG model:', error);
      return false;
    }
  }
  
  async query(question: string): Promise<RAGResult> {
    try {
      console.log(`Querying RAG system with question: ${question}`);
      
      // Initialize the model if not done yet
      if (!this.model) {
        const initialized = await this.initializeModel();
        if (!initialized) {
          throw new Error('Failed to initialize model');
        }
      }
      
      // Retrieve relevant documents
      const rawDocuments = await this.vectorStore.search(question, {
        topK: this.config.topK || 3
      });
      
      // Format the documents for the response
      const documents = rawDocuments.map(doc => ({
        id: doc.id,
        title: doc.metadata?.source || 'Unknown Source',
        content: doc.content,
        metadata: doc.metadata || {}
      }));
      
      // Rerank documents if enabled
      let finalDocuments = documents;
      if (this.config.reranker?.enabled) {
        // Implement reranking logic here
        // For now, just use the raw documents
        finalDocuments = documents;
      }
      
      // Create prompt template
      const prompt = ChatPromptTemplate.fromTemplate(`
        Answer the question based on the following context:

        <context>
        {context}
        </context>

        Question: {question}

        Provide a detailed answer that directly addresses the question. Include specific information from the context when relevant.
        Include a reasoning section at the end that explains your thought process.
      `);
      
      // Convert documents to a single context string
      const context = finalDocuments.map(doc => doc.content).join("\n\n");
      
      // Create a chain to process the query
      const chain = RunnableSequence.from([
        {
          context: () => context,
          question: () => question,
        },
        prompt,
        this.model,
        new StringOutputParser(),
      ]);
      
      // Execute chain
      const response = await chain.invoke({});
      
      // Extract reasoning if possible
      let answer = response;
      let reasoning = "";
      
      if (answer.includes("Reasoning:")) {
        const parts = answer.split("Reasoning:");
        answer = parts[0].trim();
        reasoning = parts[1].trim();
      }
      
      // Calculate confidence score (simple implementation)
      const confidence = this.calculateConfidence(finalDocuments);
      
      // Get session to check if we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Record the RAG query if we're authenticated
      if (sessionData?.session?.user?.id) {
        try {
          const { error } = await supabase
            .from('backend_connections')
            .upsert({
              service_type: 'rag',
              service_name: this.config.vectorStoreProvider,
              connection_status: 'Connected',
              is_enabled: true,
              settings: JSON.stringify(this.config),
              user_id: sessionData.session.user.id
            });
          
          if (error) {
            console.error('Failed to record RAG query:', error);
          }
        } catch (recordError) {
          console.error('Error recording RAG query:', recordError);
        }
      }
      
      return {
        answer,
        documents: finalDocuments,
        reasoning,
        confidence
      };
    } catch (error: any) {
      console.error('Error querying RAG system:', error);
      
      // Return fallback result if there's an error
      return {
        answer: `Error: ${error.message}`,
        documents: [],
        reasoning: `Error occurred: ${error.message}`,
        confidence: 0
      };
    }
  }
  
  private calculateConfidence(documents: any[]): number {
    // Simple confidence calculation based on document relevance
    if (documents.length === 0) return 0;
    
    // Check if documents have relevance scores
    const hasRelevance = documents.some(doc => doc.metadata?.relevance);
    
    if (hasRelevance) {
      // Average the relevance scores
      const totalRelevance = documents.reduce((sum, doc) => {
        return sum + (doc.metadata?.relevance || 0);
      }, 0);
      
      return totalRelevance / documents.length;
    }
    
    // Default confidence
    return 0.75;
  }
  
  async addDocuments(documents: RAGDocument[]): Promise<boolean> {
    try {
      console.log(`Adding ${documents.length} documents to RAG system`);
      
      // Process and chunk the documents
      const processedDocs = documents.map(doc => ({
        id: doc.id,
        content: doc.content,
        metadata: {
          ...doc.metadata,
          title: doc.title || doc.metadata?.title || 'Untitled',
          source: doc.metadata?.source || doc.title || 'Unknown Source'
        }
      }));
      
      // Store in the vector store
      const result = await this.vectorStore.addDocuments(processedDocs);
      
      return !!result;
    } catch (error) {
      console.error('Error adding documents to RAG system:', error);
      return false;
    }
  }
}

export const useRAGService = () => {
  const getRAGService = async (
    config: RAGConfig,
    vectorStore: any
  ): Promise<RAGService | null> => {
    try {
      const service = new RAGService(config, vectorStore);
      
      // Get session to check if we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Record service in backend_connections if we're authenticated
      if (sessionData?.session?.user?.id) {
        const { error } = await supabase
          .from('backend_connections')
          .upsert({
            service_type: 'rag',
            service_name: config.vectorStoreProvider,
            connection_status: 'Connected',
            is_enabled: true,
            settings: JSON.stringify(config),
            user_id: sessionData.session.user.id
          });
        
        if (error) {
          console.error('Failed to record RAG service:', error);
        }
      }
      
      return service;
    } catch (error: any) {
      console.error('Error creating RAG service:', error);
      toast.error(`Failed to create RAG service: ${error.message}`);
      return null;
    }
  };
  
  return { getRAGService };
};

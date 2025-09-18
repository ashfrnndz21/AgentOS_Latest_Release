
import { useState, useEffect } from 'react';
import { ModelProvider } from '@/utils/models/modelTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatOpenAI } from '@langchain/openai';
// We'll handle different model providers conditionally to avoid import errors
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export interface LangChainConfig {
  modelProvider: ModelProvider;
  modelId: string;
  verbose?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export class LangChainService {
  private config: LangChainConfig;
  private llm: any;
  private isInitialized: boolean = false;
  
  constructor(config: LangChainConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing LangChain service');
      
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
        this.llm = new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: this.config.modelId,
          temperature: this.config.temperature || 0.7,
          maxTokens: this.config.maxTokens,
          verbose: this.config.verbose,
        });
      } else if (this.config.modelProvider === 'anthropic') {
        try {
          // Use require instead of dynamic import to avoid errors
          const { ChatAnthropic } = require('@langchain/anthropic');
          this.llm = new ChatAnthropic({
            anthropicApiKey: apiKey,
            modelName: this.config.modelId,
            temperature: this.config.temperature || 0.7,
            maxTokens: this.config.maxTokens,
            verbose: this.config.verbose,
          });
        } catch (error) {
          console.error("Failed to load Anthropic module:", error);
          throw new Error("Anthropic module is not available. Please install @langchain/anthropic package");
        }
      } else if (this.config.modelProvider === 'google') {
        // Adapt to what Google AI actually accepts for parameters
        try {
          const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
          this.llm = new ChatGoogleGenerativeAI({
            apiKey,
            model: this.config.modelId, // Use model instead of modelName
            temperature: this.config.temperature || 0.7,
            maxOutputTokens: this.config.maxTokens, // Use maxOutputTokens instead of maxTokens
            verbose: this.config.verbose,
          });
        } catch (error) {
          console.error("Failed to load Google Generative AI module:", error);
          throw new Error("Google Generative AI module is not available");
        }
      } else if (this.config.modelProvider === 'ollama') {
        // Local model (Ollama) - not implemented yet
        throw new Error('Ollama integration is not yet implemented');
      } else {
        throw new Error(`Unsupported model provider: ${this.config.modelProvider}`);
      }
      
      this.isInitialized = true;
      
      // Get session to check if we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Record the service in the backend_connections table
      if (sessionData?.session?.user?.id) {
        const { error } = await supabase
          .from('backend_connections')
          .upsert({
            service_type: 'llm',
            service_name: this.config.modelProvider,
            connection_status: 'Connected',
            is_enabled: true,
            settings: JSON.stringify({ 
              modelProvider: this.config.modelProvider,
              modelId: this.config.modelId,
              temperature: this.config.temperature,
              maxTokens: this.config.maxTokens
            }),
            user_id: sessionData.session.user.id
          });
        
        if (error) {
          console.error('Failed to record LangChain service:', error);
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('Error initializing LangChain service:', error);
      return false;
    }
  }
  
  async generateResponse(
    prompt: string,
    chatHistory: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      console.log('Generating response with LangChain');
      
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize LangChain service');
        }
      }
      
      // Create system prompt
      const systemTemplate = 
        "You are an AI assistant helping with a telecom project. Be concise and helpful. " +
        "If the query is about network infrastructure, analyze capacity needs and ROI. " +
        "If it's about customer data, focus on segmentation and lifetime value.";
      
      // Create proper message objects for LangChain
      const messages = [
        new SystemMessage(systemTemplate)
      ];
      
      // Add history messages
      for (const msg of chatHistory) {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        }
        // Assistant messages will be handled by the chain
      }
      
      // Add the current prompt as a human message
      messages.push(new HumanMessage(prompt));
      
      // Create chat template using the correct format
      const chatPrompt = ChatPromptTemplate.fromMessages(messages);
      
      // Create chain
      const chain = RunnableSequence.from([
        chatPrompt,
        this.llm,
        new StringOutputParser()
      ]);
      
      // Execute chain
      const response = await chain.invoke({});
      
      return response;
    } catch (error: any) {
      console.error('Error generating response with LangChain:', error);
      throw error;
    }
  }
}

export const useLangChain = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(
    localStorage.getItem('langchain-enabled') !== 'false'
  );
  
  useEffect(() => {
    localStorage.setItem('langchain-enabled', String(isEnabled));
  }, [isEnabled]);
  
  const getLangChainService = async (
    config: LangChainConfig
  ): Promise<LangChainService | null> => {
    try {
      if (!isEnabled) {
        console.log('LangChain is disabled. Not creating service.');
        return null;
      }
      
      const service = new LangChainService(config);
      const initialized = await service.initialize();
      
      if (initialized) {
        toast.success('LangChain service initialized successfully');
        return service;
      } else {
        toast.error('Failed to initialize LangChain service');
        return null;
      }
    } catch (error: any) {
      console.error('Error creating LangChain service:', error);
      toast.error(`Failed to create LangChain service: ${error.message}`);
      return null;
    }
  };
  
  return {
    isEnabled,
    setIsEnabled,
    getLangChainService
  };
};

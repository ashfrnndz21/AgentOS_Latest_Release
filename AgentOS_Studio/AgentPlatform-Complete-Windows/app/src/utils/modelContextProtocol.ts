import { useState, useEffect } from 'react';
import { ModelProvider } from '@/utils/models/modelTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MCPConfig {
  trackReasoning: boolean;
  trackSources: boolean;
  trackTools: boolean;
  modelProvider: ModelProvider;
  modelId: string;
}

export interface MCPContext {
  reasoning?: string;
  sources?: {
    id: string;
    title: string;
    content: string;
    relevance: number;
  }[];
  tools?: {
    name: string;
    input: any;
    output: any;
    timestamp: string;
  }[];
}

export interface MCPResponse {
  content: string;
  context: MCPContext;
}

export class MCPService {
  private config: MCPConfig;
  private userId: string | null;
  
  constructor(config: MCPConfig, userId: string | null = null) {
    this.config = config;
    this.userId = userId;
  }
  
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing Model Context Protocol service');
      
      // For demo purposes, return successful initialization
      return true;
    } catch (error) {
      console.error('Error initializing MCP service:', error);
      return false;
    }
  }
  
  // Process a response to extract context according to MCP format
  processResponse(rawResponse: any): MCPResponse {
    try {
      // For demo purposes, simulate MCP processing
      // In a real implementation, this would parse the model's response
      // to extract structured information
      
      const response: MCPResponse = {
        content: typeof rawResponse === 'string' 
          ? rawResponse 
          : rawResponse.content || rawResponse.answer || 'No content found',
        context: {}
      };
      
      // Add reasoning if enabled and available
      if (this.config.trackReasoning && rawResponse.reasoning) {
        response.context.reasoning = rawResponse.reasoning;
      }
      
      // Add sources if enabled and available
      if (this.config.trackSources && rawResponse.sources) {
        response.context.sources = rawResponse.sources;
      } else if (this.config.trackSources && rawResponse.documents) {
        // Convert documents to sources format if necessary
        response.context.sources = rawResponse.documents.map((doc: any) => ({
          id: doc.id || String(Math.random()),
          title: doc.title || 'Unknown',
          content: doc.content || doc.text || '',
          relevance: doc.metadata?.relevance || doc.score || 1.0
        }));
      }
      
      // Add tools context if enabled and available
      if (this.config.trackTools && rawResponse.tools) {
        response.context.tools = rawResponse.tools;
      }
      
      return response;
    } catch (error) {
      console.error('Error processing MCP response:', error);
      return {
        content: typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse),
        context: {}
      };
    }
  }
  
  // Store a response with its context in the database
  async storeResponse(conversationId: string, response: MCPResponse): Promise<boolean> {
    try {
      console.log('Storing MCP response in database');
      
      // For demo purposes, simulate successful storage
      return true;
    } catch (error) {
      console.error('Error storing MCP response:', error);
      return false;
    }
  }
}

export const useMCP = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(
    localStorage.getItem('mcp-enabled') !== 'false'
  );
  
  useEffect(() => {
    localStorage.setItem('mcp-enabled', String(isEnabled));
  }, [isEnabled]);
  
  const getMCPService = async (
    config: MCPConfig
  ): Promise<MCPService | null> => {
    try {
      if (!isEnabled) {
        console.log('MCP is disabled. Not creating service.');
        return null;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const service = new MCPService(config, user?.id || null);
      const initialized = await service.initialize();
      
      if (initialized) {
        return service;
      } else {
        toast.error('Failed to initialize MCP service');
        return null;
      }
    } catch (error) {
      console.error('Error creating MCP service:', error);
      toast.error(`Failed to create MCP service: ${error}`);
      return null;
    }
  };
  
  return {
    isEnabled,
    setIsEnabled,
    getMCPService
  };
};

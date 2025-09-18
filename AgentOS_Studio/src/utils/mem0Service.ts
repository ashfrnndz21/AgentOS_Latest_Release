
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type MemoryType = 'conversation' | 'fact' | 'entity' | 'summary';

export interface MemoryConfig {
  agentId: string;
  memoryType: MemoryType;
  bufferSize?: number;
  summaryFrequency?: number;
}

// Simple in-memory agent memory storage as fallback
const agentMemoryStorage = new Map<string, {
  chat_history: Array<{ role: string; content: string }>;
  memory_type: string;
  updated_at: string;
}>();

// Simple memory implementation that mimics the behavior of BufferMemory from LangChain
class SimpleMemory {
  private messages: Array<{ input: string; output: string }> = [];
  private k: number;
  
  constructor(options: { k: number }) {
    this.k = options.k || 10;
  }
  
  async saveContext(input: { input: string }, output: { output: string }): Promise<void> {
    this.messages.push({ input: input.input, output: output.output });
    
    // Keep only the last k messages
    if (this.messages.length > this.k) {
      this.messages = this.messages.slice(this.messages.length - this.k);
    }
  }
  
  async loadMemoryVariables(context: any): Promise<{ chat_history: Array<{ input: string; output: string }> }> {
    return { chat_history: this.messages };
  }
  
  clear(): void {
    this.messages = [];
  }
}

export class Mem0Service {
  private config: MemoryConfig;
  private memory: SimpleMemory;
  private chatHistory: Array<{ role: string; content: string }> = [];
  private useDatabase: boolean = false;
  
  constructor(config: MemoryConfig) {
    this.config = config;
    this.memory = new SimpleMemory({
      k: this.config.bufferSize || 10
    });
  }
  
  async initialize(): Promise<boolean> {
    try {
      console.log(`Initializing memory service for agent ${this.config.agentId}`);
      
      // Check if we can access Supabase for database operations
      try {
        const { data, error } = await supabase.rpc('check_table_exists', { 
          table_name: 'agent_memory' 
        });
        
        if (error) {
          console.warn('Could not check if agent_memory table exists:', error);
          this.useDatabase = false;
        } else {
          this.useDatabase = data === true;
          console.log(`Using database for agent memory: ${this.useDatabase}`);
        }
      } catch (error) {
        console.warn('Could not access agent_memory table, using in-memory storage', error);
        this.useDatabase = false;
      }
      
      // Load existing chat history if available
      await this.loadChatHistory();
      
      return true;
    } catch (error) {
      console.error('Error initializing memory service:', error);
      return false;
    }
  }
  
  private async loadChatHistory(): Promise<void> {
    try {
      if (this.useDatabase) {
        // Use RPC function to get agent memory
        const { data, error } = await supabase.rpc('get_agent_memory', { 
          p_agent_id: this.config.agentId 
        });
        
        if (error) {
          console.warn('No memory found in database, using in-memory storage', error);
        } else if (data && data.chat_history) {
          console.log('Loaded agent memory from database', data);
          this.chatHistory = data.chat_history as Array<{ role: string; content: string }>;
        }
      } else {
        // Fall back to in-memory storage
        const storedMemory = agentMemoryStorage.get(this.config.agentId);
        
        if (storedMemory && storedMemory.chat_history) {
          this.chatHistory = storedMemory.chat_history;
        }
      }
      
      // Save to memory
      for (const message of this.chatHistory) {
        if (message.role === 'user') {
          await this.memory.saveContext(
            { input: message.content },
            { output: '' }
          );
        } else if (message.role === 'assistant') {
          // Update the last saved context with the assistant's response
          const memoryVariables = await this.memory.loadMemoryVariables({});
          const lastContext = memoryVariables.chat_history?.pop();
          
          if (lastContext) {
            await this.memory.saveContext(
              { input: lastContext.input },
              { output: message.content }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }
  
  async saveChatHistory(): Promise<boolean> {
    try {
      if (this.useDatabase) {
        // Use RPC function to save agent memory
        const { error } = await supabase.rpc('save_agent_memory', { 
          p_agent_id: this.config.agentId,
          p_chat_history: this.chatHistory,
          p_memory_type: this.config.memoryType
        });
        
        if (error) {
          console.error('Error saving chat history to database:', error);
          // Fall back to in-memory storage
          agentMemoryStorage.set(this.config.agentId, {
            chat_history: this.chatHistory,
            memory_type: this.config.memoryType,
            updated_at: new Date().toISOString()
          });
          return false;
        }
        
        console.log(`Saved chat history to database for agent ${this.config.agentId}`);
      } else {
        // Fall back to in-memory storage
        agentMemoryStorage.set(this.config.agentId, {
          chat_history: this.chatHistory,
          memory_type: this.config.memoryType,
          updated_at: new Date().toISOString()
        });
      }
      
      // Log this operation for debugging
      console.log(`Saved chat history for agent ${this.config.agentId}, history length: ${this.chatHistory.length}`);
      
      return true;
    } catch (error) {
      console.error('Error saving chat history:', error);
      return false;
    }
  }
  
  async addUserMessage(message: string): Promise<void> {
    try {
      this.chatHistory.push({ role: 'user', content: message });
      
      // Save to memory
      await this.memory.saveContext(
        { input: message },
        { output: '' } // Empty for now, will be updated when assistant responds
      );
      
      // Save to storage
      await this.saveChatHistory();
    } catch (error) {
      console.error('Error adding user message:', error);
      throw error;
    }
  }
  
  async addAssistantMessage(message: string): Promise<void> {
    try {
      this.chatHistory.push({ role: 'assistant', content: message });
      
      // Update memory with assistant response
      const memoryVariables = await this.memory.loadMemoryVariables({});
      const lastContext = memoryVariables.chat_history?.pop();
      
      if (lastContext) {
        await this.memory.saveContext(
          { input: lastContext.input },
          { output: message }
        );
      }
      
      // Save to storage
      await this.saveChatHistory();
    } catch (error) {
      console.error('Error adding assistant message:', error);
      throw error;
    }
  }
  
  async getChatHistory(): Promise<Array<{ role: string; content: string }>> {
    return this.chatHistory;
  }
  
  async getMemoryVariables(): Promise<any> {
    try {
      return await this.memory.loadMemoryVariables({});
    } catch (error) {
      console.error('Error getting memory variables:', error);
      return {};
    }
  }
  
  async clearMemory(): Promise<boolean> {
    try {
      this.chatHistory = [];
      this.memory.clear();
      
      if (this.useDatabase) {
        // Use RPC function to delete agent memory
        const { error } = await supabase.rpc('delete_agent_memory', { 
          p_agent_id: this.config.agentId
        });
        
        if (error) {
          console.error('Error clearing memory from database:', error);
          return false;
        }
        
        console.log(`Deleted memory for agent ${this.config.agentId} from database`);
      } else {
        // Remove from in-memory storage
        agentMemoryStorage.delete(this.config.agentId);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing memory:', error);
      return false;
    }
  }
  
  // Static method to list all stored agent memories
  static async listAgentMemories(): Promise<Array<{
    agent_id: string;
    memory_type: string;
    message_count: number;
    updated_at: string;
  }>> {
    try {
      // Try to get from database using RPC function
      const { data, error } = await supabase.rpc('list_agent_memories');
      
      if (error) {
        console.warn('Could not get agent memories from database:', error);
        // Fall back to in-memory storage
        return Array.from(agentMemoryStorage.entries()).map(([agent_id, data]) => ({
          agent_id,
          memory_type: data.memory_type,
          message_count: data.chat_history.length,
          updated_at: data.updated_at
        }));
      }
      
      // Return database results or empty array if null
      return data || [];
    } catch (error) {
      console.error('Error listing agent memories:', error);
      return [];
    }
  }
}

export const useMem0Service = () => {
  const getMem0Service = async (
    agentId: string,
    config?: Partial<Omit<MemoryConfig, 'agentId'>>
  ): Promise<Mem0Service | null> => {
    try {
      // Get memory settings from localStorage
      const memoryEnabled = localStorage.getItem('memory-enabled') === 'true';
      
      if (!memoryEnabled) {
        console.log('Memory service is disabled');
        return null;
      }
      
      const memoryType = (localStorage.getItem('memory-type') || 'conversation') as MemoryType;
      const bufferSize = parseInt(localStorage.getItem('memory-buffer-size') || '10');
      const summaryFrequency = parseInt(localStorage.getItem('memory-summary-frequency') || '5');
      
      // Create memory config
      const memoryConfig: MemoryConfig = {
        agentId,
        memoryType: config?.memoryType || memoryType,
        bufferSize: config?.bufferSize || bufferSize,
        summaryFrequency: config?.summaryFrequency || summaryFrequency
      };
      
      const service = new Mem0Service(memoryConfig);
      const initialized = await service.initialize();
      
      if (initialized) {
        try {
          // Get session to check if we're authenticated
          const { data: sessionData } = await supabase.auth.getSession();
          
          // Record service in backend_connections if we're authenticated
          if (sessionData?.session?.user?.id) {
            const { error } = await supabase
              .from('backend_connections')
              .upsert({
                service_type: 'memory',
                service_name: memoryConfig.memoryType,
                connection_status: 'Connected',
                is_enabled: true,
                settings: JSON.stringify(memoryConfig),
                user_id: sessionData.session.user.id
              });
            
            if (error) {
              console.error('Failed to record memory service:', error);
            }
          }
        } catch (error) {
          console.warn('Failed to record memory service connection:', error);
        }
        
        return service;
      } else {
        toast.error('Failed to initialize memory service');
        return null;
      }
    } catch (error: any) {
      console.error('Error creating memory service:', error);
      toast.error(`Failed to create memory service: ${error.message}`);
      return null;
    }
  };
  
  return { getMem0Service };
};

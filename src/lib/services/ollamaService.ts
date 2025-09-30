import { apiClient } from '../apiClient';

class OllamaService {
  async getModels() {
    try {
      const response = await apiClient.getOllamaModels();
      return response.models || [];
    } catch (error) {
      console.error('Failed to get Ollama models:', error);
      throw error;
    }
  }

  async listModels() {
    try {
      // Use direct Ollama API to get models
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      throw error;
    }
  }

  async executeCommand(command: string) {
    try {
      const response = await apiClient.executeOllamaCommand(command);
      return response;
    } catch (error) {
      console.error('Failed to execute Ollama command:', error);
      throw error;
    }
  }

  async getStatus() {
    try {
      const response = await apiClient.getOllamaStatus();
      return response;
    } catch (error) {
      console.error('Failed to get Ollama status:', error);
      throw error;
    }
  }

  async generateResponse(model: string, prompt: string, options: any = {}) {
    try {
      // Use the direct Ollama API for generation
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.max_tokens || 1000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        status: 'success',
        response: data.response,
        eval_count: data.eval_count || 0,
        eval_duration: data.eval_duration || 0
      };
    } catch (error) {
      console.error('Failed to generate response:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        response: '',
        eval_count: 0
      };
    }
  }

  // Utility Database Access Methods
  async listUtilityDatabases() {
    try {
      const response = await fetch('http://localhost:5044/api/utility/database/list');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.databases || [];
    } catch (error) {
      console.error('Failed to list utility databases:', error);
      throw error;
    }
  }

  async queryUtilityDatabase(databaseName: string, query: string) {
    try {
      const response = await fetch(`http://localhost:5044/api/utility/database/${databaseName}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to query utility database:', error);
      throw error;
    }
  }

  async getUtilityDatabaseSchema(databaseName: string) {
    try {
      const response = await fetch(`http://localhost:5044/api/utility/database/${databaseName}/tables`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.tables || [];
    } catch (error) {
      console.error('Failed to get utility database schema:', error);
      throw error;
    }
  }

  async generateWithDatabaseContext(model: string, prompt: string, databaseName?: string, tableName?: string, options: any = {}) {
    try {
      let enhancedPrompt = prompt;
      
      // If database context is requested, fetch and include it
      if (databaseName && tableName) {
        try {
          const schema = await this.getUtilityDatabaseSchema(databaseName);
          const tableSchema = schema.find(table => table.name === tableName);
          
          if (tableSchema) {
            const schemaInfo = `Database Context:
Database: ${databaseName}
Table: ${tableName}
Schema: ${JSON.stringify(tableSchema.schema, null, 2)}

Please use this database context in your response.`;
            
            enhancedPrompt = `${schemaInfo}\n\nUser Query: ${prompt}`;
          }
        } catch (error) {
          console.warn('Failed to fetch database context, proceeding without it:', error);
        }
      }
      
      return await this.generateResponse(model, enhancedPrompt, options);
    } catch (error) {
      console.error('Failed to generate with database context:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        response: '',
        eval_count: 0
      };
    }
  }

  async executeUtilityWorkflow(request: string) {
    try {
      const response = await fetch('http://localhost:5044/api/utility/workflow/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to execute utility workflow:', error);
      throw error;
    }
  }
}

export const ollamaService = new OllamaService();
export default ollamaService;

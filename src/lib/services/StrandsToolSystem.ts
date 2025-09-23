/**
 * Strands Tool Integration System
 * Provides core Strands tools and MCP tool adaptation
 */

import { StrandsTool, AgentContext } from '@/types/StrandsTypes';
import { MCPTool } from '@/lib/services/MCPGatewayService';

export class StrandsToolSystem {
  private tools: Map<string, StrandsTool> = new Map();
  private backendTools: StrandsTool[] = [];
  private toolsLoaded: boolean = false;

  constructor() {
    this.initializeCoreTools();
    // Load backend tools asynchronously
    this.loadBackendTools().catch(console.error);
  }

  // Core Strands Tools (from samples)
  private initializeCoreTools(): void {
    // Calculator Tool (from Strands samples)
    this.registerTool({
      name: 'calculator',
      description: 'Perform mathematical calculations and expressions',
      parameters: {
        expression: {
          type: 'string',
          description: 'Mathematical expression to evaluate',
          required: true
        }
      },
      category: 'calculator',
      execute: async (params: { expression: string }, context: AgentContext) => {
        try {
          // Safe mathematical evaluation
          const result = this.evaluateExpression(params.expression);
          return {
            result,
            expression: params.expression,
            success: true,
            type: 'calculation'
          };
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : 'Calculation failed',
            expression: params.expression,
            success: false
          };
        }
      }
    });

    // Current Time Tool (from Strands samples)
    this.registerTool({
      name: 'current_time',
      description: 'Get current date and time information',
      parameters: {
        format: {
          type: 'string',
          description: 'Time format (iso, local, utc)',
          required: false,
          default: 'iso'
        },
        timezone: {
          type: 'string',
          description: 'Timezone for local time',
          required: false
        }
      },
      category: 'custom',
      execute: async (params: { format?: string; timezone?: string }, context: AgentContext) => {
        const now = new Date();
        const format = params.format || 'iso';
        
        let timeString: string;
        switch (format) {
          case 'local':
            timeString = now.toLocaleString();
            break;
          case 'utc':
            timeString = now.toUTCString();
            break;
          case 'iso':
          default:
            timeString = now.toISOString();
            break;
        }

        return {
          current_time: timeString,
          timestamp: now.getTime(),
          timezone: params.timezone || 'UTC',
          format: format,
          success: true
        };
      }
    });

    // Letter Counter Tool (from Strands samples)
    this.registerTool({
      name: 'letter_counter',
      description: 'Count occurrences of a specific letter in a word',
      parameters: {
        word: {
          type: 'string',
          description: 'Word to analyze',
          required: true
        },
        letter: {
          type: 'string',
          description: 'Letter to count (single character)',
          required: true
        }
      },
      category: 'custom',
      execute: async (params: { word: string; letter: string }, context: AgentContext) => {
        if (!params.word || !params.letter) {
          return {
            error: 'Both word and letter parameters are required',
            success: false
          };
        }

        if (params.letter.length !== 1) {
          return {
            error: 'Letter parameter must be a single character',
            success: false
          };
        }

        const count = params.word.toLowerCase().split(params.letter.toLowerCase()).length - 1;
        
        return {
          word: params.word,
          letter: params.letter,
          count,
          success: true
        };
      }
    });

    // Python REPL Tool (simplified version)
    this.registerTool({
      name: 'python_repl',
      description: 'Execute Python code (simplified version)',
      parameters: {
        code: {
          type: 'string',
          description: 'Python code to execute',
          required: true
        }
      },
      category: 'custom',
      execute: async (params: { code: string }, context: AgentContext) => {
        // Note: This is a simplified version for demonstration
        // In production, you'd want proper Python execution environment
        try {
          // For now, just return the code with a note
          return {
            code: params.code,
            output: `Code received: ${params.code}\nNote: Python execution would happen here in production environment`,
            success: true,
            note: 'This is a simplified implementation'
          };
        } catch (error) {
          return {
            code: params.code,
            error: error instanceof Error ? error.message : 'Execution failed',
            success: false
          };
        }
      }
    });

    // Web Search Tool (placeholder)
    this.registerTool({
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        query: {
          type: 'string',
          description: 'Search query',
          required: true
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          required: false,
          default: 5
        }
      },
      category: 'web_search',
      execute: async (params: { query: string; limit?: number }, context: AgentContext) => {
        // Placeholder implementation
        return {
          query: params.query,
          results: [
            {
              title: `Search result for: ${params.query}`,
              url: 'https://example.com',
              snippet: 'This is a placeholder search result. In production, this would connect to a real search API.'
            }
          ],
          success: true,
          note: 'This is a placeholder implementation'
        };
      }
    });
  }

  // Safe mathematical expression evaluation
  private evaluateExpression(expression: string): number {
    // Remove any potentially dangerous characters
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    
    // Basic validation
    if (!sanitized || sanitized.trim() === '') {
      throw new Error('Invalid expression');
    }

    try {
      // Use Function constructor for safer evaluation than eval
      const result = new Function(`"use strict"; return (${sanitized})`)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Result is not a valid number');
      }
      
      return result;
    } catch (error) {
      throw new Error(`Invalid mathematical expression: ${expression}`);
    }
  }

  // Tool Registration
  registerTool(tool: StrandsTool): void {
    this.tools.set(tool.name, tool);
  }

  // MCP Tool Adapter
  adaptMCPTool(mcpTool: MCPTool): StrandsTool {
    return {
      name: mcpTool.name,
      description: mcpTool.description,
      parameters: mcpTool.inputSchema || {},
      category: 'mcp',
      mcpTool,
      execute: async (params: any, context: AgentContext) => {
        try {
          // This would integrate with existing MCP execution system
          // For now, return a placeholder
          return {
            tool: mcpTool.name,
            params,
            result: 'MCP tool execution would happen here',
            success: true,
            note: 'MCP integration placeholder'
          };
        } catch (error) {
          return {
            tool: mcpTool.name,
            error: error instanceof Error ? error.message : 'MCP tool execution failed',
            success: false
          };
        }
      }
    };
  }

  // Tool Execution
  async executeTool(toolName: string, params: any, context: AgentContext): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    try {
      const result = await tool.execute(params, context);
      
      // Update context with tool usage
      if (!context.metadata.toolsUsed) {
        context.metadata.toolsUsed = [];
      }
      context.metadata.toolsUsed.push({
        tool: toolName,
        timestamp: new Date().toISOString(),
        success: result.success !== false
      });

      return result;
    } catch (error) {
      console.error(`Tool execution failed for ${toolName}:`, error);
      throw error;
    }
  }

  // Load tools from backend
  private async loadBackendTools(): Promise<void> {
    try {
      const response = await fetch('http://localhost:5006/api/strands-sdk/tools/discover');
      const data = await response.json();
      
      if (data.success && data.catalog) {
        // Convert backend tools to frontend format
        Object.entries(data.catalog.tools).forEach(([toolName, toolData]: [string, any]) => {
          if (!this.tools.has(toolName)) {
            const strandsTool: StrandsTool = {
              name: toolName,
              description: toolData.description || `${toolName} tool`,
              parameters: toolData.parameters || {},
              category: toolData.category || 'utility',
              execute: async (params: any, context: AgentContext) => {
                // This will be handled by the backend during agent execution
                return {
                  success: true,
                  message: `${toolName} tool execution delegated to backend`,
                  toolName,
                  params
                };
              }
            };
            
            this.tools.set(toolName, strandsTool);
            this.backendTools.push(strandsTool);
          }
        });
        
        this.toolsLoaded = true;
        console.log(`[StrandsToolSystem] Loaded ${this.backendTools.length} tools from backend`);
      }
    } catch (error) {
      console.error('[StrandsToolSystem] Failed to load backend tools:', error);
      // Add fallback collaboration tools if backend fails
      this.addFallbackCollaborationTools();
    }
  }

  // Add fallback collaboration tools if backend is unavailable
  private addFallbackCollaborationTools(): void {
    const collaborationTools = [
      {
        name: 'think',
        description: 'Advanced recursive thinking tool for deep analytical processing',
        category: 'ai',
        parameters: {
          thought: { type: 'string', description: 'The thought to analyze', required: true },
          cycle_count: { type: 'number', description: 'Number of thinking cycles', required: false }
        }
      },
      {
        name: 'a2a_discover_agent',
        description: 'Discover A2A-compliant agents and their capabilities',
        category: 'communication',
        parameters: {
          url: { type: 'string', description: 'Agent URL to discover', required: true }
        }
      },
      {
        name: 'a2a_send_message',
        description: 'Send messages to specific A2A agents',
        category: 'communication',
        parameters: {
          message_text: { type: 'string', description: 'Message to send', required: true },
          target_agent_url: { type: 'string', description: 'Target agent URL', required: true }
        }
      },
      {
        name: 'coordinate_agents',
        description: 'Coordinate multiple A2A agents for complex tasks',
        category: 'multi_agent',
        parameters: {
          task_description: { type: 'string', description: 'Task description', required: true },
          agent_urls: { type: 'array', description: 'List of agent URLs', required: true }
        }
      }
    ];

    collaborationTools.forEach(toolData => {
      if (!this.tools.has(toolData.name)) {
        const strandsTool: StrandsTool = {
          name: toolData.name,
          description: toolData.description,
          parameters: toolData.parameters,
          category: toolData.category,
          execute: async (params: any, context: AgentContext) => {
            return {
              success: true,
              message: `${toolData.name} tool execution delegated to backend`,
              toolName: toolData.name,
              params
            };
          }
        };
        
        this.tools.set(toolData.name, strandsTool);
      }
    });
    
    console.log('[StrandsToolSystem] Added fallback collaboration tools');
  }

  // Tool Discovery
  getAvailableTools(): StrandsTool[] {
    // If backend tools haven't been loaded yet, add fallback tools
    if (!this.toolsLoaded) {
      this.addFallbackCollaborationTools();
      this.toolsLoaded = true;
    }
    return Array.from(this.tools.values());
  }

  // Async method to get tools (ensures backend tools are loaded)
  async getAvailableToolsAsync(): Promise<StrandsTool[]> {
    if (!this.toolsLoaded) {
      await this.loadBackendTools();
    }
    return Array.from(this.tools.values());
  }

  getToolsByCategory(category: string): StrandsTool[] {
    return Array.from(this.tools.values()).filter(tool => tool.category === category);
  }

  getTool(name: string): StrandsTool | undefined {
    return this.tools.get(name);
  }

  // Tool Categories
  getToolCategories(): string[] {
    const categories = new Set<string>();
    this.tools.forEach(tool => categories.add(tool.category));
    return Array.from(categories);
  }

  // Bulk Tool Registration (for MCP tools)
  registerMCPTools(mcpTools: MCPTool[]): void {
    mcpTools.forEach(mcpTool => {
      const strandsTool = this.adaptMCPTool(mcpTool);
      this.registerTool(strandsTool);
    });
  }
}

// Global instance
export const strandsToolSystem = new StrandsToolSystem();
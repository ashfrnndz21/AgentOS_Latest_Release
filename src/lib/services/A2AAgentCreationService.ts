/**
 * A2A Agent Creation Service
 * Handles creation of new A2A agents through the frontend
 */

export interface A2AAgentCreationRequest {
  name: string;
  description: string;
  port: number;
  model: string;
  systemPrompt: string;
  tools: string[];
  capabilities: string[];
}

export interface A2AAgentCreationResponse {
  success: boolean;
  agent?: {
    id: string;
    name: string;
    description: string;
    port: number;
    url: string;
    status: 'creating' | 'active' | 'error';
    model: string;
    tools: string[];
    capabilities: string[];
  };
  error?: string;
}

class A2AAgentCreationService {
  private orchestrationUrl = 'http://localhost:8005';
  private registryUrl = 'http://localhost:5010';

  /**
   * Create a new A2A agent
   */
  async createA2AAgent(request: A2AAgentCreationRequest): Promise<A2AAgentCreationResponse> {
    try {
      // Step 1: Generate agent server code
      const agentCode = this.generateAgentServerCode(request);
      
      // Step 2: Create agent server file
      const createResponse = await fetch(`${this.orchestrationUrl}/create-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          agentCode
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create agent: ${createResponse.statusText}`);
      }

      const result = await createResponse.json();

      // Step 3: Register agent with registry
      const registerResponse = await fetch(`${this.registryUrl}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: request.name.toLowerCase().replace(/\s+/g, '_'),
          name: request.name,
          description: request.description,
          url: `http://localhost:${request.port}`,
          capabilities: request.capabilities,
          status: 'active',
          model: request.model,
          tools: request.tools
        })
      });

      if (!registerResponse.ok) {
        console.warn('Failed to register agent with registry, but agent was created');
      }

      return {
        success: true,
        agent: {
          id: result.agentId || request.name.toLowerCase().replace(/\s+/g, '_'),
          name: request.name,
          description: request.description,
          port: request.port,
          url: `http://localhost:${request.port}`,
          status: 'active',
          model: request.model,
          tools: request.tools,
          capabilities: request.capabilities
        }
      };

    } catch (error) {
      console.error('Failed to create A2A agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate Python server code for the A2A agent
   */
  private generateAgentServerCode(request: A2AAgentCreationRequest): string {
    const agentId = request.name.toLowerCase().replace(/\s+/g, '_');
    const toolsString = request.tools.map(tool => `'${tool}'`).join(', ');
    const capabilitiesString = request.capabilities.map(cap => `'${cap}'`).join(', ');

    return `#!/usr/bin/env python3
"""
Auto-generated A2A Agent Server: ${request.name}
Generated on: ${new Date().toISOString()}
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from base_a2a_server import BaseA2AServer
from strands import Agent
import requests

class ${request.name.replace(/\s+/g, '')}Server(BaseA2AServer):
    def __init__(self):
        super().__init__(
            agent_name="${request.name}",
            port=${request.port}
        )
        
        # Create Strands agent
        self.agent = Agent(
            name="${request.name}",
            model="${request.model}",
            system_prompt="""${request.systemPrompt}""",
            tools=[${toolsString}]
        )
        
        print(f"✅ ${request.name} agent created with tools: {self.agent.tools}")
        
        # Register with agent registry
        self.register_with_registry()
        
        print(f"🚀 ${request.name} running on port ${request.port}")
        print(f"📡 Available endpoints:")
        print(f"   • GET  /health - Health check")
        print(f"   • GET  /capabilities - Agent capabilities")
        print(f"   • POST /execute - Execute tasks")
        print(f"   • POST /a2a/message - A2A communication")

    def register_with_registry(self):
        """Register agent with central registry"""
        try:
            registry_data = {
                "id": "${agentId}",
                "name": "${request.name}",
                "description": "${request.description}",
                "url": f"http://localhost:${request.port}",
                "capabilities": [${capabilitiesString}],
                "status": "active",
                "model": "${request.model}",
                "tools": [${toolsString}]
            }
            
            response = requests.post(
                "http://localhost:5010/agents",
                json=registry_data,
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"✅ ${request.name} registered with registry")
            else:
                print(f"⚠️ Failed to register ${request.name} with registry: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️ Registry registration failed: {e}")

    def setup_routes(self):
        """Setup additional agent-specific routes"""
        super().setup_routes()
        
        @self.app.route('/execute', methods=['POST'])
        def execute_task():
            """Execute agent task"""
            try:
                data = request.get_json()
                task = data.get('task', '')
                
                if not task:
                    return jsonify({"error": "No task provided"}), 400
                
                # Execute task using Strands agent
                result = self.agent.run(task)
                
                return jsonify({
                    "agent_name": self.agent_name,
                    "task": task,
                    "result": result,
                    "status": "success"
                })
                
            except Exception as e:
                return jsonify({
                    "agent_name": self.agent_name,
                    "error": str(e),
                    "status": "error"
                }), 500

if __name__ == "__main__":
    server = ${request.name.replace(/\s+/g, '')}Server()
    server.run()
`;
  }

  /**
   * Check if a port is available
   */
  async checkPortAvailability(port: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000)
      });
      return false; // Port is in use
    } catch (error) {
      return true; // Port is available
    }
  }

  /**
   * Find next available port starting from a base port
   */
  async findAvailablePort(startPort: number = 8000): Promise<number> {
    for (let port = startPort; port < startPort + 100; port++) {
      const isAvailable = await this.checkPortAvailability(port);
      if (isAvailable) {
        return port;
      }
    }
    throw new Error('No available ports found');
  }

  /**
   * Get available agent templates
   */
  getAgentTemplates() {
    return [
      {
        name: 'Research Agent',
        description: 'Research and analysis specialist',
        tools: ['think', 'web_search', 'data_analysis'],
        systemPrompt: 'You are a research specialist with expertise in gathering, analyzing, and synthesizing information from various sources.',
        capabilities: ['research', 'analysis', 'data_synthesis']
      },
      {
        name: 'Calculator Agent',
        description: 'Mathematical calculation specialist',
        tools: ['think', 'calculator'],
        systemPrompt: 'You are a mathematical calculation specialist with expertise in solving complex mathematical problems and equations.',
        capabilities: ['mathematics', 'calculations', 'problem_solving']
      },
      {
        name: 'Weather Agent',
        description: 'Weather information specialist',
        tools: ['think', 'current_time', 'api_call'],
        systemPrompt: 'You are a weather specialist with expertise in weather patterns, forecasting, and environmental analysis.',
        capabilities: ['weather', 'forecasting', 'environmental_analysis']
      },
      {
        name: 'Stock Agent',
        description: 'Stock market analysis specialist',
        tools: ['think', 'current_time', 'data_analysis'],
        systemPrompt: 'You are a financial analyst specializing in stock market analysis, trends, and investment insights.',
        capabilities: ['finance', 'stock_analysis', 'market_trends']
      }
    ];
  }
}

export const a2aAgentCreationService = new A2AAgentCreationService();












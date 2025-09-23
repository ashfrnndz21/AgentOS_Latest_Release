#!/bin/bash

echo "🚀 AgentOS Studio - Complete Setup Script"
echo "=========================================="
echo "This script will set up the entire AgentOS Studio environment"
echo "with all dependencies and services configured properly."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the AgentOS Studio root directory"
    exit 1
fi

print_status "🔍 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
else
    print_success "Python 3 found ($(python3 --version))"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    exit 1
else
    print_success "Node.js found ($(node --version))"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed"
    exit 1
else
    print_success "npm found ($(npm --version))"
fi

# Check Ollama
if ! command -v ollama &> /dev/null; then
    print_warning "Ollama not found - install from https://ollama.ai"
else
    print_success "Ollama found"
fi

echo ""
print_status "📦 Setting up Python backend environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv backend/venv
    print_success "Virtual environment created"
else
    print_success "Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."
cd backend
source venv/bin/activate

# Install base requirements
pip install -r requirements.txt

# Install additional dependencies we discovered during setup
print_status "Installing additional dependencies..."
pip install psutil PyPDF2 python-multipart

print_success "Python dependencies installed"

cd ..

echo ""
print_status "📦 Setting up Node.js frontend environment..."

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install --legacy-peer-deps

print_success "Node.js dependencies installed"

echo ""
print_status "🔧 Creating missing library files..."

# Create missing library files that were causing import errors
mkdir -p src/lib/services

# Create a2aClient.ts
cat > src/lib/a2aClient.ts << 'EOF'
// A2A (Agent-to-Agent) Client for communication between agents
export class A2AClient {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(baseUrl: string = 'http://localhost:5008') {
    this.baseUrl = baseUrl;
  }

  // Initialize WebSocket connection
  async connect(): Promise<void> {
    try {
      const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('A2A WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onclose = () => {
        console.log('A2A WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('A2A WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect A2A WebSocket:', error);
    }
  }

  // Handle reconnection
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect A2A WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
    }
  }

  // Send message to another agent
  async sendMessage(toAgentId: string, message: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_agent_id: toAgentId,
          message: message,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send A2A message:', error);
      throw error;
    }
  }

  // Get agent connections
  async getConnections(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/connections`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get A2A connections:', error);
      return [];
    }
  }

  // Get available agents
  async getAgents(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/agents`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get A2A agents:', error);
      return [];
    }
  }

  // Get message history
  async getMessageHistory(agentId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/messages/history?agent_id=${agentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get A2A message history:', error);
      return [];
    }
  }

  // Register agent
  async registerAgent(agentData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to register A2A agent:', error);
      throw error;
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const a2aClient = new A2AClient();
EOF

# Create StrandsSdkService.ts
cat > src/lib/services/StrandsSdkService.ts << 'EOF'
// Strands SDK Service for individual agent analytics and management
export class StrandsSdkService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5006') {
    this.baseUrl = baseUrl;
  }

  // Get health status
  async getHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get Strands SDK health:', error);
      throw error;
    }
  }

  // Get agent analytics
  async getAgentAnalytics(agentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/analytics/${agentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get agent analytics:', error);
      throw error;
    }
  }

  // Get all agents
  async getAgents(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get agents:', error);
      return [];
    }
  }

  // Create new agent
  async createAgent(agentData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  }

  // Update agent
  async updateAgent(agentId: string, agentData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update agent:', error);
      throw error;
    }
  }

  // Delete agent
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete agent:', error);
      return false;
    }
  }

  // Get agent performance metrics
  async getAgentMetrics(agentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/metrics/${agentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get agent metrics:', error);
      throw error;
    }
  }

  // Get workflow analytics
  async getWorkflowAnalytics(workflowId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands-sdk/workflows/${workflowId}/analytics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get workflow analytics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const strandsSdkService = new StrandsSdkService();
EOF

# Create StrandsAgentService.ts
cat > src/lib/services/StrandsAgentService.ts << 'EOF'
// Strands Agent Service for agent management and operations
export class StrandsAgentService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5004') {
    this.baseUrl = baseUrl;
  }

  // Get health status
  async getHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get Strands health:', error);
      throw error;
    }
  }

  // Get available models
  async getModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }

  // Create reasoning session
  async createReasoningSession(sessionData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/reasoning/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create reasoning session:', error);
      throw error;
    }
  }

  // Execute reasoning
  async executeReasoning(sessionId: string, query: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/reasoning/sessions/${sessionId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to execute reasoning:', error);
      throw error;
    }
  }

  // Get reasoning session
  async getReasoningSession(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/reasoning/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get reasoning session:', error);
      throw error;
    }
  }

  // List reasoning sessions
  async listReasoningSessions(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/reasoning/sessions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to list reasoning sessions:', error);
      return [];
    }
  }

  // Delete reasoning session
  async deleteReasoningSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/reasoning/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete reasoning session:', error);
      return false;
    }
  }

  // Get agent capabilities
  async getAgentCapabilities(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/capabilities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get agent capabilities:', error);
      throw error;
    }
  }

  // Execute agent task
  async executeAgentTask(taskData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/strands/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to execute agent task:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const strandsAgentService = new StrandsAgentService();
EOF

# Create A2AService.ts
cat > src/lib/services/A2AService.ts << 'EOF'
// A2A Service for agent-to-agent communication management
export class A2AService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5008') {
    this.baseUrl = baseUrl;
  }

  // Get health status
  async getHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get A2A health:', error);
      throw error;
    }
  }

  // Register agent
  async registerAgent(agentData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to register agent:', error);
      throw error;
    }
  }

  // Get all agents
  async getAgents(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/agents`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get agents:', error);
      return [];
    }
  }

  // Get agent by ID
  async getAgent(agentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/agents/${agentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get agent:', error);
      throw error;
    }
  }

  // Update agent
  async updateAgent(agentId: string, agentData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update agent:', error);
      throw error;
    }
  }

  // Delete agent
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete agent:', error);
      return false;
    }
  }

  // Send message between agents
  async sendMessage(messageData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Get message history
  async getMessageHistory(agentId?: string): Promise<any[]> {
    try {
      const url = agentId 
        ? `${this.baseUrl}/api/a2a/messages/history?agent_id=${agentId}`
        : `${this.baseUrl}/api/a2a/messages/history`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get message history:', error);
      return [];
    }
  }

  // Get connections
  async getConnections(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/connections`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get connections:', error);
      return [];
    }
  }

  // Create connection between agents
  async createConnection(connectionData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create connection:', error);
      throw error;
    }
  }

  // Delete connection
  async deleteConnection(connectionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/a2a/connections/${connectionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete connection:', error);
      return false;
    }
  }
}

// Export singleton instance
export const a2aService = new A2AService();
EOF

# Create StrandsWorkflowOrchestrator.ts
cat > src/lib/services/StrandsWorkflowOrchestrator.ts << 'EOF'
// Strands Workflow Orchestrator for managing multi-agent workflows
export class StrandsWorkflowOrchestrator {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5014') {
    this.baseUrl = baseUrl;
  }

  // Get health status
  async getHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get orchestration health:', error);
      throw error;
    }
  }

  // Create workflow
  async createWorkflow(workflowData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  }

  // Get workflow by ID
  async getWorkflow(workflowId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get workflow:', error);
      throw error;
    }
  }

  // List workflows
  async listWorkflows(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/workflows`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to list workflows:', error);
      return [];
    }
  }

  // Update workflow
  async updateWorkflow(workflowId: string, workflowData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  }

  // Delete workflow
  async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      return false;
    }
  }

  // Execute workflow
  async executeWorkflow(workflowId: string, executionData?: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(executionData || {})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  }

  // Get workflow execution status
  async getWorkflowExecutionStatus(workflowId: string, executionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/workflows/${workflowId}/executions/${executionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get workflow execution status:', error);
      throw error;
    }
  }

  // List workflow executions
  async listWorkflowExecutions(workflowId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/workflows/${workflowId}/executions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to list workflow executions:', error);
      return [];
    }
  }

  // Stop workflow execution
  async stopWorkflowExecution(workflowId: string, executionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/workflows/${workflowId}/executions/${executionId}/stop`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to stop workflow execution:', error);
      return false;
    }
  }

  // Get available agents for orchestration
  async getAvailableAgents(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/agents`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get available agents:', error);
      return [];
    }
  }

  // Get orchestration templates
  async getTemplates(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/enhanced-orchestration/templates`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get templates:', error);
      return [];
    }
  }
}

// Export singleton instance
export const strandsWorkflowOrchestrator = new StrandsWorkflowOrchestrator();
EOF

print_success "Missing library files created"

echo ""
print_status "📝 Creating updated requirements.txt with all dependencies..."

# Update requirements.txt with all discovered dependencies
cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
aiohttp==3.9.1
pydantic==2.5.0
flask==3.0.0
flask-cors==4.0.0
flask-socketio==5.3.6
requests==2.31.0
psutil
PyPDF2
python-multipart
EOF

print_success "Updated requirements.txt with all dependencies"

echo ""
print_status "🔧 Making scripts executable..."

# Make scripts executable
chmod +x start-all-services.sh
chmod +x kill-all-services.sh
chmod +x setup-complete.sh

print_success "Scripts made executable"

echo ""
print_status "📋 Creating comprehensive README with setup instructions..."

# Create a comprehensive README
cat > SETUP-README.md << 'EOF'
# AgentOS Studio - Complete Setup Guide

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AgentOS_Studio_Strands
   ```

2. **Run the complete setup script:**
   ```bash
   chmod +x setup-complete.sh
   ./setup-complete.sh
   ```

3. **Start all services:**
   ```bash
   ./start-all-services.sh
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend APIs: Various ports (see Service Status below)

## What the Setup Script Does

The `setup-complete.sh` script automatically:

### Backend Setup
- ✅ Creates Python virtual environment
- ✅ Installs all Python dependencies including:
  - Base requirements (FastAPI, Flask, etc.)
  - **psutil** - for system resource monitoring
  - **PyPDF2** - for PDF document processing in RAG API
  - **python-multipart** - for file upload handling
- ✅ Sets up all backend services

### Frontend Setup
- ✅ Installs Node.js dependencies with legacy peer deps
- ✅ Creates missing library files that were causing import errors:
  - `src/lib/a2aClient.ts` - A2A communication client
  - `src/lib/services/StrandsSdkService.ts` - Strands SDK service
  - `src/lib/services/StrandsAgentService.ts` - Strands agent service
  - `src/lib/services/A2AService.ts` - A2A service wrapper
  - `src/lib/services/StrandsWorkflowOrchestrator.ts` - Workflow orchestration

### Service Management
- ✅ Makes all startup scripts executable
- ✅ Updates requirements.txt with all discovered dependencies

## Service Architecture

### Core Services
- **Frontend (Vite)**: http://localhost:5173 - React web interface
- **Ollama Core**: http://localhost:11434 - LLM engine

### Backend APIs
- **Agent Registry**: http://localhost:5010 - Agent management
- **Strands API**: http://localhost:5004 - Intelligence & reasoning
- **A2A Communication Service**: http://localhost:5008 - Agent-to-agent communication
- **Ollama API**: http://localhost:5002 - Terminal & agents
- **Chat Orchestrator API**: http://localhost:5005 - Multi-agent chat
- **Strands SDK API**: http://localhost:5006 - Individual agent analytics
- **RAG API**: http://localhost:5003 - Document chat and processing
- **Enhanced Orchestration API**: http://localhost:5014 - Dynamic LLM orchestration
- **Resource Monitor API**: http://localhost:5011 - System monitoring

## Troubleshooting

### Common Issues Fixed
1. **Missing Dependencies**: All Python dependencies are now included
2. **Import Errors**: Missing library files are automatically created
3. **Port Conflicts**: Services are properly managed and cleaned up
4. **Resource Monitoring**: psutil dependency installed for system metrics

### Manual Service Management
- **Start all services**: `./start-all-services.sh`
- **Stop all services**: `./kill-all-services.sh`
- **Check service status**: Visit http://localhost:5173 and go to Settings > Resources

### Development
- **Frontend development**: `npm run dev`
- **Backend development**: Services run automatically with the startup script
- **Logs**: Check individual service logs in the `backend/` directory

## Prerequisites

- **Python 3.8+** (with pip)
- **Node.js 16+** (with npm)
- **Ollama** (install from https://ollama.ai)

## Notes

- The setup script handles all the issues discovered during initial setup
- All missing dependencies are automatically installed
- Import errors are resolved by creating the required library files
- Services are configured to run on their designated ports
- Resource monitoring works out of the box

## Support

If you encounter any issues:
1. Ensure all prerequisites are installed
2. Run the setup script again: `./setup-complete.sh`
3. Check service logs for specific error messages
4. Verify all ports are available (no conflicts)
EOF

print_success "Comprehensive README created"

echo ""
print_status "🎉 Setup Complete!"
echo "===================="
print_success "All dependencies installed"
print_success "Missing library files created"
print_success "Scripts made executable"
print_success "Requirements.txt updated"
print_success "Comprehensive README created"

echo ""
print_status "🚀 Next Steps:"
echo "1. Run: ./start-all-services.sh"
echo "2. Open: http://localhost:5173"
echo "3. Check Settings > Resources for service status"

echo ""
print_status "📚 Documentation:"
echo "- Setup guide: SETUP-README.md"
echo "- Service status: http://localhost:5173 (Settings page)"

echo ""
print_success "AgentOS Studio is ready to use! 🎉"


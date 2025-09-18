# Strands SDK Agent Creation Implementation Strategy

## 🎯 Objective
Create a new "Create Strands Agent" workflow that follows the official Strands SDK methodology, wrapped in a UI, while keeping existing "Create Agent" workflow completely untouched.

## 🏗️ Implementation Architecture

### **Parallel System Design**
```
Existing System (Untouched)          New Strands SDK System
├── Create Agent Button              ├── Create Strands Agent Button
├── AgentConfigDialog.tsx           ├── StrandsSdkAgentDialog.tsx
├── ollama_api.py                   ├── strands_sdk_api.py
├── ollama_agents.db                ├── strands_agents.db
└── OllamaAgentService.ts           └── StrandsSdkService.ts
```

## 📋 Required Components

### **1. Backend Implementation**

#### **New Service: `backend/strands_sdk_api.py`**
```python
"""
Strands SDK Agent Service
Implements official Strands SDK patterns with UI wrapper
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
from datetime import datetime

# Install Strands SDK: pip install strands-agents
from strands import Agent, tool
from strands.model_providers import OllamaModel

app = Flask(__name__)
CORS(app)

STRANDS_SDK_DB = "strands_sdk_agents.db"

def init_strands_sdk_database():
    """Initialize SQLite database for Strands SDK agents"""
    conn = sqlite3.connect(STRANDS_SDK_DB)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strands_sdk_agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            
            -- Strands SDK Configuration
            model_provider TEXT DEFAULT 'ollama',
            model_id TEXT NOT NULL,
            host TEXT DEFAULT 'http://localhost:11434',
            
            -- Agent Configuration
            system_prompt TEXT,
            tools TEXT, -- JSON array of tool names
            
            -- Strands SDK specific
            sdk_config TEXT, -- JSON of additional SDK config
            
            -- Metadata
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strands_sdk_executions (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            input_text TEXT NOT NULL,
            output_text TEXT,
            execution_time REAL,
            success BOOLEAN DEFAULT FALSE,
            error_message TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (agent_id) REFERENCES strands_sdk_agents (id)
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/api/strands-sdk/agents', methods=['POST'])
def create_strands_agent():
    """Create a new Strands SDK agent following official patterns"""
    try:
        data = request.json
        
        agent_id = str(uuid.uuid4())
        
        # Validate Strands SDK configuration
        model_config = {
            'host': data.get('host', 'http://localhost:11434'),
            'model_id': data.get('model_id', 'llama3')
        }
        
        # Test agent creation with Strands SDK
        try:
            ollama_model = OllamaModel(**model_config)
            test_agent = Agent(
                model=ollama_model,
                system_prompt=data.get('system_prompt', 'You are a helpful assistant.')
            )
            # Quick test to ensure it works
            # test_response = test_agent("Hello")
        except Exception as e:
            return jsonify({'error': f'Strands SDK configuration error: {str(e)}'}), 400
        
        # Store in database
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO strands_sdk_agents 
            (id, name, description, model_provider, model_id, host, system_prompt, tools, sdk_config)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            agent_id,
            data.get('name'),
            data.get('description'),
            'ollama',
            data.get('model_id'),
            data.get('host'),
            data.get('system_prompt'),
            json.dumps(data.get('tools', [])),
            json.dumps(data.get('sdk_config', {}))
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': agent_id,
            'message': 'Strands SDK agent created successfully',
            'sdk_validated': True
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/agents/<agent_id>/execute', methods=['POST'])
def execute_strands_agent(agent_id):
    """Execute Strands SDK agent using official SDK"""
    try:
        data = request.json
        input_text = data.get('input', '')
        
        # Load agent configuration
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strands_sdk_agents WHERE id = ?', (agent_id,))
        agent_data = cursor.fetchone()
        
        if not agent_data:
            return jsonify({'error': 'Agent not found'}), 404
        
        # Create Strands SDK agent
        ollama_model = OllamaModel(
            host=agent_data[5],  # host
            model_id=agent_data[4]  # model_id
        )
        
        agent = Agent(
            model=ollama_model,
            system_prompt=agent_data[6]  # system_prompt
        )
        
        # Execute using Strands SDK
        start_time = time.time()
        response = agent(input_text)
        execution_time = time.time() - start_time
        
        # Log execution
        execution_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO strands_sdk_executions 
            (id, agent_id, input_text, output_text, execution_time, success)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (execution_id, agent_id, input_text, str(response), execution_time, True))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'response': str(response),
            'execution_time': execution_time,
            'execution_id': execution_id,
            'sdk_powered': True
        })
        
    except Exception as e:
        # Log failed execution
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        execution_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO strands_sdk_executions 
            (id, agent_id, input_text, error_message, success)
            VALUES (?, ?, ?, ?, ?)
        ''', (execution_id, agent_id, data.get('input', ''), str(e), False))
        
        conn.commit()
        conn.close()
        
        return jsonify({'error': str(e)}), 500

@app.route('/api/strands-sdk/agents', methods=['GET'])
def list_strands_agents():
    """List all Strands SDK agents"""
    try:
        conn = sqlite3.connect(STRANDS_SDK_DB)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM strands_sdk_agents ORDER BY created_at DESC')
        agents = cursor.fetchall()
        
        conn.close()
        
        agents_list = []
        for agent in agents:
            agents_list.append({
                'id': agent[0],
                'name': agent[1],
                'description': agent[2],
                'model_provider': agent[3],
                'model_id': agent[4],
                'host': agent[5],
                'system_prompt': agent[6],
                'tools': json.loads(agent[7]) if agent[7] else [],
                'created_at': agent[9],
                'sdk_type': 'strands-official'
            })
        
        return jsonify(agents_list)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_strands_sdk_database()
    app.run(debug=True, port=5006)  # Different port from existing services
```

### **2. Frontend Implementation**

#### **New Component: `src/components/MultiAgentWorkspace/StrandsSdkAgentDialog.tsx`**
```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Code, Zap } from 'lucide-react';

interface StrandsSdkAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: StrandsSdkAgent) => void;
}

interface StrandsSdkAgent {
  name: string;
  description: string;
  model_id: string;
  host: string;
  system_prompt: string;
  tools: string[];
}

export const StrandsSdkAgentDialog: React.FC<StrandsSdkAgentDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [config, setConfig] = useState<StrandsSdkAgent>({
    name: '',
    description: '',
    model_id: 'llama3',
    host: 'http://localhost:11434',
    system_prompt: 'You are a helpful assistant.',
    tools: []
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleSave = async () => {
    setIsCreating(true);
    try {
      await onSave(config);
      onClose();
    } catch (error) {
      console.error('Failed to create Strands agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Create Strands SDK Agent
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Official SDK
            </Badge>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Create an agent using the official Strands SDK methodology
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* SDK Info Card */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code className="h-4 w-4" />
                Strands SDK Pattern
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-gray-900 rounded-lg p-3 text-sm">
                <code className="text-green-400">
                  {`# This UI creates the equivalent of:
from strands import Agent
from strands.model_providers import OllamaModel

ollama_model = OllamaModel(
    host="${config.host}",
    model_id="${config.model_id}"
)

agent = Agent(
    model=ollama_model,
    system_prompt="${config.system_prompt}"
)

response = agent("Your input here")`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig({...config, name: e.target.value})}
                placeholder="My Strands Agent"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={config.description}
                onChange={(e) => setConfig({...config, description: e.target.value})}
                placeholder="Agent description"
              />
            </div>
          </div>

          {/* Model Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ollama Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host">Ollama Host</Label>
                  <Input
                    id="host"
                    value={config.host}
                    onChange={(e) => setConfig({...config, host: e.target.value})}
                    placeholder="http://localhost:11434"
                  />
                </div>
                <div>
                  <Label htmlFor="model_id">Model ID</Label>
                  <Input
                    id="model_id"
                    value={config.model_id}
                    onChange={(e) => setConfig({...config, model_id: e.target.value})}
                    placeholder="llama3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <div>
            <Label htmlFor="system_prompt">System Prompt</Label>
            <Textarea
              id="system_prompt"
              value={config.system_prompt}
              onChange={(e) => setConfig({...config, system_prompt: e.target.value})}
              placeholder="You are a helpful assistant..."
              rows={4}
            />
          </div>

          {/* SDK Features Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Strands SDK Features</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Model-driven execution with Think-Act-Observe-Reflect loop</li>
                    <li>• Native MCP (Model Context Protocol) support</li>
                    <li>• Built-in tool system with Python decorators</li>
                    <li>• Advanced multi-agent coordination patterns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!config.name || isCreating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isCreating ? 'Creating...' : 'Create Strands Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### **New Service: `src/lib/services/StrandsSdkService.ts`**
```typescript
export interface StrandsSdkAgent {
  id?: string;
  name: string;
  description: string;
  model_provider: string;
  model_id: string;
  host: string;
  system_prompt: string;
  tools: string[];
  sdk_config?: any;
  created_at?: string;
  sdk_type: 'strands-official';
}

export interface StrandsSdkExecution {
  id: string;
  agent_id: string;
  input_text: string;
  output_text?: string;
  execution_time?: number;
  success: boolean;
  error_message?: string;
  timestamp: string;
  sdk_powered: boolean;
}

class StrandsSdkService {
  private baseUrl = 'http://localhost:5006/api/strands-sdk';

  async createAgent(agentData: Omit<StrandsSdkAgent, 'id' | 'sdk_type'>): Promise<StrandsSdkAgent> {
    const response = await fetch(`${this.baseUrl}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create Strands agent');
    }

    const result = await response.json();
    return { ...agentData, id: result.id, sdk_type: 'strands-official' };
  }

  async executeAgent(agentId: string, input: string): Promise<StrandsSdkExecution> {
    const response = await fetch(`${this.baseUrl}/agents/${agentId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute Strands agent');
    }

    return await response.json();
  }

  async listAgents(): Promise<StrandsSdkAgent[]> {
    const response = await fetch(`${this.baseUrl}/agents`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Strands agents');
    }

    return await response.json();
  }

  async getAgent(agentId: string): Promise<StrandsSdkAgent> {
    const agents = await this.listAgents();
    const agent = agents.find(a => a.id === agentId);
    
    if (!agent) {
      throw new Error('Strands agent not found');
    }
    
    return agent;
  }
}

export const strandsSdkService = new StrandsSdkService();
```

### **3. UI Integration Points**

#### **Update Ollama Agent Dashboard**
```typescript
// In src/pages/OllamaAgentDashboard.tsx
// Add new button next to existing "Create Agent"

const [showStrandsSdkDialog, setShowStrandsSdkDialog] = useState(false);

// In the header section:
<div className="flex gap-2">
  <Button onClick={() => setShowCreateDialog(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Create Agent
  </Button>
  
  {/* NEW: Strands SDK Agent Button */}
  <Button 
    onClick={() => setShowStrandsSdkDialog(true)}
    className="bg-purple-600 hover:bg-purple-700"
  >
    <Sparkles className="h-4 w-4 mr-2" />
    Create Strands Agent
  </Button>
</div>

// Add the dialog:
<StrandsSdkAgentDialog
  isOpen={showStrandsSdkDialog}
  onClose={() => setShowStrandsSdkDialog(false)}
  onSave={handleCreateStrandsAgent}
/>
```

### **4. Agent List Integration**
```typescript
// Show both types of agents in the same list with badges
const renderAgentCard = (agent: any) => (
  <Card key={agent.id}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{agent.name}</CardTitle>
        {agent.sdk_type === 'strands-official' ? (
          <Badge className="bg-purple-100 text-purple-700">
            <Sparkles className="h-3 w-3 mr-1" />
            Strands SDK
          </Badge>
        ) : (
          <Badge variant="secondary">Legacy</Badge>
        )}
      </div>
    </CardHeader>
    {/* Rest of card content */}
  </Card>
);
```

## 📋 Implementation Steps

### **Step 1: Backend Setup (1-2 days)**
1. Install Strands SDK: `pip install strands-agents`
2. Create `backend/strands_sdk_api.py`
3. Set up new database `strands_sdk_agents.db`
4. Test basic agent creation and execution

### **Step 2: Frontend Components (2-3 days)**
1. Create `StrandsSdkAgentDialog.tsx`
2. Create `StrandsSdkService.ts`
3. Add new button to Ollama Agent Dashboard
4. Test UI integration

### **Step 3: Agent List Integration (1 day)**
1. Modify agent list to show both types
2. Add SDK badges and indicators
3. Ensure separate execution paths

### **Step 4: Testing & Polish (1 day)**
1. Test Strands SDK agent creation
2. Test agent execution
3. Verify existing system untouched
4. Add error handling and validation

## 🎯 Benefits of This Approach

### **✅ Advantages**
- **Zero Impact**: Existing system completely untouched
- **True SDK Integration**: Uses official Strands SDK
- **Side-by-Side Comparison**: Users can see both approaches
- **Gradual Migration**: Users can choose which system to use
- **Learning Tool**: Shows official Strands patterns

### **🔍 User Experience**
- Two buttons: "Create Agent" (existing) and "Create Strands Agent" (new)
- Clear SDK badges to distinguish agent types
- Code preview showing equivalent Strands SDK code
- Separate execution paths with SDK-powered indicators

### **📊 Technical Benefits**
- Independent databases and services
- No risk to existing functionality
- Easy to remove if needed
- Clean separation of concerns
- Official SDK compliance

## 💡 Future Enhancements

Once this is working, we can add:
1. **Tool Integration**: Support for Strands `@tool` decorators
2. **Multi-Agent Patterns**: Implement agents-as-tools, swarms, etc.
3. **MCP Integration**: Native MCP server support
4. **Code Editor**: Allow direct SDK code editing
5. **Migration Tool**: Convert legacy agents to Strands SDK

This approach gives us the best of both worlds: keeping our existing system stable while introducing true Strands SDK capabilities for users who want the official experience.
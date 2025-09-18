# MCP Integration User Guide

## 🎯 **What is MCP Integration?**

The Model Context Protocol (MCP) integration allows your AgentRepo platform to:
- Connect to external MCP servers that provide specialized tools
- Deploy your own MCP servers to AWS AgentCore Runtime
- Use MCP tools within your AI agents for enhanced capabilities
- Manage and monitor MCP server health and performance

## 🚀 **Complete User Workflow**

### **Step 1: Configure MCP Servers**

1. **Navigate to Settings**
   - Go to Settings → MCP Servers tab
   - Click "Add MCP Server"

2. **Add Local MCP Server** (Development)
   ```
   Server Name: My Local Math Server
   Server URL: http://localhost:8000/mcp
   Server Type: Local Server
   Authentication: No Authentication
   ```

3. **Add Remote MCP Server** (Production)
   ```
   Server Name: Production API Server
   Server URL: https://api.example.com/mcp
   Server Type: Remote Server
   Authentication: Bearer Token
   Bearer Token: your-api-token-here
   ```

4. **Add AWS AgentCore MCP Server** (Enterprise)
   ```
   Server Name: AWS AgentCore Math Server
   Server URL: https://bedrock-agentcore.us-west-2.amazonaws.com/runtimes/arn%3Aaws%3Abedrock-agentcore%3Aus-west-2%3A123456789012%3Aruntime%2Fmy-server-abc123/invocations?qualifier=DEFAULT
   Server Type: AWS AgentCore
   Authentication: AWS Cognito
   ```

### **Step 2: Test MCP Server Connection**

1. **Test Connection**
   - Click "Test" button next to your server
   - Wait for connection status to update
   - Green checkmark = Connected
   - Red X = Connection failed

2. **View Available Tools**
   - Connected servers show tool count
   - Tools are automatically discovered
   - Each tool shows name, description, and parameters

### **Step 3: Use MCP Dashboard**

1. **Navigate to MCP Dashboard**
   - Click "MCP Dashboard" in sidebar
   - View overview metrics and server health

2. **Browse Tools**
   - Go to "Tools" tab
   - See all available tools across servers
   - Tools are categorized (math, text, data, api, other)

3. **Test Tools Interactively**
   - Click "Test Tool" on any tool
   - Enter parameters in JSON format
   - Execute and see results
   - Example for `add_numbers` tool:
   ```json
   {
     "tool": "add_numbers",
     "parameters": {
       "a": 5,
       "b": 3
     }
   }
   ```

### **Step 4: Deploy Your Own MCP Server**

1. **Create MCP Server Code**
   ```python
   # my_mcp_server.py
   from mcp.server.fastmcp import FastMCP
   
   mcp = FastMCP(host="0.0.0.0", stateless_http=True)
   
   @mcp.tool()
   def add_numbers(a: int, b: int) -> int:
       """Add two numbers together"""
       return a + b
   
   if __name__ == "__main__":
       mcp.run(transport="streamable-http")
   ```

2. **Deploy to AWS AgentCore** (Future Feature)
   - Use the deployment dialog in MCP Dashboard
   - Upload your server code
   - Configure authentication
   - Monitor deployment status

### **Step 5: Use MCP Tools in Agents**

1. **Create New Agent**
   - Go to Agent Command Centre
   - Click "Create Agent"
   - In capabilities step, select available MCP tools
   - Agent can now use these tools during conversations

2. **Agent Conversation Example**
   ```
   User: "What's 15 + 27?"
   Agent: *Uses add_numbers MCP tool*
   Agent: "The sum of 15 and 27 is 42."
   ```

## 🔧 **Technical Architecture**

### **Frontend Components**
- **MCPSettings**: Configure and manage MCP servers
- **MCPDashboard**: Monitor servers and test tools
- **AgentCoreSDK**: Handle MCP API calls
- **Agent Creation**: Integrate MCP tools into agents

### **Backend API Endpoints**
- `POST /api/mcp/test` - Test MCP server connection
- `POST /api/mcp/invoke` - Execute MCP tools
- `POST /api/mcp/deploy` - Deploy MCP server to AWS
- `GET /api/mcp/templates` - Get MCP server templates

### **Data Flow**
1. User configures MCP server in Settings
2. Frontend tests connection via backend API
3. Backend connects to MCP server and discovers tools
4. Tools are available in MCP Dashboard for testing
5. Tools can be selected during agent creation
6. Agents use tools during conversations via MCP protocol

## 🎯 **Use Cases**

### **Development Workflow**
1. **Local Development**
   - Run MCP server locally: `python my_mcp_server.py`
   - Add to AgentRepo: `http://localhost:8000/mcp`
   - Test tools in dashboard
   - Create agents that use tools

### **Production Deployment**
1. **Deploy to AWS AgentCore**
   - Use AgentRepo's deployment feature
   - Get production MCP URL
   - Configure authentication
   - Monitor in dashboard

### **Enterprise Integration**
1. **Connect to Existing APIs**
   - Wrap existing APIs as MCP servers
   - Add authentication (Bearer tokens, Cognito)
   - Make tools available to all agents
   - Monitor usage and performance

## 🛠 **Example MCP Servers**

### **Math Server**
```python
@mcp.tool()
def calculate_compound_interest(principal: float, rate: float, time: int) -> float:
    """Calculate compound interest"""
    return principal * (1 + rate) ** time
```

### **Data Analysis Server**
```python
@mcp.tool()
def analyze_sales_data(data: List[dict]) -> dict:
    """Analyze sales data and return insights"""
    # Process data and return analysis
    return {"total_sales": sum(item["amount"] for item in data)}
```

### **API Integration Server**
```python
@mcp.tool()
def get_weather(city: str) -> dict:
    """Get weather information for a city"""
    # Call external weather API
    return {"city": city, "temperature": "22°C", "condition": "Sunny"}
```

## 🔍 **Monitoring & Debugging**

### **Server Health**
- Connection status indicators
- Last tested timestamps
- Error messages for failed connections
- Tool discovery status

### **Tool Performance**
- Execution time tracking
- Success/failure rates
- Parameter validation
- Response monitoring

### **Agent Integration**
- Tool usage analytics
- Agent performance with MCP tools
- Error tracking and debugging
- Usage patterns and optimization

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Connection Failed**
   - Check server URL is correct
   - Verify server is running
   - Check authentication credentials
   - Review network connectivity

2. **Tools Not Discovered**
   - Ensure MCP server implements tool discovery
   - Check server logs for errors
   - Verify MCP protocol compliance

3. **Tool Execution Fails**
   - Validate input parameters
   - Check tool implementation
   - Review server error logs
   - Test tool directly on server

### **Debug Steps**
1. Test MCP server directly with MCP Inspector
2. Check backend API logs
3. Verify authentication tokens
4. Test with minimal tool parameters
5. Review MCP protocol compliance

This integration transforms your AgentRepo platform into a comprehensive MCP management system, enabling powerful agent capabilities through external tool integration.
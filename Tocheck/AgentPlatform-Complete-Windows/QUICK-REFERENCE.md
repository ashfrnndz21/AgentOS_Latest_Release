# Quick Reference - Agent Platform

## 🚀 Starting the Platform
```
Double-click: Start-Agent-Platform.bat
Browser opens: http://localhost:3000
```

## 📱 Main Pages
- **Command Centre**: `/` - Main dashboard
- **Agent Dashboard**: `/agents` - Manage agents  
- **Multi-Agent Workspace**: `/multi-agent` - Team coordination
- **Wealth Management**: `/wealth` - Financial tools
- **Customer Value Management**: `/cvm` - CRM and analytics
- **Backend Validation**: `/validation` - System monitoring
- **Settings**: `/settings` - Configuration

## 🤖 Creating Agents
1. Command Centre → "Create Agent"
2. Choose framework: AgentCore, Strands, or Custom
3. Configure: Name, Model, Capabilities
4. Validate: Test agent functionality
5. Deploy: Agent appears in dashboard

## 🔧 Troubleshooting
- **Not starting?** → Run `tools\Fix-Windows-Issues.bat`
- **Need diagnostics?** → Run `tools\Start-Agent-Platform-Debug.bat`
- **Detailed help?** → Read `docs\Windows-Troubleshooting-Guide.md`

## 🔑 API Endpoints
- Health: `http://localhost:5000/health`
- Agents: `http://localhost:5000/api/agents`
- Workflows: `http://localhost:5000/api/workflows`
- Monitoring: `http://localhost:5000/api/monitoring/system`

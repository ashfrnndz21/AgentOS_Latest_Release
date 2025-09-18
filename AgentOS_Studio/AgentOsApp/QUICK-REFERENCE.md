# AgentOS Quick Reference

## 🚀 Starting AgentOS
**Windows**: Double-click `Start-AgentOS.bat`
**Mac/Linux**: Run `./start-agentos.sh` in Terminal

## 🗂️ Navigation Structure
1. **Core Platform** (Always expanded)
   - Dashboard, Architecture Blueprint, Agent Command Centre
   - AI Agents, Multi Agent Workspace, MCP Gateway, AI Marketplace

2. **Agent Use Cases** (Industry-specific)
   - Banking: Risk Analytics, Wealth Management, Customer Insights
   - Telco: Network Twin, Customer Analytics

3. **Monitoring & Control**
   - AgentCore Observability (real-time monitoring)

4. **Configuration**
   - Settings and preferences

## 🤖 Creating Agents
1. Core Platform → Agent Command Centre → "Create Agent"
2. Choose framework: AgentCore, Strands, or Custom
3. Configure: Name, Model, Capabilities
4. Validate and deploy

## 📊 Monitoring
- AgentCore Observability: Real-time agent performance
- System metrics: CPU, memory, network usage
- Agent status: Running, idle, error states

## 🔧 API Endpoints
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/health`
- Agents: `http://localhost:5000/api/agents`
- Monitoring: `http://localhost:5000/api/monitoring/system`

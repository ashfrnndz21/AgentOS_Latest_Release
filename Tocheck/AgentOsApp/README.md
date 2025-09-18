# AgentOS Platform

## 🎯 What's New in This Version

### ✨ **Latest Features:**
- **🗂️ Grouped Navigation**: 4 main sidebar sections (Core Platform, Agent Use Cases, Monitoring & Control, Configuration)
- **📊 AgentCore Observability**: Enhanced monitoring and control panel
- **🏗️ Architecture Blueprint**: Moved to Core Platform for easy access
- **🤖 Enhanced Agent Creation**: Improved wizards and workflows
- **📱 Better UX**: Collapsible navigation groups for cleaner interface

## 🚀 Quick Start

### Windows Users:
1. Extract this ZIP file to any folder
2. Double-click `Start-AgentOS.bat`
3. Install Python if prompted (python.org)
4. Browser opens automatically to AgentOS

### Mac/Linux Users:
1. Extract this ZIP file to any folder
2. Open Terminal in the extracted folder
3. Run: `./start-agentos.sh`
4. Install Python if prompted
5. Browser opens automatically to AgentOS

## 📱 Platform Features

### 🗂️ **Core Platform** (Always expanded)
- **Dashboard**: Main overview and quick actions
- **AgentOS Architecture Blueprint**: System architecture visualization
- **Agent Command Centre**: Create and manage agents
- **AI Agents**: View all your agents
- **Multi Agent Workspace**: Coordinate multiple agents
- **MCP Gateway**: Model Context Protocol integration
- **AI Marketplace**: Discover and share agents

### 🎯 **Agent Use Cases** (Industry-specific)
- **Banking**: Risk Analytics, Wealth Management, Customer Insights
- **Telco**: Network Twin, Customer Analytics
- **Healthcare**: Patient Analytics, Care Management

### 📊 **Monitoring & Control**
- **AgentCore Observability**: Real-time agent monitoring and performance
- System metrics, resource usage, and health monitoring

### ⚙️ **Configuration**
- **Settings**: Platform preferences and API configuration

## 🔧 Technical Details

### **Backend API Endpoints:**
- Health: `http://localhost:5000/health`
- Agents: `http://localhost:5000/api/agents`
- Workflows: `http://localhost:5000/api/workflows`
- Monitoring: `http://localhost:5000/api/monitoring/system`
- AgentCore Observability: `http://localhost:5000/api/monitoring/agents`

### **Frontend:**
- React-based single-page application
- Responsive design with grouped navigation
- Real-time updates and monitoring

## 🛠️ Troubleshooting

### Common Issues:
- **"Python not found"**: Install from python.org with "Add to PATH" checked
- **"Site can't be reached"**: Wait 15-30 seconds, then refresh browser
- **Port conflicts**: Make sure ports 3000 and 5000 are available

### Getting Help:
1. Check that Python is installed: `python --version`
2. Verify backend is running: Visit `http://localhost:5000/health`
3. Check browser console for any JavaScript errors

## 🔒 Privacy & Security

- ✅ Everything runs locally on your computer
- ✅ No data sent to external servers
- ✅ Your API keys and data stay on your machine
- ✅ No account registration required

## 📞 Support

If you encounter issues:
1. Make sure Python 3.8+ is installed
2. Check that ports 3000 and 5000 are available
3. Keep the terminal/command window open to see error messages
4. Most issues are resolved by properly installing Python

---

**Enjoy AgentOS! 🎉**

*Built with React, Flask, and modern web technologies*

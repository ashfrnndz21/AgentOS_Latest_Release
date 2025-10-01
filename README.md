# AgentOS Studio Strands - Latest Release

> **Advanced AI Agent Orchestration Platform with Dynamic Database Integration**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Enabled-orange.svg)](https://ollama.ai/)

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Ollama** (with recommended models)

### Installation
```bash
# Clone the repository
git clone https://github.com/ashfrnndz21/AgentOS_Latest_Release.git
cd AgentOS_Latest_Release

# Run setup script
./scripts/setup/install-dependencies.sh

# Start Ollama and pull models
./scripts/setup/setup-ollama.sh

# Start all services
./scripts/deployment/start-all-services.sh

# Access the application
# Frontend: http://localhost:5173
# Main Orchestrator: http://localhost:5031
# Utility Services: http://localhost:5044
```

## 📁 Repository Structure

```
AgentOS_Latest_Release/
├── docs/                    # Documentation
├── src/                     # Source code
│   ├── backend/            # Backend services
│   ├── frontend/           # React frontend
│   └── shared/             # Shared utilities
├── scripts/                # All scripts
│   ├── setup/              # Setup scripts
│   ├── deployment/         # Deployment scripts
│   ├── testing/            # Testing scripts
│   └── maintenance/        # Maintenance scripts
├── config/                 # Configuration files
├── data/                   # Data storage
├── tests/                  # Test files
├── deployments/            # Deployment configs
├── examples/               # Example configurations
└── tools/                  # Development tools
```

## 🎯 Key Features

- **Dynamic Database Integration** - Smart database discovery and selection
- **Enhanced Agent Orchestration** - Multi-agent coordination with verification
- **LLM-Powered Utility Services** - Natural language to SQL conversion
- **Comprehensive Monitoring** - Real-time health checks and metrics
- **Robust Error Handling** - Automatic SQL validation and fixing

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

**AgentOS Studio Strands** - Empowering the future of intelligent agent orchestration

*Built with ❤️ using React, Python, Ollama, and the Strands Framework*

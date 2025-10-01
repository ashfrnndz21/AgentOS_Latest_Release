#!/bin/bash

# AgentOS Studio Strands - Repository Reorganization Script
# This script reorganizes the repository structure for better organization

set -e

echo "🗂️  Starting repository reorganization..."

# Create new directory structure
echo "📁 Creating new directory structure..."
mkdir -p docs
mkdir -p src/backend/services
mkdir -p src/backend/utility_agents
mkdir -p src/backend/config
mkdir -p src/frontend
mkdir -p src/shared/{types,utils,constants}
mkdir -p scripts/{setup,deployment,testing,maintenance}
mkdir -p config
mkdir -p data/{databases,logs,backups,temp}
mkdir -p tests/{unit,integration,e2e}
mkdir -p deployments/{docker,kubernetes,terraform,cloud}
mkdir -p examples/{agent-configs,database-schemas,workflows}
mkdir -p tools/{generators,validators,formatters}

echo "✅ Directory structure created"

# Move backend files
echo "🔄 Moving backend files..."
if [ -d "backend" ]; then
    # Move core services
    cp -r backend/main_orchestrator.py src/backend/services/ 2>/dev/null || true
    cp -r backend/a2a_service.py src/backend/services/ 2>/dev/null || true
    cp -r backend/strands_sdk_api.py src/backend/services/ 2>/dev/null || true
    cp -r backend/utility_gateway.py src/backend/services/ 2>/dev/null || true
    
    # Move utility agents
    if [ -d "backend/services/utility_agents" ]; then
        cp -r backend/services/utility_agents/* src/backend/utility_agents/
    fi
    
    # Move config files
    if [ -d "backend/config" ]; then
        cp -r backend/config/* src/backend/config/
    fi
    
    # Move requirements
    cp backend/requirements.txt src/backend/ 2>/dev/null || true
    
    echo "✅ Backend files moved"
fi

# Move frontend files
echo "🔄 Moving frontend files..."
if [ -d "src" ] && [ ! -d "src/backend" ]; then
    # This is the React frontend src directory
    cp -r src/* src/frontend/ 2>/dev/null || true
    echo "✅ Frontend files moved"
fi

# Move public files
echo "🔄 Moving public files..."
if [ -d "public" ]; then
    cp -r public/* src/frontend/public/ 2>/dev/null || true
    echo "✅ Public files moved"
fi

# Move package.json
if [ -f "package.json" ]; then
    cp package.json src/frontend/
    echo "✅ Package.json moved"
fi

# Move scripts
echo "🔄 Organizing scripts..."
if [ -d "scripts" ]; then
    # Categorize scripts
    for script in scripts/*.sh; do
        if [ -f "$script" ]; then
            script_name=$(basename "$script")
            case "$script_name" in
                start-*|stop-*|restart-*)
                    cp "$script" scripts/deployment/
                    ;;
                install-*|setup-*)
                    cp "$script" scripts/setup/
                    ;;
                test-*|*test*)
                    cp "$script" scripts/testing/
                    ;;
                cleanup-*|backup-*|maintenance-*)
                    cp "$script" scripts/maintenance/
                    ;;
                *)
                    cp "$script" scripts/deployment/
                    ;;
            esac
        fi
    done
    
    # Move Python test scripts
    for script in scripts/*.py; do
        if [ -f "$script" ]; then
            cp "$script" scripts/testing/
        fi
    done
    
    echo "✅ Scripts organized"
fi

# Move configuration files
echo "🔄 Moving configuration files..."
if [ -f ".env.example" ]; then
    cp .env.example config/environment.example
fi

# Move Docker files
if [ -f "Dockerfile" ]; then
    cp Dockerfile deployments/docker/Dockerfile.backend
fi

if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml config/
fi

# Move data directories
echo "🔄 Organizing data directories..."
if [ -d "backend/utility_databases" ]; then
    cp -r backend/utility_databases/* data/databases/ 2>/dev/null || true
fi

if [ -d "logs" ]; then
    cp -r logs/* data/logs/ 2>/dev/null || true
fi

if [ -d "backups" ]; then
    cp -r backups/* data/backups/ 2>/dev/null || true
fi

# Move documentation
echo "🔄 Organizing documentation..."
if [ -d "docs" ]; then
    cp -r docs/* docs/ 2>/dev/null || true
fi

# Create new README structure
echo "📝 Creating updated README..."
cat > README.md << 'EOF'
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
EOF

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/

# Data and logs
data/logs/*
data/temp/*
data/backups/*
*.log

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build outputs
dist/
build/
*.egg-info/

# Database files (keep structure but not data)
data/databases/*.db
data/databases/*.sqlite
data/databases/*.sqlite3

# Temporary files
*.tmp
*.temp
EOF

# Create CHANGELOG.md
echo "📝 Creating CHANGELOG.md..."
cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to AgentOS Studio Strands will be documented in this file.

## [2.0.0] - 2025-10-01

### Added
- Dynamic database selection and discovery
- Enhanced SQL validation for all LLM models
- User-driven model selection (no automatic fallbacks)
- Comprehensive error handling and recovery
- Improved tool execution with detailed tracing
- Enhanced service monitoring and health checks
- Repository structure reorganization

### Fixed
- granite3.3:2b SQL generation issues
- Database tool execution problems
- Hardcoded database name dependencies
- SQL syntax validation errors
- Service health monitoring issues

### Changed
- Repository structure completely reorganized
- Scripts categorized by function
- Configuration files centralized
- Documentation structure improved
- Service architecture enhanced

### Removed
- Duplicate directory structures
- Automatic model fallback system
- Hardcoded database references
- Outdated configuration files

## [1.0.0] - 2025-09-30

### Added
- Initial release
- Basic agent orchestration
- Database creation capabilities
- Synthetic data generation
- A2A agent communication
- Strands SDK integration
EOF

echo "🎉 Repository reorganization completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review the new structure"
echo "2. Test the moved files"
echo "3. Update any remaining references"
echo "4. Commit and push the changes"
echo ""
echo "🗂️  New structure created at:"
echo "   - Source code: src/"
echo "   - Scripts: scripts/"
echo "   - Configuration: config/"
echo "   - Documentation: docs/"
echo "   - Data: data/"
echo "   - Tests: tests/"
echo "   - Deployments: deployments/"
echo "   - Examples: examples/"
echo "   - Tools: tools/"

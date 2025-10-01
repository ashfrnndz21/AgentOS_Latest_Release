# Installation Guide

## Prerequisites

Before installing AgentOS Studio Strands, ensure you have the following installed:

### Required Software

- **Python 3.10+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/downloads)
- **Ollama** - [Download Ollama](https://ollama.ai/)

### System Requirements

- **RAM**: Minimum 8GB, Recommended 16GB+
- **Storage**: At least 10GB free space
- **OS**: macOS, Linux, or Windows 10/11

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/ashfrnndz21/AgentOS_Latest_Release.git
cd AgentOS_Latest_Release
```

### 2. Install Python Dependencies

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r src/backend/requirements.txt
```

### 3. Install Node.js Dependencies

```bash
# Install frontend dependencies
cd src/frontend
npm install
cd ../..
```

### 4. Setup Ollama

```bash
# Start Ollama service
ollama serve

# Pull recommended models
ollama pull qwen3:1.7b
ollama pull llama3.1
ollama pull phi3
ollama pull granite3.3:2b
```

### 5. Configure Environment

```bash
# Copy environment template
cp config/environment.example .env

# Edit configuration
nano .env  # or your preferred editor
```

### 6. Initialize Database

```bash
# Create data directories
mkdir -p data/databases
mkdir -p data/logs
mkdir -p data/backups

# Initialize Supabase (optional)
cd supabase
supabase start
cd ..
```

## Quick Start

### Automated Setup

```bash
# Run the setup script
./scripts/setup/install-dependencies.sh

# Start all services
./scripts/deployment/start-all-services.sh
```

### Manual Setup

```bash
# Start backend services
python3 src/backend/services/main_orchestrator.py &
python3 src/backend/services/a2a_service.py &
python3 src/backend/services/strands_sdk_api.py &
python3 src/backend/services/utility_gateway.py &

# Start frontend
cd src/frontend
npm run dev &
```

## Verification

### Check Service Health

```bash
# Test all services
curl http://localhost:5031/health  # Main Orchestrator
curl http://localhost:5008/api/a2a/health  # A2A Service
curl http://localhost:5006/api/strands-sdk/health  # Strands SDK
curl http://localhost:5044/api/utility/health  # Utility Services
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Main Orchestrator**: http://localhost:5031
- **Utility Services**: http://localhost:5044

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on specific ports
   lsof -ti:5031 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

2. **Ollama Not Responding**
   ```bash
   # Restart Ollama
   pkill ollama
   ollama serve
   ```

3. **Python Dependencies Issues**
   ```bash
   # Reinstall dependencies
   pip install --force-reinstall -r src/backend/requirements.txt
   ```

4. **Node.js Dependencies Issues**
   ```bash
   # Clear cache and reinstall
   cd src/frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Log Files

Check log files for detailed error information:

- `data/logs/main_orchestrator.log`
- `data/logs/a2a_service.log`
- `data/logs/strands_sdk.log`
- `data/logs/utility_services.log`

## Next Steps

After successful installation:

1. Read the [Architecture Guide](ARCHITECTURE.md)
2. Explore the [API Documentation](API.md)
3. Check out [Usage Examples](../examples/)
4. Review [Deployment Options](DEPLOYMENT.md)

## Support

If you encounter issues:

1. Check the [Troubleshooting section](#troubleshooting)
2. Review log files in `data/logs/`
3. Create an issue on [GitHub](https://github.com/ashfrnndz21/AgentOS_Latest_Release/issues)
4. Join our [Discussions](https://github.com/ashfrnndz21/AgentOS_Latest_Release/discussions)

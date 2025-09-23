# 🚀 AgentOS Studio - Quick Start Guide

## One-Command Installation

After cloning the repository, simply run:

```bash
./install.sh
```

This single command will:
- ✅ Set up Python virtual environment
- ✅ Install all dependencies (including missing ones we discovered)
- ✅ Create missing library files
- ✅ Start all services
- ✅ Open the application at http://localhost:5173

## Alternative: Step-by-Step Setup

If you prefer manual control:

```bash
# 1. Complete setup (dependencies + missing files)
./setup-complete.sh

# 2. Start all services
./start-all-services.sh

# 3. Access the application
open http://localhost:5173
```

## NPM Scripts

You can also use npm scripts:

```bash
# Complete installation and startup
npm run install:complete

# Just setup (no startup)
npm run setup

# Start services
npm run start

# Stop services
npm run stop
```

## What's Fixed

This setup includes all the fixes we discovered:

### Missing Dependencies
- `psutil` - for resource monitoring
- `PyPDF2` - for PDF processing in RAG API
- `python-multipart` - for file uploads

### Missing Library Files
- `src/lib/a2aClient.ts` - A2A communication client
- `src/lib/services/StrandsSdkService.ts` - Strands SDK service
- `src/lib/services/StrandsAgentService.ts` - Strands agent service
- `src/lib/services/A2AService.ts` - A2A service wrapper
- `src/lib/services/StrandsWorkflowOrchestrator.ts` - Workflow orchestration

### Service Management
- All services properly configured
- Port conflicts resolved
- Health checks working
- Resource monitoring functional

## Prerequisites

- **Python 3.8+** (with pip)
- **Node.js 16+** (with npm)
- **Ollama** (install from https://ollama.ai)

## Troubleshooting

If you encounter issues:

1. **Check prerequisites**: Ensure Python, Node.js, and Ollama are installed
2. **Re-run setup**: `./setup-complete.sh`
3. **Check service status**: Visit http://localhost:5173 → Settings → Resources
4. **View logs**: Check individual service logs in `backend/` directory

## Service URLs

- **Frontend**: http://localhost:5173
- **Agent Registry**: http://localhost:5010
- **Strands API**: http://localhost:5004
- **A2A Service**: http://localhost:5008
- **RAG API**: http://localhost:5003
- **Enhanced Orchestration**: http://localhost:5014
- **Resource Monitor**: http://localhost:5011

## Next Steps

1. **Explore the interface**: Navigate through different sections
2. **Check service status**: Go to Settings → Resources
3. **Test functionality**: Try creating agents, workflows, etc.
4. **Read documentation**: Check `SETUP-README.md` for detailed information

---

**🎉 You're all set! The AgentOS Studio is ready to use.**


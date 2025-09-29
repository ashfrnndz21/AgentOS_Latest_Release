# AgentOS Studio Strands - System Management Guide

## 🚀 Quick Start Commands

### Start All Services
```bash
./scripts/start-all-services.sh
```

### Stop All Services  
```bash
./scripts/stop-all-services.sh
```

### Monitor Health (Auto-restart)
```bash
./scripts/health-monitor.sh
```

## 📊 Service Architecture

### Service Dependencies (Start Order)
1. **Strands SDK API** (Port 5006) - Base agent registry
2. **A2A Service** (Port 5008) - Agent-to-agent communication  
3. **Main System Orchestrator** (Port 5030) - Query orchestration

### Critical Configuration
- **Main System Orchestrator** only shows agents with `orchestration_enabled: true`
- **A2A Service** manages agent registration and communication
- **Strands SDK** provides agent metadata and capabilities

## 🔧 Troubleshooting

### Port Conflicts
If you get "Address already in use" errors:
```bash
# Kill all services and restart
./scripts/stop-all-services.sh
./scripts/start-all-services.sh
```

### Service Not Responding
```bash
# Check service health
curl http://localhost:5006/api/strands-sdk/agents  # Strands SDK
curl http://localhost:5008/api/a2a/health         # A2A Service  
curl http://localhost:5030/api/main-orchestrator/discover-agents  # Orchestrator
```

### Agent Not Showing in Orchestrator
1. Check if agent is registered with A2A: `curl http://localhost:5008/api/a2a/agents`
2. Verify `orchestration_enabled: true` in A2A response
3. Check agent capabilities are not empty

## 📝 Logs
- All service logs: `logs/`
- Service PIDs: `logs/*.pid`
- Health monitor logs: Console output

## 🛡️ Permanent Setup

### Option 1: Manual Management
Use the startup scripts whenever you need the system:
```bash
./scripts/start-all-services.sh
```

### Option 2: Background Monitoring
Run health monitor in background for auto-restart:
```bash
nohup ./scripts/health-monitor.sh > logs/health-monitor.log 2>&1 &
```

### Option 3: System Service (Advanced)
Create systemd services for automatic startup (Linux) or launchd (macOS).

## ⚠️ Important Notes

1. **Always start services in dependency order** (Strands SDK → A2A → Orchestrator)
2. **Main System Orchestrator requires A2A-registered agents** with `orchestration_enabled: true`
3. **Port conflicts are the most common issue** - use stop script before restarting
4. **Health monitor provides automatic recovery** from service failures

## 🔍 Health Check Endpoints

- **Strands SDK**: `GET /api/strands-sdk/agents`
- **A2A Service**: `GET /api/a2a/health`  
- **Main Orchestrator**: `GET /api/main-orchestrator/discover-agents`

## 📞 Support

If issues persist:
1. Check logs in `logs/` directory
2. Verify all ports (5006, 5008, 5030) are free
3. Ensure agents are properly registered with A2A service
4. Run health monitor for automatic recovery


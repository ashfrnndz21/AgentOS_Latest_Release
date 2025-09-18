# 🚀 Easy Setup Guide - Multi-Agent Platform

## One-Click Setup (Recommended)

### Option 1: Automated Setup Script
```bash
python setup_app.py
```

This script will:
- ✅ Check all prerequisites
- ✅ Auto-detect available ports
- ✅ Start backend on correct port
- ✅ Configure frontend automatically
- ✅ Test all connections
- ✅ Provide next steps

### Option 2: Manual Setup (3 Steps)

#### Step 1: Start Ollama
```bash
ollama serve
```

#### Step 2: Start Backend
```bash
python backend/simple_api.py
```

#### Step 3: Start Frontend
```bash
npm run dev
```

## 🔧 Connection Manager

The app now includes a **Connection Manager** that provides:

### Auto-Detection
- Automatically finds backend on available ports
- Tests all connections
- Provides one-click fixes

### Manual Configuration
- Set custom backend/Ollama ports
- Test connections individually
- Reset to defaults

### Real-Time Status
- Live connection monitoring
- Error diagnostics
- Quick reconnect options

## 📍 Where to Find Connection Manager

1. **In Ollama Terminal**: Right sidebar
2. **In Settings**: Connection tab
3. **In Multi-Agent Workspace**: Status bar
4. **Any page**: Connection status indicator

## 🎯 Centralized Configuration

### All ports are now managed centrally:
- **Backend**: Auto-detected (default: 5002)
- **Ollama**: Auto-detected (default: 11434)
- **Frontend**: 3000

### Configuration is stored in:
- `src/config/appConfig.ts` - Main configuration
- `localStorage` - User preferences
- Auto-generated configs for detected ports

## 🔄 Easy Reset & Reconnect

### If connections fail:

1. **Auto-Fix Button**: Tries to reconnect automatically
2. **Reset to Defaults**: Restores original settings
3. **Manual Config**: Set custom ports if needed

### Connection Status Indicators:
- 🟢 **Connected**: All systems working
- 🔴 **Disconnected**: Connection issues
- 🟡 **Partial**: Some services offline
- 🔵 **Checking**: Testing connections

## 🚨 Troubleshooting

### Common Issues & Quick Fixes:

#### "Backend Not Found"
```bash
# Auto-detect and fix
python setup_app.py

# Or manually check ports
lsof -i :5002
lsof -i :8000
```

#### "Ollama Not Running"
```bash
ollama serve
# Wait 3 seconds, then refresh frontend
```

#### "Port Conflicts"
- Use Connection Manager → Auto Setup
- Or manually set different ports in Advanced settings

#### "Frontend Can't Connect"
- Check Connection Status indicator
- Click "Auto-Fix" button
- Or use Connection Manager

## 🎉 Success Indicators

When everything is working, you'll see:
- ✅ Green connection status
- ✅ "All systems connected" message
- ✅ Working Ollama Terminal
- ✅ Functional Multi-Agent Workspace
- ✅ Document RAG available

## 📊 System Architecture

```
Frontend (React) ←→ Centralized Config ←→ Backend (FastAPI) ←→ Ollama
     ↓                      ↓                    ↓              ↓
Port 3000            Auto-Detection        Port 5002      Port 11434
```

### Key Components:
- **AppConfig**: Centralized port management
- **ApiClient**: Unified API calls
- **ConnectionManager**: Setup & troubleshooting
- **ConnectionStatus**: Real-time monitoring

## 🔮 Future-Proof Design

The new system prevents port issues by:
- **Auto-detection**: Finds available ports automatically
- **Centralized config**: Single source of truth
- **Real-time monitoring**: Detects disconnections
- **Easy reset**: One-click restoration
- **Persistent settings**: Remembers your preferences

## 💡 Pro Tips

1. **Bookmark Connection Manager**: Quick access to troubleshooting
2. **Use Auto-Setup**: Saves time on initial configuration
3. **Monitor Status**: Keep an eye on connection indicators
4. **Reset When Stuck**: Don't spend time debugging, just reset
5. **Check Prerequisites**: Ensure Ollama and Python are installed

---

**🎯 The goal: Zero-configuration startup that "just works" every time!**

No more manual port hunting or connection troubleshooting. The system now handles all of this automatically.
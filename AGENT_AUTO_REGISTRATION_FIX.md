# Agent Auto-Registration Fix

## Problem Summary

The system was automatically registering multiple agents every time it started up, even after users had deleted them. This was happening because:

1. **Multiple services** were auto-registering default agents on startup
2. **Multiple databases** were storing agent data persistently
3. **No configuration control** over auto-registration behavior

## Root Causes Identified

### 1. Agent Registry Service (`backend/agent_registry.py`)
- **Lines 281-306**: Auto-registered 3 default agents every startup
- **Fixed**: Now checks configuration and existing agents before registering

### 2. Enhanced Orchestrator System (`backend/enhanced_orchestrator_system.py`)
- **Lines 36-37**: Auto-registered example agents if none existed
- **Fixed**: Disabled auto-registration, now requires explicit enablement

### 3. Multiple Database Persistence
- `agent_registry.db` - 4 agents (including Stock Market Agent)
- `strands_sdk.db` - 1 test agent  
- `enhanced_agent_registry.db` - 4 example agents
- `aws_agentcore.db` - 1 agent
- **Fixed**: All databases cleaned, 10 agents removed total

## Solution Implemented

### 1. Configuration-Based Control
Created `agent_auto_registration_config.env`:
```env
# Set to false to prevent automatic agent registration on startup
AGENT_REGISTRY_AUTO_REGISTER_DEFAULTS = false
ENHANCED_ORCHESTRATOR_AUTO_REGISTER_EXAMPLES = false
STRANDS_SDK_AUTO_REGISTER_TEST_AGENTS = false
A2A_SERVICE_AUTO_REGISTER_DEFAULTS = false
MAIN_ORCHESTRATOR_AUTO_REGISTER_DEFAULTS = false
```

### 2. Database Cleanup Script
Created `cleanup_agent_databases.py` that:
- Removes all auto-registered agents from all databases
- Provides clear feedback on cleanup progress
- Can be run anytime to reset agent state

### 3. Smart Registration Logic
Updated services to:
- Check configuration before auto-registering
- Only register if no existing agents found
- Provide clear logging about registration decisions

## How to Use

### To Prevent Auto-Registration (Default)
The system now defaults to **no auto-registration**. Agents will only be registered when:
1. Explicitly created through the UI
2. Manually registered via API calls  
3. Imported from configuration files

### To Enable Auto-Registration (If Needed)
1. Edit `backend/agent_auto_registration_config.env`
2. Set desired services to `true`
3. Restart the services

### To Clean All Databases
```bash
cd backend
python cleanup_agent_databases.py
```

## Verification

After implementing this fix:
1. **Start the system** - No agents should be auto-registered
2. **Check databases** - All agent tables should be empty
3. **Create agents manually** - Only user-created agents should appear
4. **Restart system** - Previously created agents should persist, no new ones added

## Files Modified

1. `backend/agent_registry.py` - Added configuration-based auto-registration control
2. `backend/enhanced_orchestrator_system.py` - Disabled auto-registration
3. `backend/cleanup_agent_databases.py` - New cleanup script
4. `backend/agent_auto_registration_config.env` - New configuration file

## Benefits

✅ **No more unwanted agent registration on startup**  
✅ **Clean database state**  
✅ **User-controlled agent creation**  
✅ **Configurable auto-registration**  
✅ **Clear logging and feedback**  
✅ **Easy cleanup and reset capability**

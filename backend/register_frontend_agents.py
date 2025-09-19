#!/usr/bin/env python3
"""
Register Frontend Agents with Backend Orchestration
Automatically registers frontend A2A agents with the backend system
"""

import requests
import json
import time
from typing import Dict, List, Any

# Configuration
FRONTEND_A2A_URL = "http://localhost:5008"
BRIDGE_URL = "http://localhost:5012"

def get_frontend_agents() -> List[Dict[str, Any]]:
    """Get list of frontend A2A agents"""
    try:
        response = requests.get(f"{FRONTEND_A2A_URL}/api/a2a/agents", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get('agents', [])
        else:
            print(f"❌ Failed to get frontend agents: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting frontend agents: {e}")
        return []

def register_agent_with_bridge(agent: Dict[str, Any]) -> bool:
    """Register a frontend agent with the bridge service"""
    try:
        # Prepare agent data for bridge registration
        bridge_agent_data = {
            "id": agent.get('id'),
            "name": agent.get('name'),
            "description": agent.get('description', ''),
            "capabilities": agent.get('capabilities', []),
            "model": agent.get('model', ''),
            "status": agent.get('status', 'active')
        }
        
        response = requests.post(
            f"{BRIDGE_URL}/register",
            json=bridge_agent_data,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            if result.get('status') == 'success':
                print(f"✅ Registered: {agent.get('name')} -> {result.get('bridge_url')}")
                return True
            else:
                print(f"❌ Registration failed: {result.get('error')}")
                return False
        else:
            print(f"❌ Bridge registration failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error registering agent: {e}")
        return False

def main():
    """Main registration process"""
    print("🌉 Frontend Agent Registration with Backend Orchestration")
    print("=" * 60)
    
    # Check if services are running
    print("🔍 Checking services...")
    
    # Check frontend A2A service
    try:
        response = requests.get(f"{FRONTEND_A2A_URL}/api/a2a/health", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend A2A service is running")
        else:
            print("❌ Frontend A2A service is not responding")
            return
    except Exception as e:
        print(f"❌ Frontend A2A service is not available: {e}")
        return
    
    # Check bridge service
    try:
        response = requests.get(f"{BRIDGE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Bridge service is running")
        else:
            print("❌ Bridge service is not responding")
            return
    except Exception as e:
        print(f"❌ Bridge service is not available: {e}")
        return
    
    print("\n📋 Getting frontend agents...")
    frontend_agents = get_frontend_agents()
    
    if not frontend_agents:
        print("❌ No frontend agents found")
        return
    
    print(f"📊 Found {len(frontend_agents)} frontend agents")
    
    # Register each agent
    print("\n🔄 Registering agents with backend orchestration...")
    registered_count = 0
    
    for agent in frontend_agents:
        print(f"\n📝 Registering: {agent.get('name')} ({agent.get('id')})")
        if register_agent_with_bridge(agent):
            registered_count += 1
        time.sleep(0.5)  # Small delay between registrations
    
    print(f"\n✅ Registration complete: {registered_count}/{len(frontend_agents)} agents registered")
    
    if registered_count > 0:
        print("\n🎯 Frontend agents are now available for backend orchestration!")
        print("🔗 You can now use the real-time orchestration monitor with frontend agents")
    else:
        print("\n❌ No agents were successfully registered")

if __name__ == '__main__':
    main()

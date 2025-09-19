#!/usr/bin/env python3
"""
Test script to demonstrate the Real-Time LLM Orchestration Monitor
This simulates what the frontend should display when processing a query.
"""

import requests
import socketio
import time
import json
from datetime import datetime

# Configuration
ORCHESTRATION_URL = "http://localhost:5009"
SESSION_ID = f"demo_session_{int(time.time())}"

def test_real_time_orchestration():
    print("🚀 Testing Real-Time LLM Orchestration Monitor")
    print("=" * 60)
    
    # Create Socket.IO client
    sio = socketio.Client()
    
    # Track received events
    received_events = []
    
    @sio.event
    def connect():
        print("✅ WebSocket Connected!")
        print(f"📡 Session ID: {SESSION_ID}")
        print()
    
    @sio.event
    def disconnect():
        print("🔌 WebSocket Disconnected")
    
    @sio.event
    def orchestration_start(data):
        print("🔄 ORCHESTRATION START")
        print(f"   Query: {data.get('payload', {}).get('query', 'N/A')}")
        print(f"   Session: {data.get('payload', {}).get('session_id', 'N/A')}")
        print(f"   Timestamp: {data.get('payload', {}).get('timestamp', 'N/A')}")
        print()
        received_events.append('orchestration_start')
    
    @sio.event
    def orchestration_step(data):
        payload = data.get('payload', {})
        step_type = payload.get('step_type', 'Unknown')
        print(f"📋 ORCHESTRATION STEP: {step_type}")
        
        if step_type == 'AGENT_DISCOVERY':
            details = payload.get('details', {})
            agents_found = details.get('agents_found', 0)
            agent_ids = details.get('agent_ids', [])
            print(f"   Agents Found: {agents_found}")
            print(f"   Agent IDs: {agent_ids}")
        else:
            print(f"   Details: {payload.get('details', 'N/A')}")
        print()
        received_events.append('orchestration_step')
    
    @sio.event
    def orchestration_complete(data):
        payload = data.get('payload', {})
        print("✅ ORCHESTRATION COMPLETE")
        print(f"   Query: {payload.get('query', 'N/A')}")
        print(f"   Total Agents: {payload.get('total_agents_available', 'N/A')}")
        print(f"   Execution Strategy: {payload.get('orchestration_plan', {}).get('execution_strategy', 'N/A')}")
        print()
        received_events.append('orchestration_complete')
    
    @sio.event
    def agent_conversation(data):
        payload = data.get('payload', {})
        print("💬 AGENT CONVERSATION")
        print(f"   Agent: {payload.get('agent_name', 'N/A')}")
        print(f"   Question: {payload.get('question', 'N/A')}")
        print(f"   Response: {payload.get('llm_response', 'N/A')}")
        print(f"   Execution Time: {payload.get('execution_time', 'N/A')}s")
        print()
        received_events.append('agent_conversation')
    
    try:
        # Connect to WebSocket
        print("🔌 Connecting to WebSocket...")
        sio.connect(ORCHESTRATION_URL)
        
        # Join orchestration session
        print("🏠 Joining orchestration session...")
        sio.emit('join_orchestration', {'session_id': SESSION_ID})
        time.sleep(0.5)  # Give time to join
        
        # Send orchestration request
        query = "what is 15 * 8"
        print(f"📤 Sending Query: '{query}'")
        print()
        
        response = requests.post(
            f"{ORCHESTRATION_URL}/api/strands-orchestration/orchestrate",
            json={
                "query": query,
                "session_id": SESSION_ID,
                "user_id": "demo_user"
            },
            headers={"Content-Type": "application/json"}
        )
        
        print("⏳ Waiting for WebSocket events...")
        print()
        
        # Wait for all events to be received
        start_time = time.time()
        timeout = 30  # 30 seconds timeout
        
        while len(received_events) < 4 and (time.time() - start_time) < timeout:
            time.sleep(0.1)
        
        # Check HTTP response
        if response.status_code == 200:
            result = response.json()
            print("📊 HTTP RESPONSE SUMMARY:")
            print(f"   Status: {response.status_code}")
            print(f"   Success: {result.get('success', 'N/A')}")
            print(f"   Execution Time: {result.get('execution_results', {}).get('execution_time', 'N/A')}s")
            print()
        
        # Summary
        print("📋 EVENT SUMMARY:")
        print(f"   Events Received: {len(received_events)}")
        for i, event in enumerate(received_events, 1):
            print(f"   {i}. {event}")
        print()
        
        if len(received_events) >= 4:
            print("✅ SUCCESS: All orchestration events received!")
        else:
            print(f"⚠️  WARNING: Only {len(received_events)}/4 events received")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        sio.disconnect()
        print("🔚 Test completed")

if __name__ == "__main__":
    test_real_time_orchestration()

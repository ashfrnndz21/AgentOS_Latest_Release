#!/usr/bin/env python3
"""
Test script to demonstrate real-time orchestration with WebSocket events
"""

import socketio
import time
import json

# Create a Socket.IO client
sio = socketio.Client()

@sio.event
def connect():
    print("🔌 Connected to orchestration service!")
    sio.emit('join_orchestration', {'session_id': 'test_session'})

@sio.event
def disconnect():
    print("🔌 Disconnected from orchestration service")

@sio.event
def orchestration_status(data):
    print(f"📊 Status: {data}")

@sio.event
def orchestration_step(data):
    print(f"🔄 Step: {data['payload']['step_type']} - {data['payload']['elapsed_seconds']:.2f}s")
    if 'details' in data['payload']:
        for key, value in data['payload']['details'].items():
            if key in ['agent_name', 'llm_response_preview', 'tools_used']:
                print(f"   {key}: {value}")

@sio.event
def agent_conversation(data):
    print(f"💬 Agent Conversation: {data['payload']['agent_name']}")
    print(f"   Question: {data['payload']['question']}")
    print(f"   LLM Response: {data['payload']['llm_response'][:200]}...")
    print(f"   Tools: {data['payload']['tools_available']}")
    print(f"   Execution Time: {data['payload']['execution_time']:.2f}s")
    print()

@sio.event
def orchestration_complete(data):
    print(f"✅ Orchestration Complete!")
    print(f"   Final Response: {data['payload']['final_response'][:200]}...")
    print(f"   Total Time: {data['payload']['total_time_seconds']:.2f}s")
    print(f"   Agents Used: {data['payload']['selected_agents']}")

def test_orchestration():
    try:
        # Connect to the orchestration service
        print("Connecting to orchestration service...")
        sio.connect('http://localhost:8005')
        
        # Wait a moment for connection
        time.sleep(1)
        
        # Test orchestration
        print("\n🚀 Starting orchestration test...")
        import requests
        
        response = requests.post('http://localhost:8005/orchestrate', 
                               json={'question': 'What is 2+2 and what is the weather like?', 'user': 'Test User'})
        
        if response.status_code == 200:
            print("✅ Orchestration request sent successfully!")
        else:
            print(f"❌ Orchestration failed: {response.status_code}")
        
        # Wait for completion
        time.sleep(35)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        sio.disconnect()

if __name__ == "__main__":
    test_orchestration()








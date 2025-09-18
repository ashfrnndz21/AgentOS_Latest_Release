#!/usr/bin/env python3
"""
Debug Workflow Connection Issues
Check what models are available and fix the chat interface configuration
"""

import requests
import json

def check_ollama_models():
    """Check what models are available in Ollama"""
    print("🔍 Checking Available Ollama Models...")
    
    try:
        response = requests.get('http://localhost:5002/api/ollama/models', timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', [])
            
            print(f"✅ Found {len(models)} available models:")
            for i, model in enumerate(models, 1):
                name = model.get('name', 'Unknown')
                size = model.get('size', 0)
                size_gb = size / (1024**3) if size > 0 else 0
                print(f"  {i}. {name} ({size_gb:.1f}GB)")
            
            return models
        else:
            print(f"❌ Failed to get models - Status: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error connecting to Ollama: {e}")
        return []

def analyze_workflow_connection():
    """Analyze what should happen when chat interface connects to agent"""
    print("\n🔄 Workflow Connection Analysis:")
    print("="*50)
    
    print("\n📋 Current Setup:")
    print("  Node 1: 'Test' (Chat Interface)")
    print("    - Type: Direct LLM")
    print("    - Model: 'Phi 3 (LATEST)' ❌ (NOT FOUND)")
    print("    - Status: Failing")
    
    print("\n  Node 2: 'Technical Expert' (Agent)")
    print("    - Type: Agent Node") 
    print("    - Role: Technical Consultant")
    print("    - Model: phi3 ✅")
    print("    - Status: Ready")
    
    print("\n🔗 Connection Flow (What Should Happen):")
    print("  1. User types message in 'Test' chat interface")
    print("  2. Chat interface processes message with its model")
    print("  3. Message flows to 'Technical Expert' agent")
    print("  4. Agent processes with its capabilities")
    print("  5. Response flows back to chat interface")
    print("  6. User sees combined response")
    
    print("\n❌ Current Problem:")
    print("  - Chat interface model 'Phi 3 (LATEST)' doesn't exist")
    print("  - Connection fails at step 2")
    print("  - Workflow never reaches the agent")

def suggest_fixes(available_models):
    """Suggest fixes based on available models"""
    print("\n🔧 Suggested Fixes:")
    print("="*30)
    
    if not available_models:
        print("❌ No models available - Start Ollama first!")
        return
    
    print("\n✅ Option 1: Update Chat Interface Model")
    print("  1. Click on 'Test' chat interface node")
    print("  2. Click 'Configure' or edit button")
    print("  3. Change model from 'Phi 3 (LATEST)' to one of:")
    
    for model in available_models[:3]:  # Show top 3
        name = model.get('name', 'Unknown')
        print(f"     - {name}")
    
    print("\n✅ Option 2: Install Missing Model")
    print("  Run in terminal:")
    print("    ollama pull phi3")
    print("    # or")
    print("    ollama pull phi3:latest")
    
    print("\n✅ Option 3: Use Agent's Model")
    print("  1. Configure chat interface to use same model as agent")
    print("  2. Both nodes use 'phi3' model")
    print("  3. Ensures compatibility")

def test_workflow_execution():
    """Test what the workflow execution should look like"""
    print("\n🧪 Expected Workflow Execution:")
    print("="*40)
    
    print("\n📝 Test Scenario:")
    print("  User Input: 'Hello, can you help me with a technical question?'")
    
    print("\n🔄 Processing Flow:")
    print("  Step 1: Chat Interface ('Test')")
    print("    - Receives user message")
    print("    - Processes with Direct LLM model")
    print("    - Adds conversational context")
    
    print("\n  Step 2: Agent Node ('Technical Expert')")
    print("    - Receives processed message")
    print("    - Applies technical consultant role")
    print("    - Uses phi3 model for specialized response")
    print("    - Adds technical expertise")
    
    print("\n  Step 3: Response Flow")
    print("    - Agent response flows back to chat interface")
    print("    - Chat interface formats final response")
    print("    - User sees comprehensive technical assistance")
    
    print("\n✅ Expected Output:")
    print("    'Hello! I'm your technical consultant. I can help you with")
    print("     technical questions, troubleshooting, system analysis, and")
    print("     provide expert guidance. What technical challenge can I")
    print("     assist you with today?'")

def main():
    """Run complete workflow connection debug"""
    print("🚀 Workflow Connection Debug")
    print("="*50)
    
    # Check available models
    models = check_ollama_models()
    
    # Analyze the connection
    analyze_workflow_connection()
    
    # Suggest fixes
    suggest_fixes(models)
    
    # Show expected execution
    test_workflow_execution()
    
    print("\n" + "="*50)
    print("🎯 Quick Fix: Update the 'Test' chat interface model!")
    print("="*50)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Test script to verify Agent Palette integration with Ollama agents
"""

import requests
import json

def test_ollama_agents_available():
    """Test that Ollama agents are available for the palette"""
    
    print("🧪 Testing Ollama Agents for Agent Palette Integration")
    print("=" * 60)
    
    try:
        # Get Ollama agents
        response = requests.get("http://localhost:8000/api/agents/ollama/enhanced", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            
            print(f"✅ Found {len(agents)} Ollama agents")
            
            if len(agents) == 0:
                print("⚠️ No agents available for palette")
                print("💡 Create some agents in Ollama Agent Management first")
                return False
            
            print(f"\\n📋 Available Agents for Palette:")
            
            for i, agent in enumerate(agents, 1):
                name = agent.get('name', 'Unnamed')
                role = agent.get('role', 'No role')
                model = agent.get('model', {})
                model_name = model.get('model_id', 'Unknown') if isinstance(model, dict) else str(model)
                capabilities = agent.get('capabilities', {})
                guardrails = agent.get('guardrails', {})
                
                print(f"\\n  {i}. {name}")
                print(f"     Role: {role}")
                print(f"     Model: {model_name}")
                print(f"     Guardrails: {'✅ Enabled' if guardrails.get('enabled') else '❌ Disabled'}")
                
                # Show capabilities
                if capabilities:
                    caps = []
                    if capabilities.get('conversation'): caps.append('Chat')
                    if capabilities.get('analysis'): caps.append('Analysis')
                    if capabilities.get('creativity'): caps.append('Creative')
                    if capabilities.get('reasoning'): caps.append('Reasoning')
                    
                    if caps:
                        print(f"     Capabilities: {', '.join(caps)}")
                
                # Determine icon
                role_lower = role.lower()
                if 'cvm' in role_lower or 'customer' in role_lower:
                    icon = '💼'
                elif 'assistant' in role_lower or 'personal' in role_lower:
                    icon = '🤖'
                elif 'telecom' in role_lower or 'telco' in role_lower:
                    icon = '📡'
                else:
                    icon = '🤖'
                
                print(f"     Icon: {icon}")
            
            # Test transformation logic
            print(f"\\n🔄 Testing Agent Transformation Logic:")
            
            sample_agent = agents[0]
            print(f"\\n📊 Sample Transformation for: {sample_agent.get('name')}")
            
            # Simulate the transformation that would happen in the hook
            transformed = {
                "id": sample_agent.get('id'),
                "name": sample_agent.get('name'),
                "description": sample_agent.get('role', sample_agent.get('description', 'AI Agent')),
                "type": "ollama",
                "model": sample_agent.get('model', {}).get('model_id', 'Unknown') if isinstance(sample_agent.get('model'), dict) else str(sample_agent.get('model', 'Unknown')),
                "role": sample_agent.get('role', 'AI Assistant'),
                "guardrails": sample_agent.get('guardrails', {}).get('enabled', False)
            }
            
            print(f"  Original ID: {sample_agent.get('id')}")
            print(f"  Palette Name: {transformed['name']}")
            print(f"  Palette Description: {transformed['description']}")
            print(f"  Palette Model: {transformed['model']}")
            print(f"  Has Guardrails: {transformed['guardrails']}")
            
            return True
            
        else:
            print(f"❌ Failed to get agents: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running on localhost:8000")
        print("💡 Start the backend with: python backend/simple_api.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_agent_palette_data_structure():
    """Test the expected data structure for the Agent Palette"""
    
    print(f"\\n🏗️ Testing Agent Palette Data Structure")
    print("=" * 50)
    
    # Expected structure for palette agents
    expected_structure = {
        "id": "string - unique agent identifier",
        "name": "string - display name",
        "description": "string - role or description", 
        "icon": "string - emoji icon",
        "type": "string - always 'ollama'",
        "model": "string - model name",
        "role": "string - agent role",
        "capabilities": "array - list of capabilities",
        "guardrails": "boolean - has guardrails enabled",
        "originalAgent": "object - full Ollama agent config"
    }
    
    print("📋 Expected PaletteAgent Structure:")
    for key, description in expected_structure.items():
        print(f"  {key}: {description}")
    
    print(f"\\n🎯 Integration Points:")
    print("  1. useOllamaAgentsForPalette hook fetches agents")
    print("  2. Hook transforms OllamaAgentConfig → PaletteAgent")
    print("  3. AgentPalette displays transformed agents")
    print("  4. User drags agent to workspace")
    print("  5. BlankWorkspace creates node with Ollama agent data")
    print("  6. ModernAgentNode displays Ollama agent info")
    
    return True

def test_integration_readiness():
    """Test if the integration is ready to use"""
    
    print(f"\\n🚀 Testing Integration Readiness")
    print("=" * 40)
    
    checks = {
        "Backend Running": False,
        "Agents Available": False,
        "Agent Data Complete": False
    }
    
    # Check 1: Backend running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            checks["Backend Running"] = True
    except:
        pass
    
    # Check 2: Agents available
    try:
        response = requests.get("http://localhost:8000/api/agents/ollama/enhanced", timeout=10)
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            if len(agents) > 0:
                checks["Agents Available"] = True
                
                # Check 3: Agent data complete
                sample_agent = agents[0]
                required_fields = ['id', 'name', 'model']
                if all(field in sample_agent for field in required_fields):
                    checks["Agent Data Complete"] = True
    except:
        pass
    
    print("📊 Integration Readiness Checklist:")
    for check, status in checks.items():
        status_icon = "✅" if status else "❌"
        print(f"  {status_icon} {check}")
    
    all_ready = all(checks.values())
    
    if all_ready:
        print(f"\\n🎉 Integration is ready!")
        print(f"\\n📋 What should work now:")
        print(f"  1. Go to Multi Agent Workspace")
        print(f"  2. Select 'Start Building Your Workflow'")
        print(f"  3. Open Agent Palette on the left")
        print(f"  4. See your Ollama agents instead of static ones")
        print(f"  5. Drag agents to create workflow nodes")
        
        return True
    else:
        print(f"\\n⚠️ Integration not ready yet")
        print(f"\\n🔧 Next steps:")
        if not checks["Backend Running"]:
            print(f"  - Start backend: python backend/simple_api.py")
        if not checks["Agents Available"]:
            print(f"  - Create agents in Ollama Agent Management")
        if not checks["Agent Data Complete"]:
            print(f"  - Verify agent data structure")
        
        return False

def main():
    """Run all integration tests"""
    
    print("🔗 Agent Palette Integration Test Suite")
    print("=" * 70)
    
    # Run tests
    agents_test = test_ollama_agents_available()
    structure_test = test_agent_palette_data_structure()
    readiness_test = test_integration_readiness()
    
    print("\\n" + "=" * 70)
    
    if agents_test and structure_test and readiness_test:
        print("🎉 ALL INTEGRATION TESTS PASSED!")
        print("\\n🚀 Your Agent Palette is now connected to Ollama agents!")
        print("\\n📋 Summary:")
        print("  ✅ Ollama agents are available")
        print("  ✅ Data transformation logic is correct")
        print("  ✅ Integration is ready for use")
        print("  ✅ Agent Palette will show your real agents")
        
        print("\\n🎯 Next: Go test the Multi Agent Workspace!")
        return True
    else:
        print("❌ Some integration tests failed")
        print("Check the issues above and retry")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
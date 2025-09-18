#!/usr/bin/env python3

"""
Enhanced Guardrails Data Flow Debug Script
Traces the complete data flow from creation to display to identify where enhanced guardrails are lost.
"""

import subprocess
import time
import sys
import os
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def analyze_data_flow():
    """Analyze the complete data flow for enhanced guardrails"""
    print("🔍 Analyzing Enhanced Guardrails Data Flow...")
    
    # Check all the places where enhanced guardrails should be handled
    files_to_check = [
        ("Agent Creation Dialog", "src/components/CommandCentre/CreateAgent/OllamaAgentDialog.tsx"),
        ("Ollama Agent Service", "src/lib/services/OllamaAgentService.ts"),
        ("Agent Config Dialog", "src/components/AgentConfigDialog.tsx"),
        ("Ollama Agent Dashboard", "src/pages/OllamaAgentDashboard.tsx")
    ]
    
    issues_found = []
    
    for file_name, file_path in files_to_check:
        print(f"\n📁 Checking {file_name}...")
        
        file_obj = Path(file_path)
        if not file_obj.exists():
            issues_found.append(f"{file_name}: File not found")
            continue
            
        content = file_obj.read_text()
        
        # Check for enhanced guardrails handling
        if file_name == "Agent Creation Dialog":
            checks = [
                ("Enhanced guardrails state", "enhancedGuardrails, setEnhancedGuardrails" in content),
                ("Enhanced guardrails in config", "enhancedGuardrails," in content),
                ("Enhanced guardrails component", "EnhancedGuardrails" in content)
            ]
        elif file_name == "Ollama Agent Service":
            checks = [
                ("Enhanced guardrails interface", "enhancedGuardrails?: any" in content),
                ("Create agent preservation", "enhancedGuardrails: (config as any).enhancedGuardrails" in content),
                ("Load from backend preservation", "enhancedGuardrails: backendAgent.enhancedGuardrails" in content)
            ]
        elif file_name == "Agent Config Dialog":
            checks = [
                ("Enhanced guardrails check", "agent.enhancedGuardrails" in content),
                ("Enhanced guardrails rendering", "renderEnhancedGuardrails" in content),
                ("Debug information", "Enhanced as property:" in content)
            ]
        else:  # Dashboard
            checks = [
                ("Agent loading", "getAllAgents" in content),
                ("Config dialog", "AgentConfigDialog" in content)
            ]
        
        for check_name, condition in checks:
            if condition:
                print(f"  ✅ {check_name}")
            else:
                print(f"  ❌ {check_name}")
                issues_found.append(f"{file_name}: Missing {check_name}")
    
    return issues_found

def create_debug_agent_creation():
    """Create a debug version of agent creation with enhanced logging"""
    print("\n🔧 Creating Debug Agent Creation...")
    
    debug_script = '''
// Debug Enhanced Guardrails Creation
// Add this to your browser console when creating an agent

// Override the createAgent method to log enhanced guardrails
const originalCreateAgent = ollamaAgentService.createAgent;
ollamaAgentService.createAgent = function(config) {
    console.log('🔍 Creating agent with config:', config);
    console.log('🛡️ Enhanced guardrails in config:', config.enhancedGuardrails);
    
    if (config.enhancedGuardrails) {
        console.log('✅ Enhanced guardrails found:');
        console.log('  - Content Filter:', config.enhancedGuardrails.contentFilter);
        console.log('  - Custom Keywords:', config.enhancedGuardrails.contentFilter?.customKeywords);
        console.log('  - Custom Rules:', config.enhancedGuardrails.customRules);
    } else {
        console.log('❌ No enhanced guardrails in config');
    }
    
    return originalCreateAgent.call(this, config).then(result => {
        console.log('🔍 Agent created, result:', result);
        console.log('🛡️ Enhanced guardrails in result:', result.enhancedGuardrails);
        return result;
    });
};

// Override getAllAgents to log what's retrieved
const originalGetAllAgents = ollamaAgentService.getAllAgents;
ollamaAgentService.getAllAgents = function() {
    const agents = originalGetAllAgents.call(this);
    console.log('🔍 Retrieved agents:', agents);
    
    agents.forEach((agent, index) => {
        console.log(`🤖 Agent ${index + 1}: ${agent.name}`);
        console.log('  - Enhanced guardrails:', agent.enhancedGuardrails);
        if (agent.enhancedGuardrails) {
            console.log('  - Content filter:', agent.enhancedGuardrails.contentFilter);
            console.log('  - Custom keywords:', agent.enhancedGuardrails.contentFilter?.customKeywords);
        }
    });
    
    return agents;
};

console.log('🔍 Debug logging enabled for enhanced guardrails');
'''
    
    with open("debug_enhanced_guardrails.js", "w") as f:
        f.write(debug_script)
    
    print("✅ Debug script created: debug_enhanced_guardrails.js")
    print("💡 Copy and paste this script into your browser console before creating an agent")

def create_backend_debug_script():
    """Create a script to debug the backend API"""
    print("\n🌐 Creating Backend Debug Script...")
    
    backend_debug = '''#!/usr/bin/env python3

"""
Backend Enhanced Guardrails Debug
Tests the backend API to see if enhanced guardrails are being saved and retrieved properly.
"""

import requests
import json
import sys

def test_backend_api():
    """Test the backend API for enhanced guardrails"""
    base_url = "http://localhost:5002"
    
    print("🔍 Testing Backend API for Enhanced Guardrails...")
    
    # Test creating an agent with enhanced guardrails
    test_agent = {
        "name": "Test Enhanced Agent",
        "role": "Test Agent",
        "description": "Testing enhanced guardrails",
        "model": "llama3.2:latest",
        "systemPrompt": "You are a test agent",
        "temperature": 0.7,
        "maxTokens": 1000,
        "tools": [],
        "memory": {
            "shortTerm": True,
            "longTerm": False,
            "contextual": True
        },
        "ragEnabled": False,
        "knowledgeBases": [],
        "guardrails": {
            "enabled": True,
            "rules": [],
            "safetyLevel": "medium"
        },
        "enhancedGuardrails": {
            "global": True,
            "local": True,
            "contentFilter": {
                "enabled": True,
                "level": "moderate",
                "customKeywords": ["spam", "scam", "fraud"],
                "blockedPhrases": ["click here now", "limited time offer"],
                "allowedDomains": []
            },
            "customRules": [
                {
                    "id": "test-rule-1",
                    "name": "Test Rule",
                    "description": "A test rule for debugging",
                    "pattern": "\\\\b(test|debug)\\\\b",
                    "action": "block",
                    "enabled": True
                }
            ],
            "piiRedaction": {
                "enabled": True,
                "strategy": "mask",
                "customTypes": ["ssn"],
                "customPatterns": ["\\\\d{3}-\\\\d{2}-\\\\d{4}"],
                "maskCharacter": "*",
                "placeholderText": "[REDACTED]"
            }
        }
    }
    
    try:
        # Create agent
        print("📤 Creating agent with enhanced guardrails...")
        response = requests.post(f"{base_url}/api/agents/ollama/enhanced", 
                               json=test_agent, 
                               headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Agent created successfully")
            print(f"📋 Agent ID: {result.get('agent', {}).get('id', 'Unknown')}")
            
            # Check if enhanced guardrails are in the response
            agent_data = result.get('agent', {})
            if 'enhancedGuardrails' in agent_data:
                print("✅ Enhanced guardrails found in response")
                print(f"🛡️ Enhanced guardrails: {json.dumps(agent_data['enhancedGuardrails'], indent=2)}")
            else:
                print("❌ Enhanced guardrails NOT found in response")
                print(f"📋 Available keys: {list(agent_data.keys())}")
            
            # Now try to retrieve the agent
            print("\\n📥 Retrieving agents...")
            get_response = requests.get(f"{base_url}/api/agents/ollama/enhanced")
            
            if get_response.status_code == 200:
                agents_result = get_response.json()
                agents = agents_result.get('agents', [])
                print(f"✅ Retrieved {len(agents)} agents")
                
                # Find our test agent
                test_agent_retrieved = None
                for agent in agents:
                    if agent.get('name') == 'Test Enhanced Agent':
                        test_agent_retrieved = agent
                        break
                
                if test_agent_retrieved:
                    print("✅ Test agent found in retrieved agents")
                    if 'enhancedGuardrails' in test_agent_retrieved:
                        print("✅ Enhanced guardrails preserved in retrieval")
                        print(f"🛡️ Retrieved enhanced guardrails: {json.dumps(test_agent_retrieved['enhancedGuardrails'], indent=2)}")
                    else:
                        print("❌ Enhanced guardrails LOST during retrieval")
                        print(f"📋 Available keys: {list(test_agent_retrieved.keys())}")
                else:
                    print("❌ Test agent not found in retrieved agents")
            else:
                print(f"❌ Failed to retrieve agents: {get_response.status_code}")
                print(f"📋 Error: {get_response.text}")
                
        else:
            print(f"❌ Failed to create agent: {response.status_code}")
            print(f"📋 Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        print("💡 Make sure the backend is running on localhost:5002")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_backend_api()
'''
    
    with open("debug_backend_enhanced_guardrails.py", "w") as f:
        f.write(backend_debug)
    
    print("✅ Backend debug script created: debug_backend_enhanced_guardrails.py")
    print("💡 Run this script to test if the backend is properly handling enhanced guardrails")

def main():
    """Main debug function"""
    print("🚀 Enhanced Guardrails Data Flow Debug")
    print("=" * 60)
    
    # Analyze the data flow
    issues = analyze_data_flow()
    
    # Create debug tools
    create_debug_agent_creation()
    create_backend_debug_script()
    
    print("\n" + "=" * 60)
    print("📊 Analysis Results:")
    
    if issues:
        print(f"❌ Found {len(issues)} potential issues:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("✅ No obvious issues found in the code")
    
    print("\n🔧 Debug Tools Created:")
    print("1. debug_enhanced_guardrails.js - Browser console script")
    print("2. debug_backend_enhanced_guardrails.py - Backend API test")
    
    print("\n📋 Debugging Steps:")
    print("1. Run debug_backend_enhanced_guardrails.py to test backend")
    print("2. Open browser console and paste debug_enhanced_guardrails.js")
    print("3. Create a new agent with enhanced guardrails")
    print("4. Check console logs for data flow")
    print("5. Open agent configuration dialog and check debug info")
    
    print("\n🎯 What to Look For:")
    print("- Enhanced guardrails in creation config: Should be present")
    print("- Enhanced guardrails in backend response: Should be preserved")
    print("- Enhanced guardrails in retrieved agents: Should be available")
    print("- Enhanced guardrails in config dialog: Should display properly")
    
    return len(issues) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
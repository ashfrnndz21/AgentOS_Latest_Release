#!/usr/bin/env python3

"""
Guardrails Detection Fix Test
Tests and fixes the guardrails detection in the Agent Palette tooltips.
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

def test_guardrails_detection_logic():
    """Test the guardrails detection logic in useOllamaAgentsForPalette"""
    print("🛡️ Testing Guardrails Detection Logic...")
    
    palette_hook_file = Path("src/hooks/useOllamaAgentsForPalette.ts")
    
    if not palette_hook_file.exists():
        print("❌ useOllamaAgentsForPalette.ts not found!")
        return False
    
    content = palette_hook_file.read_text()
    
    # Check for guardrails detection patterns
    checks = [
        ("Guardrails enabled check", "agent.guardrails?.enabled" in content),
        ("Guardrails boolean assignment", "guardrails: hasGuardrails" in content),
        ("Original agent reference", "originalAgent: agent" in content),
        ("Guardrails variable declaration", "hasGuardrails" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Guardrails Detection Logic: {passed}/{len(checks)} checks passed")
    
    # Check if we need to enhance the detection logic
    if "agent.guardrails?.enabled" in content:
        print("🔍 Current detection logic: agent.guardrails?.enabled")
        print("💡 This should work if the backend returns the correct structure")
    
    return passed >= len(checks) * 0.75

def test_agent_palette_guardrails_display():
    """Test the guardrails display in the Agent Palette tooltips"""
    print("\n🎯 Testing Agent Palette Guardrails Display...")
    
    palette_file = Path("src/components/MultiAgentWorkspace/AgentPalette.tsx")
    
    if not palette_file.exists():
        print("❌ AgentPalette.tsx not found!")
        return False
    
    content = palette_file.read_text()
    
    # Check for guardrails display in tooltips
    checks = [
        ("Guardrails conditional check", "agent.guardrails ?" in content),
        ("Protected badge", "Protected" in content and "Shield" in content),
        ("Basic badge", "Basic" in content and "AlertCircle" in content),
        ("Security status section", "Security & Guardrails" in content),
        ("Content filter check", "agent.originalAgent?.guardrails?.content_filter" in content),
        ("Safety level display", "agent.originalAgent?.guardrails?.safety_level" in content or "agent.originalAgent?.guardrails?.safetyLevel" in content),
        ("Guardrails enabled display", "guardrails?.enabled" in content)
    ]
    
    passed = 0
    for check_name, condition in checks:
        if condition:
            print(f"✅ {check_name}")
            passed += 1
        else:
            print(f"❌ {check_name}")
    
    print(f"📊 Guardrails Display: {passed}/{len(checks)} checks passed")
    
    return passed >= len(checks) * 0.8

def enhance_guardrails_detection():
    """Enhance the guardrails detection logic to handle different data structures"""
    print("\n🔧 Enhancing Guardrails Detection Logic...")
    
    palette_hook_file = Path("src/hooks/useOllamaAgentsForPalette.ts")
    content = palette_hook_file.read_text()
    
    # Check if we need to enhance the detection
    if "hasGuardrails = agent.guardrails?.enabled || false;" in content:
        print("🔍 Found current detection logic")
        
        # Enhanced detection logic that handles multiple possible structures
        enhanced_logic = """    // Check if guardrails are enabled - handle multiple possible structures
    const hasGuardrails = Boolean(
      agent.guardrails?.enabled || 
      agent.guardrails?.safety_level || 
      agent.guardrails?.safetyLevel ||
      (agent.guardrails && Object.keys(agent.guardrails).length > 0)
    );"""
        
        # Replace the current logic
        old_logic = "    // Check if guardrails are enabled\n    const hasGuardrails = agent.guardrails?.enabled || false;"
        
        if old_logic in content:
            new_content = content.replace(old_logic, enhanced_logic)
            
            # Write the enhanced version
            palette_hook_file.write_text(new_content)
            print("✅ Enhanced guardrails detection logic applied")
            return True
        else:
            print("⚠️ Could not find exact match for current logic")
            print("🔍 Current content around guardrails:")
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'hasGuardrails' in line:
                    start = max(0, i-2)
                    end = min(len(lines), i+3)
                    for j in range(start, end):
                        prefix = ">>> " if j == i else "    "
                        print(f"{prefix}{lines[j]}")
                    break
            return False
    else:
        print("❌ Could not find current guardrails detection logic")
        return False

def create_guardrails_debug_script():
    """Create a debug script to test guardrails detection"""
    print("\n🐛 Creating Guardrails Debug Script...")
    
    debug_script = '''#!/usr/bin/env python3

"""
Debug script to test guardrails detection in agent data
"""

import json
import requests
import sys

def test_agent_data_structure():
    """Test the actual agent data structure from the backend"""
    try:
        # Try to fetch agent data from the backend
        response = requests.get('http://localhost:8000/api/ollama/agents', timeout=5)
        
        if response.status_code == 200:
            agents = response.json()
            print(f"📊 Found {len(agents)} agents")
            
            for i, agent in enumerate(agents[:3]):  # Check first 3 agents
                print(f"\\n🤖 Agent {i+1}: {agent.get('name', 'Unknown')}")
                print(f"   ID: {agent.get('id', 'N/A')}")
                
                # Check guardrails structure
                guardrails = agent.get('guardrails')
                if guardrails:
                    print(f"   Guardrails: {json.dumps(guardrails, indent=4)}")
                    
                    # Test different detection methods
                    enabled_check = guardrails.get('enabled', False)
                    safety_level_check = bool(guardrails.get('safety_level') or guardrails.get('safetyLevel'))
                    has_keys_check = len(guardrails.keys()) > 0
                    
                    print(f"   Detection Results:")
                    print(f"     enabled: {enabled_check}")
                    print(f"     has safety_level: {safety_level_check}")
                    print(f"     has keys: {has_keys_check}")
                    print(f"     final result: {enabled_check or safety_level_check or has_keys_check}")
                else:
                    print(f"   Guardrails: None or empty")
                
                print("-" * 50)
        else:
            print(f"❌ Failed to fetch agents: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        print("💡 Make sure the backend is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔍 Debugging Agent Guardrails Detection")
    print("=" * 50)
    test_agent_data_structure()
'''
    
    with open("debug_guardrails_detection.py", "w") as f:
        f.write(debug_script)
    
    print("✅ Debug script created: debug_guardrails_detection.py")
    print("💡 Run this script while your backend is running to see actual agent data structure")
    return True

def main():
    """Main test function"""
    print("🚀 Guardrails Detection Fix Test")
    print("=" * 50)
    
    all_passed = True
    
    # Run tests
    tests = [
        ("Guardrails Detection Logic", test_guardrails_detection_logic),
        ("Agent Palette Guardrails Display", test_agent_palette_guardrails_display),
        ("Enhance Guardrails Detection", enhance_guardrails_detection),
        ("Create Debug Script", create_guardrails_debug_script)
    ]
    
    for test_name, test_func in tests:
        print(f"\\n🧪 Running {test_name}...")
        try:
            result = test_func()
            if result:
                print(f"✅ {test_name} passed!")
            else:
                print(f"❌ {test_name} failed!")
                all_passed = False
        except Exception as e:
            print(f"❌ {test_name} error: {e}")
            all_passed = False
    
    print("\\n" + "=" * 50)
    if all_passed:
        print("🎉 Guardrails detection enhanced!")
        print("\\n📋 Next Steps:")
        print("1. The guardrails detection logic has been enhanced")
        print("2. Run debug_guardrails_detection.py to see actual data structure")
        print("3. Test the Agent Palette tooltips")
        print("4. Verify guardrails status shows correctly")
        print("\\n🎯 Expected Result:")
        print("Agents with guardrails enabled should now show 'Protected' status")
        print("in the Agent Palette tooltips!")
    else:
        print("❌ Some tests failed. Check the implementation.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
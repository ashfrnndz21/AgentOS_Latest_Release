#!/usr/bin/env python3
"""
Enable Real Ollama Integration
Switches from mock to real Ollama integration
"""

import os
import sys

def enable_real_ollama():
    """Enable real Ollama integration in the Strands SDK API"""
    
    print("🚀 Enabling Real Ollama Integration...")
    
    # Read the current strands_sdk_api.py
    api_file = 'backend/strands_sdk_api.py'
    
    with open(api_file, 'r') as f:
        content = f.read()
    
    # Check if already using real integration
    if 'from backend.real_ollama_integration import' in content:
        print("✅ Real Ollama integration already enabled!")
        return
    
    # Add import for real integration
    import_line = """
# Real Ollama Integration
from backend.real_ollama_integration import RealOllamaModel, RealAgent, REAL_TOOLS
REAL_OLLAMA_AVAILABLE = True
"""
    
    # Find the right place to insert (after the mock fallback)
    insertion_point = content.find("Agent = MockAgent")
    if insertion_point != -1:
        # Insert before the Agent = MockAgent line
        content = content[:insertion_point] + import_line + "\n    # Use real integration if available\n    if REAL_OLLAMA_AVAILABLE:\n        Agent = RealAgent\n        OllamaModel = RealOllamaModel\n        print('[Strands SDK] ✅ Real Ollama integration enabled!')\n    else:\n        " + content[insertion_point:]
        
        # Write the updated content
        with open(api_file, 'w') as f:
            f.write(content)
        
        print("✅ Real Ollama integration enabled!")
        print("🔄 Restart the Strands SDK API service to apply changes:")
        print("   ./kill-all-services.sh")
        print("   ./start-all-services.sh")
        
    else:
        print("❌ Could not find insertion point in the file")

def test_ollama_connection():
    """Test if Ollama is accessible"""
    import requests
    
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"✅ Ollama is running with {len(models)} models available")
            for model in models[:3]:  # Show first 3 models
                print(f"   • {model.get('name', 'Unknown')}")
            return True
        else:
            print(f"❌ Ollama returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to Ollama: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Ollama connection...")
    
    if test_ollama_connection():
        enable_real_ollama()
        print("\n🎉 Real Ollama integration is ready!")
        print("Your agents will now use actual AI instead of mock responses.")
    else:
        print("\n⚠️  Ollama is not running or not accessible.")
        print("Please start Ollama first, then run this script again.")
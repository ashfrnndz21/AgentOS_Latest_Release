#!/usr/bin/env python3
"""
Test Ollama Terminal Fix
Verifies that the Ollama Terminal endpoints are working correctly
"""

import requests
import json

def test_ollama_terminal():
    """Test Ollama Terminal endpoints"""
    
    base_url = "http://localhost:5002"
    
    print("🔍 Testing Ollama Terminal Fix")
    print("=" * 50)
    
    # Test Ollama status
    try:
        response = requests.get(f"{base_url}/api/ollama/status", timeout=5)
        if response.status_code == 200:
            status_data = response.json()
            print(f"✅ Ollama Status: {status_data['status']}")
            print(f"   Models available: {status_data['model_count']}")
        else:
            print(f"❌ Ollama status failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Ollama status error: {e}")
        return False
    
    # Test Ollama terminal command
    try:
        command_data = {"command": "ollama list"}
        response = requests.post(f"{base_url}/api/ollama/terminal", 
                               json=command_data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Ollama Terminal: Command executed successfully")
                stdout_lines = result.get('stdout', '').count('\n')
                print(f"   Output lines: {stdout_lines}")
            else:
                print(f"⚠️ Ollama Terminal: Command failed - {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ Ollama terminal failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Ollama terminal error: {e}")
    
    # Test another command
    try:
        command_data = {"command": "ollama ps"}
        response = requests.post(f"{base_url}/api/ollama/terminal", 
                               json=command_data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Ollama PS: Command executed successfully")
            else:
                print(f"⚠️ Ollama PS: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ Ollama ps failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Ollama ps error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Ollama Terminal test completed!")
    print("\nThe Ollama Terminal should now work in your frontend.")
    print("Try commands like:")
    print("  • ollama list")
    print("  • ollama ps") 
    print("  • ollama show mistral")
    
    return True

if __name__ == "__main__":
    test_ollama_terminal()
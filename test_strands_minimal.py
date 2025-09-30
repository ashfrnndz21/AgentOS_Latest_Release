#!/usr/bin/env python3
"""
Minimal test of Strands SDK with Ollama
"""

import sys
import os

# Add the backend directory to the path
sys.path.append('backend')

try:
    from strands import Agent, models
    print("✅ Strands SDK imported successfully")
except ImportError as e:
    print(f"❌ Failed to import Strands SDK: {e}")
    sys.exit(1)

def test_minimal_agent():
    """Test minimal agent creation and execution"""
    print("\n🔍 Testing Minimal Agent...")
    
    try:
        # Create model
        model = models.Model(
            provider='ollama',
            model='qwen3:1.7b',
            base_url='http://localhost:11434'
        )
        print(f"✅ Model created: {model}")
        
        # Create agent
        agent = Agent(
            model=model,
            system_prompt="You are a helpful assistant. Write short, creative responses."
        )
        print(f"✅ Agent created: {agent}")
        
        # Test execution
        print("\n🧪 Testing agent execution...")
        response = agent("Write a short poem about Python programming")
        print(f"✅ Response type: {type(response)}")
        print(f"✅ Response: {response}")
        
        # Check response attributes
        if hasattr(response, '__dict__'):
            print(f"✅ Response attributes: {response.__dict__}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in minimal test: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("🔍 Minimal Strands SDK Test")
    print("=" * 50)
    
    if test_minimal_agent():
        print("\n✅ Minimal test passed")
    else:
        print("\n❌ Minimal test failed")

if __name__ == "__main__":
    main()




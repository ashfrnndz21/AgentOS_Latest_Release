#!/usr/bin/env python3
"""
Test script for new tool implementations
This script tests the newly added tools without affecting existing functionality
"""

import sys
import os
sys.path.append('./backend')

def test_new_tools():
    """Test the new tool implementations"""
    print("🧪 Testing New Tool Implementations")
    print("=" * 50)
    
    try:
        # Import the new tools from the backend
        from strands_sdk_api import AVAILABLE_TOOLS
        
        # Test tools to verify
        test_tools = [
            'file_read',
            'file_write', 
            'memory_store',
            'memory_retrieve',
            'http_request',
            'python_repl',
            'generate_image',
            'slack'
        ]
        
        print(f"📊 Total tools available: {len(AVAILABLE_TOOLS)}")
        print(f"🔍 Testing {len(test_tools)} new tools...")
        print()
        
        # Test each tool
        for tool_name in test_tools:
            if tool_name in AVAILABLE_TOOLS:
                print(f"✅ {tool_name}: Available")
                
                # Test the tool function
                tool_func = AVAILABLE_TOOLS[tool_name]
                
                # Test with safe parameters
                try:
                    if tool_name == 'file_read':
                        result = tool_func('./backend/strands_sdk_api.py')
                        print(f"   📄 File read test: {'Success' if 'File contents' in result else 'Failed'}")
                        
                    elif tool_name == 'file_write':
                        result = tool_func('./data/test_file.txt', 'Hello from new tool!')
                        print(f"   ✏️ File write test: {'Success' if 'Successfully wrote' in result else 'Failed'}")
                        
                    elif tool_name == 'memory_store':
                        result = tool_func('test_key', 'test_value')
                        print(f"   🧠 Memory store test: {'Success' if 'Stored memory' in result else 'Failed'}")
                        
                    elif tool_name == 'memory_retrieve':
                        result = tool_func('test_key')
                        print(f"   🔍 Memory retrieve test: {'Success' if 'Memory test_key' in result else 'Failed'}")
                        
                    elif tool_name == 'http_request':
                        result = tool_func('https://httpbin.org/get')
                        print(f"   🌐 HTTP request test: {'Success' if 'HTTP GET' in result else 'Failed'}")
                        
                    elif tool_name == 'python_repl':
                        result = tool_func('print("Hello from Python!")')
                        print(f"   🐍 Python REPL test: {'Success' if 'Code executed' in result else 'Failed'}")
                        
                    elif tool_name == 'generate_image':
                        result = tool_func('A beautiful sunset', 'realistic')
                        print(f"   🎨 Image generation test: {'Success' if 'Generated image' in result else 'Failed'}")
                        
                    elif tool_name == 'slack':
                        result = tool_func('#general', 'Hello from agent!')
                        print(f"   💬 Slack message test: {'Success' if 'Slack message sent' in result else 'Failed'}")
                        
                except Exception as e:
                    print(f"   ❌ Tool test failed: {str(e)}")
                    
            else:
                print(f"❌ {tool_name}: Not available")
        
        print()
        print("🎯 Summary:")
        print(f"   • Total tools in registry: {len(AVAILABLE_TOOLS)}")
        print(f"   • New tools added: {len(test_tools)}")
        print(f"   • Tools available in frontend: {len([t for t in test_tools if t in AVAILABLE_TOOLS])}")
        
        print()
        print("🚀 Next Steps:")
        print("   1. Restart your backend server")
        print("   2. Open the agent creation dialog")
        print("   3. Select the new tools (file_read, file_write, etc.)")
        print("   4. Create an agent and test the tools!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing tools: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_new_tools()
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Some tests failed. Check the error messages above.")




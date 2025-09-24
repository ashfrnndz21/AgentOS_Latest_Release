#!/usr/bin/env python3
"""
Tool Availability Checker
This script checks which tools are actually implemented vs just listed in the frontend
"""

import sys
import os
sys.path.append('./backend')

def check_tool_availability():
    """Check which tools are actually available vs just listed"""
    print("🔍 Tool Availability Checker")
    print("=" * 60)
    
    try:
        # Import the backend tools
        from strands_sdk_api import AVAILABLE_TOOLS
        
        # Frontend tool list (from StrandsSdkAgentDialog.tsx)
        frontend_tools = [
            # Core AI Tools
            'think', 'memory', 'use_llm',
            
            # Utility Tools
            'calculator', 'current_time', 'environment', 'sleep', 'stop',
            
            # File Operations
            'file_read', 'file_write', 'file_operations', 'editor',
            
            # Web & Data
            'web_search', 'tavily', 'http_request', 'rss', 'exa', 'bright_data',
            
            # Code & Development
            'python_repl', 'code_execution', 'code_interpreter', 'shell',
            
            # Browser & Automation
            'browser', 'use_computer',
            
            # Media & Communication
            'generate_image', 'generate_image_stability', 'image_reader', 'speak', 'slack',
            
            # Workflow & Automation
            'workflow', 'agent_graph', 'use_agent', 'handoff_to_user', 'cron', 'journal', 'retrieve', 'load_tool', 'batch', 'graph', 'swarm',
            
            # Cloud & Infrastructure
            'use_aws', 'mcp_client',
            
            # Memory Systems
            'agent_core_memory', 'mem0_memory',
            
            # Video & Advanced Media
            'nova_reels',
            
            # Visualization
            'diagram',
            
            # Multi-Agent Collaboration
            'a2a_discover_agent', 'a2a_list_discovered_agents', 'a2a_send_message', 'coordinate_agents', 'agent_handoff',
            
            # Database
            'database_query',
            
            # Weather
            'weather_api'
        ]
        
        print(f"📊 Analysis Results:")
        print(f"   • Frontend lists: {len(frontend_tools)} tools")
        print(f"   • Backend implements: {len(AVAILABLE_TOOLS)} tools")
        print()
        
        # Categorize tools
        available_tools = []
        missing_tools = []
        
        for tool in frontend_tools:
            if tool in AVAILABLE_TOOLS:
                available_tools.append(tool)
            else:
                missing_tools.append(tool)
        
        print("✅ AVAILABLE TOOLS (Working):")
        print("-" * 40)
        for tool in sorted(available_tools):
            print(f"   ✓ {tool}")
        
        print()
        print("❌ MISSING TOOLS (Not Implemented):")
        print("-" * 40)
        for tool in sorted(missing_tools):
            print(f"   ✗ {tool}")
        
        print()
        print("🎯 RECOMMENDATION:")
        print("-" * 40)
        print(f"   • Use {len(available_tools)} available tools for now")
        print(f"   • {len(missing_tools)} tools need backend implementation")
        print(f"   • Focus on tools you actually need")
        
        print()
        print("🚀 QUICK START - Available Tools:")
        print("-" * 40)
        priority_tools = ['think', 'calculator', 'current_time', 'web_search', 'file_read', 'file_write', 'memory_store', 'http_request', 'python_repl']
        for tool in priority_tools:
            if tool in available_tools:
                print(f"   ✓ {tool} - Ready to use!")
            else:
                print(f"   ✗ {tool} - Not available")
        
        return {
            'available': available_tools,
            'missing': missing_tools,
            'total_frontend': len(frontend_tools),
            'total_backend': len(AVAILABLE_TOOLS)
        }
        
    except Exception as e:
        print(f"❌ Error checking tools: {str(e)}")
        return None

if __name__ == "__main__":
    result = check_tool_availability()
    if result:
        print(f"\n✅ Check completed: {result['total_backend']}/{result['total_frontend']} tools available")
    else:
        print("\n❌ Check failed")


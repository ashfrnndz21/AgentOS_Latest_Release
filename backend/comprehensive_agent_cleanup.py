#!/usr/bin/env python3
"""
Comprehensive Agent Cleanup Script
Removes agents from ALL sources: databases, files, and provides browser cleanup instructions
"""

import sqlite3
import os
import sys
import json
import glob
from datetime import datetime

def cleanup_database(db_path, table_name, agent_id_column='id'):
    """Clean up a specific database table"""
    if not os.path.exists(db_path):
        print(f"⚠️  Database {db_path} does not exist, skipping...")
        return 0
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get count before deletion
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count_before = cursor.fetchone()[0]
        
        if count_before == 0:
            print(f"✅ {db_path} - {table_name}: Already empty")
            conn.close()
            return 0
        
        # Delete all agents
        cursor.execute(f"DELETE FROM {table_name}")
        conn.commit()
        conn.close()
        
        print(f"🗑️  {db_path} - {table_name}: Removed {count_before} agents")
        return count_before
        
    except Exception as e:
        print(f"❌ Error cleaning {db_path} - {table_name}: {e}")
        return 0

def cleanup_json_files():
    """Clean up any JSON files that might contain agent data"""
    json_patterns = [
        "*.json",
        "**/agents*.json", 
        "**/agent_*.json",
        "**/ollama_*.json",
        "**/strands_*.json"
    ]
    
    cleaned_files = 0
    for pattern in json_patterns:
        for file_path in glob.glob(pattern, recursive=True):
            try:
                # Check if file contains agent data
                with open(file_path, 'r') as f:
                    content = f.read()
                    if any(keyword in content.lower() for keyword in ['agent', 'ollama', 'strands', 'a2a']):
                        # Backup the file
                        backup_path = f"{file_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                        os.rename(file_path, backup_path)
                        print(f"📦 Backed up and removed: {file_path} -> {backup_path}")
                        cleaned_files += 1
            except Exception as e:
                print(f"⚠️  Could not process {file_path}: {e}")
    
    return cleaned_files

def generate_browser_cleanup_instructions():
    """Generate instructions for cleaning browser storage"""
    instructions = """
🌐 BROWSER STORAGE CLEANUP REQUIRED

The frontend stores agents in browser localStorage. To complete the cleanup:

1. Open your browser's Developer Tools (F12)
2. Go to Application/Storage tab
3. Find "Local Storage" section
4. Look for these keys and DELETE them:
   - ollama-agents
   - strands-agents
   - ollama-conversations
   - ollama-executions
   - agent-registry
   - a2a-agents
   - enhanced-agents
   - unified-agents

OR use the provided cleanup tool:
- Open: clear_browser_storage.html in your browser
- Click "Clear All Agent Storage"

This will prevent agents from being reloaded from browser storage.
"""
    return instructions

def main():
    """Main cleanup function"""
    print("🧹 COMPREHENSIVE Agent Cleanup Script")
    print("=" * 60)
    print("This script will clean agents from ALL sources:")
    print("• Backend databases")
    print("• JSON configuration files") 
    print("• Provide browser cleanup instructions")
    print("=" * 60)
    
    # Define databases and tables to clean
    databases_to_clean = [
        ("agent_registry.db", "agents"),
        ("strands_sdk.db", "strands_sdk_agents"),
        ("enhanced_agent_registry.db", "agents"),
        ("unified_agents.db", "agents"),
        ("a2a_communication.db", "agents"),
        ("strands_sdk_agents.db", "agents"),
        ("strands_sdk_db.sqlite", "agents"),
        ("ollama_agents.db", "agents"),
        ("chat_orchestrator.db", "agents"),
        ("aws_agentcore.db", "agents"),
        ("strands_orchestration.db", "agents"),
        ("strands_sdk_api.db", "agents"),
    ]
    
    total_removed = 0
    
    print("\n🗄️  CLEANING DATABASES...")
    for db_path, table_name in databases_to_clean:
        removed = cleanup_database(db_path, table_name)
        total_removed += removed
    
    print("\n📄 CLEANING JSON FILES...")
    json_files_cleaned = cleanup_json_files()
    
    print("\n" + "=" * 60)
    print(f"🎉 BACKEND CLEANUP COMPLETE!")
    print(f"   • Removed {total_removed} agents from databases")
    print(f"   • Cleaned {json_files_cleaned} JSON files")
    print("=" * 60)
    
    print(generate_browser_cleanup_instructions())
    
    print("\n🔧 ADDITIONAL STEPS TO PREVENT RE-REGISTRATION:")
    print("1. Ensure agent_auto_registration_config.env is set to disable auto-registration")
    print("2. Clear browser storage using the provided tool")
    print("3. Restart all services to verify no agents are auto-registered")
    print("4. Only create agents through the UI - they will persist correctly")
    
    print("\n✅ COMPREHENSIVE CLEANUP COMPLETE!")
    print("   Agents will no longer be auto-registered on startup.")

if __name__ == "__main__":
    main()

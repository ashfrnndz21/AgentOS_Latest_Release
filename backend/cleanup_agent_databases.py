#!/usr/bin/env python3
"""
Agent Database Cleanup Script
Removes all auto-registered agents from all databases to start fresh
"""

import sqlite3
import os
import sys
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

def main():
    """Main cleanup function"""
    print("🧹 Agent Database Cleanup Script")
    print("=" * 50)
    
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
    ]
    
    total_removed = 0
    
    for db_path, table_name in databases_to_clean:
        removed = cleanup_database(db_path, table_name)
        total_removed += removed
    
    print("=" * 50)
    print(f"🎉 Cleanup complete! Removed {total_removed} agents total")
    print("📝 All databases are now clean and ready for fresh agent registration")
    print("💡 Agents will only be registered when explicitly created by users")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Database Optimization and Health Check Script
Checks for corruption, optimizes, and reports on all backend databases
"""

import sqlite3
import os
import sys
from datetime import datetime

def check_database_integrity(db_path, db_name):
    """Check database integrity and optimize if needed"""
    print(f"\n🔍 Checking {db_name} ({db_path})...")
    
    if not os.path.exists(db_path):
        print(f"   ⚠️  Database file not found: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check integrity
        cursor.execute("PRAGMA integrity_check")
        integrity_result = cursor.fetchone()[0]
        
        if integrity_result == "ok":
            print(f"   ✅ Integrity: OK")
        else:
            print(f"   ❌ Integrity: {integrity_result}")
            return False
        
        # Get database size
        size = os.path.getsize(db_path)
        print(f"   📊 Size: {size:,} bytes ({size/1024:.1f} KB)")
        
        # Get table count and row counts
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        total_rows = 0
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = cursor.fetchone()[0]
            total_rows += row_count
            print(f"   📋 Table '{table_name}': {row_count:,} rows")
        
        print(f"   📈 Total rows: {total_rows:,}")
        
        # Optimize database
        print(f"   🔧 Optimizing...")
        cursor.execute("VACUUM")
        cursor.execute("ANALYZE")
        
        # Check for unused space
        cursor.execute("PRAGMA page_count")
        page_count = cursor.fetchone()[0]
        cursor.execute("PRAGMA freelist_count")
        free_pages = cursor.fetchone()[0]
        
        if free_pages > 0:
            print(f"   🧹 Freed {free_pages} pages ({free_pages/page_count*100:.1f}% of database)")
        else:
            print(f"   ✅ No unused space found")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("🚀 Backend Database Optimization")
    print("=" * 40)
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Database files to check
    databases = [
        ("ollama_agents.db", "Ollama Agents"),
        ("strands_agents.db", "Strands Agents"),
        ("strands_sdk_agents.db", "Strands SDK Agents"),
        ("rag_documents.db", "RAG Documents"),
        ("chat_orchestrator.db", "Chat Orchestrator"),
        ("aws_agentcore.db", "AWS AgentCore")
    ]
    
    healthy_dbs = 0
    total_dbs = len(databases)
    
    for db_file, db_name in databases:
        db_path = os.path.join(os.path.dirname(__file__), db_file)
        if check_database_integrity(db_path, db_name):
            healthy_dbs += 1
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Healthy databases: {healthy_dbs}/{total_dbs}")
    
    if healthy_dbs == total_dbs:
        print(f"   🎉 All databases are healthy and optimized!")
        return 0
    else:
        print(f"   ⚠️  {total_dbs - healthy_dbs} database(s) need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())
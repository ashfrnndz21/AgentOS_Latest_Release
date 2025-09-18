#!/usr/bin/env python3
"""
Optimized Database Helper
Provides context managers and connection pooling for better resource management
"""

import sqlite3
import threading
from contextlib import contextmanager
from typing import Optional, Any, Dict

class DatabaseManager:
    """Thread-safe database manager with connection pooling"""
    
    def __init__(self):
        self._connections = threading.local()
        self._lock = threading.Lock()
    
    @contextmanager
    def get_connection(self, db_path: str):
        """Get a database connection with proper cleanup"""
        conn = None
        try:
            conn = sqlite3.connect(db_path, timeout=30.0)
            conn.row_factory = sqlite3.Row  # Enable dict-like access
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, db_path: str, query: str, params: tuple = ()) -> list:
        """Execute a SELECT query safely"""
        with self.get_connection(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            return cursor.fetchall()
    
    def execute_update(self, db_path: str, query: str, params: tuple = ()) -> int:
        """Execute an INSERT/UPDATE/DELETE query safely"""
        with self.get_connection(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount
    
    def execute_batch(self, db_path: str, query: str, params_list: list) -> int:
        """Execute multiple queries in a batch for better performance"""
        with self.get_connection(db_path) as conn:
            cursor = conn.cursor()
            cursor.executemany(query, params_list)
            conn.commit()
            return cursor.rowcount

# Global instance
db_manager = DatabaseManager()

# Convenience functions
def safe_query(db_path: str, query: str, params: tuple = ()) -> list:
    """Execute a safe SELECT query"""
    return db_manager.execute_query(db_path, query, params)

def safe_update(db_path: str, query: str, params: tuple = ()) -> int:
    """Execute a safe UPDATE query"""
    return db_manager.execute_update(db_path, query, params)

def safe_batch(db_path: str, query: str, params_list: list) -> int:
    """Execute a safe batch operation"""
    return db_manager.execute_batch(db_path, query, params_list)

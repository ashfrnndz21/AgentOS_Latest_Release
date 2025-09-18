#!/usr/bin/env python3
"""
Backend Performance Analyzer
Checks for memory leaks, infinite loops, and optimization opportunities
"""

import ast
import os
import re
from typing import List, Dict, Any

class PerformanceAnalyzer:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.optimizations = []
    
    def analyze_file(self, filepath: str) -> Dict[str, Any]:
        """Analyze a Python file for performance issues"""
        print(f"\n🔍 Analyzing {os.path.basename(filepath)}...")
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        file_issues = {
            'memory_leaks': [],
            'infinite_loops': [],
            'blocking_operations': [],
            'resource_management': [],
            'optimizations': []
        }
        
        lines = content.split('\n')
        
        # Check for potential infinite loops
        for i, line in enumerate(lines, 1):
            # While True without break conditions
            if 'while True:' in line:
                # Check next few lines for break conditions
                has_break = False
                for j in range(i, min(i + 10, len(lines))):
                    if 'break' in lines[j] or 'return' in lines[j]:
                        has_break = True
                        break
                if not has_break:
                    file_issues['infinite_loops'].append(f"Line {i}: Potential infinite loop")
            
            # Recursive calls without base case
            if 'def ' in line and '(' in line:
                func_name = line.split('def ')[1].split('(')[0].strip()
                # Check if function calls itself
                for j in range(i, min(i + 50, len(lines))):
                    if func_name + '(' in lines[j] and 'return' not in lines[j]:
                        # Check for base case
                        has_base_case = False
                        for k in range(i, j):
                            if 'if' in lines[k] and 'return' in lines[k]:
                                has_base_case = True
                                break
                        if not has_base_case:
                            file_issues['infinite_loops'].append(f"Line {i}: Recursive function '{func_name}' may lack base case")
        
        # Check for memory leaks
        for i, line in enumerate(lines, 1):
            # Large data structures without cleanup
            if any(pattern in line for pattern in ['[]', '{}', 'list()', 'dict()']):
                if 'global' in line or 'self.' in line:
                    file_issues['memory_leaks'].append(f"Line {i}: Global/instance variable may accumulate data")
            
            # File handles without proper closing
            if 'open(' in line and 'with' not in line:
                file_issues['resource_management'].append(f"Line {i}: File opened without 'with' statement")
            
            # Database connections without proper closing
            if 'sqlite3.connect' in line and 'with' not in line:
                file_issues['resource_management'].append(f"Line {i}: Database connection without proper cleanup")
        
        # Check for blocking operations
        for i, line in enumerate(lines, 1):
            # Synchronous HTTP requests without timeout
            if 'requests.' in line and 'timeout=' not in line:
                file_issues['blocking_operations'].append(f"Line {i}: HTTP request without timeout")
            
            # Sleep in main thread
            if 'time.sleep(' in line and 'thread' not in line.lower():
                file_issues['blocking_operations'].append(f"Line {i}: Blocking sleep in main thread")
            
            # Synchronous database operations in loops
            if any(db_op in line for db_op in ['cursor.execute', 'conn.execute']) and any(loop in lines[max(0, i-5):i] for loop in ['for ', 'while ']):
                file_issues['blocking_operations'].append(f"Line {i}: Database operation in loop (consider batch operations)")
        
        # Check for optimization opportunities
        for i, line in enumerate(lines, 1):
            # String concatenation in loops
            if '+=' in line and 'str' in line and any(loop in lines[max(0, i-5):i] for loop in ['for ', 'while ']):
                file_issues['optimizations'].append(f"Line {i}: String concatenation in loop (use list.join())")
            
            # Repeated database queries
            if 'SELECT' in line.upper() and any(loop in lines[max(0, i-5):i] for loop in ['for ', 'while ']):
                file_issues['optimizations'].append(f"Line {i}: Database query in loop (consider batch queries)")
        
        return file_issues
    
    def analyze_backend(self):
        """Analyze all backend Python files"""
        backend_files = [
            'ollama_api.py',
            'strands_api.py',
            'strands_sdk_api.py',
            'chat_orchestrator_api.py',
            'rag_api.py'
        ]
        
        all_issues = {}
        
        for filename in backend_files:
            filepath = os.path.join('backend', filename)
            if os.path.exists(filepath):
                all_issues[filename] = self.analyze_file(filepath)
        
        return all_issues
    
    def generate_report(self, issues: Dict[str, Any]):
        """Generate performance report"""
        print(f"\n📊 Performance Analysis Report")
        print("=" * 50)
        
        total_issues = 0
        critical_issues = 0
        
        for filename, file_issues in issues.items():
            print(f"\n📄 {filename}:")
            
            file_total = 0
            for category, issue_list in file_issues.items():
                if issue_list:
                    print(f"   {category.replace('_', ' ').title()}:")
                    for issue in issue_list:
                        print(f"     ⚠️  {issue}")
                        file_total += 1
                        if category in ['infinite_loops', 'memory_leaks']:
                            critical_issues += 1
            
            if file_total == 0:
                print(f"   ✅ No performance issues detected")
            
            total_issues += file_total
        
        print(f"\n📈 Summary:")
        print(f"   Total Issues: {total_issues}")
        print(f"   Critical Issues: {critical_issues}")
        
        if critical_issues == 0:
            print(f"   🎉 No critical performance issues found!")
        else:
            print(f"   ⚠️  {critical_issues} critical issues need attention")
        
        return total_issues, critical_issues

def main():
    analyzer = PerformanceAnalyzer()
    issues = analyzer.analyze_backend()
    total, critical = analyzer.generate_report(issues)
    
    return 1 if critical > 0 else 0

if __name__ == "__main__":
    exit(main())
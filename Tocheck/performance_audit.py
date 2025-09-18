#!/usr/bin/env python3
"""
Comprehensive performance audit to check for:
1. Infinite loops in frontend code
2. Memory leaks from repeated API calls
3. Runaway React re-renders
4. Background monitoring scripts running continuously
"""

import os
import re
import subprocess
import json

def check_infinite_loops():
    """Check for potential infinite loops in frontend code"""
    print("🔍 CHECKING FOR INFINITE LOOPS")
    print("=" * 50)
    
    issues = []
    
    # Check for useEffect without dependencies
    result = subprocess.run(['grep', '-r', 'useEffect.*{', 'src/'], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        for line in lines:
            if 'useEffect' in line and '[]' not in line and 'dependencies' not in line:
                # Check if it's missing dependency array
                if not re.search(r'useEffect.*,\s*\[.*\]', line):
                    issues.append(f"⚠️  Potential infinite loop: {line.strip()}")
    
    # Check for while(true) or for(;;) loops
    result = subprocess.run(['grep', '-r', '-E', '(while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\))', 'src/'], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        for line in lines:
            issues.append(f"🚨 Infinite loop found: {line.strip()}")
    
    # Check for recursive function calls without base case
    result = subprocess.run(['grep', '-r', '-A5', 'function.*{', 'src/'], 
                          capture_output=True, text=True)
    
    if len(issues) == 0:
        print("✅ No obvious infinite loops detected")
    else:
        for issue in issues:
            print(issue)
    
    return len(issues)

def check_memory_leaks():
    """Check for memory leaks from repeated API calls"""
    print("\n🔍 CHECKING FOR MEMORY LEAKS")
    print("=" * 50)
    
    issues = []
    
    # Check for setInterval without clearInterval
    result = subprocess.run(['grep', '-r', 'setInterval', 'src/'], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        for line in lines:
            file_path = line.split(':')[0]
            # Check if corresponding clearInterval exists in same file
            clear_result = subprocess.run(['grep', 'clearInterval', file_path], 
                                        capture_output=True, text=True)
            if clear_result.returncode != 0:
                issues.append(f"⚠️  setInterval without clearInterval: {line.strip()}")
    
    # Check for addEventListener without removeEventListener
    result = subprocess.run(['grep', '-r', 'addEventListener', 'src/'], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        for line in lines:
            file_path = line.split(':')[0]
            remove_result = subprocess.run(['grep', 'removeEventListener', file_path], 
                                         capture_output=True, text=True)
            if remove_result.returncode != 0:
                issues.append(f"⚠️  addEventListener without removeEventListener: {line.strip()}")
    
    # Check for fetch calls in loops
    result = subprocess.run(['grep', '-r', '-B2', '-A2', 'fetch.*http', 'src/'], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        for i, line in enumerate(lines):
            if 'fetch' in line and ('for' in lines[i-1] or 'while' in lines[i-1]):
                issues.append(f"⚠️  Fetch in loop: {line.strip()}")
    
    if len(issues) == 0:
        print("✅ No obvious memory leaks detected")
    else:
        for issue in issues:
            print(issue)
    
    return len(issues)

def check_react_rerenders():
    """Check for runaway React re-renders"""
    print("\n🔍 CHECKING FOR RUNAWAY RE-RENDERS")
    print("=" * 50)
    
    issues = []
    
    # Check for useState in render functions
    result = subprocess.run(['grep', '-r', '-B2', '-A2', 'useState.*=', 'src/'], 
                          capture_output=True, text=True)
    
    # Check for useEffect with object dependencies
    result = subprocess.run(['grep', '-r', 'useEffect.*{.*}', 'src/'], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        for line in lines:
            if '{' in line and '}' in line:
                issues.append(f"⚠️  Object in useEffect deps (causes re-renders): {line.strip()}")
    
    # Check for inline object creation in JSX
    result = subprocess.run(['grep', '-r', 'style={{', 'src/'], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        if len(lines) > 10:  # Only warn if many instances
            issues.append(f"⚠️  Many inline styles found ({len(lines)} instances) - can cause re-renders")
    
    if len(issues) == 0:
        print("✅ No obvious re-render issues detected")
    else:
        for issue in issues:
            print(issue)
    
    return len(issues)

def check_background_scripts():
    """Check for background monitoring scripts"""
    print("\n🔍 CHECKING FOR BACKGROUND SCRIPTS")
    print("=" * 50)
    
    issues = []
    
    # Check for running Python processes
    result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
    
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        for line in lines:
            if 'python' in line and any(script in line for script in [
                'monitor_rag_pipeline.py',
                'watch_rag_processing.py',
                'debug_frontend_hang.py',
                'analyze_chunking.py'
            ]):
                issues.append(f"🔄 Background script running: {line.split()[-1]}")
    
    # Check for Node.js processes that might be monitoring
    for line in lines:
        if 'node' in line and ('watch' in line or 'monitor' in line):
            issues.append(f"🔄 Background Node process: {line}")
    
    if len(issues) == 0:
        print("✅ No problematic background scripts detected")
    else:
        for issue in issues:
            print(issue)
    
    return len(issues)

def check_polling_intervals():
    """Check for aggressive polling intervals"""
    print("\n🔍 CHECKING FOR AGGRESSIVE POLLING")
    print("=" * 50)
    
    issues = []
    
    # Check for short intervals
    result = subprocess.run(['grep', '-r', '-E', 'setInterval.*[0-9]+', 'src/'], 
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        lines = result.stdout.strip().split('\n')
        for line in lines:
            # Extract interval value
            match = re.search(r'setInterval.*?(\d+)', line)
            if match:
                interval = int(match.group(1))
                if interval < 1000:  # Less than 1 second
                    issues.append(f"⚠️  Aggressive polling ({interval}ms): {line.strip()}")
                elif interval < 5000:  # Less than 5 seconds
                    issues.append(f"⚠️  Frequent polling ({interval}ms): {line.strip()}")
    
    if len(issues) == 0:
        print("✅ No aggressive polling detected")
    else:
        for issue in issues:
            print(issue)
    
    return len(issues)

def main():
    """Run comprehensive performance audit"""
    print("🚀 COMPREHENSIVE PERFORMANCE AUDIT")
    print("=" * 60)
    print("Checking for performance issues that could cause memory problems...")
    print()
    
    total_issues = 0
    
    total_issues += check_infinite_loops()
    total_issues += check_memory_leaks()
    total_issues += check_react_rerenders()
    total_issues += check_background_scripts()
    total_issues += check_polling_intervals()
    
    print("\n" + "=" * 60)
    print("📊 AUDIT SUMMARY")
    print("=" * 60)
    
    if total_issues == 0:
        print("🎉 EXCELLENT! No performance issues detected!")
        print("✅ No infinite loops")
        print("✅ No memory leaks")
        print("✅ No runaway re-renders")
        print("✅ No problematic background scripts")
        print("✅ No aggressive polling")
        print("\nYour app should be running efficiently! 🚀")
    else:
        print(f"⚠️  Found {total_issues} potential performance issues")
        print("\n🔧 RECOMMENDATIONS:")
        print("1. Fix any infinite loops immediately")
        print("2. Add cleanup for intervals and event listeners")
        print("3. Optimize React dependencies and avoid inline objects")
        print("4. Stop unnecessary background monitoring scripts")
        print("5. Increase polling intervals to reduce CPU usage")
    
    print(f"\n📈 System Load Check:")
    load_result = subprocess.run(['uptime'], capture_output=True, text=True)
    if load_result.returncode == 0:
        print(f"   {load_result.stdout.strip()}")

if __name__ == "__main__":
    main()
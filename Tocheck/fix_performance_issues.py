#!/usr/bin/env python3
"""
Fix critical performance issues causing memory problems
"""

import os
import re
import subprocess

def fix_useeffect_dependencies():
    """Fix useEffect hooks missing dependency arrays"""
    print("🔧 FIXING USEEFFECT DEPENDENCIES")
    print("=" * 50)
    
    # Find files with useEffect issues
    critical_files = [
        'src/pages/RealDocumentWorkspace.tsx',
        'src/components/BackendControl.tsx', 
        'src/components/Documents/DocumentMetadataPanel.tsx',
        'src/pages/OllamaAgentDashboard.tsx',
        'src/components/OllamaAgentChat.tsx'
    ]
    
    fixes_applied = 0
    
    for file_path in critical_files:
        if os.path.exists(file_path):
            print(f"📝 Fixing {file_path}")
            
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Fix useEffect without dependencies that should have empty deps
            # Pattern: useEffect(() => { ... }) -> useEffect(() => { ... }, [])
            pattern = r'useEffect\(\(\) => \{([^}]+)\}\);'
            
            def replace_useeffect(match):
                body = match.group(1)
                # Only add empty deps if it's initialization code
                if any(keyword in body for keyword in ['initialize', 'mount', 'setup', 'load']):
                    return f'useEffect(() => {{{body}}}, []);'
                return match.group(0)
            
            new_content = re.sub(pattern, replace_useeffect, content, flags=re.DOTALL)
            
            if new_content != content:
                with open(file_path, 'w') as f:
                    f.write(new_content)
                fixes_applied += 1
                print(f"  ✅ Fixed useEffect dependencies")
    
    return fixes_applied

def stop_background_processes():
    """Stop any background monitoring processes"""
    print("\n🛑 STOPPING BACKGROUND PROCESSES")
    print("=" * 50)
    
    processes_stopped = 0
    
    # Kill monitoring scripts
    scripts_to_kill = [
        'monitor_rag_pipeline.py',
        'watch_rag_processing.py', 
        'debug_frontend_hang.py'
    ]
    
    for script in scripts_to_kill:
        result = subprocess.run(['pkill', '-f', script], capture_output=True)
        if result.returncode == 0:
            print(f"✅ Stopped {script}")
            processes_stopped += 1
    
    return processes_stopped

def optimize_intervals():
    """Find and optimize aggressive polling intervals"""
    print("\n⏱️  OPTIMIZING POLLING INTERVALS")
    print("=" * 50)
    
    # Check current intervals in key files
    key_files = [
        'src/pages/RealDocumentWorkspace.tsx',
        'src/components/BackendControl.tsx',
        'src/pages/OllamaAgentDashboard.tsx'
    ]
    
    optimizations = 0
    
    for file_path in key_files:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Find intervals less than 10 seconds and increase them
            pattern = r'setInterval\(([^,]+),\s*(\d+)\)'
            
            def optimize_interval(match):
                func = match.group(1)
                interval = int(match.group(2))
                
                if interval < 10000:  # Less than 10 seconds
                    new_interval = max(30000, interval * 3)  # At least 30 seconds
                    return f'setInterval({func}, {new_interval})'
                return match.group(0)
            
            new_content = re.sub(pattern, optimize_interval, content)
            
            if new_content != content:
                with open(file_path, 'w') as f:
                    f.write(new_content)
                optimizations += 1
                print(f"✅ Optimized intervals in {file_path}")
    
    return optimizations

def main():
    """Apply critical performance fixes"""
    print("🚀 APPLYING CRITICAL PERFORMANCE FIXES")
    print("=" * 60)
    
    total_fixes = 0
    
    total_fixes += fix_useeffect_dependencies()
    total_fixes += stop_background_processes() 
    total_fixes += optimize_intervals()
    
    print("\n" + "=" * 60)
    print("📊 FIXES APPLIED")
    print("=" * 60)
    
    if total_fixes > 0:
        print(f"✅ Applied {total_fixes} performance fixes")
        print("\n🎯 IMMEDIATE ACTIONS NEEDED:")
        print("1. Restart your frontend development server")
        print("2. Clear browser cache (Cmd+Shift+R)")
        print("3. Monitor memory usage with Activity Monitor")
        print("4. Check if system load decreases")
        
        print("\n⚠️  REMAINING ISSUES TO FIX MANUALLY:")
        print("1. Add proper dependency arrays to remaining useEffect hooks")
        print("2. Extract inline styles to CSS classes or useMemo")
        print("3. Add cleanup functions for event listeners")
        print("4. Implement proper error boundaries")
        
    else:
        print("ℹ️  No automatic fixes could be applied")
        print("Manual code review needed for performance optimization")

if __name__ == "__main__":
    main()
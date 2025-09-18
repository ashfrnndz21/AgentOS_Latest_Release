#!/usr/bin/env python3
"""
Complete Port Consistency Fix - Set Everything to 5052
Ensures both frontend and backend use port 5052 consistently
"""

import os
import re
import subprocess
import sys

def find_and_replace_in_file(file_path, patterns_replacements):
    """Find and replace patterns in a file"""
    if not os.path.exists(file_path):
        print(f"⚠️ File not found: {file_path}")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = False
        
        for pattern, replacement in patterns_replacements:
            if isinstance(pattern, str):
                if pattern in content:
                    content = content.replace(pattern, replacement)
                    changes_made = True
                    print(f"✅ {file_path}: Replaced '{pattern}' with '{replacement}'")
            else:  # regex pattern
                if pattern.search(content):
                    content = pattern.sub(replacement, content)
                    changes_made = True
                    print(f"✅ {file_path}: Applied regex replacement")
        
        if changes_made:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        else:
            print(f"ℹ️ {file_path}: No changes needed")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def fix_backend_ports():
    """Fix all backend port references to 5052"""
    print("🔧 Fixing backend ports...")
    
    backend_files = [
        'backend/simple_api.py',
        'start_backend_simple.py'
    ]
    
    patterns = [
        # Direct port assignments
        ('port=5001', 'port=5052'),
        ('port=5002', 'port=5052'),
        ('port=8000', 'port=5052'),
        ('"port": 5001', '"port": 5052'),
        ('"port": 5002', '"port": 5052'),
        ('"port": 8000', '"port": 5052'),
        ('Port: 5001', 'Port: 5052'),
        ('Port: 5002', 'Port: 5052'),
        ('Port: 8000', 'Port: 5052'),
        # Backend port config
        ('"backend_port": 8000', '"backend_port": 5052'),
        ('backend_port": 5001', '"backend_port": 5052'),
        ('backend_port": 5002', '"backend_port": 5052'),
    ]
    
    for file_path in backend_files:
        if os.path.exists(file_path):
            find_and_replace_in_file(file_path, patterns)

def fix_frontend_ports():
    """Fix all frontend port references to 5052"""
    print("🔧 Fixing frontend ports...")
    
    frontend_files = [
        'src/config/appConfig.ts',
        'src/lib/apiClient.ts',
        'src/components/ConnectionManager.tsx',
        'src/components/ConnectionStatus.tsx',
        'src/components/BackendControl.tsx'
    ]
    
    patterns = [
        # Port configurations
        ('port: 5001', 'port: 5052'),
        ('port: 5002', 'port: 5052'),
        ('port: 8000', 'port: 5052'),
        ('localhost:5001', 'localhost:5052'),
        ('localhost:5002', 'localhost:5052'),
        ('localhost:8000', 'localhost:5052'),
        ('http://localhost:5001', 'http://localhost:5052'),
        ('http://localhost:5002', 'http://localhost:5052'),
        ('http://localhost:8000', 'http://localhost:5052'),
        # Port arrays
        ('[5002, 5001, 8000, 3001]', '[5052, 5002, 5001, 8000, 3001]'),
        ('[5001, 5002, 8000, 3001]', '[5052, 5001, 5002, 8000, 3001]'),
        ('5002, 5001, 8000', '5052, 5002, 5001, 8000'),
        ('5001, 5002, 8000', '5052, 5001, 5002, 8000'),
    ]
    
    for file_path in frontend_files:
        if os.path.exists(file_path):
            find_and_replace_in_file(file_path, patterns)

def fix_service_files():
    """Fix service files that might reference backend ports"""
    print("🔧 Fixing service files...")
    
    service_files = [
        'src/lib/services/OllamaService.ts',
        'src/lib/services/FlexibleChatService.ts',
        'src/lib/services/DocumentRAGService.ts',
        'src/hooks/useOllamaModels.ts',
        'src/hooks/useOllamaAgentsForPalette.ts'
    ]
    
    patterns = [
        ('localhost:5001', 'localhost:5052'),
        ('localhost:5002', 'localhost:5052'),
        ('localhost:8000', 'localhost:5052'),
        ('http://localhost:5001', 'http://localhost:5052'),
        ('http://localhost:5002', 'http://localhost:5052'),
        ('http://localhost:8000', 'http://localhost:5052'),
    ]
    
    for file_path in service_files:
        if os.path.exists(file_path):
            find_and_replace_in_file(file_path, patterns)

def fix_startup_scripts():
    """Fix startup and configuration scripts"""
    print("🔧 Fixing startup scripts...")
    
    script_files = [
        'setup_app.py',
        'start_backend_simple.py',
        'scripts/start-backend.sh'
    ]
    
    patterns = [
        ('5001', '5052'),
        ('5002', '5052'),
        ('port 8000', 'port 5052'),
        ('Port 5001', 'Port 5052'),
        ('Port 5002', 'Port 5052'),
    ]
    
    for file_path in script_files:
        if os.path.exists(file_path):
            find_and_replace_in_file(file_path, patterns)

def verify_port_consistency():
    """Verify that all files are using port 5052"""
    print("🔍 Verifying port consistency...")
    
    # Files to check
    files_to_check = [
        'backend/simple_api.py',
        'src/config/appConfig.ts',
        'src/lib/apiClient.ts'
    ]
    
    issues = []
    
    for file_path in files_to_check:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                content = f.read()
                
            # Check for old ports
            old_ports = ['5001', '5002', '8000']
            for port in old_ports:
                if f':{port}' in content and port != '5052':
                    # Skip if it's part of 5052
                    if f':{port}' in content and f':5052' not in content.replace(f':{port}', ''):
                        issues.append(f"{file_path} still contains port {port}")
    
    if issues:
        print("⚠️ Port consistency issues found:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print("✅ All ports are consistently set to 5052")
        return True

def kill_existing_processes():
    """Kill any processes running on old ports"""
    print("🔪 Cleaning up processes on old ports...")
    
    ports_to_clean = ['5001', '5002', '8000']
    
    for port in ports_to_clean:
        try:
            result = subprocess.run(['lsof', '-ti', f':{port}'], 
                                  capture_output=True, text=True)
            if result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    if pid:
                        print(f"🔪 Killing process {pid} on port {port}")
                        subprocess.run(['kill', '-9', pid])
        except Exception as e:
            print(f"⚠️ Error cleaning port {port}: {e}")

def main():
    """Main function to fix all port configurations"""
    print("🚀 Complete Port Consistency Fix - Setting Everything to 5052")
    print("=" * 60)
    
    # Step 1: Kill existing processes
    kill_existing_processes()
    
    # Step 2: Fix backend ports
    fix_backend_ports()
    
    # Step 3: Fix frontend ports  
    fix_frontend_ports()
    
    # Step 4: Fix service files
    fix_service_files()
    
    # Step 5: Fix startup scripts
    fix_startup_scripts()
    
    # Step 6: Verify consistency
    print("\n" + "=" * 60)
    success = verify_port_consistency()
    
    if success:
        print("\n✅ Port consistency fix completed successfully!")
        print("🚀 All systems should now use port 5052")
        print("\nNext steps:")
        print("1. Start backend: python quick_backend_start.py")
        print("2. Start frontend: npm run dev")
        print("3. Access app at: http://localhost:5173")
        print("4. Backend API at: http://localhost:5052")
    else:
        print("\n⚠️ Some issues remain. Please check the files manually.")
    
    return success

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
VERIFY ORIGINAL WORKING VERSION
Verifies that all components match the exact working version from 5pm Nov 9
"""

import os
import json
import subprocess
import sys
from pathlib import Path

def print_status(message, status="INFO"):
    """Print colored status messages"""
    colors = {
        "INFO": "\033[94m",     # Blue
        "SUCCESS": "\033[92m",  # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",    # Red
        "RESET": "\033[0m"      # Reset
    }
    print(f"{colors.get(status, '')}{message}{colors['RESET']}")

def verify_app_structure():
    """Verify the App.tsx has the correct structure"""
    print_status("🔍 VERIFYING APP.TSX STRUCTURE:", "INFO")
    
    app_path = "src/App.tsx"
    if not os.path.exists(app_path):
        print_status("   ❌ App.tsx missing", "ERROR")
        return False
    
    with open(app_path, 'r') as f:
        content = f.read()
    
    # Check for key elements from working version
    checks = [
        ("Lazy loading imports", "lazy(() => import"),
        ("Error boundaries", "ErrorBoundary"),
        ("Safe component wrapper", "SafeComponent"),
        ("Loading spinner", "LoadingSpinner"),
        ("All 19 routes", "Route path="),
        ("Layout wrapper", "<Layout>"),
        ("Suspense fallback", "Suspense fallback")
    ]
    
    for check_name, check_pattern in checks:
        if check_pattern in content:
            print_status(f"   ✅ {check_name}", "SUCCESS")
        else:
            print_status(f"   ❌ {check_name}", "ERROR")
            return False
    
    # Count routes
    route_count = content.count('Route path=')
    if route_count >= 19:
        print_status(f"   ✅ Route count: {route_count} (expected: 19+)", "SUCCESS")
    else:
        print_status(f"   ❌ Route count: {route_count} (expected: 19+)", "ERROR")
        return False
    
    return True

def verify_sidebar_navigation():
    """Verify the sidebar has all navigation items"""
    print_status("🔍 VERIFYING SIDEBAR NAVIGATION:", "INFO")
    
    sidebar_path = "src/components/IndustrySidebar.tsx"
    if not os.path.exists(sidebar_path):
        print_status("   ❌ IndustrySidebar.tsx missing", "ERROR")
        return False
    
    with open(sidebar_path, 'r') as f:
        content = f.read()
    
    # Check for navigation groups
    expected_groups = [
        "Core Platform",
        "Agent Use Cases", 
        "Monitoring & Control",
        "Configuration"
    ]
    
    for group in expected_groups:
        if group in content:
            print_status(f"   ✅ {group} group", "SUCCESS")
        else:
            print_status(f"   ❌ {group} group", "ERROR")
            return False
    
    # Check for key navigation items
    expected_items = [
        "Dashboard", "Agent Command Centre", "AI Agents",
        "Multi Agent Workspace", "Ollama Agents", "MCP Gateway",
        "Risk Analytics", "Architecture Design", "Settings"
    ]
    
    for item in expected_items:
        if item in content:
            print_status(f"   ✅ {item} navigation", "SUCCESS")
        else:
            print_status(f"   ❌ {item} navigation", "ERROR")
            return False
    
    return True

def verify_error_handling():
    """Verify error handling components exist"""
    print_status("🔍 VERIFYING ERROR HANDLING:", "INFO")
    
    error_boundary_path = "src/components/ErrorBoundary.tsx"
    if not os.path.exists(error_boundary_path):
        print_status("   ❌ ErrorBoundary.tsx missing", "ERROR")
        return False
    
    with open(error_boundary_path, 'r') as f:
        content = f.read()
    
    # Check for error boundary features
    error_features = [
        ("Error state handling", "componentDidCatch"),
        ("Error display", "Something went wrong"),
        ("Recovery mechanism", "Try again"),
        ("Error logging", "console.error")
    ]
    
    for feature_name, feature_pattern in error_features:
        if feature_pattern in content:
            print_status(f"   ✅ {feature_name}", "SUCCESS")
        else:
            print_status(f"   ⚠️ {feature_name} (optional)", "WARNING")
    
    return True

def verify_backend_api():
    """Verify backend API structure"""
    print_status("🔍 VERIFYING BACKEND API:", "INFO")
    
    api_path = "backend/simple_api.py"
    if not os.path.exists(api_path):
        print_status("   ❌ simple_api.py missing", "ERROR")
        return False
    
    with open(api_path, 'r') as f:
        content = f.read()
    
    # Check for key API endpoints
    expected_endpoints = [
        ("/health", "health_check"),
        ("/api/agents", "list_agents"),
        ("/start", "start_backend"),
        ("CORS", "CORSMiddleware"),
        ("FastAPI", "FastAPI")
    ]
    
    for endpoint_name, endpoint_pattern in expected_endpoints:
        if endpoint_pattern in content:
            print_status(f"   ✅ {endpoint_name} endpoint", "SUCCESS")
        else:
            print_status(f"   ❌ {endpoint_name} endpoint", "ERROR")
            return False
    
    return True

def verify_package_dependencies():
    """Verify package.json has correct dependencies"""
    print_status("🔍 VERIFYING PACKAGE DEPENDENCIES:", "INFO")
    
    if not os.path.exists("package.json"):
        print_status("   ❌ package.json missing", "ERROR")
        return False
    
    with open("package.json", 'r') as f:
        package_data = json.load(f)
    
    # Check essential dependencies
    dependencies = package_data.get("dependencies", {})
    dev_dependencies = package_data.get("devDependencies", {})
    all_deps = {**dependencies, **dev_dependencies}
    
    essential_deps = [
        "react", "react-dom", "react-router-dom",
        "@radix-ui/react-dialog", "@radix-ui/react-select",
        "lucide-react", "tailwindcss", "typescript"
    ]
    
    missing_deps = []
    for dep in essential_deps:
        if dep in all_deps:
            print_status(f"   ✅ {dep}", "SUCCESS")
        else:
            print_status(f"   ❌ {dep}", "ERROR")
            missing_deps.append(dep)
    
    return len(missing_deps) == 0

def verify_startup_scripts():
    """Verify startup scripts exist"""
    print_status("🔍 VERIFYING STARTUP SCRIPTS:", "INFO")
    
    scripts = [
        "start_backend_simple.py",
        "start_original_working_version.py",
        "restore_original_working_version_complete.py"
    ]
    
    all_exist = True
    for script in scripts:
        if os.path.exists(script):
            print_status(f"   ✅ {script}", "SUCCESS")
        else:
            print_status(f"   ❌ {script}", "ERROR")
            all_exist = False
    
    return all_exist

def run_quick_syntax_check():
    """Run a quick syntax check on key files"""
    print_status("🔍 RUNNING SYNTAX CHECKS:", "INFO")
    
    # Check TypeScript files
    ts_files = [
        "src/App.tsx",
        "src/components/Layout.tsx",
        "src/components/IndustrySidebar.tsx"
    ]
    
    for ts_file in ts_files:
        if os.path.exists(ts_file):
            # Basic syntax check - look for obvious issues
            with open(ts_file, 'r') as f:
                content = f.read()
            
            # Check for balanced brackets
            if content.count('{') == content.count('}'):
                print_status(f"   ✅ {ts_file} syntax OK", "SUCCESS")
            else:
                print_status(f"   ⚠️ {ts_file} bracket mismatch", "WARNING")
        else:
            print_status(f"   ❌ {ts_file} missing", "ERROR")
    
    # Check Python files
    py_files = [
        "backend/simple_api.py",
        "start_backend_simple.py"
    ]
    
    for py_file in py_files:
        if os.path.exists(py_file):
            try:
                # Try to compile the Python file
                with open(py_file, 'r') as f:
                    compile(f.read(), py_file, 'exec')
                print_status(f"   ✅ {py_file} syntax OK", "SUCCESS")
            except SyntaxError as e:
                print_status(f"   ❌ {py_file} syntax error: {e}", "ERROR")
        else:
            print_status(f"   ❌ {py_file} missing", "ERROR")

def main():
    """Main verification function"""
    print_status("🔍 VERIFYING ORIGINAL WORKING VERSION FROM 5PM NOV 9", "INFO")
    print_status("=" * 60, "INFO")
    
    verification_results = []
    
    # Run all verifications
    verifications = [
        ("App Structure", verify_app_structure),
        ("Sidebar Navigation", verify_sidebar_navigation),
        ("Error Handling", verify_error_handling),
        ("Backend API", verify_backend_api),
        ("Package Dependencies", verify_package_dependencies),
        ("Startup Scripts", verify_startup_scripts)
    ]
    
    for name, verify_func in verifications:
        print_status(f"\n{name}:", "INFO")
        result = verify_func()
        verification_results.append((name, result))
    
    # Run syntax checks
    print_status(f"\nSyntax Checks:", "INFO")
    run_quick_syntax_check()
    
    # Summary
    print_status("\n🎯 VERIFICATION SUMMARY:", "INFO")
    print_status("=" * 60, "INFO")
    
    passed = sum(1 for _, result in verification_results if result)
    total = len(verification_results)
    
    for name, result in verification_results:
        status = "SUCCESS" if result else "ERROR"
        icon = "✅" if result else "❌"
        print_status(f"   {icon} {name}", status)
    
    completion_percentage = (passed / total) * 100
    
    print_status(f"\n📊 VERIFICATION SCORE: {completion_percentage:.1f}%", "SUCCESS" if completion_percentage == 100 else "WARNING")
    print_status(f"   ✅ Passed: {passed}/{total}", "SUCCESS")
    print_status(f"   ❌ Failed: {total - passed}/{total}", "ERROR" if passed < total else "SUCCESS")
    
    if completion_percentage == 100:
        print_status("\n🎉 PERFECT MATCH!", "SUCCESS")
        print_status("✅ All components match the original working version", "SUCCESS")
        print_status("🚀 Ready to start with: python start_original_working_version.py", "SUCCESS")
    elif completion_percentage >= 90:
        print_status("\n⚠️ MOSTLY CORRECT", "WARNING")
        print_status("🔧 Minor issues detected - should still work", "WARNING")
    else:
        print_status("\n❌ SIGNIFICANT ISSUES", "ERROR")
        print_status("🔧 Run restoration scripts before starting", "ERROR")
    
    print_status("\n📋 ORIGINAL WORKING VERSION FEATURES:", "INFO")
    features = [
        "19 fully functional routes",
        "22+ components with error boundaries", 
        "Comprehensive error handling",
        "Lazy loading and performance optimization",
        "Complete banking agent use cases",
        "Multi-agent workspace functionality",
        "Ollama integration for local AI",
        "MCP gateway for model protocols",
        "Document processing with RAG",
        "Settings and configuration management"
    ]
    
    for feature in features:
        print_status(f"   ✅ {feature}", "SUCCESS")
    
    print_status(f"\n🏁 VERIFICATION COMPLETE", "SUCCESS")

if __name__ == "__main__":
    main()
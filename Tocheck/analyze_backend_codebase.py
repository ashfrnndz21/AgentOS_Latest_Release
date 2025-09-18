#!/usr/bin/env python3
"""
ANALYZE BACKEND CODEBASE
Complete analysis of all backend files to determine functionality
"""

import os
import re
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

def analyze_python_file(file_path):
    """Analyze a Python backend file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return {"status": "UNREADABLE", "reason": "Cannot read file"}
    
    analysis = {
        "file_path": file_path,
        "size": len(content),
        "lines": len(content.split('\n')),
        "imports": [],
        "functions": [],
        "classes": [],
        "routes": [],
        "api_endpoints": [],
        "database_operations": [],
        "external_services": [],
        "error_handling": [],
        "status": "UNKNOWN",
        "confidence": 0,
        "reason": ""
    }
    
    # Extract imports
    import_pattern = r'(?:from\s+[\w.]+\s+)?import\s+([\w,\s*]+)'
    imports = re.findall(import_pattern, content)
    analysis["imports"] = [imp.strip() for imp_list in imports for imp in imp_list.split(',')]
    
    # Extract functions
    function_pattern = r'def\s+(\w+)\s*\('
    analysis["functions"] = re.findall(function_pattern, content)
    
    # Extract classes
    class_pattern = r'class\s+(\w+)(?:\([^)]*\))?:'
    analysis["classes"] = re.findall(class_pattern, content)
    
    # Extract FastAPI routes
    route_patterns = [
        r'@app\.(\w+)\s*\(\s*["\']([^"\']+)["\']',
        r'@router\.(\w+)\s*\(\s*["\']([^"\']+)["\']'
    ]
    for pattern in route_patterns:
        routes = re.findall(pattern, content)
        for method, path in routes:
            analysis["routes"].append(f"{method.upper()} {path}")
    
    # Extract API endpoints
    api_patterns = [
        r'fetch\s*\(\s*["\']([^"\']+)["\']',
        r'requests\.(\w+)\s*\(\s*["\']([^"\']+)["\']',
        r'http://[^\s"\']+',
        r'https://[^\s"\']+',
        r'/api/[\w/]+'
    ]
    for pattern in api_patterns:
        matches = re.findall(pattern, content)
        if matches:
            if isinstance(matches[0], str):
                analysis["api_endpoints"].extend(matches)
            else:
                analysis["api_endpoints"].extend([f"{m[0]} {m[1]}" for m in matches])
    
    # Extract database operations
    db_patterns = [
        r'\.execute\s*\(',
        r'\.fetchall\s*\(',
        r'\.fetchone\s*\(',
        r'\.commit\s*\(',
        r'CREATE TABLE',
        r'INSERT INTO',
        r'SELECT.*FROM',
        r'UPDATE.*SET',
        r'DELETE FROM'
    ]
    for pattern in db_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            analysis["database_operations"].append(pattern)
    
    # Extract external service calls
    service_patterns = [
        r'ollama',
        r'openai',
        r'anthropic',
        r'bedrock',
        r'langchain',
        r'chromadb',
        r'pinecone',
        r'weaviate'
    ]
    for pattern in service_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            analysis["external_services"].append(pattern)
    
    # Extract error handling
    error_patterns = [
        r'try:',
        r'except\s+\w*Error',
        r'raise\s+\w*Error',
        r'HTTPException',
        r'logging\.',
        r'logger\.'
    ]
    for pattern in error_patterns:
        if re.search(pattern, content):
            analysis["error_handling"].append(pattern)
    
    # Determine status
    route_count = len(analysis["routes"])
    function_count = len(analysis["functions"])
    db_count = len(analysis["database_operations"])
    service_count = len(analysis["external_services"])
    error_count = len(analysis["error_handling"])
    
    if route_count >= 5 and function_count >= 10:
        analysis["status"] = "FULL_API"
        analysis["confidence"] = 90
        analysis["reason"] = f"{route_count} routes, {function_count} functions"
    elif route_count >= 2 and function_count >= 5:
        analysis["status"] = "PARTIAL_API"
        analysis["confidence"] = 75
        analysis["reason"] = f"{route_count} routes, {function_count} functions"
    elif function_count >= 5:
        analysis["status"] = "SERVICE_MODULE"
        analysis["confidence"] = 70
        analysis["reason"] = f"{function_count} functions, no routes"
    elif analysis["lines"] < 50:
        analysis["status"] = "MINIMAL"
        analysis["confidence"] = 60
        analysis["reason"] = f"Only {analysis['lines']} lines"
    else:
        analysis["status"] = "UNKNOWN"
        analysis["confidence"] = 30
        analysis["reason"] = "Cannot determine functionality"
    
    return analysis

def analyze_backend_codebase():
    """Analyze the complete backend codebase"""
    
    print_status("🔍 BACKEND CODEBASE ANALYSIS", "INFO")
    print_status("=" * 80, "INFO")
    
    # Get all Python files in backend
    backend_files = []
    for root, dirs, files in os.walk("backend"):
        for file in files:
            if file.endswith('.py'):
                backend_files.append(os.path.join(root, file))
    
    print_status(f"\n📁 Found {len(backend_files)} Python files in backend/", "INFO")
    
    # Analyze each file
    file_analyses = {}
    for file_path in backend_files:
        analysis = analyze_python_file(file_path)
        file_analyses[file_path] = analysis
    
    # Display detailed analysis
    print_status("\n📋 DETAILED FILE ANALYSIS:", "INFO")
    print_status("=" * 80, "INFO")
    
    for file_path, analysis in file_analyses.items():
        filename = os.path.basename(file_path)
        print_status(f"\n📄 {filename}:", "INFO")
        
        # Status
        if analysis["status"] == "FULL_API":
            print_status(f"   Status: ✅ {analysis['status']} - {analysis['reason']}", "SUCCESS")
        elif analysis["status"] == "PARTIAL_API":
            print_status(f"   Status: 🔶 {analysis['status']} - {analysis['reason']}", "WARNING")
        elif analysis["status"] == "SERVICE_MODULE":
            print_status(f"   Status: 🔸 {analysis['status']} - {analysis['reason']}", "WARNING")
        else:
            print_status(f"   Status: ❌ {analysis['status']} - {analysis['reason']}", "ERROR")
        
        # Details
        print_status(f"   Size: {analysis['size']} bytes, {analysis['lines']} lines", "INFO")
        
        if analysis["routes"]:
            print_status(f"   Routes ({len(analysis['routes'])}):", "SUCCESS")
            for route in analysis["routes"][:5]:  # Show first 5
                print_status(f"     • {route}", "SUCCESS")
            if len(analysis["routes"]) > 5:
                print_status(f"     ... and {len(analysis['routes']) - 5} more", "SUCCESS")
        
        if analysis["functions"]:
            print_status(f"   Functions ({len(analysis['functions'])}):", "INFO")
            for func in analysis["functions"][:5]:  # Show first 5
                print_status(f"     • {func}()", "INFO")
            if len(analysis["functions"]) > 5:
                print_status(f"     ... and {len(analysis['functions']) - 5} more", "INFO")
        
        if analysis["classes"]:
            print_status(f"   Classes ({len(analysis['classes'])}):", "INFO")
            for cls in analysis["classes"]:
                print_status(f"     • {cls}", "INFO")
        
        if analysis["database_operations"]:
            print_status(f"   Database Operations: {len(analysis['database_operations'])}", "SUCCESS")
        
        if analysis["external_services"]:
            print_status(f"   External Services: {', '.join(set(analysis['external_services']))}", "SUCCESS")
        
        if analysis["error_handling"]:
            print_status(f"   Error Handling: {len(analysis['error_handling'])} patterns", "SUCCESS")
    
    # Summary
    print_status("\n📊 BACKEND SUMMARY:", "INFO")
    print_status("=" * 80, "INFO")
    
    status_counts = {}
    total_routes = 0
    total_functions = 0
    
    for analysis in file_analyses.values():
        status = analysis["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
        total_routes += len(analysis["routes"])
        total_functions += len(analysis["functions"])
    
    print_status(f"📈 FILE STATUS BREAKDOWN:", "INFO")
    for status, count in sorted(status_counts.items()):
        percentage = (count / len(file_analyses)) * 100
        color = "SUCCESS" if "API" in status else "WARNING" if status == "SERVICE_MODULE" else "ERROR"
        print_status(f"   {status}: {count} files ({percentage:.1f}%)", color)
    
    print_status(f"\n🔢 OVERALL METRICS:", "INFO")
    print_status(f"   Total API Routes: {total_routes}", "SUCCESS" if total_routes > 0 else "ERROR")
    print_status(f"   Total Functions: {total_functions}", "SUCCESS" if total_functions > 0 else "ERROR")
    print_status(f"   Total Files: {len(file_analyses)}", "INFO")
    
    # Identify main API files
    print_status(f"\n🎯 MAIN API FILES:", "INFO")
    api_files = [(path, analysis) for path, analysis in file_analyses.items() 
                 if analysis["status"] in ["FULL_API", "PARTIAL_API"]]
    
    if api_files:
        for file_path, analysis in api_files:
            filename = os.path.basename(file_path)
            print_status(f"   ✅ {filename}: {len(analysis['routes'])} routes, {len(analysis['functions'])} functions", "SUCCESS")
    else:
        print_status("   ❌ No main API files found", "ERROR")
    
    # Identify service modules
    print_status(f"\n🔧 SERVICE MODULES:", "INFO")
    service_files = [(path, analysis) for path, analysis in file_analyses.items() 
                     if analysis["status"] == "SERVICE_MODULE"]
    
    if service_files:
        for file_path, analysis in service_files:
            filename = os.path.basename(file_path)
            services = ', '.join(set(analysis["external_services"])) if analysis["external_services"] else "Generic"
            print_status(f"   🔸 {filename}: {len(analysis['functions'])} functions ({services})", "WARNING")
    else:
        print_status("   ❌ No service modules found", "ERROR")
    
    # Check for databases
    print_status(f"\n💾 DATABASE FILES:", "INFO")
    db_files = [f for f in os.listdir("backend") if f.endswith('.db')]
    if db_files:
        for db_file in db_files:
            file_size = os.path.getsize(f"backend/{db_file}")
            print_status(f"   💾 {db_file}: {file_size} bytes", "SUCCESS")
    else:
        print_status("   ❌ No database files found", "ERROR")
    
    # Recommendations
    print_status(f"\n💡 BACKEND RECOMMENDATIONS:", "INFO")
    print_status("=" * 80, "INFO")
    
    if total_routes == 0:
        print_status("🚨 CRITICAL: No API routes found - backend is not functional", "ERROR")
        print_status("📋 Actions needed:", "ERROR")
        print_status("   1. Check if any API server is actually working", "ERROR")
        print_status("   2. Start with simple_api.py if it exists", "ERROR")
        print_status("   3. Verify FastAPI/Flask setup", "ERROR")
    elif total_routes < 10:
        print_status("⚠️ WARNING: Limited API functionality", "WARNING")
        print_status("📋 Actions needed:", "WARNING")
        print_status("   1. Expand API endpoints", "WARNING")
        print_status("   2. Add missing functionality", "WARNING")
    else:
        print_status("✅ GOOD: Backend has substantial API functionality", "SUCCESS")
        print_status("📋 Actions needed:", "SUCCESS")
        print_status("   1. Test all endpoints", "SUCCESS")
        print_status("   2. Ensure services are running", "SUCCESS")
    
    # Show how to start backend
    print_status(f"\n🚀 HOW TO START BACKEND:", "INFO")
    if "backend/simple_api.py" in file_analyses:
        print_status("   Main API: python backend/simple_api.py", "SUCCESS")
    if "backend/minimal_api.py" in file_analyses:
        print_status("   Minimal API: python backend/minimal_api.py", "SUCCESS")
    
    print_status("   Or use startup script: python start_backend_simple.py", "INFO")
    
    print_status(f"\n🏁 BACKEND ANALYSIS COMPLETE", "SUCCESS")

if __name__ == "__main__":
    analyze_backend_codebase()
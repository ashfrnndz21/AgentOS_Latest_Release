#!/usr/bin/env python3
"""
COMPREHENSIVE FRONTEND CODEBASE ANALYSIS
Analyze all 560 frontend files and categorize them by main functionalities
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Any

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

def analyze_frontend_file(file_path: str) -> Dict[str, Any]:
    """Analyze a frontend file for functionality and categorization"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return {"status": "UNREADABLE", "reason": "Cannot read file"}
    
    analysis = {
        "file_path": file_path,
        "filename": os.path.basename(file_path),
        "directory": os.path.dirname(file_path),
        "extension": os.path.splitext(file_path)[1],
        "size": len(content),
        "lines": len(content.split('\n')),
        "imports": [],
        "exports": [],
        "components": [],
        "hooks": [],
        "routes": [],
        "api_calls": [],
        "ui_elements": [],
        "functionality_indicators": [],
        "category": "UNKNOWN",
        "subcategory": "",
        "status": "UNKNOWN",
        "confidence": 0,
        "reason": ""
    }
    
    # Extract imports
    import_patterns = [
        r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]',
        r'import\s+[\'"]([^\'"]+)[\'"]'
    ]
    for pattern in import_patterns:
        matches = re.findall(pattern, content)
        analysis["imports"].extend(matches)
    
    # Extract exports
    export_patterns = [
        r'export\s+(?:default\s+)?(?:const\s+|function\s+|class\s+)?(\w+)',
        r'export\s+\{\s*([^}]+)\s*\}'
    ]
    for pattern in export_patterns:
        matches = re.findall(pattern, content)
        analysis["exports"].extend(matches)
    
    # Extract React components
    component_patterns = [
        r'(?:const|function)\s+([A-Z]\w+).*?(?:React\.FC|JSX\.Element|\(\s*\)\s*=>)',
        r'class\s+([A-Z]\w+)\s+extends\s+(?:React\.)?Component',
        r'export\s+(?:default\s+)?(?:const\s+|function\s+)([A-Z]\w+)'
    ]
    for pattern in component_patterns:
        matches = re.findall(pattern, content)
        analysis["components"].extend(matches)
    
    # Extract hooks
    hook_pattern = r'use[A-Z]\w+'
    analysis["hooks"] = list(set(re.findall(hook_pattern, content)))
    
    # Extract routes
    route_patterns = [
        r'<Route\s+path=[\'"]([^\'"]+)[\'"]',
        r'to=[\'"]([^\'"]+)[\'"]',
        r'navigate\([\'"]([^\'"]+)[\'"]'
    ]
    for pattern in route_patterns:
        matches = re.findall(pattern, content)
        analysis["routes"].extend(matches)
    
    # Extract API calls
    api_patterns = [
        r'fetch\s*\(\s*[\'"]([^\'"]+)[\'"]',
        r'axios\.\w+\s*\(\s*[\'"]([^\'"]+)[\'"]',
        r'http://[^\s\'"]+',
        r'https://[^\s\'"]+',
        r'/api/[\w/]+'
    ]
    for pattern in api_patterns:
        matches = re.findall(pattern, content)
        analysis["api_calls"].extend(matches)
    
    # Extract UI elements
    ui_patterns = [
        r'<(Button|Card|Dialog|Modal|Input|Select|Table|Form|Chart|Graph)',
        r'className=[\'"][^\'"]*(?:button|card|modal|input|select|table|form|chart)[^\'"]*[\'"]'
    ]
    for pattern in ui_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        analysis["ui_elements"].extend(matches)
    
    # Extract functionality indicators
    functionality_patterns = [
        r'useState', r'useEffect', r'useCallback', r'useMemo',
        r'onClick', r'onSubmit', r'onChange', r'onLoad',
        r'handleSubmit', r'handleClick', r'handleChange',
        r'async', r'await', r'Promise', r'try\s*{', r'catch',
        r'localStorage', r'sessionStorage'
    ]
    for pattern in functionality_patterns:
        if re.search(pattern, content):
            analysis["functionality_indicators"].append(pattern)
    
    # Categorize based on file path and content
    analysis["category"], analysis["subcategory"] = categorize_file(file_path, content, analysis)
    
    # Determine status
    functionality_count = len(analysis["functionality_indicators"])
    component_count = len(analysis["components"])
    
    if "error" in content.lower() and ("failed to load" in content.lower() or "unavailable" in content.lower()):
        analysis["status"] = "ERROR"
        analysis["confidence"] = 90
        analysis["reason"] = "Contains error messages"
    elif functionality_count >= 8 and component_count >= 1:
        analysis["status"] = "FUNCTIONAL"
        analysis["confidence"] = 85
        analysis["reason"] = f"{functionality_count} functionality indicators, {component_count} components"
    elif functionality_count >= 4 or component_count >= 1:
        analysis["status"] = "PARTIAL"
        analysis["confidence"] = 70
        analysis["reason"] = f"{functionality_count} functionality indicators, {component_count} components"
    elif analysis["lines"] < 20:
        analysis["status"] = "MINIMAL"
        analysis["confidence"] = 60
        analysis["reason"] = f"Only {analysis['lines']} lines"
    else:
        analysis["status"] = "UNKNOWN"
        analysis["confidence"] = 30
        analysis["reason"] = "Cannot determine functionality level"
    
    return analysis

def categorize_file(file_path: str, content: str, analysis: Dict) -> Tuple[str, str]:
    """Categorize file based on path and content"""
    
    # Core Platform
    if any(x in file_path.lower() for x in ['app.tsx', 'main.tsx', 'layout.tsx', 'sidebar', 'maincontent']):
        return "Core Platform", "Infrastructure"
    
    if 'pages/Index.tsx' in file_path or 'Dashboard' in file_path:
        return "Core Platform", "Dashboard"
    
    if 'systemflow' in file_path.lower() or 'agentoslogical' in file_path.lower():
        return "Core Platform", "AgentOS Architecture Blueprint"
    
    # Agent Command Centre
    if 'commandcentre' in file_path.lower() or 'command-centre' in file_path.lower():
        return "Core Platform", "Agent Command Centre"
    
    # Document Chat
    if any(x in file_path.lower() for x in ['document', 'rag', 'chat']) and 'workspace' in file_path.lower():
        return "Core Platform", "Document Chat"
    
    # Ollama
    if 'ollama' in file_path.lower():
        if 'terminal' in file_path.lower():
            return "Core Platform", "Ollama Terminal"
        else:
            return "Core Platform", "Ollama Agents"
    
    # AI Agents
    if any(x in file_path.lower() for x in ['agents', 'agent']) and 'dashboard' in file_path.lower():
        return "Core Platform", "AI Agents"
    
    # Multi Agent Workspace
    if 'multiagent' in file_path.lower() or 'multi-agent' in file_path.lower():
        return "Core Platform", "Multi Agent Workspace"
    
    # MCP Gateway
    if 'mcp' in file_path.lower():
        return "Core Platform", "MCP Gateway"
    
    # AI Marketplace
    if 'marketplace' in file_path.lower() or 'exchange' in file_path.lower():
        return "Core Platform", "AI Marketplace"
    
    # Agent Use Cases
    if 'risk' in file_path.lower() and 'analytics' in file_path.lower():
        return "Agent Use Cases", "Risk Analytics"
    
    if 'architecture' in file_path.lower() and 'design' in file_path.lower():
        return "Agent Use Cases", "Architecture Design"
    
    if 'wealth' in file_path.lower() and 'management' in file_path.lower():
        return "Agent Use Cases", "Wealth Management"
    
    if 'customer' in file_path.lower():
        if 'insights' in file_path.lower() or 'value' in file_path.lower():
            return "Agent Use Cases", "Customer Insights"
        elif 'analytics' in file_path.lower():
            return "Agent Use Cases", "Customer Analytics"
    
    # Monitoring & Control
    if 'agentcontrol' in file_path.lower() or 'agent-control' in file_path.lower():
        return "Monitoring & Control", "Agent Control Panel"
    
    if 'monitoring' in file_path.lower() or 'system' in file_path.lower():
        return "Monitoring & Control", "System Monitor"
    
    # UI Components
    if '/ui/' in file_path or 'components/ui' in file_path:
        return "Infrastructure", "UI Components"
    
    # Hooks
    if '/hooks/' in file_path or file_path.startswith('src/hooks/'):
        return "Infrastructure", "Hooks"
    
    # Services
    if '/services/' in file_path or '/lib/' in file_path:
        return "Infrastructure", "Services"
    
    # Types
    if '/types/' in file_path or file_path.endswith('.d.ts'):
        return "Infrastructure", "Types"
    
    # Configuration
    if any(x in file_path.lower() for x in ['config', 'settings']):
        return "Infrastructure", "Configuration"
    
    return "UNKNOWN", ""

def analyze_frontend_codebase():
    """Analyze the complete frontend codebase"""
    
    print_status("🔍 COMPREHENSIVE FRONTEND CODEBASE ANALYSIS", "INFO")
    print_status("=" * 80, "INFO")
    
    # Get all frontend files
    frontend_files = []
    extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss', '.json']
    
    for root, dirs, files in os.walk("src"):
        # Skip node_modules and other irrelevant directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build', '__pycache__']]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                frontend_files.append(os.path.join(root, file))
    
    print_status(f"\n📁 Found {len(frontend_files)} frontend files", "INFO")
    
    # Analyze each file
    print_status("\n🔬 ANALYZING FILE CONTENTS...", "INFO")
    
    file_analyses = {}
    category_counts = {}
    status_counts = {}
    
    for i, file_path in enumerate(frontend_files):
        if i % 50 == 0:
            print_status(f"   Processed {i}/{len(frontend_files)} files...", "INFO")
        
        analysis = analyze_frontend_file(file_path)
        file_analyses[file_path] = analysis
        
        # Count categories
        category = analysis["category"]
        subcategory = analysis["subcategory"]
        if category not in category_counts:
            category_counts[category] = {}
        if subcategory not in category_counts[category]:
            category_counts[category][subcategory] = []
        category_counts[category][subcategory].append(file_path)
        
        # Count statuses
        status = analysis["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    print_status(f"   Completed analysis of {len(frontend_files)} files", "SUCCESS")
    
    # Display results by functionality
    print_status("\n🎯 FRONTEND ANALYSIS BY FUNCTIONALITY:", "INFO")
    print_status("=" * 80, "INFO")
    
    # Define the main functionalities in order
    main_functionalities = {
        "Core Platform": [
            "Dashboard",
            "AgentOS Architecture Blueprint", 
            "Agent Command Centre",
            "Document Chat",
            "Ollama Agents",
            "Ollama Terminal",
            "AI Agents",
            "Multi Agent Workspace",
            "MCP Gateway",
            "AI Marketplace"
        ],
        "Agent Use Cases": [
            "Risk Analytics",
            "Architecture Design", 
            "Wealth Management",
            "Customer Insights",
            "Customer Analytics"
        ],
        "Monitoring & Control": [
            "Agent Control Panel",
            "System Monitor"
        ]
    }
    
    # Analyze each main functionality
    for main_category, subcategories in main_functionalities.items():
        print_status(f"\n📋 {main_category.upper()}:", "INFO")
        
        for subcategory in subcategories:
            files = category_counts.get(main_category, {}).get(subcategory, [])
            
            if files:
                print_status(f"\n   🎯 {subcategory} ({len(files)} files):", "SUCCESS")
                
                # Analyze status of files in this category
                functional_files = []
                partial_files = []
                error_files = []
                minimal_files = []
                
                for file_path in files:
                    analysis = file_analyses[file_path]
                    status = analysis["status"]
                    
                    if status == "FUNCTIONAL":
                        functional_files.append(file_path)
                    elif status == "PARTIAL":
                        partial_files.append(file_path)
                    elif status == "ERROR":
                        error_files.append(file_path)
                    else:
                        minimal_files.append(file_path)
                
                # Show status breakdown
                if functional_files:
                    print_status(f"      ✅ Functional ({len(functional_files)}):", "SUCCESS")
                    for file_path in functional_files[:3]:  # Show first 3
                        filename = os.path.basename(file_path)
                        print_status(f"         • {filename}", "SUCCESS")
                    if len(functional_files) > 3:
                        print_status(f"         ... and {len(functional_files) - 3} more", "SUCCESS")
                
                if partial_files:
                    print_status(f"      🔶 Partial ({len(partial_files)}):", "WARNING")
                    for file_path in partial_files[:3]:  # Show first 3
                        filename = os.path.basename(file_path)
                        print_status(f"         • {filename}", "WARNING")
                    if len(partial_files) > 3:
                        print_status(f"         ... and {len(partial_files) - 3} more", "WARNING")
                
                if error_files:
                    print_status(f"      ❌ Error/Broken ({len(error_files)}):", "ERROR")
                    for file_path in error_files[:3]:  # Show first 3
                        filename = os.path.basename(file_path)
                        print_status(f"         • {filename}", "ERROR")
                    if len(error_files) > 3:
                        print_status(f"         ... and {len(error_files) - 3} more", "ERROR")
                
                if minimal_files:
                    print_status(f"      🔸 Minimal/Unknown ({len(minimal_files)}):", "WARNING")
                    for file_path in minimal_files[:2]:  # Show first 2
                        filename = os.path.basename(file_path)
                        print_status(f"         • {filename}", "WARNING")
                    if len(minimal_files) > 2:
                        print_status(f"         ... and {len(minimal_files) - 2} more", "WARNING")
                
                # Calculate functionality percentage
                total_files = len(files)
                working_files = len(functional_files) + len(partial_files)
                percentage = (working_files / total_files) * 100 if total_files > 0 else 0
                
                if percentage >= 70:
                    print_status(f"      📊 Functionality: {percentage:.1f}% ({working_files}/{total_files})", "SUCCESS")
                elif percentage >= 40:
                    print_status(f"      📊 Functionality: {percentage:.1f}% ({working_files}/{total_files})", "WARNING")
                else:
                    print_status(f"      📊 Functionality: {percentage:.1f}% ({working_files}/{total_files})", "ERROR")
            
            else:
                print_status(f"\n   ❌ {subcategory}: NO FILES FOUND", "ERROR")
    
    # Infrastructure analysis
    print_status(f"\n📋 INFRASTRUCTURE COMPONENTS:", "INFO")
    infrastructure_categories = ["Infrastructure", "UNKNOWN"]
    
    for category in infrastructure_categories:
        if category in category_counts:
            print_status(f"\n   🔧 {category}:", "INFO")
            for subcategory, files in category_counts[category].items():
                if subcategory:  # Skip empty subcategories
                    working_count = sum(1 for f in files if file_analyses[f]["status"] in ["FUNCTIONAL", "PARTIAL"])
                    total_count = len(files)
                    percentage = (working_count / total_count) * 100 if total_count > 0 else 0
                    
                    color = "SUCCESS" if percentage >= 70 else "WARNING" if percentage >= 40 else "ERROR"
                    print_status(f"      • {subcategory}: {working_count}/{total_count} ({percentage:.1f}%)", color)
    
    # Overall summary
    print_status(f"\n📊 OVERALL FRONTEND SUMMARY:", "INFO")
    print_status("=" * 80, "INFO")
    
    print_status(f"📁 Total Files Analyzed: {len(frontend_files)}", "INFO")
    
    print_status(f"\n📈 FILE STATUS BREAKDOWN:", "INFO")
    for status, count in sorted(status_counts.items()):
        percentage = (count / len(frontend_files)) * 100
        color = "SUCCESS" if status == "FUNCTIONAL" else "WARNING" if status in ["PARTIAL", "MINIMAL"] else "ERROR"
        print_status(f"   {status}: {count} files ({percentage:.1f}%)", color)
    
    # Feature completeness analysis
    print_status(f"\n🎯 FEATURE COMPLETENESS ANALYSIS:", "INFO")
    
    feature_completeness = {}
    for main_category, subcategories in main_functionalities.items():
        feature_completeness[main_category] = {}
        
        for subcategory in subcategories:
            files = category_counts.get(main_category, {}).get(subcategory, [])
            if files:
                working_files = sum(1 for f in files if file_analyses[f]["status"] in ["FUNCTIONAL", "PARTIAL"])
                total_files = len(files)
                percentage = (working_files / total_files) * 100 if total_files > 0 else 0
                feature_completeness[main_category][subcategory] = {
                    "percentage": percentage,
                    "working": working_files,
                    "total": total_files
                }
            else:
                feature_completeness[main_category][subcategory] = {
                    "percentage": 0,
                    "working": 0,
                    "total": 0
                }
    
    for category, features in feature_completeness.items():
        print_status(f"\n   📋 {category}:", "INFO")
        for feature, stats in features.items():
            percentage = stats["percentage"]
            working = stats["working"]
            total = stats["total"]
            
            if total == 0:
                print_status(f"      ❌ {feature}: NO FILES", "ERROR")
            elif percentage >= 70:
                print_status(f"      ✅ {feature}: {percentage:.1f}% ({working}/{total})", "SUCCESS")
            elif percentage >= 40:
                print_status(f"      🔶 {feature}: {percentage:.1f}% ({working}/{total})", "WARNING")
            else:
                print_status(f"      ❌ {feature}: {percentage:.1f}% ({working}/{total})", "ERROR")
    
    # Recommendations
    print_status(f"\n💡 FRONTEND RECOMMENDATIONS:", "INFO")
    print_status("=" * 80, "INFO")
    
    functional_percentage = (status_counts.get("FUNCTIONAL", 0) / len(frontend_files)) * 100
    
    if functional_percentage < 20:
        print_status("🚨 CRITICAL: Most frontend components are broken", "ERROR")
        print_status("📋 Priority Actions:", "ERROR")
        print_status("   1. Fix core infrastructure (App.tsx, Layout, Routing)", "ERROR")
        print_status("   2. Rebuild broken feature components", "ERROR")
        print_status("   3. Connect frontend to working backend", "ERROR")
    elif functional_percentage < 50:
        print_status("⚠️ WARNING: Many frontend components need work", "WARNING")
        print_status("📋 Priority Actions:", "WARNING")
        print_status("   1. Fix the most critical broken features", "WARNING")
        print_status("   2. Complete partially working components", "WARNING")
        print_status("   3. Test frontend-backend integration", "WARNING")
    else:
        print_status("✅ GOOD: Most frontend components are functional", "SUCCESS")
        print_status("📋 Priority Actions:", "SUCCESS")
        print_status("   1. Fix remaining broken components", "SUCCESS")
        print_status("   2. Enhance user experience", "SUCCESS")
        print_status("   3. Optimize performance", "SUCCESS")
    
    # Save detailed analysis
    analysis_report = {
        "summary": {
            "total_files": len(frontend_files),
            "status_counts": status_counts,
            "functional_percentage": functional_percentage,
            "feature_completeness": feature_completeness
        },
        "categories": category_counts,
        "files": {path: {k: v for k, v in analysis.items() if k not in ['functionality_indicators']} 
                 for path, analysis in file_analyses.items()}
    }
    
    with open("frontend_analysis_report.json", "w") as f:
        json.dump(analysis_report, f, indent=2)
    
    print_status(f"\n📄 Detailed analysis saved to: frontend_analysis_report.json", "INFO")
    print_status(f"🏁 COMPREHENSIVE FRONTEND ANALYSIS COMPLETE", "SUCCESS")

if __name__ == "__main__":
    analyze_frontend_codebase()
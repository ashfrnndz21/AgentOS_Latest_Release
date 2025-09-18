#!/usr/bin/env python3
"""
COMPREHENSIVE CODEBASE ANALYSIS
Full search and analysis of the entire repository to identify:
1. Which components are actually functional
2. Which are placeholders/broken
3. What the original working features were
4. Map each feature to its actual implementation
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

def analyze_file_content(file_path: str) -> Dict[str, Any]:
    """Deep analysis of file content to determine functionality level"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return {"status": "UNREADABLE", "reason": "Cannot read file"}
    
    # Analyze different aspects
    analysis = {
        "file_path": file_path,
        "size": len(content),
        "lines": len(content.split('\n')),
        "imports": [],
        "exports": [],
        "functions": [],
        "components": [],
        "hooks": [],
        "api_calls": [],
        "error_indicators": [],
        "placeholder_indicators": [],
        "real_functionality": [],
        "status": "UNKNOWN",
        "confidence": 0,
        "reason": ""
    }
    
    # Extract imports
    import_pattern = r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]'
    analysis["imports"] = re.findall(import_pattern, content)
    
    # Extract exports
    export_pattern = r'export\s+(?:default\s+)?(?:const\s+|function\s+|class\s+)?(\w+)'
    analysis["exports"] = re.findall(export_pattern, content)
    
    # Extract functions/components
    function_patterns = [
        r'function\s+(\w+)',
        r'const\s+(\w+)\s*=.*?=>',
        r'const\s+(\w+):\s*React\.FC',
        r'export\s+const\s+(\w+)\s*='
    ]
    for pattern in function_patterns:
        analysis["functions"].extend(re.findall(pattern, content))
    
    # Extract React components
    component_pattern = r'(?:const|function)\s+([A-Z]\w+).*?(?:React\.FC|JSX\.Element|\(\s*\)\s*=>)'
    analysis["components"] = re.findall(component_pattern, content)
    
    # Extract hooks
    hook_pattern = r'use[A-Z]\w+'
    analysis["hooks"] = list(set(re.findall(hook_pattern, content)))
    
    # Extract API calls
    api_patterns = [
        r'fetch\s*\(',
        r'axios\.',
        r'\.get\s*\(',
        r'\.post\s*\(',
        r'\.put\s*\(',
        r'\.delete\s*\(',
        r'http://\w+',
        r'https://\w+'
    ]
    for pattern in api_patterns:
        if re.search(pattern, content):
            analysis["api_calls"].append(pattern)
    
    # Check for error indicators
    error_indicators = [
        "Component failed to load",
        "Something went wrong",
        "Error loading",
        "Failed to",
        "Unavailable",
        "Not available",
        "Service may not be available",
        "Backend is offline",
        "Connection refused",
        "Cannot connect",
        "Fallback UI",
        "Error boundary"
    ]
    
    for indicator in error_indicators:
        if indicator in content:
            analysis["error_indicators"].append(indicator)
    
    # Check for placeholder indicators
    placeholder_indicators = [
        "TODO", "FIXME", "PLACEHOLDER", "NOT IMPLEMENTED", 
        "COMING SOON", "Under construction", "Work in progress",
        "Mock data", "Placeholder component", "This is a placeholder",
        "// TODO", "/* TODO", "// FIXME", "/* FIXME"
    ]
    
    for indicator in placeholder_indicators:
        if indicator.lower() in content.lower():
            analysis["placeholder_indicators"].append(indicator)
    
    # Check for real functionality indicators
    real_functionality = [
        "useState", "useEffect", "useCallback", "useMemo",
        "onClick", "onSubmit", "onChange", "onLoad",
        "handleSubmit", "handleClick", "handleChange",
        "async", "await", "Promise", "try {", "catch",
        "localStorage", "sessionStorage", "document.",
        "window.", "console.log", "console.error"
    ]
    
    for indicator in real_functionality:
        if indicator in content:
            analysis["real_functionality"].append(indicator)
    
    # Determine status and confidence
    error_count = len(analysis["error_indicators"])
    placeholder_count = len(analysis["placeholder_indicators"])
    functionality_count = len(analysis["real_functionality"])
    
    if error_count > 0:
        analysis["status"] = "ERROR"
        analysis["confidence"] = 90
        analysis["reason"] = f"Contains {error_count} error indicators"
    elif placeholder_count > 3:
        analysis["status"] = "PLACEHOLDER"
        analysis["confidence"] = 80
        analysis["reason"] = f"Contains {placeholder_count} placeholder indicators"
    elif functionality_count >= 8:
        analysis["status"] = "FUNCTIONAL"
        analysis["confidence"] = 85
        analysis["reason"] = f"Has {functionality_count} functionality indicators"
    elif functionality_count >= 4:
        analysis["status"] = "PARTIAL"
        analysis["confidence"] = 70
        analysis["reason"] = f"Has {functionality_count} functionality indicators"
    elif analysis["lines"] < 20:
        analysis["status"] = "MINIMAL"
        analysis["confidence"] = 60
        analysis["reason"] = f"Only {analysis['lines']} lines"
    else:
        analysis["status"] = "UNKNOWN"
        analysis["confidence"] = 30
        analysis["reason"] = "Cannot determine functionality level"
    
    return analysis

def scan_directory(directory: str, extensions: List[str] = None) -> List[str]:
    """Recursively scan directory for files with specific extensions"""
    if extensions is None:
        extensions = ['.tsx', '.ts', '.jsx', '.js', '.py']
    
    files = []
    for root, dirs, filenames in os.walk(directory):
        # Skip node_modules and other irrelevant directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build', '__pycache__']]
        
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions):
                files.append(os.path.join(root, filename))
    
    return files

def analyze_feature_mapping():
    """Map each feature to its actual implementation files"""
    
    feature_mapping = {
        "Dashboard": {
            "route": "/",
            "primary_files": ["src/pages/Index.tsx"],
            "supporting_files": ["src/components/MainContent.tsx"]
        },
        "AgentOS Architecture Blueprint": {
            "route": "/system-flow",
            "primary_files": ["src/components/SystemFlow/AgentOSLogicalFlow.tsx"],
            "supporting_files": []
        },
        "Agent Command Centre": {
            "route": "/agent-command",
            "primary_files": ["src/pages/CommandCentre.tsx"],
            "supporting_files": [
                "src/components/CommandCentre/QuickActions.tsx",
                "src/components/CommandCentre/CreateAgentDialog.tsx",
                "src/components/CommandCentre/ProjectData.tsx"
            ]
        },
        "Document Chat": {
            "route": "/documents",
            "primary_files": ["src/pages/SimpleRealDocumentWorkspace.tsx"],
            "supporting_files": [
                "src/components/Documents/DocumentChat.tsx",
                "src/components/Documents/DocumentUploader.tsx",
                "src/components/Documents/AgentDocumentChat.tsx"
            ]
        },
        "Ollama Agents": {
            "route": "/ollama-agents",
            "primary_files": ["src/pages/OllamaAgentDashboard.tsx"],
            "supporting_files": [
                "src/components/OllamaAgentChat.tsx",
                "src/lib/services/OllamaAgentService.ts",
                "src/hooks/useOllamaModels.ts"
            ]
        },
        "Ollama Terminal": {
            "route": "/ollama-terminal",
            "primary_files": ["src/pages/OllamaTerminal.tsx"],
            "supporting_files": [
                "src/components/SimpleOllamaTerminal.tsx",
                "src/components/Ollama/OllamaTerminal.tsx"
            ]
        },
        "AI Agents": {
            "route": "/agents",
            "primary_files": ["src/pages/Agents.tsx"],
            "supporting_files": [
                "src/components/AgentDashboard/AgentDashboard.tsx",
                "src/components/AgentDashboard/AgentsTable.tsx"
            ]
        },
        "Multi Agent Workspace": {
            "route": "/multi-agent-workspace",
            "primary_files": ["src/pages/MultiAgentWorkspace.tsx"],
            "supporting_files": [
                "src/components/MultiAgentWorkspace/AgentPalette.tsx",
                "src/components/MultiAgentWorkspace/BlankWorkspace.tsx",
                "src/components/MultiAgentWorkspace/PropertiesPanel.tsx"
            ]
        },
        "MCP Gateway": {
            "route": "/mcp-dashboard",
            "primary_files": ["src/pages/MCPDashboard.tsx"],
            "supporting_files": [
                "src/pages/SimpleMCPDashboard.tsx",
                "src/lib/services/MCPGatewayService.ts"
            ]
        },
        "AI Marketplace": {
            "route": "/agent-exchange",
            "primary_files": ["src/components/AgentMarketplace.tsx"],
            "supporting_files": []
        },
        "Risk Analytics": {
            "route": "/risk-analytics",
            "primary_files": ["src/pages/RiskAnalytics.tsx"],
            "supporting_files": []
        },
        "Architecture Design": {
            "route": "/architecture-design",
            "primary_files": ["src/pages/ArchitectureDesign.tsx"],
            "supporting_files": [
                "src/components/ArchitectureDesign/ArchitectureDesignDashboard.tsx",
                "src/components/ArchitectureDesign/InteractiveAgentFlowDiagram.tsx"
            ]
        },
        "Wealth Management": {
            "route": "/wealth-management",
            "primary_files": ["src/pages/WealthManagement.tsx"],
            "supporting_files": []
        },
        "Customer Insights": {
            "route": "/customer-insights",
            "primary_files": ["src/pages/CustomerValueManagement.tsx"],
            "supporting_files": [
                "src/components/CustomerValueManagement/CvmDashboard.tsx"
            ]
        },
        "Customer Analytics": {
            "route": "/customer-analytics",
            "primary_files": ["src/pages/CustomerAnalytics.tsx"],
            "supporting_files": []
        },
        "Agent Control Panel": {
            "route": "/agent-control",
            "primary_files": ["src/pages/AgentControlPanel.tsx"],
            "supporting_files": []
        },
        "System Monitor": {
            "route": "/system-flow",
            "primary_files": ["src/components/SystemFlow/AgentOSLogicalFlow.tsx"],
            "supporting_files": ["src/components/SystemFlow/AgentOSArchitectureDesign.tsx"]
        }
    }
    
    return feature_mapping

def comprehensive_analysis():
    """Perform comprehensive analysis of the entire codebase"""
    
    print_status("🔍 COMPREHENSIVE CODEBASE ANALYSIS", "INFO")
    print_status("=" * 80, "INFO")
    
    # Scan all relevant files
    print_status("\n📁 SCANNING CODEBASE...", "INFO")
    
    frontend_files = scan_directory("src", ['.tsx', '.ts', '.jsx', '.js'])
    backend_files = scan_directory("backend", ['.py'])
    
    all_files = frontend_files + backend_files
    
    print_status(f"   Found {len(frontend_files)} frontend files", "INFO")
    print_status(f"   Found {len(backend_files)} backend files", "INFO")
    print_status(f"   Total: {len(all_files)} files to analyze", "INFO")
    
    # Analyze each file
    print_status("\n🔬 ANALYZING FILE CONTENTS...", "INFO")
    
    file_analyses = {}
    for file_path in all_files:
        analysis = analyze_file_content(file_path)
        file_analyses[file_path] = analysis
    
    # Get feature mapping
    feature_mapping = analyze_feature_mapping()
    
    # Analyze each feature
    print_status("\n🎯 FEATURE-BY-FEATURE ANALYSIS:", "INFO")
    print_status("=" * 80, "INFO")
    
    feature_results = {}
    
    for feature_name, feature_info in feature_mapping.items():
        print_status(f"\n📋 {feature_name} ({feature_info['route']}):", "INFO")
        
        feature_analysis = {
            "route": feature_info["route"],
            "primary_files": [],
            "supporting_files": [],
            "status": "UNKNOWN",
            "confidence": 0,
            "issues": [],
            "working_files": 0,
            "total_files": 0
        }
        
        # Analyze primary files
        for file_path in feature_info["primary_files"]:
            feature_analysis["total_files"] += 1
            if file_path in file_analyses:
                analysis = file_analyses[file_path]
                feature_analysis["primary_files"].append({
                    "path": file_path,
                    "status": analysis["status"],
                    "confidence": analysis["confidence"],
                    "reason": analysis["reason"]
                })
                
                if analysis["status"] in ["FUNCTIONAL", "PARTIAL"]:
                    feature_analysis["working_files"] += 1
                    print_status(f"   ✅ {file_path}: {analysis['status']} - {analysis['reason']}", "SUCCESS")
                elif analysis["status"] == "ERROR":
                    feature_analysis["issues"].append(f"{file_path}: {analysis['reason']}")
                    print_status(f"   ❌ {file_path}: {analysis['status']} - {analysis['reason']}", "ERROR")
                else:
                    print_status(f"   ⚠️ {file_path}: {analysis['status']} - {analysis['reason']}", "WARNING")
            else:
                feature_analysis["issues"].append(f"{file_path}: File not found")
                print_status(f"   ❌ {file_path}: MISSING", "ERROR")
        
        # Analyze supporting files
        for file_path in feature_info["supporting_files"]:
            feature_analysis["total_files"] += 1
            if file_path in file_analyses:
                analysis = file_analyses[file_path]
                feature_analysis["supporting_files"].append({
                    "path": file_path,
                    "status": analysis["status"],
                    "confidence": analysis["confidence"],
                    "reason": analysis["reason"]
                })
                
                if analysis["status"] in ["FUNCTIONAL", "PARTIAL"]:
                    feature_analysis["working_files"] += 1
                    print_status(f"   ✅ {file_path}: {analysis['status']} - {analysis['reason']}", "SUCCESS")
                elif analysis["status"] == "ERROR":
                    feature_analysis["issues"].append(f"{file_path}: {analysis['reason']}")
                    print_status(f"   ❌ {file_path}: {analysis['status']} - {analysis['reason']}", "ERROR")
                else:
                    print_status(f"   🔸 {file_path}: {analysis['status']} - {analysis['reason']}", "WARNING")
            else:
                print_status(f"   🔸 {file_path}: MISSING (supporting)", "WARNING")
        
        # Determine overall feature status
        if feature_analysis["working_files"] == 0:
            feature_analysis["status"] = "BROKEN"
            feature_analysis["confidence"] = 90
        elif feature_analysis["working_files"] == feature_analysis["total_files"]:
            feature_analysis["status"] = "FUNCTIONAL"
            feature_analysis["confidence"] = 85
        elif feature_analysis["working_files"] >= feature_analysis["total_files"] * 0.7:
            feature_analysis["status"] = "MOSTLY_WORKING"
            feature_analysis["confidence"] = 75
        else:
            feature_analysis["status"] = "PARTIALLY_WORKING"
            feature_analysis["confidence"] = 60
        
        feature_results[feature_name] = feature_analysis
    
    # Overall summary
    print_status("\n📊 OVERALL CODEBASE SUMMARY:", "INFO")
    print_status("=" * 80, "INFO")
    
    # Count file statuses
    status_counts = {}
    for analysis in file_analyses.values():
        status = analysis["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    print_status(f"\n📁 FILE STATUS BREAKDOWN:", "INFO")
    for status, count in sorted(status_counts.items()):
        percentage = (count / len(file_analyses)) * 100
        color = "SUCCESS" if status == "FUNCTIONAL" else "WARNING" if status in ["PARTIAL", "MINIMAL"] else "ERROR"
        print_status(f"   {status}: {count} files ({percentage:.1f}%)", color)
    
    # Count feature statuses
    feature_status_counts = {}
    for feature_analysis in feature_results.values():
        status = feature_analysis["status"]
        feature_status_counts[status] = feature_status_counts.get(status, 0) + 1
    
    print_status(f"\n🎯 FEATURE STATUS BREAKDOWN:", "INFO")
    for status, count in sorted(feature_status_counts.items()):
        percentage = (count / len(feature_results)) * 100
        color = "SUCCESS" if status == "FUNCTIONAL" else "WARNING" if "WORKING" in status else "ERROR"
        print_status(f"   {status}: {count} features ({percentage:.1f}%)", color)
    
    # Identify what's actually working
    print_status(f"\n✅ ACTUALLY WORKING FEATURES:", "SUCCESS")
    working_features = [name for name, analysis in feature_results.items() 
                      if analysis["status"] in ["FUNCTIONAL", "MOSTLY_WORKING"]]
    
    if working_features:
        for feature in working_features:
            print_status(f"   ✅ {feature} - {feature_results[feature]['route']}", "SUCCESS")
    else:
        print_status("   ❌ NO FEATURES ARE FULLY WORKING", "ERROR")
    
    # Identify what's broken
    print_status(f"\n❌ BROKEN/PROBLEMATIC FEATURES:", "ERROR")
    broken_features = [name for name, analysis in feature_results.items() 
                      if analysis["status"] in ["BROKEN", "PARTIALLY_WORKING"]]
    
    for feature in broken_features:
        print_status(f"   ❌ {feature} - {feature_results[feature]['route']}", "ERROR")
        for issue in feature_results[feature]["issues"][:3]:  # Show first 3 issues
            print_status(f"      • {issue}", "ERROR")
    
    # Recommendations
    print_status(f"\n💡 RECOMMENDATIONS:", "INFO")
    print_status("=" * 80, "INFO")
    
    functional_percentage = (feature_status_counts.get("FUNCTIONAL", 0) / len(feature_results)) * 100
    
    if functional_percentage < 30:
        print_status("🚨 CRITICAL: Most features are broken - need complete rebuild", "ERROR")
        print_status("📋 Priority Actions:", "ERROR")
        print_status("   1. Start with basic Dashboard and Navigation", "ERROR")
        print_status("   2. Fix core routing and layout issues", "ERROR")
        print_status("   3. Rebuild broken components from scratch", "ERROR")
        print_status("   4. Focus on one feature at a time", "ERROR")
    elif functional_percentage < 60:
        print_status("⚠️ WARNING: Many features need fixing", "WARNING")
        print_status("📋 Priority Actions:", "WARNING")
        print_status("   1. Fix the most critical broken features first", "WARNING")
        print_status("   2. Complete partially working features", "WARNING")
        print_status("   3. Test each feature thoroughly", "WARNING")
    else:
        print_status("✅ GOOD: Most features are working", "SUCCESS")
        print_status("📋 Priority Actions:", "SUCCESS")
        print_status("   1. Fix remaining broken features", "SUCCESS")
        print_status("   2. Enhance partially working features", "SUCCESS")
        print_status("   3. Add missing functionality", "SUCCESS")
    
    # Save detailed analysis
    analysis_report = {
        "summary": {
            "total_files": len(file_analyses),
            "total_features": len(feature_results),
            "file_status_counts": status_counts,
            "feature_status_counts": feature_status_counts,
            "functional_percentage": functional_percentage
        },
        "features": feature_results,
        "files": {path: {k: v for k, v in analysis.items() if k not in ['real_functionality', 'placeholder_indicators', 'error_indicators']} 
                 for path, analysis in file_analyses.items()}
    }
    
    with open("codebase_analysis_report.json", "w") as f:
        json.dump(analysis_report, f, indent=2)
    
    print_status(f"\n📄 Detailed analysis saved to: codebase_analysis_report.json", "INFO")
    print_status(f"🏁 COMPREHENSIVE ANALYSIS COMPLETE", "SUCCESS")

if __name__ == "__main__":
    comprehensive_analysis()
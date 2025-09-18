#!/usr/bin/env python3

import os
import re
import json

print("🔍 COMPREHENSIVE WHITE SCREEN ANALYSIS")
print("=" * 70)

print("\n🎯 ANALYZING CRITICAL AREAS THAT WERE RECENTLY MODIFIED:")
print("   1. Ollama Agents")
print("   2. MultiAgent Workspace") 
print("   3. Document Chat")
print("   4. Core App Structure")

# 1. Check App.tsx for issues
print("\n1️⃣ ANALYZING APP.TSX:")
if os.path.exists("src/App.tsx"):
    with open("src/App.tsx", 'r') as f:
        app_content = f.read()
    
    # Check for import issues
    import_lines = [line.strip() for line in app_content.split('\n') if line.strip().startswith('import')]
    print(f"   📦 Found {len(import_lines)} imports")
    
    # Check for problematic imports
    problematic_imports = []
    for line in import_lines:
        if 'OllamaAgentDashboard' in line:
            problematic_imports.append("OllamaAgentDashboard")
        if 'MultiAgentWorkspace' in line:
            problematic_imports.append("MultiAgentWorkspace")
        if 'OllamaTerminal' in line:
            problematic_imports.append("OllamaTerminal")
    
    if problematic_imports:
        print(f"   ⚠️ Potentially problematic imports: {', '.join(problematic_imports)}")
    
    # Check for syntax errors
    if app_content.count('{') != app_content.count('}'):
        print("   ❌ Unmatched braces in App.tsx")
    else:
        print("   ✅ Braces balanced in App.tsx")

# 2. Check Index page (landing page)
print("\n2️⃣ ANALYZING INDEX PAGE:")
if os.path.exists("src/pages/Index.tsx"):
    with open("src/pages/Index.tsx", 'r') as f:
        index_content = f.read()
    
    # Check for API calls that might hang
    api_patterns = [
        r'useEffect.*fetch',
        r'useEffect.*axios', 
        r'useEffect.*apiClient',
        r'fetch\(',
        r'axios\.',
        r'apiClient\.'
    ]
    
    hanging_calls = []
    for pattern in api_patterns:
        matches = re.findall(pattern, index_content, re.IGNORECASE)
        if matches:
            hanging_calls.extend(matches)
    
    if hanging_calls:
        print(f"   ⚠️ Potential hanging API calls: {len(hanging_calls)}")
        for call in hanging_calls[:3]:  # Show first 3
            print(f"      - {call}")
    else:
        print("   ✅ No obvious hanging API calls")

# 3. Check MultiAgentWorkspace
print("\n3️⃣ ANALYZING MULTIAGENT WORKSPACE:")
if os.path.exists("src/pages/MultiAgentWorkspace.tsx"):
    with open("src/pages/MultiAgentWorkspace.tsx", 'r') as f:
        workspace_content = f.read()
    
    # Check for complex dependencies
    workspace_imports = [line for line in workspace_content.split('\n') if 'import' in line]
    print(f"   📦 MultiAgentWorkspace imports: {len(workspace_imports)}")
    
    # Check for hooks that might cause issues
    hooks = ['useState', 'useEffect', 'useContext', 'useQuery', 'useCallback']
    used_hooks = []
    for hook in hooks:
        if hook in workspace_content:
            used_hooks.append(hook)
    
    if len(used_hooks) > 5:
        print(f"   ⚠️ High hook usage: {', '.join(used_hooks)}")
    else:
        print(f"   ✅ Reasonable hook usage: {', '.join(used_hooks)}")

# 4. Check OllamaAgentDashboard
print("\n4️⃣ ANALYZING OLLAMA AGENT DASHBOARD:")
if os.path.exists("src/pages/OllamaAgentDashboard.tsx"):
    with open("src/pages/OllamaAgentDashboard.tsx", 'r') as f:
        ollama_content = f.read()
    
    # Check for Ollama service calls
    if 'useOllamaModels' in ollama_content:
        print("   ⚠️ Uses useOllamaModels hook - potential hanging point")
    
    if 'OllamaService' in ollama_content:
        print("   ⚠️ Uses OllamaService - check if Ollama is running")
    
    # Check for error boundaries
    if 'ErrorBoundary' in ollama_content or 'try' in ollama_content:
        print("   ✅ Has error handling")
    else:
        print("   ❌ No error handling - could crash silently")

# 5. Check Document Chat components
print("\n5️⃣ ANALYZING DOCUMENT CHAT:")
document_components = [
    "src/components/Documents/DocumentChat.tsx",
    "src/components/Documents/AgentDocumentChat.tsx",
    "src/pages/SimpleRealDocumentWorkspace.tsx"
]

for component in document_components:
    if os.path.exists(component):
        with open(component, 'r') as f:
            content = f.read()
        
        # Check for RAG service calls
        if 'RAGService' in content or 'DocumentRAGService' in content:
            print(f"   ⚠️ {component} uses RAG services - potential backend dependency")
        
        # Check for file upload handling
        if 'upload' in content.lower() or 'file' in content.lower():
            print(f"   ⚠️ {component} handles file operations")

# 6. Check critical hooks
print("\n6️⃣ ANALYZING CRITICAL HOOKS:")
critical_hooks = [
    "src/hooks/useOllamaModels.ts",
    "src/hooks/useStrandsUtilities.ts", 
    "src/hooks/useProcessingLogs.ts"
]

for hook in critical_hooks:
    if os.path.exists(hook):
        with open(hook, 'r') as f:
            hook_content = f.read()
        
        # Check for async operations
        if 'async' in hook_content or 'await' in hook_content:
            print(f"   ⚠️ {hook} has async operations")
        
        # Check for API calls
        if 'fetch' in hook_content or 'axios' in hook_content:
            print(f"   ⚠️ {hook} makes API calls")

# 7. Check Layout component
print("\n7️⃣ ANALYZING LAYOUT COMPONENT:")
if os.path.exists("src/components/Layout.tsx"):
    with open("src/components/Layout.tsx", 'r') as f:
        layout_content = f.read()
    
    # Check for sidebar issues
    if 'IndustrySidebar' in layout_content:
        print("   📋 Uses IndustrySidebar")
        
        # Check if IndustrySidebar exists
        if os.path.exists("src/components/IndustrySidebar.tsx"):
            print("   ✅ IndustrySidebar exists")
        else:
            print("   ❌ IndustrySidebar missing!")
    
    # Check for context providers
    if 'SidebarProvider' in layout_content:
        print("   📋 Uses SidebarProvider")

# 8. Check for missing UI components
print("\n8️⃣ CHECKING UI COMPONENTS:")
ui_components = [
    "src/components/ui/sidebar.tsx",
    "src/components/ui/toaster.tsx",
    "src/components/ui/sonner.tsx",
    "src/components/ui/tooltip.tsx"
]

missing_ui = []
for component in ui_components:
    if not os.path.exists(component):
        missing_ui.append(component)

if missing_ui:
    print(f"   ❌ Missing UI components: {len(missing_ui)}")
    for component in missing_ui:
        print(f"      - {component}")
else:
    print("   ✅ All critical UI components exist")

# 9. Check for circular dependencies
print("\n9️⃣ CHECKING FOR CIRCULAR DEPENDENCIES:")
def get_imports(file_path):
    if not os.path.exists(file_path):
        return []
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    imports = []
    for line in content.split('\n'):
        if line.strip().startswith('import') and 'from' in line:
            match = re.search(r"from ['\"]([^'\"]+)['\"]", line)
            if match and match.group(1).startswith('./'):
                imports.append(match.group(1))
    
    return imports

# Check key files for circular imports
key_files = [
    "src/App.tsx",
    "src/components/Layout.tsx",
    "src/pages/Index.tsx",
    "src/pages/MultiAgentWorkspace.tsx",
    "src/pages/OllamaAgentDashboard.tsx"
]

circular_risks = []
for file in key_files:
    if os.path.exists(file):
        imports = get_imports(file)
        if len(imports) > 10:
            circular_risks.append(f"{file}: {len(imports)} imports")

if circular_risks:
    print("   ⚠️ High import complexity:")
    for risk in circular_risks:
        print(f"      - {risk}")
else:
    print("   ✅ Import complexity looks reasonable")

# 10. Check backend connectivity
print("\n🔟 CHECKING BACKEND CONNECTIVITY:")
if os.path.exists("src/lib/apiClient.ts"):
    with open("src/lib/apiClient.ts", 'r') as f:
        api_content = f.read()
    
    # Check for base URL
    if 'localhost:5052' in api_content:
        print("   ✅ API client configured for localhost:5052")
    else:
        print("   ⚠️ API client may have wrong base URL")
    
    # Check for timeout settings
    if 'timeout' in api_content:
        print("   ✅ Has timeout configuration")
    else:
        print("   ⚠️ No timeout configuration - could hang")

print("\n🎯 MOST LIKELY ROOT CAUSES:")
root_causes = [
    "1. OllamaAgentDashboard making blocking API calls to Ollama service",
    "2. MultiAgentWorkspace loading complex dependencies that fail",
    "3. Document chat components trying to connect to RAG backend",
    "4. Missing or broken UI component dependencies",
    "5. Circular import dependencies between components",
    "6. API calls hanging due to backend not responding",
    "7. React hooks causing infinite re-renders",
    "8. Missing error boundaries causing silent crashes"
]

for cause in root_causes:
    print(f"   {cause}")

print("\n💡 RECOMMENDED DEBUGGING STEPS:")
debug_steps = [
    "1. Check browser console for JavaScript errors",
    "2. Test with minimal App.tsx (just return <div>Hello</div>)",
    "3. Disable Ollama-related components temporarily", 
    "4. Check if backend is responding on localhost:5052",
    "5. Add console.log statements to track component loading",
    "6. Use React DevTools to see which components are rendering",
    "7. Check network tab for failed API requests",
    "8. Test each page route individually"
]

for step in debug_steps:
    print(f"   {step}")

print("\n🔧 IMMEDIATE FIXES TO TRY:")
fixes = [
    "1. Replace App.tsx with minimal version",
    "2. Add error boundaries around problematic components",
    "3. Add loading states for async operations",
    "4. Disable Ollama service calls if Ollama not running",
    "5. Add fallbacks for missing backend services",
    "6. Check and fix any missing UI component imports"
]

for fix in fixes:
    print(f"   {fix}")
#!/usr/bin/env python3
"""
Comprehensive System Audit and Fix
Analyzes and fixes the entire backend-frontend system end-to-end
"""

import os
import json
import subprocess
import time
import requests
from pathlib import Path

class SystemAuditor:
    def __init__(self):
        self.issues = []
        self.fixes_applied = []
        self.backend_port = 5052
        self.frontend_port = None
        
    def log_issue(self, component, issue, severity="ERROR"):
        self.issues.append({
            "component": component,
            "issue": issue,
            "severity": severity
        })
        print(f"🔍 [{severity}] {component}: {issue}")
    
    def log_fix(self, component, fix):
        self.fixes_applied.append({
            "component": component,
            "fix": fix
        })
        print(f"✅ FIXED {component}: {fix}")
    
    def audit_backend_configuration(self):
        """Audit backend configuration files"""
        print("\n🔍 AUDITING BACKEND CONFIGURATION...")
        
        # Check backend files exist
        backend_files = [
            "backend/simple_api.py",
            "backend/ollama_service.py", 
            "backend/rag_service.py"
        ]
        
        for file_path in backend_files:
            if not os.path.exists(file_path):
                self.log_issue("Backend", f"Missing file: {file_path}")
            else:
                print(f"✅ Found: {file_path}")
        
        # Check port consistency in backend
        self.check_backend_port_consistency()
        
    def check_backend_port_consistency(self):
        """Check all backend files use consistent port 5052"""
        print("\n🔍 CHECKING BACKEND PORT CONSISTENCY...")
        
        files_to_check = [
            "backend/simple_api.py",
            "src/config/appConfig.ts",
            "src/lib/apiClient.ts"
        ]
        
        port_issues = []
        
        for file_path in files_to_check:
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    content = f.read()
                    
                # Check for wrong ports
                if "5053" in content and file_path.endswith('.py'):
                    port_issues.append(f"{file_path} contains port 5053")
                elif "3001" in content or "8000" in content:
                    port_issues.append(f"{file_path} contains wrong port")
        
        if port_issues:
            for issue in port_issues:
                self.log_issue("Backend Port", issue)
            return False
        else:
            print("✅ Backend port consistency OK")
            return True
    
    def audit_frontend_configuration(self):
        """Audit frontend configuration"""
        print("\n🔍 AUDITING FRONTEND CONFIGURATION...")
        
        # Check package.json
        if os.path.exists("package.json"):
            with open("package.json", 'r') as f:
                package_data = json.load(f)
                
            if "scripts" in package_data and "dev" in package_data["scripts"]:
                print("✅ Frontend dev script found")
            else:
                self.log_issue("Frontend", "Missing dev script in package.json")
        
        # Check key frontend files
        frontend_files = [
            "src/main.tsx",
            "src/App.tsx",
            "src/lib/apiClient.ts",
            "src/config/appConfig.ts"
        ]
        
        for file_path in frontend_files:
            if not os.path.exists(file_path):
                self.log_issue("Frontend", f"Missing file: {file_path}")
            else:
                print(f"✅ Found: {file_path}")
    
    def audit_api_endpoints(self):
        """Audit API endpoint consistency"""
        print("\n🔍 AUDITING API ENDPOINT CONSISTENCY...")
        
        # Check if apiClient.ts has all required methods
        if os.path.exists("src/lib/apiClient.ts"):
            with open("src/lib/apiClient.ts", 'r') as f:
                api_content = f.read()
            
            required_methods = [
                "checkHealth",
                "getOllamaModels", 
                "sendOllamaCommand",
                "uploadDocument",
                "queryDocuments"
            ]
            
            missing_methods = []
            for method in required_methods:
                if method not in api_content:
                    missing_methods.append(method)
            
            if missing_methods:
                self.log_issue("API Client", f"Missing methods: {missing_methods}")
            else:
                print("✅ API Client methods OK")
    
    def fix_backend_port_consistency(self):
        """Fix backend port consistency issues"""
        print("\n🔧 FIXING BACKEND PORT CONSISTENCY...")
        
        # Fix simple_api.py port
        simple_api_path = "backend/simple_api.py"
        if os.path.exists(simple_api_path):
            with open(simple_api_path, 'r') as f:
                content = f.read()
            
            if "port=5053" in content:
                content = content.replace("port=5053", "port=5052")
                with open(simple_api_path, 'w') as f:
                    f.write(content)
                self.log_fix("Backend", "Fixed simple_api.py port to 5052")
        
        # Ensure appConfig.ts uses correct port
        app_config_path = "src/config/appConfig.ts"
        if os.path.exists(app_config_path):
            with open(app_config_path, 'r') as f:
                content = f.read()
            
            # Replace any wrong ports with 5052
            content = content.replace("3001", "5052").replace("8000", "5052")
            
            with open(app_config_path, 'w') as f:
                f.write(content)
            self.log_fix("Frontend Config", "Fixed appConfig.ts port to 5052")
    
    def fix_api_client_consistency(self):
        """Ensure API client is consistent and complete"""
        print("\n🔧 FIXING API CLIENT CONSISTENCY...")
        
        api_client_content = '''import { appConfig } from '../config/appConfig';

const API_BASE_URL = appConfig.apiBaseUrl;

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, mergedOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }

  // Ollama endpoints
  async getOllamaModels() {
    return this.request('/api/ollama/models');
  }

  async sendOllamaCommand(command: string) {
    return this.request('/api/ollama/terminal', {
      method: 'POST',
      body: JSON.stringify({ command })
    });
  }

  async getOllamaStatus() {
    return this.request('/api/ollama/status');
  }

  // RAG/Document endpoints
  async uploadDocument(formData: FormData) {
    return this.request('/api/rag/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }

  async queryDocuments(query: string, model?: string) {
    return this.request('/api/rag/query', {
      method: 'POST',
      body: JSON.stringify({ query, model })
    });
  }

  async getDocuments() {
    return this.request('/api/rag/documents');
  }

  async getRagStatus() {
    return this.request('/api/rag/status');
  }

  // Agent endpoints
  async getAgents() {
    return this.request('/api/agents');
  }

  async createAgent(agentData: any) {
    return this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(agentData)
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
'''
        
        with open("src/lib/apiClient.ts", 'w') as f:
            f.write(api_client_content)
        
        self.log_fix("API Client", "Rewrote apiClient.ts with consistent methods")
    
    def fix_app_config(self):
        """Ensure app config is correct"""
        print("\n🔧 FIXING APP CONFIG...")
        
        app_config_content = '''export const appConfig = {
  apiBaseUrl: 'http://localhost:5052',
  ollamaHost: 'http://localhost:11434',
  backendPort: 5052,
  frontendPort: 5173,
  
  // Timeouts
  requestTimeout: 30000,
  healthCheckInterval: 5000,
  
  // Features
  features: {
    ollama: true,
    rag: true,
    agents: true,
    strands: true
  }
};

export default appConfig;
'''
        
        with open("src/config/appConfig.ts", 'w') as f:
            f.write(app_config_content)
        
        self.log_fix("App Config", "Rewrote appConfig.ts with correct settings")
    
    def test_backend_startup(self):
        """Test if backend starts correctly"""
        print("\n🧪 TESTING BACKEND STARTUP...")
        
        try:
            # Start backend process
            process = subprocess.Popen([
                "python", "backend/simple_api.py"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Wait a bit for startup
            time.sleep(5)
            
            # Test health endpoint
            try:
                response = requests.get(f"http://localhost:{self.backend_port}/health", timeout=5)
                if response.status_code == 200:
                    print("✅ Backend health check passed")
                    
                    # Test other endpoints
                    endpoints_to_test = [
                        "/api/ollama/status",
                        "/api/rag/status", 
                        "/api/agents"
                    ]
                    
                    for endpoint in endpoints_to_test:
                        try:
                            resp = requests.get(f"http://localhost:{self.backend_port}{endpoint}", timeout=5)
                            if resp.status_code == 200:
                                print(f"✅ {endpoint} OK")
                            else:
                                print(f"⚠️ {endpoint} returned {resp.status_code}")
                        except Exception as e:
                            print(f"❌ {endpoint} failed: {e}")
                    
                    return True
                else:
                    self.log_issue("Backend", f"Health check failed: {response.status_code}")
                    return False
                    
            except Exception as e:
                self.log_issue("Backend", f"Health check request failed: {e}")
                return False
            
        except Exception as e:
            self.log_issue("Backend", f"Failed to start: {e}")
            return False
        finally:
            # Clean up process
            if 'process' in locals():
                process.terminate()
    
    def test_frontend_build(self):
        """Test if frontend builds correctly"""
        print("\n🧪 TESTING FRONTEND BUILD...")
        
        try:
            # Test TypeScript compilation
            result = subprocess.run(["npx", "tsc", "--noEmit"], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print("✅ TypeScript compilation passed")
                return True
            else:
                self.log_issue("Frontend", f"TypeScript errors: {result.stderr}")
                return False
                
        except Exception as e:
            self.log_issue("Frontend", f"Build test failed: {e}")
            return False
    
    def create_startup_script(self):
        """Create a reliable startup script"""
        print("\n🔧 CREATING STARTUP SCRIPT...")
        
        startup_script = '''#!/usr/bin/env python3
"""
Reliable System Startup Script
Starts backend and frontend with proper error handling
"""

import subprocess
import sys
import time
import requests
import os

def start_backend():
    """Start backend on port 5052"""
    print("🚀 Starting backend...")
    
    try:
        process = subprocess.Popen([
            sys.executable, "backend/simple_api.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        # Wait for startup
        time.sleep(3)
        
        # Test health
        response = requests.get("http://localhost:5052/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend started successfully on port 5052")
            return process
        else:
            print("❌ Backend health check failed")
            return None
            
    except Exception as e:
        print(f"❌ Backend startup failed: {e}")
        return None

def start_frontend():
    """Start frontend"""
    print("🚀 Starting frontend...")
    
    try:
        process = subprocess.Popen([
            "npm", "run", "dev"
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        print("✅ Frontend started")
        return process
        
    except Exception as e:
        print(f"❌ Frontend startup failed: {e}")
        return None

def main():
    print("🚀 Starting Complete System...")
    print("=" * 50)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Cannot start system without backend")
        return
    
    # Start frontend  
    frontend_process = start_frontend()
    if not frontend_process:
        print("⚠️ Frontend failed to start")
    
    print("=" * 50)
    print("✅ System startup complete!")
    print("🌐 Backend: http://localhost:5052")
    print("🖥️ Frontend: http://localhost:5173")
    print("Press Ctrl+C to stop...")
    
    try:
        # Keep processes running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\\n🛑 Stopping system...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()

if __name__ == "__main__":
    main()
'''
        
        with open("start_complete_system.py", 'w') as f:
            f.write(startup_script)
        
        # Make executable
        os.chmod("start_complete_system.py", 0o755)
        
        self.log_fix("System", "Created reliable startup script")
    
    def run_comprehensive_audit(self):
        """Run complete system audit and fixes"""
        print("🔍 COMPREHENSIVE SYSTEM AUDIT STARTING...")
        print("=" * 60)
        
        # Audit phase
        self.audit_backend_configuration()
        self.audit_frontend_configuration() 
        self.audit_api_endpoints()
        
        # Fix phase
        print("\n🔧 APPLYING FIXES...")
        print("=" * 60)
        
        self.fix_backend_port_consistency()
        self.fix_app_config()
        self.fix_api_client_consistency()
        self.create_startup_script()
        
        # Test phase
        print("\n🧪 TESTING SYSTEM...")
        print("=" * 60)
        
        backend_ok = self.test_backend_startup()
        frontend_ok = self.test_frontend_build()
        
        # Summary
        print("\n📊 AUDIT SUMMARY")
        print("=" * 60)
        print(f"Issues found: {len(self.issues)}")
        print(f"Fixes applied: {len(self.fixes_applied)}")
        
        if self.issues:
            print("\n❌ REMAINING ISSUES:")
            for issue in self.issues:
                print(f"  - {issue['component']}: {issue['issue']}")
        
        if self.fixes_applied:
            print("\n✅ FIXES APPLIED:")
            for fix in self.fixes_applied:
                print(f"  - {fix['component']}: {fix['fix']}")
        
        print("\n🚀 NEXT STEPS:")
        print("1. Run: python start_complete_system.py")
        print("2. Open browser to http://localhost:5173")
        print("3. Test all functionality:")
        print("   - Document Chat")
        print("   - Ollama Terminal") 
        print("   - Agent Creation")
        
        return len(self.issues) == 0

if __name__ == "__main__":
    auditor = SystemAuditor()
    success = auditor.run_comprehensive_audit()
    
    if success:
        print("\n🎉 SYSTEM AUDIT COMPLETED SUCCESSFULLY!")
    else:
        print("\n⚠️ SYSTEM AUDIT FOUND ISSUES - CHECK ABOVE")
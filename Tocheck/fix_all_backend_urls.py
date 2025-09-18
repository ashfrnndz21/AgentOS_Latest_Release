#!/usr/bin/env python3
"""
Fix All Backend URLs - Complete Solution
Updates all hardcoded backend URLs to use port 5052 consistently
"""

import os
import re
from pathlib import Path

def fix_file_urls(file_path, replacements):
    """Fix URLs in a specific file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = False
        
        for old_url, new_url in replacements:
            if old_url in content:
                content = content.replace(old_url, new_url)
                changes_made = True
                print(f"✅ {file_path}: {old_url} → {new_url}")
        
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

def fix_all_backend_urls():
    """Fix all hardcoded backend URLs"""
    print("🔧 Fixing all backend URLs to use port 5052...")
    
    # URL replacements
    replacements = [
        ('http://localhost:5002', 'http://localhost:5052'),
        ('http://localhost:5001', 'http://localhost:5052'),
        ('http://localhost:8000', 'http://localhost:5052'),
        ("'http://localhost:5002'", "'http://localhost:5052'"),
        ('"http://localhost:5002"', '"http://localhost:5052"'),
        ("'http://localhost:5001'", "'http://localhost:5052'"),
        ('"http://localhost:5001"', '"http://localhost:5052"'),
        ("'http://localhost:8000'", "'http://localhost:5052'"),
        ('"http://localhost:8000"', '"http://localhost:5052"'),
    ]
    
    # Files to fix
    files_to_fix = [
        'src/lib/services/OllamaAgentService.ts',
        'src/hooks/useProcessingLogs.ts',
        'src/components/CommandCentre/CreateAgent/hooks/useAgentForm.ts',
        'src/lib/services/DocumentRAGService.ts',
        'src/lib/services/OllamaService.ts',
        'src/lib/apiClient.ts',
        'src/components/ConnectionManager.tsx',
        'src/components/ConnectionStatus.tsx',
        'src/components/BackendControl.tsx'
    ]
    
    for file_path in files_to_fix:
        if os.path.exists(file_path):
            fix_file_urls(file_path, replacements)
        else:
            print(f"⚠️ File not found: {file_path}")

def create_centralized_api_client():
    """Create a centralized API client that uses the app config"""
    print("🔧 Creating centralized API client...")
    
    api_client_content = '''/**
 * Centralized API Client
 * Uses the app configuration for all backend calls
 */

import { getBackendUrl } from '@/config/appConfig';

export class ApiClient {
  private static instance: ApiClient;
  
  private constructor() {}
  
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  
  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    return fetch(getBackendUrl(endpoint), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
  }
  
  async post(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return fetch(getBackendUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }
  
  async put(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return fetch(getBackendUrl(endpoint), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }
  
  async delete(endpoint: string, options?: RequestInit): Promise<Response> {
    return fetch(getBackendUrl(endpoint), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
  }
  
  // Convenience methods for common endpoints
  async healthCheck(): Promise<{ status: string; port: number }> {
    const response = await this.get('/health');
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  }
  
  async getAgents(): Promise<any[]> {
    const response = await this.get('/agents');
    if (!response.ok) {
      throw new Error(`Failed to get agents: ${response.status}`);
    }
    const data = await response.json();
    return data.agents || [];
  }
  
  async createAgent(agentData: any): Promise<any> {
    const response = await this.post('/agents', agentData);
    if (!response.ok) {
      throw new Error(`Failed to create agent: ${response.status}`);
    }
    return response.json();
  }
  
  async getOllamaModels(): Promise<string[]> {
    const response = await this.get('/ollama/models');
    if (!response.ok) {
      throw new Error(`Failed to get models: ${response.status}`);
    }
    const data = await response.json();
    return data.models || [];
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Convenience exports
export const healthCheck = () => apiClient.healthCheck();
export const getAgents = () => apiClient.getAgents();
export const createAgent = (data: any) => apiClient.createAgent(data);
export const getOllamaModels = () => apiClient.getOllamaModels();
'''
    
    with open('src/lib/apiClient.ts', 'w') as f:
        f.write(api_client_content)
    
    print("✅ Centralized API client created")

def start_backend_properly():
    """Start the backend on the correct port"""
    print("🚀 Starting backend on port 5052...")
    
    import subprocess
    import sys
    import time
    
    # Kill any existing processes
    try:
        subprocess.run(['pkill', '-f', 'simple_api'], capture_output=True)
        subprocess.run(['pkill', '-f', 'uvicorn'], capture_output=True)
        time.sleep(2)
    except:
        pass
    
    # Start backend
    try:
        backend_path = Path("backend")
        if backend_path.exists() and (backend_path / "simple_api.py").exists():
            cmd = [
                sys.executable, '-m', 'uvicorn',
                'simple_api:app',
                '--host', '0.0.0.0',
                '--port', '5052',
                '--reload'
            ]
            
            print(f"🔧 Starting: {' '.join(cmd)}")
            
            process = subprocess.Popen(
                cmd,
                cwd=backend_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )
            
            # Wait a bit for startup
            time.sleep(3)
            
            if process.poll() is None:
                print("✅ Backend started successfully on port 5052")
                return process
            else:
                print("❌ Backend failed to start")
                return None
        else:
            print("❌ Backend directory or simple_api.py not found")
            return None
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def test_connections():
    """Test all connections"""
    print("🔍 Testing connections...")
    
    import requests
    import time
    
    # Wait for backend to be ready
    time.sleep(2)
    
    endpoints = [
        '/health',
        '/status',
        '/agents',
        '/ollama/models'
    ]
    
    base_url = 'http://localhost:5052'
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint}: OK")
            else:
                print(f"⚠️ {endpoint}: Status {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")

def main():
    """Main function"""
    print("🚀 Complete Backend URL Fix")
    print("=" * 50)
    
    # Step 1: Fix all hardcoded URLs
    fix_all_backend_urls()
    
    # Step 2: Create centralized API client
    create_centralized_api_client()
    
    # Step 3: Start backend
    process = start_backend_properly()
    
    # Step 4: Test connections
    if process:
        test_connections()
        
        print("\n✅ Backend URL fix completed!")
        print("🌐 All services now use port 5052")
        print("📱 Frontend should connect properly")
        print("🔗 Backend running at: http://localhost:5052")
        
        # Keep backend running
        try:
            print("\n🔍 Backend is running. Press Ctrl+C to stop...")
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping backend...")
            process.terminate()
            process.wait()
            print("✅ Backend stopped")
    else:
        print("\n❌ Backend failed to start")
        return False
    
    return True

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
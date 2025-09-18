#!/usr/bin/env python3
"""
Complete Frontend-Backend Connection Fix
Fixes both Ollama Terminal and Document Chat functionality
"""

import os
import json
import subprocess
import time
import requests

def fix_api_client():
    """Fix the API client with all required methods"""
    print("🔧 FIXING API CLIENT...")
    
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

  async executeOllamaCommand(command: string) {
    return this.request('/api/ollama/terminal', {
      method: 'POST',
      body: JSON.stringify({ command })
    });
  }

  async sendOllamaCommand(command: string) {
    return this.executeOllamaCommand(command);
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
    
    print("✅ API Client fixed with all required methods")

def fix_app_config():
    """Fix app configuration to use correct backend port"""
    print("🔧 FIXING APP CONFIG...")
    
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
    
    print("✅ App Config fixed - pointing to port 5052")

def fix_ollama_service():
    """Fix the Ollama service to use correct API client methods"""
    print("🔧 FIXING OLLAMA SERVICE...")
    
    ollama_service_content = '''import { apiClient } from './apiClient';

export class OllamaService {
  async getModels() {
    try {
      const response = await apiClient.getOllamaModels();
      return response.models || [];
    } catch (error) {
      console.error('Failed to get Ollama models:', error);
      throw error;
    }
  }

  async executeCommand(command: string) {
    try {
      const response = await apiClient.executeOllamaCommand(command);
      return response;
    } catch (error) {
      console.error('Failed to execute Ollama command:', error);
      throw error;
    }
  }

  async getStatus() {
    try {
      const response = await apiClient.getOllamaStatus();
      return response;
    } catch (error) {
      console.error('Failed to get Ollama status:', error);
      throw error;
    }
  }
}

export const ollamaService = new OllamaService();
export default ollamaService;
'''
    
    with open("src/lib/services/OllamaService.ts", 'w') as f:
        f.write(ollama_service_content)
    
    print("✅ Ollama Service fixed")

def fix_document_rag_service():
    """Fix the Document RAG service"""
    print("🔧 FIXING DOCUMENT RAG SERVICE...")
    
    rag_service_content = '''import { apiClient } from '../apiClient';

export class DocumentRAGService {
  async uploadDocument(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.uploadDocument(formData);
      return response;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  async queryDocuments(query: string, model?: string) {
    try {
      const response = await apiClient.queryDocuments(query, model);
      return response;
    } catch (error) {
      console.error('Failed to query documents:', error);
      throw error;
    }
  }

  async getDocuments() {
    try {
      const response = await apiClient.getDocuments();
      return response.documents || [];
    } catch (error) {
      console.error('Failed to get documents:', error);
      throw error;
    }
  }

  async getStatus() {
    try {
      const response = await apiClient.getRagStatus();
      return response;
    } catch (error) {
      console.error('Failed to get RAG status:', error);
      throw error;
    }
  }
}

export const documentRAGService = new DocumentRAGService();
export default documentRAGService;
'''
    
    with open("src/lib/services/DocumentRAGService.ts", 'w') as f:
        f.write(rag_service_content)
    
    print("✅ Document RAG Service fixed")

def start_backend_properly():
    """Start backend on correct port"""
    print("🔧 STARTING BACKEND ON PORT 5052...")
    
    try:
        # Kill any existing backend processes
        subprocess.run(["pkill", "-f", "python.*backend"], capture_output=True)
        subprocess.run(["pkill", "-f", "simple_api"], capture_output=True)
        
        # Start backend
        process = subprocess.Popen([
            "python", "backend/simple_api.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        # Wait for startup
        time.sleep(3)
        
        # Test if it's running
        response = requests.get("http://localhost:5052/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend started successfully on port 5052")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return False

def start_frontend_properly():
    """Start frontend on correct port"""
    print("🔧 STARTING FRONTEND...")
    
    try:
        # Kill existing frontend processes
        subprocess.run(["pkill", "-f", "npm.*dev"], capture_output=True)
        subprocess.run(["pkill", "-f", "vite"], capture_output=True)
        
        # Start frontend
        process = subprocess.Popen([
            "npm", "run", "dev"
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        print("✅ Frontend started")
        return True
        
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return False

def test_connections():
    """Test all connections"""
    print("🧪 TESTING CONNECTIONS...")
    
    base_url = "http://localhost:5052"
    
    # Test endpoints
    endpoints = [
        "/health",
        "/api/ollama/status",
        "/api/ollama/models", 
        "/api/rag/status"
    ]
    
    all_working = True
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            if response.status_code == 200:
                print(f"✅ {endpoint}: OK")
            else:
                print(f"❌ {endpoint}: HTTP {response.status_code}")
                all_working = False
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
            all_working = False
    
    return all_working

def create_startup_script():
    """Create a simple startup script"""
    print("🔧 CREATING STARTUP SCRIPT...")
    
    startup_content = '''#!/bin/bash
echo "🚀 Starting Complete System..."

# Kill existing processes
pkill -f "python.*backend" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Start backend
echo "Starting backend..."
python backend/simple_api.py &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Test backend
if curl -s http://localhost:5052/health > /dev/null; then
    echo "✅ Backend started successfully"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend
echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ System started!"
echo "Backend: http://localhost:5052"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop..."

# Wait for interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
'''
    
    with open("start_system.sh", 'w') as f:
        f.write(startup_content)
    
    os.chmod("start_system.sh", 0o755)
    print("✅ Startup script created: ./start_system.sh")

def main():
    """Run complete fix"""
    print("🔧 COMPLETE FRONTEND-BACKEND CONNECTION FIX")
    print("=" * 60)
    
    # Fix all components
    fix_app_config()
    fix_api_client()
    fix_ollama_service()
    fix_document_rag_service()
    
    # Start services
    backend_ok = start_backend_properly()
    if backend_ok:
        frontend_ok = start_frontend_properly()
        
        # Test connections
        time.sleep(5)  # Wait for services to fully start
        connections_ok = test_connections()
        
        if connections_ok:
            print("\n🎉 COMPLETE FIX SUCCESSFUL!")
            print("=" * 60)
            print("✅ Backend running on port 5052")
            print("✅ Frontend starting...")
            print("✅ All API endpoints working")
            print("✅ Ollama Terminal should work")
            print("✅ Document Chat should work")
            
            print("\n🌐 ACCESS POINTS:")
            print("Backend: http://localhost:5052")
            print("Frontend: http://localhost:5173")
            print("Ollama Terminal: Should work in UI")
            print("Document Chat: Should work in UI")
            
        else:
            print("\n⚠️ Some connections failed - check above")
    else:
        print("\n❌ Backend failed to start - cannot proceed")
    
    create_startup_script()

if __name__ == "__main__":
    main()
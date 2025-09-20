#!/usr/bin/env python3
"""
Resource Monitor API
Provides system resource monitoring and model management endpoints
"""

import psutil
import subprocess
import json
import os
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_API_URL = "http://localhost:5002"
RAG_API_URL = "http://localhost:5003"
STRANDS_API_URL = "http://localhost:5004"
CHAT_ORCHESTRATOR_URL = "http://localhost:5005"
STRANDS_SDK_URL = "http://localhost:5006/api/strands-sdk"
A2A_API_URL = "http://localhost:5008/api/a2a"
AGENT_REGISTRY_URL = "http://localhost:5010"
ENHANCED_ORCHESTRATION_URL = "http://localhost:5014"

class ResourceMonitor:
    """Monitor system resources and service status"""
    
    def __init__(self):
        self.last_update = None
        self.cached_metrics = None
        self.cache_duration = 5  # seconds
    
    def get_system_metrics(self):
        """Get current system resource metrics"""
        try:
            # Memory metrics
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Disk metrics (for Ollama models)
            disk_usage = psutil.disk_usage('/')
            
            return {
                'memory': {
                    'total_gb': round(memory.total / (1024**3), 2),
                    'used_gb': round(memory.used / (1024**3), 2),
                    'available_gb': round(memory.available / (1024**3), 2),
                    'percent_used': memory.percent,
                    'swap_used_gb': round(swap.used / (1024**3), 2),
                    'swap_total_gb': round(swap.total / (1024**3), 2)
                },
                'cpu': {
                    'percent_used': cpu_percent,
                    'load_average': psutil.getloadavg() if hasattr(psutil, 'getloadavg') else [0, 0, 0]
                },
                'disk': {
                    'total_gb': round(disk_usage.total / (1024**3), 2),
                    'used_gb': round(disk_usage.used / (1024**3), 2),
                    'free_gb': round(disk_usage.free / (1024**3), 2),
                    'percent_used': round((disk_usage.used / disk_usage.total) * 100, 2)
                },
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {'error': f'Failed to get system metrics: {str(e)}'}
    
    def get_ollama_models(self):
        """Get Ollama model information"""
        try:
            # Get list of models
            response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
            if response.status_code == 200:
                models_data = response.json()
                models = []
                
                for model in models_data.get('models', []):
                    models.append({
                        'name': model['name'],
                        'size_gb': round(model['size'] / (1024**3), 2),
                        'modified': model['modified_at'],
                        'details': model.get('details', {})
                    })
                
                return {'models': models, 'total_size_gb': sum(m['size_gb'] for m in models)}
            else:
                return {'error': f'Ollama API error: {response.status_code}'}
        except Exception as e:
            return {'error': f'Failed to get Ollama models: {str(e)}'}
    
    def get_loaded_models(self):
        """Get currently loaded models in memory"""
        try:
            response = requests.get(f"{OLLAMA_BASE_URL}/api/ps", timeout=5)
            if response.status_code == 200:
                loaded_data = response.json()
                loaded_models = []
                
                for model in loaded_data.get('models', []):
                    loaded_models.append({
                        'name': model['name'],
                        'size_gb': round(model['size'] / (1024**3), 2),
                        'context_size': model.get('context_size', 0),
                        'context_used': model.get('context_used', 0)
                    })
                
                return {'loaded_models': loaded_models, 'total_loaded_gb': sum(m['size_gb'] for m in loaded_models)}
            else:
                return {'loaded_models': [], 'total_loaded_gb': 0}
        except Exception as e:
            return {'loaded_models': [], 'total_loaded_gb': 0, 'error': str(e)}
    
    def unload_model(self, model_name):
        """Unload a specific model from memory"""
        try:
            response = requests.post(f"{OLLAMA_BASE_URL}/api/generate", 
                                   json={'model': model_name, 'prompt': '', 'stream': False}, 
                                   timeout=10)
            # This is a workaround - we need to send a request to trigger unloading
            # In practice, models unload automatically after inactivity
            return {'success': True, 'message': f'Model {model_name} will unload after inactivity'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_service_status(self):
        """Get status of all backend services"""
        services = {}
        
        # Check Ollama Core
        try:
            response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
            services['ollama_core'] = {
                'status': 'running' if response.status_code == 200 else 'error',
                'port': 11434,
                'message': 'Ollama Core is running' if response.status_code == 200 else 'Ollama Core error'
            }
        except:
            services['ollama_core'] = {
                'status': 'stopped',
                'port': 11434,
                'message': 'Ollama Core is not running'
            }
        
        # Check Ollama API
        try:
            response = requests.get(f"{OLLAMA_API_URL}/health", timeout=3)
            services['ollama_api'] = {
                'status': 'running' if response.status_code == 200 else 'error',
                'port': 5002,
                'message': 'Ollama API is running' if response.status_code == 200 else 'Ollama API error'
            }
        except:
            services['ollama_api'] = {
                'status': 'stopped',
                'port': 5002,
                'message': 'Ollama API is not running'
            }
        
        # Check RAG API
        try:
            response = requests.get(f"{RAG_API_URL}/health", timeout=3)
            services['rag_api'] = {
                'status': 'running' if response.status_code == 200 else 'error',
                'port': 5003,
                'message': 'RAG API is running' if response.status_code == 200 else 'RAG API error'
            }
        except:
            services['rag_api'] = {
                'status': 'stopped',
                'port': 5003,
                'message': 'RAG API is not running'
            }
        
        # Check Strands API
        try:
            response = requests.get(f"{STRANDS_API_URL}/api/strands/health", timeout=3)
            services['strands_api'] = {
                'status': 'running' if response.status_code == 200 else 'error',
                'port': 5004,
                'message': 'Strands API is running' if response.status_code == 200 else 'Strands API error'
            }
        except:
            services['strands_api'] = {
                'status': 'stopped',
                'port': 5004,
                'message': 'Strands API is not running'
            }
        
        # Check Chat Orchestrator
        try:
            response = requests.get(f"{CHAT_ORCHESTRATOR_URL}/health", timeout=3)
            services['chat_orchestrator'] = {
                'status': 'running' if response.status_code == 200 else 'error',
                'port': 5005,
                'message': 'Chat Orchestrator is running' if response.status_code == 200 else 'Chat Orchestrator error'
            }
        except:
            services['chat_orchestrator'] = {
                'status': 'stopped',
                'port': 5005,
                'message': 'Chat Orchestrator is not running'
            }
        
        # Check Strands SDK
        try:
            response = requests.get(f"{STRANDS_SDK_URL}/health", timeout=3)
            if response.status_code == 200:
                data = response.json()
                services['strands_sdk'] = {
                    'status': 'running',
                    'port': 5006,
                    'message': f"Strands SDK running ({data.get('sdk_type', 'unknown')})"
                }
            else:
                services['strands_sdk'] = {
                    'status': 'error',
                    'port': 5006,
                    'message': f'Strands SDK error: {response.status_code}'
                }
        except:
            services['strands_sdk'] = {
                'status': 'stopped',
                'port': 5006,
                'message': 'Strands SDK is not running'
            }
        
        # Check A2A Service
        try:
            response = requests.get(f"{A2A_API_URL}/health", timeout=3)
            if response.status_code == 200:
                data = response.json()
                services['a2a_service'] = {
                    'status': 'running',
                    'port': 5008,
                    'message': f"A2A Service running ({data.get('agents_registered', 0)} agents)"
                }
            else:
                services['a2a_service'] = {
                    'status': 'error',
                    'port': 5008,
                    'message': f'A2A Service error: {response.status_code}'
                }
        except:
            services['a2a_service'] = {
                'status': 'stopped',
                'port': 5008,
                'message': 'A2A Service is not running'
            }
        
        # Strands Orchestration replaced by Enhanced Orchestration
        
        # Check Agent Registry
        try:
            response = requests.get(f"{AGENT_REGISTRY_URL}/health", timeout=3)
            services['agent_registry'] = {
                'status': 'running' if response.status_code == 200 else 'error',
                'port': 5010,
                'message': 'Agent Registry is running' if response.status_code == 200 else 'Agent Registry error'
            }
        except:
            services['agent_registry'] = {
                'status': 'stopped',
                'port': 5010,
                'message': 'Agent Registry is not running'
            }
        
        # Check Enhanced Orchestration
        try:
            response = requests.get(f"{ENHANCED_ORCHESTRATION_URL}/api/enhanced-orchestration/health", timeout=3)
            if response.status_code == 200:
                data = response.json()
                services['enhanced_orchestration'] = {
                    'status': 'running',
                    'port': 5014,
                    'message': f"Enhanced Orchestration running (Model: {data.get('orchestrator_model', 'unknown')}, Sessions: {data.get('active_sessions', 0)})"
                }
            else:
                services['enhanced_orchestration'] = {
                    'status': 'error',
                    'port': 5014,
                    'message': f'Enhanced Orchestration error: {response.status_code}'
                }
        except:
            services['enhanced_orchestration'] = {
                'status': 'stopped',
                'port': 5014,
                'message': 'Enhanced Orchestration is not running'
            }
        
        return services

# Initialize resource monitor
monitor = ResourceMonitor()

@app.route('/api/resource-monitor/metrics', methods=['GET'])
def get_metrics():
    """Get current system resource metrics"""
    metrics = monitor.get_system_metrics()
    return jsonify(metrics)

@app.route('/api/resource-monitor/ollama-models', methods=['GET'])
def get_ollama_models():
    """Get all Ollama models (cached and loaded)"""
    cached_models = monitor.get_ollama_models()
    loaded_models = monitor.get_loaded_models()
    
    return jsonify({
        'cached_models': cached_models,
        'loaded_models': loaded_models
    })

@app.route('/api/resource-monitor/unload-model', methods=['POST'])
def unload_model():
    """Unload a specific model from memory"""
    data = request.get_json()
    model_name = data.get('model_name')
    
    if not model_name:
        return jsonify({'error': 'model_name is required'}), 400
    
    result = monitor.unload_model(model_name)
    return jsonify(result)

@app.route('/api/resource-monitor/service-status', methods=['GET'])
def get_service_status():
    """Get status of all backend services"""
    services = monitor.get_service_status()
    return jsonify(services)

@app.route('/api/resource-monitor/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'resource-monitor-api',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting Resource Monitor API...")
    print("📍 Port: 5011")
    print("📊 Monitoring system resources and services")
    
    app.run(host='0.0.0.0', port=5011, debug=False)


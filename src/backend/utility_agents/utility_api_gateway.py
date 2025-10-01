#!/usr/bin/env python3
"""
Utility Agent API Gateway
Port: 5044
Purpose: Central API gateway for all utility services
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class UtilityAPIGateway:
    def __init__(self):
        self.port = 5044
        self.services = {
            'database': 'http://localhost:5041',
            'synthetic_data': 'http://localhost:5042',
            'orchestration': 'http://localhost:5043'
        }
        logger.info(f"Utility API Gateway initialized on port {self.port}")
    
    def check_service_health(self, service_name: str, service_url: str):
        """Check health of a specific service"""
        try:
            response = requests.get(f"{service_url}/health", timeout=5)
            return {
                "name": service_name,
                "url": service_url,
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "response_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else None,
                "last_check": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "name": service_name,
                "url": service_url,
                "status": "unhealthy",
                "error": str(e),
                "last_check": datetime.now().isoformat()
            }
    
    def get_all_services_health(self):
        """Get health status of all utility services"""
        health_status = {}
        
        for service_name, service_url in self.services.items():
            health_status[service_name] = self.check_service_health(service_name, service_url)
        
        # Determine overall status
        all_healthy = all(service["status"] == "healthy" for service in health_status.values())
        overall_status = "healthy" if all_healthy else "degraded"
        
        return {
            "overall_status": overall_status,
            "services": health_status,
            "timestamp": datetime.now().isoformat()
        }
    
    def list_databases(self):
        """List all created databases"""
        try:
            response = requests.get(f"{self.services['database']}/api/database/list", timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                return {"success": False, "error": f"Database service returned status {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_database_tables(self, database_name: str):
        """Get tables for a specific database"""
        try:
            response = requests.get(
                f"{self.services['synthetic_data']}/api/synthetic-data/database/{database_name}/tables",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                return {"success": False, "error": f"Synthetic data service returned status {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Initialize gateway
api_gateway = UtilityAPIGateway()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the gateway"""
    return jsonify({
        "status": "healthy",
        "service": "Utility Agent API Gateway",
        "port": api_gateway.port,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/utility/health', methods=['GET'])
def get_utility_services_health():
    """Get health status of all utility services"""
    try:
        health_status = api_gateway.get_all_services_health()
        return jsonify(health_status)
    except Exception as e:
        logger.error(f"Error getting services health: {str(e)}")
        return jsonify({
            "overall_status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/utility/database/list', methods=['GET'])
def list_utility_databases():
    """List all created databases"""
    try:
        result = api_gateway.list_databases()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error listing databases: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/database/<database_name>/tables', methods=['GET'])
def get_database_tables(database_name):
    """Get tables for a specific database"""
    try:
        result = api_gateway.get_database_tables(database_name)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting database tables: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/workflow/execute', methods=['POST'])
def execute_workflow():
    """Execute utility workflow via orchestration engine"""
    try:
        # Forward request to orchestration engine
        response = requests.post(
            f"{api_gateway.services['orchestration']}/api/utility/workflow/execute",
            json=request.get_json(),
            timeout=120  # Longer timeout for workflow execution
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error executing workflow: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to connect to orchestration engine: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error executing workflow: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/workflow/history', methods=['GET'])
def get_workflow_history():
    """Get workflow execution history"""
    try:
        # Forward request to orchestration engine
        response = requests.get(
            f"{api_gateway.services['orchestration']}/api/utility/workflow/history",
            params=request.args,
            timeout=10
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error getting workflow history: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to connect to orchestration engine: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error getting workflow history: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/database/preview-schema', methods=['POST'])
def preview_database_schema():
    """Preview database schema before creation"""
    try:
        # Forward request to database service with longer timeout for LLM processing
        response = requests.post(
            f"{api_gateway.services['database']}/api/database/preview-schema",
            json=request.get_json(),
            timeout=150  # Extended timeout for LLM generation
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error previewing schema: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to connect to database service: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error previewing schema: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/database/create', methods=['POST'])
def create_database():
    """Create a new database via database service"""
    try:
        # Forward request to database service
        response = requests.post(
            f"{api_gateway.services['database']}/api/database/create",
            json=request.get_json(),
            timeout=30
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error creating database: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to connect to database service: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error creating database: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/database/<database_name>/query', methods=['POST'])
def query_database(database_name):
    """Execute SQL query on database"""
    try:
        # Forward request to database service
        response = requests.post(
            f"{api_gateway.services['database']}/api/database/{database_name}/query",
            json=request.get_json(),
            timeout=30
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error querying database: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to connect to database service: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error querying database: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/database/<database_name>/delete', methods=['DELETE'])
def delete_database(database_name):
    """Delete a database"""
    try:
        # Forward request to database service
        response = requests.delete(
            f"{api_gateway.services['database']}/api/database/{database_name}/delete",
            timeout=30
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error deleting database: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to connect to database service: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error deleting database: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/synthetic-data/generate', methods=['POST'])
def generate_synthetic_data():
    """Generate synthetic data via synthetic data service"""
    try:
        # Forward request to synthetic data service
        response = requests.post(
            f"{api_gateway.services['synthetic_data']}/api/synthetic-data/generate",
            json=request.get_json(),
            timeout=60
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error generating synthetic data: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to connect to synthetic data service: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error generating synthetic data: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/synthetic-data/populate', methods=['POST'])
def populate_database():
    """Populate database with synthetic data"""
    try:
        # Forward request to synthetic data service
        response = requests.post(
            f"{api_gateway.services['synthetic_data']}/api/synthetic-data/populate",
            json=request.get_json(),
            timeout=120
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error populating database: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to connect to synthetic data service: {str(e)}"
        }), 500
    except Exception as e:
        logger.error(f"Error populating database: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/services', methods=['GET'])
def get_services_info():
    """Get information about all utility services"""
    try:
        services_info = {
            "gateway": {
                "name": "Utility Agent API Gateway",
                "port": api_gateway.port,
                "url": f"http://localhost:{api_gateway.port}",
                "description": "Central API gateway for all utility services"
            },
            "database": {
                "name": "Database Agent Service",
                "port": 5041,
                "url": api_gateway.services['database'],
                "description": "Convert natural language to SQL databases"
            },
            "synthetic_data": {
                "name": "Synthetic Data Agent Service",
                "port": 5042,
                "url": api_gateway.services['synthetic_data'],
                "description": "Generate realistic synthetic data"
            },
            "orchestration": {
                "name": "Utility Orchestration Engine",
                "port": 5043,
                "url": api_gateway.services['orchestration'],
                "description": "Orchestrate utility agents for complex workflows"
            }
        }
        
        return jsonify({
            "success": True,
            "services": services_info,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting services info: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/utility/status', methods=['GET'])
def get_comprehensive_status():
    """Get comprehensive status of all utility services"""
    try:
        # Get health status
        health_status = api_gateway.get_all_services_health()
        
        # Get database count
        db_result = api_gateway.list_databases()
        database_count = len(db_result.get("databases", [])) if db_result.get("success") else 0
        
        # Get workflow history count
        try:
            history_response = requests.get(
                f"{api_gateway.services['orchestration']}/api/utility/workflow/history",
                timeout=5
            )
            workflow_count = 0
            if history_response.status_code == 200:
                history_data = history_response.json()
                workflow_count = len(history_data.get("history", []))
        except:
            workflow_count = 0
        
        return jsonify({
            "success": True,
            "overall_status": health_status["overall_status"],
            "services": health_status["services"],
            "statistics": {
                "databases_created": database_count,
                "workflows_executed": workflow_count,
                "services_running": len([s for s in health_status["services"].values() if s["status"] == "healthy"])
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting comprehensive status: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info(f"🚀 Starting Utility Agent API Gateway on port {api_gateway.port}")
    app.run(host='0.0.0.0', port=api_gateway.port, debug=True)

#!/usr/bin/env python3
"""
Utility Orchestration Engine
Port: 5043
Purpose: Orchestrate utility agents to fulfill complex user requests
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import logging
from datetime import datetime
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class UtilityOrchestrationEngine:
    def __init__(self):
        self.port = 5043
        self.database_service_url = "http://localhost:5041"
        self.synthetic_data_service_url = "http://localhost:5042"
        self.task_queue = []
        self.execution_history = []
        logger.info(f"Utility Orchestration Engine initialized on port {self.port}")
    
    def analyze_request(self, user_request: str):
        """Analyze user request to determine workflow steps"""
        request_lower = user_request.lower()
        
        workflow = {
            "original_request": user_request,
            "steps": [],
            "estimated_duration": 0,
            "complexity": "simple"
        }
        
        # Detect database creation requests
        if any(word in request_lower for word in ['create database', 'make database', 'build database', 'new database']):
            workflow["steps"].append({
                "type": "create_database",
                "priority": "high",
                "parameters": {
                    "description": user_request,
                    "name": self.extract_database_name(user_request)
                }
            })
            workflow["complexity"] = "medium"
            workflow["estimated_duration"] += 30
        
        # Detect data generation requests
        if any(word in request_lower for word in ['generate data', 'create data', 'populate', 'add data', 'sample data']):
            workflow["steps"].append({
                "type": "generate_data",
                "priority": "medium",
                "parameters": {
                    "count": self.extract_data_count(user_request),
                    "description": user_request
                }
            })
            workflow["complexity"] = "medium"
            workflow["estimated_duration"] += 20
        
        # Detect both database and data requests
        if len(workflow["steps"]) > 1:
            workflow["complexity"] = "complex"
            workflow["estimated_duration"] += 10
        
        # If no specific steps detected, create a default workflow
        if not workflow["steps"]:
            workflow["steps"].append({
                "type": "create_database",
                "priority": "high",
                "parameters": {
                    "description": user_request,
                    "name": self.extract_database_name(user_request)
                }
            })
        
        return workflow
    
    def extract_database_name(self, request: str):
        """Extract database name from request"""
        # Look for patterns like "create a customer database"
        patterns = [
            r'create\s+(?:a\s+)?([a-z\s]+?)\s+database',
            r'make\s+(?:a\s+)?([a-z\s]+?)\s+database',
            r'build\s+(?:a\s+)?([a-z\s]+?)\s+database',
            r'database\s+for\s+([a-z\s]+)',
            r'([a-z\s]+?)\s+database'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, request.lower())
            if match:
                name = match.group(1).strip()
                # Clean up the name
                name = re.sub(r'[^a-z0-9\s]', '', name)
                name = re.sub(r'\s+', '_', name)
                return name[:50]  # Limit length
        
        # Default name
        return "utility_database"
    
    def extract_data_count(self, request: str):
        """Extract number of records to generate"""
        # Look for numbers in the request
        numbers = re.findall(r'\b(\d+)\b', request)
        if numbers:
            count = int(numbers[0])
            # Reasonable limits
            return min(max(count, 10), 1000)
        
        return 100  # Default count
    
    def execute_utility_workflow(self, user_request: str):
        """Execute the complete utility workflow"""
        try:
            # Analyze request
            workflow = self.analyze_request(user_request)
            
            results = []
            workflow_id = f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            logger.info(f"Executing workflow {workflow_id}: {workflow['steps']}")
            
            # Execute each step
            for i, step in enumerate(workflow["steps"]):
                step_result = self.execute_step(step, i + 1, workflow_id)
                results.append(step_result)
                
                # If step failed, stop execution
                if not step_result.get("success", False):
                    break
            
            # Store in execution history
            execution_record = {
                "workflow_id": workflow_id,
                "original_request": user_request,
                "workflow": workflow,
                "results": results,
                "status": "completed" if all(r.get("success", False) for r in results) else "failed",
                "timestamp": datetime.now().isoformat()
            }
            
            self.execution_history.append(execution_record)
            
            return execution_record
            
        except Exception as e:
            logger.error(f"Error executing workflow: {str(e)}")
            return {
                "error": str(e),
                "status": "error",
                "timestamp": datetime.now().isoformat()
            }
    
    def execute_step(self, step: dict, step_number: int, workflow_id: str):
        """Execute a single workflow step"""
        step_type = step["type"]
        
        try:
            if step_type == "create_database":
                return self.create_database_step(step, step_number, workflow_id)
            elif step_type == "generate_data":
                return self.generate_data_step(step, step_number, workflow_id)
            else:
                return {
                    "step_number": step_number,
                    "step_type": step_type,
                    "success": False,
                    "error": f"Unknown step type: {step_type}"
                }
                
        except Exception as e:
            logger.error(f"Error executing step {step_number}: {str(e)}")
            return {
                "step_number": step_number,
                "step_type": step_type,
                "success": False,
                "error": str(e)
            }
    
    def create_database_step(self, step: dict, step_number: int, workflow_id: str):
        """Execute database creation step"""
        try:
            parameters = step["parameters"]
            
            response = requests.post(
                f"{self.database_service_url}/api/database/create",
                json=parameters,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "step_number": step_number,
                    "step_type": "create_database",
                    "success": True,
                    "result": result,
                    "message": f"Database '{parameters.get('name')}' created successfully"
                }
            else:
                return {
                    "step_number": step_number,
                    "step_type": "create_database",
                    "success": False,
                    "error": f"Database service returned status {response.status_code}",
                    "response": response.text
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "step_number": step_number,
                "step_type": "create_database",
                "success": False,
                "error": f"Failed to connect to database service: {str(e)}"
            }
    
    def generate_data_step(self, step: dict, step_number: int, workflow_id: str):
        """Execute data generation step"""
        try:
            parameters = step["parameters"]
            
            # First, get the latest database from the workflow
            database_name = self.get_latest_database_name()
            if not database_name:
                return {
                    "step_number": step_number,
                    "step_type": "generate_data",
                    "success": False,
                    "error": "No database found to populate"
                }
            
            # Get database tables
            tables_response = requests.get(
                f"{self.synthetic_data_service_url}/api/synthetic-data/database/{database_name}/tables",
                timeout=30
            )
            
            if tables_response.status_code != 200:
                return {
                    "step_number": step_number,
                    "step_type": "generate_data",
                    "success": False,
                    "error": "Failed to get database tables"
                }
            
            tables_data = tables_response.json()
            if not tables_data.get("tables"):
                return {
                    "step_number": step_number,
                    "step_type": "generate_data",
                    "success": False,
                    "error": "No tables found in database"
                }
            
            # Populate each table
            results = []
            for table in tables_data["tables"]:
                table_name = table["name"]
                
                populate_response = requests.post(
                    f"{self.synthetic_data_service_url}/api/synthetic-data/populate",
                    json={
                        "database_name": database_name,
                        "table_name": table_name,
                        "count": parameters.get("count", 100)
                    },
                    timeout=60
                )
                
                if populate_response.status_code == 200:
                    results.append(populate_response.json())
                else:
                    results.append({
                        "success": False,
                        "error": f"Failed to populate table {table_name}"
                    })
            
            return {
                "step_number": step_number,
                "step_type": "generate_data",
                "success": all(r.get("success", False) for r in results),
                "result": results,
                "message": f"Generated data for {len(results)} tables"
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "step_number": step_number,
                "step_type": "generate_data",
                "success": False,
                "error": f"Failed to connect to synthetic data service: {str(e)}"
            }
    
    def get_latest_database_name(self):
        """Get the name of the most recently created database"""
        try:
            response = requests.get(
                f"{self.database_service_url}/api/database/list",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                databases = data.get("databases", [])
                if databases:
                    # Sort by creation time and get the latest
                    latest_db = max(databases, key=lambda x: x.get("created_at", ""))
                    return latest_db["name"]
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting latest database: {str(e)}")
            return None
    
    def get_execution_history(self, limit: int = 10):
        """Get recent execution history"""
        return self.execution_history[-limit:] if self.execution_history else []

# Initialize service
orchestration_engine = UtilityOrchestrationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Utility Orchestration Engine",
        "port": orchestration_engine.port,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/utility/workflow/execute', methods=['POST'])
def execute_workflow():
    """Execute utility workflow based on user request"""
    try:
        data = request.get_json()
        
        if not data or 'request' not in data:
            return jsonify({
                "error": "Request is required",
                "status": "error"
            }), 400
        
        user_request = data['request']
        
        if not user_request.strip():
            return jsonify({
                "error": "Request cannot be empty",
                "status": "error"
            }), 400
        
        result = orchestration_engine.execute_utility_workflow(user_request)
        
        return jsonify({
            "success": result.get("status") != "error",
            "result": result
        })
        
    except Exception as e:
        logger.error(f"Error executing workflow: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/utility/workflow/history', methods=['GET'])
def get_workflow_history():
    """Get execution history"""
    try:
        limit = request.args.get('limit', 10, type=int)
        history = orchestration_engine.get_execution_history(limit)
        
        return jsonify({
            "success": True,
            "history": history,
            "count": len(history)
        })
        
    except Exception as e:
        logger.error(f"Error getting workflow history: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/utility/workflow/analyze', methods=['POST'])
def analyze_request():
    """Analyze user request without executing"""
    try:
        data = request.get_json()
        
        if not data or 'request' not in data:
            return jsonify({
                "error": "Request is required",
                "status": "error"
            }), 400
        
        user_request = data['request']
        workflow = orchestration_engine.analyze_request(user_request)
        
        return jsonify({
            "success": True,
            "workflow": workflow
        })
        
    except Exception as e:
        logger.error(f"Error analyzing request: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/api/utility/services/status', methods=['GET'])
def get_services_status():
    """Get status of all utility services"""
    try:
        services = {
            "database_service": orchestration_engine.database_service_url,
            "synthetic_data_service": orchestration_engine.synthetic_data_service_url
        }
        
        status = {}
        for service_name, service_url in services.items():
            try:
                response = requests.get(f"{service_url}/health", timeout=5)
                status[service_name] = {
                    "url": service_url,
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "response_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else None
                }
            except Exception as e:
                status[service_name] = {
                    "url": service_url,
                    "status": "unhealthy",
                    "error": str(e)
                }
        
        return jsonify({
            "success": True,
            "services": status,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting services status: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == '__main__':
    logger.info(f"🚀 Starting Utility Orchestration Engine on port {orchestration_engine.port}")
    app.run(host='0.0.0.0', port=orchestration_engine.port, debug=True)

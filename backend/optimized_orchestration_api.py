"""
Optimized Orchestration API
Following the standardized workflow pattern with complete frontend integration
"""

from flask import Flask, request, jsonify, Response
import json
import logging
from optimized_orchestration_engine import OptimizedOrchestrationEngine

# Initialize Flask app
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize orchestration engine
orchestration_engine = OptimizedOrchestrationEngine()

@app.route('/api/optimized-orchestration/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "optimized-orchestration",
        "version": "1.0.0"
    })

@app.route('/api/optimized-orchestration/query', methods=['POST'])
def execute_orchestration():
    """
    Execute optimized orchestration following the standardized workflow pattern:
    1. QUERY_INTAKE
    2. STAGE_EXECUTION (Sequential)
    3. AGENT_EXECUTION (Based on Strategy)
    4. SYNTHESIS
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: query"
            }), 400
        
        query = data['query']
        orchestration_type = data.get('orchestration_type', 'strands_a2a_handover')
        session_id = data.get('session_id')
        
        logger.info(f"Starting optimized orchestration for query: {query[:100]}...")
        
        # Execute orchestration using optimized engine
        result = orchestration_engine.execute_orchestration(query, orchestration_type)
        
        if result['success']:
            logger.info(f"Orchestration completed successfully in {result['processing_time']:.2f}s")
            return jsonify(result)
        else:
            logger.error(f"Orchestration failed: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"Orchestration API error: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

@app.route('/api/optimized-orchestration/sessions', methods=['GET'])
def get_sessions():
    """Get orchestration sessions"""
    return jsonify({
        "sessions": [],
        "message": "Session management not implemented yet"
    })

@app.route('/api/optimized-orchestration/workflow-status', methods=['GET'])
def get_workflow_status():
    """Get current workflow status"""
    return jsonify({
        "workflow_pattern": "Standardized Agent Orchestration",
        "stages": [
            "1. QUERY_INTAKE",
            "2. STAGE_EXECUTION (Sequential)",
            "3. AGENT_EXECUTION (Based on Strategy)",
            "4. SYNTHESIS"
        ],
        "status": "operational"
    })

if __name__ == '__main__':
    print("Starting Optimized Orchestration API on port 5015...")
    app.run(host='0.0.0.0', port=5015, debug=True)

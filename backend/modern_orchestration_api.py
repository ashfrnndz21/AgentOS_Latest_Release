#!/usr/bin/env python3
"""
Modern Orchestration API
- Direct A2A orchestration-enabled agent integration
- Streamlined query processing
- Real-time agent execution
"""

import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from modern_orchestrator import ModernSystemOrchestrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize modern orchestrator
orchestrator = ModernSystemOrchestrator()

@app.route('/api/modern-orchestration/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "orchestrator_type": "modern_direct_a2a",
        "timestamp": "2025-09-28T13:50:00.000000"
    })

@app.route('/api/modern-orchestration/query', methods=['POST'])
def process_query():
    """Process query through modern orchestration"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"🎯 Processing modern orchestration query: {query[:50]}...")
        
        # Process through modern orchestrator
        result = orchestrator.process_query(query)
        
        logger.info(f"✅ Modern orchestration completed: {result.get('success', False)}")
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"❌ Modern orchestration error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": "2025-09-28T13:50:00.000000"
        }), 500

@app.route('/api/modern-orchestration/agents', methods=['GET'])
def get_orchestration_agents():
    """Get orchestration-enabled agents"""
    try:
        agents = orchestrator._get_orchestration_agents()
        return jsonify({
            "success": True,
            "agents": agents,
            "count": len(agents),
            "timestamp": "2025-09-28T13:50:00.000000"
        })
    except Exception as e:
        logger.error(f"❌ Error getting orchestration agents: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Modern Orchestration API...")
    logger.info("📍 Port: 5015")
    logger.info("🎯 Direct A2A orchestration-enabled agent integration")
    logger.info("⚡ Streamlined query processing")
    
    app.run(host='0.0.0.0', port=5015, debug=False)

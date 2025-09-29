#!/usr/bin/env python3
"""
Enhanced A2A API
Provides API endpoint for the enhanced A2A orchestrator with comprehensive handoff flow
"""

from flask import Flask, request, jsonify
import uuid
import logging
from enhanced_a2a_orchestrator import enhanced_a2a_orchestrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/api/enhanced-a2a/query', methods=['POST'])
def enhanced_a2a_query():
    """Enhanced A2A orchestration endpoint"""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        user_query = data['query']
        session_id = str(uuid.uuid4())
        
        logger.info(f"Processing enhanced A2A query: {user_query}... (session: {session_id})")
        
        # Execute enhanced orchestration
        result = enhanced_a2a_orchestrator.orchestrate(user_query, session_id)
        
        # Add session information
        result['session_id'] = session_id
        result['query'] = user_query
        
        logger.info(f"Enhanced A2A orchestration completed for session: {session_id}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Enhanced A2A API error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/enhanced-a2a/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "enhanced-a2a-orchestrator",
        "version": "1.0.0",
        "timestamp": "2025-09-24T20:00:00Z"
    })

if __name__ == '__main__':
    logger.info("Starting Enhanced A2A API on port 5019")
    app.run(host='0.0.0.0', port=5019, debug=True)

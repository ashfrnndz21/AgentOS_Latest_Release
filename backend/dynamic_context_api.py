#!/usr/bin/env python3
"""
Dynamic Context Refinement API
Provides API endpoints for the dynamic context refinement engine
"""

from flask import Flask, request, jsonify
import logging
from dynamic_context_refinement_engine import dynamic_context_engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/api/dynamic-context/statistics', methods=['GET'])
def get_refinement_statistics():
    """Get dynamic context refinement statistics"""
    try:
        stats = dynamic_context_engine.get_refinement_statistics()
        return jsonify({
            "success": True,
            "statistics": stats,
            "timestamp": "2025-09-24T21:00:00Z"
        })
    except Exception as e:
        logger.error(f"Error getting refinement statistics: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/dynamic-context/register-agent', methods=['POST'])
def register_agent():
    """Register agent capabilities for dynamic context refinement"""
    try:
        data = request.get_json()
        if not data or 'agent' not in data:
            return jsonify({
                "success": False,
                "error": "Agent data is required"
            }), 400
        
        agent = data['agent']
        dynamic_context_engine.register_agent_capability(agent)
        
        return jsonify({
            "success": True,
            "message": f"Agent {agent.get('name', 'Unknown')} registered successfully"
        })
        
    except Exception as e:
        logger.error(f"Error registering agent: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/dynamic-context/refine', methods=['POST'])
def refine_context():
    """Manually refine context using the dynamic engine"""
    try:
        data = request.get_json()
        if not data or 'context' not in data:
            return jsonify({
                "success": False,
                "error": "Context is required"
            }), 400
        
        context = data['context']
        context_type = data.get('context_type', 'agent_output')
        source_agent = data.get('source_agent', 'Unknown')
        target_agent_id = data.get('target_agent_id', 'unknown')
        session_id = data.get('session_id', 'manual_test')
        
        # Process context handoff
        refined_context, metadata = dynamic_context_engine.process_context_handoff(
            context=context,
            context_type=context_type,
            source_agent=source_agent,
            target_agent_id=target_agent_id,
            session_id=session_id
        )
        
        return jsonify({
            "success": True,
            "original_context": context,
            "refined_context": refined_context,
            "metadata": {
                "strategy": metadata.refinement_strategy.value,
                "quality_score": metadata.quality_score,
                "original_length": metadata.original_length,
                "refined_length": metadata.refined_length,
                "length_change": metadata.refined_length - metadata.original_length
            }
        })
        
    except Exception as e:
        logger.error(f"Error refining context: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/dynamic-context/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "dynamic-context-refinement",
        "version": "1.0.0",
        "registered_agents": len(dynamic_context_engine.agent_capabilities),
        "total_refinements": len(dynamic_context_engine.context_history),
        "timestamp": "2025-09-24T21:00:00Z"
    })

if __name__ == '__main__':
    logger.info("Starting Dynamic Context Refinement API on port 5020")
    app.run(host='0.0.0.0', port=5020, debug=True)

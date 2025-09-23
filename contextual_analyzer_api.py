#!/usr/bin/env python3
"""
Contextual Query Analyzer API
Simple Flask API to test the contextual query analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from contextual_query_analyzer import ContextualQueryAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize analyzer
analyzer = ContextualQueryAnalyzer()

@app.route('/api/contextual-analyzer/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "contextual-query-analyzer",
        "model": analyzer.model,
        "timestamp": "2025-09-21T23:30:00"
    })

@app.route('/api/contextual-analyzer/analyze', methods=['POST'])
def analyze_query():
    """Analyze query contextually"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"Analyzing query: {query[:50]}...")
        
        # Perform contextual analysis
        result = analyzer.analyze_query_contextually(query)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in query analysis: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/contextual-analyzer/analyze-with-agents', methods=['POST'])
def analyze_query_with_agents():
    """Analyze query with available agents context"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        agents = data.get('agents', [])
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"Analyzing query with {len(agents)} agents: {query[:50]}...")
        
        # Perform contextual analysis with agents
        result = analyzer.analyze_query_contextually(query, agents)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in query analysis with agents: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Contextual Query Analyzer API...")
    logger.info("📍 Port: 5016")
    logger.info("🔧 Model: qwen3:1.7b")
    
    app.run(debug=False, port=5016, host='0.0.0.0')


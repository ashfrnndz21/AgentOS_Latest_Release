#!/usr/bin/env python3
"""
Streamlined Contextual Analyzer API
Single LLM call for essential query analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from streamlined_contextual_analyzer import StreamlinedContextualAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize analyzer
analyzer = StreamlinedContextualAnalyzer()

@app.route('/api/streamlined-analyzer/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "streamlined-contextual-analyzer",
        "model": analyzer.model,
        "timestamp": "2025-09-21T23:55:00"
    })

@app.route('/api/streamlined-analyzer/analyze', methods=['POST'])
def analyze_query():
    """Analyze query with streamlined approach"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"Analyzing query: {query[:50]}...")
        
        # Single streamlined analysis
        result = analyzer.analyze_query(query)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in analyze endpoint: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Streamlined Contextual Analyzer API...")
    logger.info(f"📍 Port: 5017")
    logger.info(f"🔧 Model: {analyzer.model}")
    
    app.run(debug=False, port=5017, host='0.0.0.0')



#!/usr/bin/env python3
"""
Unified Orchestration API
Single entry point for all orchestration functionality

This API combines all existing orchestration implementations into a clean, unified interface:
- 6-Stage LLM Analysis
- Dynamic Agent Discovery  
- A2A Communication
- Text Cleaning
- Observability

Port: 5021
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Import the unified orchestrator
from unified_system_orchestrator import unified_orchestrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="*")

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "unified-orchestration-api",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "6-stage-llm-analysis",
            "dynamic-agent-discovery", 
            "a2a-communication",
            "text-cleaning",
            "observability"
        ]
    })

# Main orchestration endpoint
@app.route('/api/orchestrate', methods=['POST'])
def orchestrate():
    """
    Main orchestration endpoint
    
    Request body:
    {
        "query": "Calculate 2x532 and write a poem about the result",
        "session_id": "optional-session-id",
        "options": {
            "timeout": 300,
            "enable_observability": true
        }
    }
    
    Response:
    {
        "success": true,
        "session_id": "uuid",
        "response": "Clean, formatted response",
        "workflow_summary": {...},
        "analysis": {...},
        "agent_selection": {...},
        "execution_details": {...},
        "observability_trace": {...}
    }
    """
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data provided"
            }), 400
        
        query = data.get('query', '').strip()
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        session_id = data.get('session_id')
        options = data.get('options', {})
        
        logger.info(f"🎯 Orchestration request received: {query[:100]}...")
        
        # Run async orchestration
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                unified_orchestrator.process_query(query, session_id)
            )
        finally:
            loop.close()
        
        # Add API metadata
        result['api_metadata'] = {
            "endpoint": "/api/orchestrate",
            "timestamp": datetime.now().isoformat(),
            "processing_time": time.time() - time.time(),  # Will be calculated by orchestrator
            "version": "1.0.0"
        }
        
        # Return result
        status_code = 200 if result.get('success', False) else 500
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"❌ Orchestration API error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Quick orchestration endpoint (simplified)
@app.route('/api/quick-orchestrate', methods=['POST'])
def quick_orchestrate():
    """
    Quick orchestration endpoint for simple queries
    
    Request body:
    {
        "query": "Calculate 2+2"
    }
    """
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"⚡ Quick orchestration: {query[:50]}...")
        
        # Run async orchestration
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                unified_orchestrator.process_query(query)
            )
        finally:
            loop.close()
        
        # Return simplified result
        return jsonify({
            "success": result.get('success', False),
            "response": result.get('response', ''),
            "query": query,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Quick orchestration error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Agent discovery endpoint
@app.route('/api/discover-agents', methods=['POST'])
def discover_agents():
    """
    Discover agents for a specific query
    
    Request body:
    {
        "query": "Calculate 2x532 and write a poem",
        "max_agents": 5
    }
    """
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        max_agents = data.get('max_agents', 5)
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"🔍 Agent discovery for: {query[:50]}...")
        
        # Run async discovery
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # First analyze the query
            analysis = loop.run_until_complete(
                unified_orchestrator._analyze_query_with_llm(query, "discovery")
            )
            
            if not analysis.get('success', False):
                return jsonify({
                    "success": False,
                    "error": "Query analysis failed"
                }), 500
            
            # Then discover agents
            agents = loop.run_until_complete(
                unified_orchestrator._discover_agents(analysis, "discovery")
            )
            
            # Limit agents
            agents = agents[:max_agents]
            
        finally:
            loop.close()
        
        return jsonify({
            "success": True,
            "query": query,
            "agents": [
                {
                    "id": agent.get('id', ''),
                    "name": agent.get('name', 'Unknown'),
                    "description": agent.get('description', ''),
                    "capabilities": agent.get('capabilities', [])
                }
                for agent in agents
            ],
            "total_found": len(agents),
            "analysis": analysis.get('analysis', {}),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Agent discovery error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Analysis endpoint
@app.route('/api/analyze-query', methods=['POST'])
def analyze_query():
    """
    Analyze a query using 6-stage LLM analysis
    
    Request body:
    {
        "query": "Calculate 2x532 and write a poem about the result"
    }
    """
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Query is required"
            }), 400
        
        logger.info(f"📊 Query analysis for: {query[:50]}...")
        
        # Run async analysis
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            analysis = loop.run_until_complete(
                unified_orchestrator._analyze_query_with_llm(query, "analysis")
            )
        finally:
            loop.close()
        
        return jsonify({
            "success": analysis.get('success', False),
            "query": query,
            "analysis": analysis.get('analysis', {}),
            "execution_strategy": analysis.get('execution_strategy', 'unknown'),
            "confidence": analysis.get('confidence', 0.0),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Query analysis error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Text cleaning endpoint
@app.route('/api/clean-text', methods=['POST'])
def clean_text():
    """
    Clean and format text using the text cleaning service
    
    Request body:
    {
        "text": "Raw text to clean",
        "output_type": "agent_response|orchestrator_response"
    }
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        output_type = data.get('output_type', 'agent_response')
        
        if not text:
            return jsonify({
                "success": False,
                "error": "Text is required"
            }), 400
        
        logger.info(f"✨ Text cleaning: {len(text)} chars, type: {output_type}")
        
        # Use the orchestrator's text cleaning
        cleaned_text = unified_orchestrator._clean_agent_response(text)
        
        return jsonify({
            "success": True,
            "original_text": text,
            "cleaned_text": cleaned_text,
            "output_type": output_type,
            "length_reduction": len(text) - len(cleaned_text),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Text cleaning error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# System status endpoint
@app.route('/api/status', methods=['GET'])
def system_status():
    """Get system status and component health"""
    try:
        # Check component health
        components = {
            "unified_orchestrator": "healthy",
            "strands_sdk": "unknown",
            "a2a_service": "unknown",
            "text_cleaning": "unknown"
        }
        
        # Check Strands SDK
        try:
            import requests
            response = requests.get("http://localhost:5006/health", timeout=5)
            components["strands_sdk"] = "healthy" if response.status_code == 200 else "unhealthy"
        except:
            components["strands_sdk"] = "unavailable"
        
        # Check A2A Service
        try:
            response = requests.get("http://localhost:5008/api/a2a/health", timeout=5)
            components["a2a_service"] = "healthy" if response.status_code == 200 else "unhealthy"
        except:
            components["a2a_service"] = "unavailable"
        
        # Check text cleaning service
        try:
            response = requests.get("http://localhost:5019/health", timeout=5)
            components["text_cleaning"] = "healthy" if response.status_code == 200 else "unhealthy"
        except:
            components["text_cleaning"] = "unavailable"
        
        overall_status = "healthy" if all(status in ["healthy"] for status in components.values()) else "degraded"
        
        return jsonify({
            "status": overall_status,
            "components": components,
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        })
        
    except Exception as e:
        logger.error(f"❌ Status check error: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
        "available_endpoints": [
            "GET /health",
            "POST /api/orchestrate",
            "POST /api/quick-orchestrate", 
            "POST /api/discover-agents",
            "POST /api/analyze-query",
            "POST /api/clean-text",
            "GET /api/status"
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "timestamp": datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Unified Orchestration API...")
    logger.info("📍 Port: 5021")
    logger.info("🎯 Single entry point for all orchestration functionality")
    logger.info("🔧 Features: 6-Stage LLM Analysis + Dynamic Agent Discovery + A2A Communication + Text Cleaning")
    
    app.run(host='0.0.0.0', port=5021, debug=True)

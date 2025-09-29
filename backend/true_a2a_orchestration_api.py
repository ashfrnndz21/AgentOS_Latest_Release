"""
True A2A Orchestration API - Implements complete Option 2 + Option 3
Provides API endpoints for true multi-agent A2A orchestration with dedicated backends
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import uuid
import threading
import time
from true_a2a_orchestrator import TrueA2AOrchestrator

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TrueA2AOrchestrationAPI:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)  # Enable CORS for all routes
        self.orchestrator = TrueA2AOrchestrator()
        self.setup_routes()
        logger.info("🚀 Starting True A2A Multi-Agent Orchestration API...")
        logger.info("📍 Port: 5016")
        logger.info("🎯 True A2A Multi-Agent Orchestration")
        logger.info("🔄 Dedicated Backends + A2A Handover Protocol")
        logger.info("⚡ Complete Multi-Agent Collaboration")

    def setup_routes(self):
        @self.app.route("/api/true-a2a-orchestration/health", methods=["GET"])
        def health_check():
            return jsonify({
                "status": "healthy",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z", time.gmtime()),
                "orchestrator_type": "true_a2a_multi_agent",
                "features": [
                    "dedicated_ollama_backends",
                    "a2a_handover_protocol", 
                    "multi_agent_coordination",
                    "context_passing",
                    "response_synthesis"
                ]
            }), 200

        @self.app.route("/api/true-a2a-orchestration/query", methods=["POST"])
        def process_query():
            data = request.get_json()
            query = data.get("query")
            session_id = data.get("session_id", str(uuid.uuid4()))

            if not query:
                return jsonify({"error": "Query text is required"}), 400

            logger.info(f"🎯 Processing True A2A orchestration query: {query[:50]}... (session_id: {session_id})")

            try:
                result = self.orchestrator.process_query(query, session_id)
                return jsonify(result), 200
            except Exception as e:
                logger.error(f"Error during True A2A orchestration for session {session_id}: {e}", exc_info=True)
                return jsonify({"error": str(e), "success": False}), 500

        @self.app.route("/api/true-a2a-orchestration/handovers", methods=["GET"])
        def get_handovers():
            """Get all A2A handovers"""
            try:
                handovers = self.orchestrator.handover_manager.get_all_handovers()
                return jsonify({
                    "status": "success",
                    "handovers": handovers,
                    "count": len(handovers)
                }), 200
            except Exception as e:
                logger.error(f"Error getting handovers: {e}")
                return jsonify({"status": "error", "error": str(e)}), 500

        @self.app.route("/api/true-a2a-orchestration/handovers/<handover_id>", methods=["GET"])
        def get_handover_status(handover_id):
            """Get status of specific handover"""
            try:
                status = self.orchestrator.handover_manager.get_handover_status(handover_id)
                if status:
                    return jsonify({"status": "success", "handover": status}), 200
                else:
                    return jsonify({"status": "error", "error": "Handover not found"}), 404
            except Exception as e:
                logger.error(f"Error getting handover status: {e}")
                return jsonify({"status": "error", "error": str(e)}), 500

        @self.app.route("/api/true-a2a-orchestration/agents", methods=["GET"])
        def get_orchestration_agents():
            """Get orchestration-enabled agents with dedicated backends"""
            try:
                agents = self.orchestrator._get_orchestration_agents()
                return jsonify({
                    "status": "success",
                    "agents": agents,
                    "count": len(agents)
                }), 200
            except Exception as e:
                logger.error(f"Error getting orchestration agents: {e}")
                return jsonify({"status": "error", "error": str(e)}), 500

        @self.app.route("/api/true-a2a-orchestration/analyze", methods=["POST"])
        def analyze_query():
            """Analyze query for multi-agent requirements"""
            data = request.get_json()
            query = data.get("query")
            
            if not query:
                return jsonify({"error": "Query text is required"}), 400
            
            try:
                analysis = self.orchestrator._analyze_query_for_multi_agent(query)
                return jsonify({
                    "status": "success",
                    "analysis": analysis
                }), 200
            except Exception as e:
                logger.error(f"Error analyzing query: {e}")
                return jsonify({"status": "error", "error": str(e)}), 500

    def run(self, port=5016):
        self.app.run(host="0.0.0.0", port=port, debug=False)

if __name__ == "__main__":
    api = TrueA2AOrchestrationAPI()
    api.run()

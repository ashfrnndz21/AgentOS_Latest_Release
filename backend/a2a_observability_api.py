#!/usr/bin/env python3
"""
A2A Observability API
REST API endpoints for monitoring and analyzing A2A orchestration traces
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

from a2a_observability import observability_engine, EventType, HandoffStatus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'a2a_observability_secret'
CORS(app)

@app.route('/api/a2a-observability/health', methods=['GET'])
def health_check():
    """Health check endpoint for observability service"""
    try:
        metrics = observability_engine.get_performance_metrics()
        return jsonify({
            "status": "healthy",
            "service": "a2a-observability",
            "version": "1.0.0",
            "active_traces": len(observability_engine.active_traces),
            "completed_traces": len(observability_engine.completed_traces),
            "total_events": len(observability_engine.event_history),
            "total_handoffs": len(observability_engine.handoff_history),
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/a2a-observability/store-trace', methods=['POST'])
def store_trace():
    """Store trace data from orchestration engine"""
    try:
        trace_data = request.get_json()
        if not trace_data:
            return jsonify({"success": False, "error": "No trace data provided"}), 400
        
        # Store the trace data in the observability engine
        session_id = trace_data.get('session_id')
        if session_id:
            # Convert the trace data to the observability engine format
            observability_engine.completed_traces[session_id] = trace_data
            logger.info(f"Stored trace data for session: {session_id}")
            return jsonify({"success": True, "message": "Trace data stored successfully"})
        else:
            return jsonify({"success": False, "error": "No session_id provided"}), 400
            
    except Exception as e:
        logger.error(f"Error storing trace data: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/a2a-observability/traces', methods=['GET'])
def get_traces():
    """Get recent orchestration traces"""
    try:
        limit = request.args.get('limit', 10, type=int)
        status = request.args.get('status', 'all')  # all, active, completed
        
        if status == 'active':
            traces = list(observability_engine.active_traces.values())
        elif status == 'completed':
            traces = observability_engine.get_recent_traces(limit)
        else:
            # Combine active and recent completed traces
            active_traces = list(observability_engine.active_traces.values())
            completed_traces = list(observability_engine.completed_traces.values())
            traces = active_traces + completed_traces
        
        # Sort by start time (most recent first)
        def get_start_time(trace):
            if isinstance(trace, dict):
                return trace.get('start_time', '1970-01-01T00:00:00')
            else:
                return trace.start_time.isoformat() if hasattr(trace, 'start_time') else '1970-01-01T00:00:00'
        
        traces.sort(key=get_start_time, reverse=True)
        
        # Convert to serializable format
        trace_data = []
        for trace in traces[:limit]:
            if isinstance(trace, dict):
                # Handle dictionary format (from orchestration engine)
                trace_data.append({
                    "session_id": trace.get('session_id', 'unknown'),
                    "query": trace.get('query', 'unknown'),
                    "start_time": trace.get('start_time', '1970-01-01T00:00:00'),
                    "end_time": trace.get('end_time'),
                    "total_execution_time": trace.get('total_execution_time', 0),
                    "success": trace.get('success', False),
                    "error": trace.get('error'),
                    "orchestration_strategy": trace.get('orchestration_strategy', 'unknown'),
                    "agents_involved": trace.get('agents_involved', []),
                    "handoff_count": len(trace.get('handoffs', [])),
                    "event_count": len(trace.get('events', [])),
                })
            else:
                # Handle object format (from observability engine)
                trace_data.append({
                    "session_id": trace.session_id,
                    "query": trace.query,
                    "start_time": trace.start_time.isoformat(),
                    "end_time": trace.end_time.isoformat() if trace.end_time else None,
                    "total_execution_time": trace.total_execution_time,
                    "success": trace.success,
                    "error": trace.error,
                    "orchestration_strategy": trace.orchestration_strategy,
                    "agents_involved": trace.agents_involved,
                    "handoff_count": len(trace.handoffs),
                    "event_count": len(trace.events),
                    "status": "active" if trace.end_time is None else "completed"
                })
        
        return jsonify({
            "success": True,
            "traces": trace_data,
            "count": len(trace_data),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting traces: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/a2a-observability/traces/<session_id>', methods=['GET'])
def get_trace_details(session_id: str):
    """Get detailed trace information for a specific session"""
    try:
        trace = observability_engine.get_trace(session_id)
        if not trace:
            return jsonify({
                "success": False,
                "error": "Trace not found"
            }), 404
        
        # Get detailed handoff information
        handoffs = observability_engine.get_handoff_details(session_id)
        context_evolution = observability_engine.get_context_evolution(session_id)
        
        # Convert handoffs to serializable format
        handoff_data = []
        for handoff in handoffs:
            handoff_data.append({
                "id": handoff.id,
                "handoff_number": handoff.handoff_number,
                "from_agent": {
                    "id": handoff.from_agent_id,
                    "name": handoff.from_agent_name
                },
                "to_agent": {
                    "id": handoff.to_agent_id,
                    "name": handoff.to_agent_name
                },
                "status": handoff.status.value,
                "start_time": handoff.start_time.isoformat(),
                "end_time": handoff.end_time.isoformat() if handoff.end_time else None,
                "execution_time": handoff.execution_time,
                "context_transferred": handoff.context_transferred,
                "input_prepared": handoff.input_prepared,
                "output_received": handoff.output_received,
                "tools_used": handoff.tools_used,
                "error": handoff.error,
                "metadata": handoff.metadata
            })
        
        # Convert events to serializable format
        event_data = []
        for event in trace.events:
            event_data.append({
                "id": event.id,
                "event_type": event.event_type.value,
                "timestamp": event.timestamp.isoformat(),
                "agent_id": event.agent_id,
                "agent_name": event.agent_name,
                "from_agent_id": event.from_agent_id,
                "to_agent_id": event.to_agent_id,
                "content": event.content,
                "context": event.context,
                "metadata": event.metadata,
                "execution_time": event.execution_time,
                "status": event.status,
                "error": event.error
            })
        
        return jsonify({
            "success": True,
            "trace": {
                "session_id": trace.session_id,
                "query": trace.query,
                "start_time": trace.start_time.isoformat(),
                "end_time": trace.end_time.isoformat() if trace.end_time else None,
                "total_execution_time": trace.total_execution_time,
                "success": trace.success,
                "error": trace.error,
                "orchestration_strategy": trace.orchestration_strategy,
                "agents_involved": trace.agents_involved,
                "final_response": trace.final_response,
                "handoffs": handoff_data,
                "events": event_data,
                "context_evolution": context_evolution
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting trace details: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/a2a-observability/handoffs', methods=['GET'])
def get_handoffs():
    """Get recent agent handoffs"""
    try:
        limit = request.args.get('limit', 20, type=int)
        session_id = request.args.get('session_id')
        
        if session_id:
            # Get handoffs from specific session
            trace = observability_engine.completed_traces.get(session_id)
            if trace and isinstance(trace, dict):
                handoffs = trace.get('handoffs', [])
            else:
                handoffs = observability_engine.get_handoff_details(session_id)
        else:
            # Get recent handoffs from all stored traces
            all_handoffs = []
            for trace in observability_engine.completed_traces.values():
                if isinstance(trace, dict) and 'handoffs' in trace:
                    all_handoffs.extend(trace['handoffs'])
            handoffs = all_handoffs[-limit:] if all_handoffs else []
        
        # Convert to serializable format
        handoff_data = []
        for handoff in handoffs:
            if isinstance(handoff, dict):
                # Handle dictionary format (from stored traces)
                handoff_data.append({
                    "id": handoff.get('id', 'unknown'),
                    "session_id": handoff.get('session_id', 'unknown'),
                    "handoff_number": handoff.get('handoff_number', 0),
                    "from_agent": handoff.get('from_agent', {}),
                    "to_agent": handoff.get('to_agent', {}),
                    "status": handoff.get('status', 'unknown'),
                    "start_time": handoff.get('start_time', '1970-01-01T00:00:00'),
                    "end_time": handoff.get('end_time'),
                    "execution_time": handoff.get('execution_time', 0),
                    "context_transferred": handoff.get('context_transferred', {}),
                    "input_prepared": handoff.get('input_prepared'),
                    "output_received": handoff.get('output_received'),
                    "tools_used": handoff.get('tools_used', []),
                    "error": handoff.get('error')
                })
            else:
                # Handle object format (from observability engine)
                handoff_data.append({
                    "id": handoff.id,
                    "session_id": handoff.session_id,
                    "handoff_number": handoff.handoff_number,
                    "from_agent": {
                        "id": handoff.from_agent_id,
                        "name": handoff.from_agent_name
                    },
                    "to_agent": {
                        "id": handoff.to_agent_id,
                        "name": handoff.to_agent_name
                    },
                    "status": handoff.status.value if hasattr(handoff.status, 'value') else str(handoff.status),
                    "start_time": handoff.start_time.isoformat(),
                    "end_time": handoff.end_time.isoformat() if handoff.end_time else None,
                    "execution_time": handoff.execution_time,
                    "context_transferred": handoff.context_transferred,
                    "input_prepared": handoff.input_prepared,
                    "output_received": handoff.output_received,
                    "tools_used": handoff.tools_used,
                    "error": handoff.error
                })
        
        return jsonify({
            "success": True,
            "handoffs": handoff_data,
            "count": len(handoff_data),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting handoffs: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/a2a-observability/events', methods=['GET'])
def get_events():
    """Get recent A2A events"""
    try:
        limit = request.args.get('limit', 50, type=int)
        event_type = request.args.get('event_type')
        session_id = request.args.get('session_id')
        
        # Filter events
        events = observability_engine.event_history
        
        if session_id:
            events = [e for e in events if e.session_id == session_id]
        
        if event_type:
            events = [e for e in events if e.event_type.value == event_type]
        
        # Sort by timestamp (most recent first) and limit
        events.sort(key=lambda x: x.timestamp, reverse=True)
        events = events[:limit]
        
        # Convert to serializable format
        event_data = []
        for event in events:
            event_data.append({
                "id": event.id,
                "session_id": event.session_id,
                "event_type": event.event_type.value,
                "timestamp": event.timestamp.isoformat(),
                "agent_id": event.agent_id,
                "agent_name": event.agent_name,
                "from_agent_id": event.from_agent_id,
                "to_agent_id": event.to_agent_id,
                "content": event.content,
                "context": event.context,
                "metadata": event.metadata,
                "execution_time": event.execution_time,
                "status": event.status,
                "error": event.error
            })
        
        return jsonify({
            "success": True,
            "events": event_data,
            "count": len(event_data),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting events: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/a2a-observability/metrics', methods=['GET'])
def get_metrics():
    """Get performance metrics and statistics"""
    try:
        # Get metrics from stored traces (use same source as traces endpoint)
        # Use the same logic as the traces endpoint
        active_traces = list(observability_engine.active_traces.values())
        completed_traces = list(observability_engine.completed_traces.values())
        stored_traces = active_traces + completed_traces
        
        # Convert all traces to dict format for consistent processing
        processed_traces = []
        for trace in stored_traces:
            if isinstance(trace, dict):
                processed_traces.append(trace)
            else:
                # Convert A2ATrace object to dict format
                processed_traces.append({
                    'session_id': trace.session_id,
                    'query': trace.query,
                    'start_time': trace.start_time.isoformat(),
                    'end_time': trace.end_time.isoformat() if trace.end_time else None,
                    'total_execution_time': trace.total_execution_time,
                    'success': trace.success,
                    'error': trace.error,
                    'orchestration_strategy': trace.orchestration_strategy,
                    'agents_involved': trace.agents_involved,
                    'handoff_count': len(trace.handoffs),
                    'event_count': len(trace.events)
                })
        stored_traces = processed_traces
        
        # Calculate basic metrics (all traces are now in dict format)
        total_orchestrations = len(stored_traces)
        successful_orchestrations = len([t for t in stored_traces if t.get('success', False)])
        failed_orchestrations = total_orchestrations - successful_orchestrations
        
        # Calculate execution times
        execution_times = []
        for trace in stored_traces:
            exec_time = trace.get('total_execution_time', 0)
            if exec_time:
                execution_times.append(exec_time)
        
        avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0
        
        # Calculate handoff metrics
        logger.info(f"Debug: stored_traces count: {len(stored_traces)}")
        total_handoffs = 0
        for i, trace in enumerate(stored_traces):
            handoff_count = trace.get('handoff_count', 0)
            logger.info(f"Debug: trace {i}: handoff_count = {handoff_count}")
            total_handoffs += handoff_count
        
        avg_handoffs = total_handoffs / total_orchestrations if total_orchestrations > 0 else 0
        logger.info(f"Debug: total_handoffs = {total_handoffs}, avg_handoffs = {avg_handoffs}")
        
        # Agent usage statistics
        agent_usage = {}
        for trace in stored_traces:
            agents = trace.get('agents_involved', [])
            for agent in agents:
                agent_usage[agent] = agent_usage.get(agent, 0) + 1
        
        # Error analysis
        error_types = {}
        for trace in stored_traces:
            error = trace.get('error')
            if error:
                error_type = error.split(':')[0] if ':' in error else error
                error_types[error_type] = error_types.get(error_type, 0) + 1
        
        # Recent performance (last 10 orchestrations)
        recent_traces = stored_traces[-10:] if len(stored_traces) > 10 else stored_traces
        recent_success_rate = len([t for t in recent_traces if t.get('success', False)]) / len(recent_traces) if recent_traces else 0
        
        # Calculate recent average execution time
        recent_execution_times = [t.get('total_execution_time', 0) for t in recent_traces if t.get('total_execution_time', 0)]
        recent_avg_execution_time = sum(recent_execution_times) / len(recent_execution_times) if recent_execution_times else 0
        
        return jsonify({
            "success": True,
            "metrics": {
                "total_orchestrations": total_orchestrations,
                "successful_orchestrations": successful_orchestrations,
                "failed_orchestrations": failed_orchestrations,
                "success_rate": successful_orchestrations / total_orchestrations if total_orchestrations > 0 else 0,
                "average_execution_time": avg_execution_time,
                "average_handoffs_per_orchestration": avg_handoffs,
                "most_used_agents": agent_usage,
                "error_types": error_types,
                "recent_performance": {
                    "success_rate": recent_success_rate,
                    "average_execution_time": recent_avg_execution_time,
                    "sample_size": len(recent_traces)
                }
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/a2a-observability/export/<session_id>', methods=['GET'])
def export_trace_data(session_id: str):
    """Export complete trace data for analysis"""
    try:
        trace_data = observability_engine.export_trace_data(session_id)
        if not trace_data:
            return jsonify({
                "success": False,
                "error": "Trace not found"
            }), 404
        
        return jsonify({
            "success": True,
            "trace_data": trace_data,
            "export_timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error exporting trace data: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/a2a-observability/context-evolution/<session_id>', methods=['GET'])
def get_context_evolution(session_id: str):
    """Get context evolution throughout a conversation"""
    try:
        context_evolution = observability_engine.get_context_evolution(session_id)
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "context_evolution": context_evolution,
            "evolution_steps": len(context_evolution),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting context evolution: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/a2a-observability/real-time/<session_id>', methods=['GET'])
def get_real_time_trace(session_id: str):
    """Get real-time trace updates for active sessions"""
    try:
        trace = observability_engine.get_trace(session_id)
        if not trace:
            return jsonify({
                "success": False,
                "error": "Trace not found"
            }), 404
        
        # Return current state of the trace
        return jsonify({
            "success": True,
            "session_id": session_id,
            "status": "active" if trace.end_time is None else "completed",
            "current_step": len(trace.handoffs),
            "agents_involved": trace.agents_involved,
            "latest_handoff": {
                "from_agent": trace.handoffs[-1].from_agent_name if trace.handoffs else None,
                "to_agent": trace.handoffs[-1].to_agent_name if trace.handoffs else None,
                "status": trace.handoffs[-1].status.value if trace.handoffs else None,
                "execution_time": trace.handoffs[-1].execution_time if trace.handoffs else None
            } if trace.handoffs else None,
            "total_execution_time": trace.total_execution_time,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting real-time trace: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting A2A Observability API...")
    logger.info("📍 Port: 5018")
    logger.info("🔍 Comprehensive A2A orchestration monitoring")
    logger.info("📊 Real-time trace analysis and metrics")
    logger.info("🔄 Context evolution tracking")
    
    app.run(host='0.0.0.0', port=5018, debug=False)

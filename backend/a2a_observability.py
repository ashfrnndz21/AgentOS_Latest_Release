#!/usr/bin/env python3
"""
A2A Observability System
Comprehensive tracking and monitoring of A2A agent conversations and handovers
"""

import json
import uuid
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import threading
from contextlib import contextmanager

logger = logging.getLogger(__name__)

class EventType(Enum):
    """Types of A2A events to track"""
    ORCHESTRATION_START = "orchestration_start"
    QUERY_ANALYSIS = "query_analysis"
    AGENT_SELECTION = "agent_selection"
    AGENT_HANDOFF_START = "agent_handoff_start"
    AGENT_HANDOFF_COMPLETE = "agent_handoff_complete"
    CONTEXT_TRANSFER = "context_transfer"
    AGENT_EXECUTION_START = "agent_execution_start"
    AGENT_EXECUTION_COMPLETE = "agent_execution_complete"
    TOOL_USAGE = "tool_usage"
    ERROR_OCCURRED = "error_occurred"
    ORCHESTRATION_COMPLETE = "orchestration_complete"
    RESPONSE_SYNTHESIS = "response_synthesis"

class HandoffStatus(Enum):
    """Status of agent handoffs"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"

@dataclass
class A2AEvent:
    """Individual A2A event for observability"""
    id: str
    session_id: str
    event_type: EventType
    timestamp: datetime
    agent_id: Optional[str] = None
    agent_name: Optional[str] = None
    from_agent_id: Optional[str] = None
    to_agent_id: Optional[str] = None
    content: Optional[str] = None
    context: Optional[Dict] = None
    metadata: Optional[Dict] = None
    execution_time: Optional[float] = None
    status: Optional[str] = None
    error: Optional[str] = None

@dataclass
class AgentHandoff:
    """Detailed tracking of agent handoffs"""
    id: str
    session_id: str
    from_agent_id: str
    to_agent_id: str
    from_agent_name: str
    to_agent_name: str
    handoff_number: int
    status: HandoffStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    context_transferred: Optional[Dict] = None
    input_prepared: Optional[str] = None
    output_received: Optional[str] = None
    execution_time: Optional[float] = None
    tools_used: List[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict] = None

    def __post_init__(self):
        if self.tools_used is None:
            self.tools_used = []
        if self.metadata is None:
            self.metadata = {}

@dataclass
class A2AConversationTrace:
    """Complete trace of an A2A conversation"""
    session_id: str
    query: str
    start_time: datetime
    end_time: Optional[datetime] = None
    total_execution_time: Optional[float] = None
    agents_involved: List[str] = None
    handoffs: List[AgentHandoff] = None
    events: List[A2AEvent] = None
    final_response: Optional[str] = None
    success: bool = False
    error: Optional[str] = None
    orchestration_strategy: Optional[str] = None
    context_evolution: List[Dict] = None

    def __post_init__(self):
        if self.agents_involved is None:
            self.agents_involved = []
        if self.handoffs is None:
            self.handoffs = []
        if self.events is None:
            self.events = []
        if self.context_evolution is None:
            self.context_evolution = []

class A2AObservabilityEngine:
    """Comprehensive A2A observability and monitoring system"""
    
    def __init__(self):
        self.active_traces: Dict[str, A2AConversationTrace] = {}
        self.completed_traces: Dict[str, A2AConversationTrace] = {}
        self.event_history: List[A2AEvent] = []
        self.handoff_history: List[AgentHandoff] = []
        self._lock = threading.Lock()
        
        # Performance metrics
        self.metrics = {
            "total_orchestrations": 0,
            "successful_orchestrations": 0,
            "failed_orchestrations": 0,
            "average_execution_time": 0.0,
            "average_handoffs_per_orchestration": 0.0,
            "most_used_agents": {},
            "most_common_errors": {}
        }
        
        logger.info("A2A Observability Engine initialized")

    @contextmanager
    def trace_orchestration(self, session_id: str, query: str, orchestration_strategy: str = "sequential"):
        """Context manager for tracing complete A2A orchestration"""
        trace = A2AConversationTrace(
            session_id=session_id,
            query=query,
            start_time=datetime.now(),
            orchestration_strategy=orchestration_strategy
        )
        
        with self._lock:
            self.active_traces[session_id] = trace
        
        # Log orchestration start
        self._log_event(
            session_id=session_id,
            event_type=EventType.ORCHESTRATION_START,
            content=f"Starting {orchestration_strategy} orchestration",
            metadata={"query": query, "strategy": orchestration_strategy}
        )
        
        try:
            yield trace
        except Exception as e:
            trace.error = str(e)
            trace.success = False
            self._log_event(
                session_id=session_id,
                event_type=EventType.ERROR_OCCURRED,
                error=str(e),
                metadata={"error_type": type(e).__name__}
            )
            raise
        finally:
            # Complete the trace
            trace.end_time = datetime.now()
            trace.total_execution_time = (trace.end_time - trace.start_time).total_seconds()
            trace.success = trace.error is None
            
            with self._lock:
                self.completed_traces[session_id] = trace
                if session_id in self.active_traces:
                    del self.active_traces[session_id]
            
            # Update metrics
            self._update_metrics(trace)
            
            # Log orchestration completion
            self._log_event(
                session_id=session_id,
                event_type=EventType.ORCHESTRATION_COMPLETE,
                content=f"Orchestration completed in {trace.total_execution_time:.2f}s",
                metadata={
                    "success": trace.success,
                    "agents_involved": len(trace.agents_involved),
                    "handoffs": len(trace.handoffs),
                    "execution_time": trace.total_execution_time
                }
            )

    def start_agent_handoff(self, session_id: str, from_agent_id: str, to_agent_id: str, 
                           from_agent_name: str, to_agent_name: str, handoff_number: int,
                           context_transferred: Dict = None) -> str:
        """Start tracking an agent handoff"""
        handoff_id = str(uuid.uuid4())
        
        handoff = AgentHandoff(
            id=handoff_id,
            session_id=session_id,
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            from_agent_name=from_agent_name,
            to_agent_name=to_agent_name,
            handoff_number=handoff_number,
            status=HandoffStatus.IN_PROGRESS,
            start_time=datetime.now(),
            context_transferred=context_transferred or {}
        )
        
        with self._lock:
            if session_id in self.active_traces:
                self.active_traces[session_id].handoffs.append(handoff)
                self.active_traces[session_id].agents_involved.extend([from_agent_name, to_agent_name])
                # Remove duplicates while preserving order
                self.active_traces[session_id].agents_involved = list(dict.fromkeys(self.active_traces[session_id].agents_involved))
            
            self.handoff_history.append(handoff)
        
        # Log handoff start
        self._log_event(
            session_id=session_id,
            event_type=EventType.AGENT_HANDOFF_START,
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            agent_name=f"{from_agent_name} → {to_agent_name}",
            content=f"Handoff #{handoff_number}: {from_agent_name} → {to_agent_name}",
            metadata={
                "handoff_id": handoff_id,
                "handoff_number": handoff_number,
                "context_keys": list(context_transferred.keys()) if context_transferred else []
            }
        )
        
        return handoff_id

    def complete_agent_handoff(self, handoff_id: str, output_received: str, 
                              tools_used: List[str] = None, error: str = None):
        """Complete tracking of an agent handoff"""
        with self._lock:
            # Find the handoff in active traces
            handoff = None
            for trace in self.active_traces.values():
                for h in trace.handoffs:
                    if h.id == handoff_id:
                        handoff = h
                        break
                if handoff:
                    break
            
            # Also check in handoff history
            if not handoff:
                for h in self.handoff_history:
                    if h.id == handoff_id:
                        handoff = h
                        break
        
        if handoff:
            handoff.end_time = datetime.now()
            handoff.execution_time = (handoff.end_time - handoff.start_time).total_seconds()
            handoff.output_received = output_received
            handoff.tools_used = tools_used or []
            handoff.error = error
            handoff.status = HandoffStatus.FAILED if error else HandoffStatus.COMPLETED
            
            # Log handoff completion
            self._log_event(
                session_id=handoff.session_id,
                event_type=EventType.AGENT_HANDOFF_COMPLETE,
                from_agent_id=handoff.from_agent_id,
                to_agent_id=handoff.to_agent_id,
                agent_name=f"{handoff.from_agent_name} → {handoff.to_agent_name}",
                content=f"Handoff #{handoff.handoff_number} completed",
                execution_time=handoff.execution_time,
                status="success" if not error else "failed",
                error=error,
                metadata={
                    "handoff_id": handoff_id,
                    "tools_used": handoff.tools_used,
                    "output_length": len(output_received) if output_received else 0
                }
            )

    def log_context_transfer(self, session_id: str, from_agent_id: str, to_agent_id: str,
                           context_data: Dict, transfer_type: str = "handoff"):
        """Log context transfer between agents"""
        with self._lock:
            if session_id in self.active_traces:
                self.active_traces[session_id].context_evolution.append({
                    "timestamp": datetime.now().isoformat(),
                    "from_agent": from_agent_id,
                    "to_agent": to_agent_id,
                    "transfer_type": transfer_type,
                    "context_keys": list(context_data.keys()),
                    "context_size": len(str(context_data))
                })
        
        self._log_event(
            session_id=session_id,
            event_type=EventType.CONTEXT_TRANSFER,
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            content=f"Context transferred: {transfer_type}",
            metadata={
                "transfer_type": transfer_type,
                "context_keys": list(context_data.keys()),
                "context_size": len(str(context_data))
            }
        )

    def log_agent_execution(self, session_id: str, agent_id: str, agent_name: str,
                          execution_start: bool, input_data: str = None, 
                          output_data: str = None, execution_time: float = None,
                          tools_used: List[str] = None, error: str = None):
        """Log agent execution events"""
        event_type = EventType.AGENT_EXECUTION_START if execution_start else EventType.AGENT_EXECUTION_COMPLETE
        
        self._log_event(
            session_id=session_id,
            event_type=event_type,
            agent_id=agent_id,
            agent_name=agent_name,
            content=f"Agent execution {'started' if execution_start else 'completed'}",
            execution_time=execution_time,
            status="success" if not error else "failed",
            error=error,
            metadata={
                "input_length": len(input_data) if input_data else 0,
                "output_length": len(output_data) if output_data else 0,
                "tools_used": tools_used or []
            }
        )

    def log_tool_usage(self, session_id: str, agent_id: str, agent_name: str,
                      tool_name: str, tool_input: str, tool_output: str,
                      execution_time: float, success: bool = True):
        """Log individual tool usage"""
        self._log_event(
            session_id=session_id,
            event_type=EventType.TOOL_USAGE,
            agent_id=agent_id,
            agent_name=agent_name,
            content=f"Tool used: {tool_name}",
            execution_time=execution_time,
            status="success" if success else "failed",
            metadata={
                "tool_name": tool_name,
                "tool_input_length": len(tool_input) if tool_input else 0,
                "tool_output_length": len(tool_output) if tool_output else 0
            }
        )

    def log_event(self, session_id: str, event_type: EventType, agent_id: str = None,
                  agent_name: str = None, from_agent_id: str = None, to_agent_id: str = None,
                  content: str = None, context: Dict = None, metadata: Dict = None,
                  execution_time: float = None, status: str = None, error: str = None):
        """Public method to log events"""
        self._log_event(session_id, event_type, agent_id, agent_name, from_agent_id, to_agent_id,
                       content, context, metadata, execution_time, status, error)

    def _log_event(self, session_id: str, event_type: EventType, agent_id: str = None,
                  agent_name: str = None, from_agent_id: str = None, to_agent_id: str = None,
                  content: str = None, context: Dict = None, metadata: Dict = None,
                  execution_time: float = None, status: str = None, error: str = None):
        """Internal method to log events"""
        event = A2AEvent(
            id=str(uuid.uuid4()),
            session_id=session_id,
            event_type=event_type,
            timestamp=datetime.now(),
            agent_id=agent_id,
            agent_name=agent_name,
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            content=content,
            context=context,
            metadata=metadata,
            execution_time=execution_time,
            status=status,
            error=error
        )
        
        with self._lock:
            self.event_history.append(event)
            if session_id in self.active_traces:
                self.active_traces[session_id].events.append(event)

    def _update_metrics(self, trace: A2AConversationTrace):
        """Update performance metrics"""
        self.metrics["total_orchestrations"] += 1
        
        if trace.success:
            self.metrics["successful_orchestrations"] += 1
        else:
            self.metrics["failed_orchestrations"] += 1
        
        # Update average execution time
        total_time = self.metrics["average_execution_time"] * (self.metrics["total_orchestrations"] - 1)
        self.metrics["average_execution_time"] = (total_time + trace.total_execution_time) / self.metrics["total_orchestrations"]
        
        # Update average handoffs
        total_handoffs = self.metrics["average_handoffs_per_orchestration"] * (self.metrics["total_orchestrations"] - 1)
        self.metrics["average_handoffs_per_orchestration"] = (total_handoffs + len(trace.handoffs)) / self.metrics["total_orchestrations"]
        
        # Update agent usage
        for agent in trace.agents_involved:
            self.metrics["most_used_agents"][agent] = self.metrics["most_used_agents"].get(agent, 0) + 1

    def get_trace(self, session_id: str) -> Optional[A2AConversationTrace]:
        """Get complete trace for a session"""
        with self._lock:
            if session_id in self.active_traces:
                return self.active_traces[session_id]
            elif session_id in self.completed_traces:
                return self.completed_traces[session_id]
        return None

    def get_recent_traces(self, limit: int = 10) -> List[A2AConversationTrace]:
        """Get recent completed traces"""
        with self._lock:
            recent_traces = list(self.completed_traces.values())
            recent_traces.sort(key=lambda x: x.start_time, reverse=True)
            return recent_traces[:limit]

    def get_handoff_details(self, session_id: str) -> List[AgentHandoff]:
        """Get detailed handoff information for a session"""
        trace = self.get_trace(session_id)
        return trace.handoffs if trace else []

    def get_context_evolution(self, session_id: str) -> List[Dict]:
        """Get context evolution throughout the conversation"""
        trace = self.get_trace(session_id)
        return trace.context_evolution if trace else []

    def get_performance_metrics(self) -> Dict:
        """Get current performance metrics"""
        return self.metrics.copy()

    def export_trace_data(self, session_id: str) -> Dict:
        """Export complete trace data for analysis"""
        trace = self.get_trace(session_id)
        if not trace:
            return {}
        
        return {
            "session_id": trace.session_id,
            "query": trace.query,
            "start_time": trace.start_time.isoformat(),
            "end_time": trace.end_time.isoformat() if trace.end_time else None,
            "total_execution_time": trace.total_execution_time,
            "success": trace.success,
            "error": trace.error,
            "orchestration_strategy": trace.orchestration_strategy,
            "agents_involved": trace.agents_involved,
            "handoffs": [asdict(h) for h in trace.handoffs],
            "events": [asdict(e) for e in trace.events],
            "context_evolution": trace.context_evolution,
            "final_response": trace.final_response
        }

# Global observability engine instance
observability_engine = A2AObservabilityEngine()

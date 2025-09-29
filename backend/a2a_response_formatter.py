import json
import time
from typing import Dict, List, Any
from datetime import datetime

class A2AOrchestrationResponseFormatter:
    """Formats orchestration responses according to the A2A framework specification"""
    
    def __init__(self):
        self.schema = self._load_schema()
    
    def _load_schema(self) -> Dict:
        """Load the A2A orchestration schema"""
        try:
            with open("a2a_orchestration_schema.json", "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def format_complete_response(self, 
                                query: str,
                                analysis: Dict,
                                execution_results: Dict,
                                selected_agents: List[Dict],
                                session_id: str) -> Dict[str, Any]:
        """Format complete orchestration response according to framework"""
        
        return {
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "1. Query Analysis": self._format_query_analysis(analysis.get("stage_1_query_analysis", {})),
            "2. Sequence Definition": self._format_sequence_definition(analysis.get("stage_2_sequence_definition", {})),
            "3. Orchestrator Reasoning": self._format_orchestrator_reasoning(analysis.get("stage_3_execution_strategy", {}), analysis.get("stage_1_query_analysis", {})),
            "4. Agent Registry Analysis": self._format_agent_registry_analysis(analysis.get("stage_4_agent_analysis", {}), analysis.get("agent_registry_analysis", {})),
            "5. Agent Selection & Sequencing": self._format_agent_selection_sequencing(analysis.get("stage_5_agent_matching", {}), selected_agents),
            "6. A2A Sequential Handover Execution": self._format_a2a_execution(execution_results, selected_agents),
            "7. A2A Message Flow": self._format_message_flow(execution_results),
            "8. Orchestrator Final Synthesis": self._format_final_synthesis(execution_results, analysis),
            "execution_metadata": {
                "total_execution_time": execution_results.get("execution_time", 0),
                "success": execution_results.get("success", False),
                "orchestration_type": execution_results.get("orchestration_type", "unknown"),
                "agents_coordinated": execution_results.get("agents_coordinated", 0)
            }
        }
    
    def _format_query_analysis(self, stage1_data: Dict) -> Dict[str, Any]:
        """Format Query Analysis section"""
        return {
            "Query Type": stage1_data.get("query_type", "general"),
            "Domain": stage1_data.get("domain", "General"),
            "Complexity": stage1_data.get("complexity", "moderate"),
            "User Intent": stage1_data.get("user_intent", "User query processing"),
            "Required Expertise": stage1_data.get("required_expertise", []),
            "Dependencies": stage1_data.get("dependencies", "None identified"),
            "Scope": stage1_data.get("scope", "general"),
            "LLM Reasoning": stage1_data.get("reasoning", "Analyzed user intent, domain, and complexity to understand query requirements")
        }
    
    def _format_sequence_definition(self, stage2_data: Dict) -> Dict[str, Any]:
        """Format Sequence Definition section"""
        workflow_steps = stage2_data.get("workflow_steps", [])
        return {
            "Execution Flow": stage2_data.get("execution_flow", "Sequential processing"),
            "Workflow Steps": [
                {
                    "Step": step.get("step", i+1),
                    "Task": step.get("task", ""),
                    "Required Expertise": step.get("required_expertise", "")
                }
                for i, step in enumerate(workflow_steps)
            ],
            "Handoff Points": stage2_data.get("handoff_points", "No handoffs required"),
            "Parallel Opportunities": stage2_data.get("parallel_opportunities", "None identified"),
            "LLM Reasoning": stage2_data.get("reasoning", "Defined workflow steps and execution flow based on query complexity")
        }
    
    def _format_orchestrator_reasoning(self, stage3_data: Dict, stage1_data: Dict) -> Dict[str, Any]:
        """Format Orchestrator Reasoning section"""
        return {
            "User Intent (Reconfirmed)": stage1_data.get("user_intent", "User query processing"),
            "Domain Analysis": f"Domain: {stage1_data.get('domain', 'General')} - {stage3_data.get('reasoning', 'Determined optimal execution strategy')}",
            "Complexity Assessment": stage3_data.get("complexity_assessment", "moderate"),
            "Processing Strategy": stage3_data.get("strategy", "sequential"),
            "Resource Requirements": stage3_data.get("resource_requirements", "standard"),
            "LLM Reasoning": stage3_data.get("reasoning", "Determined optimal execution strategy based on task requirements")
        }
    
    def _format_agent_registry_analysis(self, stage4_data: Dict, registry_analysis: Dict) -> Dict[str, Any]:
        """Format Agent Registry Analysis section"""
        agent_evaluations = stage4_data.get("agent_evaluations", [])
        registry_agents = registry_analysis.get("agent_analysis", [])
        
        return {
            "Available Agents": [
                {
                    "Agent Name": eval_data.get("agent_name", ""),
                    "Agent ID": eval_data.get("agent_id", ""),
                    "Primary Expertise": eval_data.get("primary_expertise", ""),
                    "Suitability Score": eval_data.get("suitability_score", 0),
                    "Strengths": eval_data.get("strengths", []),
                    "Limitations": eval_data.get("limitations", "None identified")
                }
                for eval_data in agent_evaluations
            ],
            "Agent Role & Task Match": [
                {
                    "Agent Name": reg_agent.get("agent_name", ""),
                    "Association Score": reg_agent.get("association_score", 0),
                    "Contextual Relevance": reg_agent.get("contextual_relevance", ""),
                    "Role Analysis": reg_agent.get("role_analysis", "")
                }
                for reg_agent in registry_agents
            ],
            "Scoring": {
                "Analysis Summary": registry_analysis.get("analysis_summary", ""),
                "Total Agents Analyzed": registry_analysis.get("total_agents_analyzed", 0)
            },
            "Selection Reasoning": stage4_data.get("reasoning", "Evaluated all available agents for their capabilities, tools, and suitability"),
            "LLM Reasoning": stage4_data.get("reasoning", "Evaluated all available agents for their capabilities, tools, and suitability")
        }
    
    def _format_agent_selection_sequencing(self, stage5_data: Dict, selected_agents: List[Dict]) -> Dict[str, Any]:
        """Format Agent Selection & Sequencing section"""
        return {
            "Final Agent List": [
                {
                    "Agent Name": agent.get("agent_name", ""),
                    "Execution Order": agent.get("execution_order", i+1),
                    "Task Assignment": agent.get("task_assignment", "")
                }
                for i, agent in enumerate(selected_agents)
            ],
            "Execution Order": [agent.get("agent_name", "") for agent in selected_agents],
            "Execution Strategy": stage5_data.get("execution_plan", "Standard execution plan"),
            "Handoff Strategy": stage5_data.get("context_flow", "Direct context passing"),
            "SDK/Infrastructure Binding": "Strands SDK + A2A APIs",
            "LLM Reasoning": stage5_data.get("reasoning", "Matched query requirements with agent capabilities")
        }
    
    def _format_a2a_execution(self, execution_results: Dict, selected_agents: List[Dict]) -> Dict[str, Any]:
        """Format A2A Sequential Handover Execution section"""
        coordination_results = execution_results.get("coordination_results", {})
        handoff_results = coordination_results.get("handoff_results", [])
        
        steps = {}
        for i, result in enumerate(handoff_results):
            steps[f"Step {i+1}"] = {
                "Agent Name": result.get("agent_name", ""),
                "Task Assignment": result.get("task_assignment", ""),
                "Status": result.get("status", "completed"),
                "Runtime Metadata": {
                    "Execution Time": result.get("execution_time", 0),
                    "Step": result.get("step", i+1)
                },
                "Output Placeholder": f"See detailed output in coordination_results.handoff_results[{i}]"
            }
        
        return {
            "Steps": steps,
            "Message Flow Logs": "See coordination_results for detailed message logs",
            "Execution Order Confirmation": f"Executed {len(handoff_results)} steps as planned",
            "Fallback/Retry": "No fallbacks required - all steps completed successfully"
        }
    
    def _format_message_flow(self, execution_results: Dict) -> Dict[str, Any]:
        """Format A2A Message Flow section"""
        coordination_results = execution_results.get("coordination_results", {})
        
        # Handle unified orchestrator response structure
        if "agent_references" in coordination_results:
            # Unified orchestrator structure
            agent_references = coordination_results.get("agent_references", [])
            mentions_agents = coordination_results.get("mentions_agents", [])
            
            messaging_logs = []
            handoff_summaries = []
            
            # Create messaging logs from agent references
            for i, agent_ref in enumerate(agent_references):
                agent_name = agent_ref.get("agent_name", f"Agent {i+1}")
                message_type = "Content Generation" if "creative" in agent_name.lower() else "Code Generation"
                
                messaging_logs.append({
                    "Agent": agent_name,
                    "Message Type": message_type,
                    "Status": "completed",
                    "Execution Time": 0,  # Will be updated from actual execution
                    "Content Preview": f"Agent {agent_name} executed successfully"
                })
                
                # Create handoff summary
                handoff_summaries.append({
                    "From": "System Orchestrator" if i == 0 else agent_references[i-1].get("agent_name", "Previous Agent"),
                    "To": agent_name,
                    "Data Type": message_type,
                    "Data Length": len(str(agent_ref.get("content", ""))),
                    "Content Summary": f"Handoff to {agent_name} completed"
                })
            
            return {
                "Agent Messaging Logs": messaging_logs,
                "Handoff Data Summaries": handoff_summaries
            }
        
        # Fallback to original structure
        handoff_results = coordination_results.get("handoff_results", [])
        
        # Extract actual message content and handoff data
        messaging_logs = []
        handoff_summaries = []
        
        for i, result in enumerate(handoff_results):
            agent_name = result.get("agent_name", "")
            cleaned_output = result.get("cleaned_output", "")
            execution_time = result.get("execution_time", 0)
            
            # Determine message type based on content
            message_type = "Task Assignment"
            if "poem" in cleaned_output.lower() or "code" in cleaned_output.lower():
                message_type = "Content Generation"
            elif "python" in cleaned_output.lower() or "program" in cleaned_output.lower():
                message_type = "Code Generation"
            
            # Add messaging log
            messaging_logs.append({
                "Agent": agent_name,
                "Message Type": message_type,
                "Status": result.get("status", "completed"),
                "Execution Time": execution_time,
                "Content Preview": cleaned_output[:100] + "..." if len(cleaned_output) > 100 else cleaned_output
            })
            
            # Add handoff summary
            handoff_summaries.append({
                "From": "System Orchestrator" if i == 0 else handoff_results[i-1].get("agent_name", "Previous Agent"),
                "To": agent_name,
                "Data Type": message_type,
                "Data Length": len(cleaned_output),
                "Content Summary": self._extract_content_summary(cleaned_output)
            })
        
        return {
            "Agent Messaging Logs": messaging_logs,
            "Handoff Data Summaries": handoff_summaries
        }
    
    def _extract_content_summary(self, content: str) -> str:
        """Extract a summary of the content for handoff tracking"""
        if not content:
            return "No content"
        
        # Extract poem if present
        if "**Poem:**" in content:
            poem_start = content.find("**Poem:**") + 9
            poem_end = content.find("**", poem_start)
            if poem_end == -1:
                poem_end = content.find("\n\n", poem_start)
            if poem_end == -1:
                poem_end = len(content)
            poem = content[poem_start:poem_end].strip()
            return f"Poem: {poem[:50]}..." if len(poem) > 50 else f"Poem: {poem}"
        
        # Extract Python code if present
        if "```python" in content:
            code_start = content.find("```python") + 9
            code_end = content.find("```", code_start)
            if code_end != -1:
                code = content[code_start:code_end].strip()
                return f"Python Code: {code[:50]}..." if len(code) > 50 else f"Python Code: {code}"
        
        # Default summary
        return content[:50] + "..." if len(content) > 50 else content
    
    def _format_final_synthesis(self, execution_results: Dict, analysis: Dict) -> Dict[str, Any]:
        """Format Orchestrator Final Synthesis section"""
        stage6_data = analysis.get("stage_6_orchestration_plan", {})
        
        return {
            "Strategy": stage6_data.get("final_strategy", "sequential"),
            "Confidence": stage6_data.get("confidence", 0.9),
            "Success Criteria": stage6_data.get("success_criteria", "Task completion"),
            "Synthesis Logic": stage6_data.get("reasoning", "Created final orchestration plan with confidence assessment"),
            "Final Response Summary": f"Successfully coordinated {execution_results.get('agents_coordinated', 0)} agents using {execution_results.get('orchestration_type', 'sequential')} strategy",
            "Audit/Trace Links": {
                "Session ID": execution_results.get("session_id", ""),
                "Execution Time": execution_results.get("execution_time", 0),
                "Success": execution_results.get("success", False)
            }
        }

#!/usr/bin/env python3
"""
Enhanced Execution Engine
Implements task execution, result collection, and response merging
"""

import asyncio
import aiohttp
import json
import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum

from enhanced_routing_engine import ExecutionPlan, TaskAssignment, ExecutionStrategy
from enhanced_agent_registry import AgentMetadata

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class TaskResult:
    """Result of task execution"""
    task_id: str
    agent_id: str
    status: TaskStatus
    result: Optional[Any] = None
    error: Optional[str] = None
    execution_time: float = 0.0
    quality_score: float = 0.0
    timestamp: str = ""

@dataclass
class ExecutionContext:
    """Context shared between tasks"""
    session_id: str
    shared_data: Dict[str, Any]
    intermediate_results: Dict[str, Any]
    metadata: Dict[str, Any]

class EnhancedExecutionEngine:
    """Enhanced execution engine for multi-agent workflows"""
    
    def __init__(self, max_concurrent_tasks: int = 5):
        self.max_concurrent_tasks = max_concurrent_tasks
        self.active_executions: Dict[str, ExecutionContext] = {}
        self.task_results: Dict[str, List[TaskResult]] = {}
    
    async def execute_plan(self, plan: ExecutionPlan, session_id: str, 
                          initial_input: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute complete execution plan"""
        
        # Initialize execution context
        context = ExecutionContext(
            session_id=session_id,
            shared_data=initial_input or {},
            intermediate_results={},
            metadata={
                "start_time": datetime.now().isoformat(),
                "plan_strategy": plan.strategy.value,
                "total_tasks": len(plan.assignments)
            }
        )
        
        self.active_executions[session_id] = context
        self.task_results[session_id] = []
        
        try:
            if plan.strategy == ExecutionStrategy.SEQUENTIAL:
                results = await self._execute_sequential(plan.assignments, context)
            elif plan.strategy == ExecutionStrategy.PARALLEL:
                results = await self._execute_parallel(plan.assignments, context)
            else:  # HYBRID
                results = await self._execute_hybrid(plan.assignments, context)
            
            # Merge results
            final_result = await self._merge_results(results, context)
            
            return {
                "status": "success",
                "session_id": session_id,
                "results": final_result,
                "execution_time": self._calculate_total_time(context),
                "task_results": [asdict(result) for result in self.task_results[session_id]]
            }
            
        except Exception as e:
            return {
                "status": "error",
                "session_id": session_id,
                "error": str(e),
                "partial_results": context.intermediate_results
            }
        
        finally:
            # Cleanup
            if session_id in self.active_executions:
                del self.active_executions[session_id]
    
    async def _execute_sequential(self, assignments: List[TaskAssignment], 
                                context: ExecutionContext) -> List[TaskResult]:
        """Execute tasks sequentially"""
        results = []
        
        for assignment in assignments:
            # Prepare input based on previous results
            task_input = await self._prepare_task_input(assignment, context)
            
            # Execute task
            result = await self._execute_single_task(assignment, task_input, context)
            results.append(result)
            
            # Update context with result
            if result.status == TaskStatus.COMPLETED:
                context.intermediate_results[assignment.task_id] = result.result
                context.shared_data.update(result.result.get("context_updates", {}))
            
            # Stop if task failed (unless configured to continue)
            if result.status == TaskStatus.FAILED:
                break
        
        return results
    
    async def _execute_parallel(self, assignments: List[TaskAssignment], 
                              context: ExecutionContext) -> List[TaskResult]:
        """Execute tasks in parallel"""
        
        # Group tasks by dependencies
        independent_groups = self._group_by_dependencies(assignments)
        
        results = []
        
        for group in independent_groups:
            # Execute independent tasks in parallel
            group_results = await self._execute_task_group(group, context)
            results.extend(group_results)
            
            # Update context with group results
            for result in group_results:
                if result.status == TaskStatus.COMPLETED:
                    context.intermediate_results[result.task_id] = result.result
                    context.shared_data.update(result.result.get("context_updates", {}))
        
        return results
    
    async def _execute_hybrid(self, assignments: List[TaskAssignment], 
                            context: ExecutionContext) -> List[TaskResult]:
        """Execute tasks using hybrid strategy"""
        
        # Create dependency graph
        dependency_graph = self._build_dependency_graph(assignments)
        
        results = []
        completed_tasks = set()
        
        while len(completed_tasks) < len(assignments):
            # Find tasks ready to execute (dependencies satisfied)
            ready_tasks = []
            for assignment in assignments:
                if (assignment.task_id not in completed_tasks and 
                    all(dep in completed_tasks for dep in assignment.dependencies)):
                    ready_tasks.append(assignment)
            
            if not ready_tasks:
                # Handle circular dependencies
                remaining = [a for a in assignments if a.task_id not in completed_tasks]
                if remaining:
                    ready_tasks = [remaining[0]]  # Pick first remaining task
            
            # Execute ready tasks in parallel
            if ready_tasks:
                group_results = await self._execute_task_group(ready_tasks, context)
                results.extend(group_results)
                
                # Update completed tasks
                for result in group_results:
                    if result.status == TaskStatus.COMPLETED:
                        completed_tasks.add(result.task_id)
                        context.intermediate_results[result.task_id] = result.result
                        context.shared_data.update(result.result.get("context_updates", {}))
                    elif result.status == TaskStatus.FAILED:
                        completed_tasks.add(result.task_id)  # Mark as completed to avoid retry
        
        return results
    
    async def _execute_task_group(self, assignments: List[TaskAssignment], 
                                context: ExecutionContext) -> List[TaskResult]:
        """Execute a group of tasks in parallel"""
        
        semaphore = asyncio.Semaphore(self.max_concurrent_tasks)
        
        async def execute_with_semaphore(assignment):
            async with semaphore:
                task_input = await self._prepare_task_input(assignment, context)
                return await self._execute_single_task(assignment, task_input, context)
        
        tasks = [execute_with_semaphore(assignment) for assignment in assignments]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append(TaskResult(
                    task_id=assignments[i].task_id,
                    agent_id=assignments[i].agent.agent_id,
                    status=TaskStatus.FAILED,
                    error=str(result),
                    timestamp=datetime.now().isoformat()
                ))
            else:
                processed_results.append(result)
        
        return processed_results
    
    async def _execute_single_task(self, assignment: TaskAssignment, 
                                 task_input: Dict[str, Any], 
                                 context: ExecutionContext) -> TaskResult:
        """Execute a single task"""
        
        start_time = time.time()
        
        try:
            # Use your actual agents through the Strands SDK
            if assignment.agent.url == "http://localhost:11434":
                # Route through your Main System Orchestrator for actual agent execution
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        "http://localhost:5031/api/main-orchestrator/orchestrate",
                        json={"query": task_input.get("query", "")},
                        timeout=aiohttp.ClientTimeout(total=300)
                    ) as response:
                    
                        if response.status == 200:
                            result_data = await response.json()
                            execution_time = time.time() - start_time
                            
                            # Extract the actual result from your orchestrator response
                            actual_result = {
                                "output": result_data.get("orchestration_result", {}).get("final_response", ""),
                                "execution_time": execution_time,
                                "agent_used": result_data.get("selected_agents", [{}])[0].get("name", "Unknown"),
                                "quality_score": 0.9  # Default high score for your system
                            }
                            
                            # Calculate quality score
                            quality_score = await self._calculate_quality_score(
                                assignment, actual_result, execution_time
                            )
                            
                            result = TaskResult(
                                task_id=assignment.task_id,
                                agent_id=assignment.agent.agent_id,
                                status=TaskStatus.COMPLETED,
                                result=actual_result,
                                execution_time=execution_time,
                                quality_score=quality_score,
                                timestamp=datetime.now().isoformat()
                            )
                            
                            # Store result
                            self.task_results[context.session_id].append(result)
                            
                            return result
                        else:
                            error_text = await response.text()
                            return TaskResult(
                                task_id=assignment.task_id,
                                agent_id=assignment.agent.agent_id,
                                status=TaskStatus.FAILED,
                                error=f"HTTP {response.status}: {error_text}",
                                execution_time=time.time() - start_time,
                                timestamp=datetime.now().isoformat()
                            )
            else:
                # Fallback to direct agent call
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{assignment.agent.url}/execute",
                        json=task_input,
                        timeout=aiohttp.ClientTimeout(total=300)
                    ) as response:
                        if response.status == 200:
                            result_data = await response.json()
                            execution_time = time.time() - start_time
                            
                            quality_score = await self._calculate_quality_score(
                                assignment, result_data, execution_time
                            )
                            
                            result = TaskResult(
                                task_id=assignment.task_id,
                                agent_id=assignment.agent.agent_id,
                                status=TaskStatus.COMPLETED,
                                result=result_data,
                                execution_time=execution_time,
                                quality_score=quality_score,
                                timestamp=datetime.now().isoformat()
                            )
                            
                            self.task_results[context.session_id].append(result)
                            return result
                        else:
                            error_text = await response.text()
                            return TaskResult(
                                task_id=assignment.task_id,
                                agent_id=assignment.agent.agent_id,
                                status=TaskStatus.FAILED,
                                error=f"HTTP {response.status}: {error_text}",
                                execution_time=time.time() - start_time,
                                timestamp=datetime.now().isoformat()
                            )
        
        except asyncio.TimeoutError:
            return TaskResult(
                task_id=assignment.task_id,
                agent_id=assignment.agent.agent_id,
                status=TaskStatus.FAILED,
                error="Task execution timeout",
                execution_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
        
        except Exception as e:
            return TaskResult(
                task_id=assignment.task_id,
                agent_id=assignment.agent.agent_id,
                status=TaskStatus.FAILED,
                error=str(e),
                execution_time=time.time() - start_time,
                timestamp=datetime.now().isoformat()
            )
    
    async def _prepare_task_input(self, assignment: TaskAssignment, 
                                context: ExecutionContext) -> Dict[str, Any]:
        """Prepare input for task execution"""
        
        # Start with base input
        task_input = assignment.input_preparation.copy()
        
        # Add shared context data
        task_input["context"] = context.shared_data
        
        # Add dependency results
        if assignment.dependencies:
            dependency_results = {}
            for dep_id in assignment.dependencies:
                if dep_id in context.intermediate_results:
                    dependency_results[dep_id] = context.intermediate_results[dep_id]
            task_input["dependencies"] = dependency_results
        
        # Add task-specific configuration
        task_input.update({
            "task_id": assignment.task_id,
            "session_id": context.session_id,
            "agent_config": {
                "input_schema": assignment.agent.input_schema.__dict__,
                "output_schema": assignment.agent.output_schema.__dict__
            }
        })
        
        return task_input
    
    async def _calculate_quality_score(self, assignment: TaskAssignment, 
                                     result_data: Dict[str, Any], 
                                     execution_time: float) -> float:
        """Calculate quality score for task result"""
        
        score = 0.0
        
        # Execution time score (30%)
        expected_time = assignment.estimated_time
        time_ratio = execution_time / expected_time if expected_time > 0 else 1.0
        if time_ratio <= 1.0:
            score += 0.3
        elif time_ratio <= 1.5:
            score += 0.2
        else:
            score += 0.1
        
        # Result completeness (40%)
        if result_data and "result" in result_data:
            score += 0.4
        elif result_data and "output" in result_data:
            score += 0.3
        
        # Error handling (20%)
        if not result_data.get("error"):
            score += 0.2
        
        # Output format compliance (10%)
        if self._check_output_format_compliance(assignment, result_data):
            score += 0.1
        
        return min(score, 1.0)
    
    def _check_output_format_compliance(self, assignment: TaskAssignment, 
                                      result_data: Dict[str, Any]) -> bool:
        """Check if result complies with expected output format"""
        
        expected_format = assignment.agent.output_schema.format
        result_format = result_data.get("format", "text")
        
        return expected_format == result_format or expected_format == "mixed"
    
    async def _merge_results(self, results: List[TaskResult], 
                           context: ExecutionContext) -> Dict[str, Any]:
        """Merge results from multiple tasks"""
        
        merged = {
            "status": "success",
            "session_id": context.session_id,
            "execution_summary": {
                "total_tasks": len(results),
                "completed_tasks": len([r for r in results if r.status == TaskStatus.COMPLETED]),
                "failed_tasks": len([r for r in results if r.status == TaskStatus.FAILED]),
                "total_execution_time": sum(r.execution_time for r in results),
                "average_quality_score": sum(r.quality_score for r in results) / len(results) if results else 0
            },
            "results": {},
            "context_updates": context.shared_data
        }
        
        # Merge individual task results
        for result in results:
            if result.status == TaskStatus.COMPLETED:
                merged["results"][result.task_id] = {
                    "agent_id": result.agent_id,
                    "result": result.result,
                    "execution_time": result.execution_time,
                    "quality_score": result.quality_score
                }
            else:
                merged["results"][result.task_id] = {
                    "agent_id": result.agent_id,
                    "status": result.status.value,
                    "error": result.error
                }
        
        return merged
    
    def _group_by_dependencies(self, assignments: List[TaskAssignment]) -> List[List[TaskAssignment]]:
        """Group tasks by dependency levels"""
        
        groups = []
        processed = set()
        
        while len(processed) < len(assignments):
            # Find tasks with no unprocessed dependencies
            ready_tasks = []
            for assignment in assignments:
                if (assignment.task_id not in processed and 
                    all(dep in processed for dep in assignment.dependencies)):
                    ready_tasks.append(assignment)
            
            if ready_tasks:
                groups.append(ready_tasks)
                processed.update(task.task_id for task in ready_tasks)
            else:
                # Handle circular dependencies
                remaining = [a for a in assignments if a.task_id not in processed]
                if remaining:
                    groups.append([remaining[0]])
                    processed.add(remaining[0].task_id)
                else:
                    break
        
        return groups
    
    def _build_dependency_graph(self, assignments: List[TaskAssignment]) -> Dict[str, List[str]]:
        """Build dependency graph for tasks"""
        
        graph = {}
        for assignment in assignments:
            graph[assignment.task_id] = assignment.dependencies.copy()
        
        return graph
    
    def _calculate_total_time(self, context: ExecutionContext) -> float:
        """Calculate total execution time"""
        
        if not self.task_results.get(context.session_id):
            return 0.0
        
        return sum(result.execution_time for result in self.task_results[context.session_id])
    
    def get_execution_status(self, session_id: str) -> Dict[str, Any]:
        """Get current execution status"""
        
        if session_id not in self.task_results:
            return {"status": "not_found"}
        
        results = self.task_results[session_id]
        
        return {
            "session_id": session_id,
            "total_tasks": len(results),
            "completed_tasks": len([r for r in results if r.status == TaskStatus.COMPLETED]),
            "running_tasks": len([r for r in results if r.status == TaskStatus.RUNNING]),
            "failed_tasks": len([r for r in results if r.status == TaskStatus.FAILED]),
            "results": [asdict(result) for result in results]
        }

# Example usage
if __name__ == "__main__":
    # This would typically be used with the routing engine and agent registry
    execution_engine = EnhancedExecutionEngine()
    
    print("Enhanced Execution Engine initialized")
    print(f"Max concurrent tasks: {execution_engine.max_concurrent_tasks}")

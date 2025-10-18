#!/usr/bin/env python3
"""
Enhanced Routing Engine
Implements intelligent agent selection and execution strategy decision
"""

import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from enhanced_query_understanding import QueryAnalysis, TaskType
from enhanced_agent_registry import AgentMetadata, AgentCapability

class ExecutionStrategy(Enum):
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    HYBRID = "hybrid"

@dataclass
class TaskAssignment:
    """Task assignment to specific agent"""
    task_id: str
    task_type: TaskType
    agent: AgentMetadata
    priority: int
    dependencies: List[str]
    estimated_time: float
    input_preparation: Dict[str, Any]

@dataclass
class ExecutionPlan:
    """Complete execution plan for multi-agent workflow"""
    strategy: ExecutionStrategy
    assignments: List[TaskAssignment]
    estimated_total_time: float
    critical_path: List[str]
    parallel_groups: List[List[str]]

class EnhancedRoutingEngine:
    """Intelligent routing engine for agent selection and task assignment"""
    
    def __init__(self, agent_registry):
        self.agent_registry = agent_registry
        self.execution_history = {}
    
    def create_execution_plan(self, query_analysis: QueryAnalysis, available_agents: List[AgentMetadata]) -> ExecutionPlan:
        """Create optimal execution plan based on query analysis"""
        
        # Step 1: Determine execution strategy
        strategy = self._determine_execution_strategy(query_analysis)
        
        # Step 2: Create task assignments
        assignments = self._create_task_assignments(query_analysis, available_agents)
        
        # Step 3: Optimize execution order
        optimized_assignments = self._optimize_execution_order(assignments, strategy)
        
        # Step 4: Calculate timing and critical path
        estimated_time, critical_path = self._calculate_execution_timing(optimized_assignments)
        
        # Step 5: Identify parallel execution groups
        parallel_groups = self._identify_parallel_groups(optimized_assignments)
        
        return ExecutionPlan(
            strategy=strategy,
            assignments=optimized_assignments,
            estimated_total_time=estimated_time,
            critical_path=critical_path,
            parallel_groups=parallel_groups
        )
    
    def _determine_execution_strategy(self, analysis: QueryAnalysis) -> ExecutionStrategy:
        """Determine optimal execution strategy"""
        
        # Check dependencies
        if analysis.dependencies:
            return ExecutionStrategy.SEQUENTIAL
        
        # Check complexity
        if analysis.complexity == "complex" and len(analysis.task_types) > 2:
            return ExecutionStrategy.HYBRID
        
        # Check if tasks can run in parallel
        if analysis.execution_strategy == "parallel":
            return ExecutionStrategy.PARALLEL
        
        # Default to sequential for safety
        return ExecutionStrategy.SEQUENTIAL
    
    def _create_task_assignments(self, analysis: QueryAnalysis, available_agents: List[AgentMetadata]) -> List[TaskAssignment]:
        """Create task assignments for each task type"""
        
        assignments = []
        
        for i, task_type in enumerate(analysis.task_types):
            # Find best agent for this task
            best_agent = self._find_best_agent_for_task(task_type, available_agents)
            
            if best_agent:
                assignment = TaskAssignment(
                    task_id=f"task_{i+1}",
                    task_type=task_type,
                    agent=best_agent,
                    priority=i,
                    dependencies=self._get_task_dependencies(task_type, analysis.dependencies),
                    estimated_time=self._estimate_task_time(task_type, best_agent),
                    input_preparation=self._prepare_task_input(task_type, analysis)
                )
                assignments.append(assignment)
        
        return assignments
    
    def _find_best_agent_for_task(self, task_type: TaskType, available_agents: List[AgentMetadata]) -> Optional[AgentMetadata]:
        """Find the best agent for a specific task"""
        
        # Filter agents with required capability
        capable_agents = [
            agent for agent in available_agents 
            if AgentCapability(task_type.value) in agent.capabilities
        ]
        
        if not capable_agents:
            return None
        
        # Score agents based on performance and availability
        best_agent = None
        best_score = 0
        
        for agent in capable_agents:
            score = self._calculate_agent_task_score(agent, task_type)
            if score > best_score:
                best_score = score
                best_agent = agent
        
        return best_agent
    
    def _calculate_agent_task_score(self, agent: AgentMetadata, task_type: TaskType) -> float:
        """Calculate agent suitability score for specific task"""
        score = 0.0
        
        # Performance metrics (40%)
        if agent.performance_metrics:
            avg_performance = sum(agent.performance_metrics.values()) / len(agent.performance_metrics)
            score += avg_performance * 0.4
        else:
            score += 0.5 * 0.4  # Default score
        
        # Health status (30%)
        if agent.status == "active":
            score += 0.3
        elif agent.status == "unknown":
            score += 0.15
        
        # Capability match (20%)
        # All agents already match capability, but check for specialization
        if task_type.value in agent.description.lower():
            score += 0.2
        else:
            score += 0.1
        
        # Load balancing (10%)
        recent_executions = self._get_recent_executions(agent.agent_id)
        if recent_executions < 5:  # Not overloaded
            score += 0.1
        
        return score
    
    def _get_task_dependencies(self, task_type: TaskType, dependencies: List[str]) -> List[str]:
        """Get dependencies for specific task"""
        task_deps = []
        for dep in dependencies:
            if task_type.value in dep.lower():
                task_deps.append(dep)
        return task_deps
    
    def _estimate_task_time(self, task_type: TaskType, agent: AgentMetadata) -> float:
        """Estimate execution time for task"""
        base_times = {
            TaskType.SUMMARIZE: 30.0,
            TaskType.CREATE_PRESENTATION: 120.0,
            TaskType.ANALYZE_DATA: 60.0,
            TaskType.GENERATE_CONTENT: 45.0,
            TaskType.CODE_GENERATION: 90.0,
            TaskType.RESEARCH: 180.0,
            TaskType.TRANSLATE: 20.0,
            TaskType.CALCULATE: 5.0,
            TaskType.MULTI_STEP: 150.0
        }
        
        base_time = base_times.get(task_type, 60.0)
        
        # Adjust based on agent performance
        if agent.performance_metrics and "execution_time" in agent.performance_metrics:
            performance_factor = agent.performance_metrics["execution_time"] / base_time
            base_time *= performance_factor
        
        return base_time
    
    def _prepare_task_input(self, task_type: TaskType, analysis: QueryAnalysis) -> Dict[str, Any]:
        """Prepare input data for task execution"""
        return {
            "query": analysis.original_query,
            "task_type": task_type.value,
            "context": analysis.context_requirements,
            "complexity": analysis.complexity
        }
    
    def _optimize_execution_order(self, assignments: List[TaskAssignment], strategy: ExecutionStrategy) -> List[TaskAssignment]:
        """Optimize execution order based on dependencies and strategy"""
        
        if strategy == ExecutionStrategy.SEQUENTIAL:
            # Sort by priority and dependencies
            return sorted(assignments, key=lambda x: (len(x.dependencies), x.priority))
        
        elif strategy == ExecutionStrategy.PARALLEL:
            # Group by dependencies - independent tasks can run in parallel
            return assignments
        
        else:  # HYBRID
            # Complex optimization considering both dependencies and parallelization opportunities
            return self._hybrid_optimization(assignments)
    
    def _hybrid_optimization(self, assignments: List[TaskAssignment]) -> List[TaskAssignment]:
        """Optimize for hybrid execution strategy"""
        
        # First, identify independent task groups
        independent_groups = []
        remaining_assignments = assignments.copy()
        
        while remaining_assignments:
            # Find tasks with no dependencies
            independent_tasks = [
                task for task in remaining_assignments 
                if not task.dependencies
            ]
            
            if independent_tasks:
                independent_groups.append(independent_tasks)
                # Remove processed tasks and update dependencies
                for task in independent_tasks:
                    remaining_assignments.remove(task)
                    # Remove this task from other tasks' dependencies
                    for other_task in remaining_assignments:
                        if task.task_id in other_task.dependencies:
                            other_task.dependencies.remove(task.task_id)
            else:
                # Handle circular dependencies by prioritizing by estimated time
                sorted_tasks = sorted(remaining_assignments, key=lambda x: x.estimated_time)
                independent_groups.append([sorted_tasks[0]])
                remaining_assignments.remove(sorted_tasks[0])
        
        # Flatten groups back to list
        optimized = []
        for group in independent_groups:
            optimized.extend(group)
        
        return optimized
    
    def _calculate_execution_timing(self, assignments: List[TaskAssignment]) -> Tuple[float, List[str]]:
        """Calculate total execution time and critical path"""
        
        if not assignments:
            return 0.0, []
        
        # For sequential execution
        total_time = sum(task.estimated_time for task in assignments)
        
        # Identify critical path (longest dependency chain)
        critical_path = []
        for task in assignments:
            if not task.dependencies:  # Root tasks
                path = self._find_longest_path(task, assignments)
                if len(path) > len(critical_path):
                    critical_path = path
        
        return total_time, critical_path
    
    def _find_longest_path(self, start_task: TaskAssignment, all_tasks: List[TaskAssignment]) -> List[str]:
        """Find longest dependency path from start task"""
        
        def find_dependent_tasks(task_id: str) -> List[TaskAssignment]:
            return [t for t in all_tasks if task_id in t.dependencies]
        
        def dfs_path(task: TaskAssignment, current_path: List[str]) -> List[str]:
            current_path.append(task.task_id)
            dependents = find_dependent_tasks(task.task_id)
            
            if not dependents:
                return current_path.copy()
            
            longest_path = current_path.copy()
            for dependent in dependents:
                path = dfs_path(dependent, current_path.copy())
                if len(path) > len(longest_path):
                    longest_path = path
            
            return longest_path
        
        return dfs_path(start_task, [])
    
    def _identify_parallel_groups(self, assignments: List[TaskAssignment]) -> List[List[str]]:
        """Identify groups of tasks that can execute in parallel"""
        
        parallel_groups = []
        processed_tasks = set()
        
        for task in assignments:
            if task.task_id in processed_tasks:
                continue
            
            # Find tasks that can run in parallel with this one
            parallel_group = [task.task_id]
            processed_tasks.add(task.task_id)
            
            for other_task in assignments:
                if (other_task.task_id not in processed_tasks and 
                    not self._has_dependency_conflict(task, other_task)):
                    parallel_group.append(other_task.task_id)
                    processed_tasks.add(other_task.task_id)
            
            if len(parallel_group) > 1:
                parallel_groups.append(parallel_group)
        
        return parallel_groups
    
    def _has_dependency_conflict(self, task1: TaskAssignment, task2: TaskAssignment) -> bool:
        """Check if two tasks have dependency conflicts"""
        return (task1.task_id in task2.dependencies or 
                task2.task_id in task1.dependencies)
    
    def _get_recent_executions(self, agent_id: str) -> int:
        """Get number of recent executions for load balancing"""
        # This would typically query the execution history
        return self.execution_history.get(agent_id, 0)
    
    def update_execution_history(self, agent_id: str, execution_time: float, success: bool):
        """Update execution history for load balancing"""
        if agent_id not in self.execution_history:
            self.execution_history[agent_id] = 0
        self.execution_history[agent_id] += 1

# Example usage
if __name__ == "__main__":
    from enhanced_agent_registry import create_example_agents, EnhancedAgentRegistry
    
    # Create registry and register agents
    registry = EnhancedAgentRegistry()
    agents = create_example_agents()
    for agent in agents:
        registry.register_agent(agent)
    
    # Create routing engine
    routing_engine = EnhancedRoutingEngine(registry)
    
    # Test with example query analysis
    from enhanced_query_understanding import QueryAnalysis, TaskType, InputType
    
    test_analysis = QueryAnalysis(
        original_query="Summarize this research paper and create a PowerPoint presentation.",
        task_types=[TaskType.SUMMARIZE, TaskType.CREATE_PRESENTATION],
        input_type=InputType.DOCUMENT,
        complexity="moderate",
        requires_multiple_agents=True,
        execution_strategy="sequential",
        dependencies=["task_2 depends on task_1"],
        context_requirements={"domain": "research", "format": "academic"}
    )
    
    # Create execution plan
    plan = routing_engine.create_execution_plan(test_analysis, registry.get_all_agents())
    
    print("Execution Plan:")
    print(f"Strategy: {plan.strategy.value}")
    print(f"Estimated Time: {plan.estimated_total_time:.1f} seconds")
    print(f"Critical Path: {' -> '.join(plan.critical_path)}")
    
    print("\nTask Assignments:")
    for assignment in plan.assignments:
        print(f"- {assignment.task_id}: {assignment.task_type.value} -> {assignment.agent.name}")
    
    print(f"\nParallel Groups: {plan.parallel_groups}")




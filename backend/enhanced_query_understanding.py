#!/usr/bin/env python3
"""
Enhanced Query Understanding Module
Implements intent classification, task decomposition, and context handling
"""

import json
import requests
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

class TaskType(Enum):
    SUMMARIZE = "summarize"
    CREATE_PRESENTATION = "create_presentation"
    ANALYZE_DATA = "analyze_data"
    GENERATE_CONTENT = "generate_content"
    CODE_GENERATION = "code_generation"
    RESEARCH = "research"
    TRANSLATE = "translate"
    CALCULATE = "calculate"
    MULTI_STEP = "multi_step"

class InputType(Enum):
    TEXT = "text"
    DOCUMENT = "document"
    DATA = "data"
    IMAGE = "image"
    URL = "url"
    QUERY = "query"

@dataclass
class QueryAnalysis:
    """Structured query analysis result"""
    original_query: str
    task_types: List[TaskType]
    input_type: InputType
    complexity: str  # simple, moderate, complex
    requires_multiple_agents: bool
    execution_strategy: str  # sequential, parallel, hybrid
    dependencies: List[str]
    context_requirements: Dict[str, Any]

class EnhancedQueryUnderstanding:
    """Enhanced query understanding with LLM-based analysis"""
    
    def __init__(self, ollama_url: str = "http://localhost:11434", model: str = "granite4:micro"):
        self.ollama_url = ollama_url
        self.model = model
        
    def analyze_query(self, query: str, context: Optional[Dict] = None) -> QueryAnalysis:
        """Comprehensive query analysis using LLM"""
        
        analysis_prompt = f"""
Analyze this user query and provide a structured analysis. Consider the following aspects:

1. **Task Types**: What specific tasks are being requested?
2. **Input Type**: What type of input is being processed?
3. **Complexity**: How complex is this request?
4. **Agent Requirements**: Does this need multiple specialized agents?
5. **Execution Strategy**: Should tasks run sequentially, in parallel, or hybrid?
6. **Dependencies**: Are there dependencies between tasks?

Query: "{query}"
Context: {context or "None"}

Respond with JSON only:
{{
    "task_types": ["task_type_1", "task_type_2"],
    "input_type": "text|document|data|image|url|query",
    "complexity": "simple|moderate|complex",
    "requires_multiple_agents": boolean,
    "execution_strategy": "sequential|parallel|hybrid",
    "dependencies": ["task1 depends on task2"],
    "context_requirements": {{
        "domain": "domain_name",
        "specialized_knowledge": ["knowledge_area_1", "knowledge_area_2"],
        "tools_needed": ["tool1", "tool2"]
    }},
    "reasoning": "explanation of the analysis"
}}
"""
        
        try:
            response = requests.post(f"{self.ollama_url}/api/generate", 
                json={
                    "model": self.model,
                    "prompt": analysis_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "max_tokens": 800
                    }
                }, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                llm_response = result.get('response', '').strip()
                
                # Extract JSON from response
                import re
                json_match = re.search(r'\{.*\}', llm_response, re.DOTALL)
                if json_match:
                    analysis_data = json.loads(json_match.group())
                    return self._parse_analysis_result(query, analysis_data)
            
        except Exception as e:
            print(f"LLM analysis failed: {e}")
        
        # Fallback analysis
        return self._fallback_analysis(query)
    
    def _parse_analysis_result(self, query: str, data: Dict) -> QueryAnalysis:
        """Parse LLM analysis result into structured format"""
        
        task_types = [TaskType(task) for task in data.get('task_types', [])]
        input_type = InputType(data.get('input_type', 'query'))
        
        return QueryAnalysis(
            original_query=query,
            task_types=task_types,
            input_type=input_type,
            complexity=data.get('complexity', 'simple'),
            requires_multiple_agents=data.get('requires_multiple_agents', False),
            execution_strategy=data.get('execution_strategy', 'sequential'),
            dependencies=data.get('dependencies', []),
            context_requirements=data.get('context_requirements', {})
        )
    
    def _fallback_analysis(self, query: str) -> QueryAnalysis:
        """Fallback analysis when LLM fails"""
        query_lower = query.lower()
        
        # Simple keyword-based fallback
        task_types = []
        if any(word in query_lower for word in ['summarize', 'summary', 'brief']):
            task_types.append(TaskType.SUMMARIZE)
        if any(word in query_lower for word in ['presentation', 'slides', 'powerpoint']):
            task_types.append(TaskType.CREATE_PRESENTATION)
        if any(word in query_lower for word in ['analyze', 'analysis', 'data']):
            task_types.append(TaskType.ANALYZE_DATA)
        if any(word in query_lower for word in ['write', 'create', 'generate', 'poem', 'story']):
            task_types.append(TaskType.GENERATE_CONTENT)
        if any(word in query_lower for word in ['code', 'function', 'program', 'python']):
            task_types.append(TaskType.CODE_GENERATION)
        
        if not task_types:
            task_types = [TaskType.MULTI_STEP]
        
        return QueryAnalysis(
            original_query=query,
            task_types=task_types,
            input_type=InputType.TEXT,
            complexity='simple' if len(query.split()) < 20 else 'moderate',
            requires_multiple_agents=len(task_types) > 1,
            execution_strategy='sequential',
            dependencies=[],
            context_requirements={}
        )
    
    def decompose_tasks(self, analysis: QueryAnalysis) -> List[Dict[str, Any]]:
        """Decompose complex queries into individual tasks"""
        tasks = []
        
        for i, task_type in enumerate(analysis.task_types):
            task = {
                "task_id": f"task_{i+1}",
                "task_type": task_type.value,
                "description": self._generate_task_description(task_type, analysis.original_query),
                "input_requirements": self._get_input_requirements(task_type),
                "output_format": self._get_output_format(task_type),
                "dependencies": [dep for dep in analysis.dependencies if f"task_{i}" in dep],
                "estimated_complexity": analysis.complexity
            }
            tasks.append(task)
        
        return tasks
    
    def _generate_task_description(self, task_type: TaskType, original_query: str) -> str:
        """Generate specific task description based on type"""
        descriptions = {
            TaskType.SUMMARIZE: f"Summarize the provided content: {original_query}",
            TaskType.CREATE_PRESENTATION: f"Create a presentation based on: {original_query}",
            TaskType.ANALYZE_DATA: f"Analyze the data: {original_query}",
            TaskType.GENERATE_CONTENT: f"Generate creative content: {original_query}",
            TaskType.CODE_GENERATION: f"Generate code: {original_query}",
            TaskType.RESEARCH: f"Research information: {original_query}",
            TaskType.TRANSLATE: f"Translate content: {original_query}",
            TaskType.CALCULATE: f"Perform calculations: {original_query}",
            TaskType.MULTI_STEP: f"Process complex request: {original_query}"
        }
        return descriptions.get(task_type, f"Handle request: {original_query}")
    
    def _get_input_requirements(self, task_type: TaskType) -> Dict[str, Any]:
        """Get input requirements for task type"""
        requirements = {
            TaskType.SUMMARIZE: {"type": "text", "max_length": 10000},
            TaskType.CREATE_PRESENTATION: {"type": "text", "format": "structured"},
            TaskType.ANALYZE_DATA: {"type": "data", "formats": ["csv", "json", "text"]},
            TaskType.GENERATE_CONTENT: {"type": "prompt", "max_length": 1000},
            TaskType.CODE_GENERATION: {"type": "specification", "languages": ["python", "javascript"]},
            TaskType.RESEARCH: {"type": "query", "max_length": 500},
            TaskType.TRANSLATE: {"type": "text", "languages": ["auto-detect"]},
            TaskType.CALCULATE: {"type": "expression", "format": "text"},
            TaskType.MULTI_STEP: {"type": "mixed", "flexible": True}
        }
        return requirements.get(task_type, {"type": "text"})
    
    def _get_output_format(self, task_type: TaskType) -> Dict[str, Any]:
        """Get expected output format for task type"""
        formats = {
            TaskType.SUMMARIZE: {"format": "text", "max_length": 1000},
            TaskType.CREATE_PRESENTATION: {"format": "file", "type": "pptx"},
            TaskType.ANALYZE_DATA: {"format": "structured", "type": "json"},
            TaskType.GENERATE_CONTENT: {"format": "text", "structured": True},
            TaskType.CODE_GENERATION: {"format": "code", "type": "python"},
            TaskType.RESEARCH: {"format": "structured", "type": "json"},
            TaskType.TRANSLATE: {"format": "text", "preserve_formatting": True},
            TaskType.CALCULATE: {"format": "result", "type": "number"},
            TaskType.MULTI_STEP: {"format": "mixed", "flexible": True}
        }
        return formats.get(task_type, {"format": "text"})

# Example usage
if __name__ == "__main__":
    query_understanding = EnhancedQueryUnderstanding()
    
    # Test query
    test_query = "Summarize this research paper and create a PowerPoint presentation."
    analysis = query_understanding.analyze_query(test_query)
    tasks = query_understanding.decompose_tasks(analysis)
    
    print("Query Analysis:")
    print(f"Task Types: {[t.value for t in analysis.task_types]}")
    print(f"Requires Multiple Agents: {analysis.requires_multiple_agents}")
    print(f"Execution Strategy: {analysis.execution_strategy}")
    
    print("\nTask Decomposition:")
    for task in tasks:
        print(f"- {task['task_type']}: {task['description']}")




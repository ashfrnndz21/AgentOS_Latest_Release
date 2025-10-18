# Dynamic Agent Adaptation Strategy

## The Challenge
How do we create prompts that work with ANY agents (not just hardcoded "Technical" or "Creative" agents)?

## The Solution: Capability-Based Dynamic Prompt Generation

---

## 🔑 Key Principle: Use Agent Metadata, Not Agent Names

Instead of hardcoding:
```python
# ❌ BAD - Hardcoded
if "4G RAN" in agent.name:
    instruction = "Explain technical metrics. NO POEMS."
elif "Creative" in agent.name:
    instruction = "Write poem. NO TECHNICAL EXPLANATION."
```

We use:
```python
# ✅ GOOD - Dynamic based on capabilities
agent_capabilities = agent.capabilities  # e.g., ['technical', 'network_analysis']
agent_specialization = agent.specialization  # e.g., 'telecommunications'
task_keywords = extract_keywords(task)  # e.g., ['explain', 'analyze']

# Generate boundaries dynamically
boundaries = generate_boundaries_from_capabilities(agent, task)
```

---

## 🎯 How It Works: 3-Layer Dynamic System

### Layer 1: Capability-Based Agent Classification
When a new agent is registered, we extract:

```json
{
  "agent_id": "new-agent-123",
  "name": "Data Science Agent",
  "capabilities": ["data_analysis", "machine_learning", "visualization"],
  "specialization": "predictive_analytics",
  "domain": "data_science",
  "keywords": ["analyze", "predict", "model", "data", "statistics"]
}
```

**Classification Logic (Dynamic):**
```python
def classify_agent_type(agent):
    """Dynamically determine agent type from capabilities"""
    
    # Technical agents
    if any(kw in agent.capabilities for kw in ['technical', 'analysis', 'research', 'data']):
        return 'analytical'
    
    # Creative agents
    elif any(kw in agent.capabilities for kw in ['creative', 'poetry', 'writing', 'slogan']):
        return 'creative'
    
    # Code agents
    elif any(kw in agent.capabilities for kw in ['code', 'programming', 'development']):
        return 'technical_implementation'
    
    # General agents (can do multiple things)
    else:
        return 'general'
```

---

### Layer 2: Task-to-Capability Matching

**Query Analysis (Dynamic):**
```python
def analyze_query_tasks(query):
    """Extract tasks and their required capability types"""
    
    # Parse query for task structure
    tasks = split_by_connectors(query)  # ["explain X", "create poem"]
    
    task_requirements = []
    for task in tasks:
        # Analyze what type of capability this task needs
        if any(word in task.lower() for word in ['explain', 'analyze', 'research', 'identify']):
            task_requirements.append({
                'task': task,
                'required_type': 'analytical',
                'required_keywords': ['analysis', 'research', 'technical']
            })
        
        elif any(word in task.lower() for word in ['poem', 'story', 'creative', 'funny', 'slogan']):
            task_requirements.append({
                'task': task,
                'required_type': 'creative',
                'required_keywords': ['creative', 'poetry', 'writing']
            })
        
        elif any(word in task.lower() for word in ['code', 'program', 'implement', 'function']):
            task_requirements.append({
                'task': task,
                'required_type': 'technical_implementation',
                'required_keywords': ['code', 'programming', 'python']
            })
    
    return task_requirements
```

---

### Layer 3: Dynamic Boundary Generation

**The Magic - This works for ANY agent:**

```python
def generate_dynamic_boundaries(agent, assigned_task, all_tasks):
    """Generate MUST/MUST NOT based on agent capabilities and task context"""
    
    # Step 1: What CAN this agent do? (from capabilities)
    agent_type = classify_agent_type(agent)
    agent_can_do = agent.capabilities
    agent_keywords = agent.keywords
    
    # Step 2: What SHOULD this agent do? (from assigned task)
    task_type = classify_task_type(assigned_task)
    task_keywords = extract_task_keywords(assigned_task)
    
    # Step 3: What are OTHER agents doing? (to avoid overlap)
    other_tasks = [t for t in all_tasks if t != assigned_task]
    other_task_types = [classify_task_type(t) for t in other_tasks]
    
    # Step 4: Generate MUST (intersection of agent capabilities + task requirements)
    must_do = []
    for capability in agent_can_do:
        if any(kw in task_keywords for kw in get_keywords_for_capability(capability)):
            must_do.append(capability)
    
    # Step 5: Generate MUST NOT (other task types this agent shouldn't do)
    must_not_do = []
    for other_type in other_task_types:
        if other_type != task_type:
            # Find what OTHER agents are doing that THIS agent shouldn't
            other_capabilities = get_capabilities_for_type(other_type)
            must_not_do.extend([c for c in other_capabilities if c not in agent_can_do])
    
    return {
        'must_focus_on': must_do,
        'must_avoid': must_not_do,
        'task_specific_keywords': task_keywords
    }
```

---

## 🌟 Real-World Examples

### Example 1: New "Marketing Analytics Agent"
**Agent Definition:**
```json
{
  "name": "Marketing Analytics Agent",
  "capabilities": ["campaign_analysis", "customer_segmentation", "ROI_calculation"],
  "specialization": "marketing_analytics",
  "keywords": ["campaign", "customer", "segment", "ROI", "analytics"]
}
```

**Query:** "Analyze campaign performance and create a marketing slogan"

**Dynamic Classification:**
- Agent type: `analytical` (from 'campaign_analysis', 'analytics')
- Task 1: "Analyze campaign performance" → matches agent's keywords ✅
- Task 2: "Create marketing slogan" → NO match with agent's capabilities ❌

**Dynamic Boundaries Generated:**
```
MUST:
- Analyze campaign performance metrics
- Use your campaign_analysis and customer_segmentation capabilities
- Focus on ROI and analytics

MUST NOT:
- Create slogans or marketing copy (assign to creative agent)
- Generate creative content
```

---

### Example 2: New "Code Generation Agent"
**Agent Definition:**
```json
{
  "name": "Code Generation Agent",
  "capabilities": ["python", "code_generation", "debugging"],
  "specialization": "software_development",
  "keywords": ["code", "python", "function", "program", "implement"]
}
```

**Query:** "Write Python code to analyze network data and explain how it works"

**Dynamic Classification:**
- Task 1: "Write Python code" → matches `code_generation` ✅
- Task 2: "Explain how it works" → could be done by code agent OR documentation agent

**Dynamic Boundaries Generated:**
```
Task 1 (Code Generation Agent):
  MUST:
  - Write Python code for network data analysis
  - Use your python and code_generation capabilities
  - Include code comments
  
  MUST NOT:
  - Write separate documentation or tutorials
  - Create non-code explanations (if another agent is assigned)

Task 2 (Technical Writer Agent, if available):
  MUST:
  - Explain the code logic in plain language
  - Use documentation and technical_writing capabilities
  
  MUST NOT:
  - Write or modify code
  - Include code implementations
```

---

## 🔄 How It Adapts to New Agents

### Scenario: User creates "Video Content Creator Agent"

**New Agent Registration:**
```json
{
  "name": "Video Content Creator",
  "capabilities": ["video_scripting", "storyboarding", "visual_content"],
  "specialization": "video_production",
  "keywords": ["video", "script", "storyboard", "visual", "scene"]
}
```

**Query:** "Create a video script about network latency"

**Automatic Adaptation:**

1. **Agent Discovery**: System finds "Video Content Creator" agent
2. **Capability Extraction**: Identifies `video_scripting` capability
3. **Task Matching**: "Create video script" matches `video_scripting` keyword
4. **Boundary Generation** (automatic):
   ```
   MUST:
   - Create video script content
   - Use your video_scripting and storyboarding capabilities
   - Focus on visual storytelling
   
   MUST NOT:
   - Write technical documentation (if other agents available)
   - Generate non-video content formats
   ```

**No code changes needed!** The system adapts automatically.

---

## 🛠️ Implementation in Orchestrator

### Updated `analyze_query_with_qwen3` Prompt:

```python
def analyze_query_with_qwen3(self, query: str) -> Dict[str, Any]:
    # Get available agents dynamically
    available_agents = self.registered_agents.values()
    
    # Build dynamic agent capability map
    agent_capability_map = {}
    for agent in available_agents:
        agent_capability_map[agent.name] = {
            'capabilities': agent.capabilities,
            'specialization': agent.specialization,
            'type': classify_agent_type(agent),  # Dynamic classification
            'keywords': agent.keywords
        }
    
    # Dynamic prompt with agent capabilities
    prompt = f"""
Analyze this query: "{query}"

Available agents and their capabilities:
{json.dumps(agent_capability_map, indent=2)}

Step 1: Parse query into separate tasks (split by "and then", "then [verb]", etc.)
Step 2: For each task, determine what TYPE of capability is needed:
        - analytical: research, analysis, data processing
        - creative: poems, stories, slogans, humor
        - technical: code, implementation, systems
        - (match to actual agent capabilities above)

Step 3: Match each task to the best agent based on their capabilities
Step 4: Classify as SINGLE-AGENT if 1 task, MULTI-AGENT if 2+ tasks

CRITICAL RULE:
- If 2+ tasks with different capability types → MULTI-AGENT
- If only 1 task → SINGLE-AGENT
"""
```

### Updated Task Decomposition:

```python
def generate_task_decomposition(self, query, selected_agents, task_analysis):
    """Generate task decomposition with dynamic boundaries"""
    
    tasks = []
    for i, task_desc in enumerate(task_analysis['workflow_steps']):
        agent = selected_agents[i]
        
        # Dynamic boundary generation
        boundaries = generate_dynamic_boundaries(
            agent=agent,
            assigned_task=task_desc,
            all_tasks=task_analysis['workflow_steps']
        )
        
        tasks.append({
            'agent_id': agent.agent_id,
            'agent_name': agent.name,
            'task': task_desc,
            'must_do': boundaries['must_focus_on'],
            'must_not_do': boundaries['must_avoid'],
            'required_capabilities': boundaries['task_specific_keywords']
        })
    
    return tasks
```

---

## ✅ Benefits of This Approach

1. **✅ Works with ANY agent** - No hardcoded agent names
2. **✅ Self-adapting** - New agents automatically integrated
3. **✅ Capability-based** - Uses actual agent metadata
4. **✅ Context-aware** - Considers what other agents are doing
5. **✅ Prevents overlap** - Dynamically generates MUST NOT based on other tasks
6. **✅ Scalable** - Add 100 agents, system still works

---

## 🎯 Summary

Instead of hardcoding "Technical Agent" or "Creative Agent", we:

1. **Extract** capabilities from agent metadata
2. **Classify** agents dynamically based on capabilities
3. **Match** tasks to agents based on capability alignment
4. **Generate** boundaries (MUST/MUST NOT) based on:
   - Agent's actual capabilities
   - Task requirements
   - What other agents are doing

This makes the orchestrator **truly adaptive** to any agents users create!



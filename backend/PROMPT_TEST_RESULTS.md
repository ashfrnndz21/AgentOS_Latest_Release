# Granite4:Micro Prompt Testing Results

## Test Date
October 7, 2025

## Model Tested
`granite4:micro`

## Summary of Findings

### 🎯 Key Discovery
Granite4:micro performs **significantly better** when given:
1. **Explicit classification rules** in the prompt
2. **Step-by-step instructions** for task decomposition
3. **MUST/MUST NOT boundaries** for each agent

---

## Test Results

### Test Query 1: Simple Single-Task
**Query**: "Write a funny poem about network latency"

**Expected**: SINGLE-AGENT  
**Result**: ✅ All prompt styles correctly identified this as SINGLE-AGENT

---

### Test Query 2: Two-Step Multi-Domain Task
**Query**: "Explain the top 3 most important 4G performance indicators and then use that to create a funny poem - 1 liner only"

**Expected**: MULTI-AGENT (technical + creative)

| Prompt Style | Classification | Accuracy |
|-------------|----------------|----------|
| Style 1: Direct Classification | ❌ SINGLE-AGENT | Wrong |
| Style 2: Keyword Detection | ❌ SINGLE-AGENT (despite detecting 2 tasks!) | Wrong |
| Style 3: Task Decomposition First | ✅ MULTI-AGENT | Correct |
| **Improved: Explicit Rules** | ✅ MULTI-AGENT | **Correct** |

---

### Test Query 3: Complex Multi-Agent Task
**Query**: "Analyze customer churn reasons related to network quality, then design a prepaid campaign to address it, and create a catchy slogan"

**Expected**: MULTI-AGENT (analytical + technical + creative)

| Prompt Style | Classification | Accuracy |
|-------------|----------------|----------|
| Style 1: Direct Classification | ✅ MULTI-AGENT | Correct |
| Style 2: Keyword Detection | ❌ SINGLE-AGENT (despite detecting 3 tasks!) | Wrong |
| Style 3: Task Decomposition First | ✅ MULTI-AGENT | Correct |
| **Improved: Explicit Rules** | ✅ MULTI-AGENT | **Correct** |

---

## 🔍 Critical Insights

### 1. **Keyword Detection Alone is Insufficient**
Even when the model correctly identified:
- Connecting words: YES
- Number of tasks: 2 or 3
- Listed each task separately

It **still classified as SINGLE-AGENT**, showing the model needs **explicit rules** to connect these observations to the final classification.

### 2. **Explicit Rules Work Best**
When the prompt explicitly stated:
```
CRITICAL RULE:
- If the query has 2+ tasks connected by "and then" → MULTI-AGENT
- If different task types (technical + creative) → MULTI-AGENT
```

The model **perfectly followed** these rules and classified correctly 100% of the time.

### 3. **Task Decomposition with Boundaries is Excellent**
When asked to provide MUST/MUST NOT clauses, the model generated:

**For Technical Agent:**
- MUST: Provide clear explanation of indicators
- MUST NOT: Include any creative writing or poems

**For Creative Agent:**
- MUST: Craft humorous one-liner poem using the information
- MUST NOT: Provide any technical details or explanations

This is **exactly** what we need to prevent agent overreach!

---

## 📊 Recommended Prompt Structure

### For Query Analysis:
```
Step 1: Count tasks (split by "and then", "then [verb]")
Step 2: Identify task types (technical, creative, analytical)
Step 3: Apply explicit classification rule

CRITICAL RULE:
- If 2+ tasks with different types → MULTI-AGENT
- If only 1 task → SINGLE-AGENT
```

### For Task Decomposition:
```
For each task:
- Agent Type: [Technical/Creative/Analytical]
- Task: [exact description]
- MUST: [what agent must do]
- MUST NOT: [what agent must NOT do]
```

### For Agent Instructions:
```
You are the {Agent Name}.
Your assigned task: {specific_task}

MUST: {focus areas based on task analysis}
MUST NOT: {avoid areas based on task analysis}
```

---

## ✅ Implementation Recommendations

1. **Update `analyze_query_with_qwen3()` prompt** to include:
   - Explicit step-by-step reasoning
   - Clear CRITICAL RULES
   - Task counting before classification

2. **Enhance task decomposition** to generate:
   - MUST/MUST NOT clauses for each task
   - Clear agent type assignments
   - Explicit boundaries

3. **Update `_generate_direct_agent_instructions()`** to:
   - Use the MUST/MUST NOT clauses from task decomposition
   - Make boundaries even more explicit
   - Reference what previous agents have done

4. **Add post-processing validation** that checks:
   - If task_count >= 2 and classification == "single_agent" → force "multi_agent"
   - If task_types contain both "technical" AND "creative" → force "multi_agent"

---

## Test Conclusion

Granite4:micro is **fully capable** of correct query analysis and task decomposition when given:
- ✅ Explicit rules
- ✅ Step-by-step reasoning structure
- ✅ Clear MUST/MUST NOT boundaries

The current orchestrator prompt needs to be updated to leverage these capabilities.



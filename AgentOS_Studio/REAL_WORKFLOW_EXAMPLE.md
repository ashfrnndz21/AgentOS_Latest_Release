# Real Agentic Workflow Example: Customer Support System

## 🎯 **Your Current Canvas Analysis**

Looking at your screenshot, you have:
- **Strands Agent Node**: Connected to a decision point
- **Decision Node**: Making routing decisions
- **Connection**: Linking agent output to decision logic

**This is a perfect foundation!** Let me show you how to make it fully functional.

## 🏗️ **Building a Real Customer Support Workflow**

### **Step 1: Configure Your Strands Agent**

Your current agent should be configured as an **Intent Classification Agent**:

```typescript
// Real agent configuration
const intentClassifierConfig = {
  name: "Customer Intent Classifier",
  role: "Customer Support Intent Analysis",
  description: "Analyzes customer messages to determine support category and urgency",
  system_prompt: `You are an expert customer support intent classifier.

Analyze customer messages and respond with JSON in this exact format:
{
  "intent": "TECHNICAL|BILLING|GENERAL|URGENT",
  "confidence": 0.0-1.0,
  "urgency": "LOW|MEDIUM|HIGH|CRITICAL", 
  "category": "account|payment|technical|product|complaint",
  "summary": "Brief summary of the issue",
  "suggested_agent": "technical_support|billing_specialist|general_support|escalation"
}

Consider:
- Technical issues: bugs, errors, troubleshooting
- Billing: payments, subscriptions, refunds
- General: account questions, information requests
- Urgent: angry customers, service outages, security issues`,
  
  reasoning_pattern: "sequential",
  reflection_enabled: true,
  chain_of_thought_depth: 3,
  temperature: 0.3, // Low temperature for consistent classification
  max_tokens: 500,
  
  guardrails: {
    enabled: true,
    safety_level: "high",
    content_filters: ["inappropriate", "spam"],
    rules: [
      "Always classify with confidence score",
      "Never ignore urgent or critical issues",
      "Maintain customer privacy"
    ]
  }
};
```

### **Step 2: Configure Your Decision Node**

Your decision node should route based on the agent's classification:

```typescript
// Real decision configuration
const routingDecisionConfig = {
  type: "agent_based", // Use the agent's output for decisions
  conditions: [
    {
      field: "intent",
      operator: "equals",
      value: "TECHNICAL",
      weight: 1.0,
      next_node: "technical_support_agent"
    },
    {
      field: "intent", 
      operator: "equals",
      value: "BILLING",
      weight: 1.0,
      next_node: "billing_specialist_agent"
    },
    {
      field: "urgency",
      operator: "equals", 
      value: "CRITICAL",
      weight: 2.0, // Higher weight for urgent issues
      next_node: "escalation_agent"
    },
    {
      field: "confidence",
      operator: "less_than",
      value: 0.7,
      weight: 1.0,
      next_node: "human_review"
    }
  ],
  confidenceThreshold: 0.8,
  fallbackPath: "general_support_agent"
};
```

### **Step 3: Add Specialist Agents**

Extend your workflow with specialist agents:

```typescript
// Technical Support Agent
const technicalSupportAgent = {
  name: "Technical Support Specialist",
  role: "Technical Issue Resolution",
  system_prompt: `You are a technical support specialist. Help customers with:
- Software bugs and errors
- Account access issues  
- Feature troubleshooting
- Integration problems

Provide clear, step-by-step solutions. If you cannot resolve the issue, escalate to engineering.`,
  
  reasoning_pattern: "sequential",
  tools_config: [
    "database_query", // Check user account status
    "log_analyzer",   // Analyze error logs
    "knowledge_base"  // Search solutions
  ]
};

// Billing Specialist Agent  
const billingSpecialistAgent = {
  name: "Billing Specialist",
  role: "Payment and Subscription Support",
  system_prompt: `You are a billing specialist. Handle:
- Payment issues and failures
- Subscription changes
- Refund requests
- Pricing questions

Always verify customer identity before discussing billing details.`,
  
  tools_config: [
    "payment_processor", // Check payment status
    "subscription_manager", // Modify subscriptions
    "billing_database" // Access billing history
  ]
};
```

### **Step 4: Add Quality Control**

Add a quality check after agent responses:

```typescript
// Quality Control Decision
const qualityCheckConfig = {
  type: "rule_based",
  conditions: [
    {
      field: "response_length",
      operator: "greater_than", 
      value: 50, // Ensure substantial response
      weight: 0.5
    },
    {
      field: "contains_solution",
      operator: "equals",
      value: true,
      weight: 1.0
    },
    {
      field: "customer_satisfaction_predicted",
      operator: "greater_than",
      value: 0.7,
      weight: 1.0
    }
  ],
  confidenceThreshold: 0.8,
  fallbackPath: "human_review"
};
```

## 🚀 **Real Execution Flow**

### **Input Example:**
```json
{
  "customer_message": "I can't log into my account and I'm getting an error message",
  "customer_id": "cust_12345",
  "session_id": "sess_67890", 
  "timestamp": "2024-09-15T12:00:00Z",
  "channel": "web_chat"
}
```

### **Step-by-Step Execution:**

1. **Intent Classification Agent** processes the message:
   ```json
   {
     "intent": "TECHNICAL",
     "confidence": 0.92,
     "urgency": "MEDIUM",
     "category": "account",
     "summary": "Customer unable to log in, receiving error message",
     "suggested_agent": "technical_support"
   }
   ```

2. **Decision Node** evaluates the classification:
   - Intent = "TECHNICAL" ✅
   - Confidence = 0.92 > 0.8 ✅
   - Routes to: **Technical Support Agent**

3. **Technical Support Agent** processes the issue:
   - Queries database for account status
   - Checks recent login attempts
   - Analyzes error logs
   - Provides solution steps

4. **Quality Check** validates the response:
   - Response length: 250 characters ✅
   - Contains solution: Yes ✅
   - Predicted satisfaction: 0.85 ✅
   - Routes to: **Customer Delivery**

### **Real Output:**
```json
{
  "resolution": "Account temporarily locked due to multiple failed login attempts. Reset password using the link sent to your email.",
  "steps": [
    "Check your email for password reset link",
    "Click the link and create a new password", 
    "Try logging in with the new password",
    "Contact us if you still have issues"
  ],
  "estimated_resolution_time": "5 minutes",
  "follow_up_required": false,
  "satisfaction_survey": true
}
```

## 🔧 **Making Your Current Workflow Real**

### **Frontend Changes Needed:**

1. **Update Node Configuration:**
```typescript
// In your canvas, when configuring the agent node
const updateAgentNode = (nodeId: string) => {
  const agentConfig = {
    agent_id: "your_strands_agent_id", // Real Strands agent ID
    reasoning_config: intentClassifierConfig,
    tools_enabled: ["database_query", "knowledge_base"]
  };
  
  onUpdateNode(nodeId, agentConfig);
};
```

2. **Update Decision Logic:**
```typescript
// Configure your decision node with real conditions
const updateDecisionNode = (nodeId: string) => {
  const decisionConfig = {
    decision_type: "agent_based",
    conditions: routingDecisionConfig.conditions,
    confidence_threshold: 0.8
  };
  
  onUpdateNode(nodeId, decisionConfig);
};
```

### **Backend Integration:**

1. **Add Real Execution Endpoint:**
```python
# Add to backend/strands_api.py
@app.route('/api/strands/workflows/<workflow_id>/execute', methods=['POST'])
def execute_workflow_real(workflow_id):
    # Real implementation from implement-real-workflow-execution.py
    pass
```

2. **Connect to Strands Agents:**
```python
def execute_agent_node_real(node, context):
    # Get actual Strands agent
    agent = get_strands_agent(node['data']['agent_id'])
    
    # Execute with real reasoning
    result = strands_reasoning_engine.execute_agent(agent, context['current_data'])
    
    return result
```

## 🎯 **Testing Your Real Workflow**

### **Test Script:**
```bash
#!/bin/bash
echo "Testing Real Customer Support Workflow"

# Test input
curl -X POST http://localhost:5004/api/strands/workflows/your_workflow_id/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "customer_message": "I cannot access my account, getting error 500",
      "customer_id": "test_customer",
      "urgency": "medium"
    }
  }'
```

### **Expected Real Results:**
- ✅ **Actual token consumption** (not random numbers)
- ✅ **Real agent reasoning traces** 
- ✅ **Persistent execution history**
- ✅ **Performance metrics**
- ✅ **Error handling and retries**

## 🏆 **Success Indicators**

### **Your Workflow is REAL when:**
- ✅ Clicking "Execute Workflow" makes actual API calls
- ✅ Agents consume real tokens and show reasoning
- ✅ Decisions are based on actual agent outputs
- ✅ Execution history is saved to database
- ✅ Performance metrics are tracked
- ✅ Errors are handled gracefully
- ✅ Context flows between nodes correctly

### **Your Workflow is MOCK when:**
- ❌ Hardcoded responses
- ❌ Random metrics
- ❌ No persistent state
- ❌ No real agent calls

## 🚀 **Next Steps**

1. **Implement the backend endpoints** from `implement-real-workflow-execution.py`
2. **Configure your existing nodes** with real agent IDs and decision logic
3. **Test with real customer support scenarios**
4. **Add monitoring and analytics**
5. **Scale to handle production traffic**

Your current canvas is a perfect starting point - now let's make it process real customer support requests! 🎯
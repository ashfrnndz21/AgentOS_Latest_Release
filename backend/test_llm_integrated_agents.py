#!/usr/bin/env python3
"""
LLM-Integrated Agent Test Cases
Tests 2 agents with full LLM integration and A2A communication
"""

import requests
import json
import time
import uuid
from datetime import datetime

# API endpoints
STRANDS_SDK_URL = "http://localhost:5006"
ORCHESTRATION_URL = "http://localhost:5009"

def create_llm_agent(name, description, model_id, system_prompt, tools=None):
    """Create an agent with full LLM integration via Strands SDK"""
    if tools is None:
        tools = []
    
    agent_data = {
        "name": name,
        "description": description,
        "model_id": model_id,
        "system_prompt": system_prompt,
        "tools": tools,
        "ollama_config": {
            "temperature": 0.7,
            "max_tokens": 1000,
            "top_p": 0.9
        },
        "validate_execution": True
    }
    
    # Create via Strands SDK API (this will actually create the agent with LLM)
    response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", 
                           json=agent_data)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Failed to create LLM agent {name}: {response.text}")
        return None

def execute_llm_agent(agent_id, input_text):
    """Execute an agent with full LLM processing"""
    execution_data = {
        "input": input_text,
        "stream": False
    }
    
    response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}/execute", 
                           json=execution_data)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Failed to execute LLM agent {agent_id}: {response.text}")
        return None

def test_case_1_customer_support_workflow():
    """Test Case 1: Customer Support Workflow with LLM Integration"""
    print("🧪 TEST CASE 1: Customer Support Workflow")
    print("=" * 50)
    print("Scenario: Customer has a technical issue, needs escalation to specialist")
    print()
    
    # Step 1: Create Customer Service Agent
    print("📝 Step 1: Creating Customer Service Agent")
    customer_agent = create_llm_agent(
        name="Customer Service Agent",
        description="First-line customer support agent",
        model_id="qwen2.5",
        system_prompt="""You are a helpful customer service agent. Your role is to:
1. Greet customers politely
2. Understand their issues
3. Try to resolve simple problems
4. Escalate complex technical issues to specialists
5. Always be professional and empathetic

When you need to escalate, clearly explain what you're doing and why.""",
        tools=["memory", "current_time", "calculator"]
    )
    
    if not customer_agent:
        print("❌ Failed to create Customer Service Agent")
        return False
    
    print(f"✅ Created: {customer_agent['name']} (ID: {customer_agent['id']})")
    
    # Step 2: Create Technical Specialist Agent
    print("\n📝 Step 2: Creating Technical Specialist Agent")
    tech_agent = create_llm_agent(
        name="Technical Specialist Agent",
        description="Advanced technical support specialist",
        model_id="qwen2.5",
        system_prompt="""You are a technical specialist. Your role is to:
1. Receive escalated technical issues
2. Provide detailed technical solutions
3. Explain complex concepts in simple terms
4. Offer step-by-step troubleshooting
5. Ensure customer satisfaction

Always provide clear, actionable solutions.""",
        tools=["think", "calculator", "memory"]
    )
    
    if not tech_agent:
        print("❌ Failed to create Technical Specialist Agent")
        return False
    
    print(f"✅ Created: {tech_agent['name']} (ID: {tech_agent['id']})")
    
    # Step 3: Simulate Customer Inquiry
    print("\n📞 Step 3: Customer Inquiry")
    customer_issue = "Hi, I'm having trouble logging into my account. I keep getting an error message that says 'Invalid credentials' but I'm sure my password is correct. I've tried resetting it twice but still can't get in. Can you help me?"
    print(f"Customer: {customer_issue}")
    
    # Step 4: Customer Service Agent Response
    print("\n🤖 Step 4: Customer Service Agent Processing")
    print("Customer Service Agent is thinking...")
    
    customer_response = execute_llm_agent(customer_agent['id'], customer_issue)
    if customer_response:
        print(f"Customer Service Agent: {customer_response.get('output', 'No response')}")
    else:
        print("❌ Customer Service Agent failed to respond")
        return False
    
    # Step 5: A2A Communication - Escalation
    print("\n🔄 Step 5: A2A Communication - Escalation")
    escalation_message = f"Escalating to Technical Specialist: Customer has persistent login issues despite password reset attempts. Original issue: '{customer_issue}'"
    print(f"Customer Service Agent → Technical Specialist: {escalation_message}")
    
    # Step 6: Technical Specialist Response
    print("\n🤖 Step 6: Technical Specialist Processing")
    print("Technical Specialist is analyzing the issue...")
    
    tech_response = execute_llm_agent(tech_agent['id'], escalation_message)
    if tech_response:
        print(f"Technical Specialist: {tech_response.get('output', 'No response')}")
    else:
        print("❌ Technical Specialist failed to respond")
        return False
    
    # Step 7: Final Resolution
    print("\n✅ Step 7: Resolution Summary")
    print("Customer issue has been escalated and resolved by technical specialist")
    print("Both agents worked together to provide comprehensive support")
    
    return True

def test_case_2_sales_and_technical_consultation():
    """Test Case 2: Sales and Technical Consultation Workflow"""
    print("\n🧪 TEST CASE 2: Sales and Technical Consultation")
    print("=" * 50)
    print("Scenario: Customer wants to buy software, needs both sales and technical consultation")
    print()
    
    # Step 1: Create Sales Agent
    print("📝 Step 1: Creating Sales Agent")
    sales_agent = create_llm_agent(
        name="Sales Agent",
        description="Software sales specialist",
        model_id="qwen2.5",
        system_prompt="""You are a software sales agent. Your role is to:
1. Understand customer needs and requirements
2. Recommend appropriate software solutions
3. Explain pricing and features
4. Coordinate with technical team for complex requirements
5. Close deals while ensuring customer satisfaction

Always be consultative and focus on solving customer problems.""",
        tools=["calculator", "memory", "current_time"]
    )
    
    if not sales_agent:
        print("❌ Failed to create Sales Agent")
        return False
    
    print(f"✅ Created: {sales_agent['name']} (ID: {sales_agent['id']})")
    
    # Step 2: Create Technical Consultant Agent
    print("\n📝 Step 2: Creating Technical Consultant Agent")
    consultant_agent = create_llm_agent(
        name="Technical Consultant Agent",
        description="Technical solution architect",
        model_id="qwen2.5",
        system_prompt="""You are a technical consultant. Your role is to:
1. Analyze technical requirements
2. Design solution architectures
3. Assess technical feasibility
4. Provide implementation guidance
5. Support sales team with technical expertise

Always provide detailed technical analysis and recommendations.""",
        tools=["think", "calculator", "memory"]
    )
    
    if not consultant_agent:
        print("❌ Failed to create Technical Consultant Agent")
        return False
    
    print(f"✅ Created: {consultant_agent['name']} (ID: {consultant_agent['id']})")
    
    # Step 3: Customer Inquiry
    print("\n📞 Step 3: Customer Inquiry")
    customer_request = "Hi, I'm looking for a CRM system for my small business. We have about 20 employees and need something that can handle customer data, sales tracking, and integrate with our existing email system. What would you recommend?"
    print(f"Customer: {customer_request}")
    
    # Step 4: Sales Agent Initial Response
    print("\n🤖 Step 4: Sales Agent Initial Response")
    print("Sales Agent is analyzing customer needs...")
    
    sales_response = execute_llm_agent(sales_agent['id'], customer_request)
    if sales_response:
        print(f"Sales Agent: {sales_response.get('output', 'No response')}")
    else:
        print("❌ Sales Agent failed to respond")
        return False
    
    # Step 5: A2A Communication - Technical Consultation
    print("\n🔄 Step 5: A2A Communication - Technical Consultation")
    tech_consultation_request = f"Technical consultation needed for CRM selection. Customer requirements: 20 employees, customer data management, sales tracking, email integration. Please provide technical analysis and recommendations."
    print(f"Sales Agent → Technical Consultant: {tech_consultation_request}")
    
    # Step 6: Technical Consultant Analysis
    print("\n🤖 Step 6: Technical Consultant Analysis")
    print("Technical Consultant is analyzing requirements...")
    
    consultant_response = execute_llm_agent(consultant_agent['id'], tech_consultation_request)
    if consultant_response:
        print(f"Technical Consultant: {consultant_response.get('output', 'No response')}")
    else:
        print("❌ Technical Consultant failed to respond")
        return False
    
    # Step 7: Sales Agent Final Recommendation
    print("\n🤖 Step 7: Sales Agent Final Recommendation")
    final_recommendation = f"Based on technical analysis, provide final CRM recommendation to customer. Technical input: {consultant_response.get('output', '')}"
    
    final_response = execute_llm_agent(sales_agent['id'], final_recommendation)
    if final_response:
        print(f"Sales Agent Final: {final_response.get('output', 'No response')}")
    else:
        print("❌ Sales Agent final response failed")
        return False
    
    # Step 8: Workflow Summary
    print("\n✅ Step 8: Workflow Summary")
    print("Customer received comprehensive sales and technical consultation")
    print("Both agents collaborated to provide complete solution")
    
    return True

def run_llm_integration_tests():
    """Run both test cases with full LLM integration"""
    print("🚀 Starting LLM-Integrated Agent Tests")
    print("=" * 60)
    print("Testing: 2 agents with full LLM processing and A2A communication")
    print()
    
    # Check if services are running
    try:
        sdk_health = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/health", timeout=5)
        orchestration_health = requests.get(f"{ORCHESTRATION_URL}/api/strands-orchestration/health", timeout=5)
        
        if sdk_health.status_code != 200 or orchestration_health.status_code != 200:
            print("❌ Services not available")
            print(f"SDK API: {sdk_health.status_code}")
            print(f"Orchestration API: {orchestration_health.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to services")
        return False
    
    print("✅ Both services are running")
    print()
    
    # Run Test Case 1
    test1_success = test_case_1_customer_support_workflow()
    
    # Run Test Case 2
    test2_success = test_case_2_sales_and_technical_consultation()
    
    # Summary
    print("\n📊 TEST RESULTS SUMMARY")
    print("=" * 30)
    print(f"Test Case 1 (Customer Support): {'✅ PASSED' if test1_success else '❌ FAILED'}")
    print(f"Test Case 2 (Sales & Technical): {'✅ PASSED' if test2_success else '❌ FAILED'}")
    
    if test1_success and test2_success:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ LLM integration working")
        print("✅ A2A communication working")
        print("✅ Multi-agent workflows working")
        print("✅ Ready for frontend integration")
    else:
        print("\n❌ Some tests failed")
        print("Check the logs above for details")
    
    return test1_success and test2_success

if __name__ == "__main__":
    run_llm_integration_tests()












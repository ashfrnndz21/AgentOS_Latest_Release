#!/usr/bin/env python3
"""
Test A2A Weather and Math Agent Collaboration
Demonstrates agent-to-agent communication for complex queries
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
STRANDS_SDK_URL = "http://localhost:5006"
A2A_REGISTRY_URL = "http://localhost:5010"

def log(message, level="INFO"):
    """Log with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def create_agent(name, description, model, system_prompt, tools, a2a_enabled=True):
    """Create a Strands SDK agent"""
    log(f"Creating {name} agent with model {model}...")
    
    agent_data = {
        "name": name,
        "description": description,
        "model_id": model,
        "host": "http://localhost:11434",
        "system_prompt": system_prompt,
        "tools": tools,
        "ollama_config": {
            "temperature": 0.7,
            "max_tokens": 1000
        }
    }
    
    try:
        response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents", json=agent_data)
        if response.status_code == 200:
            agent_info = response.json()
            log(f"✅ {name} agent created successfully: {agent_info['id']}")
            
            # Register for A2A if enabled
            if a2a_enabled:
                a2a_response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/a2a/register", 
                                           json={"agent_id": agent_info['id']})
                if a2a_response.status_code == 200:
                    log(f"✅ {name} agent registered for A2A communication")
                else:
                    log(f"⚠️ Failed to register {name} for A2A: {a2a_response.text}", "WARN")
            
            return agent_info
        else:
            log(f"❌ Failed to create {name} agent: {response.text}", "ERROR")
            return None
    except Exception as e:
        log(f"❌ Error creating {name} agent: {e}", "ERROR")
        return None

def execute_agent(agent_id, input_text, round_num):
    """Execute an agent and return the response"""
    log(f"🤖 Round {round_num}: Executing agent {agent_id}")
    log(f"📝 Input: {input_text}")
    
    try:
        response = requests.post(f"{STRANDS_SDK_URL}/api/strands-sdk/agents/{agent_id}/execute", 
                               json={"input": input_text})
        
        if response.status_code == 200:
            result = response.json()
            response_text = result.get('response', 'No response')
            execution_time = result.get('execution_time', 0)
            tools_used = result.get('tools_used', [])
            
            log(f"✅ Response: {response_text}")
            log(f"⏱️ Execution time: {execution_time:.2f}s")
            if tools_used:
                log(f"🔧 Tools used: {', '.join(tools_used)}")
            
            return response_text
        else:
            log(f"❌ Failed to execute agent: {response.text}", "ERROR")
            return None
    except Exception as e:
        log(f"❌ Error executing agent: {e}", "ERROR")
        return None

def simulate_a2a_conversation(weather_agent_id, math_agent_id, initial_question):
    """Simulate A2A conversation between weather and math agents"""
    log("🚀 Starting A2A collaboration simulation...")
    log("=" * 60)
    
    # Round 1: Weather agent analyzes the question
    log("🌤️ ROUND 1: Weather Agent Analysis")
    weather_response = execute_agent(weather_agent_id, 
        f"Analyze this question about weather: '{initial_question}'. "
        f"Provide information about Indonesia's climate, typical weather patterns, "
        f"and any factors that might affect snow probability. Be specific about "
        f"geographical and climatic factors.", 1)
    
    if not weather_response:
        log("❌ Weather agent failed to respond", "ERROR")
        return
    
    # Round 2: Math agent calculates probability
    log("\n🧮 ROUND 2: Math Agent Probability Calculation")
    math_response = execute_agent(math_agent_id,
        f"Based on this weather analysis: '{weather_response}' "
        f"Calculate the probability of snow in Indonesia. Consider: "
        f"1. Indonesia's equatorial location (0-10° latitude) "
        f"2. Tropical climate characteristics "
        f"3. Temperature requirements for snow formation "
        f"4. Historical weather data patterns "
        f"Provide a numerical probability percentage and explain your reasoning.", 2)
    
    if not math_response:
        log("❌ Math agent failed to respond", "ERROR")
        return
    
    # Round 3: Weather agent provides final assessment
    log("\n🌤️ ROUND 3: Weather Agent Final Assessment")
    final_response = execute_agent(weather_agent_id,
        f"Based on this mathematical analysis: '{math_response}' "
        f"Provide a final comprehensive assessment about snow probability in Indonesia. "
        f"Include: 1) The calculated probability, 2) Key climatic factors, "
        f"3) Any exceptional circumstances where snow might occur, "
        f"4) A clear, definitive answer to the original question.", 3)
    
    if not final_response:
        log("❌ Weather agent failed to provide final response", "ERROR")
        return
    
    log("\n" + "=" * 60)
    log("🎯 A2A COLLABORATION COMPLETE!")
    log("=" * 60)
    
    # Summary
    log("\n📋 CONVERSATION SUMMARY:")
    log(f"🌤️ Weather Agent: {weather_response[:100]}...")
    log(f"🧮 Math Agent: {math_response[:100]}...")
    log(f"🌤️ Final Assessment: {final_response[:100]}...")

def main():
    """Main test function"""
    log("🚀 Starting A2A Weather-Math Agent Collaboration Test")
    log("=" * 60)
    
    # Check if services are running
    try:
        strands_health = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/health")
        if strands_health.status_code != 200:
            log("❌ Strands SDK service not running", "ERROR")
            return
        log("✅ Strands SDK service is running")
    except:
        log("❌ Cannot connect to Strands SDK service", "ERROR")
        return
    
    # Create Weather Agent (Llama model)
    weather_agent = create_agent(
        name="Weather Expert",
        description="Expert in weather patterns, climate analysis, and meteorological data",
        model="llama3.2:latest",
        system_prompt="""You are a Weather Expert with deep knowledge of global weather patterns, 
        climate zones, and meteorological phenomena. You specialize in analyzing weather data, 
        understanding climatic factors, and providing accurate weather assessments. 
        You can collaborate with other agents to provide comprehensive weather analysis.""",
        tools=["current_time", "a2a_discover_agent", "a2a_send_message"],
        a2a_enabled=True
    )
    
    if not weather_agent:
        log("❌ Failed to create weather agent", "ERROR")
        return
    
    # Create Math Agent (Phi3 model)
    math_agent = create_agent(
        name="Math Probability Expert",
        description="Expert in mathematical probability, statistics, and quantitative analysis",
        model="qwen2.5:latest",
        system_prompt="""You are a Math Probability Expert specializing in statistical analysis, 
        probability calculations, and quantitative reasoning. You excel at analyzing data, 
        calculating probabilities, and providing mathematical insights. You can collaborate 
        with other agents to provide precise mathematical analysis and calculations.""",
        tools=["calculator", "a2a_discover_agent", "a2a_send_message"],
        a2a_enabled=True
    )
    
    if not math_agent:
        log("❌ Failed to create math agent", "ERROR")
        return
    
    # Wait a moment for agents to be ready
    log("⏳ Waiting for agents to initialize...")
    time.sleep(2)
    
    # Test question
    question = "What is the probability of snow in Indonesia?"
    
    log(f"\n🎯 TEST QUESTION: {question}")
    log("=" * 60)
    
    # Simulate A2A conversation
    simulate_a2a_conversation(
        weather_agent['id'], 
        math_agent['id'], 
        question
    )
    
    log("\n🏁 Test completed!")

if __name__ == "__main__":
    main()

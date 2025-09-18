#!/usr/bin/env python3
"""
Background Multi-Agent Demo
Runs continuously to demonstrate ongoing A2A communication
"""

import requests
import json
import time
import uuid
import threading
from datetime import datetime
import random

# API endpoints
STRANDS_SDK_URL = "http://localhost:5006"
ORCHESTRATION_URL = "http://localhost:5009"

class BackgroundMultiAgentDemo:
    def __init__(self):
        self.running = False
        self.agents = []
        self.workflow_count = 0
        self.a2a_communications = 0
        
    def create_demo_agents(self):
        """Create demo agents for the background process"""
        print("🤖 Creating demo agents...")
        
        # Agent 1: Customer Service Agent
        agent1 = self.create_agent(
            name="Customer Service Agent",
            description="Handles customer inquiries and support requests",
            model_id="qwen2.5",
            system_prompt="You are a helpful customer service agent. Always be polite, professional, and try to resolve customer issues quickly.",
            tools=["memory", "calculator", "current_time"]
        )
        
        # Agent 2: Technical Support Agent
        agent2 = self.create_agent(
            name="Technical Support Agent",
            description="Provides technical assistance and troubleshooting",
            model_id="qwen2.5", 
            system_prompt="You are a technical support specialist. You help customers with technical issues and provide detailed solutions.",
            tools=["think", "calculator", "memory"]
        )
        
        # Agent 3: Sales Agent
        agent3 = self.create_agent(
            name="Sales Agent",
            description="Handles sales inquiries and product recommendations",
            model_id="qwen2.5",
            system_prompt="You are a sales agent. Help customers find the right products and services for their needs.",
            tools=["memory", "calculator"]
        )
        
        if agent1 and agent2 and agent3:
            self.agents = [agent1, agent2, agent3]
            print(f"✅ Created {len(self.agents)} demo agents")
            return True
        else:
            print("❌ Failed to create demo agents")
            return False
    
    def create_agent(self, name, description, model_id, system_prompt, tools=None):
        """Create an agent via the orchestration API"""
        if tools is None:
            tools = []
        
        agent_data = {
            "name": name,
            "description": description,
            "model_id": model_id,
            "system_prompt": system_prompt,
            "tools": tools,
            "execution_strategy": "sequential",
            "metadata": {
                "created_by": "background_demo",
                "demo_mode": True
            }
        }
        
        response = requests.post(f"{ORCHESTRATION_URL}/api/strands-orchestration/agents", 
                               json=agent_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to create agent {name}: {response.text}")
            return None
    
    def simulate_workflow(self, workflow_type):
        """Simulate a customer service workflow"""
        if not self.agents:
            return
        
        self.workflow_count += 1
        workflow_id = str(uuid.uuid4())
        
        # Select random agents for the workflow
        primary_agent = random.choice(self.agents)
        secondary_agent = random.choice([a for a in self.agents if a['id'] != primary_agent['id']])
        
        print(f"\n🔄 Workflow #{self.workflow_count} ({workflow_type})")
        print(f"   Primary: {primary_agent['name']}")
        print(f"   Secondary: {secondary_agent['name']}")
        
        # Simulate customer inquiry
        customer_inquiries = [
            "I'm having trouble with my account login",
            "Can you help me understand your pricing plans?",
            "I need technical support for my software",
            "What products do you recommend for my business?",
            "I'm experiencing slow performance issues"
        ]
        
        inquiry = random.choice(customer_inquiries)
        print(f"   📞 Customer: {inquiry}")
        
        # Primary agent processes the inquiry
        print(f"   🤖 {primary_agent['name']} is processing...")
        time.sleep(random.uniform(1, 3))  # Simulate processing time
        
        # Determine if escalation is needed
        escalation_needed = random.choice([True, False, False])  # 33% chance of escalation
        
        if escalation_needed:
            # A2A Communication
            self.a2a_communications += 1
            escalation_message = f"Escalating to {secondary_agent['name']}: Customer inquiry '{inquiry}' requires specialized assistance"
            print(f"   🔄 A2A: {primary_agent['name']} → {secondary_agent['name']}")
            print(f"   📨 Message: {escalation_message}")
            
            # Secondary agent responds
            print(f"   🤖 {secondary_agent['name']} is handling escalation...")
            time.sleep(random.uniform(1, 2))
            
            resolution = f"Resolved by {secondary_agent['name']}: Provided specialized solution for '{inquiry}'"
            print(f"   ✅ Resolution: {resolution}")
        else:
            # Primary agent handles directly
            resolution = f"Resolved by {primary_agent['name']}: Direct solution for '{inquiry}'"
            print(f"   ✅ Resolution: {resolution}")
        
        # Log workflow completion
        workflow_data = {
            "workflow_id": workflow_id,
            "type": workflow_type,
            "primary_agent": primary_agent['name'],
            "secondary_agent": secondary_agent['name'] if escalation_needed else None,
            "inquiry": inquiry,
            "escalated": escalation_needed,
            "timestamp": datetime.now().isoformat(),
            "status": "completed"
        }
        
        print(f"   ✅ Workflow completed in {random.uniform(2, 5):.1f}s")
        
        return workflow_data
    
    def run_demo(self, duration_minutes=5):
        """Run the background demo for specified duration"""
        print("🚀 Starting Background Multi-Agent Demo")
        print(f"⏱️  Duration: {duration_minutes} minutes")
        print("=" * 50)
        
        # Create demo agents
        if not self.create_demo_agents():
            return
        
        self.running = True
        start_time = time.time()
        end_time = start_time + (duration_minutes * 60)
        
        workflow_types = [
            "Customer Support",
            "Technical Assistance", 
            "Sales Inquiry",
            "Account Management",
            "Product Support"
        ]
        
        print(f"\n🔄 Starting continuous workflows...")
        print("Press Ctrl+C to stop early\n")
        
        try:
            while self.running and time.time() < end_time:
                # Simulate random workflow
                workflow_type = random.choice(workflow_types)
                self.simulate_workflow(workflow_type)
                
                # Wait before next workflow
                wait_time = random.uniform(3, 8)  # 3-8 seconds between workflows
                time.sleep(wait_time)
                
        except KeyboardInterrupt:
            print("\n⏹️  Demo stopped by user")
            self.running = False
        
        # Final statistics
        elapsed_time = time.time() - start_time
        print(f"\n📊 Demo Statistics")
        print("=" * 20)
        print(f"⏱️  Duration: {elapsed_time/60:.1f} minutes")
        print(f"🔄 Workflows: {self.workflow_count}")
        print(f"🤖 Agents: {len(self.agents)}")
        print(f"📞 A2A Communications: {self.a2a_communications}")
        print(f"📈 Workflows/minute: {self.workflow_count/(elapsed_time/60):.1f}")
        print(f"📞 Escalation rate: {(self.a2a_communications/self.workflow_count)*100:.1f}%")
        
        print("\n🎉 Background Multi-Agent Demo Completed!")

def main():
    """Main function to run the demo"""
    demo = BackgroundMultiAgentDemo()
    
    # Check if services are running
    try:
        sdk_health = requests.get(f"{STRANDS_SDK_URL}/api/strands-sdk/health", timeout=5)
        orchestration_health = requests.get(f"{ORCHESTRATION_URL}/api/strands-orchestration/health", timeout=5)
        
        if sdk_health.status_code == 200 and orchestration_health.status_code == 200:
            print("✅ Services are running")
            demo.run_demo(duration_minutes=3)  # Run for 3 minutes
        else:
            print("❌ Services not available")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to services. Please ensure both APIs are running:")
        print("   - Strands SDK API on port 5006")
        print("   - Strands Orchestration API on port 5009")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()





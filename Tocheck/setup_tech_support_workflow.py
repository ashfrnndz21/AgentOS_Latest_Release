#!/usr/bin/env python3

"""
Quick Setup Script for Tech Support Triage Workflow
Creates a fully functional tech support system in Multi-Agent Workspace
"""

import json
from datetime import datetime

def create_tech_support_workflow():
    """Create the complete tech support workflow configuration"""
    
    workflow = {
        "name": "Tech Support Triage System",
        "description": "Intelligent tech support with AI specialists and human escalation",
        "version": "1.0",
        "created": datetime.now().isoformat(),
        "nodes": [
            {
                "id": "triage_agent",
                "type": "agent",
                "name": "Tech Issue Triage Agent",
                "position": {"x": 100, "y": 200},
                "config": {
                    "role": "Technical Support Classifier",
                    "model": "llama3.1:8b",
                    "systemPrompt": "You are a technical support triage agent. Analyze user tech issues and categorize them as: HARDWARE_ISSUE, SOFTWARE_ISSUE, NETWORK_ISSUE, or ACCOUNT_ISSUE. Respond with the category and severity (LOW, MEDIUM, HIGH).",
                    "capabilities": ["Technical Analysis", "Issue Classification", "Troubleshooting"]
                }
            },
            {
                "id": "routing_decision",
                "type": "decision",
                "name": "Route Tech Issue",
                "position": {"x": 400, "y": 200},
                "config": {
                    "decisionLogic": {
                        "HARDWARE_ISSUE": "hardware_specialist",
                        "SOFTWARE_ISSUE": "software_specialist",
                        "NETWORK_ISSUE": "hardware_specialist",
                        "ACCOUNT_ISSUE": "software_specialist",
                        "default": "software_specialist"
                    }
                }
            },
            {
                "id": "hardware_specialist",
                "type": "agent",
                "name": "Hardware Specialist",
                "position": {"x": 700, "y": 100},
                "config": {
                    "role": "Hardware Technical Expert",
                    "model": "llama3.1:8b",
                    "systemPrompt": "You are a hardware specialist. Help users with computer hardware, devices, and connectivity. Provide step-by-step solutions. Escalate if physical repair is needed.",
                    "capabilities": ["Hardware Diagnostics", "Technical Support", "Troubleshooting"]
                }
            },
            {
                "id": "software_specialist",
                "type": "agent",
                "name": "Software Specialist",
                "position": {"x": 700, "y": 300},
                "config": {
                    "role": "Software Technical Expert",
                    "model": "llama3.1:8b",
                    "systemPrompt": "You are a software specialist. Help users with applications, OS issues, and software problems. Provide clear solutions and workarounds. Escalate if system access is needed.",
                    "capabilities": ["Software Troubleshooting", "System Analysis", "Technical Support"]
                }
            },
            {
                "id": "tech_memory",
                "type": "memory",
                "name": "Tech Support Memory",
                "position": {"x": 1000, "y": 200},
                "config": {
                    "memoryType": "Issue Context",
                    "retention": "Session + History",
                    "storeData": ["issue_description", "classification", "specialist_responses", "resolution_steps"]
                }
            },
            {
                "id": "escalation_handoff",
                "type": "handoff",
                "name": "Escalate to Human Expert",
                "position": {"x": 1000, "y": 100},
                "config": {
                    "handoffConditions": [
                        "Issue marked as HIGH severity",
                        "User requests human assistance",
                        "Specialist cannot resolve issue",
                        "Hardware replacement needed"
                    ],
                    "handoffMessage": "Connecting you with a human technical expert for advanced assistance.",
                    "contextToTransfer": ["issue_details", "troubleshooting_steps", "specialist_recommendations"]
                }
            },
            {
                "id": "human_expert",
                "type": "human",
                "name": "Senior Technical Expert",
                "position": {"x": 1300, "y": 100},
                "config": {
                    "role": "Level 2 Technical Support",
                    "instructions": "Review technical issue context and provide expert-level support with access to advanced tools.",
                    "availableActions": ["remote_access", "advanced_diagnostics", "hardware_authorization", "engineering_escalation"]
                }
            }
        ],
        "connections": [
            {"from": "triage_agent", "to": "routing_decision"},
            {"from": "routing_decision", "to": "hardware_specialist", "condition": "HARDWARE_ISSUE"},
            {"from": "routing_decision", "to": "software_specialist", "condition": "SOFTWARE_ISSUE"},
            {"from": "hardware_specialist", "to": "tech_memory"},
            {"from": "software_specialist", "to": "tech_memory"},
            {"from": "hardware_specialist", "to": "escalation_handoff", "condition": "escalation_needed"},
            {"from": "software_specialist", "to": "escalation_handoff", "condition": "escalation_needed"},
            {"from": "escalation_handoff", "to": "human_expert"}
        ],
        "testScenarios": [
            {
                "name": "Hardware Issue",
                "input": "My laptop won't turn on. The power button doesn't respond and there are no lights.",
                "expectedPath": ["triage_agent", "routing_decision", "hardware_specialist"],
                "expectedClassification": "HARDWARE_ISSUE"
            },
            {
                "name": "Software Issue",
                "input": "My email application keeps crashing when I try to send attachments.",
                "expectedPath": ["triage_agent", "routing_decision", "software_specialist"],
                "expectedClassification": "SOFTWARE_ISSUE"
            },
            {
                "name": "Complex Issue",
                "input": "My computer randomly shuts down, makes weird noises, and I'm losing files.",
                "expectedPath": ["triage_agent", "routing_decision", "hardware_specialist", "escalation_handoff", "human_expert"],
                "expectedClassification": "HARDWARE_ISSUE"
            }
        ]
    }
    
    return workflow

def print_setup_instructions():
    """Print detailed setup instructions"""
    
    print("🎯 Tech Support Triage System Setup")
    print("=" * 50)
    
    print("\n📋 QUICK SETUP STEPS:")
    
    print("\n1. 🤖 CREATE TRIAGE AGENT:")
    print("   • Drag Agent from palette")
    print("   • Name: 'Tech Issue Triage Agent'")
    print("   • Configure with classification prompt")
    
    print("\n2. 🔀 ADD DECISION NODE:")
    print("   • Drag Decision Node from Utilities")
    print("   • Configure routing for HARDWARE/SOFTWARE issues")
    
    print("\n3. 👥 CREATE SPECIALIST AGENTS:")
    print("   • Hardware Specialist (for hardware issues)")
    print("   • Software Specialist (for software issues)")
    
    print("\n4. 🧠 ADD MEMORY NODE:")
    print("   • Store issue context and resolution steps")
    
    print("\n5. 🤝 ADD HANDOFF NODE:")
    print("   • Configure escalation to human experts")
    
    print("\n6. 👤 ADD HUMAN NODE:")
    print("   • Senior technical expert for complex issues")
    
    print("\n7. 🔗 CONNECT NODES:")
    print("   • Follow the connection pattern in guide")
    
    print("\n8. 🧪 TEST WORKFLOW:")
    print("   • Use provided test scenarios")

def print_test_scenarios():
    """Print test scenarios for validation"""
    
    print("\n🧪 TEST SCENARIOS:")
    print("=" * 30)
    
    scenarios = [
        {
            "type": "Hardware Issue",
            "input": "My laptop won't turn on. The power button doesn't respond and there are no lights.",
            "expected": "Should route to Hardware Specialist → provide power troubleshooting steps"
        },
        {
            "type": "Software Issue", 
            "input": "My email application keeps crashing when I try to send attachments.",
            "expected": "Should route to Software Specialist → provide app troubleshooting"
        },
        {
            "type": "Network Issue",
            "input": "I can't connect to WiFi. It shows connected but no internet access.",
            "expected": "Should route to Hardware Specialist → network diagnostics"
        },
        {
            "type": "Complex Issue",
            "input": "My computer randomly shuts down, makes weird noises, and I'm losing important files.",
            "expected": "Should route to Hardware Specialist → escalate to Human Expert due to data loss risk"
        },
        {
            "type": "Account Issue",
            "input": "I can't log into my work account. Password reset isn't working.",
            "expected": "Should route to Software Specialist → account recovery steps"
        }
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{i}. {scenario['type']}:")
        print(f"   Input: \"{scenario['input']}\"")
        print(f"   Expected: {scenario['expected']}")

def save_workflow_template():
    """Save the workflow template"""
    
    workflow = create_tech_support_workflow()
    
    with open('tech_support_workflow_template.json', 'w') as f:
        json.dump(workflow, f, indent=2)
    
    print("\n💾 Workflow template saved: tech_support_workflow_template.json")

def print_user_interaction_guide():
    """Print how users interact with the system"""
    
    print("\n💬 HOW USERS INTERACT:")
    print("=" * 30)
    
    print("\n📱 METHOD 1: Execute Workflow Button")
    print("   1. Click 'Execute Workflow' in toolbar")
    print("   2. Enter tech issue in dialog")
    print("   3. Watch real-time processing")
    print("   4. View agent responses")
    print("   5. See resolution or escalation")
    
    print("\n💻 METHOD 2: Chat Interface")
    print("   1. User types tech issue")
    print("   2. Workflow processes automatically")
    print("   3. Responses appear in chat")
    print("   4. Follow-up handled seamlessly")
    
    print("\n🎯 USER EXPERIENCE:")
    print("   • Immediate response to tech issues")
    print("   • Expert-level AI guidance")
    print("   • Seamless human escalation")
    print("   • Step-by-step solutions")
    print("   • Professional support quality")

def main():
    """Main setup function"""
    
    print("🚀 Tech Support Triage System Creator")
    print("=====================================\n")
    
    print("This creates a fully functional tech support workflow that:")
    print("• Analyzes and categorizes tech issues")
    print("• Routes to appropriate AI specialists")
    print("• Provides expert technical guidance")
    print("• Escalates complex issues to humans")
    print("• Delivers professional support experience\n")
    
    # Print setup instructions
    print_setup_instructions()
    
    # Print test scenarios
    print_test_scenarios()
    
    # Print user interaction guide
    print_user_interaction_guide()
    
    # Save template
    save_workflow_template()
    
    print("\n🎯 NEXT STEPS:")
    print("1. Open Multi-Agent Workspace")
    print("2. Follow setup instructions above")
    print("3. Test with provided scenarios")
    print("4. Customize for your tech environment")
    print("5. Deploy for real tech support!")
    
    print("\n✨ READY TO PROVIDE PROFESSIONAL TECH SUPPORT! 🚀")

if __name__ == "__main__":
    main()
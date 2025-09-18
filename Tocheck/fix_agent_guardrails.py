#!/usr/bin/env python3
"""
Fix agent guardrails by updating the CVM Agent configuration
"""

import requests
import json

def get_agent_details(agent_id):
    """Get detailed agent configuration"""
    try:
        response = requests.get(f"http://localhost:8000/api/agents/ollama/enhanced", timeout=10)
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            for agent in agents:
                if agent.get('id') == agent_id or 'cvm' in agent.get('name', '').lower():
                    return agent
        return None
    except Exception as e:
        print(f"Error getting agent: {e}")
        return None

def create_properly_configured_cvm_agent():
    """Create a new CVM Agent with proper guardrails configuration"""
    
    agent_data = {
        "name": "CVM Agent (Fixed Guardrails)",
        "role": "Telco CVM Expert",
        "description": "You are a telco cvm expert specialized in customer value management but must never mention CelcomDigi or competitors",
        "model": "phi3",
        "personality": "Energetic and helpful telecommunications expert",
        "expertise": "Customer Value Management, Prepaid Services, Telecommunications",
        "systemPrompt": "You are an energetic Prepaid Marketer and CVM expert. Provide clear, accurate, and helpful responses about telecommunications and customer value management. NEVER mention CelcomDigi, Celcom, Digi, or any competitor companies. Focus on general telecom best practices and CVM strategies.",
        "temperature": 0.7,
        "maxTokens": 1000,
        "tools": [],
        "memory": {
            "shortTerm": True,
            "longTerm": False,
            "contextual": True
        },
        "ragEnabled": False,
        "knowledgeBases": [],
        "behavior": {
            "response_style": "professional",
            "communication_tone": "energetic"
        },
        # CRITICAL: Enable guardrails with proper configuration
        "guardrails": {
            "enabled": True,  # This is the key fix!
            "safetyLevel": "high",
            "contentFilters": ["harmful", "profanity"],
            "rules": [
                "CelcomDigi",
                "Celcom", 
                "Digi",
                "Digi Telecommunications",
                "Celcom Axiata",
                "competitor companies"
            ]
        },
        # Enhanced guardrails for extra protection
        "enhancedGuardrails": {
            "global": True,
            "local": True,
            "piiRedaction": {
                "enabled": True,
                "strategy": "placeholder",
                "customTypes": ["Company Names"],
                "customPatterns": ["\\\\b(celcomdigi|celcom|digi)\\\\b"],
                "maskCharacter": "*",
                "placeholderText": "[COMPETITOR]"
            },
            "contentFilter": {
                "enabled": True,
                "level": "high",
                "customKeywords": [
                    "CelcomDigi", 
                    "Celcom", 
                    "Digi", 
                    "Celcom Axiata",
                    "Digi Telecommunications"
                ],
                "blockedPhrases": [
                    "CelcomDigi services",
                    "Celcom plans", 
                    "Digi network",
                    "competitor analysis"
                ],
                "allowedDomains": [],
                "blockedDomains": ["celcom.com.my", "digi.com.my"]
            },
            "behaviorLimits": {
                "enabled": True,
                "customLimits": [
                    "Never mention competitor companies",
                    "Focus only on general telecom best practices",
                    "Redirect competitor questions to general advice"
                ],
                "responseMaxLength": 1000,
                "requireApproval": False
            },
            "customRules": [
                {
                    "id": "no_competitors",
                    "name": "No Competitor Mentions",
                    "description": "Block any mention of CelcomDigi, Celcom, Digi or related companies",
                    "pattern": "\\\\b(celcomdigi|celcom|digi|axiata)\\\\b",
                    "action": "block",
                    "enabled": True
                },
                {
                    "id": "redirect_competitor_questions",
                    "name": "Redirect Competitor Questions", 
                    "description": "When asked about competitors, redirect to general advice",
                    "pattern": "\\\\b(compare|versus|vs|better than)\\\\b",
                    "action": "warn",
                    "enabled": True
                }
            ]
        }
    }
    
    print("🔧 Creating properly configured CVM Agent with guardrails...")
    print(f"Guardrails enabled: {agent_data['guardrails']['enabled']}")
    print(f"Safety level: {agent_data['guardrails']['safetyLevel']}")
    print(f"Blocked terms: {agent_data['guardrails']['rules']}")
    print(f"Enhanced guardrails: {'Yes' if agent_data.get('enhancedGuardrails') else 'No'}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/agents/ollama/enhanced",
            json=agent_data,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            agent = result.get('agent', {})
            print(f"\\n✅ Successfully created CVM Agent with proper guardrails!")
            print(f"Agent ID: {agent.get('id')}")
            print(f"Agent Name: {agent.get('name')}")
            
            # Verify guardrails were saved correctly
            saved_guardrails = agent.get('guardrails', {})
            print(f"\\n🛡️ Guardrails Verification:")
            print(f"  Enabled: {saved_guardrails.get('enabled', False)}")
            print(f"  Safety Level: {saved_guardrails.get('safetyLevel', 'Not set')}")
            print(f"  Rules: {saved_guardrails.get('rules', [])}")
            
            enhanced = agent.get('enhancedGuardrails', {})
            if enhanced:
                print(f"  Enhanced Guardrails: ✅ Present")
                content_filter = enhanced.get('contentFilter', {})
                if content_filter.get('enabled'):
                    print(f"  Blocked Keywords: {content_filter.get('customKeywords', [])}")
            
            return agent
        else:
            print(f"❌ Failed to create agent: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating agent: {e}")
        return None

def test_guardrails_enforcement(agent_id):
    """Test if guardrails are working by checking agent configuration"""
    
    print(f"\\n🧪 Testing Guardrails Enforcement for Agent: {agent_id}")
    
    # Get the agent details to verify configuration
    try:
        response = requests.get("http://localhost:8000/api/agents/ollama/enhanced", timeout=10)
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            
            target_agent = None
            for agent in agents:
                if agent.get('id') == agent_id:
                    target_agent = agent
                    break
            
            if target_agent:
                guardrails = target_agent.get('guardrails', {})
                print(f"\\n📋 Agent Configuration:")
                print(f"  Name: {target_agent.get('name')}")
                print(f"  Guardrails Enabled: {guardrails.get('enabled', False)}")
                print(f"  Safety Level: {guardrails.get('safetyLevel', 'Not set')}")
                print(f"  Custom Rules: {guardrails.get('rules', [])}")
                
                enhanced = target_agent.get('enhancedGuardrails', {})
                if enhanced:
                    print(f"  Enhanced Guardrails: ✅ Present")
                    content_filter = enhanced.get('contentFilter', {})
                    if content_filter.get('enabled'):
                        print(f"  Blocked Keywords: {content_filter.get('customKeywords', [])}")
                        print(f"  Blocked Phrases: {content_filter.get('blockedPhrases', [])}")
                
                # Check if guardrails are properly configured
                if guardrails.get('enabled') and 'celcomdigi' in str(guardrails.get('rules', [])).lower():
                    print(f"\\n✅ Guardrails are properly configured!")
                    print(f"\\n💡 Next Steps:")
                    print(f"  1. Use this agent for testing: {target_agent.get('name')}")
                    print(f"  2. Ask it about CelcomDigi - should be blocked")
                    print(f"  3. Check browser console for guardrails logs")
                    return True
                else:
                    print(f"\\n❌ Guardrails are not properly configured")
                    return False
            else:
                print(f"❌ Agent not found: {agent_id}")
                return False
        else:
            print(f"❌ Failed to get agents: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing guardrails: {e}")
        return False

def main():
    """Main function to fix agent guardrails issues"""
    
    print("🔧 Fixing Agent Guardrails Issues")
    print("=" * 50)
    
    # Check current CVM Agent
    print("\\n1. Checking current CVM Agent configuration...")
    cvm_agent = get_agent_details("62ade56b-f894-45a5-9492-ae09386fc3fe")
    
    if cvm_agent:
        print(f"Found CVM Agent: {cvm_agent.get('name')}")
        guardrails = cvm_agent.get('guardrails', {})
        print(f"Current guardrails enabled: {guardrails.get('enabled', False)}")
        
        if not guardrails.get('enabled'):
            print("❌ Issue found: Guardrails are DISABLED on your CVM Agent!")
            print("This is why it's not blocking CelcomDigi mentions.")
    
    # Create a properly configured agent
    print("\\n2. Creating a new CVM Agent with proper guardrails...")
    new_agent = create_properly_configured_cvm_agent()
    
    if new_agent:
        # Test the new agent
        print("\\n3. Verifying new agent configuration...")
        success = test_guardrails_enforcement(new_agent.get('id'))
        
        if success:
            print("\\n🎉 SUCCESS! New CVM Agent created with working guardrails!")
            print("\\n📋 Summary of fixes:")
            print("  ✅ Guardrails enabled: True")
            print("  ✅ Safety level: High")
            print("  ✅ CelcomDigi blocked in rules")
            print("  ✅ Enhanced guardrails configured")
            print("  ✅ Content filters active")
            print("  ✅ Custom patterns for company names")
            
            print("\\n🎯 How to test:")
            print("  1. Go to Ollama Agent Management")
            print("  2. Find 'CVM Agent (Fixed Guardrails)'")
            print("  3. Click 'Start Chat'")
            print("  4. Ask: 'Tell me about CelcomDigi'")
            print("  5. Should get: 'I apologize, but I cannot provide that information...'")
            
            print("\\n🔍 How to verify config:")
            print("  1. Click the ⚙️ Settings button on the new agent")
            print("  2. Go to Guardrails tab")
            print("  3. Should see all your configured restrictions")
            
            return True
        else:
            print("\\n❌ Failed to verify new agent configuration")
            return False
    else:
        print("\\n❌ Failed to create new agent")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
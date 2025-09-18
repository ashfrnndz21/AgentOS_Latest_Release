#!/bin/bash

echo "🧪 Testing Strands Agent Adaptation Dialog with Full Configuration"
echo "=================================================================="

# Test 1: Create an Ollama agent with full configuration including guardrails
echo "📝 Step 1: Creating Ollama agent with full configuration..."

AGENT_DATA='{
  "name": "Security Expert Agent",
  "role": "Cybersecurity Specialist",
  "description": "Expert in cybersecurity analysis and threat assessment with advanced guardrails",
  "model": "llama3.2:3b",
  "personality": "Professional, thorough, and security-focused",
  "expertise": "Network security, threat analysis, compliance frameworks",
  "system_prompt": "You are a cybersecurity expert. Analyze security threats and provide recommendations while maintaining strict confidentiality and compliance standards.",
  "temperature": 0.3,
  "max_tokens": 2000,
  "guardrails_enabled": true,
  "safety_level": "high",
  "content_filters": "[\"profanity\", \"harmful\", \"confidential\"]",
  "custom_rules": "[\"Never reveal security vulnerabilities publicly\", \"Always recommend secure practices\", \"Maintain confidentiality of sensitive data\"]"
}'

CREATE_RESPONSE=$(curl -s -X POST http://localhost:5002/api/agents/ollama \
  -H "Content-Type: application/json" \
  -d "$AGENT_DATA")

if echo "$CREATE_RESPONSE" | grep -q '"id"'; then
  AGENT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Created Ollama agent with ID: $AGENT_ID"
else
  echo "❌ Failed to create Ollama agent"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

# Test 2: Verify the agent appears in Strands API with full configuration
echo ""
echo "🔍 Step 2: Verifying agent appears in Strands API with full configuration..."

sleep 2  # Give services time to sync

STRANDS_RESPONSE=$(curl -s http://localhost:5004/api/strands/ollama-agents)

if echo "$STRANDS_RESPONSE" | grep -q "$AGENT_ID"; then
  echo "✅ Agent found in Strands API"
  
  # Check if guardrails are included
  if echo "$STRANDS_RESPONSE" | grep -q '"guardrails"'; then
    echo "✅ Guardrails configuration included"
    
    # Extract and display guardrails info
    echo "📋 Guardrails Configuration:"
    echo "$STRANDS_RESPONSE" | jq -r ".agents[] | select(.id==\"$AGENT_ID\") | .guardrails" 2>/dev/null || echo "   (Raw JSON parsing not available)"
  else
    echo "❌ Guardrails configuration missing"
  fi
  
  # Check if personality and expertise are included
  if echo "$STRANDS_RESPONSE" | grep -q '"personality"'; then
    echo "✅ Personality field included"
  else
    echo "❌ Personality field missing"
  fi
  
  if echo "$STRANDS_RESPONSE" | grep -q '"expertise"'; then
    echo "✅ Expertise field included"
  else
    echo "❌ Expertise field missing"
  fi
  
else
  echo "❌ Agent not found in Strands API"
  echo "Response: $STRANDS_RESPONSE"
fi

# Test 3: Test adaptation process
echo ""
echo "🔄 Step 3: Testing adaptation process..."

ADAPTATION_DATA='{
  "name": "Security Expert Agent (Strands)",
  "role": "Advanced Cybersecurity Specialist",
  "description": "Expert in cybersecurity analysis with Strands intelligence capabilities",
  "reasoning_pattern": "sequential",
  "reflection_enabled": true,
  "chain_of_thought_depth": 5,
  "telemetry_enabled": true
}'

# Note: This would normally be done through the UI, but we can test the backend endpoint
echo "📝 Adaptation configuration ready for UI testing"
echo "   - Full Ollama configuration should be available in adaptation dialog"
echo "   - Guardrails: enabled with high safety level"
echo "   - Content filters: profanity, harmful, confidential"
echo "   - Custom rules: 3 security-focused rules"
echo "   - Personality: Professional, thorough, and security-focused"
echo "   - Expertise: Network security, threat analysis, compliance frameworks"

echo ""
echo "🎯 Manual Testing Steps:"
echo "1. Open http://localhost:5173"
echo "2. Navigate to Strands Multi-Agent Workspace"
echo "3. Go to Agent Palette > Adapt tab"
echo "4. Find 'Security Expert Agent' and click to adapt"
echo "5. Verify Step 1 shows full Ollama configuration including:"
echo "   - Basic info (name, role, model, temperature, max_tokens)"
echo "   - Security & Guardrails section with:"
echo "     * Status: Enabled (high level)"
echo "     * Active filters: profanity, harmful, confidential"
echo "     * Custom rules: 3 rules"
echo "   - Additional Configuration section with:"
echo "     * Personality: Professional, thorough, and security-focused"
echo "     * Expertise: Network security, threat analysis, compliance frameworks"
echo "6. Proceed through adaptation steps and create Strands agent"

echo ""
echo "✅ Test setup complete! Agent ready for UI testing."
echo "🌐 Open http://localhost:5173 to test the adaptation dialog"
// Test A2A Integration
const testA2AIntegration = async () => {
  console.log('🧪 Testing A2A Integration...');
  
  // Test 1: Check A2A service connectivity
  try {
    const response = await fetch('http://localhost:5008/health');
    console.log('✅ A2A Service Status:', response.status);
  } catch (error) {
    console.log('❌ A2A Service not available:', error.message);
  }
  
  // Test 2: Test agent registration
  const testAgentConfig = {
    agent_id: 'test-agent-123',
    name: 'Test A2A Agent',
    description: 'Test agent for A2A integration',
    collaboration_mode: 'participant',
    max_concurrent_agents: 5,
    communication_protocol: 'both',
    auto_registration: true,
    discovery_scope: 'local',
    custom_agents: [],
    conversation_tracing: true,
    real_time_monitoring: true,
    capabilities: ['Chain-of-Thought Reasoning'],
    memory_systems: ['Working Memory'],
    tools: [],
    reasoning_patterns: {
      chain_of_thought: true,
      tree_of_thought: false,
      reflection: false,
      self_critique: false
    }
  };
  
  try {
    const response = await fetch('http://localhost:5008/register-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAgentConfig)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Agent Registration Success:', result);
    } else {
      console.log('❌ Agent Registration Failed:', response.status, await response.text());
    }
  } catch (error) {
    console.log('❌ Agent Registration Error:', error.message);
  }
  
  // Test 3: Test conversation start
  try {
    const response = await fetch('http://localhost:5008/start-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Test A2A conversation',
        agent_ids: ['test-agent-123'],
        enable_tracing: true
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Conversation Start Success:', result);
    } else {
      console.log('❌ Conversation Start Failed:', response.status, await response.text());
    }
  } catch (error) {
    console.log('❌ Conversation Start Error:', error.message);
  }
  
  console.log('🏁 A2A Integration Test Complete');
};

// Run the test
testA2AIntegration();






// Test script to create a sample agent directly through the frontend service
// This can be run in the browser console to test agent creation

console.log('🤖 Testing agent creation...');

// Sample agent configuration
const sampleAgent = {
  name: "Test Research Assistant",
  role: "Research Specialist", 
  description: "A test agent for research and analysis tasks",
  model: "llama3.2:3b",
  personality: "Professional and thorough researcher",
  expertise: "Research, analysis, and information synthesis",
  systemPrompt: "You are a professional research assistant. You excel at finding, analyzing, and synthesizing information from multiple sources. Always provide well-researched, accurate, and comprehensive responses.",
  temperature: 0.3,
  maxTokens: 2000,
  tools: [],
  memory: {
    shortTerm: false,
    longTerm: false,
    contextual: false
  },
  ragEnabled: false,
  knowledgeBases: [],
  guardrails: {
    enabled: true,
    rules: ["fact_checking", "source_verification"],
    safetyLevel: "high",
    contentFilters: ["misinformation"]
  },
  capabilities: {
    conversation: true,
    analysis: true,
    creativity: false,
    reasoning: true
  },
  behavior: {
    response_style: "helpful",
    communication_tone: "professional"
  }
};

// Function to create the agent
async function createTestAgent() {
  try {
    // This would need to be run in the browser console where ollamaAgentService is available
    if (typeof ollamaAgentService !== 'undefined') {
      const createdAgent = await ollamaAgentService.createAgent(sampleAgent);
      console.log('✅ Agent created successfully:', createdAgent);
      return createdAgent;
    } else {
      console.log('❌ ollamaAgentService not available. Run this in the browser console on the Ollama Agents page.');
    }
  } catch (error) {
    console.error('❌ Failed to create agent:', error);
  }
}

// Instructions
console.log(`
📋 Instructions to create a test agent:

1. Go to the Ollama Agents page in your browser
2. Open the browser console (F12 → Console tab)
3. Copy and paste this entire script
4. Run: createTestAgent()

Or simply click the "Create Agent" button in the UI and fill out the form.

The "No Agents Created" message is normal for a fresh installation.
`);

// Export for use
if (typeof window !== 'undefined') {
  window.createTestAgent = createTestAgent;
  window.sampleAgent = sampleAgent;
}
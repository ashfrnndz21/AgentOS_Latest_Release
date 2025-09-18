
// Debug Enhanced Guardrails Creation
// Add this to your browser console when creating an agent

// Override the createAgent method to log enhanced guardrails
const originalCreateAgent = ollamaAgentService.createAgent;
ollamaAgentService.createAgent = function(config) {
    console.log('🔍 Creating agent with config:', config);
    console.log('🛡️ Enhanced guardrails in config:', config.enhancedGuardrails);
    
    if (config.enhancedGuardrails) {
        console.log('✅ Enhanced guardrails found:');
        console.log('  - Content Filter:', config.enhancedGuardrails.contentFilter);
        console.log('  - Custom Keywords:', config.enhancedGuardrails.contentFilter?.customKeywords);
        console.log('  - Custom Rules:', config.enhancedGuardrails.customRules);
    } else {
        console.log('❌ No enhanced guardrails in config');
    }
    
    return originalCreateAgent.call(this, config).then(result => {
        console.log('🔍 Agent created, result:', result);
        console.log('🛡️ Enhanced guardrails in result:', result.enhancedGuardrails);
        return result;
    });
};

// Override getAllAgents to log what's retrieved
const originalGetAllAgents = ollamaAgentService.getAllAgents;
ollamaAgentService.getAllAgents = function() {
    const agents = originalGetAllAgents.call(this);
    console.log('🔍 Retrieved agents:', agents);
    
    agents.forEach((agent, index) => {
        console.log(`🤖 Agent ${index + 1}: ${agent.name}`);
        console.log('  - Enhanced guardrails:', agent.enhancedGuardrails);
        if (agent.enhancedGuardrails) {
            console.log('  - Content filter:', agent.enhancedGuardrails.contentFilter);
            console.log('  - Custom keywords:', agent.enhancedGuardrails.contentFilter?.customKeywords);
        }
    });
    
    return agents;
};

console.log('🔍 Debug logging enabled for enhanced guardrails');

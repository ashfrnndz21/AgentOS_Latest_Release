// Test OllamaService directly
async function testOllamaService() {
    console.log('🧪 Testing OllamaService...');
    
    try {
        // Test direct API call
        console.log('1. Testing direct API call...');
        const response = await fetch('http://localhost:8000/api/ollama/models');
        const data = await response.json();
        console.log('✅ Direct API response:', data);
        console.log('📋 Model count:', data.models?.length || 0);
        
        if (data.models) {
            const modelNames = data.models.map(m => m.name);
            console.log('🎯 Model names:', modelNames);
        }
        
        // Test OllamaService class
        console.log('2. Testing OllamaService class...');
        
        // Simulate the OllamaService listModels method
        const ollamaResponse = await fetch('http://localhost:8000/api/ollama/models');
        if (!ollamaResponse.ok) {
            throw new Error(`HTTP ${ollamaResponse.status}: ${ollamaResponse.statusText}`);
        }
        const ollamaData = await ollamaResponse.json();
        const models = ollamaData.models || [];
        
        console.log('✅ OllamaService simulation result:', models);
        console.log('📊 Models found:', models.length);
        
        return models;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Run the test
testOllamaService()
    .then(models => {
        console.log('🎉 Test completed successfully!');
        console.log('Final model count:', models.length);
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
    });
// Simple test to check if the API endpoint works
const testAPI = async () => {
  try {
    console.log('Testing API endpoint...');
    const response = await fetch('http://localhost:5002/api/agents/ollama');
    const data = await response.json();
    console.log('API Response:', data);
    console.log('Agent count:', data.agents?.length || 0);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

// Run the test
testAPI();
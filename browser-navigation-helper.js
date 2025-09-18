// Run this in your browser console to help navigate to individual analytics

console.log('🎯 Individual Agent Analytics Navigation Helper');
console.log('==============================================');

// Check if we're on the right page
if (window.location.href.includes('localhost') && document.title.includes('Agent')) {
    console.log('✅ You\'re on the Agent Dashboard page');
    
    // Look for the Agents tab
    const agentsTab = document.querySelector('[data-value="agents"], button:contains("Agents")');
    if (agentsTab) {
        console.log('✅ Found Agents tab');
        console.log('👆 Click the "Agents (1)" tab to see individual agent cards');
        
        // Highlight the agents tab
        agentsTab.style.border = '3px solid #00ff00';
        agentsTab.style.animation = 'blink 1s infinite';
        
        // Add blinking animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
    } else {
        console.log('❌ Could not find Agents tab');
    }
    
    // Look for analytics buttons
    setTimeout(() => {
        const analyticsButtons = document.querySelectorAll('button[title="View Analytics"]');
        if (analyticsButtons.length > 0) {
            console.log(`✅ Found ${analyticsButtons.length} analytics buttons`);
            analyticsButtons.forEach((btn, index) => {
                btn.style.border = '3px solid #0066ff';
                btn.style.animation = 'blink 1s infinite';
                console.log(`📊 Analytics button ${index + 1} highlighted in blue`);
            });
        } else {
            console.log('❌ No analytics buttons found - make sure you\'re on the Agents tab');
        }
    }, 1000);
    
} else {
    console.log('❌ Please navigate to the Ollama Agent Dashboard first');
}

console.log('');
console.log('📋 Steps:');
console.log('1. Click the highlighted "Agents (1)" tab');
console.log('2. Scroll down to see agent cards');
console.log('3. Click the highlighted blue 📊 button');
console.log('4. Enjoy your individual agent analytics!');
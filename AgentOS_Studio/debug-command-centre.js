// Debug script for Command Centre white screen issue
// Run this in the browser console to identify the problem

console.log('🔍 Debugging Command Centre white screen...');

// Test 1: Check if React is loaded
console.log('✅ Test 1: React availability');
if (typeof React !== 'undefined') {
    console.log('   ✓ React is loaded');
} else {
    console.log('   ✗ React not found');
}

// Test 2: Check for JavaScript errors
console.log('✅ Test 2: JavaScript errors');
window.addEventListener('error', (e) => {
    console.error('   ❌ JavaScript Error:', e.error);
    console.error('   📍 File:', e.filename, 'Line:', e.lineno);
});

// Test 3: Check for unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('   ❌ Unhandled Promise Rejection:', e.reason);
});

// Test 4: Check if key components are available
console.log('✅ Test 3: Component availability');
const componentsToCheck = [
    'Layout',
    'MainTabs', 
    'QuickActions',
    'AgentTraceability',
    'ProjectTiles'
];

// Test 5: Check for missing CSS
console.log('✅ Test 4: CSS loading');
const stylesheets = Array.from(document.styleSheets);
console.log(`   📊 Loaded stylesheets: ${stylesheets.length}`);

// Test 6: Check for network errors
console.log('✅ Test 5: Network requests');
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('   🌐 Fetch request:', args[0]);
    return originalFetch.apply(this, args)
        .then(response => {
            if (!response.ok) {
                console.error('   ❌ Fetch error:', response.status, response.statusText);
            }
            return response;
        })
        .catch(error => {
            console.error('   ❌ Fetch failed:', error);
            throw error;
        });
};

// Test 7: Check localStorage
console.log('✅ Test 6: LocalStorage');
try {
    const testKey = 'debug-test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    console.log('   ✓ LocalStorage working');
} catch (error) {
    console.error('   ❌ LocalStorage error:', error);
}

// Test 8: Check for memory issues
console.log('✅ Test 7: Memory usage');
if (performance.memory) {
    const memory = performance.memory;
    console.log(`   📊 Used: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
    console.log(`   📊 Total: ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`);
    console.log(`   📊 Limit: ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`);
}

console.log(`
🎯 Instructions:
1. Navigate to the Command Centre page
2. Open browser console (F12)
3. Look for any red error messages
4. Check the Network tab for failed requests
5. Look for any missing files (404 errors)

Common causes of white screen:
- JavaScript syntax errors
- Missing component imports
- Failed API requests
- CSS loading issues
- Memory problems
- React rendering errors
`);

// Export for manual testing
window.debugCommandCentre = {
    checkErrors: () => console.log('Monitoring for errors...'),
    checkMemory: () => performance.memory ? console.log('Memory:', performance.memory) : console.log('Memory API not available'),
    checkLocalStorage: () => {
        try {
            console.log('LocalStorage keys:', Object.keys(localStorage));
        } catch (e) {
            console.error('LocalStorage error:', e);
        }
    }
};
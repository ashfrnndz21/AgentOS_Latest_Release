// Clear industry cache and force Air Liquide industrial context
console.log('🧹 Clearing industry cache...');

// Clear any cached industry configuration
localStorage.removeItem('industryConfig');
localStorage.removeItem('customLogo');

// Set Air Liquide industrial configuration as default
const airLiquideIndustrial = {
  id: 'industrial',
  name: 'industrial',
  displayName: 'Air Liquide Agent OS',
  description: 'Industrial gas and technology operations powered by AI',
  logo: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQwIDUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjIyIiBmaWxsPSIjNEE2RkE1Ii8+PHBhdGggZD0iTTE1IDMyIFExNSAxOCAyNSAxOCBRMzUgMTggMzUgMzIgTDMxIDMyIFEzMSAyMiAyNSAyMiBRMTkgMjIgMTkgMzIgWiIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI1OCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNEQzE0M0MiIGxldHRlci1zcGFjaW5nPSIwLjVweCI+QWlyIExpcXVpZGU8L3RleHQ+PC9zdmc+',
  primaryColor: 'hsl(220, 70%, 55%)',
  accentColor: 'hsl(0, 70%, 55%)',
  gradientBg: 'linear-gradient(145deg, #000000 0%, #4A90E2 50%, #E53E3E 100%)',
  borderColor: 'hsl(220, 70%, 55% / 0.3)',
  navigation: [
    { path: '/', label: 'Industrial Dashboard', icon: 'Command' },
    { path: '/agent-command', label: 'Operations Command Centre', icon: 'Command' },
    { path: '/agents', label: 'Industrial Agents', icon: 'Bot' },
    { path: '/multi-agent-workspace', label: 'Industrial Orchestration', icon: 'Bot' },
    { path: '/mcp-dashboard', label: 'MCP Gateway', icon: 'Server' },
    { path: '/agent-exchange', label: 'Industrial Solutions', icon: 'ShoppingBag' },
    { path: '/procurement-analytics', label: 'Procurement Analytics', icon: 'TrendingUp' },
    { path: '/safety-monitoring', label: 'Safety Monitoring', icon: 'Shield' },
    { path: '/rd-discovery', label: 'R&D Discovery', icon: 'FlaskConical' },
    { path: '/talent-management', label: 'Talent Management', icon: 'Users' },
    { path: '/system-flow', label: 'AgentOS Architecture Blueprint', icon: 'Network' },
    { path: '/settings', label: 'Settings', icon: 'Settings' }
  ]
};

localStorage.setItem('industryConfig', JSON.stringify(airLiquideIndustrial));

console.log('✅ Air Liquide industrial context set as default');
console.log('🔄 Please refresh the page to see the changes');

// Also clear any other cached data that might interfere
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('industry') || key.includes('healthcare') || key.includes('telco'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  if (key !== 'industryConfig') {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed cached key: ${key}`);
  }
});

console.log('🎉 Cache cleared! The sidebar should now show Air Liquide use cases.');
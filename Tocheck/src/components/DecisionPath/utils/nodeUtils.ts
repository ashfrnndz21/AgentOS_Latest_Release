
/**
 * Utility functions for graph nodes
 */

// Generates a random percentage for demo purposes (would come from actual data)
export const getRandomPercentage = (): number => {
  return Math.floor(Math.random() * 100);
};

// Get color based on percentage (green for high, yellow for medium, red for low)
export const getPercentageColor = (percent: number): string => {
  if (percent >= 80) return 'text-green-400';
  if (percent >= 50) return 'text-yellow-400';
  return 'text-red-400';
};

// Generate a random time ago string
export const getRandomTimeAgo = (): string => {
  const timeAgoOptions = ['1m', '2m', '5m', '10m', '15m', '1h', '2h', '1d'];
  return timeAgoOptions[Math.floor(Math.random() * timeAgoOptions.length)] + ' ago';
};

// Format current time for chat messages
export const getCurrentTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Generate network-related responses
const generateNetworkCapexResponse = (userPrompt: string): string => {
  const prompt = userPrompt.toLowerCase();
  
  if (prompt.includes('high-utilization') || prompt.includes('congestion')) {
    return `Based on the Traffic Analysis Agent's findings, the following areas show over 85% utilization during peak hours:\n\n• Metro Core (Downtown): 92% utilization (7-9pm weekdays)\n• Northern Access Network: 89% utilization (8-10pm weekends)\n• Western Transport Ring: 87% utilization (streaming events)\n\nThe Network Performance Analyzer indicates these are priority areas for capacity expansion. Customer complaints about speed in these regions have increased 24% quarter-over-quarter.`;
  } 
  
  if (prompt.includes('roi') || prompt.includes('investment')) {
    return `The Capex Optimization Agent has analyzed potential investments:\n\n• Core Network Upgrade: 3.2x ROI over 3 years ($4.2M investment)\n• Northern Access Expansion: 2.8x ROI over 2 years ($2.1M investment)\n• Western Transport Ring: 1.9x ROI over 18 months ($1.5M investment)\n\nThe Revenue Attribution Agent identifies the core upgrade as highest priority based on enterprise customer concentration and projected growth. Simulation Agent projects 18% capacity increase with this investment.`;
  }
  
  if (prompt.includes('customer') || prompt.includes('behavior')) {
    return `The Customer Behavior Agent analysis shows:\n\n• 42% increase in video streaming during peak hours (7-11pm)\n• 28% growth in IoT connections in suburban areas\n• Enterprise service usage shifting to cloud-based applications\n\nThese patterns are creating capacity pressure points in specific network segments. The Revenue Impact Analyzer suggests these customer behaviors represent a $8.2M revenue opportunity if capacity is properly provisioned.`;
  }
  
  if (prompt.includes('expansion') || prompt.includes('plan')) {
    return `Based on integrated analysis, the Recommendation Agent proposes this 12-month expansion plan:\n\n1. Q1: Core Network Upgrade - $4.2M (highest ROI)\n2. Q2: Northern Access Expansion - $2.1M (addressing critical congestion)\n3. Q3: Edge Computing Deployment - $1.8M (reducing backhaul demand)\n4. Q4: Western Transport Ring - $1.5M (preparing for projected growth)\n\nThis phased approach aligns with budget constraints while addressing the most critical capacity issues first. The Simulation Agent projects this plan will support 27% traffic growth while maintaining quality metrics.`;
  }
  
  if (prompt.includes('revenue') || prompt.includes('generating')) {
    return `The Revenue Attribution Agent analysis shows:\n\n• Enterprise Service Segments: $42M/year (23% of capacity, 38% of revenue)\n• Urban Consumer Broadband: $36M/year (32% of capacity, 33% of revenue)\n• Mobile Data Services: $22M/year (28% of capacity, 20% of revenue)\n• IoT/Connected Devices: $9M/year (12% of capacity, 8% of revenue)\n\nThe highest revenue per capacity unit is in Enterprise Services. The Capex Optimization Agent suggests prioritizing investments in segments supporting Enterprise growth, with expected ROI 1.4x higher than consumer-focused expansions.`;
  }
  
  return `I've analyzed your question about ${userPrompt}.\n\nBased on our network data, I can provide the following insights:\n\n• Our current network utilization averages 76% during peak hours\n• Customer service calls related to network issues have decreased by 18% this quarter\n• The most profitable network segments are in the Enterprise sector\n\nWould you like more detailed analysis on any specific aspect of our network capacity management?`;
};

// Generate customer lifetime value responses
const generateCustomerLifetimeResponse = (userPrompt: string): string => {
  return `After analyzing customer lifetime value patterns related to "${userPrompt}", the Customer Analysis Agent has identified several key insights:\n\n• Premium customers have 3.2x higher retention than standard tier\n• Digital engagement correlates with 27% higher LTV\n• Recent product changes have improved new customer onboarding by 18%\n\nThe Recommendation Engine suggests focusing on digital engagement strategies to maximize customer lifetime value.`;
};

// Generate fallback responses for any project
const generateFallbackResponse = (userPrompt: string): string => {
  return `I've analyzed your question about "${userPrompt}".\n\nHere's what I can tell you:\n\n• This is a demonstration of AI agent capabilities\n• In a real implementation, this would connect to your data sources\n• The system can be customized to your specific business needs\n\nCan I help you with anything specific about this project?`;
};

// Generate realistic mock messages based on user input
export const generateAgentResponse = (userPrompt: string, projectId: string | null): string => {
  if (!userPrompt.trim()) return "I'm not sure what you're asking. Could you please provide more details?";
  
  // Generate response based on project type
  if (projectId === 'network-capex') {
    return generateNetworkCapexResponse(userPrompt);
  } else if (projectId === 'customer-lifetime') {
    return generateCustomerLifetimeResponse(userPrompt);
  } else {
    // Default generic response
    return generateFallbackResponse(userPrompt);
  }
};

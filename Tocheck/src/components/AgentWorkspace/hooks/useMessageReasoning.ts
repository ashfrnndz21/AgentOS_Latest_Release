
import { Message, ReasoningOutput } from '../types';

// Network capex specific mock reasoning data
const networkCapexReasoning = {
  objective: "Optimize network infrastructure investments to maximize ROI while addressing capacity constraints and meeting customer needs.",
  thought: "I need to analyze current network utilization, identify capacity bottlenecks, and develop an investment strategy that balances technical requirements with business impact.",
  reasoning: [
    { step: "Retrieve comprehensive network inventory data to establish baseline capacity", confidence: 0.95 },
    { step: "Analyze traffic patterns to identify high-utilization segments and growth trends", confidence: 0.92 },
    { step: "Map network segments to customer segments and revenue streams", confidence: 0.88 },
    { step: "Simulate different investment scenarios to determine optimal allocation", confidence: 0.85 },
    { step: "Create detailed implementation plan with prioritized upgrades", confidence: 0.91 }
  ],
  constraints: [
    "Capital expenditure must not exceed $12M for the quarter",
    "Critical infrastructure must maintain 99.99% uptime during upgrades",
    "Premium customer segments must see improved experience metrics",
    "All investments must align with 5-year network evolution roadmap"
  ],
  tools: [
    "Network Inventory Analysis Engine",
    "Traffic Pattern Recognition System",
    "Customer Segment Mapper",
    "Investment Scenario Simulator",
    "ROI Calculator"
  ],
  databases: [
    "Network Equipment Inventory",
    "Traffic Measurement Database",
    "Customer Segment Database",
    "Revenue Attribution System",
    "Capital Planning Database"
  ],
  implementation: [
    "Phase 1: Complete detailed inventory verification (2 days)",
    "Phase 2: Identify and prioritize high-impact upgrade locations (3 days)",
    "Phase 3: Prepare technical specifications for each upgrade (5 days)",
    "Phase 4: Develop rollout schedule to minimize service disruption (2 days)",
    "Phase 5: Implement monitoring system for post-upgrade verification (3 days)"
  ],
  verification: "Analysis confirms that the proposed investment plan will address 93% of identified capacity constraints and deliver projected 22.7% ROI, exceeding our target threshold.",
  confidence: 0.89
};

// Default reasoning for general messages
const defaultReasoning: ReasoningOutput = {
  thought: "I need to provide helpful information based on the query.",
  reasoning: [
    { step: "Identify the key elements in the user's question", confidence: 0.95 },
    { step: "Determine which data sources would contain relevant information", confidence: 0.88 },
    { step: "Formulate a response that addresses the user's needs accurately", confidence: 0.85 }
  ],
  constraints: [
    "Must provide accurate information",
    "Response should be concise but complete"
  ],
  verification: "Response checked against available data and aligns with company policies.",
  confidence: 0.89
};

export function useMessageReasoning(message: Message) {
  // Set mock reasoning based on message content for demonstration purposes
  const mockReasoning = message.role === 'assistant' 
    ? (message.reasoning || (message.content.toLowerCase().includes('network') && message.content.length > 100 
        ? networkCapexReasoning 
        : defaultReasoning))
    : undefined;

  return {
    mockReasoning
  };
}

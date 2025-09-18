
// Define mock decision nodes and data lineage for banking projects
import { NodeType } from '@/components/DecisionPath/types';
import { ModelInfo } from '@/components/AgentTraceability';

export const getProjectData = () => {
  return {
    'consumer-banking': {
      department: 'Consumer Banking',
      decisionNodes: generateConsumerBankingDecisionNodes(),
      lineageNodes: generateConsumerBankingLineageNodes(),
      lineageEdges: generateConsumerBankingLineageEdges(),
      agents: [
        {
          name: "Customer Onboarding Agent",
          description: "Streamlines new customer account opening and KYC processes",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "250ms",
            role: "Automates identity verification and account setup workflows"
          },
          tools: ["KYC API connectors", "Document verification", "Credit scoring APIs"],
          dataAccess: ["Customer databases", "Credit bureau data", "Regulatory compliance systems"]
        },
        {
          name: "Personal Finance Advisor",
          description: "Provides personalized financial advice and product recommendations",
          model: {
            name: "Claude 3 Opus",
            provider: "Anthropic",
            paramSize: "1.5 trillion",
            contextLength: "200,000 tokens", 
            latency: "320ms",
            role: "Analyzes spending patterns and recommends financial products"
          },
          tools: ["Financial planning algorithms", "Risk assessment tools", "Product recommendation engine"],
          dataAccess: ["Transaction history", "Account balances", "Product catalogs"]
        },
        {
          name: "Loan Underwriting Agent",
          description: "Automates loan application processing and risk assessment",
          model: {
            name: "Llama 3 70B",
            provider: "Meta",
            paramSize: "70 billion",
            contextLength: "8,000 tokens", 
            latency: "180ms",
            role: "Evaluates creditworthiness and determines loan eligibility"
          },
          tools: ["Credit scoring models", "Income verification", "Collateral assessment"],
          dataAccess: ["Credit reports", "Employment records", "Asset valuations"]
        },
        {
          name: "Fraud Detection Agent",
          description: "Monitors transactions for suspicious activity and fraud prevention",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "230ms",
            role: "Real-time transaction monitoring and fraud pattern recognition"
          },
          tools: ["Anomaly detection algorithms", "Behavioral analytics", "Risk scoring"],
          dataAccess: ["Transaction logs", "Customer behavior patterns", "Fraud databases"]
        },
        {
          name: "Customer Service Agent",
          description: "Handles customer inquiries and provides 24/7 support",
          model: {
            name: "Claude 3 Sonnet",
            provider: "Anthropic",
            paramSize: "540 billion",
            contextLength: "180,000 tokens", 
            latency: "200ms",
            role: "Resolves customer issues and provides banking assistance"
          },
          tools: ["Natural language processing", "Sentiment analysis", "Issue resolution workflows"],
          dataAccess: ["Customer profiles", "Account information", "Service history"]
        }
      ],
      workflow: [
        {
          phase: "Customer Acquisition",
          description: "Onboard new customers with automated KYC and account setup",
          agents: ["Customer Onboarding Agent", "Fraud Detection Agent"],
          outputs: ["Verified customer profiles", "Opened accounts", "Compliance documentation"]
        },
        {
          phase: "Product Recommendation",
          description: "Analyze customer needs and recommend suitable products",
          agents: ["Personal Finance Advisor", "Customer Service Agent"],
          outputs: ["Personalized product recommendations", "Financial planning advice"]
        },
        {
          phase: "Loan Processing",
          description: "Process loan applications with automated underwriting",
          agents: ["Loan Underwriting Agent", "Fraud Detection Agent"],
          outputs: ["Credit decisions", "Risk assessments", "Loan approvals"]
        }
      ]
    },
    'corporate-banking': {
      department: 'Corporate Banking',
      decisionNodes: generateDecisionNodes('corporate-banking'),
      lineageNodes: generateLineageNodes('corporate-banking'),
      lineageEdges: generateLineageEdges('corporate-banking'),
      agents: [
        {
          name: "Corporate Credit Analyst",
          description: "Evaluates corporate credit applications and risk profiles",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "280ms",
            role: "Analyzes financial statements and assesses corporate creditworthiness"
          },
          tools: ["Financial ratio analysis", "Industry benchmarking", "Credit modeling"],
          dataAccess: ["Corporate financials", "Industry data", "Market intelligence"]
        },
        {
          name: "Cash Management Agent",
          description: "Optimizes corporate cash flow and liquidity management",
          model: {
            name: "Claude 3 Opus",
            provider: "Anthropic",
            paramSize: "1.5 trillion",
            contextLength: "200,000 tokens", 
            latency: "350ms",
            role: "Provides cash forecasting and working capital optimization"
          },
          tools: ["Cash flow forecasting", "Liquidity optimization", "Treasury management"],
          dataAccess: ["Account balances", "Payment schedules", "Investment portfolios"]
        },
        {
          name: "Trade Finance Agent",
          description: "Processes trade finance transactions and documentation",
          model: {
            name: "GPT-4 Turbo",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "260ms",
            role: "Automates letter of credit and trade documentation processing"
          },
          tools: ["Document processing", "Trade compliance checking", "Settlement automation"],
          dataAccess: ["Trade documents", "Regulatory databases", "Partner bank systems"]
        },
        {
          name: "Relationship Manager Assistant",
          description: "Supports relationship managers with client insights and opportunities",
          model: {
            name: "Claude 3 Sonnet",
            provider: "Anthropic",
            paramSize: "540 billion",
            contextLength: "180,000 tokens", 
            latency: "220ms",
            role: "Identifies cross-selling opportunities and client engagement strategies"
          },
          tools: ["Client analytics", "Opportunity identification", "Relationship mapping"],
          dataAccess: ["Client profiles", "Transaction history", "Market data"]
        }
      ]
    },
    'wealth-management': {
      department: 'Wealth Management',
      decisionNodes: generateDecisionNodes('wealth-management'),
      lineageNodes: generateLineageNodes('wealth-management'),
      lineageEdges: generateLineageEdges('wealth-management'),
      agents: [
        {
          name: "Portfolio Optimization Agent",
          description: "Creates and rebalances investment portfolios based on client risk profiles",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "300ms",
            role: "Optimizes asset allocation and portfolio performance"
          },
          tools: ["Modern portfolio theory", "Risk modeling", "Asset allocation algorithms"],
          dataAccess: ["Market data", "Client risk profiles", "Portfolio holdings"]
        },
        {
          name: "Investment Research Agent",
          description: "Analyzes market trends and generates investment recommendations",
          model: {
            name: "Claude 3 Opus",
            provider: "Anthropic",
            paramSize: "1.5 trillion",
            contextLength: "200,000 tokens", 
            latency: "380ms",
            role: "Conducts fundamental and technical analysis for investment decisions"
          },
          tools: ["Market analysis", "Company research", "Economic modeling"],
          dataAccess: ["Financial markets data", "Company fundamentals", "Economic indicators"]
        },
        {
          name: "Tax Optimization Agent",
          description: "Identifies tax-efficient investment strategies and planning opportunities",
          model: {
            name: "GPT-4 Turbo",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "240ms",
            role: "Optimizes tax implications of investment decisions"
          },
          tools: ["Tax modeling", "Regulatory compliance", "Estate planning tools"],
          dataAccess: ["Tax regulations", "Client tax profiles", "Investment tax implications"]
        },
        {
          name: "Wealth Advisor Assistant",
          description: "Supports wealth advisors with client insights and planning recommendations",
          model: {
            name: "Claude 3 Sonnet",
            provider: "Anthropic",
            paramSize: "540 billion",
            contextLength: "180,000 tokens", 
            latency: "210ms",
            role: "Provides comprehensive wealth planning and advisory support"
          },
          tools: ["Financial planning", "Goal-based investing", "Client communication"],
          dataAccess: ["Client financial data", "Life goals", "Market opportunities"]
        },
        {
          name: "ESG Investment Agent",
          description: "Identifies sustainable investment opportunities aligned with ESG criteria",
          model: {
            name: "Llama 3 70B",
            provider: "Meta",
            paramSize: "70 billion",
            contextLength: "8,000 tokens", 
            latency: "190ms",
            role: "Evaluates environmental, social, and governance factors in investments"
          },
          tools: ["ESG scoring", "Sustainability analysis", "Impact measurement"],
          dataAccess: ["ESG databases", "Sustainability reports", "Impact metrics"]
        }
      ]
    },
    default: {
      department: 'General Banking',
      decisionNodes: generateDecisionNodes('default'),
      lineageNodes: generateLineageNodes('default'),
      lineageEdges: generateLineageEdges('default'),
      agents: [
        {
          name: "General Banking Assistant",
          description: "Handles general banking operations and customer support",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "220ms",
            role: "Multi-purpose banking assistance and transaction processing"
          }
        }
      ]
    }
  };
};

// Generate consumer banking specific decision nodes
function generateConsumerBankingDecisionNodes(): NodeType[] {
  return [
    { 
      id: 'start', 
      type: 'start', 
      label: 'Customer Application', 
      content: 'New customer loan application received', 
      connects: ['tool1'], 
      position: { x: 50, y: 100 } 
    },
    { 
      id: 'tool1', 
      type: 'tool', 
      label: 'KYC Verification', 
      content: 'Performing identity and document verification', 
      connects: ['decision1'], 
      position: { x: 250, y: 100 },
      toolDetails: { 
        input: 'Customer documents', 
        output: 'Verified identity', 
        databases: ['CustomerDB'], 
        executionTime: '2.1s', 
        query: 'SELECT * FROM kyc_documents WHERE customer_id = ?' 
      } 
    },
    { 
      id: 'decision1', 
      type: 'decision', 
      label: 'KYC Status', 
      content: 'Evaluating KYC compliance status', 
      connects: ['tool2', 'alternate1'], 
      position: { x: 450, y: 100 } 
    },
    { 
      id: 'tool2', 
      type: 'tool', 
      label: 'Credit Check', 
      content: 'Analyzing credit history and score', 
      connects: ['tool3'], 
      position: { x: 650, y: 100 },
      toolDetails: { 
        input: 'Customer ID', 
        output: 'Credit Score & History', 
        databases: ['CreditBureau'], 
        executionTime: '1.8s', 
        query: 'GET /credit-score/{customer_id}' 
      } 
    },
    { 
      id: 'alternate1', 
      type: 'alternate', 
      label: 'KYC Failed', 
      content: 'Additional documentation required', 
      connects: ['tool1'], 
      position: { x: 450, y: 250 } 
    },
    { 
      id: 'tool3', 
      type: 'tool', 
      label: 'Risk Assessment', 
      content: 'Calculating loan risk and terms', 
      connects: ['decision2'], 
      position: { x: 850, y: 100 },
      toolDetails: { 
        input: 'Credit data, Income verification', 
        output: 'Risk Score & Loan Terms', 
        databases: ['RiskEngine'], 
        executionTime: '3.2s', 
        query: 'CALL calculate_loan_risk(?)' 
      } 
    },
    { 
      id: 'decision2', 
      type: 'decision', 
      label: 'Approval Decision', 
      content: 'Determining loan approval status', 
      connects: ['tool4', 'alternate2'], 
      position: { x: 1050, y: 100 } 
    },
    { 
      id: 'tool4', 
      type: 'tool', 
      label: 'Account Setup', 
      content: 'Creating customer account and loan records', 
      connects: ['end'], 
      position: { x: 1250, y: 100 },
      toolDetails: { 
        input: 'Approved application', 
        output: 'Active account & loan', 
        databases: ['CoreBanking'], 
        executionTime: '1.5s', 
        query: 'INSERT INTO accounts (customer_id, loan_amount, terms)' 
      } 
    },
    { 
      id: 'alternate2', 
      type: 'alternate', 
      label: 'Application Declined', 
      content: 'Risk assessment indicates high risk', 
      connects: ['end'], 
      position: { x: 1050, y: 250 } 
    },
    { 
      id: 'end', 
      type: 'end', 
      label: 'Process Complete', 
      content: 'Customer application processed', 
      connects: [], 
      position: { x: 1250, y: 250 } 
    },
  ];
}

// Generate consumer banking specific lineage nodes
function generateConsumerBankingLineageNodes(): any[] {
  return [
    { id: 'customerdb', type: 'database', label: 'Customer DB', content: 'Customer profiles and KYC data', position: { x: 50, y: 400 }, isCombinedView: true },
    { id: 'creditbureau', type: 'api', label: 'Credit Bureau API', content: 'External credit scoring service', position: { x: 250, y: 400 }, isCombinedView: true },
    { id: 'kycdata', type: 'file', label: 'KYC Data', content: 'Identity verification documents', position: { x: 450, y: 400 }, isCombinedView: true },
    { id: 'riskengine', type: 'database', label: 'Risk Engine', content: 'Loan risk assessment system', position: { x: 650, y: 400 }, isCombinedView: true },
    { id: 'creditscores', type: 'transformation', label: 'Credit Scores', content: 'Processed credit assessments', position: { x: 850, y: 400 }, isCombinedView: true },
    { id: 'corebanking', type: 'database', label: 'Core Banking', content: 'Account and transaction systems', position: { x: 1050, y: 400 }, isCombinedView: true },
    { id: 'loanrecords', type: 'file', label: 'Loan Records', content: 'Approved loan documentation', position: { x: 1250, y: 400 }, isCombinedView: true },
  ];
}

// Generate consumer banking specific lineage edges
function generateConsumerBankingLineageEdges(): any[] {
  return [
    { source: 'customerdb', target: 'kycdata', type: 'data_flow' },
    { source: 'creditbureau', target: 'creditscores', type: 'data_flow' },
    { source: 'kycdata', target: 'riskengine', type: 'transformation' },
    { source: 'creditscores', target: 'riskengine', type: 'data_flow' },
    { source: 'riskengine', target: 'corebanking', type: 'dependency' },
    { source: 'corebanking', target: 'loanrecords', type: 'data_flow' },
  ];
}

// Helper functions to generate mock data for other banking projects
function generateDecisionNodes(projectId: string): NodeType[] {
  const baseNodes: NodeType[] = [
    { id: 'start', type: 'start', label: 'Start Process', content: 'Banking process initiated', connects: ['tool1'], position: { x: 50, y: 100 } },
    { id: 'tool1', type: 'tool', label: 'Data Collection', content: 'Gathering required financial data', connects: ['decision1'], position: { x: 250, y: 100 }, toolDetails: { input: 'Client request', output: 'Financial data', databases: ['BankingDB'], executionTime: '0.8s', query: 'SELECT * FROM accounts WHERE ...' } },
    { id: 'decision1', type: 'decision', label: 'Compliance Check', content: 'Verifying regulatory compliance', connects: ['tool2', 'alternate1'], position: { x: 450, y: 100 } },
    { id: 'tool2', type: 'tool', label: 'Risk Analysis', content: 'Analyzing financial risk factors', connects: ['decision2'], position: { x: 650, y: 100 }, toolDetails: { input: 'Financial data', output: 'Risk assessment', databases: ['RiskDB'], executionTime: '1.2s', query: 'CALL risk_analysis(...)' } },
    { id: 'alternate1', type: 'alternate', label: 'Compliance Issue', content: 'Additional review required', connects: ['end'], position: { x: 450, y: 250 } },
    { id: 'decision2', type: 'decision', label: 'Approval Gate', content: 'Final approval decision', connects: ['tool3'], position: { x: 850, y: 100 } },
    { id: 'tool3', type: 'tool', label: 'Execute Transaction', content: 'Processing approved transaction', connects: ['end'], position: { x: 1050, y: 100 }, toolDetails: { input: 'Approved request', output: 'Completed transaction', databases: ['TransactionDB'], executionTime: '0.5s', query: 'INSERT INTO transactions ...' } },
    { id: 'end', type: 'end', label: 'Process Complete', content: 'Banking process completed', connects: [], position: { x: 1050, y: 250 } },
  ];

  return baseNodes;
}

function generateLineageNodes(projectId: string): any[] {
  const baseNodes = [
    { id: 'bankingdb', type: 'database', label: 'Banking DB', content: 'Core banking system data', position: { x: 50, y: 350 } },
    { id: 'clientrequest', type: 'api', label: 'Client Request', content: 'Customer service requests', position: { x: 250, y: 350 } },
    { id: 'financialdata', type: 'file', label: 'Financial Data', content: 'Processed financial information', position: { x: 450, y: 350 } },
    { id: 'riskassessment', type: 'transformation', label: 'Risk Assessment', content: 'Analyzed risk metrics', position: { x: 650, y: 350 } },
    { id: 'riskdb', type: 'database', label: 'Risk DB', content: 'Risk management system', position: { x: 850, y: 350 } },
    { id: 'transactiondb', type: 'database', label: 'Transaction DB', content: 'Transaction processing system', position: { x: 1050, y: 350 } },
    { id: 'completedtransaction', type: 'file', label: 'Completed Transaction', content: 'Final transaction records', position: { x: 1250, y: 350 } },
  ];

  return baseNodes.map(node => ({ ...node, isCombinedView: true }));
}

function generateLineageEdges(projectId: string): any[] {
  return [
    { source: 'bankingdb', target: 'financialdata', type: 'data_flow' },
    { source: 'clientrequest', target: 'financialdata', type: 'data_flow' },
    { source: 'financialdata', target: 'riskassessment', type: 'transformation' },
    { source: 'riskassessment', target: 'riskdb', type: 'data_flow' },
    { source: 'riskdb', target: 'transactiondb', type: 'dependency' },
    { source: 'transactiondb', target: 'completedtransaction', type: 'data_flow' },
  ];
}

// Export decision path metadata for visualization
export const decisionPathMetadata = {
  width: 1800,
  height: 400,
  nodeSize: {
    width: 140,
    height: 70,
  },
  nodeTypes: {
    start: {
      color: '#4ade80',
      icon: 'Play',
    },
    tool: {
      color: '#a8bdf8',
      icon: 'Wrench',
    },
    decision: {
      color: '#facc15',
      icon: 'GitBranch',
    },
    alternate: {
      color: '#f87171',
      icon: 'AlertTriangle',
    },
    end: {
      color: '#9ca3af',
      icon: 'Check',
    },
  },
};

// Export data lineage metadata for visualization
export const dataLineageMetadata = {
  width: 1800,
  height: 400,
  nodeSize: {
    width: 140,
    height: 70,
  },
  nodeTypes: {
    database: {
      color: '#8B5CF6',
      icon: 'Database',
    },
    api: {
      color: '#3B82F6',
      icon: 'Zap',
    },
    file: {
      color: '#10B981',
      icon: 'FileText',
    },
    transformation: {
      color: '#EC4899',
      icon: 'GitMerge',
    },
  },
};

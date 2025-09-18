// Define telco-specific project data and configurations
import { NodeType } from '@/components/DecisionPath/types';
import { ModelInfo } from '@/components/AgentTraceability';

export const getTelcoProjectData = () => {
  return {
    'network-operations': {
      department: 'Network',
      decisionNodes: generateNetworkOperationsDecisionNodes(),
      lineageNodes: generateNetworkOperationsLineageNodes(),
      lineageEdges: generateNetworkOperationsLineageEdges(),
      agents: [
        {
          name: "Network Performance Monitor",
          description: "Real-time monitoring of network performance and quality metrics",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "220ms",
            role: "Monitors network KPIs, latency, throughput, and service quality"
          },
          tools: ["Network monitoring APIs", "Performance analytics", "Alert systems"],
          dataAccess: ["Network topology", "Performance metrics", "Traffic analytics"]
        },
        {
          name: "Capacity Planning Agent",
          description: "Optimizes network capacity and predicts infrastructure needs",
          model: {
            name: "Claude 3 Opus",
            provider: "Anthropic",
            paramSize: "1.5 trillion",
            contextLength: "200,000 tokens", 
            latency: "310ms",
            role: "Analyzes traffic patterns and forecasts capacity requirements"
          },
          tools: ["Capacity modeling", "Traffic prediction", "Resource optimization"],
          dataAccess: ["Traffic data", "Network utilization", "Growth projections"]
        },
        {
          name: "Fault Detection Agent",
          description: "Identifies and diagnoses network faults and service disruptions",
          model: {
            name: "GPT-4 Turbo",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "190ms",
            role: "Detects anomalies and automates fault resolution procedures"
          },
          tools: ["Anomaly detection", "Root cause analysis", "Auto-remediation"],
          dataAccess: ["Network logs", "Alarm data", "Configuration databases"]
        }
      ],
      workflow: [
        {
          phase: "Network Monitoring",
          description: "Continuous monitoring of network performance and health",
          agents: ["Network Performance Monitor", "Fault Detection Agent"],
          outputs: ["Performance dashboards", "Fault alerts", "Quality metrics"]
        },
        {
          phase: "Capacity Planning",
          description: "Analyze traffic patterns and plan infrastructure scaling",
          agents: ["Capacity Planning Agent", "Network Performance Monitor"],
          outputs: ["Capacity forecasts", "Resource requirements", "Scaling plans"]
        }
      ]
    },
    'customer-experience': {
      department: 'CX',
      decisionNodes: generateDecisionNodes('customer-experience'),
      lineageNodes: generateLineageNodes('customer-experience'),
      lineageEdges: generateLineageEdges('customer-experience'),
      agents: [
        {
          name: "Customer Support Agent",
          description: "Handles customer inquiries and technical support requests",
          model: {
            name: "Claude 3 Sonnet",
            provider: "Anthropic",
            paramSize: "540 billion",
            contextLength: "180,000 tokens", 
            latency: "200ms",
            role: "Provides 24/7 customer support and issue resolution"
          },
          tools: ["Knowledge base", "Ticketing system", "Service diagnostics"],
          dataAccess: ["Customer profiles", "Service history", "Product catalogs"]
        },
        {
          name: "Network Diagnostics Agent",
          description: "Diagnoses customer connectivity and service quality issues",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "240ms",
            role: "Analyzes customer connection quality and troubleshoots issues"
          },
          tools: ["Network testing", "Signal analysis", "Performance diagnostics"],
          dataAccess: ["Network topology", "Customer equipment", "Service logs"]
        }
      ]
    },
    'billing-revenue': {
      department: 'Sales & Service',
      decisionNodes: generateDecisionNodes('billing-revenue'),
      lineageNodes: generateLineageNodes('billing-revenue'),
      lineageEdges: generateLineageEdges('billing-revenue'),
      agents: [
        {
          name: "Billing Automation Agent",
          description: "Automates billing processes and revenue assurance",
          model: {
            name: "GPT-4 Turbo",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "210ms",
            role: "Processes usage data and generates accurate customer bills"
          },
          tools: ["Billing engines", "Usage analytics", "Revenue assurance"],
          dataAccess: ["Usage records", "Pricing models", "Customer accounts"]
        },
        {
          name: "Fraud Prevention Agent",
          description: "Detects and prevents telecom fraud and revenue leakage",
          model: {
            name: "Llama 3 70B",
            provider: "Meta",
            paramSize: "70 billion",
            contextLength: "8,000 tokens", 
            latency: "180ms",
            role: "Identifies suspicious usage patterns and prevents fraud"
          },
          tools: ["Fraud detection algorithms", "Pattern analysis", "Risk scoring"],
          dataAccess: ["Call detail records", "Usage patterns", "Fraud databases"]
        }
      ]
    },
    default: {
      department: 'General',
      decisionNodes: generateDecisionNodes('default'),
      lineageNodes: generateLineageNodes('default'),
      lineageEdges: generateLineageEdges('default'),
      agents: [
        {
          name: "General Telco Assistant",
          description: "Handles general telecommunications operations and support",
          model: {
            name: "GPT-4o",
            provider: "OpenAI",
            paramSize: "1.76 trillion",
            contextLength: "128,000 tokens", 
            latency: "220ms",
            role: "Multi-purpose telecommunications assistance and operations"
          }
        }
      ]
    }
  };
};

// Generate network operations specific decision nodes
function generateNetworkOperationsDecisionNodes(): NodeType[] {
  return [
    { 
      id: 'start', 
      type: 'start', 
      label: 'Network Alert', 
      content: 'Network performance degradation detected', 
      connects: ['tool1'], 
      position: { x: 50, y: 100 } 
    },
    { 
      id: 'tool1', 
      type: 'tool', 
      label: 'Performance Analysis', 
      content: 'Analyzing network performance metrics', 
      connects: ['decision1'], 
      position: { x: 250, y: 100 },
      toolDetails: { 
        input: 'Network metrics', 
        output: 'Performance assessment', 
        databases: ['NetworkDB'], 
        executionTime: '1.8s', 
        query: 'SELECT * FROM network_metrics WHERE timestamp > ?' 
      } 
    },
    { 
      id: 'decision1', 
      type: 'decision', 
      label: 'Severity Assessment', 
      content: 'Evaluating impact and severity level', 
      connects: ['tool2', 'alternate1'], 
      position: { x: 450, y: 100 } 
    },
    { 
      id: 'tool2', 
      type: 'tool', 
      label: 'Root Cause Analysis', 
      content: 'Identifying source of performance issue', 
      connects: ['tool3'], 
      position: { x: 650, y: 100 },
      toolDetails: { 
        input: 'Performance data', 
        output: 'Root cause identification', 
        databases: ['FaultDB'], 
        executionTime: '2.1s', 
        query: 'CALL analyze_network_fault(?)' 
      } 
    },
    { 
      id: 'alternate1', 
      type: 'alternate', 
      label: 'Low Impact', 
      content: 'Minor issue - monitoring only', 
      connects: ['end'], 
      position: { x: 450, y: 250 } 
    },
    { 
      id: 'tool3', 
      type: 'tool', 
      label: 'Auto Remediation', 
      content: 'Attempting automated fix procedures', 
      connects: ['decision2'], 
      position: { x: 850, y: 100 },
      toolDetails: { 
        input: 'Fault diagnosis', 
        output: 'Remediation result', 
        databases: ['ConfigDB'], 
        executionTime: '3.5s', 
        query: 'EXEC auto_remediate_fault(?)' 
      } 
    },
    { 
      id: 'decision2', 
      type: 'decision', 
      label: 'Remediation Success', 
      content: 'Checking if auto-fix resolved the issue', 
      connects: ['end', 'alternate2'], 
      position: { x: 1050, y: 100 } 
    },
    { 
      id: 'alternate2', 
      type: 'alternate', 
      label: 'Manual Intervention', 
      content: 'Escalating to network operations team', 
      connects: ['end'], 
      position: { x: 1050, y: 250 } 
    },
    { 
      id: 'end', 
      type: 'end', 
      label: 'Resolution Complete', 
      content: 'Network issue resolved or escalated', 
      connects: [], 
      position: { x: 1250, y: 200 } 
    },
  ];
}

// Generate network operations specific lineage nodes
function generateNetworkOperationsLineageNodes(): any[] {
  return [
    { id: 'networkdb', type: 'database', label: 'Network DB', content: 'Network topology and configuration', position: { x: 50, y: 400 }, isCombinedView: true },
    { id: 'performanceapi', type: 'api', label: 'Performance API', content: 'Real-time network metrics', position: { x: 250, y: 400 }, isCombinedView: true },
    { id: 'alertsystem', type: 'file', label: 'Alert System', content: 'Network monitoring alerts', position: { x: 450, y: 400 }, isCombinedView: true },
    { id: 'faultdb', type: 'database', label: 'Fault DB', content: 'Fault management system', position: { x: 650, y: 400 }, isCombinedView: true },
    { id: 'analytics', type: 'transformation', label: 'Analytics Engine', content: 'Network performance analytics', position: { x: 850, y: 400 }, isCombinedView: true },
    { id: 'configdb', type: 'database', label: 'Config DB', content: 'Network configuration management', position: { x: 1050, y: 400 }, isCombinedView: true },
    { id: 'reports', type: 'file', label: 'Performance Reports', content: 'Network performance dashboards', position: { x: 1250, y: 400 }, isCombinedView: true },
  ];
}

// Generate network operations specific lineage edges
function generateNetworkOperationsLineageEdges(): any[] {
  return [
    { source: 'networkdb', target: 'alertsystem', type: 'data_flow' },
    { source: 'performanceapi', target: 'analytics', type: 'data_flow' },
    { source: 'alertsystem', target: 'faultdb', type: 'transformation' },
    { source: 'analytics', target: 'faultdb', type: 'data_flow' },
    { source: 'faultdb', target: 'configdb', type: 'dependency' },
    { source: 'configdb', target: 'reports', type: 'data_flow' },
  ];
}

// Helper functions to generate mock data for other telco projects
function generateDecisionNodes(projectId: string): NodeType[] {
  const baseNodes: NodeType[] = [
    { id: 'start', type: 'start', label: 'Start Process', content: 'Telco process initiated', connects: ['tool1'], position: { x: 50, y: 100 } },
    { id: 'tool1', type: 'tool', label: 'Data Collection', content: 'Gathering network and customer data', connects: ['decision1'], position: { x: 250, y: 100 }, toolDetails: { input: 'Service request', output: 'Network data', databases: ['TelcoDB'], executionTime: '0.9s', query: 'SELECT * FROM network_data WHERE ...' } },
    { id: 'decision1', type: 'decision', label: 'Service Check', content: 'Verifying service availability', connects: ['tool2', 'alternate1'], position: { x: 450, y: 100 } },
    { id: 'tool2', type: 'tool', label: 'Quality Assessment', content: 'Analyzing service quality metrics', connects: ['decision2'], position: { x: 650, y: 100 }, toolDetails: { input: 'Network data', output: 'Quality metrics', databases: ['QualityDB'], executionTime: '1.1s', query: 'CALL assess_service_quality(...)' } },
    { id: 'alternate1', type: 'alternate', label: 'Service Unavailable', content: 'Service restoration required', connects: ['end'], position: { x: 450, y: 250 } },
    { id: 'decision2', type: 'decision', label: 'Quality Check', content: 'Determining if quality meets standards', connects: ['tool3', 'alternate2'], position: { x: 850, y: 100 } },
    { id: 'tool3', type: 'tool', label: 'Service Optimization', content: 'Optimizing network performance', connects: ['end'], position: { x: 1050, y: 100 }, toolDetails: { input: 'Quality assessment', output: 'Optimized service', databases: ['ConfigDB'], executionTime: '2.0s', query: 'UPDATE network_config SET ...' } },
    { id: 'alternate2', type: 'alternate', label: 'Quality Issue', content: 'Performance improvement needed', connects: ['tool3'], position: { x: 850, y: 250 } },
    { id: 'end', type: 'end', label: 'Process Complete', content: 'Telco process completed', connects: [], position: { x: 1250, y: 150 } },
  ];
  
  return baseNodes;
}

function generateLineageNodes(projectId: string): any[] {
  return [
    { id: 'telcodb', type: 'database', label: 'Telco DB', content: 'Core telecommunications data', position: { x: 50, y: 400 }, isCombinedView: true },
    { id: 'networkapi', type: 'api', label: 'Network API', content: 'Network service interface', position: { x: 250, y: 400 }, isCombinedView: true },
    { id: 'servicedata', type: 'file', label: 'Service Data', content: 'Customer service records', position: { x: 450, y: 400 }, isCombinedView: true },
    { id: 'qualitydb', type: 'database', label: 'Quality DB', content: 'Service quality metrics', position: { x: 650, y: 400 }, isCombinedView: true },
    { id: 'analytics', type: 'transformation', label: 'Network Analytics', content: 'Performance analysis engine', position: { x: 850, y: 400 }, isCombinedView: true },
    { id: 'configdb', type: 'database', label: 'Config DB', content: 'Network configuration database', position: { x: 1050, y: 400 }, isCombinedView: true },
    { id: 'reports', type: 'file', label: 'Service Reports', content: 'Network performance reports', position: { x: 1250, y: 400 }, isCombinedView: true },
  ];
}

function generateLineageEdges(projectId: string): any[] {
  return [
    { source: 'telcodb', target: 'servicedata', type: 'data_flow' },
    { source: 'networkapi', target: 'analytics', type: 'data_flow' },
    { source: 'servicedata', target: 'qualitydb', type: 'transformation' },
    { source: 'analytics', target: 'qualitydb', type: 'data_flow' },
    { source: 'qualitydb', target: 'configdb', type: 'dependency' },
    { source: 'configdb', target: 'reports', type: 'data_flow' },
  ];
}
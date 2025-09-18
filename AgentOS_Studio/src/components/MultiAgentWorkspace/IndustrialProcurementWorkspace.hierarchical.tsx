/**
 * HIERARCHICAL PATTERN - Industrial Procurement & Supply Chain
 * Chief Procurement Officer at top, with specialized departments below
 */

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { IndustrialWorkspaceHeader } from './IndustrialWorkspaceHeader';
import { IndustrialProcurementAgentPalette } from './IndustrialProcurementAgentPalette';
import { IndustrialProcurementPropertiesPanel } from './IndustrialProcurementPropertiesPanel';
import { IndustrialProcurementWorkflowToolbar } from './IndustrialProcurementWorkflowToolbar';
import { ModernAgentNode } from './nodes/ModernAgentNode';
import { ModernDecisionNode } from './nodes/ModernDecisionNode';
import { ModernGuardrailNode } from './nodes/ModernGuardrailNode';
import { ModernMemoryNode } from './nodes/ModernMemoryNode';
import { EnhancedConnectionEdge } from './edges/EnhancedConnectionEdge';

const nodeTypes = {
  agent: ModernAgentNode,
  decision: ModernDecisionNode,
  guardrail: ModernGuardrailNode,
  memory: ModernMemoryNode,
};

const edgeTypes = {
  enhanced: EnhancedConnectionEdge,
};

// HIERARCHICAL PATTERN - Supply Chain Procurement
// Chief Procurement Officer (CPO) at top, with specialized departments below
const initialNodes: Node[] = [
  // TOP LEVEL - Chief Procurement Officer (Supervisor)
  {
    id: 'chief-procurement-officer',
    type: 'agent',
    position: { x: 500, y: 50 },
    data: {
      label: 'Chief Procurement Officer',
      agentType: 'Chief Procurement Officer',
      model: 'Claude 3.5 Sonnet + Strategic Intelligence',
      tools: ['Strategic Planning', 'Executive Decisions', 'Budget Allocation', 'Stakeholder Management'],
      guardrails: ['Executive Authority', 'Budget Limits'],
      memory: true,
      reasoning: 'strategic-executive',
      status: 'supervising',
      description: 'Executive oversight of entire procurement strategy and operations',
      capabilities: ['Strategic Planning', 'Executive Decisions', 'Budget Allocation', 'Stakeholder Management'],
      budgetManaged: '$50M',
      strategicInitiatives: 8
    }
  },
  
  // LEVEL 2 - Department Heads (Middle Management)
  {
    id: 'sourcing-director',
    type: 'agent',
    position: { x: 200, y: 200 },
    data: {
      label: 'Sourcing Director',
      agentType: 'Sourcing Director',
      model: 'Claude 3 Opus + Sourcing Intelligence',
      tools: ['Supplier Strategy', 'Market Analysis', 'Category Management', 'Team Leadership'],
      guardrails: ['Sourcing Policies', 'Supplier Standards'],
      memory: true,
      reasoning: 'sourcing-strategic',
      status: 'directing',
      description: 'Manages sourcing strategy and supplier relationship teams',
      teamSize: 12,
      categoriesManaged: 6
    }
  },
  {
    id: 'contracts-director',
    type: 'agent',
    position: { x: 500, y: 200 },
    data: {
      label: 'Contracts Director',
      agentType: 'Contracts Director',
      model: 'Amazon Titan + Legal Intelligence',
      tools: ['Contract Strategy', 'Legal Review', 'Risk Management', 'Compliance Oversight'],
      guardrails: ['Legal Compliance', 'Contract Standards'],
      memory: true,
      reasoning: 'legal-strategic',
      status: 'overseeing',
      description: 'Oversees all contract negotiations and legal compliance',
      contractsManaged: 450,
      complianceScore: '99.1%'
    }
  },
  {
    id: 'operations-director',
    type: 'agent',
    position: { x: 800, y: 200 },
    data: {
      label: 'Operations Director',
      agentType: 'Operations Director',
      model: 'Llama 3.1 70B + Operations Intelligence',
      tools: ['Process Optimization', 'Quality Management', 'Logistics Oversight', 'Performance Monitoring'],
      guardrails: ['Quality Standards', 'Operational Limits'],
      memory: true,
      reasoning: 'operations-strategic',
      status: 'optimizing',
      description: 'Manages operational efficiency and quality assurance',
      processesOptimized: 23,
      efficiencyGain: '18.7%'
    }
  },
  
  // LEVEL 3 - Specialist Agents (Operational Level)
  {
    id: 'supplier-research-specialist',
    type: 'agent',
    position: { x: 100, y: 350 },
    data: {
      label: 'Supplier Research Specialist',
      agentType: 'Supplier Research Specialist',
      model: 'Claude 3.5 Haiku + Research Tools',
      tools: ['Market Research', 'Supplier Discovery', 'Due Diligence', 'Database Analysis'],
      guardrails: ['Research Standards', 'Data Privacy'],
      memory: true,
      reasoning: 'research-focused',
      status: 'researching',
      description: 'Specialized in supplier discovery and market intelligence',
      suppliersResearched: 1247,
      researchAccuracy: '94.2%'
    }
  },
  {
    id: 'rfp-specialist',
    type: 'agent',
    position: { x: 300, y: 350 },
    data: {
      label: 'RFP Specialist',
      agentType: 'RFP Specialist',
      model: 'Mixtral 8x7B + Document Generation',
      tools: ['RFP Creation', 'Technical Specifications', 'Bid Analysis', 'Vendor Communication'],
      guardrails: ['RFP Standards', 'Fair Competition'],
      memory: true,
      reasoning: 'document-focused',
      status: 'generating',
      description: 'Creates comprehensive RFPs and manages bid processes',
      rfpsGenerated: 89,
      bidParticipation: '87%'
    }
  },
  {
    id: 'negotiation-specialist',
    type: 'agent',
    position: { x: 500, y: 350 },
    data: {
      label: 'Negotiation Specialist',
      agentType: 'Negotiation Specialist',
      model: 'Claude 3 Opus + Negotiation AI',
      tools: ['Contract Negotiation', 'Price Analysis', 'Terms Optimization', 'Relationship Management'],
      guardrails: ['Negotiation Limits', 'Approval Workflows'],
      memory: true,
      reasoning: 'negotiation-focused',
      status: 'negotiating',
      description: 'Expert in contract negotiations and supplier relationships',
      activeNegotiations: 15,
      avgSavings: '14.3%'
    }
  },
  {
    id: 'quality-specialist',
    type: 'agent',
    position: { x: 700, y: 350 },
    data: {
      label: 'Quality Specialist',
      agentType: 'Quality Specialist',
      model: 'Amazon Titan + Quality Systems',
      tools: ['Quality Audits', 'Supplier Assessment', 'Certification Tracking', 'Performance Monitoring'],
      guardrails: ['Quality Standards', 'Certification Requirements'],
      memory: true,
      reasoning: 'quality-focused',
      status: 'auditing',
      description: 'Ensures supplier quality and compliance standards',
      auditsCompleted: 234,
      qualityScore: '98.9%'
    }
  },
  {
    id: 'logistics-specialist',
    type: 'agent',
    position: { x: 900, y: 350 },
    data: {
      label: 'Logistics Specialist',
      agentType: 'Logistics Specialist',
      model: 'Llama 3.1 8B + Logistics AI',
      tools: ['Route Optimization', 'Delivery Tracking', 'Inventory Management', 'Cost Analysis'],
      guardrails: ['Safety Regulations', 'Transport Compliance'],
      memory: true,
      reasoning: 'logistics-focused',
      status: 'coordinating',
      description: 'Optimizes logistics and delivery operations',
      shipmentsManaged: 567,
      onTimeDelivery: '97.8%'
    }
  },
  
  // SUPPORT SYSTEMS
  {
    id: 'procurement-memory-hub',
    type: 'memory',
    position: { x: 300, y: 500 },
    data: {
      label: 'Procurement Memory Hub',
      config: {
        type: 'hierarchical-memory',
        persistence: true,
        retention: '7 years'
      },
      status: 'active',
      size: '8.4GB',
      entries: 234567
    }
  },
  {
    id: 'compliance-oversight',
    type: 'guardrail',
    position: { x: 700, y: 500 },
    data: {
      label: 'Compliance Oversight',
      config: {
        rules: ['Corporate Governance', 'Procurement Policies', 'Legal Standards', 'Ethical Guidelines'],
        enforcement: 'hierarchical'
      },
      status: 'monitoring',
      violations: 0,
      lastCheck: new Date().toISOString()
    }
  }
];

// HIERARCHICAL RELATIONSHIPS - Top-down command structure
const initialEdges: Edge[] = [
  // CPO to Directors (Command & Control)
  {
    id: 'cpo-to-sourcing',
    source: 'chief-procurement-officer',
    target: 'sourcing-director',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Strategic Direction', status: 'active' }
  },
  {
    id: 'cpo-to-contracts',
    source: 'chief-procurement-officer',
    target: 'contracts-director',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Policy Direction', status: 'active' }
  },
  {
    id: 'cpo-to-operations',
    source: 'chief-procurement-officer',
    target: 'operations-director',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Operational Oversight', status: 'active' }
  },
  
  // Directors to Specialists (Management & Coordination)
  {
    id: 'sourcing-to-research',
    source: 'sourcing-director',
    target: 'supplier-research-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Research Tasks', status: 'active' }
  },
  {
    id: 'sourcing-to-rfp',
    source: 'sourcing-director',
    target: 'rfp-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'RFP Assignments', status: 'active' }
  },
  {
    id: 'contracts-to-negotiation',
    source: 'contracts-director',
    target: 'negotiation-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Negotiation Strategy', status: 'active' }
  },
  {
    id: 'operations-to-quality',
    source: 'operations-director',
    target: 'quality-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Quality Standards', status: 'active' }
  },
  {
    id: 'operations-to-logistics',
    source: 'operations-director',
    target: 'logistics-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'control', label: 'Logistics Coordination', status: 'active' }
  },
  
  // Cross-functional collaboration (Specialist level)
  {
    id: 'research-to-rfp',
    source: 'supplier-research-specialist',
    target: 'rfp-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Supplier Intelligence', status: 'active' }
  },
  {
    id: 'rfp-to-negotiation',
    source: 'rfp-specialist',
    target: 'negotiation-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Bid Results', status: 'active' }
  },
  {
    id: 'negotiation-to-quality',
    source: 'negotiation-specialist',
    target: 'quality-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Contract Terms', status: 'active' }
  },
  {
    id: 'quality-to-logistics',
    source: 'quality-specialist',
    target: 'logistics-specialist',
    type: 'enhanced',
    animated: true,
    data: { type: 'data', label: 'Quality Approval', status: 'active' }
  },
  
  // Memory and Compliance connections
  {
    id: 'cpo-to-memory',
    source: 'chief-procurement-officer',
    target: 'procurement-memory-hub',
    type: 'enhanced',
    data: { type: 'data', label: 'Strategic Data', status: 'active' }
  },
  {
    id: 'contracts-to-compliance',
    source: 'contracts-director',
    target: 'compliance-oversight',
    type: 'enhanced',
    data: { type: 'event', label: 'Compliance Monitoring', status: 'monitoring' }
  }
];

export const IndustrialProcurementWorkspace = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowMetrics, setWorkflowMetrics] = useState({
    complianceScore: 96,
    riskLevel: 'Low',
    auditReadiness: 98,
    performanceScore: 94,
    validationErrors: [] as string[],
    revenueImpact: '$2.8M',
    customersAnalyzed: 847,
    campaignsOptimized: 23
  });

  // Simulate hierarchical workflow activity
  useEffect(() => {
    const interval = setInterval(() => {
      setEdges(edges => edges.map(edge => ({
        ...edge,
        animated: Math.random() > 0.3,
        data: {
          ...edge.data,
          metrics: {
            executionCount: ((edge.data?.metrics as any)?.executionCount || 0) + 1,
            avgDuration: Math.random() * 500 + 100,
            successRate: Math.random() * 20 + 80
          }
        }
      })));

      setWorkflowMetrics(prev => ({
        ...prev,
        customersAnalyzed: prev.customersAnalyzed + Math.floor(Math.random() * 5),
        campaignsOptimized: prev.campaignsOptimized + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'enhanced',
        animated: true,
        data: {
          type: 'data',
          label: 'Custom Connection',
          status: 'active',
        }
      };
      setEdges((eds) => addEdge(edge as any, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowProperties(true);
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const runWorkflow = useCallback(() => {
    setIsRunning(true);
    
    setEdges(edges => edges.map(edge => ({
      ...edge,
      animated: true,
      data: { ...edge.data, status: 'active' }
    })));

    setTimeout(() => {
      setWorkflowMetrics(prev => ({
        ...prev,
        complianceScore: Math.floor(Math.random() * 10) + 90,
        performanceScore: Math.floor(Math.random() * 15) + 85,
        revenueImpact: `${(Math.random() * 2 + 2).toFixed(1)}M`,
      }));
      
      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: { ...edge.data, status: 'success' }
      })));
      
      setIsRunning(false);
    }, 3000);
  }, [setEdges]);

  return (
    <div className="h-screen max-w-7xl mx-auto flex flex-col bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 text-slate-100 overflow-hidden">
      <IndustrialWorkspaceHeader />
      
      <div className="flex-1 flex w-full h-full overflow-hidden">
        <IndustrialProcurementAgentPalette />
        
        <div className="flex-1 relative overflow-hidden">
          {/* Hierarchical Pattern Indicator */}
          <div className="absolute top-2 left-4 z-20 bg-orange-500/20 border border-orange-400/30 rounded-lg px-3 py-1">
            <span className="text-xs font-medium text-orange-300">🏢 HIERARCHICAL PATTERN</span>
          </div>
          
          <IndustrialProcurementWorkflowToolbar 
            isRunning={isRunning}
            onRun={runWorkflow}
            onStop={() => setIsRunning(false)}
            onExport={() => {}}
            nodeCount={nodes.length}
            connectionCount={edges.length}
            metrics={workflowMetrics}
            onShowCompliance={() => {}}
            onShowRiskAssessment={() => {}}
          />
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-gradient-to-br from-slate-900/50 via-orange-900/30 to-red-900/50"
            style={{ backgroundColor: 'transparent' }}
          >
            <Background 
              color="rgba(251, 146, 60, 0.1)" 
              gap={40}
              size={1}
              style={{ backgroundColor: 'transparent', opacity: 0.3 }}
            />
            <Controls 
              className="bg-slate-800/40 backdrop-blur-lg border border-orange-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(251, 146, 60, 0.2)' }}
            />
            <MiniMap 
              className="bg-slate-800/40 backdrop-blur-lg border border-orange-400/20 shadow-lg rounded-xl"
              style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(251, 146, 60, 0.2)' }}
              nodeColor="#fb923c"
              maskColor="rgba(30, 41, 59, 0.6)"
            />
          </ReactFlow>
        </div>
        
        {showProperties && selectedNode && (
          <IndustrialProcurementPropertiesPanel
            node={selectedNode}
            onUpdateNode={updateNodeData}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>
    </div>
  );
};
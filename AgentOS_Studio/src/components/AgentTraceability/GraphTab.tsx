
import React from 'react';
import { NodeDetails } from './components/NodeDetails';
import { ConversationHistory } from './components/conversation/ConversationHistory';
import { GraphVisualizer } from './components/GraphVisualizer';
import { mockConversationHistory, mockOperations, mockReasoningOutputs } from './components/mocks';

interface GraphTabProps {
  decisionNodes: any[];
  lineageNodes: any[];
  lineageEdges: any[];
  decisionPathMetadata: any;
  dataLineageMetadata: any;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
}

export const GraphTab: React.FC<GraphTabProps> = ({
  decisionNodes,
  lineageNodes,
  lineageEdges,
  decisionPathMetadata,
  dataLineageMetadata,
  selectedNode,
  onNodeClick
}) => {
  // Get conversation messages for the selected node
  const selectedNodeMessages = selectedNode ? (mockConversationHistory[selectedNode] || []) : [];
  
  // Get operations for the selected node
  const selectedNodeOperations = selectedNode ? (mockOperations[selectedNode] || []) : [];
  
  // Get the selected node label
  const selectedNodeLabel = selectedNode ? 
    (decisionNodes.find(n => n.id === selectedNode) || lineageNodes.find(n => n.id === selectedNode))?.label || "Selected Node" 
    : "Selected Node";

  // Get reasoning output for the selected node - enhanced matching logic
  const getReasoningOutput = (nodeId: string | null) => {
    if (!nodeId) return undefined;
    
    console.log(`Attempting to find reasoning output for node: ${nodeId}`);
    
    // Direct matching - check if we have a reasoning output with the exact node ID
    if (mockReasoningOutputs[nodeId]) {
      console.log(`Found direct match for node ${nodeId}`);
      return mockReasoningOutputs[nodeId];
    }
    
    // Special case for "start" node (Network Capex Task)
    if (nodeId === "start") {
      console.log("Found Network Capex Task node, returning network-capex reasoning");
      return mockReasoningOutputs['network-capex'];
    }
    
    // Try standardized node ID match
    const standardizedId = getStandardizedNodeId(nodeId);
    if (standardizedId && mockReasoningOutputs[standardizedId]) {
      console.log(`Found match using standardized ID: ${standardizedId}`);
      return mockReasoningOutputs[standardizedId];
    }
    
    // Get the node to examine its content and label
    const node = decisionNodes.find(n => n.id === nodeId) || lineageNodes.find(n => n.id === nodeId);
    
    // Special case for network Capex related nodes based on node label
    if (node && node.label && 
        (node.label.toLowerCase().includes('network') && 
         (node.label.toLowerCase().includes('capex') || 
          node.label.toLowerCase().includes('capacity')))) {
      console.log("Found node with Network Capex label, returning network-capex reasoning");
      return mockReasoningOutputs['network-capex'];
    }
    
    // Try matching by node content
    if (node && node.content && 
        (node.content.toLowerCase().includes('network') && 
         (node.content.toLowerCase().includes('capex') || 
          node.content.toLowerCase().includes('capacity')))) {
      console.log("Found node with Network Capex content, returning network-capex reasoning");
      return mockReasoningOutputs['network-capex']; 
    }
    
    console.log(`No reasoning output found for node ${nodeId}`);
    return undefined;
  };
  
  // Clean up the selectedNode ID to match the format in mockReasoningOutputs
  const getStandardizedNodeId = (nodeId: string | null): string | null => {
    if (!nodeId) return null;
    
    // Extract the base type (decision, tool, alternate) and number
    let nodeType = '';
    let nodeNumber = '';
    
    if (nodeId.includes('-')) {
      // If it already has a hyphen, just return it
      return nodeId;
    } else if (nodeId.startsWith('decision')) {
      nodeType = 'decision';
      nodeNumber = nodeId.replace('decision', '');
    } else if (nodeId.startsWith('tool')) {
      nodeType = 'tool';
      nodeNumber = nodeId.replace('tool', '');
    } else if (nodeId.startsWith('alternate')) {
      nodeType = 'alternate';
      nodeNumber = nodeId.replace('alternate', '');
    } else {
      // For other node types, return as is
      return nodeId;
    }
    
    return `${nodeType}-${nodeNumber}`;
  };
  
  // Get the reasoning output using our enhanced matching function
  const reasoningOutput = selectedNode ? getReasoningOutput(selectedNode) : undefined;
  
  console.log("Selected node:", selectedNode);
  console.log("Node label:", selectedNodeLabel);
  console.log("Has reasoning output:", reasoningOutput ? "Yes" : "No");
  if (reasoningOutput) {
    console.log("Reasoning objective:", reasoningOutput.objective);
  }

  return (
    <div className="space-y-4">
      <GraphVisualizer
        decisionNodes={decisionNodes}
        lineageNodes={lineageNodes}
        lineageEdges={lineageEdges}
        decisionPathMetadata={decisionPathMetadata}
        dataLineageMetadata={dataLineageMetadata}
        selectedNode={selectedNode}
        onNodeClick={onNodeClick}
      />
      
      {/* Node Details & Conversation History */}
      {selectedNode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NodeDetails 
            selectedNode={selectedNode}
            decisionNodes={decisionNodes}
            lineageNodes={lineageNodes}
            selectedNodeMessages={selectedNodeMessages}
            reasoningOutput={reasoningOutput}
          />
          
          <ConversationHistory 
            messages={selectedNodeMessages} 
            selectedNodeId={selectedNode}
            nodeName={selectedNodeLabel}
            operations={selectedNodeOperations}
          />
        </div>
      )}
      
      {/* Show empty conversation history when no node is selected */}
      {!selectedNode && (
        <ConversationHistory 
          messages={[]} 
          selectedNodeId={null}
        />
      )}
    </div>
  );
};

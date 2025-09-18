
export interface NodeType {
  id: string;
  type: string;
  label: string;
  content: string;
  position: {
    x: number;
    y: number;
  };
  operations?: {
    name: string;
    description: string;
    executionTime?: string;
    status?: 'success' | 'warning' | 'error';
  }[];
}

export interface EdgeType {
  source: string;
  target: string;
  type: string;
}

export interface NodeTypeStyles {
  color: string;
  icon: string;
}

export interface DataLineageGraphProps {
  nodes: NodeType[];
  edges: EdgeType[];
  metadata: {
    width: number;
    height: number;
    nodeSize: {
      width: number;
      height: number;
    };
    nodeTypes: {
      [key: string]: NodeTypeStyles;
    };
  };
  onNodeClick?: (nodeId: string) => void;
}


import { ReactNode } from 'react';

export interface NodeType {
  id: string;
  type: string;
  label: string;
  content: string;
  connects: string[];
  position: {
    x: number;
    y: number;
  };
  toolDetails?: {
    input?: string;
    output?: string;
    databases?: string[];
    executionTime?: string;
    query?: string;
  };
  operations?: {
    name: string;
    description: string;
    executionTime?: string;
    status?: 'success' | 'warning' | 'error';
  }[];
}

export interface NodeTypeStyles {
  color: string;
  icon: string;
}

export interface DecisionPathGraphProps {
  nodes: NodeType[];
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
  onNodeClick: (nodeId: string) => void;
  selectedNode: string | null;
  highlightGuardrails?: boolean;
}

export interface PathProperties {
  pathD: string;
  pathId: string;
  isAnimated: boolean;
  isAlternatePath: boolean;
  pathHighlighted: boolean;
  isToolConnection: boolean;
}

export interface GraphNodeProps {
  node: NodeType;
  nodeType: NodeTypeStyles;
  isHovered: boolean;
  isSelected: boolean;
  nodeSize: { width: number; height: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  renderIcon: (iconName: string) => ReactNode;
}

export interface PathDrawingProps {
  nodes: NodeType[];
  hoveredNode: string | null;
  selectedNode: string | null;
  animatedPaths: {[key: string]: boolean};
  nodeSize: { width: number; height: number };
}

export interface GraphHeaderProps {
  toolCount: number;
}

export interface GraphLegendProps {
  nodeTypes: {
    [key: string]: NodeTypeStyles;
  };
}

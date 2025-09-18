import { useState, useCallback } from 'react';
import { UtilityNodeConfig, ConfiguredUtilityNode } from '@/types/WorkflowUtilityTypes';

export function useUtilityConfiguration() {
  const [configuredNodes, setConfiguredNodes] = useState<Map<string, ConfiguredUtilityNode>>(new Map());

  const saveNodeConfiguration = useCallback((nodeId: string, nodeType: string, config: UtilityNodeConfig, position: { x: number; y: number }) => {
    const configuredNode: ConfiguredUtilityNode = {
      id: nodeId,
      type: nodeType as any,
      position,
      config,
      isConfigured: true,
      lastModified: new Date()
    };

    setConfiguredNodes(prev => new Map(prev.set(nodeId, configuredNode)));
    
    // Store in localStorage for persistence
    const allNodes = Array.from(configuredNodes.values());
    allNodes.push(configuredNode);
    localStorage.setItem('workflow-utility-configs', JSON.stringify(allNodes));
    
    console.log('✅ Saved utility configuration:', { nodeId, nodeType, config });
  }, [configuredNodes]);

  const getNodeConfiguration = useCallback((nodeId: string): ConfiguredUtilityNode | undefined => {
    return configuredNodes.get(nodeId);
  }, [configuredNodes]);

  const isNodeConfigured = useCallback((nodeId: string): boolean => {
    return configuredNodes.has(nodeId) && configuredNodes.get(nodeId)?.isConfigured === true;
  }, [configuredNodes]);

  const removeNodeConfiguration = useCallback((nodeId: string) => {
    setConfiguredNodes(prev => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      return newMap;
    });
    
    // Update localStorage
    const allNodes = Array.from(configuredNodes.values()).filter(node => node.id !== nodeId);
    localStorage.setItem('workflow-utility-configs', JSON.stringify(allNodes));
  }, [configuredNodes]);

  const loadSavedConfigurations = useCallback(() => {
    try {
      const saved = localStorage.getItem('workflow-utility-configs');
      if (saved) {
        const nodes: ConfiguredUtilityNode[] = JSON.parse(saved);
        const nodeMap = new Map(nodes.map(node => [node.id, node]));
        setConfiguredNodes(nodeMap);
        console.log('📂 Loaded saved utility configurations:', nodes.length);
      }
    } catch (error) {
      console.error('Failed to load saved configurations:', error);
    }
  }, []);

  const getAllConfiguredNodes = useCallback((): ConfiguredUtilityNode[] => {
    return Array.from(configuredNodes.values());
  }, [configuredNodes]);

  const exportConfiguration = useCallback(() => {
    const allNodes = getAllConfiguredNodes();
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      nodes: allNodes
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getAllConfiguredNodes]);

  const importConfiguration = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && Array.isArray(data.nodes)) {
          const nodeMap = new Map(data.nodes.map((node: ConfiguredUtilityNode) => [node.id, node]));
          setConfiguredNodes(nodeMap);
          localStorage.setItem('workflow-utility-configs', JSON.stringify(data.nodes));
          console.log('📥 Imported utility configurations:', data.nodes.length);
        }
      } catch (error) {
        console.error('Failed to import configuration:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    saveNodeConfiguration,
    getNodeConfiguration,
    isNodeConfigured,
    removeNodeConfiguration,
    loadSavedConfigurations,
    getAllConfiguredNodes,
    exportConfiguration,
    importConfiguration,
    configuredNodesCount: configuredNodes.size
  };
}
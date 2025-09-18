import { useState, useCallback } from 'react';

export interface StrandsUtility {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  type: string;
  color: string;
  isConfigured: boolean;
  configurable: boolean;
}

export function useStrandsUtilities() {
  const utilities: StrandsUtility[] = [
    {
      id: 'decision',
      name: 'Decision Node',
      description: 'Route workflow based on conditions',
      icon: '🔀',
      category: 'Logic',
      type: 'strands-decision',
      color: '#f59e0b',
      isConfigured: true,
      configurable: true
    },
    {
      id: 'handoff',
      name: 'Handoff Node',
      description: 'Transfer control to human agent',
      icon: '🤝',
      category: 'Human',
      type: 'strands-handoff',
      color: '#ef4444',
      isConfigured: true,
      configurable: true
    },
    {
      id: 'human',
      name: 'Human Node',
      description: 'Human agent intervention point',
      icon: '👤',
      category: 'Human',
      type: 'strands-human',
      color: '#06b6d4',
      isConfigured: true,
      configurable: true
    },
    {
      id: 'memory',
      name: 'Memory Node',
      description: 'Store and retrieve workflow context',
      icon: '🧠',
      category: 'Data',
      type: 'strands-memory',
      color: '#8b5cf6',
      isConfigured: true,
      configurable: true
    },
    {
      id: 'guardrail',
      name: 'Guardrail Node',
      description: 'Safety and compliance checks',
      icon: '🛡️',
      category: 'Safety',
      type: 'strands-guardrail',
      color: '#10b981',
      isConfigured: true,
      configurable: true
    },
    {
      id: 'aggregator',
      name: 'Aggregator Node',
      description: 'Combine multiple agent outputs',
      icon: '📊',
      category: 'Data',
      type: 'strands-aggregator',
      color: '#3b82f6',
      isConfigured: true,
      configurable: true
    },
    {
      id: 'monitor',
      name: 'Monitor Node',
      description: 'Track workflow performance',
      icon: '📈',
      category: 'Analytics',
      type: 'strands-monitor',
      color: '#f97316',
      isConfigured: true,
      configurable: true
    },
    {
      id: 'chat-interface',
      name: 'Chat Interface',
      description: 'Add conversational AI to your workflow',
      icon: '💬',
      category: 'Interface',
      type: 'strands-chat-interface',
      color: '#6366f1',
      isConfigured: false,
      configurable: true
    }
  ];

  const [selectedUtility, setSelectedUtility] = useState<StrandsUtility | null>(null);

  const getUtilitiesByCategory = useCallback((category?: string) => {
    if (!category) return utilities;
    return utilities.filter(utility => utility.category === category);
  }, []);

  const getUtilityById = useCallback((id: string) => {
    return utilities.find(utility => utility.id === id);
  }, []);

  const updateUtilityConfig = useCallback((id: string, isConfigured: boolean) => {
    // In a real implementation, this would update the backend
    console.log(`Updating utility ${id} configuration:`, isConfigured);
  }, []);

  return {
    utilities,
    selectedUtility,
    setSelectedUtility,
    getUtilitiesByCategory,
    getUtilityById,
    updateUtilityConfig
  };
}
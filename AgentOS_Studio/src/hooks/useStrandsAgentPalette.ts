/**
 * Hook for managing Strands-compatible Ollama agents
 * Transforms existing Ollama agents into Strands format
 */

import { useState, useEffect, useMemo } from 'react';
import { StrandsOllamaAgent } from '@/types/StrandsTypes';
// Temporarily removed Ollama integration to isolate white screen issue
// import { useOllamaAgentsForPaletteFixed as useOllamaAgentsForPalette, PaletteAgent } from './useOllamaAgentsForPalette.fixed';
import { apiClient } from '@/lib/apiClient';
import { strandsToolSystem } from '@/lib/services/StrandsToolSystem';

export interface StrandsAgentCategory {
  name: string;
  description: string;
  agents: StrandsOllamaAgent[];
  icon: string;
  color: string;
}

export const useStrandsAgentPalette = () => {
  // Temporarily disabled Ollama integration
  const ollamaAgents: any[] = [];
  const ollamaLoading = false;
  const [strandsAgents, setStrandsAgents] = useState<StrandsOllamaAgent[]>([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load available Ollama models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await apiClient.getOllamaModels();
        setAvailableModels(models);
      } catch (error) {
        console.error('Failed to load Ollama models:', error);
        setAvailableModels([]);
      }
    };

    loadModels();
  }, []);

  // Transform Ollama agents to Strands format
  useEffect(() => {
    if (ollamaLoading) {
      setLoading(true);
      return;
    }

    if (!ollamaAgents.length) {
      setStrandsAgents([]);
      setLoading(false);
      return;
    }

    const transformAgents = async () => {
      try {

        const transformed = await Promise.all(
          ollamaAgents.map(async (agent) => {
            const strandsAgent: StrandsOllamaAgent = {
              id: agent.id,
              name: agent.name,
              model: agent.model || 'llama3.2:latest',
              systemPrompt: agent.systemPrompt || `You are ${agent.name}, a helpful AI assistant.`,
              tools: await getAgentTools(agent),
              
              // Strands-specific properties
              reasoningPattern: determineReasoningPattern(agent),
              contextManagement: {
                preserveMemory: true,
                maxContextLength: 4000,
                compressionLevel: 'summary'
              },
              
              // Ollama configuration
              ollamaConfig: {
                temperature: agent.temperature || 0.7,
                maxTokens: agent.maxTokens || 1000,
                keepAlive: '5m'
              },
              
              // Agent capabilities and categorization
              capabilities: agent.capabilities || [],
              category: categorizeAgent(agent),
              
              // Metadata
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            return strandsAgent;
          })
        );

        setStrandsAgents(transformed);
      } catch (error) {
        console.error('Failed to transform agents:', error);
        setStrandsAgents([]);
      } finally {
        setLoading(false);
      }
    };

    transformAgents();
  }, [ollamaAgents, ollamaLoading]);

  // Get tools for an agent
  const getAgentTools = async (agent: PaletteAgent) => {
    const availableTools = strandsToolSystem.getAvailableTools();
    
    // Assign tools based on agent capabilities
    const agentTools = availableTools.filter(tool => {
      if (agent.capabilities?.includes('calculation') && tool.category === 'calculator') {
        return true;
      }
      if (agent.capabilities?.includes('research') && tool.category === 'web_search') {
        return true;
      }
      if (agent.capabilities?.includes('analysis') && tool.name === 'python_repl') {
        return true;
      }
      // Always include basic tools
      if (['current_time', 'letter_counter'].includes(tool.name)) {
        return true;
      }
      return false;
    });

    return agentTools;
  };

  // Determine reasoning pattern based on agent type
  const determineReasoningPattern = (agent: PaletteAgent): 'sequential' | 'parallel' | 'conditional' => {
    if (agent.capabilities?.includes('analysis') || agent.capabilities?.includes('research')) {
      return 'sequential'; // Research and analysis benefit from step-by-step reasoning
    }
    if (agent.capabilities?.includes('coordination') || agent.capabilities?.includes('management')) {
      return 'parallel'; // Coordination agents can handle multiple tasks
    }
    return 'sequential'; // Default to sequential
  };

  // Categorize agent based on capabilities
  const categorizeAgent = (agent: PaletteAgent): 'research' | 'calculation' | 'documentation' | 'general' => {
    if (agent.capabilities?.includes('research') || agent.capabilities?.includes('analysis')) {
      return 'research';
    }
    if (agent.capabilities?.includes('calculation') || agent.capabilities?.includes('math')) {
      return 'calculation';
    }
    if (agent.capabilities?.includes('documentation') || agent.capabilities?.includes('writing')) {
      return 'documentation';
    }
    return 'general';
  };

  // Categorized agents for palette display
  const agentCategories = useMemo((): StrandsAgentCategory[] => {
    const categories: StrandsAgentCategory[] = [
      {
        name: 'Research Agents',
        description: 'Agents specialized in research, analysis, and data gathering',
        agents: strandsAgents.filter(a => a.category === 'research'),
        icon: '🔍',
        color: '#3b82f6'
      },
      {
        name: 'Calculation Agents',
        description: 'Agents equipped with mathematical and computational tools',
        agents: strandsAgents.filter(a => a.category === 'calculation'),
        icon: '🧮',
        color: '#10b981'
      },
      {
        name: 'Documentation Agents',
        description: 'Agents focused on documentation, writing, and content creation',
        agents: strandsAgents.filter(a => a.category === 'documentation'),
        icon: '📝',
        color: '#f59e0b'
      },
      {
        name: 'General Purpose',
        description: 'Versatile agents for general tasks and conversations',
        agents: strandsAgents.filter(a => a.category === 'general'),
        icon: '🤖',
        color: '#8b5cf6'
      }
    ];

    return categories.filter(category => category.agents.length > 0);
  }, [strandsAgents]);

  // Create new Strands agent
  const createStrandsAgent = async (config: Partial<StrandsOllamaAgent>): Promise<StrandsOllamaAgent> => {
    const agentId = `strands_agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newAgent: StrandsOllamaAgent = {
      id: agentId,
      name: config.name || 'New Strands Agent',
      model: config.model || 'llama3.2:latest',
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant powered by Strands.',
      tools: config.tools || strandsToolSystem.getToolsByCategory('custom'),
      reasoningPattern: config.reasoningPattern || 'sequential',
      contextManagement: config.contextManagement || {
        preserveMemory: true,
        maxContextLength: 4000,
        compressionLevel: 'summary'
      },
      ollamaConfig: config.ollamaConfig || {
        temperature: 0.7,
        maxTokens: 1000,
        keepAlive: '5m'
      },
      capabilities: config.capabilities || [],
      category: config.category || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to backend (extend existing agent creation)
    try {
      const response = await fetch('/api/agents/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAgent.name,
          model: newAgent.model,
          systemPrompt: newAgent.systemPrompt,
          temperature: newAgent.ollamaConfig.temperature,
          maxTokens: newAgent.ollamaConfig.maxTokens,
          // Add Strands-specific metadata
          strandsConfig: {
            reasoningPattern: newAgent.reasoningPattern,
            contextManagement: newAgent.contextManagement,
            tools: newAgent.tools.map(t => t.name)
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Add to local state
      setStrandsAgents(prev => [...prev, newAgent]);
      
      return newAgent;
    } catch (error) {
      console.error('Failed to create Strands agent:', error);
      throw error;
    }
  };

  // Update existing agent
  const updateStrandsAgent = async (agentId: string, updates: Partial<StrandsOllamaAgent>): Promise<void> => {
    try {
      // Update in backend
      const response = await fetch(`/api/agents/ollama/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setStrandsAgents(prev => 
        prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, ...updates, updatedAt: new Date().toISOString() }
            : agent
        )
      );
    } catch (error) {
      console.error('Failed to update Strands agent:', error);
      throw error;
    }
  };

  return {
    strandsAgents,
    agentCategories,
    availableModels,
    loading,
    createStrandsAgent,
    updateStrandsAgent,
    // Utility functions
    getAgentsByCategory: (category: string) => strandsAgents.filter(a => a.category === category),
    getAgentById: (id: string) => strandsAgents.find(a => a.id === id),
    getAvailableTools: () => strandsToolSystem.getAvailableTools(),
    getToolCategories: () => strandsToolSystem.getToolCategories()
  };
};
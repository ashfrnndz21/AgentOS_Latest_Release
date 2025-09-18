import { ReasoningPattern, StrandsTool, MemoryType } from './types';

export const reasoningPatterns: ReasoningPattern[] = [
  {
    id: 'chain_of_thought',
    name: 'Chain-of-Thought',
    description: 'Step-by-step reasoning with explicit intermediate steps',
    complexity: 'basic',
    use_cases: ['Problem solving', 'Mathematical reasoning', 'Logical deduction'],
    compatible_models: ['gpt-4', 'claude-3', 'bedrock-claude']
  },
  {
    id: 'tree_of_thought',
    name: 'Tree-of-Thought',
    description: 'Explore multiple reasoning paths and select the best one',
    complexity: 'advanced',
    use_cases: ['Complex planning', 'Creative problem solving', 'Strategic analysis'],
    compatible_models: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'reflection',
    name: 'Reflective Reasoning',
    description: 'Self-evaluate and improve reasoning through reflection',
    complexity: 'intermediate',
    use_cases: ['Quality assurance', 'Error correction', 'Iterative improvement'],
    compatible_models: ['gpt-4', 'claude-3', 'bedrock-claude']
  },
  {
    id: 'self_critique',
    name: 'Self-Critique',
    description: 'Critically analyze own outputs and identify weaknesses',
    complexity: 'advanced',
    use_cases: ['Content validation', 'Bias detection', 'Quality control'],
    compatible_models: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'multi_step_reasoning',
    name: 'Multi-Step Reasoning',
    description: 'Break complex problems into manageable sub-problems',
    complexity: 'intermediate',
    use_cases: ['Complex analysis', 'Research tasks', 'Multi-faceted problems'],
    compatible_models: ['gpt-4', 'claude-3', 'bedrock-claude']
  },
  {
    id: 'analogical_reasoning',
    name: 'Analogical Reasoning',
    description: 'Use analogies and past experiences to solve new problems',
    complexity: 'advanced',
    use_cases: ['Creative solutions', 'Knowledge transfer', 'Pattern recognition'],
    compatible_models: ['gpt-4', 'claude-3-opus']
  }
];

export const strandsTools: StrandsTool[] = [
  {
    id: 'reasoning_tracer',
    name: 'Reasoning Tracer',
    description: 'Track and visualize reasoning steps',
    category: 'reasoning',
    parameters: [
      { name: 'trace_depth', type: 'number', required: false, description: 'Maximum depth of reasoning trace' },
      { name: 'include_confidence', type: 'boolean', required: false, description: 'Include confidence scores' }
    ],
    reasoning_integration: true
  },
  {
    id: 'memory_consolidator',
    name: 'Memory Consolidator',
    description: 'Consolidate and organize memory across sessions',
    category: 'memory',
    parameters: [
      { name: 'consolidation_strategy', type: 'string', required: true, description: 'Strategy for memory consolidation' },
      { name: 'retention_period', type: 'number', required: false, description: 'How long to retain memories' }
    ],
    reasoning_integration: true
  },
  {
    id: 'reflection_engine',
    name: 'Reflection Engine',
    description: 'Perform deep reflection on reasoning processes',
    category: 'reasoning',
    parameters: [
      { name: 'reflection_depth', type: 'number', required: false, description: 'Depth of reflection analysis' },
      { name: 'focus_areas', type: 'array', required: false, description: 'Specific areas to focus reflection on' }
    ],
    reasoning_integration: true
  },
  {
    id: 'knowledge_graph',
    name: 'Knowledge Graph',
    description: 'Build and query knowledge graphs from reasoning',
    category: 'data',
    parameters: [
      { name: 'graph_type', type: 'string', required: true, description: 'Type of knowledge graph to build' },
      { name: 'max_nodes', type: 'number', required: false, description: 'Maximum number of nodes' }
    ],
    reasoning_integration: true
  },
  {
    id: 'critique_validator',
    name: 'Critique Validator',
    description: 'Validate reasoning through systematic critique',
    category: 'validation',
    parameters: [
      { name: 'validation_criteria', type: 'array', required: true, description: 'Criteria for validation' },
      { name: 'strictness_level', type: 'string', required: false, description: 'How strict the validation should be' }
    ],
    reasoning_integration: true
  },
  {
    id: 'pattern_matcher',
    name: 'Pattern Matcher',
    description: 'Identify patterns in reasoning and data',
    category: 'reasoning',
    parameters: [
      { name: 'pattern_types', type: 'array', required: true, description: 'Types of patterns to match' },
      { name: 'similarity_threshold', type: 'number', required: false, description: 'Threshold for pattern matching' }
    ],
    reasoning_integration: true
  }
];

export const memoryTypes: MemoryType[] = [
  {
    id: 'working_memory',
    name: 'Working Memory',
    description: 'Short-term memory for current reasoning context',
    capacity: 'limited',
    persistence: 'session',
    retrieval_methods: ['recency', 'relevance'],
    consolidation_support: false
  },
  {
    id: 'episodic_memory',
    name: 'Episodic Memory',
    description: 'Memory of specific experiences and events',
    capacity: 'unlimited',
    persistence: 'permanent',
    retrieval_methods: ['temporal', 'contextual', 'associative'],
    consolidation_support: true
  },
  {
    id: 'semantic_memory',
    name: 'Semantic Memory',
    description: 'General knowledge and facts',
    capacity: 'unlimited',
    persistence: 'permanent',
    retrieval_methods: ['semantic', 'categorical', 'hierarchical'],
    consolidation_support: true
  },
  {
    id: 'memory_consolidation',
    name: 'Memory Consolidation',
    description: 'Process of strengthening and organizing memories',
    capacity: 'unlimited',
    persistence: 'permanent',
    retrieval_methods: ['importance', 'frequency', 'recency'],
    consolidation_support: true
  },
  {
    id: 'context_window_management',
    name: 'Context Window Management',
    description: 'Intelligent management of context window for optimal reasoning',
    capacity: 'limited',
    persistence: 'session',
    retrieval_methods: ['relevance', 'importance', 'recency'],
    consolidation_support: false
  }
];
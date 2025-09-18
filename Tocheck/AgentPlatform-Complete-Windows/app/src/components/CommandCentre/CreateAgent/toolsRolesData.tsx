import React from 'react';
import { Bot, BarChart2, Code, MessageSquare, Book, Settings, Link, FileText, Terminal, Brain, Microchip, Database, FileCode } from 'lucide-react';
import { RoleOption, ToolOption } from './types';

export const tools: ToolOption[] = [
  { 
    id: 'code-interpreter', 
    name: 'Code Interpreter', 
    description: 'Allow the agent to write and execute code',
    icon: <Terminal size={16} className="text-green-400" />
  },
  { 
    id: 'reasoning-engine', 
    name: 'Reasoning Engine', 
    description: 'Advanced reasoning capabilities for complex problem-solving',
    icon: <Brain size={16} className="text-purple-400" />
  },
  { 
    id: 'knowledge-graph', 
    name: 'Knowledge Graph', 
    description: 'Navigate and query complex knowledge relationships',
    icon: <Microchip size={16} className="text-blue-400" />
  },
  { 
    id: 'web-search', 
    name: 'Web Search', 
    description: 'Allow the agent to search the web for information',
    icon: <Link size={16} className="text-blue-400" />
  },
  { 
    id: 'document-retrieval', 
    name: 'Document Retrieval', 
    description: 'Allow the agent to retrieve and analyze documents',
    icon: <FileText size={16} className="text-yellow-400" />
  },
  { 
    id: 'api-access', 
    name: 'API Access', 
    description: 'Allow the agent to make API calls to external services',
    icon: <Link size={16} className="text-purple-400" />
  },
  { 
    id: 'knowledge-base', 
    name: 'Knowledge Base', 
    description: 'Allow the agent to access internal knowledge base',
    icon: <Book size={16} className="text-indigo-400" />
  },
  { 
    id: 'prompt-engineering', 
    name: 'Prompt Engineering', 
    description: 'Create and optimize prompts for generative AI models',
    icon: <FileCode size={16} className="text-pink-400" />
  },
  { 
    id: 'database-access', 
    name: 'Database Access', 
    description: 'Allow the agent to query and modify database records',
    icon: <Database size={16} className="text-orange-400" />
  }
];

export const roles: RoleOption[] = [
  {
    id: 'assistant',
    name: 'General Assistant',
    description: 'General purpose AI agent for a wide range of tasks',
    icon: <Bot size={16} className="text-blue-400" />
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Specialized in data analysis and visualization',
    icon: <BarChart2 size={16} className="text-green-400" />
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Specialized in writing and reviewing code',
    icon: <Code size={16} className="text-purple-400" />
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Assists users with questions and troubleshooting',
    icon: <MessageSquare size={16} className="text-yellow-400" />
  },
  {
    id: 'domain-expert',
    name: 'Domain Expert',
    description: 'Specialized knowledge in a specific domain',
    icon: <Book size={16} className="text-red-400" />
  },
  {
    id: 'custom',
    name: 'Custom Role',
    description: 'Define a custom role for your agent',
    icon: <Settings size={16} className="text-gray-400" />
  }
];

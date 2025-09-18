
import { useMemo } from 'react';
import { getProjectData } from '@/components/CommandCentre/ProjectData';

export const useVoiceProjectData = (projectId: string | null) => {
  const projectsData = useMemo(() => getProjectData(), []);
  
  const projectNames = {
    'voice-analytics': 'Voice Conversation Analytics',
    'customer-insights': 'Customer Voice Insights',
    'call-sentiment': 'Call Sentiment Analysis',
    'conversation-trends': 'Conversation Trend Analysis',
    'voice-quality': 'Voice Quality Assessment',
  };

  const currentProject = useMemo(() => {
    if (!projectId || !projectsData[projectId]) return null;
    
    const project = projectsData[projectId];
    const name = projectNames[projectId as keyof typeof projectNames] || projectId;
    
    if (projectId === 'voice-analytics') {
      return {
        id: projectId,
        name: name,
        description: "Advanced voice conversation analytics and insights platform",
        department: project.department || 'Analytics',
        agents: (project.agents || []).map(agent => ({
          name: agent.name,
          role: agent.role,
          description: agent.description
        })),
        tools: [
          'Speech Recognition Engine', 
          'Sentiment Analysis API', 
          'Voice Quality Analyzer',
          'Conversation Transcription'
        ],
        databases: [
          'Call Records DB', 
          'Customer Voice DB', 
          'Sentiment Analytics DB',
          'Voice Quality Metrics'
        ],
        workflow: project.workflow || [],
        created: '2025-03-22'
      };
    }
    
    return {
      id: projectId,
      name: name,
      description: "This project helps analyze voice conversations and extract insights using AI agents.",
      department: project.department || 'Analytics',
      agents: (project.agents || []).map(agent => ({
        name: agent.name,
        role: agent.role
      })),
      tools: ['Voice API Gateway', 'Speech Analytics', 'Sentiment Engine'],
      databases: ['Voice Records DB', 'Analytics Warehouse'],
      created: '2025-03-15'
    };
  }, [projectId, projectsData, projectNames]);

  return { currentProject };
};

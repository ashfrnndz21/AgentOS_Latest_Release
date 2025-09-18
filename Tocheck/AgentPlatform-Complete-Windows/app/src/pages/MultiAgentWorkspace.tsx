import React, { useState } from 'react';
import { WealthManagementWorkspace } from '@/components/MultiAgentWorkspace/WealthManagementWorkspace';
import { TelcoCvmWorkspace } from '@/components/MultiAgentWorkspace/TelcoCvmWorkspace';
import { NetworkTwinWorkspace } from '@/components/MultiAgentWorkspace/NetworkTwinWorkspace';
import { BlankWorkspace } from '@/components/MultiAgentWorkspace/BlankWorkspace';
import { MultiAgentProjectSelector } from '@/components/MultiAgentWorkspace/MultiAgentProjectSelector';

const MultiAgentWorkspace = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleSelectProject = (projectType: string) => {
    setSelectedProject(projectType);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  // Show project selector if no project is selected
  if (!selectedProject) {
    return <MultiAgentProjectSelector onSelectProject={handleSelectProject} />;
  }

  // Show the appropriate workspace based on selection
  if (selectedProject === 'cvm-management') {
    return <TelcoCvmWorkspace />;
  }

  if (selectedProject === 'wealth-management') {
    return <WealthManagementWorkspace />;
  }

  if (selectedProject === 'network-twin') {
    return <NetworkTwinWorkspace />;
  }

  if (selectedProject === 'new-workflow') {
    return <BlankWorkspace />;
  }

  // For other templates, show blank workspace for now
  return <BlankWorkspace />;
};

export default MultiAgentWorkspace;
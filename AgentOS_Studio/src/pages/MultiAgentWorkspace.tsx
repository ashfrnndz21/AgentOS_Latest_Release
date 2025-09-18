import React, { useState } from 'react';
import { WealthManagementWorkspace } from '@/components/MultiAgentWorkspace/WealthManagementWorkspace';
import { TelcoCvmWorkspace } from '@/components/MultiAgentWorkspace/TelcoCvmWorkspace';
import { NetworkTwinWorkspace } from '@/components/MultiAgentWorkspace/NetworkTwinWorkspace';
import { BlankWorkspace } from '@/components/MultiAgentWorkspace/BlankWorkspace';
import { StrandsBlankWorkspace } from '@/components/MultiAgentWorkspace/StrandsBlankWorkspace';
import { MultiAgentProjectSelector } from '@/components/MultiAgentWorkspace/MultiAgentProjectSelector';
// Industrial Technology Workspaces - Disabled again due to white screen
// import { IndustrialProcurementWorkspace } from '@/components/MultiAgentWorkspace/IndustrialProcurementWorkspace';
// import { IndustrialForecastingWorkspace } from '@/components/MultiAgentWorkspace/IndustrialForecastingWorkspace';
// import { IndustrialRecruitmentWorkspace } from '@/components/MultiAgentWorkspace/IndustrialRecruitmentWorkspace';
// import { IndustrialRDWorkspace } from '@/components/MultiAgentWorkspace/IndustrialRDWorkspace';
// import { IndustrialSafetyWorkspace } from '@/components/MultiAgentWorkspace/IndustrialSafetyWorkspace';

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

  if (selectedProject === 'strands-workflow') {
    return <StrandsBlankWorkspace />;
  }

  if (selectedProject === 'new-workflow') {
    return <BlankWorkspace />;
  }

  // Industrial Technology Templates - Temporarily using fallback
  if (selectedProject === 'industrial-procurement') {
    return <BlankWorkspace mode="procurement" />;
  }

  if (selectedProject === 'industrial-forecasting') {
    return <BlankWorkspace mode="forecasting" />;
  }

  if (selectedProject === 'industrial-recruitment') {
    return <BlankWorkspace mode="recruitment" />;
  }

  if (selectedProject === 'industrial-rd') {
    return <BlankWorkspace />;
  }

  if (selectedProject === 'industrial-safety') {
    return <BlankWorkspace />;
  }

  // For other templates, show blank workspace for now
  return <BlankWorkspace />;
};

export default MultiAgentWorkspace;
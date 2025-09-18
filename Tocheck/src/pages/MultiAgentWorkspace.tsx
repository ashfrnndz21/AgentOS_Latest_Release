import React, { useState } from 'react';
import { MultiAgentProjectSelector } from '@/components/MultiAgentWorkspace/MultiAgentProjectSelector';

// Lazy load components with error handling
const BlankWorkspace = React.lazy(() => 
  import('@/components/MultiAgentWorkspace/SimpleBlankWorkspace').then(module => ({
    default: module.SimpleBlankWorkspace
  })).catch(() => ({
    default: () => <div className="p-8 text-center text-white">BlankWorkspace not available</div>
  }))
);

const StrandsBlankWorkspace = React.lazy(() => 
  import('@/components/MultiAgentWorkspace/StrandsBlankWorkspace').catch(() => ({
    default: () => <div className="p-8 text-center text-white">StrandsBlankWorkspace not available</div>
  }))
);

const WealthManagementWorkspace = React.lazy(() => 
  import('@/components/MultiAgentWorkspace/WealthManagementWorkspace').catch(() => ({
    default: () => <div className="p-8 text-center text-white">WealthManagementWorkspace not available</div>
  }))
);

const TelcoCvmWorkspace = React.lazy(() => 
  import('@/components/MultiAgentWorkspace/TelcoCvmWorkspace').catch(() => ({
    default: () => <div className="p-8 text-center text-white">TelcoCvmWorkspace not available</div>
  }))
);

const NetworkTwinWorkspace = React.lazy(() => 
  import('@/components/MultiAgentWorkspace/NetworkTwinWorkspace').catch(() => ({
    default: () => <div className="p-8 text-center text-white">NetworkTwinWorkspace not available</div>
  }))
);

const MultiAgentWorkspace = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleSelectProject = (projectType: string) => {
    setSelectedProject(projectType);
  };

  // Show project selector if no project is selected
  if (!selectedProject) {
    return <MultiAgentProjectSelector onSelectProject={handleSelectProject} />;
  }

  // Show the appropriate workspace based on selection with error boundaries
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p>Loading workspace...</p>
        </div>
      </div>
    }>
      {selectedProject === 'cvm-management' && <TelcoCvmWorkspace />}
      {selectedProject === 'wealth-management' && <WealthManagementWorkspace />}
      {selectedProject === 'network-twin' && <NetworkTwinWorkspace />}
      {selectedProject === 'strands-workflow' && <StrandsBlankWorkspace />}
      {(selectedProject === 'new-workflow' || !['cvm-management', 'wealth-management', 'network-twin', 'strands-workflow'].includes(selectedProject)) && <BlankWorkspace />}
    </React.Suspense>
  );
};

export default MultiAgentWorkspace;
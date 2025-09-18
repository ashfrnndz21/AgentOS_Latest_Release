
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { WorkspaceHeader } from '@/components/AgentWorkspace/WorkspaceHeader';
import { WorkspaceCanvas } from '@/components/AgentWorkspace/WorkspaceCanvas';
import { WorkspaceToolbar } from '@/components/AgentWorkspace/WorkspaceToolbar';
import { PropertiesPanel } from '@/components/AgentWorkspace/PropertiesPanel';
import { RequestAccessDialog } from '@/components/AgentWorkspace/RequestAccessDialog';
import { VoiceAnalyticsHeader } from '@/components/AgentWorkspace/VoiceAnalyticsHeader';
import { useConversation } from '@/components/AgentWorkspace/hooks/useConversation';
import { useVoiceProjectData } from '@/components/AgentWorkspace/hooks/useVoiceProjectData';

const AgentWorkspace = () => {
  const [showProperties, setShowProperties] = useState(false);
  const [showRequestAccessDialog, setShowRequestAccessDialog] = useState(false);
  const [isReasoningVisible, setIsReasoningVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get project ID from URL query params
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const projectId = queryParams.get('projectId');
  
  // Get project data using custom hook
  const { currentProject } = useVoiceProjectData(projectId);
  
  // Mock access control (in a real app, this would come from a user's permissions)
  const [hasAccess, setHasAccess] = useState<boolean>(true);

  // Check access rights when project changes
  useEffect(() => {
    if (projectId) {
      // Allow access to voice analytics projects
      setHasAccess(true);
    }
  }, [projectId]);
  
  // Set up conversation state and handler
  const {
    prompt,
    setPrompt,
    conversation,
    isLoading,
    thinkingMode,
    handlePromptSubmit
  } = useConversation(projectId, currentProject?.name, hasAccess);
  
  const handleRequestAccess = () => {
    setShowRequestAccessDialog(true);
  };
  
  const togglePropertiesPanel = () => {
    setShowProperties(!showProperties);
  };
  
  return (
    <Layout>
      <div className="flex-1 h-screen overflow-hidden bg-beam-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-beam-dark to-beam-dark text-beam-text">
        {/* Voice Analytics Header */}
        <VoiceAnalyticsHeader 
          agentCount={currentProject?.agents?.length || 0}
          toolsCount={currentProject?.tools?.length || 0}
          databasesCount={currentProject?.databases?.length || 0}
        />
        
        {projectId && <WorkspaceHeader />}
        
        <div className="flex h-[calc(100vh-64px-140px)]">
          {/* Main Workspace Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {projectId && (
              <WorkspaceToolbar 
                showProperties={showProperties} 
                toggleProperties={togglePropertiesPanel}
                projectName={currentProject?.name || null}
              />
            )}
            
            {/* Chat Canvas */}
            <div className="flex-1 overflow-hidden">
              <WorkspaceCanvas 
                projectId={projectId} 
                projectName={currentProject?.name || null}
                hasAccess={hasAccess}
                isLoading={isLoading}
                isEmpty={conversation.length <= 1}
                conversation={conversation}
                prompt={prompt}
                setPrompt={setPrompt}
                handlePromptSubmit={handlePromptSubmit}
                reasoning={null}
                isReasoningVisible={isReasoningVisible}
                onRequestAccess={handleRequestAccess}
              />
            </div>
          </div>
          
          {/* Properties Panel - Only shown when enabled */}
          {showProperties && projectId && (
            <PropertiesPanel 
              selectedProjectId={projectId}
              projectInfo={currentProject}
              onClose={() => setShowProperties(false)}
            />
          )}
        </div>
        
        {/* Request Access Dialog */}
        <RequestAccessDialog
          projectName={currentProject?.name || null}
          open={showRequestAccessDialog}
          onOpenChange={setShowRequestAccessDialog}
        />
      </div>
    </Layout>
  );
};

export default AgentWorkspace;

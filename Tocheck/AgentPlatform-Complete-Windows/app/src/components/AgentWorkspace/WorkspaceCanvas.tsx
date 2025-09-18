
import React, { useState } from 'react';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputForm } from './ChatInputForm';
import { EmptyChatState } from './EmptyChatState';
import { AccessRequired } from './AccessRequired';
import { useLangChainKey } from './hooks/useLangChainKey';
import { RagDemo } from './RagDemo';

interface WorkspaceCanvasProps {
  hasAccess: boolean;
  projectId: string | null;
  projectName: string | null;
  isLoading: boolean;
  isEmpty: boolean;
  conversation: any[];
  prompt: string;
  setPrompt: (prompt: string) => void;
  handlePromptSubmit: (e: React.FormEvent) => void;
  reasoning: any;
  isReasoningVisible: boolean;
  onRequestAccess?: () => void;
}

export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({
  hasAccess,
  projectId,
  projectName,
  isLoading,
  isEmpty,
  conversation,
  prompt,
  setPrompt,
  handlePromptSubmit,
  reasoning,
  isReasoningVisible,
  onRequestAccess
}) => {
  const [useLangChain, setUseLangChain] = useState<boolean>(false);
  const [showRagDemo, setShowRagDemo] = useState<boolean>(false);
  const { apiKey, setApiKey, isValid } = useLangChainKey();

  if (!hasAccess) {
    return <AccessRequired 
      projectName={projectName} 
      onRequestAccess={onRequestAccess} 
    />;
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-black to-gray-900 p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {!isEmpty ? (
          <>
            <ChatMessageList messages={conversation} />
            {showRagDemo && <RagDemo />}
          </>
        ) : (
          <EmptyChatState 
            projectName={projectName} 
            onShowRagDemo={() => setShowRagDemo(true)}
          />
        )}
      </div>
      
      <div className="mt-auto">
        <ChatInputForm
          prompt={prompt}
          setPrompt={setPrompt}
          handlePromptSubmit={handlePromptSubmit}
          isLoading={isLoading}
          useLangChain={useLangChain}
          setUseLangChain={setUseLangChain}
          apiKey={apiKey}
          setApiKey={setApiKey}
          apiKeyValid={isValid}
        />
      </div>
    </div>
  );
};

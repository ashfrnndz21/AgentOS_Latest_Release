import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { ChatConfigurationWizard, ChatConfig } from './ChatConfigurationWizard';
import { useReactFlow } from '@xyflow/react';
import { StrandsWorkflowOrchestrator } from '@/lib/services/StrandsWorkflowOrchestrator';

interface AddChatInterfaceButtonProps {
  orchestrator: StrandsWorkflowOrchestrator;
  className?: string;
}

export const AddChatInterfaceButton: React.FC<AddChatInterfaceButtonProps> = ({
  orchestrator,
  className = ''
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const { getViewport, screenToFlowPosition } = useReactFlow();

  const handleAddChatInterface = (config: ChatConfig) => {
    console.log('🎯 AddChatInterfaceButton: Received config:', config);
    
    try {
      // Calculate position for new chat interface node
      const viewport = getViewport();
      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 50
      });

      console.log('📍 Calculated position:', position);

      // Create the chat interface node
      const newNode = orchestrator.createChatInterfaceNode(config, position);
      console.log('🔧 Created node:', newNode);
      
      // Add to workflow (this would typically be handled by the canvas)
      // For now, we'll emit an event that the canvas can listen to
      const event = new CustomEvent('addChatInterfaceNode', {
        detail: { node: newNode, config }
      });
      window.dispatchEvent(event);
      console.log('📡 Event dispatched');

      setShowWizard(false);
      console.log('✅ Chat interface creation completed');
    } catch (error) {
      console.error('❌ Error in handleAddChatInterface:', error);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowWizard(true)}
        className={`bg-indigo-600 hover:bg-indigo-700 text-white ${className}`}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        <Plus className="h-3 w-3 mr-1" />
        Add Chat Interface
      </Button>

      <ChatConfigurationWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onConfirm={handleAddChatInterface}
      />
    </>
  );
};
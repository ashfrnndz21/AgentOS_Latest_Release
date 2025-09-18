import React, { useState } from 'react';

interface A2AAgentCreationDialogBasicProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated?: (agent: any) => void;
}

export const A2AAgentCreationDialogBasic: React.FC<A2AAgentCreationDialogBasicProps> = ({
  open,
  onOpenChange,
  onAgentCreated
}) => {
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentPort, setAgentPort] = useState(8000);
  const [selectedModel, setSelectedModel] = useState('llama3.2:latest');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAgent = async () => {
    if (!agentName.trim()) return;

    setIsCreating(true);
    
    try {
      const newAgent = {
        id: agentName.toLowerCase().replace(/\s+/g, '_'),
        name: agentName,
        description: agentDescription,
        port: agentPort,
        model: selectedModel,
        systemPrompt: systemPrompt,
        tools: ['think'],
        capabilities: ['general']
      };

      console.log('Creating A2A Agent:', newAgent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onAgentCreated) {
        onAgentCreated(newAgent);
      }
      onOpenChange(false);
      
      // Reset form
      setAgentName('');
      setAgentDescription('');
      setAgentPort(8000);
      setSystemPrompt('');
      
    } catch (error) {
      console.error('Failed to create A2A agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Create A2A Agent</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Agent Name *
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g., Weather Agent"
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              placeholder="Brief description of the agent's purpose"
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Port Number
            </label>
            <input
              type="number"
              value={agentPort}
              onChange={(e) => setAgentPort(parseInt(e.target.value) || 8000)}
              placeholder="8000"
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Language Model
            </label>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            >
              <option value="llama3.2:latest">llama3.2:latest</option>
              <option value="llama3.2:1b">llama3.2:1b</option>
              <option value="mistral:latest">mistral:latest</option>
              <option value="phi3:latest">phi3:latest</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful AI assistant..."
              rows={3}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAgent}
            disabled={!agentName.trim() || isCreating}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-md"
          >
            {isCreating ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  );
};




import React, { useState, useRef, useEffect } from 'react';
import { StrandsWorkflowOrchestrator } from '@/lib/services/StrandsWorkflowOrchestrator';
import { ChatExecutionService } from '@/lib/services/ChatExecutionService';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system' | 'escalation';
  sender: string;
  content: string;
  timestamp: Date;
  agentId?: string;
  nodeId?: string;
}

interface ChatWorkflowInterfaceProps {
  orchestrator: StrandsWorkflowOrchestrator;
  workflowId: string;
  onExecutionUpdate?: (status: any) => void;
  className?: string;
}

export const ChatWorkflowInterface: React.FC<ChatWorkflowInterfaceProps> = ({
  orchestrator,
  workflowId,
  onExecutionUpdate,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = new ChatExecutionService(orchestrator);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    addMessage({
      type: 'system',
      sender: 'Multi-Agent Assistant',
      content: 'Hello! I\'m your multi-agent assistant. I can coordinate with specialist agents to help you with various tasks. What can I help you with today?'
    });
  }, []);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    // Add user message
    addMessage({
      type: 'user',
      sender: 'You',
      content: userMessage
    });

    try {
      // Execute workflow with chat callbacks
      const executionId = await chatService.executeWorkflowWithChat(
        workflowId,
        userMessage,
        {
          onAgentStart: (nodeId: string, agentName: string) => {
            addMessage({
              type: 'system',
              sender: 'System',
              content: `${agentName} is now processing your request...`,
              nodeId
            });
            onExecutionUpdate?.({ type: 'agent_start', nodeId, agentName });
          },
          onAgentResponse: (nodeId: string, agentName: string, response: string) => {
            addMessage({
              type: 'agent',
              sender: agentName,
              content: response,
              nodeId
            });
            onExecutionUpdate?.({ type: 'agent_response', nodeId, agentName, response });
          },
          onDecisionMade: (nodeId: string, decision: any, reasoning: string) => {
            addMessage({
              type: 'system',
              sender: 'Decision Engine',
              content: `Decision: ${decision.path || decision.action}. Reasoning: ${reasoning}`,
              nodeId
            });
          },
          onEscalation: (nodeId: string, reason: string, context: any) => {
            addMessage({
              type: 'escalation',
              sender: 'Human Expert',
              content: `This request has been escalated to a human expert. Reason: ${reason}. You will be contacted shortly.`,
              nodeId
            });
          },
          onWorkflowComplete: (result: any) => {
            addMessage({
              type: 'system',
              sender: 'System',
              content: 'Workflow completed successfully. Is there anything else I can help you with?'
            });
          },
          onError: (error: string) => {
            addMessage({
              type: 'system',
              sender: 'System',
              content: `I encountered an error: ${error}. Please try rephrasing your request or contact support if the issue persists.`
            });
          }
        }
      );

      setCurrentExecution(executionId);

    } catch (error) {
      addMessage({
        type: 'system',
        sender: 'System',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`chat-workflow-interface ${className}`}>
      {/* Chat Header */}
      <div className="chat-header bg-blue-600/10 border-b border-gray-600 p-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Multi-Agent Assistant</h3>
        </div>
        <p className="text-sm text-gray-400">Powered by collaborative AI agents</p>
      </div>

      {/* Messages Area */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}-message`}>
            <div className="message-header flex justify-between text-xs font-semibold mb-1 opacity-80">
              <span className="sender">{message.sender}</span>
              <span className="timestamp">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className={`message-content p-3 rounded-lg text-sm leading-relaxed ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white ml-auto max-w-[80%]'
                : message.type === 'agent'
                ? 'bg-green-600/20 border-l-4 border-green-500 text-green-100'
                : message.type === 'escalation'
                ? 'bg-red-600/20 border-l-4 border-red-500 text-red-100'
                : 'bg-yellow-600/20 border-l-4 border-yellow-500 text-yellow-100 italic'
            }`}>
              {message.content}
            </div>
            {message.nodeId && (
              <div className="message-node-info mt-1 text-xs opacity-60">
                <span className="node-id">Node: {message.nodeId}</span>
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
          <div className="typing-indicator flex items-center p-3 bg-gray-600/20 rounded-lg">
            <div className="typing-dots flex mr-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1 animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1 animate-bounce" style={{animationDelay: '0.1s'}}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
            </div>
            <span className="typing-text text-sm text-gray-300">Agents are collaborating...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions flex gap-2 px-4 pb-2 flex-wrap">
        <button 
          className="quick-action-btn bg-blue-600/20 border border-blue-600/30 text-blue-300 px-3 py-1.5 rounded-full text-xs hover:bg-blue-600/30 transition-colors"
          onClick={() => setInputValue("I need help with a technical issue")}
        >
          🔧 Technical Support
        </button>
        <button 
          className="quick-action-btn bg-blue-600/20 border border-blue-600/30 text-blue-300 px-3 py-1.5 rounded-full text-xs hover:bg-blue-600/30 transition-colors"
          onClick={() => setInputValue("I need to analyze some data")}
        >
          📊 Data Analysis
        </button>
        <button 
          className="quick-action-btn bg-blue-600/20 border border-blue-600/30 text-blue-300 px-3 py-1.5 rounded-full text-xs hover:bg-blue-600/30 transition-colors"
          onClick={() => setInputValue("I need help with research")}
        >
          📚 Research Task
        </button>
      </div>

      {/* Input Area */}
      <div className="chat-input border-t border-gray-600 p-4">
        <div className="input-container flex gap-2 items-end">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything... I'll coordinate with my specialist agents to help you"
            disabled={isProcessing}
            className="message-input flex-1 p-3 rounded-lg border border-gray-600 bg-gray-800/80 text-white text-sm resize-none min-h-[44px] max-h-[120px] placeholder-gray-400"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || !inputValue.trim()}
            className="send-button bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg min-w-[44px] h-[44px] flex items-center justify-center transition-colors"
          >
            {isProcessing ? (
              <div className="loading-spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
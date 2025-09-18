
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot } from 'lucide-react';
import { ChatReasoningOutput } from '@/components/AgentWorkspace/ChatReasoningOutput';

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
}

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  reasoning?: any;
}

export const AgentChatDialog = ({ agent }: { agent: Agent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showReasoning, setShowReasoning] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    // Mock agent response based on agent type
    let agentResponse: ChatMessage;
    
    if (agent.id === 'investment-advisor') {
      agentResponse = {
        role: 'agent',
        content: 'Based on your risk profile and current market conditions, I recommend increasing your allocation to technology stocks by 5% and reducing bonds by 3%. This adjustment aligns with your growth objectives while maintaining appropriate risk levels.',
        timestamp: new Date().toLocaleTimeString(),
        reasoning: {
          objective: 'Optimize portfolio allocation based on client risk profile and market analysis',
          thought: 'The current market presents opportunities in the technology sector while bond yields remain relatively low.',
          reasoning: [
            { step: 'Analyze current portfolio allocation against target', confidence: 0.95 },
            { step: 'Assess market conditions and sector performance', confidence: 0.88 },
            { step: 'Evaluate risk tolerance and investment timeline', confidence: 0.92 },
            { step: 'Generate personalized recommendation', confidence: 0.89 }
          ],
          constraints: [
            'Must maintain diversification requirements',
            'Cannot exceed 70% equity allocation',
            'Must consider tax implications'
          ],
          confidence: 0.91
        }
      };
    } else if (agent.id === 'portfolio-rebalancer') {
      agentResponse = {
        role: 'agent',
        content: 'Your portfolio has drifted 2.3% from target allocation. I can automatically rebalance by selling $1,200 in large-cap growth and purchasing $1,200 in international bonds. This will restore your 60/40 equity/bond ratio.',
        timestamp: new Date().toLocaleTimeString(),
        reasoning: {
          objective: 'Maintain target portfolio allocation through automated rebalancing',
          thought: 'Portfolio drift has exceeded the 2% threshold, triggering rebalancing recommendation.',
          reasoning: [
            { step: 'Monitor real-time portfolio allocation', confidence: 0.98 },
            { step: 'Compare against target allocation parameters', confidence: 0.96 },
            { step: 'Calculate optimal rebalancing trades', confidence: 0.94 },
            { step: 'Assess transaction costs and tax impact', confidence: 0.87 }
          ],
          confidence: 0.94
        }
      };
    } else {
      agentResponse = {
        role: 'agent',
        content: "I've identified 3 optimization opportunities: You could save $180/month by refinancing your mortgage at current rates, optimize your credit card usage to improve your credit score, and consider a high-yield savings account for your emergency fund.",
        timestamp: new Date().toLocaleTimeString(),
        reasoning: {
          objective: 'Identify and present financial optimization opportunities',
          thought: 'Comprehensive analysis of financial health reveals several actionable improvements.',
          reasoning: [
            { step: 'Analyze current debt structure and rates', confidence: 0.93 },
            { step: 'Review spending patterns and credit utilization', confidence: 0.91 },
            { step: 'Evaluate savings account performance', confidence: 0.89 },
            { step: 'Calculate potential savings and benefits', confidence: 0.95 }
          ],
          confidence: 0.92
        }
      };
    }

    setMessages([...messages, userMessage, agentResponse]);
    setInput('');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-beam-dark-accent border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-true-red" />
            Chat with {agent.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Model: {agent.model}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReasoning(!showReasoning)}
              className="text-xs"
            >
              {showReasoning ? 'Hide' : 'Show'} Reasoning
            </Button>
          </div>
          
          <div className="h-96 overflow-y-auto border border-gray-700 rounded-lg p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p>Start a conversation with your AI agent</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-true-red/20 border border-true-red/30' 
                      : 'bg-beam-dark-accent/50 border border-gray-700/50'
                  }`}>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      {message.role === 'agent' && <Bot className="h-3 w-3" />}
                      {message.role === 'user' ? 'You' : agent.name}
                      <span>• {message.timestamp}</span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {message.reasoning && showReasoning && (
                      <ChatReasoningOutput reasoning={message.reasoning} isVisible={true} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your agent a question..."
              className="bg-beam-dark-accent/50 border-gray-700 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} className="bg-true-red hover:bg-true-red/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

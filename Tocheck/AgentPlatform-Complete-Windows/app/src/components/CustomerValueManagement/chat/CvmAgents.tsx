
import React from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentCard } from '@/components/AgentCard';
import { Button } from '@/components/ui/button';
import { useCvmChatContext } from '../context/CvmChatContext';

export const CvmAgents = () => {
  const { addChatMessage } = useCvmChatContext();
  
  const handleAgentClick = (name: string, query: string) => {
    // Add a user message with the query
    addChatMessage({ role: 'user', content: query });
    
    // Simulate the agent response (in a real implementation, this would call an API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        'Segment Analyzer': 'I\'ve analyzed your customer segments. The High Value segment shows 15% higher engagement this month compared to last quarter.',
        'Campaign Optimizer': 'Based on your recent campaigns, I recommend focusing on the Premium Retention Offer which has shown the highest ROI at 5.1x.',
        'CLV Predictor': 'The predicted lifetime value for your Medium Value segment is increasing by 8% following your recent targeted campaigns.'
      };
      
      addChatMessage({ 
        role: 'assistant', 
        content: responses[name] || 'I can help you analyze and optimize your customer value management strategy.'
      });
    }, 1500);
  };
  
  return (
    <Card className="bg-beam-dark-accent/50 border-gray-700/30 mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md text-white flex items-center">
            <Bot size={16} className="text-purple-400 mr-2" />
            CVM Agents
          </CardTitle>
          <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-700/30">
            3 available
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/30 hover:border-purple-500/50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-white">Segment Analyzer</h3>
                <p className="text-xs text-gray-400 mt-1">Analyzes customer segments and provides insights</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 p-1 h-auto"
                onClick={() => handleAgentClick('Segment Analyzer', 'Analyze my customer segments')}
              >
                <MessageSquare size={14} />
              </Button>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/30 hover:border-purple-500/50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-white">Campaign Optimizer</h3>
                <p className="text-xs text-gray-400 mt-1">Suggests campaign optimizations based on performance</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 p-1 h-auto"
                onClick={() => handleAgentClick('Campaign Optimizer', 'Which campaign should I focus on?')}
              >
                <MessageSquare size={14} />
              </Button>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-beam-dark-accent/30 border border-gray-700/30 hover:border-purple-500/50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-white">CLV Predictor</h3>
                <p className="text-xs text-gray-400 mt-1">Predicts customer lifetime value for different segments</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 p-1 h-auto"
                onClick={() => handleAgentClick('CLV Predictor', 'Predict the lifetime value for my customer segments')}
              >
                <MessageSquare size={14} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

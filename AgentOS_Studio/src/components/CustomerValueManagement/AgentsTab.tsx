
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare, TrendingUp, BarChart2, Database, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCvmChatContext } from './context/CvmChatContext';

interface AgentCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  queryPrompt: string;
  onAgentClick: (name: string, query: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, description, icon, queryPrompt, onAgentClick }) => {
  return (
    <Card className="bg-beam-dark-accent/30 border-gray-700/30 hover:border-purple-500/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-md text-white">{name}</CardTitle>
              <Badge variant="outline" className="mt-1 bg-purple-900/20 text-purple-300 border-purple-700/30">
                CVM Agent
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 p-1 h-auto"
            onClick={() => onAgentClick(name, queryPrompt)}
          >
            <MessageSquare size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-300">{description}</p>
      </CardContent>
    </Card>
  );
};

export const AgentsTab = () => {
  const { addChatMessage } = useCvmChatContext();

  const handleAgentClick = (name: string, query: string) => {
    // Add a user message with the query
    addChatMessage({ role: 'user', content: query });
    
    // Simulate the agent response (in a real implementation, this would call an API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        'Segment Analyzer': 'I\'ve analyzed your customer segments. The High Value segment shows 15% higher engagement this month compared to last quarter. Would you like me to provide more detailed metrics on any specific segment?',
        'Campaign Optimizer': 'Based on your recent campaigns, I recommend focusing on the Premium Retention Offer which has shown the highest ROI at 5.1x. I can help you optimize audience targeting for this campaign.',
        'CLV Predictor': 'The predicted lifetime value for your Medium Value segment is increasing by 8% following your recent targeted campaigns. The top-spending customers are showing a 12% higher retention rate.',
        'Churn Prevention Specialist': 'I\'ve identified 123 customers at high risk of churn in the next 30 days. Would you like me to suggest personalized retention offers for these customers?',
        'Customer Journey Mapper': 'I\'ve analyzed the customer journey touchpoints and found that customers who engage with the mobile app have a 32% higher purchase frequency. The website-to-app transition is a critical conversion point.',
        'Marketing Mix Modeler': 'Based on your current marketing mix, social media contributes to 28% of conversions while email drives 35%. I recommend increasing your social media budget allocation by 10%.'
      };
      
      addChatMessage({ 
        role: 'assistant', 
        content: responses[name] || 'I can help you analyze and optimize your customer value management strategy.'
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AgentCard 
          name="Segment Analyzer" 
          description="Analyzes customer segments and identifies key characteristics, behaviors, and value metrics for each group."
          icon={<Users size={24} className="text-blue-400" />}
          queryPrompt="Analyze my customer segments and provide insights"
          onAgentClick={handleAgentClick}
        />
        
        <AgentCard 
          name="Campaign Optimizer" 
          description="Suggests campaign optimizations based on historical performance data and audience response patterns."
          icon={<BarChart2 size={24} className="text-green-400" />}
          queryPrompt="Which campaign should I focus on based on ROI?"
          onAgentClick={handleAgentClick}
        />
        
        <AgentCard 
          name="CLV Predictor" 
          description="Predicts customer lifetime value for different segments and recommends strategies to increase revenue."
          icon={<TrendingUp size={24} className="text-purple-400" />}
          queryPrompt="Predict the lifetime value for my customer segments"
          onAgentClick={handleAgentClick}
        />
        
        <AgentCard 
          name="Churn Prevention Specialist" 
          description="Identifies customers at risk of churn and suggests targeted retention strategies."
          icon={<Bot size={24} className="text-red-400" />}
          queryPrompt="Show me customers at risk of churning"
          onAgentClick={handleAgentClick}
        />
        
        <AgentCard 
          name="Customer Journey Mapper" 
          description="Maps and analyzes customer journeys across channels to identify optimization opportunities."
          icon={<MessageSquare size={24} className="text-yellow-400" />}
          queryPrompt="Analyze our customer journey touchpoints"
          onAgentClick={handleAgentClick}
        />
        
        <AgentCard 
          name="Marketing Mix Modeler" 
          description="Analyzes the effectiveness of marketing channels and recommends optimal budget allocation."
          icon={<Database size={24} className="text-orange-400" />}
          queryPrompt="What's our optimal marketing mix?"
          onAgentClick={handleAgentClick}
        />
      </div>
    </div>
  );
};

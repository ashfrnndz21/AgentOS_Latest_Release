
import { useState } from 'react';
import { useCvmContext } from '../context/CvmContext';
import { useCvmChatContext } from '../context/CvmChatContext';
import { useToast } from '@/components/ui/use-toast';

export const useCvmChat = () => {
  const { 
    setSelectedSegment,
    setSelectedCampaign
  } = useCvmContext();
  
  const {
    chatMessages, 
    addChatMessage
  } = useCvmChatContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Process user query
  const processQuery = async (query: string) => {
    setIsLoading(true);
    
    // Add user message
    addChatMessage({ role: 'user', content: query });
    
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Extract intent and action from query
      const lowerQuery = query.toLowerCase();
      
      let response = "I'm not sure how to help with that query. Try asking about customer segments, campaigns, or analytics.";
      
      // Basic intent detection
      if (lowerQuery.includes('high value') || lowerQuery.includes('premium')) {
        setSelectedSegment('High Value');
        response = "I've selected the High Value customer segment for you. You can see the analysis in the dashboard.";
      } 
      else if (lowerQuery.includes('medium value')) {
        setSelectedSegment('Medium Value');
        response = "I've selected the Medium Value customer segment for you. The dashboard has been updated with relevant data.";
      }
      else if (lowerQuery.includes('low value')) {
        setSelectedSegment('Low Value');
        response = "I've selected the Low Value customer segment for you. The dashboard now displays data specific to this segment.";
      }
      else if (lowerQuery.includes('campaign') && lowerQuery.includes('summer')) {
        // Find and select the Summer Data Booster campaign
        response = "I've selected the Summer Data Booster campaign. You can now see its performance metrics in the dashboard.";
      }
      else if (lowerQuery.includes('retention') && lowerQuery.includes('campaign')) {
        // Find and select retention campaigns
        response = "I've updated the dashboard to show retention campaign data. You can see the performance metrics for our retention efforts.";
      }
      else if (lowerQuery.includes('compare') && lowerQuery.includes('campaign')) {
        response = "I've set up a campaign comparison view for you. You can now see how different campaigns perform against each other.";
      }
      else if (lowerQuery.includes('best performing')) {
        response = "Based on the current data, our Premium Retention Offer campaign has the highest ROI at 5.1x. I've selected it for you to view the details.";
      }
      else if (lowerQuery.includes('customer lifetime value') || lowerQuery.includes('clv')) {
        response = "The average customer lifetime value across segments is $523. High Value customers average $892, Medium Value $427, and Low Value $213. I've updated the dashboard to show CLV breakdowns.";
      }
      
      // Add assistant response
      addChatMessage({ role: 'assistant', content: response });
    } catch (error) {
      console.error('Error processing query:', error);
      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    chatMessages,
    isLoading,
    processQuery
  };
};

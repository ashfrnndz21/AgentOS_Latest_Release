
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCurrentTimestamp, generateAgentResponse } from '@/components/DecisionPath/utils/nodeUtils';
import { Message } from '../types';
import { generateResponseWithLangChain } from '../langchain/api';

// Create a cache to store conversations by project ID
const conversationCache: Record<string, Message[]> = {};

export function useConversation(
  projectId: string | null, 
  projectName: string | null, 
  hasAccess: boolean,
  useLangChain: boolean = false,
  apiKey: string = ''
) {
  const [prompt, setPrompt] = useState<string>('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMode, setThinkingMode] = useState<'thinking' | 'processing' | 'analyzing'>('thinking');
  const { toast } = useToast();

  // Load conversation from cache when project changes or on initial load
  useEffect(() => {
    if (projectId && hasAccess) {
      // If we have a cached conversation for this project, use it
      if (conversationCache[projectId]?.length) {
        setConversation(conversationCache[projectId]);
      } else if (conversation.length === 0) {
        // If no cached conversation and no current conversation, create welcome message
        const welcomeMessage: Message = {
          role: 'assistant',
          content: `Welcome to the ${projectName || 'project'} workspace. How can I help you today?`,
          timestamp: getCurrentTimestamp()
        };
        setConversation([welcomeMessage]);
        // Also update the cache
        conversationCache[projectId] = [welcomeMessage];
      }
    }
  }, [projectId, hasAccess, projectName, conversation.length]);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() || !projectId) return;
    
    // Create user message
    const userMessage: Message = { 
      role: 'user',
      content: prompt,
      timestamp: getCurrentTimestamp()
    };
    
    // Update local state with user message
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);
    
    // Also update the cache
    if (projectId) {
      conversationCache[projectId] = updatedConversation;
    }
    
    // Clear prompt input
    setPrompt('');
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Simulate thinking process
      setThinkingMode('thinking');
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setThinkingMode('processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setThinkingMode('analyzing');
      await new Promise(resolve => setTimeout(resolve, 1300));
      
      let assistantResponse: string;
      
      if (useLangChain && apiKey) {
        // Use LangChain for response generation if enabled and API key is provided
        const formattedMessages = conversation.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Add the user message
        formattedMessages.push({
          role: userMessage.role,
          content: userMessage.content
        });
        
        assistantResponse = await generateResponseWithLangChain(formattedMessages, apiKey);
      } else {
        // Use default response generation
        assistantResponse = generateAgentResponse(userMessage.content, projectId);
      }
      
      // Create assistant message
      const assistantMessage: Message = { 
        role: 'assistant',
        content: assistantResponse,
        timestamp: getCurrentTimestamp()
      };
      
      // Update conversation with assistant response
      const finalConversation = [...updatedConversation, assistantMessage];
      setConversation(finalConversation);
      
      // Update cache
      if (projectId) {
        conversationCache[projectId] = finalConversation;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
      console.error("Error processing request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    prompt,
    setPrompt,
    conversation,
    isLoading,
    thinkingMode,
    handlePromptSubmit
  };
}

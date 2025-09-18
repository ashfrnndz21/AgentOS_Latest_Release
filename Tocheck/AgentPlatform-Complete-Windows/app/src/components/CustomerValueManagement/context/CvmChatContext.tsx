
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CvmChatContextType {
  chatMode: boolean;
  setChatMode: (mode: boolean) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: {role: 'user' | 'assistant', content: string}) => void;
  clearChatMessages: () => void;
}

const CvmChatContext = createContext<CvmChatContextType | undefined>(undefined);

export const CvmChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with values from localStorage if available
  const [chatMode, setChatMode] = useState<boolean>(
    localStorage.getItem('cvm-chat-mode') === 'true'
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    JSON.parse(localStorage.getItem('cvm-chat-messages') || '[]')
  );

  // Update localStorage when chat mode changes
  useEffect(() => {
    localStorage.setItem('cvm-chat-mode', String(chatMode));
  }, [chatMode]);

  // Update localStorage when chat messages change
  useEffect(() => {
    localStorage.setItem('cvm-chat-messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Format timestamp for chat messages
  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Add a message to the chat
  const addChatMessage = (message: {role: 'user' | 'assistant', content: string}) => {
    setChatMessages(prev => [...prev, {...message, timestamp: formatTimestamp()}]);
  };

  // Clear all chat messages
  const clearChatMessages = () => {
    setChatMessages([]);
  };

  const value = {
    chatMode,
    setChatMode,
    chatMessages,
    addChatMessage,
    clearChatMessages,
  };

  return <CvmChatContext.Provider value={value}>{children}</CvmChatContext.Provider>;
};

export const useCvmChatContext = () => {
  const context = useContext(CvmChatContext);
  if (context === undefined) {
    throw new Error('useCvmChatContext must be used within a CvmChatProvider');
  }
  return context;
};

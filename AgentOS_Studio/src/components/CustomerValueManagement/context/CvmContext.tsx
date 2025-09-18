
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CampaignType } from '../campaign/types';
import { CvmChatProvider } from './CvmChatContext';

interface CvmContextType {
  selectedCampaign: CampaignType | null;
  setSelectedCampaign: (campaign: CampaignType | null) => void;
  selectedSegment: string | null;
  setSelectedSegment: (segment: string | null) => void;
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const CvmContext = createContext<CvmContextType | undefined>(undefined);

export const CvmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with values from localStorage if available
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(
    localStorage.getItem('cvm-selected-segment')
  );
  const [selectedModel, setSelectedModel] = useState<string | null>(
    localStorage.getItem('cvm-selected-model')
  );
  const [activeView, setActiveView] = useState<string>(
    localStorage.getItem('cvm-active-view') || 'table'
  );

  // Update localStorage when selections change
  useEffect(() => {
    if (selectedSegment) {
      localStorage.setItem('cvm-selected-segment', selectedSegment);
    }
  }, [selectedSegment]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('cvm-selected-model', selectedModel);
    }
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('cvm-active-view', activeView);
  }, [activeView]);

  const value = {
    selectedCampaign,
    setSelectedCampaign,
    selectedSegment,
    setSelectedSegment,
    selectedModel,
    setSelectedModel,
    activeView,
    setActiveView,
  };

  return (
    <CvmContext.Provider value={value}>
      <CvmChatProvider>{children}</CvmChatProvider>
    </CvmContext.Provider>
  );
};

export const useCvmContext = () => {
  const context = useContext(CvmContext);
  if (context === undefined) {
    throw new Error('useCvmContext must be used within a CvmProvider');
  }
  return context;
};

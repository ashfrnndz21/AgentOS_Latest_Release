import { useState, useCallback } from 'react';

export interface NavigationState {
  activeTab: string;
  selectedNetwork: string;
  selectedRegion: string;
  selectedDistrict: string;
  selectedAgent: string | null;
  selectedSiteId: string | null;
  selectedModel: string;
  selectedView: string;
  modalType: 'agent-detail' | 'site-detail' | 'simulation-results' | 'analysis-report' | null;
  modalData: any;
}

export const useNetworkTwinNavigation = () => {
  const [navState, setNavState] = useState<NavigationState>({
    activeTab: 'topology',
    selectedNetwork: 'kl',
    selectedRegion: 'all',
    selectedDistrict: 'all',
    selectedAgent: null,
    selectedSiteId: null,
    selectedModel: 'churn',
    selectedView: 'physical',
    modalType: null,
    modalData: null,
  });

  const updateNavState = useCallback((updates: Partial<NavigationState>) => {
    setNavState(prev => ({ ...prev, ...updates }));
  }, []);

  const navigateToAgent = useCallback((agentId: string) => {
    updateNavState({
      activeTab: 'agents',
      selectedAgent: agentId,
      modalType: 'agent-detail',
      modalData: { agentId }
    });
  }, [updateNavState]);

  const navigateToSite = useCallback((siteId: string, siteData: any) => {
    updateNavState({
      selectedSiteId: siteId,
      modalType: 'site-detail',
      modalData: siteData
    });
  }, [updateNavState]);

  const navigateToSimulation = useCallback((simulationData: any) => {
    updateNavState({
      activeTab: 'simulation',
      modalType: 'simulation-results',
      modalData: simulationData
    });
  }, [updateNavState]);

  const navigateToAnalysis = useCallback((analysisType: string, data: any) => {
    updateNavState({
      activeTab: 'analysis',
      modalType: 'analysis-report',
      modalData: { type: analysisType, data }
    });
  }, [updateNavState]);

  const closeModal = useCallback(() => {
    updateNavState({
      modalType: null,
      modalData: null
    });
  }, [updateNavState]);

  const setActiveTab = useCallback((tab: string) => {
    updateNavState({ activeTab: tab });
  }, [updateNavState]);

  const switchNetwork = useCallback((networkKey: string) => {
    updateNavState({ 
      selectedNetwork: networkKey,
      selectedSiteId: null,
      selectedAgent: null,
      modalType: null,
      modalData: null 
    });
  }, [updateNavState]);

  return {
    navState,
    updateNavState,
    navigateToAgent,
    navigateToSite,
    navigateToSimulation,
    navigateToAnalysis,
    closeModal,
    setActiveTab,
    switchNetwork,
  };
};
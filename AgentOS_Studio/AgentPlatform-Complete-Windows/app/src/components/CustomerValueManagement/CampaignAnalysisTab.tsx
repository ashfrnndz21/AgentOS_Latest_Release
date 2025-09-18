
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CampaignDialog } from './campaign/CampaignDialog';
import { CampaignCalendar } from './campaign/CampaignCalendar';
import { CampaignComparison } from './campaign/CampaignComparison';
import { CampaignTemplates } from './campaign/CampaignTemplates';
import { CampaignABTesting } from './campaign/CampaignABTesting';
import { CampaignNotifications } from './campaign/CampaignNotifications';
import { CampaignMainView } from './campaign/CampaignMainView';
import { CampaignHeader } from './campaign/CampaignHeader';
import { CampaignSectionTabs } from './campaign/CampaignSectionTabs';
import { useCampaignManagement } from './campaign/hooks/useCampaignManagement';
import { useCvmContext } from './context/CvmContext';

export const CampaignAnalysisTab = () => {
  const {
    selectedCampaign,
    setSelectedCampaign,
    campaignView,
    setCampaignView,
    campaignDialogOpen,
    setCampaignDialogOpen,
    editingCampaign,
    campaigns,
    comparisonCampaigns,
    setComparisonCampaigns,
    handleCreateCampaign,
    handleEditCampaign,
    handleSaveCampaign,
    handleStatusChange,
    handleRunSimulation,
    handleUseTemplate
  } = useCampaignManagement();

  const [activeSection, setActiveSection] = useState<'main' | 'calendar' | 'comparison' | 'templates' | 'ab-testing' | 'notifications'>('main');

  // Handle section toggling
  const handleCalendarClick = () => setActiveSection(activeSection === 'calendar' ? 'main' : 'calendar');
  const handleComparisonClick = () => setActiveSection(activeSection === 'comparison' ? 'main' : 'comparison');
  const handleTemplatesClick = () => setActiveSection('templates');
  const handleNotificationsClick = () => setActiveSection('notifications');
  const handleAbTestingClick = () => setActiveSection('ab-testing');

  return (
    <div className="space-y-6">
      {/* Campaign Overview Card */}
      <Card className="shadow-lg border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CampaignHeader 
            activeSection={activeSection}
            onCreateCampaign={handleCreateCampaign}
            onRunSimulation={handleRunSimulation}
            onCalendarClick={handleCalendarClick}
            onComparisonClick={handleComparisonClick}
          />
          
          {/* View selector tabs for mobile */}
          <CampaignSectionTabs 
            activeSection={activeSection}
            onChange={(value) => setActiveSection(value as any)}
          />
        </CardHeader>
        
        <CardContent>
          {activeSection === 'main' && (
            <CampaignMainView 
              campaigns={campaigns}
              onSelectCampaign={setSelectedCampaign}
              campaignView={campaignView}
              setCampaignView={setCampaignView}
              handleEditCampaign={handleEditCampaign}
              handleStatusChange={handleStatusChange}
              onTemplatesClick={handleTemplatesClick}
              onNotificationsClick={handleNotificationsClick}
              onAbTestingClick={handleAbTestingClick}
            />
          )}
          
          {activeSection === 'calendar' && (
            <CampaignCalendar 
              campaigns={campaigns}
              onSelectCampaign={(campaign) => {
                setSelectedCampaign(campaign);
                setActiveSection('main');
              }}
            />
          )}
          
          {activeSection === 'comparison' && (
            <CampaignComparison 
              campaigns={campaigns}
              selectedCampaigns={comparisonCampaigns}
              onSelectCampaigns={setComparisonCampaigns}
            />
          )}
          
          {activeSection === 'templates' && (
            <CampaignTemplates 
              onSelectTemplate={handleUseTemplate}
            />
          )}
          
          {activeSection === 'ab-testing' && (
            <CampaignABTesting
              selectedCampaign={selectedCampaign}
            />
          )}
          
          {activeSection === 'notifications' && (
            <CampaignNotifications 
              campaigns={campaigns}
              onSelectCampaign={(campaign) => {
                setSelectedCampaign(campaign);
                setActiveSection('main');
              }}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Campaign Creation/Editing Dialog */}
      <CampaignDialog 
        open={campaignDialogOpen}
        setOpen={setCampaignDialogOpen}
        editCampaign={editingCampaign}
        onSave={handleSaveCampaign}
      />
    </div>
  );
};

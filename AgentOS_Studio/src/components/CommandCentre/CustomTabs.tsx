import React from 'react';
import { BarChart2, History, Wrench, Database, Shield, CircleDollarSign, Activity } from 'lucide-react';

interface CustomTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProject: string;
  currentIndustry: any;
  projectData: any;
}

export const CustomTabs: React.FC<CustomTabsProps> = ({
  activeTab,
  setActiveTab,
  selectedProject,
  currentIndustry,
  projectData
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'traceability', label: 'Traceability', icon: History },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'governance', label: 'Governance', icon: Shield },
    { id: 'cost', label: 'Cost', icon: CircleDollarSign },
    { id: 'monitoring', label: 'Monitor', icon: Activity },
  ];

  const handleTabClick = (tabId: string) => {
    console.log('🖱️ Custom tab clicked:', tabId);
    setActiveTab(tabId);
  };

  return (
    <div className="w-full">
      {/* Custom Tab List */}
      <div className="grid grid-cols-7 mb-6 bg-gray-800 border border-gray-600 rounded-lg p-1 gap-1 w-full">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                rounded-md flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              <IconComponent size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Tab Content */}
      <div className="w-full">
        {activeTab === 'dashboard' && (
          <div className="p-6 bg-gray-800 border border-gray-600 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Dashboard</h2>
            <p className="text-gray-300">Dashboard content - showing projects</p>
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-blue-900/20 border border-blue-500 rounded">
                <h3 className="text-white font-medium">Hydrogen Production</h3>
                <p className="text-gray-300 text-sm">5 agents active</p>
              </div>
              <div className="p-3 bg-purple-900/20 border border-purple-500 rounded">
                <h3 className="text-white font-medium">Financial Forecasting</h3>
                <p className="text-gray-300 text-sm">6 agents active</p>
              </div>
              <div className="p-3 bg-green-900/20 border border-green-500 rounded">
                <h3 className="text-white font-medium">Process Engineering</h3>
                <p className="text-gray-300 text-sm">5 agents active</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'traceability' && (
          <div className="p-6 bg-gray-800 border border-gray-600 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Agent Traceability</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-white">✅ Traceability tab is working!</p>
              <p className="text-gray-300 mt-2">Selected project: {selectedProject}</p>
              <p className="text-gray-300">Industry: {currentIndustry.id}</p>
              <p className="text-gray-300">Project data available: {projectData[selectedProject] ? 'Yes' : 'No'}</p>
              {projectData[selectedProject] && (
                <>
                  <p className="text-gray-300">Decision nodes: {projectData[selectedProject]?.decisionNodes?.length || 0}</p>
                  <p className="text-gray-300">Agents: {projectData[selectedProject]?.agents?.length || 0}</p>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="p-6 bg-gray-800 border border-gray-600 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Tools & Integrations</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-white">✅ Tools tab is working!</p>
              <p className="text-gray-300 mt-2">Industry: {currentIndustry.id}</p>
              <p className="text-gray-300">Available tools for industrial gas operations</p>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="p-6 bg-gray-800 border border-gray-600 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Data Access & Management</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-white">✅ Data tab is working!</p>
              <p className="text-gray-300 mt-2">Industry: {currentIndustry.id}</p>
              <p className="text-gray-300">Data sources and access controls</p>
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="p-6 bg-gray-800 border border-gray-600 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Governance & Compliance</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-white">✅ Governance tab is working!</p>
              <p className="text-gray-300 mt-2">Industry: {currentIndustry.id}</p>
              <p className="text-gray-300">Compliance rules and governance policies</p>
            </div>
          </div>
        )}

        {activeTab === 'cost' && (
          <div className="p-6 bg-gray-800 border border-gray-600 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Cost Analytics</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-white">✅ Cost tab is working!</p>
              <p className="text-gray-300 mt-2">Selected project: {selectedProject}</p>
              <p className="text-gray-300">Cost analysis and budget tracking</p>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="p-6 bg-gray-800 border border-gray-600 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Real-time Monitoring</h2>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-white">✅ Monitoring tab is working!</p>
              <p className="text-gray-300 mt-2">System status and real-time metrics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
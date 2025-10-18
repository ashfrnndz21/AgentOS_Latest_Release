import React from 'react';
import { EnhancedOrchestrationInterface } from '@/components/A2A/EnhancedOrchestrationInterface';

const EnhancedOrchestrationPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced Orchestration System
        </h1>
        <p className="text-gray-600">
          Advanced multi-agent orchestration with intelligent query understanding, 
          dynamic agent selection, and coordinated execution.
        </p>
      </div>
      
      <EnhancedOrchestrationInterface />
    </div>
  );
};

export default EnhancedOrchestrationPage;




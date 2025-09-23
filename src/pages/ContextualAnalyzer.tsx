import React from 'react';
import { Layout } from '@/components/Layout';
import { ContextualQueryAnalyzer } from '@/components/ContextualQueryAnalyzer';

export default function ContextualAnalyzerPage() {
  return (
    <Layout>
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden bg-beam-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-beam-dark to-beam-dark text-beam-text">
        <div className="w-full p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Contextual Query Analyzer
              </h1>
              <p className="text-gray-300">
                Step-by-step LLM analysis that performs contextual reasoning, domain identification, 
                task classification, and execution sequence definition.
              </p>
            </div>
            
            <ContextualQueryAnalyzer />
          </div>
        </div>
      </div>
    </Layout>
  );
}


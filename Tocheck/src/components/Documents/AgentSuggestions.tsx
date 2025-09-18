import React from 'react';
import { Bot, Sparkles, ArrowRight, FileText, TrendingUp, Shield, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: string;
  name: string;
  type: string;
  summary?: string;
}

interface AgentSuggestion {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  confidence: number;
  relevantDocuments: string[];
  capabilities: string[];
  color: string;
}

interface AgentSuggestionsProps {
  documents: Document[];
}

export const AgentSuggestions: React.FC<AgentSuggestionsProps> = ({ documents }) => {
  // Generate suggestions based on document content (simplified)
  const generateSuggestions = (): AgentSuggestion[] => {
    const suggestions: AgentSuggestion[] = [];
    
    // Analyze document names and types to suggest relevant agents
    const hasFinancialDocs = documents.some(doc => 
      doc.name.toLowerCase().includes('financial') ||
      doc.name.toLowerCase().includes('budget') ||
      doc.name.toLowerCase().includes('report')
    );
    
    const hasComplianceDocs = documents.some(doc =>
      doc.name.toLowerCase().includes('compliance') ||
      doc.name.toLowerCase().includes('policy') ||
      doc.name.toLowerCase().includes('regulation')
    );
    
    const hasTechnicalDocs = documents.some(doc =>
      doc.name.toLowerCase().includes('technical') ||
      doc.name.toLowerCase().includes('manual') ||
      doc.name.toLowerCase().includes('guide')
    );

    if (hasFinancialDocs) {
      suggestions.push({
        id: 'financial-analyst',
        name: 'Financial Analysis Agent',
        description: 'Analyze financial documents, generate reports, and answer questions about financial data.',
        icon: <TrendingUp size={20} className="text-green-400" />,
        confidence: 85,
        relevantDocuments: documents.filter(doc => 
          doc.name.toLowerCase().includes('financial') ||
          doc.name.toLowerCase().includes('budget')
        ).map(doc => doc.name),
        capabilities: ['Financial Analysis', 'Report Generation', 'Data Insights', 'Trend Analysis'],
        color: 'green'
      });
    }

    if (hasComplianceDocs) {
      suggestions.push({
        id: 'compliance-advisor',
        name: 'Compliance Advisory Agent',
        description: 'Help with regulatory compliance, policy interpretation, and risk assessment.',
        icon: <Shield size={20} className="text-blue-400" />,
        confidence: 92,
        relevantDocuments: documents.filter(doc => 
          doc.name.toLowerCase().includes('compliance') ||
          doc.name.toLowerCase().includes('policy')
        ).map(doc => doc.name),
        capabilities: ['Policy Interpretation', 'Risk Assessment', 'Compliance Checking', 'Regulatory Guidance'],
        color: 'blue'
      });
    }

    if (hasTechnicalDocs) {
      suggestions.push({
        id: 'technical-assistant',
        name: 'Technical Documentation Agent',
        description: 'Provide technical support, explain procedures, and help with troubleshooting.',
        icon: <FileText size={20} className="text-purple-400" />,
        confidence: 78,
        relevantDocuments: documents.filter(doc => 
          doc.name.toLowerCase().includes('technical') ||
          doc.name.toLowerCase().includes('manual')
        ).map(doc => doc.name),
        capabilities: ['Technical Support', 'Procedure Explanation', 'Troubleshooting', 'Documentation Search'],
        color: 'purple'
      });
    }

    // Always suggest a general document assistant
    suggestions.push({
      id: 'document-assistant',
      name: 'General Document Assistant',
      description: 'A versatile agent that can help with any questions about your uploaded documents.',
      icon: <Bot size={20} className="text-gray-400" />,
      confidence: 95,
      relevantDocuments: documents.map(doc => doc.name),
      capabilities: ['Document Search', 'Q&A', 'Summarization', 'Information Extraction'],
      color: 'gray'
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  };

  const suggestions = generateSuggestions();

  const handleCreateAgent = (suggestion: AgentSuggestion) => {
    // This would integrate with the agent creation flow
    console.log('Creating agent:', suggestion);
    // Could open agent creation dialog with pre-filled data
  };

  return (
    <div className="space-y-3">
      {suggestions.map(suggestion => (
        <Card key={suggestion.id} className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {suggestion.icon}
                <div>
                  <CardTitle className="text-sm text-white">{suggestion.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Sparkles size={10} className="mr-1" />
                      {suggestion.confidence}% match
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <CardDescription className="text-xs text-gray-400 mb-3">
              {suggestion.description}
            </CardDescription>
            
            {/* Capabilities */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Capabilities:</p>
              <div className="flex flex-wrap gap-1">
                {suggestion.capabilities.slice(0, 2).map(capability => (
                  <Badge key={capability} variant="secondary" className="text-xs">
                    {capability}
                  </Badge>
                ))}
                {suggestion.capabilities.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{suggestion.capabilities.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Relevant Documents */}
            {suggestion.relevantDocuments.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">
                  Relevant docs ({suggestion.relevantDocuments.length}):
                </p>
                <div className="text-xs text-gray-400">
                  {suggestion.relevantDocuments.slice(0, 2).map(doc => (
                    <div key={doc} className="truncate">
                      • {doc}
                    </div>
                  ))}
                  {suggestion.relevantDocuments.length > 2 && (
                    <div className="text-gray-500">
                      +{suggestion.relevantDocuments.length - 2} more documents
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Button
              size="sm"
              onClick={() => handleCreateAgent(suggestion)}
              className="w-full text-xs"
            >
              Create Agent
              <ArrowRight size={12} className="ml-1" />
            </Button>
          </CardContent>
        </Card>
      ))}
      
      {suggestions.length === 0 && (
        <div className="text-center py-6">
          <Sparkles size={32} className="mx-auto text-gray-600 mb-2" />
          <p className="text-sm text-gray-400">
            Upload more documents to get agent suggestions
          </p>
        </div>
      )}
    </div>
  );
};
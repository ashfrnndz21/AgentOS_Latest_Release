import React, { useState, useEffect } from 'react';
import { Database, Upload, Settings, Brain, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUploader } from '@/components/RAG/DocumentUploader';
import { KnowledgeBaseSelector } from '@/components/RAG/KnowledgeBaseSelector';
import { RAGConfiguration } from '@/components/RAG/RAGConfiguration';
import { ragService, type KnowledgeBase, type RAGConfig, type Document } from '@/lib/services/RAGService';
import { useIndustryContext } from '@/contexts/IndustryContext';

interface KnowledgeBaseStepProps {
  ragEnabled: boolean;
  onRAGEnabledChange: (enabled: boolean) => void;
  selectedKnowledgeBases: string[];
  onKnowledgeBasesChange: (bases: string[]) => void;
  ragConfig: RAGConfig;
  onRAGConfigChange: (config: RAGConfig) => void;
  className?: string;
}

export const KnowledgeBaseStep: React.FC<KnowledgeBaseStepProps> = ({
  ragEnabled,
  onRAGEnabledChange,
  selectedKnowledgeBases,
  onKnowledgeBasesChange,
  ragConfig,
  onRAGConfigChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('existing');
  const [newKnowledgeBase, setNewKnowledgeBase] = useState<Partial<KnowledgeBase> | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const { currentIndustry } = useIndustryContext();

  // Initialize RAG config with industry defaults when enabled
  useEffect(() => {
    if (ragEnabled && !ragConfig.embeddingModel) {
      const industryConfig = ragService.getIndustryRAGConfig(currentIndustry);
      onRAGConfigChange(industryConfig);
    }
  }, [ragEnabled, currentIndustry, ragConfig.embeddingModel, onRAGConfigChange]);

  const handleCreateNewKnowledgeBase = () => {
    const templates = ragService.getIndustryTemplates(currentIndustry);
    const template = templates[0] || {
      name: `${currentIndustry} Knowledge Base`,
      description: `Knowledge base for ${currentIndustry} domain`,
      embeddingModel: 'nomic-embed-text',
      chunkSize: 512,
      chunkOverlap: 50,
    };

    setNewKnowledgeBase({
      ...template,
      industry: currentIndustry,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setActiveTab('new');
  };

  const handleDocumentUpload = async (files: File[]): Promise<Document[]> => {
    if (!newKnowledgeBase) return [];

    try {
      // Create knowledge base if it doesn't exist
      if (!newKnowledgeBase.id) {
        const created = await ragService.createKnowledgeBase(newKnowledgeBase);
        setNewKnowledgeBase(created);
      }

      // Upload documents
      const documents = await ragService.uploadDocuments(files, newKnowledgeBase.id!);
      setUploadedDocuments(prev => [...prev, ...documents]);
      
      // Add to selected knowledge bases
      if (newKnowledgeBase.id && !selectedKnowledgeBases.includes(newKnowledgeBase.id)) {
        onKnowledgeBasesChange([...selectedKnowledgeBases, newKnowledgeBase.id]);
      }

      return documents;
    } catch (error) {
      console.error('Failed to upload documents:', error);
      throw error;
    }
  };

  const getSelectedKnowledgeBasesInfo = () => {
    // This would typically fetch the actual knowledge base info
    // For now, return placeholder data
    return selectedKnowledgeBases.map(id => ({
      id,
      name: `Knowledge Base ${id.slice(-4)}`,
      documentCount: Math.floor(Math.random() * 50) + 1,
      size: Math.floor(Math.random() * 1000000000) + 100000000,
    }));
  };

  if (!ragEnabled) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* RAG Toggle */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={24} className="text-purple-400" />
              <div>
                <h3 className="text-lg font-medium text-white">Knowledge Base (RAG)</h3>
                <p className="text-gray-400">
                  Enable your agent to search and reference uploaded documents
                </p>
              </div>
            </div>
            <Switch
              checked={ragEnabled}
              onCheckedChange={onRAGEnabledChange}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>

          {/* Benefits */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg">
              <Brain size={20} className="text-blue-400 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-white">Intelligent Responses</h4>
                <p className="text-xs text-gray-400">
                  Answers based on your specific documents and data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg">
              <FileText size={20} className="text-green-400 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-white">Source Citations</h4>
                <p className="text-xs text-gray-400">
                  Responses include references to source documents
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg">
              <Settings size={20} className="text-purple-400 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-white">Local Processing</h4>
                <p className="text-xs text-gray-400">
                  All data stays on your system using Ollama models
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* RAG Toggle */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database size={20} className="text-purple-400" />
            <div>
              <Label className="text-white">Knowledge Base Enabled</Label>
              <p className="text-sm text-gray-400">
                Agent will use RAG for document-based responses
              </p>
            </div>
          </div>
          <Switch
            checked={ragEnabled}
            onCheckedChange={onRAGEnabledChange}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>
      </div>

      {/* Knowledge Base Configuration */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border border-gray-700">
          <TabsTrigger value="existing" className="data-[state=active]:bg-purple-600">
            <Database size={16} className="mr-2" />
            Existing
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-purple-600">
            <Plus size={16} className="mr-2" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-purple-600">
            <Settings size={16} className="mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <KnowledgeBaseSelector
            selectedBases={selectedKnowledgeBases}
            onSelectionChange={onKnowledgeBasesChange}
            industryFilter={currentIndustry}
            onCreateNew={handleCreateNewKnowledgeBase}
          />
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Plus size={20} className="text-purple-400" />
              <h3 className="text-lg font-medium text-white">Create New Knowledge Base</h3>
            </div>
            
            {newKnowledgeBase ? (
              <div className="space-y-4">
                <div className="p-3 bg-gray-900 rounded-lg">
                  <h4 className="font-medium text-white">{newKnowledgeBase.name}</h4>
                  <p className="text-sm text-gray-400">{newKnowledgeBase.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {newKnowledgeBase.industry}
                    </Badge>
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      {newKnowledgeBase.embeddingModel}
                    </Badge>
                  </div>
                </div>

                <DocumentUploader
                  onUpload={handleDocumentUpload}
                  knowledgeBaseId={newKnowledgeBase.id}
                />

                {uploadedDocuments.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400">
                      ✓ {uploadedDocuments.length} documents uploaded successfully
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database size={48} className="mx-auto text-gray-600 mb-4" />
                <h4 className="text-lg font-medium text-gray-400 mb-2">
                  Create Your Knowledge Base
                </h4>
                <p className="text-gray-500 mb-4">
                  Start by creating a new knowledge base for your documents
                </p>
                <Button
                  onClick={handleCreateNewKnowledgeBase}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus size={16} className="mr-2" />
                  Create Knowledge Base
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <RAGConfiguration
            config={ragConfig}
            onConfigChange={onRAGConfigChange}
            showAdvanced={true}
          />
        </TabsContent>
      </Tabs>

      {/* Selection Summary */}
      {selectedKnowledgeBases.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h4 className="text-sm font-medium text-white mb-3">Selected Knowledge Bases</h4>
          <div className="space-y-2">
            {getSelectedKnowledgeBasesInfo().map((kb) => (
              <div key={kb.id} className="flex items-center justify-between p-2 bg-gray-900 rounded">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-purple-400" />
                  <span className="text-sm text-white">{kb.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{kb.documentCount} docs</span>
                  <span>•</span>
                  <span>{(kb.size / 1024 / 1024).toFixed(1)}MB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
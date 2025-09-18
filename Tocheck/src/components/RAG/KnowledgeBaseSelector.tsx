import React, { useState, useEffect, useMemo } from 'react';
import { Database, Plus, Search, FileText, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ragService, type KnowledgeBase, RAGUtils } from '@/lib/services/RAGService';
import { useIndustryContext } from '@/contexts/IndustryContext';

interface KnowledgeBaseSelectorProps {
  selectedBases: string[];
  onSelectionChange: (bases: string[]) => void;
  multiSelect?: boolean;
  industryFilter?: string;
  showCreateNew?: boolean;
  onCreateNew?: () => void;
  className?: string;
}

export const KnowledgeBaseSelector: React.FC<KnowledgeBaseSelectorProps> = ({
  selectedBases,
  onSelectionChange,
  multiSelect = true,
  industryFilter,
  showCreateNew = true,
  onCreateNew,
  className = '',
}) => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentIndustry } = useIndustryContext();

  // Load knowledge bases
  useEffect(() => {
    const loadKnowledgeBases = async () => {
      setLoading(true);
      try {
        const bases = await ragService.listKnowledgeBases(industryFilter || currentIndustry);
        setKnowledgeBases(bases);
      } catch (error) {
        console.error('Failed to load knowledge bases:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeBases();
  }, [industryFilter, currentIndustry]);

  // Filter knowledge bases based on search
  const filteredBases = useMemo(() => {
    if (!searchQuery) return knowledgeBases;
    
    const query = searchQuery.toLowerCase();
    return knowledgeBases.filter(base =>
      base.name.toLowerCase().includes(query) ||
      base.description.toLowerCase().includes(query) ||
      base.industry?.toLowerCase().includes(query)
    );
  }, [knowledgeBases, searchQuery]);

  const handleSelection = (baseId: string) => {
    if (multiSelect) {
      const newSelection = selectedBases.includes(baseId)
        ? selectedBases.filter(id => id !== baseId)
        : [...selectedBases, baseId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([baseId]);
    }
  };

  const getIndustryColor = (industry?: string) => {
    switch (industry) {
      case 'banking': return 'bg-blue-500/20 text-blue-400';
      case 'wealth': return 'bg-green-500/20 text-green-400';
      case 'risk': return 'bg-red-500/20 text-red-400';
      case 'architecture': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-gray-400">Loading knowledge bases...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-purple-400" />
            <h3 className="text-lg font-medium text-white">Knowledge Bases</h3>
          </div>
          {showCreateNew && (
            <Button
              size="sm"
              onClick={onCreateNew}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus size={14} className="mr-2" />
              Create New
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search knowledge bases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-600 text-white"
          />
        </div>
      </div>

      {/* Knowledge Base List */}
      <div className="p-4">
        {filteredBases.length === 0 ? (
          <div className="text-center py-8">
            <Database size={48} className="mx-auto text-gray-600 mb-4" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">
              {searchQuery ? 'No matching knowledge bases' : 'No knowledge bases found'}
            </h4>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first knowledge base to get started'
              }
            </p>
            {showCreateNew && !searchQuery && (
              <Button
                onClick={onCreateNew}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus size={16} className="mr-2" />
                Create Knowledge Base
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBases.map((base) => {
              const isSelected = selectedBases.includes(base.id);
              const documentCount = base.documents.length;
              const totalSize = base.documents.reduce((sum, doc) => sum + doc.size, 0);

              return (
                <div
                  key={base.id}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-colors
                    ${isSelected 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-gray-600 hover:border-gray-500 bg-gray-900'
                    }
                  `}
                  onClick={() => handleSelection(base.id)}
                >
                  <div className="flex items-start gap-3">
                    {multiSelect && (
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelection(base.id)}
                        className="mt-1"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-white truncate">
                          {base.name}
                        </h4>
                        {base.industry && (
                          <Badge className={getIndustryColor(base.industry)}>
                            <Tag size={12} className="mr-1" />
                            {base.industry}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      {base.description && (
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {base.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FileText size={12} />
                          <span>{documentCount} documents</span>
                        </div>
                        {totalSize > 0 && (
                          <div className="flex items-center gap-1">
                            <Database size={12} />
                            <span>{RAGUtils.formatFileSize(totalSize)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Updated {formatDate(base.updatedAt)}</span>
                        </div>
                      </div>

                      {/* Model Info */}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          {base.embeddingModel}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {base.chunkSize} tokens/chunk
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedBases.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {selectedBases.length} knowledge base{selectedBases.length !== 1 ? 's' : ''} selected
            </span>
            {multiSelect && selectedBases.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectionChange([])}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear Selection
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
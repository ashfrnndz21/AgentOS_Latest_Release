import React from 'react';
import { FileText, Trash2, Download, Eye, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
  uploadedAt: Date;
  summary?: string;
  progress?: number;
}

interface DocumentLibraryProps {
  documents: Document[];
  selectedDocuments: string[];
  onDocumentSelect: (selected: string[]) => void;
  onDocumentDelete?: (documentId: string) => Promise<void>;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  selectedDocuments,
  onDocumentSelect,
  onDocumentDelete
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 size={16} className="animate-spin text-yellow-400" />;
      case 'ready':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
    }
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (!onDocumentDelete) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete "${documentName}"? This will remove the document and all its chunks from the RAG system.`);
    if (!confirmed) return;
    
    try {
      await onDocumentDelete(documentId);
    } catch (error) {
      alert(`Failed to delete document: ${error}`);
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'ready':
        return 'Ready';
      case 'error':
        return 'Error';
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    const isSelected = selectedDocuments.includes(documentId);
    if (isSelected) {
      onDocumentSelect(selectedDocuments.filter(id => id !== documentId));
    } else {
      onDocumentSelect([...selectedDocuments, documentId]);
    }
  };

  const selectAllDocuments = () => {
    const readyDocuments = documents.filter(doc => doc.status === 'ready');
    if (selectedDocuments.length === readyDocuments.length) {
      onDocumentSelect([]);
    } else {
      onDocumentSelect(readyDocuments.map(doc => doc.id));
    }
  };

  const readyDocuments = documents.filter(doc => doc.status === 'ready');
  const allSelected = selectedDocuments.length === readyDocuments.length && readyDocuments.length > 0;
  const someSelected = selectedDocuments.length > 0 && selectedDocuments.length < readyDocuments.length;

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">
          No documents uploaded
        </h3>
        <p className="text-gray-500">
          Upload some documents to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {readyDocuments.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onCheckedChange={selectAllDocuments}
            />
            <span className="text-sm text-white">
              {selectedDocuments.length > 0
                ? `${selectedDocuments.length} selected`
                : `Select all (${readyDocuments.length})`}
            </span>
          </div>
          
          {selectedDocuments.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download size={14} className="mr-1" />
                Export
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={async () => {
                  if (!onDocumentDelete || selectedDocuments.length === 0) return;
                  
                  const confirmed = window.confirm(`Are you sure you want to delete ${selectedDocuments.length} selected document(s)? This will remove them and all their chunks from the RAG system.`);
                  if (!confirmed) return;
                  
                  try {
                    for (const docId of selectedDocuments) {
                      await onDocumentDelete(docId);
                    }
                    onDocumentSelect([]); // Clear selection after deletion
                  } catch (error) {
                    alert(`Failed to delete documents: ${error}`);
                  }
                }}
                disabled={!onDocumentDelete || selectedDocuments.length === 0}
              >
                <Trash2 size={14} className="mr-1" />
                Delete ({selectedDocuments.length})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-1 gap-4">
        {documents.map(document => (
          <Card key={document.id} className="bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Selection Checkbox */}
                {document.status === 'ready' && (
                  <Checkbox
                    checked={selectedDocuments.includes(document.id)}
                    onCheckedChange={() => toggleDocumentSelection(document.id)}
                    className="mt-1"
                  />
                )}

                {/* File Icon */}
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-blue-400" />
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {document.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {document.type}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatFileSize(document.size)}
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(document.status)}
                          <span className="text-xs text-gray-400">
                            {getStatusText(document.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 ml-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Download size={14} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteDocument(document.id, document.name)}
                        disabled={!onDocumentDelete}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar for Processing Documents */}
                  {document.status === 'processing' && document.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-600 rounded-full h-1.5">
                        <div 
                          className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${document.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{document.progress}% complete</p>
                    </div>
                  )}

                  {/* Summary */}
                  {document.summary && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {document.summary}
                    </p>
                  )}

                  {/* Upload Time */}
                  <div className="flex items-center gap-1 mt-2">
                    <Clock size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-500">
                      Uploaded {document.uploadedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{documents.length}</div>
          <div className="text-xs text-gray-400">Total Documents</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-400">{readyDocuments.length}</div>
          <div className="text-xs text-gray-400">Ready for Chat</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-400">
            {formatFileSize(documents.reduce((total, doc) => total + doc.size, 0))}
          </div>
          <div className="text-xs text-gray-400">Total Size</div>
        </div>
      </div>
    </div>
  );
};
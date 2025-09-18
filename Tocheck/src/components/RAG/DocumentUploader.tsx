import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RAGUtils, type Document } from '@/lib/services/RAGService';

interface DocumentUploaderProps {
  onUpload: (files: File[]) => Promise<Document[]>;
  knowledgeBaseId?: string;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface FileUploadState {
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
  document?: Document;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  knowledgeBaseId,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ['.pdf', '.txt', '.doc', '.docx', '.md', '.html'],
  className = '',
}) => {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  }, []);

  const handleFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileUploadState[] = [];
    
    newFiles.forEach(file => {
      const validation = RAGUtils.validateFile(file);
      
      if (!validation.valid) {
        // Show error for invalid files
        validFiles.push({
          file,
          status: 'error',
          progress: 0,
          error: validation.error,
        });
      } else {
        validFiles.push({
          file,
          status: 'pending',
          progress: 0,
        });
      }
    });

    setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.status === 'pending' 
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      ));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.status === 'uploading' 
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 200);

      // Upload files
      const filesToUpload = pendingFiles.map(f => f.file);
      const uploadedDocuments = await onUpload(filesToUpload);

      clearInterval(progressInterval);

      // Update with results
      setFiles(prev => prev.map(f => {
        if (f.status === 'uploading') {
          const document = uploadedDocuments.find(d => d.name === f.file.name);
          return {
            ...f,
            status: document ? 'success' as const : 'error' as const,
            progress: 100,
            document,
            error: document ? undefined : 'Upload failed',
          };
        }
        return f;
      }));

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  }, [files, onUpload]);

  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(f => f.status !== 'success'));
  }, []);

  const getStatusIcon = (status: FileUploadState['status']) => {
    switch (status) {
      case 'pending':
        return <FileText size={16} className="text-gray-400" />;
      case 'uploading':
      case 'processing':
        return <Loader2 size={16} className="text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
    }
  };

  const getStatusColor = (status: FileUploadState['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      case 'uploading': return 'bg-blue-500/20 text-blue-400';
      case 'processing': return 'bg-purple-500/20 text-purple-400';
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/20 text-red-400';
    }
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging 
            ? 'border-purple-400 bg-purple-500/10' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={48} className={`mx-auto mb-4 ${isDragging ? 'text-purple-400' : 'text-gray-400'}`} />
        <h3 className="text-lg font-medium text-white mb-2">
          {isDragging ? 'Drop files here' : 'Upload Documents'}
        </h3>
        <p className="text-gray-400 mb-4">
          Drag and drop files here, or click to browse
        </p>
        <div className="text-sm text-gray-500">
          <p>Supported formats: {acceptedTypes.join(', ')}</p>
          <p>Maximum file size: {RAGUtils.formatFileSize(maxSize)}</p>
          <p>Maximum files: {maxFiles}</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-white">
              Files ({files.length})
            </h4>
            <div className="flex gap-2">
              {successCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCompleted}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Clear Completed
                </Button>
              )}
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  onClick={uploadFiles}
                  disabled={isUploading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    `Upload ${pendingCount} Files`
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {files.map((fileState, index) => (
              <div
                key={`${fileState.file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(fileState.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white truncate">
                      {RAGUtils.getFileTypeIcon(fileState.file.name)} {fileState.file.name}
                    </span>
                    <Badge className={getStatusColor(fileState.status)}>
                      {fileState.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{RAGUtils.formatFileSize(fileState.file.size)}</span>
                    {fileState.document && (
                      <span>• {fileState.document.chunks.length} chunks</span>
                    )}
                  </div>

                  {fileState.status === 'uploading' && (
                    <Progress value={fileState.progress} className="mt-2 h-1" />
                  )}

                  {fileState.error && (
                    <p className="text-xs text-red-400 mt-1">{fileState.error}</p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>

          {/* Summary */}
          {(successCount > 0 || errorCount > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex gap-4 text-sm">
                {successCount > 0 && (
                  <span className="text-green-400">
                    ✓ {successCount} uploaded successfully
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="text-red-400">
                    ✗ {errorCount} failed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
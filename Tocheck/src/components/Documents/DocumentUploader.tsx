import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DocumentUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md']
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelection(files);
  }, []);

  const handleFileSelection = useCallback((files: File[]) => {
    // Filter and validate files
    const validFiles = files.filter(file => {
      const isValidType = acceptedTypes.some(type => 
        file.name.toLowerCase().endsWith(type.toLowerCase())
      );
      const isValidSize = file.size <= maxSize;
      return isValidType && isValidSize;
    });

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
  }, [acceptedTypes, maxSize, maxFiles]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    console.log('🎯 DocumentUploader: Upload button clicked!');
    console.log('📁 Selected files:', selectedFiles);
    console.log('🔗 onUpload function:', typeof onUpload);
    alert(`Upload button clicked! Files: ${selectedFiles.map(f => f.name).join(', ')}`);
    
    setIsUploading(true);
    try {
      console.log('📤 Calling onUpload with files...');
      await onUpload(selectedFiles);
      console.log('✅ onUpload completed successfully');
      setSelectedFiles([]);
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, onUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-purple-400 bg-purple-400/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-gray-400 mb-4">
          Supports: {acceptedTypes.join(', ')} • Max size: {formatFileSize(maxSize)}
        </p>
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />
        <Button asChild variant="outline">
          <label htmlFor="file-input" className="cursor-pointer">
            Browse Files
          </label>
        </Button>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Selected Files:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-700 rounded"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-400" />
                  <div>
                    <p className="text-sm text-white truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setSelectedFiles([])}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Processing Info */}
      {isUploading && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 size={16} className="animate-spin text-blue-400" />
            <span className="text-sm text-blue-400">Processing with Ollama...</span>
          </div>
          <p className="text-xs text-gray-400">
            Documents are being processed for embeddings and will be ready for chat shortly.
          </p>
        </div>
      )}
    </div>
  );
};
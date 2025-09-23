import { apiClient } from '../apiClient';

export interface DocumentRAGResponse {
  success: boolean;
  response?: string;
  sources?: string[];
  chunks_retrieved?: number;
  chunks_available?: number;
  context_length?: number;
  error?: string;
  message?: string;
}

export interface ProcessingResult {
  success: boolean;
  document_id: string;
  filename: string;
  chunks_created: number;
  pages_processed: number;
  processing_time_ms: number;
  file_size: number;
  content_preview: string;
  error?: string;
}

export interface RAGStatus {
  status: string;
  message?: string;
  error?: string;
  stats?: {
    total_documents: number;
    total_chunks: number;
    processing_documents: number;
    error_documents: number;
    total_size_bytes: number;
  };
  ollama_status?: string;
  database_path?: string;
}

export interface DocumentInfo {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_time: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  chunks_created: number;
  pages_processed: number;
  processing_time_ms: number;
  error_message?: string;
  model_used?: string;
  content_preview?: string;
}

export class RealDocumentRAGService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete defaultOptions.headers;
    }

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, mergedOptions);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`RAG API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async processDocument(file: File, model: string = 'llama3.2'): Promise<ProcessingResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', model);

      const result = await this.request('/api/rag/ingest', {
        method: 'POST',
        body: formData
      });

      return result as ProcessingResult;
    } catch (error) {
      console.error('Failed to process document:', error);
      throw error;
    }
  }

  async queryDocuments(params: {
    query: string;
    document_ids?: string[];
    model_name?: string;
    max_chunks?: number;
  }): Promise<DocumentRAGResponse> {
    try {
      const response = await this.request('/api/rag/query', {
        method: 'POST',
        body: JSON.stringify({
          query: params.query,
          document_ids: params.document_ids,
          model_name: params.model_name || 'llama3.2',
          max_chunks: params.max_chunks || 5
        })
      });

      return response as DocumentRAGResponse;
    } catch (error) {
      console.error('Failed to query documents:', error);
      throw error;
    }
  }

  async getDocuments(): Promise<DocumentInfo[]> {
    try {
      const response = await this.request('/api/rag/documents');
      return response.documents || [];
    } catch (error) {
      console.error('Failed to get documents:', error);
      return [];
    }
  }

  async checkRAGStatus(): Promise<RAGStatus> {
    try {
      const response = await this.request('/api/rag/status');
      return response as RAGStatus;
    } catch (error) {
      console.error('Failed to get RAG status:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      await this.request(`/api/rag/documents/${documentId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }

  async clearAllDocuments(): Promise<{ success: boolean; cleared_count?: number }> {
    try {
      const documents = await this.getDocuments();
      const response = await this.request('/api/rag/clear', {
        method: 'POST'
      });
      return { 
        success: response.success, 
        cleared_count: documents.length 
      };
    } catch (error) {
      console.error('Failed to clear documents:', error);
      return { success: false };
    }
  }

  async verifyDocumentIngestion(documentId: string): Promise<{
    success: boolean;
    document?: DocumentInfo;
    error?: string;
  }> {
    try {
      const documents = await this.getDocuments();
      const document = documents.find(doc => doc.id === documentId);
      
      if (!document) {
        return {
          success: false,
          error: 'Document not found in RAG system'
        };
      }

      if (document.processing_status === 'error') {
        return {
          success: false,
          error: document.error_message || 'Document processing failed'
        };
      }

      if (document.processing_status !== 'completed') {
        return {
          success: false,
          error: `Document status: ${document.processing_status}`
        };
      }

      return {
        success: true,
        document
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getProcessingLogs(documentId?: string): Promise<Array<{
    timestamp: string;
    level: 'info' | 'success' | 'error';
    message: string;
    document_id?: string;
  }>> {
    // This would be implemented if the backend supports processing logs
    // For now, return empty array
    return [];
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['.pdf', '.txt', '.doc', '.docx', '.md'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }
}

// Legacy DocumentRAGService for backward compatibility
export class DocumentRAGService {
  async uploadDocument(file: File, model?: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (model) {
        formData.append('model', model);
      }
      
      const response = await apiClient.uploadDocument(formData);
      return response;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  async queryDocuments(params: {
    query: string;
    document_ids?: string[];
    model_name?: string;
    max_chunks?: number;
  }): Promise<DocumentRAGResponse> {
    try {
      const response = await apiClient.queryDocuments(params.query, params.model_name);
      return response;
    } catch (error) {
      console.error('Failed to query documents:', error);
      throw error;
    }
  }

  async getDocuments(): Promise<any[]> {
    try {
      const response = await apiClient.getDocuments();
      return response.documents || [];
    } catch (error) {
      console.error('Failed to get documents:', error);
      return [];
    }
  }

  async checkRAGStatus(): Promise<RAGStatus> {
    try {
      const response = await apiClient.getRagStatus();
      return response;
    } catch (error) {
      console.error('Failed to get RAG status:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      await apiClient.deleteDocument(documentId);
      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }

  async clearAllDocuments(): Promise<{ success: boolean; cleared_count?: number }> {
    try {
      const documents = await this.getDocuments();
      let cleared = 0;
      
      for (const doc of documents) {
        const success = await this.deleteDocument(doc.id);
        if (success) cleared++;
      }
      
      return { success: true, cleared_count: cleared };
    } catch (error) {
      console.error('Failed to clear documents:', error);
      return { success: false };
    }
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['.pdf', '.txt', '.doc', '.docx', '.md'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }
}

// Create service instances
export const realDocumentRAGService = new RealDocumentRAGService('http://localhost:5003');
export const documentRAGService = new DocumentRAGService();

// Export both for backward compatibility
export default realDocumentRAGService;
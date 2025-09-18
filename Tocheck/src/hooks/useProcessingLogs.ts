import { useState, useEffect, useCallback } from 'react';

export interface ProcessingLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  stage: 'upload' | 'loading' | 'chunking' | 'embedding' | 'indexing' | 'ready' | 'error';
  message: string;
  details?: any;
  document_id?: string;
  document_name?: string;
}

export const useProcessingLogs = () => {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5052/api/processing-logs');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      
    } catch (err) {
      console.error('Error fetching processing logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearLogs = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5052/api/processing-logs', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error clearing logs:', err);
    }
  }, []);

  // Poll for new logs every 2 seconds when there are active processing operations
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs();
    }, 2000);

    // Initial fetch
    fetchLogs();

    return () => clearInterval(interval);
  }, [fetchLogs]);

  // Also fetch logs when documents are being processed
  const refreshLogs = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    refreshLogs,
    clearLogs
  };
};
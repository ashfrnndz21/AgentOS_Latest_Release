import { useState, useEffect } from 'react';

export interface OllamaModel {
  name: string;
  size: string;
  digest: string;
  modified_at: string;
}

export const useOllamaModels = () => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:11434/api/tags', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Ollama service not available');
      }
      
      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      console.warn('Ollama not available:', err);
      setError('Ollama service not available');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we haven't tried yet
    if (models.length === 0 && !error) {
      fetchModels();
    }
  }, []);

  return { models, loading, error, refetch: fetchModels };
};
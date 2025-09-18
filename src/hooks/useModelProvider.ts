
import { useState, useEffect } from 'react';
import { useSupabaseApiKey } from '@/hooks/useSupabaseApiKey';
import { supabase } from '@/integrations/supabase/client';
import { models } from '@/utils/models/modelTypes';

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'azure' | 'cohere' | 'ollama';
// Get the ApiKeyService type from useSupabaseApiKey hook to ensure compatibility
type ApiKeyService = Parameters<typeof useSupabaseApiKey>[0];

export const useModelProvider = (provider: ModelProvider = 'openai') => {
  // Only pass valid API key services to useSupabaseApiKey
  const apiKeyProvider = ['openai', 'anthropic', 'google', 'azure', 'cohere'].includes(provider) 
    ? provider as ApiKeyService 
    : 'openai';
  
  const { apiKey, isValid } = useSupabaseApiKey(apiKeyProvider);
  const [selectedModel, setSelectedModel] = useState<string | null>(
    localStorage.getItem(`${provider}-model`) || getDefaultModel(provider)
  );
  
  // Fetch the selected model from localStorage or settings
  useEffect(() => {
    const fetchSelectedModel = async () => {
      try {
        // Try to get from backend_connections table
        const { data } = await supabase
          .from('backend_connections')
          .select('settings')
          .eq('service_type', 'llm')
          .eq('service_name', provider)
          .single();
        
        if (data?.settings) {
          // Properly handle the Json type by checking if it has a modelId property
          const settings = typeof data.settings === 'string' 
            ? JSON.parse(data.settings) 
            : data.settings;
          
          if (settings && typeof settings === 'object' && 'modelId' in settings) {
            setSelectedModel(settings.modelId as string);
          } else {
            // Fall back to localStorage
            const storedModel = localStorage.getItem(`${provider}-model`);
            if (storedModel) {
              setSelectedModel(storedModel);
            }
          }
        } else {
          // Fall back to localStorage
          const storedModel = localStorage.getItem(`${provider}-model`);
          if (storedModel) {
            setSelectedModel(storedModel);
          }
        }
      } catch (error) {
        console.warn(`Could not fetch selected ${provider} model:`, error);
      }
    };
    
    fetchSelectedModel();
  }, [provider]);
  
  // Save selected model
  const saveSelectedModel = async (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem(`${provider}-model`, modelId);
    
    try {
      // Get session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user?.id) {
        // Save to backend_connections table
        await supabase
          .from('backend_connections')
          .upsert({
            service_type: 'llm',
            service_name: provider,
            connection_status: isValid ? 'Connected' : 'Not Connected',
            is_enabled: true,
            settings: {
              provider,
              modelId,
              temperature: 0.7
            },
            user_id: sessionData.session.user.id
          });
      }
    } catch (error) {
      console.error('Error saving selected model:', error);
    }
  };
  
  // Validate the configuration
  const validateConfiguration = (): boolean => {
    // For OpenAI, Anthropic, Google, etc. we need an API key
    if (provider !== 'ollama' && !isValid) {
      return false;
    }
    
    // Check if we have a selected model
    if (!selectedModel) {
      return false;
    }
    
    return true;
  };
  
  return {
    selectedModel,
    setSelectedModel: saveSelectedModel,
    validateConfiguration,
    apiKey,
    isValid
  };
};

// Helper to get default model by provider
function getDefaultModel(provider: ModelProvider): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini';
    case 'anthropic':
      return 'claude-3-haiku-20240307';
    case 'google':
      return 'gemini-pro';
    case 'azure':
      return 'gpt-4';
    case 'cohere':
      return 'command';
    case 'ollama':
      return 'llama3.2:latest';
    default:
      return '';
  }
}

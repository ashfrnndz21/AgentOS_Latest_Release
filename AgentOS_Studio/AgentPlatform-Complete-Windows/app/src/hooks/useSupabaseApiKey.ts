
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ApiKeyService = 'openai' | 'anthropic' | 'google' | 'pinecone' | 'azure' | 'cohere' | 'langfuse' | 'langfuse_public' | 'langfuse_secret';

export interface ApiKeyHook {
  apiKey: string;
  setApiKey: (key: string) => Promise<void>;
  isValid: boolean;
  isLoading: boolean;
}

export const useSupabaseApiKey = (serviceName: ApiKeyService): ApiKeyHook => {
  const [apiKey, setApiKeyState] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);

        // Check if we're in an authenticated session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // No session, try using local storage for demo purposes
          const storedKey = localStorage.getItem(`${serviceName}-api-key`);
          if (storedKey) {
            setApiKeyState(storedKey);
            setIsValid(true);
          }
          setIsLoading(false);
          return;
        }

        // Query for API key
        const { data, error } = await supabase
          .from('api_keys')
          .select('key_value')
          .eq('service_name', serviceName)
          .single();

        if (error) {
          // Not finding the key is not an error we need to report
          if (error.code !== 'PGRST116') {
            console.error('Error fetching API key:', error);
          }
          
          // Check local storage as fallback
          const storedKey = localStorage.getItem(`${serviceName}-api-key`);
          if (storedKey) {
            setApiKeyState(storedKey);
            setIsValid(true);
          }
        } else if (data) {
          setApiKeyState(data.key_value);
          setIsValid(true);
        }
      } catch (err) {
        console.error('Unexpected error fetching API key:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, [serviceName]);

  const setApiKey = useCallback(async (newKey: string): Promise<void> => {
    try {
      setIsLoading(true);

      // First attempt to store in Supabase if authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const userId = session.user.id;
        
        // Check if a key already exists for this service
        const { data: existingKey } = await supabase
          .from('api_keys')
          .select('id')
          .eq('service_name', serviceName)
          .single();
          
        if (existingKey) {
          // Update existing key
          const { error } = await supabase
            .from('api_keys')
            .update({ key_value: newKey, updated_at: new Date().toISOString() })
            .eq('id', existingKey.id);
            
          if (error) throw error;
        } else {
          // Insert new key
          const { error } = await supabase
            .from('api_keys')
            .insert({
              service_name: serviceName,
              key_value: newKey,
              user_id: userId
            });
            
          if (error) throw error;
        }
      }
      
      // Always store in localStorage as fallback
      localStorage.setItem(`${serviceName}-api-key`, newKey);
      
      setApiKeyState(newKey);
      setIsValid(true);
      toast.success(`${serviceName} API key saved successfully`);
    } catch (err) {
      console.error('Error saving API key:', err);
      toast.error(`Failed to save ${serviceName} API key`);
    } finally {
      setIsLoading(false);
    }
  }, [serviceName]);

  return {
    apiKey,
    setApiKey,
    isValid,
    isLoading
  };
};

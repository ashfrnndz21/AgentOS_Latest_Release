
import { useSupabaseApiKey } from '@/hooks/useSupabaseApiKey';

export const useLangChainKey = () => {
  const { 
    apiKey, 
    setApiKey, 
    isValid 
  } = useSupabaseApiKey('openai');

  return {
    apiKey,
    setApiKey,
    isValid
  };
};

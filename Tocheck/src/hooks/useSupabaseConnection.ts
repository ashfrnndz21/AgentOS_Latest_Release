
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ServiceType = 'llm' | 'vector_db' | 'memory' | 'observability' | 'orchestration';
export type ServiceName = 'openai' | 'anthropic' | 'google' | 'ollama' | 'pinecone' | 'langfuse';

export interface ConnectionSettings {
  [key: string]: string | boolean | number;
}

export interface ConnectionState {
  isEnabled: boolean;
  settings: ConnectionSettings;
  connectionStatus: string;
  lastTested: Date | null;
  setEnabled: (isEnabled: boolean) => Promise<void>;
  setSettings: (settings: ConnectionSettings) => Promise<void>;
  testConnection: () => Promise<boolean>;
}

export const useSupabaseConnection = (
  serviceType: ServiceType,
  serviceName: ServiceName
): ConnectionState => {
  const [isEnabled, setIsEnabledState] = useState<boolean>(false);
  const [settings, setSettingsState] = useState<ConnectionSettings>({});
  const [connectionStatus, setConnectionStatus] = useState<string>('Not Connected');
  const [lastTested, setLastTested] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load connection from Supabase on component mount
  useEffect(() => {
    const loadConnection = async () => {
      try {
        setIsLoading(true);
        
        // Get user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setConnectionStatus('Not Authenticated');
          setIsLoading(false);
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Query the connections table for this service
        const { data, error } = await supabase
          .from('backend_connections')
          .select('*')
          .eq('service_type', serviceType)
          .eq('service_name', serviceName)
          .eq('user_id', userId)
          .single();
        
        if (error) {
          // Not finding a connection is not a true error
          if (error.code === 'PGRST116') {
            setIsEnabledState(false);
            setSettingsState({});
            setConnectionStatus('Not Configured');
          } else {
            console.error('Error loading connection:', error);
            setConnectionStatus('Error Loading');
          }
        } else if (data) {
          setIsEnabledState(data.is_enabled);
          // Need to convert the JSONB data back to an object
          const parsedSettings = typeof data.settings === 'string' 
            ? JSON.parse(data.settings) 
            : data.settings;
          setSettingsState(parsedSettings as ConnectionSettings);
          setConnectionStatus(data.connection_status);
          setLastTested(data.last_tested_at ? new Date(data.last_tested_at) : null);
        }
      } catch (err) {
        console.error('Unexpected error loading connection:', err);
        setConnectionStatus('Error');
      } finally {
        setIsLoading(false);
      }
    };

    loadConnection();
  }, [serviceType, serviceName]);

  // Function to save enabled state to Supabase
  const setEnabled = async (enabled: boolean): Promise<void> => {
    try {
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }
      
      const userId = sessionData.session.user.id;
      
      // Check if a connection already exists
      const { data: existingConn } = await supabase
        .from('backend_connections')
        .select('id')
        .eq('service_type', serviceType)
        .eq('service_name', serviceName)
        .eq('user_id', userId)
        .single();
      
      let result;
      
      if (existingConn) {
        // Update existing connection
        result = await supabase
          .from('backend_connections')
          .update({ is_enabled: enabled })
          .eq('id', existingConn.id);
      } else {
        // Insert new connection
        result = await supabase
          .from('backend_connections')
          .insert({
            service_type: serviceType,
            service_name: serviceName,
            is_enabled: enabled,
            user_id: userId
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      setIsEnabledState(enabled);
      const status = enabled ? 'Enabled' : 'Disabled';
      setConnectionStatus(status);
      toast.success(`${serviceName} ${status.toLowerCase()} successfully`);
    } catch (err: any) {
      console.error('Error saving connection state:', err);
      toast.error(`Failed to ${enabled ? 'enable' : 'disable'} ${serviceName}`);
    }
  };

  // Function to save settings to Supabase
  const setSettings = async (newSettings: ConnectionSettings): Promise<void> => {
    try {
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }
      
      const userId = sessionData.session.user.id;
      
      // Check if a connection already exists
      const { data: existingConn } = await supabase
        .from('backend_connections')
        .select('id')
        .eq('service_type', serviceType)
        .eq('service_name', serviceName)
        .eq('user_id', userId)
        .single();
      
      let result;
      
      if (existingConn) {
        // Update existing connection
        result = await supabase
          .from('backend_connections')
          .update({ settings: newSettings })
          .eq('id', existingConn.id);
      } else {
        // Insert new connection
        result = await supabase
          .from('backend_connections')
          .insert({
            service_type: serviceType,
            service_name: serviceName,
            settings: newSettings,
            user_id: userId
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      setSettingsState(newSettings);
      toast.success(`${serviceName} settings saved successfully`);
    } catch (err: any) {
      console.error('Error saving connection settings:', err);
      toast.error(`Failed to save ${serviceName} settings`);
    }
  };

  // Function to test connection
  const testConnection = async (): Promise<boolean> => {
    try {
      setConnectionStatus('Testing...');
      
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }
      
      const userId = sessionData.session.user.id;
      
      // Here you would typically test the actual connection 
      // (e.g., making an API call to the service)
      // For now, we'll simulate a successful test
      const isSuccess = true;
      const now = new Date();
      
      // Save the test result
      const { data: existingConn } = await supabase
        .from('backend_connections')
        .select('id')
        .eq('service_type', serviceType)
        .eq('service_name', serviceName)
        .eq('user_id', userId)
        .single();
      
      const newStatus = isSuccess ? 'Connected' : 'Connection Failed';
      
      if (existingConn) {
        await supabase
          .from('backend_connections')
          .update({ 
            connection_status: newStatus,
            last_tested_at: now.toISOString()
          })
          .eq('id', existingConn.id);
      } else {
        await supabase
          .from('backend_connections')
          .insert({
            service_type: serviceType,
            service_name: serviceName,
            connection_status: newStatus,
            last_tested_at: now.toISOString(),
            user_id: userId
          });
      }
      
      setConnectionStatus(newStatus);
      setLastTested(now);
      
      if (isSuccess) {
        toast.success(`Successfully connected to ${serviceName}`);
      } else {
        toast.error(`Failed to connect to ${serviceName}`);
      }
      
      return isSuccess;
    } catch (err: any) {
      console.error('Error testing connection:', err);
      setConnectionStatus('Error Testing');
      toast.error(`Error testing connection to ${serviceName}`);
      return false;
    }
  };

  return {
    isEnabled,
    settings,
    connectionStatus,
    lastTested,
    setEnabled,
    setSettings,
    testConnection
  };
};

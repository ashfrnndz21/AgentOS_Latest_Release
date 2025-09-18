
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLangChainKey } from '@/components/AgentWorkspace/hooks/useLangChainKey';
import { ApiKeyInput } from '@/components/AgentWorkspace/ApiKeyInput';
import { Key } from 'lucide-react';
import { useSupabaseApiKey } from '@/hooks/useSupabaseApiKey';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export const ApiSettings = () => {
  const { apiKey: openaiKey, setApiKey: setOpenaiKey, isValid: openaiValid } = useLangChainKey();
  const { apiKey: langfusePublicKey, setApiKey: setLangfusePublicKey } = useSupabaseApiKey('langfuse_public');
  const { apiKey: langfuseSecretKey, setApiKey: setLangfuseSecretKey } = useSupabaseApiKey('langfuse_secret');
  
  return (
    <div className="space-y-6">
      <Card className="bg-beam-dark-accent/30 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Key className="h-4 w-4 mr-2 text-purple-400" />
            API Keys
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage API keys for external services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-medium mb-2 flex items-center">
                OpenAI API Key
                {openaiValid && (
                  <Badge className="ml-2 bg-green-500" variant="default">Configured</Badge>
                )}
              </h3>
              <ApiKeyInput apiKey={openaiKey} setApiKey={setOpenaiKey} />
            </div>
            
            <Separator className="bg-gray-700/50 my-6" />
            
            <div>
              <h3 className="text-white font-medium mb-2 flex items-center">
                Langfuse Public Key
                {langfusePublicKey && (
                  <Badge className="ml-2 bg-green-500" variant="default">Configured</Badge>
                )}
              </h3>
              <ApiKeyInput 
                apiKey={langfusePublicKey} 
                setApiKey={setLangfusePublicKey} 
                placeholder="pk-lf-..." 
                label="Enter your Langfuse public key for observability"
              />
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2 flex items-center">
                Langfuse Secret Key
                {langfuseSecretKey && (
                  <Badge className="ml-2 bg-green-500" variant="default">Configured</Badge>
                )}
              </h3>
              <ApiKeyInput 
                apiKey={langfuseSecretKey} 
                setApiKey={setLangfuseSecretKey} 
                placeholder="sk-lf-..." 
                label="Enter your Langfuse secret key for observability"
              />
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">
                Your API keys are stored securely in the Supabase database and are only accessible to you.
                For production use, we recommend using environment variables or a secret management service.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

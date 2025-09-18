
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiTestResponseProps {
  apiKey: string;
  provider: 'openai' | 'anthropic' | 'google';
  isValid: boolean;
}

export const ApiTestResponse: React.FC<ApiTestResponseProps> = ({ 
  apiKey, 
  provider,
  isValid 
}) => {
  const [prompt, setPrompt] = useState("Explain how 5G technology works in one paragraph.");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const testApi = async () => {
    if (!isValid || !apiKey) {
      toast.error("Valid API key required");
      return;
    }
    
    setIsLoading(true);
    setResponse("");
    setError(null);
    
    try {
      if (provider === 'openai') {
        const result = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: prompt }
            ],
            max_tokens: 250
          })
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          const errorMessage = errorData.error?.message || "API request failed";
          setError(errorMessage);
          toast.error(`API test failed: ${errorMessage}`);
          console.error("API error details:", errorData);
        } else {
          const data = await result.json();
          setResponse(data.choices[0].message.content);
          toast.success("API test successful!");
        }
      } else if (provider === 'google') {
        const result = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              maxOutputTokens: 250
            }
          })
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          const errorMessage = errorData.error?.message || "API request failed";
          setError(errorMessage);
          toast.error(`API test failed: ${errorMessage}`);
          console.error("Google API error details:", errorData);
        } else {
          const data = await result.json();
          const textResponse = data.candidates[0]?.content?.parts[0]?.text || "No response text";
          setResponse(textResponse);
          toast.success("Google API test successful!");
        }
      } else if (provider === 'anthropic') {
        const result = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "claude-3-sonnet-20240229",
            max_tokens: 250,
            messages: [
              { role: "user", content: prompt }
            ]
          })
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          const errorMessage = errorData.error?.message || "API request failed";
          setError(errorMessage);
          toast.error(`API test failed: ${errorMessage}`);
          console.error("Anthropic API error details:", errorData);
        } else {
          const data = await result.json();
          setResponse(data.content[0].text);
          toast.success("Anthropic API test successful!");
        }
      }
    } catch (error: any) {
      console.error("API test error:", error);
      setError(error.message || "An unknown error occurred");
      toast.error(`API test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderErrorGuidance = () => {
    if (!error) return null;
    
    if (provider === 'openai' && error.includes("exceeded your current quota")) {
      return (
        <div className="mt-2 text-xs">
          <p>Your OpenAI account has exceeded its quota. You need to:</p>
          <ol className="list-decimal ml-4 mt-1 space-y-1">
            <li>Check your billing details at 
              <a 
                href="https://platform.openai.com/account/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 mx-1 underline inline-flex items-center"
              >
                OpenAI Billing Portal <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </li>
            <li>Add a payment method if not already added</li>
            <li>Add credits to your account</li>
            <li>Or use a different API key</li>
          </ol>
        </div>
      );
    } else if (provider === 'google' && error.includes("API key not valid")) {
      return (
        <div className="mt-2 text-xs">
          <p>Your Google API key appears to be invalid. You need to:</p>
          <ol className="list-decimal ml-4 mt-1 space-y-1">
            <li>Verify your API key at 
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 mx-1 underline inline-flex items-center"
              >
                Google Cloud Console <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </li>
            <li>Ensure the Generative Language API is enabled for your project</li>
            <li>Check if your API key has proper permissions</li>
          </ol>
        </div>
      );
    } else if (provider === 'anthropic' && error.includes("Invalid API key")) {
      return (
        <div className="mt-2 text-xs">
          <p>Your Anthropic API key appears to be invalid. You need to:</p>
          <ol className="list-decimal ml-4 mt-1 space-y-1">
            <li>Verify your API key at 
              <a 
                href="https://console.anthropic.com/settings/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 mx-1 underline inline-flex items-center"
              >
                Anthropic Console <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </li>
            <li>Ensure your API key has not expired</li>
            <li>Check if your account has proper access to the Claude API</li>
          </ol>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="bg-beam-dark-accent/30 border-gray-700/50 mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white">Test API Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-beam-dark border-gray-700 text-white h-20"
              placeholder="Enter a test prompt..."
            />
          </div>
          
          <Button
            onClick={testApi}
            disabled={isLoading || !isValid}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></div>
                <span>Testing API...</span>
              </div>
            ) : "Test with Sample Prompt"}
          </Button>
          
          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-900 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="mt-1">
                {error}
                {renderErrorGuidance()}
              </AlertDescription>
            </Alert>
          )}
          
          {response && !error && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">Response:</p>
              <div className="rounded-md bg-beam-dark p-3 text-sm text-white">
                {response}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

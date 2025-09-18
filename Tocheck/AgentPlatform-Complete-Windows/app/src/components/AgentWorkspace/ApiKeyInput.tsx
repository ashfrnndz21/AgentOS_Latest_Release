
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Key, Save } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  placeholder?: string;
  label?: string;
  serviceTitle?: string;
  isValid?: boolean;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  apiKey,
  setApiKey,
  placeholder = "sk-...",
  label = "Enter your OpenAI API key to use LangChain",
  serviceTitle,
  isValid
}) => {
  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState(apiKey);
  const [isSaving, setIsSaving] = useState(false);

  const toggleShowKey = () => setShowKey(!showKey);
  
  const handleSave = async () => {
    if (inputValue !== apiKey) {
      setIsSaving(true);
      await setApiKey(inputValue);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      {serviceTitle && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{serviceTitle}</span>
          {isValid !== undefined && (
            <span className={`text-xs ${isValid ? "text-green-500" : "text-amber-500"}`}>
              {isValid ? "Valid" : "Not set"}
            </span>
          )}
        </div>
      )}
      <p className="text-sm text-gray-400 mb-2">
        {label}
      </p>
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type={showKey ? "text" : "password"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-10 pr-10 bg-beam-dark-accent/30 border-beam-blue/40 text-white"
            placeholder={placeholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={toggleShowKey}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <Button 
          type="button" 
          variant="default" 
          onClick={handleSave}
          disabled={isSaving || inputValue === apiKey}
          className="min-w-20"
        >
          {isSaving ? "Saving..." : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Your API keys are stored securely in the database.
      </p>
    </div>
  );
};

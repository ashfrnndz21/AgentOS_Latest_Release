import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

interface OllamaTerminalProps {
  className?: string;
}

export const OllamaTerminal: React.FC<OllamaTerminalProps> = ({ className }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'info',
      content: '🤖 Ollama Terminal - Initializing...',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [ollamaStatus, setOllamaStatus] = useState<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLine = (type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  };

  const executeCommand = async () => {
    if (!currentCommand.trim() || isExecuting) return;

    const command = currentCommand.trim();
    
    // Validate command
    if (!command.startsWith('ollama')) {
      addLine('error', '❌ Only ollama commands are allowed');
      setCurrentCommand('');
      return;
    }

    setIsExecuting(true);
    addLine('command', `$ ${command}`);
    addLine('info', '🔄 Connecting to backend...');

    try {
      // Use centralized API client
      const result = await apiClient.executeOllamaCommand(command);
      
      if (!result.success) {
        throw new Error(result.error || 'Command failed');
      }
      
      const data = result.data;
      if (data.error) {
        addLine('error', `❌ ${data.error}`);
        if (data.suggestion) {
          addLine('info', `💡 ${data.suggestion}`);
        }
      } else {
        if (data.success) {
          addLine('info', '✅ Command executed successfully');
        }
        
        if (data.stdout) {
          const outputLines = data.stdout.trim().split('\n');
          outputLines.forEach(line => {
            if (line.trim()) {
              addLine('output', line);
            }
          });
        }
        
        if (data.stderr) {
          const errorLines = data.stderr.trim().split('\n');
          errorLines.forEach(line => {
            if (line.trim()) {
              addLine('error', line);
            }
          });
        }
      }
    } catch (error) {
      addLine('error', `❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addLine('info', '💡 Make sure the backend server is running');
    }

    setCurrentCommand('');
    setIsExecuting(false);
  };

  const clearTerminal = () => {
    setLines([{
      id: Date.now().toString(),
      type: 'info',
      content: '🧹 Terminal cleared - Ready for new commands',
      timestamp: new Date()
    }]);
  };

  const copyTerminalContent = () => {
    const content = lines.map(line => {
      const timestamp = line.timestamp.toLocaleTimeString();
      return `[${timestamp}] ${line.content}`;
    }).join('\n');
    
    navigator.clipboard.writeText(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-cyan-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      case 'output': return 'text-gray-300';
      default: return 'text-gray-300';
    }
  };

  const testConnection = async () => {
    setConnectionStatus('connecting');
    try {
      addLine('info', '🔄 Testing backend connection...');
      
      // Test direct health endpoint first
      const response = await fetch('/health');
      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`);
      }
      
      const healthData = await response.json();
      setConnectionStatus('connected');
      addLine('info', '✅ Backend connection established');
      addLine('info', `🔗 Backend service: ${healthData.service || 'ollama-api'}`);
      
      // Test Ollama status
      try {
        const ollamaData = await apiClient.getOllamaStatus();
        setOllamaStatus(ollamaData);
        addLine('info', `🤖 Ollama status: ${ollamaData.status}`);
        addLine('info', `📊 Available models: ${ollamaData.model_count || 0}`);
        addLine('info', 'Type "ollama help" for available commands');
      } catch (ollamaError) {
        addLine('error', '❌ Ollama service not available');
        addLine('info', '💡 Make sure Ollama is running: ollama serve');
      }
    } catch (error) {
      setConnectionStatus('error');
      addLine('error', '❌ Cannot connect to backend');
      addLine('info', '💡 Make sure to run: ./start-ollama-backend.sh');
      addLine('info', '💡 Backend should be running on port 5002');
      addLine('info', '💡 Frontend proxy: localhost:8080 → localhost:5002');
    }
  };

  // Test backend connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  // Focus input when component mounts and after commands
  useEffect(() => {
    if (inputRef.current && !isExecuting) {
      inputRef.current.focus();
    }
  }, [isExecuting]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-green-400" />
          <span className="text-sm font-medium text-white">Ollama Terminal</span>
          <div className="flex items-center gap-1 ml-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' :
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              'bg-red-400'
            }`} />
            <span className="text-xs text-gray-400">
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Disconnected'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={copyTerminalContent}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            title="Copy terminal content"
          >
            <Copy size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearTerminal}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            title="Clear terminal"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="h-96 overflow-y-auto p-4 font-mono text-sm bg-gray-900 cursor-text"
        onClick={focusInput}
      >
        {lines.map((line) => (
          <div key={line.id} className="mb-1 flex items-start gap-2">
            <span className="text-xs text-gray-500 min-w-[60px]">
              {line.timestamp.toLocaleTimeString()}
            </span>
            <span className={getLineColor(line.type)}>
              {line.content}
            </span>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isExecuting && (
          <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
            <span className="text-xs text-gray-500 min-w-[60px]">
              {new Date().toLocaleTimeString()}
            </span>
            <span>⏳ Executing command...</span>
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700" onClick={() => inputRef.current?.focus()}>
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter ollama command (e.g., ollama list, ollama pull llama3.2)"
            className="flex-1 bg-transparent text-white font-mono outline-none placeholder-gray-500 border-none focus:ring-0 focus:outline-none"
            disabled={isExecuting}
            autoComplete="off"
            autoFocus
            spellCheck={false}
            style={{ 
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
          />
          <Button
            size="sm"
            onClick={executeCommand}
            disabled={!currentCommand.trim() || isExecuting}
            className="bg-green-600 hover:bg-green-700"
            title="Execute command (Enter)"
          >
            <Play size={14} />
          </Button>
        </div>
        
        {/* Command hints */}
        <div className="text-xs text-gray-500 mt-1">
          💡 Try: ollama list, ollama pull llama3.2, ollama show llama3.2
        </div>
        
        {/* Quick action buttons */}
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentCommand('ollama list');
              setTimeout(() => focusInput(), 0);
            }}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
          >
            List Models
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentCommand('ollama pull llama3.2');
              setTimeout(() => focusInput(), 0);
            }}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
          >
            Pull Model
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentCommand('ollama show llama3.2');
              setTimeout(() => focusInput(), 0);
            }}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
          >
            Show Model Info
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={testConnection}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
          >
            Retry Connection
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              addLine('info', `🔧 Input test - Current command: "${currentCommand}"`);
              addLine('info', `🔧 Input focused: ${document.activeElement === inputRef.current}`);
              addLine('info', `🔧 Input disabled: ${isExecuting}`);
            }}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
          >
            Test Input
          </Button>
        </div>
      </div>
    </div>
  );
};
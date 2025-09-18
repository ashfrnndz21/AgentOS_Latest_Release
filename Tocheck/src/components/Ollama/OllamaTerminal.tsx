import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal, Play, Square, Trash2, Copy, Download, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ollamaService, OllamaUtils, TerminalCommandResult } from '@/lib/services/OllamaService';
import { useToast } from '@/hooks/use-toast';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'info' | 'success';
  content: string;
  timestamp: Date;
}

interface OllamaTerminalProps {
  className?: string;
  height?: string;
}

export const OllamaTerminal: React.FC<OllamaTerminalProps> = ({ 
  className = '', 
  height = 'h-96' 
}) => {
  const { toast } = useToast();
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'info',
      content: '🤖 Ollama Terminal - Ready to execute commands',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'info',
      content: 'Type "ollama help" for available commands or use suggestions below',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  }, []);

  const executeCommand = async () => {
    if (!currentCommand.trim() || isExecuting) return;

    const command = currentCommand.trim();
    
    // Validate command
    if (!OllamaUtils.isSafeCommand(command)) {
      addLine('error', '❌ Only ollama commands are allowed');
      setCurrentCommand('');
      return;
    }

    setIsExecuting(true);
    addLine('command', `$ ${command}`);

    // Add to history
    setCommandHistory(prev => {
      const newHistory = [command, ...prev.filter(cmd => cmd !== command)];
      return newHistory.slice(0, 50); // Keep last 50 commands
    });
    setHistoryIndex(-1);

    try {
      const result: TerminalCommandResult = await ollamaService.executeCommand(command);
      
      if (result.error) {
        addLine('error', `❌ ${result.error}`);
        if (result.suggestion) {
          addLine('info', `💡 ${result.suggestion}`);
        }
      } else {
        if (result.success) {
          addLine('success', '✅ Command executed successfully');
        }
        
        if (result.stdout) {
          // Split stdout into lines and add each as output
          const outputLines = result.stdout.trim().split('\n');
          outputLines.forEach(line => {
            if (line.trim()) {
              addLine('output', line);
            }
          });
        }
        
        if (result.stderr) {
          const errorLines = result.stderr.trim().split('\n');
          errorLines.forEach(line => {
            if (line.trim()) {
              addLine('error', line);
            }
          });
        }

        // Show success message for specific commands
        const parsed = OllamaUtils.parseCommand(command);
        if (parsed.action === 'pull' && result.success) {
          toast({
            title: "Model Downloaded",
            description: `Successfully pulled ${parsed.model}`,
          });
        } else if (parsed.action === 'rm' && result.success) {
          toast({
            title: "Model Removed",
            description: `Successfully removed ${parsed.model}`,
          });
        }
      }
    } catch (error) {
      addLine('error', `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Command Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }

    setCurrentCommand('');
    setIsExecuting(false);
    setShowSuggestions(false);
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
    
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied",
        description: "Terminal content copied to clipboard",
      });
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showSuggestions && suggestions.length > 0) {
        setCurrentCommand(suggestions[0]);
        setShowSuggestions(false);
      } else {
        executeCommand();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setCurrentCommand(suggestions[0]);
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentCommand(value);
    
    // Update suggestions
    const newSuggestions = OllamaUtils.getCommandSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(value.length > 0 && newSuggestions.length > 0);
  };

  const selectSuggestion = (suggestion: string) => {
    setCurrentCommand(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const showHelp = () => {
    addLine('info', '📚 Common Ollama Commands:');
    addLine('output', '  ollama list                    - List installed models');
    addLine('output', '  ollama pull <model>           - Download a model');
    addLine('output', '  ollama rm <model>             - Remove a model');
    addLine('output', '  ollama show <model>           - Show model information');
    addLine('output', '  ollama serve                  - Start Ollama server');
    addLine('output', '  ollama help                   - Show help');
    addLine('info', '💡 Use Tab for autocomplete, ↑↓ for command history');
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-cyan-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      case 'output': return 'text-gray-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-green-400" />
          <span className="text-sm font-medium text-white">Ollama Terminal</span>
          <Badge variant="outline" className="text-xs border-green-600 text-green-400">
            Local AI
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={showHelp}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            title="Show help"
          >
            <HelpCircle size={14} />
          </Button>
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
        className={`${height} overflow-y-auto p-4 font-mono text-sm bg-gray-900 relative`}
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

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-gray-800 border-t border-gray-700 p-2">
          <div className="text-xs text-gray-400 mb-1">Suggestions (Tab to complete):</div>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Command Input */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Enter ollama command (e.g., ollama list, ollama pull llama3.2)"
            className="flex-1 bg-transparent text-white font-mono outline-none placeholder-gray-500"
            disabled={isExecuting}
            autoComplete="off"
          />
          <Button
            size="sm"
            onClick={executeCommand}
            disabled={!currentCommand.trim() || isExecuting}
            className="bg-green-600 hover:bg-green-700"
            title="Execute command (Enter)"
          >
            {isExecuting ? (
              <Square size={14} />
            ) : (
              <Play size={14} />
            )}
          </Button>
        </div>
        
        {/* Command hints */}
        <div className="text-xs text-gray-500 mt-1">
          💡 Use ↑↓ for history, Tab for autocomplete, Ctrl+C to copy content
        </div>
      </div>
    </div>
  );
};
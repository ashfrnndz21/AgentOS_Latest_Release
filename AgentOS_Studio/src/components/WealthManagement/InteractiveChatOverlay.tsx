
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Minimize2, Maximize2, HelpCircle, Zap, Eye } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  contextElement?: string;
  confidence?: number;
}

export const InteractiveChatOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. Click on any part of the dashboard to ask questions about it, or ask me anything about the wealth management data.',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isHighlightMode) {
      document.body.style.cursor = 'crosshair';
      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target as HTMLElement;
        const elementDescription = getElementDescription(target);
        setSelectedElement(elementDescription);
        setIsHighlightMode(false);
        document.body.style.cursor = 'default';
        
        // Add a message about the selected element
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `I can see you've selected: "${elementDescription}". What would you like to know about this?`,
          timestamp: new Date().toLocaleTimeString(),
          contextElement: elementDescription
        };
        setMessages(prev => [...prev, newMessage]);
      };

      document.addEventListener('click', handleClick, true);
      return () => {
        document.removeEventListener('click', handleClick, true);
        document.body.style.cursor = 'default';
      };
    }
  }, [isHighlightMode]);

  const getElementDescription = (element: HTMLElement): string => {
    // Try to find meaningful content or context
    const text = element.textContent?.trim().substring(0, 50) || '';
    const className = element.className;
    const tagName = element.tagName.toLowerCase();
    
    if (text && text.length > 0) {
      return `${tagName} containing "${text}${text.length >= 50 ? '...' : ''}"`;
    }
    
    if (className.includes('chart') || className.includes('Chart')) {
      return 'Chart or visualization component';
    }
    
    if (className.includes('card') || className.includes('Card')) {
      return 'Dashboard card component';
    }
    
    if (className.includes('agent') || className.includes('Agent')) {
      return 'AI Agent component';
    }
    
    return `${tagName} element`;
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date().toLocaleTimeString(),
      contextElement: selectedElement || undefined
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(currentInput, selectedElement),
        timestamp: new Date().toLocaleTimeString(),
        confidence: Math.floor(Math.random() * 20) + 80 // 80-100%
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setCurrentInput('');
    setSelectedElement(null);
  };

  const generateAIResponse = (input: string, context: string | null): string => {
    const responses = [
      `Based on the AI agents' analysis, this ${context || 'element'} shows strong performance indicators. The confidence level is high due to multiple confirming data sources.`,
      `The recommendation here is backed by real-time market data and sentiment analysis. Our AI research agents identified this opportunity through web scraping and pattern recognition.`,
      `This visualization represents data from 6 active AI agents. The confidence score reflects the consensus across multiple analysis frameworks including risk assessment and trend prediction.`,
      `The underlying algorithm considers 247 risk factors and cross-references with historical patterns. This specific insight has a 94% historical accuracy rate.`,
      `This component leverages machine learning models trained on 15+ years of market data. The current recommendation aligns with 5 different analytical approaches.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickQuestions = [
    "Why is this recommendation confidence so high?",
    "What data sources support this analysis?",
    "How does this compare to historical trends?",
    "What are the main risk factors here?",
    "Explain the AI reasoning behind this"
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-true-red hover:bg-true-red/80 text-white rounded-full w-14 h-14 shadow-lg"
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="bg-beam-dark border-gray-700 w-80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-true-red" />
                RM Assistant
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsMinimized(false)}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="bg-beam-dark border-gray-700 w-96 h-[600px] shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-true-red" />
              RM AI Assistant
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${isHighlightMode ? 'bg-true-red text-white' : ''}`}
                onClick={() => setIsHighlightMode(!isHighlightMode)}
                title="Click to highlight and question UI elements"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {isHighlightMode && (
            <Badge className="bg-true-red/20 text-true-red border-true-red/30 text-xs">
              Click on any UI element to ask about it
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="flex flex-col h-[500px] p-4">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-true-red text-white'
                        : 'bg-beam-dark-accent/70 border border-gray-700 text-gray-300'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                      {message.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {message.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                    {message.contextElement && (
                      <Badge variant="outline" className="text-xs mt-1">
                        <Eye className="h-3 w-3 mr-1" />
                        {message.contextElement}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Questions */}
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-1">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 border-gray-600 text-gray-300"
                  onClick={() => setCurrentInput(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {selectedElement && (
            <div className="mb-2 p-2 bg-beam-dark-accent/30 rounded border border-true-red/30">
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3 text-true-red" />
                <span className="text-xs text-gray-300">Selected: {selectedElement}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-auto"
                  onClick={() => setSelectedElement(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Ask about any part of the dashboard..."
              className="bg-beam-dark-accent/50 border-gray-700 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-true-red hover:bg-true-red/80"
              disabled={!currentInput.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

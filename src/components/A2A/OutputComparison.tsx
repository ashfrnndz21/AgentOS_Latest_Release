import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle, 
  Clock, 
  Sparkles,
  ArrowRight,
  FileText,
  Wand2,
  AlertCircle
} from 'lucide-react';

interface OutputComparisonProps {
  rawOutput: string;
  cleanedOutput: string;
  agentName: string;
  cleaningTime?: number;
  success?: boolean;
  className?: string;
}

export const OutputComparison: React.FC<OutputComparisonProps> = ({
  rawOutput,
  cleanedOutput,
  agentName,
  cleaningTime = 0,
  success = true,
  className = ''
}) => {
  const [showRaw, setShowRaw] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedCleaned, setCopiedCleaned] = useState(false);

  const copyToClipboard = async (text: string, type: 'raw' | 'cleaned') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'raw') {
        setCopiedRaw(true);
        setTimeout(() => setCopiedRaw(false), 2000);
      } else {
        setCopiedCleaned(true);
        setTimeout(() => setCopiedCleaned(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatText = (text: string) => {
    // Simple formatting for display
    return text
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCleaningEfficiency = () => {
    const rawLength = getCharacterCount(rawOutput);
    const cleanedLength = getCharacterCount(cleanedOutput);
    const reduction = ((rawLength - cleanedLength) / rawLength) * 100;
    return {
      reduction: Math.max(0, reduction),
      rawLength,
      cleanedLength
    };
  };

  const efficiency = getCleaningEfficiency();

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Output Comparison</CardTitle>
            <Badge variant={success ? "default" : "destructive"}>
              {agentName}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRaw(!showRaw)}
            >
              {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showRaw ? 'Hide Raw' : 'Show Raw'}
            </Button>
          </div>
        </div>
        <CardDescription>
          Compare raw agent output with cleaned, formatted version
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cleaning Stats */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Processing Time</div>
            <div className="text-lg font-semibold flex items-center justify-center">
              <Clock className="h-4 w-4 mr-1" />
              {cleaningTime.toFixed(2)}s
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Size Reduction</div>
            <div className="text-lg font-semibold text-green-600">
              {efficiency.reduction.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="text-lg font-semibold flex items-center justify-center">
              {success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Comparison Tabs */}
        <Tabs defaultValue="cleaned" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cleaned" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Cleaned Output</span>
            </TabsTrigger>
            <TabsTrigger value="raw" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Raw Output</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cleaned" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600">
                  {getCharacterCount(cleanedOutput)} chars
                </Badge>
                <Badge variant="outline" className="text-green-600">
                  {getWordCount(cleanedOutput)} words
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(cleanedOutput, 'cleaned')}
              >
                {copiedCleaned ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedCleaned ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <ScrollArea className="h-64 w-full border rounded-md p-4">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formatText(cleanedOutput) }}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-orange-600">
                  {getCharacterCount(rawOutput)} chars
                </Badge>
                <Badge variant="outline" className="text-orange-600">
                  {getWordCount(rawOutput)} words
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(rawOutput, 'raw')}
              >
                {copiedRaw ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedRaw ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <ScrollArea className="h-64 w-full border rounded-md p-4">
              <div 
                className="prose prose-sm max-w-none font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: formatText(rawOutput) }}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Side-by-side comparison (when showRaw is true) */}
        {showRaw && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Side-by-Side Comparison</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-orange-600">Raw Output</div>
                <ScrollArea className="h-32 w-full border rounded-md p-3">
                  <div 
                    className="prose prose-sm max-w-none font-mono text-xs"
                    dangerouslySetInnerHTML={{ __html: formatText(rawOutput) }}
                  />
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-green-600">Cleaned Output</div>
                <ScrollArea className="h-32 w-full border rounded-md p-3">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatText(cleanedOutput) }}
                  />
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

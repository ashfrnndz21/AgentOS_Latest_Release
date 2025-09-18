import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function Agents() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Bot className="h-8 w-8" />
          AI Agents Dashboard
        </h1>
        <p className="text-muted-foreground">
          AI Agents Dashboard interface and management tools
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Agents Dashboard</CardTitle>
          <CardDescription>
            This feature is being developed and will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The AI Agents Dashboard functionality is currently under development. 
            Please check back later for full features.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export const TechnicalBuildingBlocks: React.FC = () => {
  const buildingBlocks = [
    {
      name: "Agent Runtime",
      category: "Core",
      description: "Execution environment for AI agents",
      status: "Active",
      dependencies: ["Message Bus", "State Manager"]
    },
    {
      name: "Message Bus",
      category: "Communication",
      description: "Inter-agent communication layer",
      status: "Active",
      dependencies: ["Event Stream"]
    },
    {
      name: "State Manager",
      category: "Core",
      description: "Centralized state management",
      status: "Active",
      dependencies: ["Database Layer"]
    },
    {
      name: "API Gateway",
      category: "Integration",
      description: "External API access point",
      status: "Active",
      dependencies: ["Security Layer"]
    },
    {
      name: "Database Layer",
      category: "Storage",
      description: "Data persistence and retrieval",
      status: "Active",
      dependencies: []
    },
    {
      name: "Event Stream",
      category: "Communication",
      description: "Real-time event processing",
      status: "Active",
      dependencies: ["Message Bus"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Inactive": return "bg-red-100 text-red-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Core": return "bg-blue-100 text-blue-800";
      case "Communication": return "bg-purple-100 text-purple-800";
      case "Integration": return "bg-orange-100 text-orange-800";
      case "Storage": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Technical Building Blocks</h2>
          <p className="text-muted-foreground">
            Core components that make up the agent architecture
          </p>
        </div>
        <Button>Add Component</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildingBlocks.map((block, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{block.name}</CardTitle>
                <Badge className={getStatusColor(block.status)}>
                  {block.status}
                </Badge>
              </div>
              <Badge variant="outline" className={getCategoryColor(block.category)}>
                {block.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                {block.description}
              </CardDescription>
              
              {block.dependencies.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Dependencies:</p>
                  <div className="flex flex-wrap gap-1">
                    {block.dependencies.map((dep, depIndex) => (
                      <Badge key={depIndex} variant="secondary" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Component Relationships</CardTitle>
          <CardDescription>
            Visual representation of how components interact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Component relationship diagram would be rendered here</p>
            <p className="text-sm mt-2">Interactive visualization of dependencies and data flow</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
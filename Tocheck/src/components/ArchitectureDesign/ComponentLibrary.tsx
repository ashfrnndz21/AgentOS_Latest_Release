import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Search, Plus, Download } from 'lucide-react';

export const ComponentLibrary: React.FC = () => {
  const components = [
    {
      name: "Agent Executor",
      type: "Core Component",
      version: "v2.1.0",
      description: "Executes agent workflows and manages lifecycle",
      tags: ["core", "execution", "workflow"],
      downloads: 1250,
      rating: 4.8
    },
    {
      name: "Message Router",
      type: "Communication",
      version: "v1.5.2",
      description: "Routes messages between agents and services",
      tags: ["communication", "routing", "messaging"],
      downloads: 890,
      rating: 4.6
    },
    {
      name: "State Synchronizer",
      type: "Utility",
      version: "v1.3.1",
      description: "Synchronizes state across distributed agents",
      tags: ["state", "sync", "distributed"],
      downloads: 670,
      rating: 4.7
    },
    {
      name: "Security Gateway",
      type: "Security",
      version: "v3.0.0",
      description: "Handles authentication and authorization",
      tags: ["security", "auth", "gateway"],
      downloads: 1100,
      rating: 4.9
    },
    {
      name: "Data Connector",
      type: "Integration",
      version: "v2.2.1",
      description: "Connects to external data sources",
      tags: ["data", "connector", "integration"],
      downloads: 950,
      rating: 4.5
    },
    {
      name: "Event Publisher",
      type: "Communication",
      version: "v1.8.0",
      description: "Publishes events to event streams",
      tags: ["events", "publisher", "streaming"],
      downloads: 780,
      rating: 4.4
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Core Component": return "bg-blue-100 text-blue-800";
      case "Communication": return "bg-purple-100 text-purple-800";
      case "Security": return "bg-red-100 text-red-800";
      case "Integration": return "bg-green-100 text-green-800";
      case "Utility": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Component Library</h2>
          <p className="text-muted-foreground">
            Reusable components for building agent architectures
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Component
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{component.version}</p>
                </div>
                <Badge className={getTypeColor(component.type)}>
                  {component.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                {component.description}
              </CardDescription>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {component.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                <span>⭐ {component.rating}</span>
                <span>
                  <Download className="w-3 h-3 inline mr-1" />
                  {component.downloads}
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">Install</Button>
                <Button size="sm" variant="outline">Preview</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Component Statistics</CardTitle>
          <CardDescription>
            Usage and performance metrics for components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">24</p>
              <p className="text-sm text-muted-foreground">Total Components</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">18</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">4</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">2</p>
              <p className="text-sm text-muted-foreground">Deprecated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
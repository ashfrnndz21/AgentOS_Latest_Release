import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, FileText } from 'lucide-react';

interface AgentBasicInfoProps {
  name: string;
  description: string;
  onUpdate: (name: string, description: string) => void;
}

const suggestedRoles = [
  'Data Analyst',
  'Customer Support',
  'Content Creator',
  'Research Assistant',
  'Code Reviewer',
  'Financial Advisor',
  'Marketing Specialist',
  'Project Manager'
];

export const AgentBasicInfo: React.FC<AgentBasicInfoProps> = ({
  name,
  description,
  onUpdate
}) => {
  const handleRoleSelect = (role: string) => {
    const roleDescriptions: { [key: string]: string } = {
      'Data Analyst': 'Specialized in analyzing data patterns, creating reports, and providing insights from complex datasets.',
      'Customer Support': 'Focused on helping customers resolve issues, answer questions, and provide excellent service.',
      'Content Creator': 'Expert in creating engaging content, writing articles, and developing creative materials.',
      'Research Assistant': 'Skilled in conducting research, gathering information, and synthesizing findings.',
      'Code Reviewer': 'Specialized in reviewing code quality, identifying bugs, and suggesting improvements.',
      'Financial Advisor': 'Expert in financial planning, investment strategies, and risk assessment.',
      'Marketing Specialist': 'Focused on marketing strategies, campaign development, and brand management.',
      'Project Manager': 'Skilled in project coordination, timeline management, and team collaboration.'
    };

    if (!name) {
      onUpdate(role, roleDescriptions[role] || description);
    } else {
      onUpdate(name, roleDescriptions[role] || description);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Agent Basic Information</h3>
        <p className="text-sm text-gray-400">
          Provide a name and description for your agent to define its purpose and capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-beam-dark-accent border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <User className="h-4 w-4" />
              Agent Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="agent-name" className="text-sm font-medium text-gray-300">
                Agent Name *
              </Label>
              <Input
                id="agent-name"
                value={name}
                onChange={(e) => onUpdate(e.target.value, description)}
                placeholder="e.g., Customer Support Assistant"
                className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose a descriptive name that reflects the agent's role
              </p>
            </div>

            <div>
              <Label htmlFor="agent-description" className="text-sm font-medium text-gray-300">
                Description *
              </Label>
              <Textarea
                id="agent-description"
                value={description}
                onChange={(e) => onUpdate(name, e.target.value)}
                placeholder="Describe what this agent will do and its key responsibilities..."
                rows={4}
                className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a clear description of the agent's purpose and capabilities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-beam-dark-accent border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <FileText className="h-4 w-4" />
              Quick Start Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-4">
              Select a role template to quickly populate the agent details:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedRoles.map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className="cursor-pointer border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 transition-colors p-2 text-center justify-center"
                  onClick={() => handleRoleSelect(role)}
                >
                  {role}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Click any role to auto-fill the name and description
            </p>
          </CardContent>
        </Card>
      </div>

      {name && description && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Agent Preview</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-green-300">Name:</span>
                <span className="text-sm text-white ml-2">{name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-green-300">Description:</span>
                <p className="text-sm text-gray-300 mt-1">{description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
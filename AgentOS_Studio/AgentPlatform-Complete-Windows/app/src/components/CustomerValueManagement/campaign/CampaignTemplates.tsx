
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { FileText, Plus } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'tpl1',
    name: 'End of Month Retention',
    description: 'Targeted retention offer for high-value customers approaching contract renewal',
    type: 'Retention',
    target: 'High Value',
  },
  {
    id: 'tpl2',
    name: 'Cross-sell Bundle',
    description: 'Cross-sell additional services to existing customers based on usage patterns',
    type: 'Cross-sell',
    target: 'Medium Value',
  },
  {
    id: 'tpl3',
    name: 'Service Upgrade',
    description: 'Upgrade offer for customers eligible for service/plan improvements',
    type: 'Upsell',
    target: 'All Segments',
  },
  {
    id: 'tpl4',
    name: 'Win-back Campaign',
    description: 'Special offers to re-engage customers who have recently churned',
    type: 'Acquisition',
    target: 'At Risk',
  },
];

interface CampaignTemplatesProps {
  onSelectTemplate: (template: typeof TEMPLATES[0]) => void;
}

export const CampaignTemplates = ({ onSelectTemplate }: CampaignTemplatesProps) => {
  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    onSelectTemplate(template);
    toast({
      title: "Template Selected",
      description: `The "${template.name}" template has been loaded. You can now customize it.`,
    });
  };

  return (
    <Card className="border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Campaign Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map(template => (
            <div key={template.id} className="border border-gray-700/50 rounded-lg p-4 bg-beam-dark/70">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-blue-400" />
                  <h3 className="font-medium text-white">{template.name}</h3>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">
                  {template.type}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Target: {template.target}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-blue-400 border-blue-600/30 hover:bg-blue-950/20"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Plus size={14} className="mr-1" />
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

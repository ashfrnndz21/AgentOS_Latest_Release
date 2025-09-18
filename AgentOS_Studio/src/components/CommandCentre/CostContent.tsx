import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectSelector } from './ProjectSelector';
import { getProjectData } from './ProjectData';
import { Checkbox } from "@/components/ui/checkbox";

const costData = [
  {
    month: 'Jan',
    'Hydrogen Production': 124,
    'Financial Forecasting': 85,
    'Process Engineering': 42,
  },
  {
    month: 'Feb',
    'Hydrogen Production': 137,
    'Financial Forecasting': 77,
    'Process Engineering': 50,
  },
  {
    month: 'Mar',
    'Hydrogen Production': 129,
    'Financial Forecasting': 90,
    'Process Engineering': 56,
  },
  {
    month: 'Apr',
    'Hydrogen Production': 142,
    'Financial Forecasting': 103,
    'Process Engineering': 65,
  },
  {
    month: 'May',
    'Hydrogen Production': 158,
    'Financial Forecasting': 118,
    'Process Engineering': 72,
  },
  {
    month: 'Jun',
    'Hydrogen Production': 146,
    'Financial Forecasting': 110,
    'Process Engineering': 80,
  },
];

const allAgentCostData = [
  { 
    id: 1, 
    name: 'Electrolysis Process Agent', 
    project: 'Hydrogen Production', 
    model: 'GPT-4o', 
    dailyInferences: 245, 
    monthlyCost: 127.40,
    costTrend: 'up' 
  },
  { 
    id: 2, 
    name: 'Production Planning Agent', 
    project: 'Hydrogen Production', 
    model: 'Claude 3 Opus', 
    dailyInferences: 187, 
    monthlyCost: 98.65,
    costTrend: 'down' 
  },
  { 
    id: 3, 
    name: 'Strategic Finance Analyst', 
    project: 'Financial Forecasting', 
    model: 'GPT-4o', 
    dailyInferences: 156, 
    monthlyCost: 62.40,
    costTrend: 'up' 
  },
  { 
    id: 4, 
    name: 'Market Intelligence Agent', 
    project: 'Financial Forecasting', 
    model: 'Claude 3 Opus', 
    dailyInferences: 203, 
    monthlyCost: 81.20,
    costTrend: 'down' 
  },
  { 
    id: 5, 
    name: 'Portfolio Optimization Agent', 
    project: 'Process Engineering', 
    model: 'GPT-4o', 
    dailyInferences: 129, 
    monthlyCost: 51.60,
    costTrend: 'up' 
  },
  { 
    id: 6, 
    name: 'Quality Control Agent', 
    project: 'Hydrogen Production', 
    model: 'Llama 3 70B', 
    dailyInferences: 178, 
    monthlyCost: 103.80,
    costTrend: 'down' 
  },
  { 
    id: 7, 
    name: 'Geopolitical Risk Agent', 
    project: 'Financial Forecasting', 
    model: 'GPT-4 Turbo', 
    dailyInferences: 195, 
    monthlyCost: 85.30,
    costTrend: 'up' 
  },
  { 
    id: 8, 
    name: 'Safety Monitoring Agent', 
    project: 'Hydrogen Production', 
    model: 'GPT-4o', 
    dailyInferences: 220, 
    monthlyCost: 68.90,
    costTrend: 'down' 
  },
];

const colorMap = {
  'Hydrogen Production': '#4338ca',
  'Financial Forecasting': '#8b5cf6',
  'Process Engineering': '#10b981',
};

const projectDisplayNames = {
  'hydrogen-production': 'Hydrogen Production',
  'industrial-forecasting': 'Financial Forecasting',
  'process-engineering': 'Process Engineering',
};

interface CostContentProps {
  selectedProject?: string;
  setSelectedProject?: (project: string) => void;
}

export const CostContent: React.FC<CostContentProps> = ({ 
  selectedProject: externalSelectedProject,
  setSelectedProject: externalSetSelectedProject
}) => {
  const [internalSelectedProject, setInternalSelectedProject] = useState<string>('hydrogen-production');
  const [selectedProjects, setSelectedProjects] = useState<string[]>(['hydrogen-production']);
  const [showAllProjects, setShowAllProjects] = useState<boolean>(true);
  
  const selectedProject = externalSelectedProject || internalSelectedProject;
  const setSelectedProject = externalSetSelectedProject || setInternalSelectedProject;
  
  const projectData = getProjectData();
  
  const agentCostData = allAgentCostData.filter(agent => 
    showAllProjects || selectedProjects.includes(Object.keys(projectDisplayNames).find(
      key => projectDisplayNames[key as keyof typeof projectDisplayNames] === agent.project
    ) || '')
  );
  
  const totalMonthlyCost = agentCostData.reduce((total, agent) => total + agent.monthlyCost, 0);
  
  const totalDailyInferences = agentCostData.reduce((total, agent) => total + agent.dailyInferences, 0);
  
  const projectCosts = Object.keys(projectDisplayNames).map(key => {
    const projectName = projectDisplayNames[key as keyof typeof projectDisplayNames];
    const agents = allAgentCostData.filter(agent => agent.project === projectName);
    return {
      project: projectName,
      key,
      cost: agents.reduce((total, agent) => total + agent.monthlyCost, 0)
    };
  });
  
  const highestCostProject = projectCosts.sort((a, b) => b.cost - a.cost)[0];
  
  const handleProjectSelect = (project: string) => {
    setSelectedProject(project);
    
    const projectName = projectDisplayNames[project as keyof typeof projectDisplayNames];
    if (projectName) {
      setSelectedProjects([project]);
      setShowAllProjects(false);
    }
  };
  
  const handleProjectCheckboxChange = (project: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects(prev => [...prev, project]);
    } else {
      setSelectedProjects(prev => prev.filter(p => p !== project));
    }
    setShowAllProjects(false);
  };
  
  const handleShowAllChange = (checked: boolean) => {
    setShowAllProjects(checked);
    if (checked) {
      setSelectedProjects(Object.keys(projectDisplayNames));
    }
  };
  
  const filteredChartData = costData.map(item => {
    const filteredItem: any = { month: item.month };
    Object.keys(item).forEach(key => {
      if (key === 'month') return;
      
      const projectKey = Object.keys(projectDisplayNames).find(
        p => projectDisplayNames[p as keyof typeof projectDisplayNames] === key
      );
      
      if (showAllProjects || (projectKey && selectedProjects.includes(projectKey))) {
        filteredItem[key] = item[key as keyof typeof item];
      }
    });
    return filteredItem;
  });
  
  return (
    <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6 shadow-lg space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Cost Analytics</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showAll" 
              checked={showAllProjects}
              onCheckedChange={handleShowAllChange}
              className="data-[state=checked]:bg-beam-blue data-[state=checked]:border-beam-blue"
            />
            <label htmlFor="showAll" className="text-sm text-gray-300 cursor-pointer">
              Show All Projects
            </label>
          </div>
          <ProjectSelector
            selectedProject={selectedProject}
            projectData={projectData}
            setSelectedProject={handleProjectSelect}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-beam-dark-accent/50 border-gray-700/50 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Monthly Cost</CardTitle>
            <CardDescription className="text-gray-400">
              {showAllProjects ? 'All projects combined' : 'Selected projects'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{totalMonthlyCost.toFixed(2)}</span>
              <span className="text-green-400 text-sm font-medium ml-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8.2%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-beam-dark-accent/50 border-gray-700/50 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Daily Inference Count</CardTitle>
            <CardDescription className="text-gray-400">
              {showAllProjects ? 'Average across all agents' : 'Selected projects'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{totalDailyInferences.toLocaleString()}</span>
              <span className="text-green-400 text-sm font-medium ml-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-beam-dark-accent/50 border-gray-700/50 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Highest Cost Project</CardTitle>
            <CardDescription className="text-gray-400">{highestCostProject.project}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{highestCostProject.cost.toFixed(2)}</span>
              <span className="text-red-400 text-sm font-medium ml-2 flex items-center">
                <TrendingDown className="h-4 w-4 mr-1" />
                -3.1%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-beam-dark-accent/50 border-gray-700/50 text-white">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Monthly Cost Trends</CardTitle>
            <CardDescription className="text-gray-400">Last 6 months, selected projects</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(projectDisplayNames).map(([key, name]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox 
                  id={`project-${key}`} 
                  checked={showAllProjects || selectedProjects.includes(key)}
                  onCheckedChange={(checked) => handleProjectCheckboxChange(key, checked === true)}
                  className="data-[state=checked]:bg-beam-blue data-[state=checked]:border-beam-blue"
                  disabled={showAllProjects}
                />
                <label htmlFor={`project-${key}`} className="text-xs text-gray-300 cursor-pointer flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: colorMap[name as keyof typeof colorMap] }} 
                  />
                  {name}
                </label>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                'Hydrogen Production': { color: colorMap['Hydrogen Production'] },
                'Financial Forecasting': { color: colorMap['Financial Forecasting'] },
                'Process Engineering': { color: colorMap['Process Engineering'] },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {showAllProjects || selectedProjects.includes('hydrogen-production') ? (
                    <Bar dataKey="Hydrogen Production" fill={colorMap['Hydrogen Production']} />
                  ) : null}
                  {showAllProjects || selectedProjects.includes('industrial-forecasting') ? (
                    <Bar dataKey="Financial Forecasting" fill={colorMap['Financial Forecasting']} />
                  ) : null}
                  {showAllProjects || selectedProjects.includes('process-engineering') ? (
                    <Bar dataKey="Process Engineering" fill={colorMap['Process Engineering']} />
                  ) : null}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-beam-dark-accent/50 border-gray-700/50 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Agent Cost Breakdown</CardTitle>
          <CardDescription className="text-gray-400">
            {showAllProjects ? 'Top agents by monthly cost' : 'Selected project agents'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="text-white">
            <TableHeader>
              <TableRow className="hover:bg-beam-dark-accent/70 border-gray-700">
                <TableHead className="text-gray-400">Agent Name</TableHead>
                <TableHead className="text-gray-400">Project</TableHead>
                <TableHead className="text-gray-400">Model</TableHead>
                <TableHead className="text-gray-400 text-right">Daily Inferences</TableHead>
                <TableHead className="text-gray-400 text-right">Monthly Cost</TableHead>
                <TableHead className="text-gray-400 text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentCostData.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-beam-dark-accent/70 border-gray-700">
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: colorMap[agent.project as keyof typeof colorMap] }} 
                      />
                      {agent.project}
                    </div>
                  </TableCell>
                  <TableCell>{agent.model}</TableCell>
                  <TableCell className="text-right">{agent.dailyInferences.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">
                    {agent.monthlyCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {agent.costTrend === 'up' ? (
                      <span className="text-red-400 inline-flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                      </span>
                    ) : (
                      <span className="text-green-400 inline-flex items-center">
                        <TrendingDown className="h-4 w-4 mr-1" />
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltipContent
        className="bg-beam-dark-accent/90 border border-gray-700 text-white" 
        payload={payload}
        active={active}
        label={label}
      />
    );
  }
  return null;
};

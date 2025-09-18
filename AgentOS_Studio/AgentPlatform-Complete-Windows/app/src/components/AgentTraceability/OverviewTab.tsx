import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, Shield, Wrench, AlertTriangle, Check, ChevronDown } from 'lucide-react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { OverviewTabProps } from './types';

export const OverviewTab: React.FC<OverviewTabProps> = ({
  totalAgents,
  toolNodes,
  guardrailNodes,
  databaseAccesses,
  deniedToolAccesses,
  deniedDatabaseAccesses,
  averageDecisionTime,
  totalTaskTime,
  onNodeClick
}) => {
  // Project-specific denied tool access data
  const deniedToolsList = [
    { id: 'tool1', name: 'Network Configuration API', reason: 'Attempting production environment access in test mode', timestamp: '10:23 AM' },
    { id: 'tool2', name: 'Customer Billing System', reason: 'Missing required authorization token', timestamp: '11:45 AM' }
  ];

  // Project-specific denied database access data
  const deniedDatabasesList = [
    { id: 'db1', name: 'Customer PII Records', reason: 'Access restricted due to data privacy regulations', timestamp: '09:15 AM' },
    { id: 'db2', name: 'Financial Transaction History', reason: 'Access requires finance team approval', timestamp: '02:30 PM' },
    { id: 'db3', name: 'Network Infrastructure Credentials', reason: 'Security policy violation: credential access', timestamp: '04:12 PM' }
  ];

  // Project-specific telecom guardrail activations
  const guardRailActivations = [
    { 
      id: 'guard1', 
      label: 'Customer Data PII Detection', 
      guardrailType: 'pii', 
      guardrailAction: 'Redacted 12 instances of personally identifiable information',
      timestamp: '09:32 AM' 
    },
    { 
      id: 'guard2', 
      label: 'Budget Cap Alert', 
      guardrailType: 'financial', 
      guardrailAction: 'Prevented exceeding approved CAPEX allocation of $1.2M',
      timestamp: '10:45 AM' 
    },
    { 
      id: 'guard3', 
      label: 'Regulatory Compliance Check', 
      guardrailType: 'compliance', 
      guardrailAction: 'Enforced FCC Section 255 accessibility requirements',
      timestamp: '11:17 AM' 
    },
    { 
      id: 'guard4', 
      label: 'Sensitive Market Intelligence', 
      guardrailType: 'confidential', 
      guardrailAction: 'Limited access to competitor analysis data',
      timestamp: '02:53 PM' 
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Summary Card */}
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-white">Project Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                <span className="text-xs text-gray-400">Total Agents</span>
                <div className="flex items-center mt-1">
                  <span className="text-xl font-medium text-white">{totalAgents}</span>
                </div>
              </div>
              <div className="flex flex-col p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                <span className="text-xs text-gray-400">Tool Usages</span>
                <div className="flex items-center mt-1">
                  <span className="text-xl font-medium text-purple-300">{toolNodes.length}</span>
                </div>
              </div>
              <div className="flex flex-col p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                <span className="text-xs text-gray-400">Guardrail Hits</span>
                <div className="flex items-center mt-1">
                  <span className="text-xl font-medium text-amber-300">{guardrailNodes.length || guardRailActivations.length}</span>
                </div>
              </div>
              <div className="flex flex-col p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                <span className="text-xs text-gray-400">DB Accesses</span>
                <div className="flex items-center mt-1">
                  <span className="text-xl font-medium text-blue-300">{databaseAccesses}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timing Card */}
        <Card className="bg-beam-dark/70 border border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium text-white">Execution Timing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-col p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Avg Decision Step Time</span>
                  <span className="text-xs font-medium text-white">{averageDecisionTime}</span>
                </div>
                <Progress value={65} className="h-1.5 mt-2" />
              </div>
              <div className="flex flex-col p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Total Task Completion Time</span>
                  <span className="text-xs font-medium text-white">{totalTaskTime}</span>
                </div>
                <Progress value={80} className="h-1.5 mt-2" />
              </div>
              <div className="flex justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-400" />
                  <span className="text-xs text-gray-300">Decision Trail Steps</span>
                </div>
                <span className="text-xs font-medium text-white">{toolNodes.length + guardrailNodes.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access & Guardrails Card */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-white">Access Control & Guardrails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* Tool Access Denied with Dropdown */}
              <Collapsible className="w-full">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/30 hover:bg-gray-800/60 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Wrench size={14} className="text-purple-400" />
                      <span className="text-xs text-gray-300">Tool Access Denied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-900/30 text-red-300 border-red-600/30">
                        {deniedToolAccesses}
                      </Badge>
                      <ChevronDown size={14} className="text-gray-400 collapsible-icon" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-3 bg-gray-800/20 rounded-lg border border-gray-700/20 text-xs">
                    <Accordion type="single" collapsible className="w-full">
                      {deniedToolsList.map((tool) => (
                        <AccordionItem key={tool.id} value={tool.id} className="border-gray-700/30">
                          <AccordionTrigger className="py-2 text-red-300 hover:text-red-200 hover:no-underline">
                            {tool.name}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-300">
                            <div className="space-y-1 pl-2">
                              <div><span className="text-gray-400">Reason:</span> {tool.reason}</div>
                              <div><span className="text-gray-400">Time:</span> {tool.timestamp}</div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Database Access Denied with Dropdown */}
              <Collapsible className="w-full">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/30 hover:bg-gray-800/60 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-blue-400" />
                      <span className="text-xs text-gray-300">Database Access Denied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-900/30 text-red-300 border-red-600/30">
                        {deniedDatabaseAccesses}
                      </Badge>
                      <ChevronDown size={14} className="text-gray-400 collapsible-icon" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-3 bg-gray-800/20 rounded-lg border border-gray-700/20 text-xs">
                    <Accordion type="single" collapsible className="w-full">
                      {deniedDatabasesList.map((db) => (
                        <AccordionItem key={db.id} value={db.id} className="border-gray-700/30">
                          <AccordionTrigger className="py-2 text-red-300 hover:text-red-200 hover:no-underline">
                            {db.name}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-300">
                            <div className="space-y-1 pl-2">
                              <div><span className="text-gray-400">Reason:</span> {db.reason}</div>
                              <div><span className="text-gray-400">Time:</span> {db.timestamp}</div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-green-400" />
                  <span className="text-xs text-gray-300">Guardrails Active</span>
                </div>
                <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-600/30">
                  Enabled
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-400" />
                  <span className="text-xs font-medium text-amber-300">Guardrail Activations</span>
                </div>
              </div>
              <Separator className="my-2 bg-gray-700/30" />
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                {guardRailActivations.map((node, idx) => (
                  <Collapsible key={idx} className="w-full">
                    <CollapsibleTrigger className="w-full text-left">
                      <div 
                        className="flex items-center justify-between p-2 bg-amber-900/20 rounded border border-amber-600/20 cursor-pointer hover:bg-amber-900/30 transition-colors"
                      >
                        <span className="text-xs text-amber-200 truncate max-w-[200px]">{node.label}</span>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="outline" 
                            className="bg-amber-900/30 text-amber-300 border-amber-600/30 text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNodeClick(node.id);
                            }}
                          >
                            View
                          </Badge>
                          <ChevronDown size={12} className="text-amber-400 collapsible-icon" />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-2 bg-amber-900/10 rounded border border-amber-600/10 text-xs text-amber-100">
                        <div className="space-y-1 pl-2">
                          <div><span className="text-amber-300">Type:</span> {node.guardrailType}</div>
                          <div><span className="text-amber-300">Action:</span> {node.guardrailAction}</div>
                          <div><span className="text-amber-300">Time:</span> {node.timestamp}</div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
                {guardRailActivations.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-2">
                    No guardrail activations detected
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-beam-dark/70 border border-gray-700/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-white">Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                <span className="text-sm text-white">Optimize Database Queries</span>
              </div>
              <p className="text-xs text-gray-300 mt-1 pl-6">
                Database queries in tool executions could be optimized to reduce latency by ~30%.
              </p>
            </div>
            <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                <span className="text-sm text-white">Enhance Guardrail Precision</span>
              </div>
              <p className="text-xs text-gray-300 mt-1 pl-6">
                Current guardrails have 2 false positives. Consider refining guardrail criteria for better accuracy.
              </p>
            </div>
            <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                <span className="text-sm text-white">Parallelize Tool Execution</span>
              </div>
              <p className="text-xs text-gray-300 mt-1 pl-6">
                Independent tool operations could be executed in parallel to reduce overall task time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Strands Task Configuration Dialog
 * Configure individual tasks in the workflow
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface TaskConfig {
  taskId: string;
  name: string;
  description: string;
  input: string;
  agentId?: string;
  priority: 'low' | 'medium' | 'high';
  timeout: number;
}

interface StrandsTaskConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TaskConfig) => void;
  task?: TaskConfig;
  availableAgents: Array<{ id: string; name: string; }>;
}

export const StrandsTaskConfigDialog: React.FC<StrandsTaskConfigDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  availableAgents
}) => {
  const [config, setConfig] = useState<TaskConfig>({
    taskId: '',
    name: '',
    description: '',
    input: '',
    agentId: '',
    priority: 'medium',
    timeout: 60000
  });

  useEffect(() => {
    if (task) {
      setConfig(task);
    } else {
      setConfig({
        taskId: `task_${Date.now()}`,
        name: '',
        description: '',
        input: '',
        agentId: '',
        priority: 'medium',
        timeout: 60000
      });
    }
  }, [task]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-slate-300">Task Name</Label>
            <Input
              id="name"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter task name..."
              className="bg-slate-600 border-slate-500 text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">Task Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this task should accomplish..."
              rows={3}
              className="bg-slate-600 border-slate-500 text-white"
            />
          </div>

          <div>
            <Label htmlFor="input" className="text-slate-300">Task Input</Label>
            <Textarea
              id="input"
              value={config.input}
              onChange={(e) => setConfig(prev => ({ ...prev, input: e.target.value }))}
              placeholder="Provide the input data or prompt for this task..."
              rows={3}
              className="bg-slate-600 border-slate-500 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-300">Assigned Agent</Label>
            <Select 
              value={config.agentId} 
              onValueChange={(value) => setConfig(prev => ({ ...prev, agentId: value }))}
            >
              <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                <SelectValue placeholder="Select an agent..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="">No specific agent</SelectItem>
                {availableAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Priority</Label>
              <Select 
                value={config.priority} 
                onValueChange={(value: any) => setConfig(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timeout" className="text-slate-300">Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                className="bg-slate-600 border-slate-500 text-white"
              />
            </div>
          </div>

          <div className="bg-slate-700/50 p-3 rounded-lg">
            <Label className="text-slate-300 text-sm">Task Preview</Label>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-slate-500 text-slate-400">
                  ID: {config.taskId}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`border-slate-500 ${
                    config.priority === 'high' ? 'text-red-400' :
                    config.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                  }`}
                >
                  {config.priority.toUpperCase()}
                </Badge>
              </div>
              <p className="text-slate-400">
                {config.description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-500 text-slate-300">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!config.name || !config.description}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const AgentOSArchitectureDesign: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🏗️ Agent OS Architecture Design</h1>
        <p className="text-muted-foreground">
          Design and configure your agent operating system architecture
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Core Components</CardTitle>
            <CardDescription>Essential system building blocks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Agent Runtime</h4>
                <p className="text-sm text-muted-foreground">Execution environment</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Message Bus</h4>
                <p className="text-sm text-muted-foreground">Communication layer</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">State Manager</h4>
                <p className="text-sm text-muted-foreground">System state control</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Points</CardTitle>
            <CardDescription>External system connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">API Gateway</h4>
                <p className="text-sm text-muted-foreground">External API access</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Database Layer</h4>
                <p className="text-sm text-muted-foreground">Data persistence</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Event Stream</h4>
                <p className="text-sm text-muted-foreground">Real-time events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitoring</CardTitle>
            <CardDescription>System health and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Health Checks</h4>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Performance</h4>
                <p className="text-sm text-blue-600">Optimal performance</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold">Alerts</h4>
                <p className="text-sm text-gray-600">No active alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
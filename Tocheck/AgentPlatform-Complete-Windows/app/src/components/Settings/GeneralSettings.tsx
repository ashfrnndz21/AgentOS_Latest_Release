
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings, Moon, Sun } from 'lucide-react';

export const GeneralSettings = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-beam-dark-accent/30 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="h-4 w-4 mr-2 text-blue-400" />
            General Settings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure application-wide settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Theme</Label>
                  <p className="text-gray-400 text-sm">Choose your preferred theme</p>
                </div>
                <Select defaultValue="dark">
                  <SelectTrigger className="w-[180px] bg-beam-dark border-gray-700 text-white">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator className="bg-gray-700/50" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Notifications</Label>
                  <p className="text-gray-400 text-sm">Enable or disable app notifications</p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
            </div>
            
            <Separator className="bg-gray-700/50" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Analytics</Label>
                  <p className="text-gray-400 text-sm">Allow anonymous usage data collection</p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>
            </div>
            
            <Separator className="bg-gray-700/50" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Developer Mode</Label>
                  <p className="text-gray-400 text-sm">Enable advanced features for developers</p>
                </div>
                <Switch id="developer-mode" />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button variant="default">Save Settings</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

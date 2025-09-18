
import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Command, Workflow, ShoppingBag, TrendingUp, Users, Shield, Factory } from "lucide-react";

export const MainContent = () => {
  return (
    <div className="flex-1 p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Air Liquide Agent OS</h1>
        <p className="text-gray-400 mt-2">AI-powered solutions for industrial gas and technology operations</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <Command className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Control Center</h2>
          <p className="text-gray-400 mb-4">Centrally manage all industrial gas and technology AI operations</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/agent-command">Launch Control Center</Link>
          </Button>
        </Card>
        

        
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <Workflow className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Agent Workspace</h2>
          <p className="text-gray-400 mb-4">Interactive environment for industrial AI deployment</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/agent-workspace">Open Workspace</Link>
          </Button>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <Bot className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Multi Agent Workspace</h2>
          <p className="text-gray-400 mb-4">Drag-and-drop builder for multi-agent workflows</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/multi-agent-workspace">Build Workflows</Link>
          </Button>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <ShoppingBag className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">AI Marketplace</h2>
          <p className="text-gray-400 mb-4">Discover industrial gas and technology AI solutions</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/agent-exchange">Browse Marketplace</Link>
          </Button>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Safety Analytics</h2>
          <p className="text-gray-400 mb-4">Advanced safety monitoring and predictive maintenance</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/risk-analytics">Open Risk Analytics</Link>
          </Button>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <Factory className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Operations Insights</h2>
          <p className="text-gray-400 mb-4">Deep operational analytics and process optimization</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/customer-insights">View Insights</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
};

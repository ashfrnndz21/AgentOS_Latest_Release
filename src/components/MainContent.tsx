
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Command, Workflow, ShoppingBag, TrendingUp, Users, Shield, Factory, Brain } from "lucide-react";
import { useIndustry } from "@/contexts/IndustryContext";
// import { SystemOrchestratorModal } from "@/components/A2A/SystemOrchestratorModal";

export const MainContent = () => {
  // const [orchestratorModalOpen, setOrchestratorModalOpen] = useState(false);
  const { currentIndustry } = useIndustry();

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">{currentIndustry.displayName}</h1>
        <p className="text-gray-400 mt-2">{currentIndustry.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <Command className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Network Control Center</h2>
          <p className="text-gray-400 mb-4">Centrally manage all telecommunications network and service AI operations</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/agent-command">Launch Network Control</Link>
          </Button>
        </Card>
        

        
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <Workflow className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Telco Agent Workspace</h2>
          <p className="text-gray-400 mb-4">Interactive environment for telecommunications AI deployment and network management</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/agent-workspace">Open Telco Workspace</Link>
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
          <h2 className="text-xl font-semibold text-white mb-2">Telco AI Marketplace</h2>
          <p className="text-gray-400 mb-4">Discover telecommunications and network AI solutions</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/agent-exchange">Browse Telco Solutions</Link>
          </Button>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Network Analytics</h2>
          <p className="text-gray-400 mb-4">Advanced network monitoring and predictive maintenance for telecommunications infrastructure</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/risk-analytics">Open Network Analytics</Link>
          </Button>
        </Card>
        
        <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-beam-blue/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-beam-dark flex items-center justify-center mb-4">
            <Factory className="h-6 w-6 text-beam-blue" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Customer Experience Insights</h2>
          <p className="text-gray-400 mb-4">Deep customer analytics and service optimization for telecommunications operations</p>
          <Button asChild variant="default" className="w-full bg-beam-blue hover:bg-beam-blue/90">
            <Link to="/customer-insights">View Customer Insights</Link>
          </Button>
        </Card>

        {/* DISABLED: System Orchestrator Card */}
        {/* <Card className="bg-beam-dark-accent border-gray-700 p-6 hover:border-purple-500/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">System Orchestrator</h2>
          <p className="text-gray-400 mb-4">A2A Multi-Agent Query with clean output processing</p>
          <Button 
            onClick={() => setOrchestratorModalOpen(true)}
            variant="default" 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="mr-2 h-4 w-4" />
            Execute A2A Orchestration
          </Button>
        </Card> */}
      </div>

      {/* DISABLED: System Orchestrator Modal */}
      {/* <SystemOrchestratorModal 
        open={orchestratorModalOpen} 
        onOpenChange={setOrchestratorModalOpen} 
      /> */}
    </div>
  );
};

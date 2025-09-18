
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Agents from "./pages/Agents";
import AgentWorkspace from "./pages/AgentWorkspace";
import MultiAgentWorkspace from "./pages/MultiAgentWorkspace";
import CommandCentre from "./pages/CommandCentre";
import WealthManagement from "./pages/WealthManagement";
import CustomerValueManagement from "./pages/CustomerValueManagement";
import CustomerAnalytics from "./pages/CustomerAnalytics";
import { AgentMarketplace } from "./components/AgentMarketplace";
import NetworkTwin from "./pages/NetworkTwin";
import RiskAnalytics from "./pages/RiskAnalytics";
import Auth from "./pages/Auth";
import { GeneralSettings } from "./components/Settings/GeneralSettings";
import { BackendValidation } from "./pages/BackendValidation";

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/agents" element={<Layout><Agents /></Layout>} />
          <Route path="/agent-workspace" element={<Layout><AgentWorkspace /></Layout>} />
          <Route path="/multi-agent-workspace" element={<Layout><MultiAgentWorkspace /></Layout>} />
          <Route path="/agent-command" element={<Layout><CommandCentre /></Layout>} />
          <Route path="/agent-exchange" element={<Layout><AgentMarketplace /></Layout>} />
          <Route path="/risk-analytics" element={<Layout><RiskAnalytics /></Layout>} />
          <Route path="/network-twin" element={<Layout><NetworkTwin /></Layout>} />
          <Route path="/wealth-management" element={<Layout><WealthManagement /></Layout>} />
          <Route path="/customer-insights" element={<Layout><CustomerValueManagement /></Layout>} />
          <Route path="/customer-analytics" element={<Layout><CustomerAnalytics /></Layout>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/settings" element={<Layout><GeneralSettings /></Layout>} />
          <Route path="/backend-validation" element={<Layout><BackendValidation /></Layout>} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner richColors />
    </TooltipProvider>
  );
}

export default App;

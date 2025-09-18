
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Agents from "./pages/Agents";
import MultiAgentWorkspace from "./pages/MultiAgentWorkspace";
import CommandCentre from "./pages/CommandCentre";
import WealthManagement from "./pages/WealthManagement";
import CustomerValueManagement from "./pages/CustomerValueManagement";
import CustomerAnalytics from "./pages/CustomerAnalytics";
import { AgentMarketplace } from "./components/AgentMarketplace";
import NetworkTwin from "./pages/NetworkTwin";
import RiskAnalytics from "./pages/RiskAnalytics";
import Auth from "./pages/Auth";
import Settings from "./pages/SettingsSimple";
import { AgentControlPanel } from "./pages/AgentControlPanel";
import MCPGateway from "./pages/MCPDashboard";
import MCPGatewayTest from "./pages/MCPGatewayTest";
import SystemFlow from "./pages/SystemFlow";
import OllamaTerminal from "./pages/OllamaTerminal";
import DocumentWorkspace from "./pages/DocumentWorkspace";
import OllamaAgentDashboard from "./pages/OllamaAgentDashboard";

import ProcurementAnalytics from "./pages/ProcurementAnalytics";
import SafetyMonitoring from "./pages/SafetyMonitoring";
import RDDiscovery from "./pages/RDDiscovery";
import TalentManagement from "./pages/TalentManagement";
import { ErrorBoundary } from "./components/ErrorBoundary";


function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/agents" element={<Layout><Agents /></Layout>} />
          <Route path="/multi-agent-workspace" element={<Layout><MultiAgentWorkspace /></Layout>} />
          <Route path="/agent-command" element={<Layout><CommandCentre /></Layout>} />
          <Route path="/agent-exchange" element={<Layout><AgentMarketplace /></Layout>} />
          <Route path="/risk-analytics" element={<Layout><RiskAnalytics /></Layout>} />
          <Route path="/network-twin" element={<Layout><NetworkTwin /></Layout>} />
          <Route path="/wealth-management" element={<Layout><WealthManagement /></Layout>} />
          <Route path="/customer-insights" element={<Layout><CustomerValueManagement /></Layout>} />
          <Route path="/customer-analytics" element={<Layout><CustomerAnalytics /></Layout>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/agent-control" element={<Layout><AgentControlPanel /></Layout>} />
          <Route path="/mcp-dashboard" element={<Layout><MCPGateway /></Layout>} />
          <Route path="/mcp-test" element={<Layout><MCPGatewayTest /></Layout>} />
          <Route path="/system-flow" element={<Layout><SystemFlow /></Layout>} />
          <Route path="/ollama-terminal" element={<Layout><OllamaTerminal /></Layout>} />
          <Route path="/document-workspace" element={<Layout><DocumentWorkspace /></Layout>} />
          <Route path="/ollama-agents" element={<Layout><ErrorBoundary><OllamaAgentDashboard /></ErrorBoundary></Layout>} />
          <Route path="/procurement-analytics" element={<Layout><ProcurementAnalytics /></Layout>} />
          <Route path="/safety-monitoring" element={<Layout><SafetyMonitoring /></Layout>} />
          <Route path="/rd-discovery" element={<Layout><RDDiscovery /></Layout>} />
          <Route path="/talent-management" element={<Layout><TalentManagement /></Layout>} />

        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner richColors />
    </TooltipProvider>
  );
}

export default App;

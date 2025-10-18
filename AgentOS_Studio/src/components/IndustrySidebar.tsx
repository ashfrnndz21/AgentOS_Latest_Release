import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bot, Command, Workflow, ShoppingBag, TrendingUp, Settings, Users, 
  Globe, Heart, CreditCard, Smartphone, Building2, ChevronDown, ChevronRight, Activity, Network, Server, Terminal, FileText, Shield, FlaskConical
} from 'lucide-react';
import { 
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { IndustryBanner } from './IndustryBanner';
import { useIndustry } from '@/contexts/IndustryContext';

const iconMap = {
  Command,
  Bot,
  Workflow,
  ShoppingBag,
  TrendingUp,
  Users,
  Settings,
  Globe,
  Heart,
  CreditCard,
  Smartphone,
  Building2,
  ChevronDown,
  ChevronRight,
  Activity,
  Network,
  Server,
  Terminal,
  FileText,
  Shield,
  FlaskConical
};

interface NavigationGroup {
  id: string;
  label: string;
  icon: string;
  items: {
    path: string;
    label: string;
    icon: string;
  }[];
}

export function IndustrySidebar() {
  const location = useLocation();
  const { currentIndustry } = useIndustry();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['core']));
  
  const isActive = (path: string) => location.pathname === path;

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Fixed 4 navigation groups
  const navigationGroups: NavigationGroup[] = [
    {
      id: 'core',
      label: 'Core Platform',
      icon: 'Command',
      items: [
        { path: '/', label: 'Dashboard', icon: 'Command' },
        { path: '/system-flow', label: 'AgentOS Architecture Blueprint', icon: 'Network' },
        { path: '/agent-command', label: 'Agent Command Centre', icon: 'Command' },
        { path: '/multi-agent-workspace', label: 'Multi Agent Workspace', icon: 'Bot' },
        { path: '/document-workspace', label: 'Document Chat', icon: 'FileText' },
        { path: '/ollama-agents', label: 'Telco Agents', icon: 'Bot' },
        { path: '/ollama-terminal', label: 'Telco Terminal', icon: 'Terminal' },
        { path: '/mcp-dashboard', label: 'MCP Gateway', icon: 'Server' },
        { path: '/agent-exchange', label: 'AI Marketplace', icon: 'ShoppingBag' }
      ]
    },
    {
      id: 'use-cases',
      label: 'Agent Use Cases',
      icon: 'TrendingUp',
      items: currentIndustry.id === 'banking' ? [
        { path: '/risk-analytics', label: 'Risk Analytics', icon: 'TrendingUp' },
        { path: '/wealth-management', label: 'Wealth Management', icon: 'TrendingUp' },
        { path: '/customer-insights', label: 'Customer Insights', icon: 'Users' }
      ] : currentIndustry.id === 'telco' ? [
        { path: '/network-twin', label: 'Network Twin', icon: 'Globe' },
        { path: '/customer-analytics', label: 'Customer Analytics', icon: 'Users' }
      ] : currentIndustry.id === 'industrial' ? [
        { path: '/procurement-analytics', label: 'Procurement Analytics', icon: 'TrendingUp' },
        { path: '/safety-monitoring', label: 'Safety Monitoring', icon: 'Shield' },
        { path: '/rd-discovery', label: 'R&D Discovery', icon: 'FlaskConical' },
        { path: '/talent-management', label: 'Talent Management', icon: 'Users' }
      ] : currentIndustry.id === 'healthcare' ? [
        { path: '/patient-analytics', label: 'Patient Analytics', icon: 'TrendingUp' },
        { path: '/care-management', label: 'Care Management', icon: 'Users' }
      ] : [
        { path: '/procurement-analytics', label: 'Procurement Analytics', icon: 'TrendingUp' },
        { path: '/safety-monitoring', label: 'Safety Monitoring', icon: 'Shield' },
        { path: '/rd-discovery', label: 'R&D Discovery', icon: 'FlaskConical' },
        { path: '/talent-management', label: 'Talent Management', icon: 'Users' }
      ]
    },
    {
      id: 'monitoring',
      label: 'Monitoring & Control',
      icon: 'Activity',
      items: [
        { path: '/agent-control', label: 'AgentCore Observability', icon: 'Activity' }
      ]
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: 'Settings',
      items: [
        { path: '/settings', label: 'Settings', icon: 'Settings' }
      ]
    }
  ];

  return (
    <SidebarComponent style={{ borderColor: currentIndustry.borderColor }}>
      <SidebarContent className="bg-black text-white">
        <SidebarHeader 
          className="border-b pb-4"
          style={{ borderColor: currentIndustry.borderColor }}
        >
          <Link to="/" className="px-4">
            <IndustryBanner />
          </Link>
        </SidebarHeader>
        
        <SidebarMenu className="space-y-2 p-2">
          {navigationGroups.map((group) => {
            const GroupIcon = iconMap[group.icon as keyof typeof iconMap] || Command;
            const isExpanded = expandedGroups.has(group.id);
            const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
            
            return (
              <div key={group.id} className="space-y-1">
                {/* Group Header */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => toggleGroup(group.id)}
                    className="hover:bg-white/10 hover:text-white rounded-lg text-gray-300 cursor-pointer transition-colors"
                  >
                    <GroupIcon style={{ color: currentIndustry.primaryColor }} />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronIcon className="w-4 h-4 text-gray-400" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {/* Group Items */}
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {group.items.map((item) => {
                      const ItemIcon = iconMap[item.icon as keyof typeof iconMap] || Command;
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton 
                            asChild 
                            className={`hover:bg-white/10 hover:text-white rounded-lg transition-colors ${
                              isActive(item.path) ? 'text-white' : 'text-gray-400'
                            }`}
                            style={{
                              backgroundColor: isActive(item.path) ? currentIndustry.primaryColor : 'transparent'
                            }}
                          >
                            <Link to={item.path}>
                              <ItemIcon 
                                className="w-4 h-4"
                                style={{ 
                                  color: isActive(item.path) ? 'white' : currentIndustry.primaryColor 
                                }} 
                              />
                              <span className="text-sm">{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </SidebarMenu>
        
        <SidebarFooter 
          className="text-xs text-gray-400 border-t pt-4"
          style={{ borderColor: currentIndustry.borderColor }}
        >
          &copy; {new Date().getFullYear()} {currentIndustry.displayName}
        </SidebarFooter>
      </SidebarContent>
    </SidebarComponent>
  );
}
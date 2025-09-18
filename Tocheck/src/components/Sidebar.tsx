
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Command, Workflow, ShoppingBag, TrendingUp, Settings, Users, CreditCard, Globe, Server, Activity, Network, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { 
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { BankingBanner } from './BankingBanner';
import { useIndustry } from '@/contexts/IndustryContext';

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

export function Sidebar() {
  const location = useLocation();
  const { currentIndustry } = useIndustry();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['core', 'use-cases', 'monitoring', 'configuration']));
  
  const isActive = (path: string) => location.pathname === path;
  
  // Debug log to ensure this component is being used
  console.log('Sidebar rendering with grouped navigation');

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Command,
      Bot,
      Workflow,
      ShoppingBag,
      TrendingUp,
      Settings,
      Users,
      CreditCard,
      Globe,
      Server,
      Activity,
      Network,
      ChevronDown,
      ChevronRight,
      FileText
    };
    return icons[iconName] || Command;
  };

  const primaryColorClass = currentIndustry.id === 'banking' ? 'text-true-red' : 
                            currentIndustry.id === 'telco' ? 'text-blue-500' : 
                            'text-green-500';

  const hoverColorClass = currentIndustry.id === 'banking' ? 'hover:bg-true-red/20' : 
                          currentIndustry.id === 'telco' ? 'hover:bg-blue-500/20' : 
                          'hover:bg-green-500/20';

  const activeColorClass = currentIndustry.id === 'banking' ? 'bg-true-red' : 
                           currentIndustry.id === 'telco' ? 'bg-blue-500' : 
                           'bg-green-500';

  const borderColorClass = currentIndustry.id === 'banking' ? 'border-true-red/30' : 
                           currentIndustry.id === 'telco' ? 'border-blue-500/30' : 
                           'border-green-500/30';

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Fixed 4 navigation groups - hardcoded to ensure they show
  const navigationGroups: NavigationGroup[] = [
    {
      id: 'core',
      label: 'Core Platform',
      icon: 'Command',
      items: [
        { path: '/', label: 'Dashboard', icon: 'Command' },
        { path: '/agent-command', label: 'Agent Command Centre', icon: 'Command' },
        { path: '/documents', label: '📄 Agentic RAG', icon: 'FileText' },
        { path: '/agents', label: 'AI Agents', icon: 'Bot' },
        { path: '/strands-ollama-agents', label: '🧠 Strands-Ollama Agents', icon: 'Bot' },
        { path: '/multi-agent-workspace', label: 'Multi Agent Workspace', icon: 'Bot' },
        { path: '/ollama-terminal', label: '🔥 OLLAMA TERMINAL 🔥', icon: 'Command' },
        { path: '/mcp-dashboard', label: 'MCP Gateway', icon: 'Server' },
        { path: '/agent-exchange', label: 'AI Marketplace', icon: 'ShoppingBag' }
      ]
    },
    {
      id: 'use-cases',
      label: 'Agent Use Cases',
      icon: 'TrendingUp',
      items: [
        { path: '/risk-analytics', label: 'Risk Analytics', icon: 'TrendingUp' },
        { path: '/wealth-management', label: 'Wealth Management', icon: 'TrendingUp' },
        { path: '/customer-insights', label: 'Customer Insights', icon: 'Users' }
      ]
    },
    {
      id: 'monitoring',
      label: 'Monitoring & Control',
      icon: 'Activity',
      items: [
        { path: '/agent-control', label: 'Agent Control Panel', icon: 'Activity' },
        { path: '/system-flow', label: 'AgentOS Architecture Blueprint', icon: 'Network' }
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
    <SidebarComponent className={`border-r ${borderColorClass}`} key="grouped-sidebar">
      <SidebarContent className="bg-black text-white">
        <SidebarHeader className={`border-b ${borderColorClass} pb-4`}>
          <Link to="/" className="px-4">
            <BankingBanner />
          </Link>
        </SidebarHeader>
        
        <SidebarMenu className="space-y-2 p-2">
          {navigationGroups.map((group) => {
            const GroupIcon = getIconComponent(group.icon);
            const isExpanded = expandedGroups.has(group.id);
            const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
            
            return (
              <div key={group.id} className="space-y-1">
                {/* Group Header */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => toggleGroup(group.id)}
                    className={`${hoverColorClass} hover:text-white rounded-lg text-gray-300 cursor-pointer`}
                  >
                    <GroupIcon className={primaryColorClass} />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronIcon className="w-4 h-4 text-gray-400" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {/* Group Items */}
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {group.items.map((item) => {
                      const ItemIcon = getIconComponent(item.icon);
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton 
                            asChild 
                            className={`${hoverColorClass} hover:text-white rounded-lg ${
                              isActive(item.path) ? `${activeColorClass} text-white` : 'text-gray-400'
                            }`}
                          >
                            <Link to={item.path}>
                              <ItemIcon className={`w-4 h-4 ${primaryColorClass}`} />
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
        
        <SidebarFooter className={`text-xs text-gray-400 border-t ${borderColorClass} pt-4`}>
          &copy; {new Date().getFullYear()} {currentIndustry.displayName}
        </SidebarFooter>
      </SidebarContent>
    </SidebarComponent>
  );
}

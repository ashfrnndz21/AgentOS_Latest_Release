
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Command, Workflow, ShoppingBag, TrendingUp, Settings, Users, CreditCard, Globe } from 'lucide-react';
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

export function Sidebar() {
  const location = useLocation();
  const { currentIndustry } = useIndustry();
  const isActive = (path: string) => location.pathname === path;

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
      Globe
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

  return (
    <SidebarComponent className={`border-r ${borderColorClass}`}>
      <SidebarContent className="bg-black text-white">
        <SidebarHeader className={`border-b ${borderColorClass} pb-4`}>
          <Link to="/" className="px-4">
            <BankingBanner />
          </Link>
        </SidebarHeader>
        
        <SidebarMenu className="space-y-1 p-2">
          {currentIndustry.navigation.map((item) => {
            const IconComponent = getIconComponent(item.icon);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  className={`${hoverColorClass} hover:text-white rounded-lg ${
                    isActive(item.path) ? `${activeColorClass} text-white` : 'text-gray-300'
                  }`}
                >
                  <Link to={item.path}>
                    <IconComponent className={primaryColorClass} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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

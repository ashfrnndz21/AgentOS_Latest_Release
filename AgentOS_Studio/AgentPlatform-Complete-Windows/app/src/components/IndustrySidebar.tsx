import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bot, Command, Workflow, ShoppingBag, TrendingUp, Settings, Users, 
  Globe, Heart, CreditCard, Smartphone, Building2 
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
};

export function IndustrySidebar() {
  const location = useLocation();
  const { currentIndustry } = useIndustry();
  const isActive = (path: string) => location.pathname === path;

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
        
        <SidebarMenu className="space-y-1 p-2">
          {currentIndustry.navigation.map((navItem) => {
            const IconComponent = iconMap[navItem.icon as keyof typeof iconMap] || Command;
            
            return (
              <SidebarMenuItem key={navItem.path}>
                <SidebarMenuButton 
                  asChild 
                  className={`hover:bg-white/10 hover:text-white rounded-lg transition-colors ${
                    isActive(navItem.path) 
                      ? 'text-white' 
                      : 'text-gray-300'
                  }`}
                  style={{
                    backgroundColor: isActive(navItem.path) ? currentIndustry.primaryColor : 'transparent'
                  }}
                >
                  <Link to={navItem.path}>
                    <IconComponent 
                      style={{ 
                        color: isActive(navItem.path) ? 'white' : currentIndustry.primaryColor 
                      }} 
                    />
                    <span>{navItem.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
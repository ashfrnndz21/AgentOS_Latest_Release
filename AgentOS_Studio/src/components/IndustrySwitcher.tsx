import React from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { ChevronDown, Building2, Smartphone, Heart, Factory } from 'lucide-react';
import { useIndustry } from '@/contexts/IndustryContext';

const industryIcons = {
  banking: Building2,
  telco: Smartphone,
  healthcare: Heart,
  industrial: Factory,
};

export const IndustrySwitcher: React.FC = () => {
  const { currentIndustry, availableIndustries, setIndustry } = useIndustry();

  const handleIndustryChange = (industry: any) => {
    setIndustry(industry);
  };

  const CurrentIcon = industryIcons[currentIndustry.id as keyof typeof industryIcons] || Building2;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-white hover:bg-white/10 border border-white/20"
        >
          <CurrentIcon className="h-4 w-4" style={{ color: currentIndustry.primaryColor }} />
          <span className="hidden sm:inline">{currentIndustry.displayName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-black/90 border-white/20">
        <div className="px-3 py-2 text-sm text-gray-400">
          Switch Industry
        </div>
        <DropdownMenuSeparator className="bg-white/20" />
        {availableIndustries.map((industry) => {
          const Icon = industryIcons[industry.id as keyof typeof industryIcons] || Building2;
          const isActive = currentIndustry.id === industry.id;
          
          return (
            <DropdownMenuItem
              key={industry.id}
              onClick={() => handleIndustryChange(industry)}
              className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-white/10 ${
                isActive ? 'bg-white/5' : ''
              }`}
            >
              <Icon 
                className="h-5 w-5 mt-0.5 flex-shrink-0" 
                style={{ color: industry.primaryColor }} 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{industry.displayName}</span>
                  {isActive && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: industry.primaryColor }}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                  {industry.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
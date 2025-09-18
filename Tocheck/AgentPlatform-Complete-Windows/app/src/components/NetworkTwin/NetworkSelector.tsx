import { useState } from 'react';
import { ChevronDown, Network, MapPin, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { networkDatasets, type CellSite } from './data/networkTwinData';

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkChange: (networkKey: string) => void;
}

export function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentNetwork = networkDatasets[selectedNetwork as keyof typeof networkDatasets];
  
  const getNetworkStats = (networkKey: string) => {
    const network = networkDatasets[networkKey as keyof typeof networkDatasets];
    const sites = network.cellSites as CellSite[];
    return {
      totalSites: sites.length,
      activeSites: sites.filter(site => site.status === 'active').length,
      totalCustomers: sites.reduce((sum, site) => sum + site.customers, 0),
      avgPerformance: Math.round(sites.reduce((sum, site) => sum + site.performanceScore, 0) / sites.length)
    };
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="h-5 w-5 text-primary" />
          Network Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-background"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {currentNetwork.name}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[300px] bg-background border border-border" align="start">
            {Object.entries(networkDatasets).map(([key, network]) => {
              const stats = getNetworkStats(key);
              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => {
                    onNetworkChange(key);
                    setIsOpen(false);
                  }}
                  className="cursor-pointer p-3 focus:bg-muted"
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{network.name}</span>
                      {selectedNetwork === key && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{stats.totalSites} sites</span>
                      <span>{stats.totalCustomers.toLocaleString()} customers</span>
                      <span>{stats.avgPerformance}% avg performance</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Stats for Selected Network */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Total Sites</div>
            <div className="text-lg font-semibold">{getNetworkStats(selectedNetwork).totalSites}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Active Sites</div>
            <div className="text-lg font-semibold text-green-500">
              {getNetworkStats(selectedNetwork).activeSites}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Customers</div>
            <div className="text-lg font-semibold">
              {getNetworkStats(selectedNetwork).totalCustomers.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1 flex items-center gap-1">
            <div>
              <div className="text-xs text-muted-foreground">Performance</div>
              <div className="text-lg font-semibold flex items-center gap-1">
                {getNetworkStats(selectedNetwork).avgPerformance}%
                <Activity className="h-3 w-3 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { 
  Radio, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
  Wrench,
  Signal
} from 'lucide-react';
import { CellSite } from '../data/networkTwinData';

interface SiteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteData: CellSite;
  onOptimize?: (siteId: string) => void;
  onMaintenance?: (siteId: string) => void;
}

export const SiteDetailModal: React.FC<SiteDetailModalProps> = ({
  isOpen,
  onClose,
  siteData,
  onOptimize,
  onMaintenance
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Signal className="h-4 w-4 text-green-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-yellow-500" />;
      case 'inactive': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Signal className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getCongestionColor = (congestion: number) => {
    if (congestion > 0.8) return 'text-red-400';
    if (congestion > 0.6) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-beam-dark border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
            <Radio className="h-6 w-6 text-ptt-blue" />
            {siteData.name}
            <Badge className={`ml-2 ${getStatusColor(siteData.status)}`}>
              {siteData.status.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Site Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Site Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm text-gray-400">Site ID:</span>
                    <span className="text-sm font-medium text-white">{siteData.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm text-gray-400">Type:</span>
                    <span className="text-sm font-medium text-white capitalize">{siteData.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm text-gray-400">Technology:</span>
                    <Badge variant="outline" className="text-xs">{siteData.technology}</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-400">District:</span>
                    <span className="text-sm font-medium text-white ml-2">{siteData.district}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Region:</span>
                    <span className="text-sm font-medium text-white ml-2">{siteData.region}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Coordinates:</span>
                    <span className="text-sm font-medium text-white ml-2">
                      {siteData.coordinates[1].toFixed(4)}, {siteData.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">Congestion Level</span>
                      <span className={`text-sm font-bold ${getCongestionColor(siteData.congestion)}`}>
                        {Math.round(siteData.congestion * 100)}%
                      </span>
                    </div>
                    <Progress value={siteData.congestion * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">Capacity Utilization</span>
                      <span className="text-sm font-medium text-white">
                        {siteData.utilization}/{siteData.capacity}
                      </span>
                    </div>
                    <Progress value={(siteData.utilization / siteData.capacity) * 100} className="h-2" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">Performance Score</span>
                      <span className="text-sm font-bold text-ptt-blue">
                        {siteData.performanceScore}/100
                      </span>
                    </div>
                    <Progress value={siteData.performanceScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">Churn Rate</span>
                      <span className="text-sm font-medium text-red-400">
                        {(siteData.churnRate * 100).toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={siteData.churnRate * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Business Metrics */}
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Business Impact</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-beam-dark-accent/30 p-3 rounded-lg text-center">
                  <Users className="h-6 w-6 text-ptt-blue mx-auto mb-2" />
                  <div className="text-sm text-gray-400">Active Customers</div>
                  <div className="text-lg font-bold text-white">{siteData.customers.toLocaleString()}</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-3 rounded-lg text-center">
                  <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-400">Monthly Revenue</div>
                  <div className="text-lg font-bold text-white">{formatCurrency(siteData.revenue)}</div>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-3 rounded-lg text-center">
                  <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-400">Avg ARPU</div>
                  <div className="text-lg font-bold text-white">{formatCurrency(siteData.avgArpu)}</div>
                </div>
              </div>
            </Card>

            {/* Issues & Alerts */}
            {siteData.issues.length > 0 && (
              <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Active Issues
                </h3>
                <div className="space-y-2">
                  {siteData.issues.map((issue, index) => (
                    <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
                      <p className="text-sm text-yellow-200">{issue}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Maintenance & Actions */}
          <div className="space-y-6">
            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Maintenance Schedule</h3>
              <div className="space-y-4">
                <div className="bg-beam-dark-accent/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm font-medium text-white">Last Maintenance</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {new Date(siteData.lastMaintenance).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-beam-dark-accent/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-ptt-blue" />
                    <span className="text-sm font-medium text-white">Next Scheduled</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {new Date(siteData.nextMaintenance).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => onOptimize?.(siteData.id)}
                  className="w-full bg-ptt-blue hover:bg-blue-700"
                  disabled={siteData.status !== 'active'}
                >
                  Optimize Performance
                </Button>
                
                <Button 
                  onClick={() => onMaintenance?.(siteData.id)}
                  variant="outline" 
                  className="w-full border-gray-600 text-white hover:bg-gray-700"
                >
                  Schedule Maintenance
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-white hover:bg-gray-700"
                >
                  View Analytics
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-white hover:bg-gray-700"
                >
                  Generate Report
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-beam-dark-accent/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Site Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Overall Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(siteData.status)}
                    <span className="text-sm text-white capitalize">{siteData.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Alert Level</span>
                  <span className={`text-sm font-medium ${
                    siteData.issues.length > 0 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {siteData.issues.length > 0 ? 'Attention Needed' : 'Normal'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Efficiency</span>
                  <span className="text-sm font-medium text-white">
                    {Math.round((siteData.revenue / siteData.customers) * 100) / 100}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
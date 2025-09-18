import React from 'react';
import { X, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ComplianceMonitorProps {
  nodes: any[];
  edges: any[];
  metrics: {
    complianceScore: number;
    riskLevel: string;
    auditReadiness: number;
    performanceScore: number;
  };
  onClose: () => void;
}

export const ComplianceMonitor: React.FC<ComplianceMonitorProps> = ({
  nodes,
  edges,
  metrics,
  onClose,
}) => {
  const complianceChecks = [
    {
      name: 'KYC Compliance',
      status: 'compliant',
      score: 95,
      description: 'Customer identification and verification processes',
    },
    {
      name: 'AML Monitoring',
      status: 'compliant',
      score: 92,
      description: 'Anti-money laundering transaction monitoring',
    },
    {
      name: 'Data Privacy (GDPR)',
      status: 'warning',
      score: 78,
      description: 'Personal data protection and privacy compliance',
    },
    {
      name: 'Risk Assessment',
      status: 'compliant',
      score: 88,
      description: 'Credit and operational risk evaluation',
    },
    {
      name: 'Audit Trail',
      status: 'compliant',
      score: 96,
      description: 'Transaction logging and audit readiness',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'non-compliant': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'non-compliant': return X;
      default: return Clock;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-[800px] max-h-[600px] bg-beam-dark-accent border-gray-700 text-white">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-semibold">Compliance Monitor</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[500px]">
          {/* Overall Compliance Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Overall Compliance Score</h3>
              <span className="text-2xl font-bold text-green-400">{metrics.complianceScore}%</span>
            </div>
            <Progress value={metrics.complianceScore} className="h-2" />
          </div>
          
          {/* Compliance Checks */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Compliance Checks</h3>
            {complianceChecks.map((check, index) => {
              const StatusIcon = getStatusIcon(check.status);
              return (
                <Card key={index} className="p-4 bg-beam-dark border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <StatusIcon className={`h-5 w-5 mt-0.5 ${getStatusColor(check.status)}`} />
                      <div>
                        <h4 className="font-medium text-white">{check.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{check.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={`mb-2 ${
                          check.status === 'compliant' ? 'bg-green-900/30 text-green-300 border-green-600' :
                          check.status === 'warning' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-600' :
                          'bg-red-900/30 text-red-300 border-red-600'
                        }`}
                      >
                        {check.status}
                      </Badge>
                      <div className="text-sm font-medium text-white">{check.score}%</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Regulatory Framework */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Regulatory Frameworks</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-beam-dark border-gray-700">
                <h4 className="font-medium text-white mb-2">Banking Regulations</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>• Basel III Capital Requirements</div>
                  <div>• Dodd-Frank Act Compliance</div>
                  <div>• CCAR Stress Testing</div>
                </div>
              </Card>
              <Card className="p-4 bg-beam-dark border-gray-700">
                <h4 className="font-medium text-white mb-2">Data Protection</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>• GDPR Privacy Rights</div>
                  <div>• PCI DSS Security Standards</div>
                  <div>• SOX Financial Reporting</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
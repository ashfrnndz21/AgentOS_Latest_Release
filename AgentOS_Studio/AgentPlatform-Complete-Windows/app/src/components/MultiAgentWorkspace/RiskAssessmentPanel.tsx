import React from 'react';
import { X, TrendingUp, AlertTriangle, Target, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RiskAssessmentPanelProps {
  workflow: {
    nodes: any[];
    edges: any[];
  };
  onClose: () => void;
}

export const RiskAssessmentPanel: React.FC<RiskAssessmentPanelProps> = ({
  workflow,
  onClose,
}) => {
  const riskCategories = [
    {
      name: 'Credit Risk',
      level: 'Low',
      score: 25,
      description: 'Risk of financial loss from borrower default',
      factors: ['Payment History', 'Debt-to-Income Ratio', 'Credit Utilization'],
    },
    {
      name: 'Operational Risk',
      level: 'Medium',
      score: 45,
      description: 'Risk from internal processes and systems',
      factors: ['System Downtime', 'Human Error', 'Process Failures'],
    },
    {
      name: 'Market Risk',
      level: 'Low',
      score: 30,
      description: 'Risk from market price fluctuations',
      factors: ['Interest Rate Changes', 'Currency Fluctuation', 'Market Volatility'],
    },
    {
      name: 'Liquidity Risk',
      level: 'Low',
      score: 20,
      description: 'Risk of inability to meet financial obligations',
      factors: ['Cash Flow', 'Asset Liquidity', 'Funding Sources'],
    },
    {
      name: 'Compliance Risk',
      level: 'High',
      score: 65,
      description: 'Risk of regulatory violations and penalties',
      factors: ['Regulatory Changes', 'Policy Violations', 'Audit Findings'],
    },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-400 bg-green-900/30 border-green-600';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600';
      case 'High': return 'text-red-400 bg-red-900/30 border-red-600';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-600';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Low': return Shield;
      case 'Medium': return Target;
      case 'High': return AlertTriangle;
      default: return TrendingUp;
    }
  };

  const overallRiskScore = Math.round(
    riskCategories.reduce((sum, cat) => sum + cat.score, 0) / riskCategories.length
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-[900px] max-h-[700px] bg-beam-dark-accent border-gray-700 text-white">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold">Risk Assessment</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[600px]">
          {/* Overall Risk Score */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Overall Risk Score</h3>
              <span className={`text-2xl font-bold ${
                overallRiskScore <= 30 ? 'text-green-400' :
                overallRiskScore <= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {overallRiskScore}/100
              </span>
            </div>
            <Progress value={overallRiskScore} className="h-2" />
            <p className="text-sm text-gray-400 mt-2">
              Based on {riskCategories.length} risk categories and {workflow.nodes.length} workflow nodes
            </p>
          </div>
          
          {/* Risk Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Risk Categories</h3>
            {riskCategories.map((risk, index) => {
              const RiskIcon = getRiskIcon(risk.level);
              return (
                <Card key={index} className="p-4 bg-beam-dark border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <RiskIcon className={`h-5 w-5 mt-0.5 ${getRiskColor(risk.level).split(' ')[0]}`} />
                      <div>
                        <h4 className="font-medium text-white">{risk.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{risk.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getRiskColor(risk.level)}>
                        {risk.level} Risk
                      </Badge>
                      <div className="text-sm font-medium text-white mt-1">{risk.score}/100</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Progress value={risk.score} className="h-1.5 mb-2" />
                    <div className="flex flex-wrap gap-1">
                      {risk.factors.map((factor, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs text-gray-400 border-gray-600">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Risk Mitigation */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Risk Mitigation Strategies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-beam-dark border-gray-700">
                <h4 className="font-medium text-white mb-2">Automated Controls</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>• Real-time transaction monitoring</div>
                  <div>• Automated compliance checks</div>
                  <div>• Risk scoring algorithms</div>
                  <div>• Alert threshold management</div>
                </div>
              </Card>
              <Card className="p-4 bg-beam-dark border-gray-700">
                <h4 className="font-medium text-white mb-2">Manual Oversight</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>• Regular audit reviews</div>
                  <div>• Exception handling processes</div>
                  <div>• Senior management approval</div>
                  <div>• External risk assessments</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
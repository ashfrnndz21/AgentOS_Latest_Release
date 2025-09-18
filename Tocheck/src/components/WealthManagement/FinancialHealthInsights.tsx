
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, TrendingUp, AlertTriangle, CheckCircle, DollarSign, CreditCard, PiggyBank } from 'lucide-react';

export const FinancialHealthInsights = () => {
  const healthMetrics = {
    overallScore: 85,
    emergencyFund: { current: 28000, target: 30000, score: 93 },
    debtToIncome: { current: 22, target: 30, score: 88 },
    savingsRate: { current: 18, target: 15, score: 95 },
    creditScore: { current: 742, target: 750, score: 82 }
  };

  const opportunities = [
    {
      id: 1,
      title: 'Mortgage Refinancing Opportunity',
      description: 'Current rates are 0.4% lower than your existing mortgage',
      savings: '$180/month',
      effort: 'Medium',
      timeframe: '30-45 days',
      priority: 'high',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      id: 2,
      title: 'Credit Utilization Optimization',
      description: 'Reduce credit utilization from 35% to under 30% to boost credit score',
      savings: '+15 credit score points',
      effort: 'Low',
      timeframe: '1-2 months',
      priority: 'medium',
      icon: CreditCard,
      color: 'text-blue-400'
    },
    {
      id: 3,
      title: 'High-Yield Savings Account',
      description: 'Move emergency fund to account earning 4.5% APY vs current 0.5%',
      savings: '$92/month in interest',
      effort: 'Low',
      timeframe: '1 week',
      priority: 'medium',
      icon: PiggyBank,
      color: 'text-amber-400'
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-900/20 text-red-300 border-red-700/30">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-amber-900/20 text-amber-300 border-amber-700/30">Medium Priority</Badge>;
      case 'low':
        return <Badge className="bg-blue-900/20 text-blue-300 border-blue-700/30">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="bg-beam-dark-accent/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Heart className="mr-2 h-5 w-5 text-true-red" />
            Financial Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-green-400">{healthMetrics.overallScore}/100</p>
              <p className="text-sm text-gray-400">Excellent financial health</p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-900/20 text-green-300 border-green-700/30 mb-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3 points this month
              </Badge>
            </div>
          </div>
          <Progress value={healthMetrics.overallScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Health Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Emergency Fund</h4>
              <span className={`text-lg font-bold ${getScoreColor(healthMetrics.emergencyFund.score)}`}>
                {healthMetrics.emergencyFund.score}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              ${healthMetrics.emergencyFund.current.toLocaleString()} / ${healthMetrics.emergencyFund.target.toLocaleString()}
            </p>
            <Progress value={(healthMetrics.emergencyFund.current / healthMetrics.emergencyFund.target) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Debt-to-Income</h4>
              <span className={`text-lg font-bold ${getScoreColor(healthMetrics.debtToIncome.score)}`}>
                {healthMetrics.debtToIncome.score}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              {healthMetrics.debtToIncome.current}% (Target: under {healthMetrics.debtToIncome.target}%)
            </p>
            <Progress value={100 - (healthMetrics.debtToIncome.current / healthMetrics.debtToIncome.target) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Savings Rate</h4>
              <span className={`text-lg font-bold ${getScoreColor(healthMetrics.savingsRate.score)}`}>
                {healthMetrics.savingsRate.score}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              {healthMetrics.savingsRate.current}% (Target: {healthMetrics.savingsRate.target}%+)
            </p>
            <Progress value={(healthMetrics.savingsRate.current / 20) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-beam-dark-accent/70 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Credit Score</h4>
              <span className={`text-lg font-bold ${getScoreColor(healthMetrics.creditScore.score)}`}>
                {healthMetrics.creditScore.score}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              {healthMetrics.creditScore.current} (Target: {healthMetrics.creditScore.target}+)
            </p>
            <Progress value={(healthMetrics.creditScore.current / 850) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Optimization Opportunities */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <AlertTriangle className="mr-2 h-6 w-6 text-true-red" />
          Optimization Opportunities
        </h3>

        {opportunities.map((opportunity) => {
          const IconComponent = opportunity.icon;
          return (
            <Card key={opportunity.id} className="bg-beam-dark-accent/70 border-gray-700 hover:border-true-red/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-beam-dark-accent/50">
                      <IconComponent className={`h-5 w-5 ${opportunity.color}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{opportunity.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{opportunity.description}</p>
                    </div>
                  </div>
                  {getPriorityBadge(opportunity.priority)}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Potential Savings</p>
                    <p className="text-lg font-bold text-green-400">{opportunity.savings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Effort Required</p>
                    <p className="text-lg font-bold text-white">{opportunity.effort}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Timeframe</p>
                    <p className="text-lg font-bold text-white">{opportunity.timeframe}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700/50">
                    Learn More
                  </Button>
                  <Button className="bg-true-red hover:bg-true-red/90 text-white">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Take Action
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Proactive Alerts */}
      <Alert className="bg-blue-900/20 border-blue-700/30">
        <AlertTriangle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <strong>Proactive Alert:</strong> Your credit utilization increased to 35% this month. 
          Consider paying down $2,000 in credit card debt to improve your score and reduce interest costs.
        </AlertDescription>
      </Alert>
    </div>
  );
};

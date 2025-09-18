import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  TrendingUp, 
  Search,
  FileText,
  Calendar,
  MapPin,
  Star,
  Award,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Brain,
  Zap,
  BarChart3
} from 'lucide-react';

const TalentManagement = () => {
  const [activeTab, setActiveTab] = useState('sourcing');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const talentMetrics = {
    totalCandidates: 1247,
    activeRecruitment: 23,
    placementRate: 87,
    averageTimeToHire: 45,
    employeeSatisfaction: 94,
    retentionRate: 91
  };

  const openPositions = [
    {
      id: 'HYD-001',
      title: 'Senior Hydrogen Process Engineer',
      department: 'Large Industries',
      location: 'Düsseldorf, Germany',
      level: 'Senior',
      urgency: 'High',
      applicants: 34,
      status: 'Active Screening',
      requirements: ['PhD in Chemical Engineering', '8+ years hydrogen experience', 'Process optimization expertise'],
      salaryRange: '€85,000 - €110,000'
    },
    {
      id: 'CAT-002',
      title: 'Catalyst Research Scientist',
      department: 'R&D Materials',
      location: 'Paris, France',
      level: 'Mid-Senior',
      urgency: 'Medium',
      applicants: 28,
      status: 'Technical Interviews',
      requirements: ['PhD in Chemistry/Materials Science', 'Catalyst development experience', 'Publication record'],
      salaryRange: '€70,000 - €95,000'
    },
    {
      id: 'SAF-003',
      title: 'Industrial Safety Manager',
      department: 'Operations',
      location: 'Rotterdam, Netherlands',
      level: 'Senior',
      urgency: 'High',
      applicants: 19,
      status: 'Final Interviews',
      requirements: ['MSc in Safety Engineering', '10+ years industrial experience', 'ISO 45001 certification'],
      salaryRange: '€75,000 - €100,000'
    }
  ];

  const candidatePool = [
    {
      id: 'CAND-001',
      name: 'Dr. Sarah Chen',
      title: 'Senior Process Engineer',
      currentCompany: 'Shell',
      location: 'Amsterdam, Netherlands',
      experience: '12 years',
      specialization: 'Hydrogen Production',
      aiScore: 94,
      skills: ['Process Optimization', 'Electrolysis', 'Safety Systems', 'Project Management'],
      education: 'PhD Chemical Engineering - TU Delft',
      availability: 'Available in 3 months',
      salaryExpectation: '€95,000',
      matchingPositions: ['HYD-001'],
      status: 'Interested'
    },
    {
      id: 'CAND-002',
      name: 'Prof. Michael Rodriguez',
      title: 'Research Director',
      currentCompany: 'BASF',
      location: 'Ludwigshafen, Germany',
      experience: '15 years',
      specialization: 'Catalyst Development',
      aiScore: 91,
      skills: ['Catalyst Design', 'Materials Science', 'Team Leadership', 'Patent Development'],
      education: 'PhD Chemistry - MIT',
      availability: 'Available in 6 months',
      salaryExpectation: '€105,000',
      matchingPositions: ['CAT-002'],
      status: 'Under Review'
    },
    {
      id: 'CAND-003',
      name: 'Emma Thompson',
      title: 'Safety Engineering Manager',
      currentCompany: 'ExxonMobil',
      location: 'London, UK',
      experience: '14 years',
      specialization: 'Industrial Safety',
      aiScore: 89,
      skills: ['Risk Assessment', 'Safety Management', 'Regulatory Compliance', 'Incident Investigation'],
      education: 'MSc Safety Engineering - Imperial College',
      availability: 'Available immediately',
      salaryExpectation: '€85,000',
      matchingPositions: ['SAF-003'],
      status: 'Interview Scheduled'
    }
  ];

  const careerDevelopment = [
    {
      employee: 'Dr. James Wilson',
      currentRole: 'Process Engineer',
      targetRole: 'Senior Process Engineer',
      progress: 78,
      timeline: '8 months',
      skillGaps: ['Advanced Process Control', 'Team Leadership'],
      trainingPlan: ['Leadership Development Program', 'Advanced Process Control Certification'],
      mentor: 'Dr. Lisa Anderson',
      nextReview: '2024-04-15'
    },
    {
      employee: 'Maria Garcia',
      currentRole: 'Research Scientist',
      targetRole: 'Principal Scientist',
      progress: 65,
      timeline: '12 months',
      skillGaps: ['Project Management', 'Strategic Planning'],
      trainingPlan: ['PMP Certification', 'Strategic Leadership Course'],
      mentor: 'Prof. David Kim',
      nextReview: '2024-04-20'
    },
    {
      employee: 'Alex Kumar',
      currentRole: 'Safety Coordinator',
      targetRole: 'Safety Manager',
      progress: 82,
      timeline: '6 months',
      skillGaps: ['Budget Management', 'Regulatory Affairs'],
      trainingPlan: ['Financial Management for Engineers', 'Regulatory Compliance Workshop'],
      mentor: 'Sarah Mitchell',
      nextReview: '2024-04-10'
    }
  ];

  const agentInsights = [
    {
      agent: 'Talent Sourcing Agent',
      status: 'Active',
      lastAction: 'Identified 15 potential candidates for hydrogen engineering roles',
      candidates: 127,
      accuracy: 92,
      sourceChannels: ['LinkedIn', 'Industry Networks', 'Academic Partnerships']
    },
    {
      agent: 'Resume Screening Agent',
      status: 'Active',
      lastAction: 'Processed 89 applications with 94% accuracy',
      candidates: 89,
      accuracy: 94,
      sourceChannels: ['ATS Integration', 'Email Processing', 'Document Analysis']
    },
    {
      agent: 'Interview Coordinator',
      status: 'Active',
      lastAction: 'Scheduled 12 technical interviews for this week',
      candidates: 45,
      accuracy: 96,
      sourceChannels: ['Calendar Integration', 'Video Conferencing', 'Logistics Management']
    },
    {
      agent: 'Career Development Agent',
      status: 'Monitoring',
      lastAction: 'Updated career development plans for 23 employees',
      candidates: 156,
      accuracy: 88,
      sourceChannels: ['Performance Data', 'Skills Assessment', 'Learning Platforms']
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'border-red-500/30 text-red-400 bg-red-500/10';
      case 'Medium': return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10';
      case 'Low': return 'border-blue-500/30 text-blue-400 bg-blue-500/10';
      default: return 'border-gray-500/30 text-gray-400 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'Interested': return 'text-green-400';
      case 'Interview Scheduled': return 'text-blue-400';
      case 'Under Review': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Engineering Talent Acquisition & Development
              </h1>
              <p className="text-gray-300">
                AI-powered talent management for chemical engineers, process engineers, and industrial gas specialists
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Users className="w-4 h-4 mr-1" />
                {talentMetrics.totalCandidates} Candidates
              </Badge>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <TrendingUp className="w-4 h-4 mr-1" />
                {talentMetrics.placementRate}% Success Rate
              </Badge>
            </div>
          </div>
          
          {/* Talent Metrics Overview */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-400" />
                Talent Management Dashboard
              </CardTitle>
              <CardDescription className="text-gray-300">
                Air Liquide Engineering Talent Pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{talentMetrics.totalCandidates}</div>
                  <div className="text-sm text-gray-400">Total Candidates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{talentMetrics.activeRecruitment}</div>
                  <div className="text-sm text-gray-400">Active Positions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{talentMetrics.placementRate}%</div>
                  <div className="text-sm text-gray-400">Placement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{talentMetrics.averageTimeToHire}</div>
                  <div className="text-sm text-gray-400">Days to Hire</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{talentMetrics.employeeSatisfaction}%</div>
                  <div className="text-sm text-gray-400">Employee Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{talentMetrics.retentionRate}%</div>
                  <div className="text-sm text-gray-400">Retention Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
            <TabsTrigger value="sourcing" className="rounded-lg">
              Talent Sourcing
            </TabsTrigger>
            <TabsTrigger value="screening" className="rounded-lg">
              Candidate Screening
            </TabsTrigger>
            <TabsTrigger value="development" className="rounded-lg">
              Career Development
            </TabsTrigger>
            <TabsTrigger value="agents" className="rounded-lg">
              AI Agents
            </TabsTrigger>
          </TabsList>

          {/* Talent Sourcing Tab */}
          <TabsContent value="sourcing" className="space-y-6">
            <div className="space-y-4">
              {openPositions.map((position) => (
                <Card key={position.id} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          {position.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {position.location}
                          </span>
                          <span>{position.department}</span>
                          <span>{position.level}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getUrgencyColor(position.urgency)}>
                          {position.urgency} Priority
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {position.applicants} Applicants
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-gray-400 text-sm">Status:</span>
                        <div className="text-white">{position.status}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Salary Range:</span>
                        <div className="text-green-400">{position.salaryRange}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-gray-400 text-sm">Key Requirements:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {position.requirements.map((req, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Position ID: {position.id}</span>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        View Candidates
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Candidate Screening Tab */}
          <TabsContent value="screening" className="space-y-6">
            <div className="space-y-4">
              {candidatePool.map((candidate) => (
                <Card key={candidate.id} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-400" />
                          {candidate.name}
                        </h4>
                        <div className="text-gray-300 text-sm mt-1">
                          {candidate.title} at {candidate.currentCompany}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {candidate.location}
                          </span>
                          <span>{candidate.experience} experience</span>
                          <span>{candidate.specialization}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          <Star className="w-3 h-3 mr-1" />
                          AI Score: {candidate.aiScore}%
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(candidate.status) === 'text-green-400' 
                          ? 'border-green-500/30 text-green-400' 
                          : getStatusColor(candidate.status) === 'text-blue-400'
                          ? 'border-blue-500/30 text-blue-400'
                          : 'border-yellow-500/30 text-yellow-400'
                        }>
                          {candidate.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-gray-400 text-sm">Education:</span>
                        <div className="text-white text-sm">{candidate.education}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Availability:</span>
                        <div className="text-white text-sm">{candidate.availability}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Salary Expectation:</span>
                        <div className="text-green-400 text-sm">{candidate.salaryExpectation}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-gray-400 text-sm">Key Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {candidate.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Matching Positions: {candidate.matchingPositions.join(', ')}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-gray-600">
                          View Profile
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Schedule Interview
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Career Development Tab */}
          <TabsContent value="development" className="space-y-6">
            <div className="space-y-4">
              {careerDevelopment.map((employee, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-orange-400" />
                          {employee.employee}
                        </h4>
                        <div className="text-gray-300 text-sm mt-1">
                          {employee.currentRole} → {employee.targetRole}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        {employee.progress}% Complete
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-sm">Development Progress:</span>
                        <span className="text-white text-sm">{employee.timeline} timeline</span>
                      </div>
                      <Progress value={employee.progress} className="w-full" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-gray-400 text-sm">Skill Gaps:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {employee.skillGaps.map((gap, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-red-500/30 text-red-400">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Training Plan:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {employee.trainingPlan.map((training, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                              {training}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Mentor: {employee.mentor} | Next Review: {employee.nextReview}
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Update Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {agentInsights.map((agent, index) => (
                <Card key={index} className="bg-gray-800/50 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        {agent.agent === 'Talent Sourcing Agent' && <Search className="w-4 h-4" />}
                        {agent.agent === 'Resume Screening Agent' && <FileText className="w-4 h-4" />}
                        {agent.agent === 'Interview Coordinator' && <Calendar className="w-4 h-4" />}
                        {agent.agent === 'Career Development Agent' && <TrendingUp className="w-4 h-4" />}
                        {agent.agent}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(agent.status) === 'text-green-400' 
                          ? 'border-green-500/30 text-green-400' 
                          : 'border-blue-500/30 text-blue-400'
                        }`}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{agent.lastAction}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-gray-400 text-xs">Candidates Processed:</span>
                        <div className="text-blue-400 font-medium">{agent.candidates}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs">Accuracy:</span>
                        <div className="text-green-400 font-medium">{agent.accuracy}%</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400 text-xs">Source Channels:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.sourceChannels.map((channel, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TalentManagement;
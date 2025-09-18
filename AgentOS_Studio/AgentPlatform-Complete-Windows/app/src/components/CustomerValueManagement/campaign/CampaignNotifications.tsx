
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Bell, CheckCircle2, AlertTriangle, TrendingUp, Calendar, Users } from 'lucide-react';
import { CampaignType } from './types';
import { format, parseISO, isWithinInterval, addDays } from 'date-fns';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  date: Date;
  campaign?: CampaignType;
  read: boolean;
}

interface CampaignNotificationsProps {
  campaigns: CampaignType[];
  onSelectCampaign: (campaign: CampaignType) => void;
}

export const CampaignNotifications = ({ campaigns, onSelectCampaign }: CampaignNotificationsProps) => {
  // Generate notifications based on campaign data
  const generateNotifications = (): Notification[] => {
    const today = new Date();
    const notifications: Notification[] = [];
    
    // Campaign ending soon notifications
    campaigns.forEach(campaign => {
      try {
        const endDate = parseISO(campaign.endDate);
        const inSevenDays = addDays(today, 7);
        
        if (isWithinInterval(endDate, { start: today, end: inSevenDays }) && campaign.status === 'Active') {
          notifications.push({
            id: `end-${campaign.id}`,
            type: 'warning',
            title: 'Campaign Ending Soon',
            description: `${campaign.name} is scheduled to end on ${format(endDate, 'MMMM d, yyyy')}`,
            date: today,
            campaign,
            read: false
          });
        }
        
        // High performing campaigns
        if (campaign.conversion > 7 && campaign.status === 'Active') {
          notifications.push({
            id: `perf-${campaign.id}`,
            type: 'success',
            title: 'High Performing Campaign',
            description: `${campaign.name} is performing above target with ${campaign.conversion}% conversion rate`,
            date: today,
            campaign,
            read: false
          });
        }
        
        // Underperforming campaigns
        if (campaign.conversion < 3 && campaign.status === 'Active') {
          notifications.push({
            id: `underperf-${campaign.id}`,
            type: 'warning',
            title: 'Campaign Below Target',
            description: `${campaign.name} is performing below target with only ${campaign.conversion}% conversion rate`,
            date: today,
            campaign,
            read: true
          });
        }
      } catch (error) {
        // Skip if date parsing fails
      }
    });
    
    // Add some general notifications
    notifications.push({
      id: 'update-1',
      type: 'info',
      title: 'Audience Size Updated',
      description: 'Target audience sizes for all campaigns have been refreshed with the latest data',
      date: today,
      read: true
    });
    
    notifications.push({
      id: 'system-1',
      type: 'info',
      title: 'New Campaign Templates Available',
      description: '3 new campaign templates have been added to the template library',
      date: new Date(today.getTime() - 86400000), // Yesterday
      read: true
    });
    
    // Sort by date (newest first) and read status (unread first)
    return notifications.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return b.date.getTime() - a.date.getTime();
    });
  };
  
  const notifications = generateNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.campaign) {
      onSelectCampaign(notification.campaign);
    }
  };
  
  const handleMarkAllAsRead = () => {
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been marked as read",
    });
  };

  return (
    <Card className="border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Bell size={18} />
            Campaign Notifications
            {unreadCount > 0 && (
              <span className="bg-beam-blue text-white text-xs rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800 text-xs"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                notification.read 
                  ? 'border-gray-700/40 bg-gray-800/20 hover:bg-gray-800/40' 
                  : 'border-gray-700 bg-gray-800/40 hover:bg-gray-800/60'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {notification.type === 'success' && (
                    <CheckCircle2 size={18} className="text-green-400" />
                  )}
                  {notification.type === 'warning' && (
                    <AlertTriangle size={18} className="text-amber-400" />
                  )}
                  {notification.type === 'info' && (
                    notification.title.includes('Template') 
                      ? <Calendar size={18} className="text-blue-400" />
                      : <Users size={18} className="text-blue-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-medium ${
                      notification.read ? 'text-gray-300' : 'text-white'
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {format(notification.date, 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{notification.description}</p>
                  
                  {notification.campaign && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded text-white ${
                        notification.campaign.type === 'Upsell' ? 'bg-blue-900/70' : 
                        notification.campaign.type === 'Cross-sell' ? 'bg-green-900/70' : 
                        notification.campaign.type === 'Retention' ? 'bg-purple-900/70' : 
                        'bg-gray-700'
                      }`}>
                        {notification.campaign.type}
                      </span>
                      
                      {notification.type === 'success' && (
                        <span className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <TrendingUp size={12} />
                          {notification.campaign.conversion}% Conv.
                        </span>
                      )}
                      
                      {notification.type === 'warning' && notification.title.includes('Below') && (
                        <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <TrendingUp size={12} className="rotate-180" />
                          {notification.campaign.conversion}% Conv.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

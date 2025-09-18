
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CampaignType } from './types';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CampaignCalendarProps {
  campaigns: CampaignType[];
  onSelectCampaign: (campaign: CampaignType) => void;
}

export const CampaignCalendar = ({ campaigns, onSelectCampaign }: CampaignCalendarProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const activeCampaigns = campaigns.filter(campaign => 
    campaign.status !== 'Archived' && campaign.status !== 'Completed'
  );

  const getCampaignsForDay = (day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    return activeCampaigns.filter(campaign => {
      try {
        const startDate = parseISO(campaign.startDate);
        const endDate = parseISO(campaign.endDate);
        return isWithinInterval(day, { start: startDate, end: endDate });
      } catch (error) {
        return false;
      }
    });
  };

  // Group campaigns by month for list view
  const campaignsByMonth: Record<string, CampaignType[]> = {};
  activeCampaigns.forEach(campaign => {
    try {
      const startDate = parseISO(campaign.startDate);
      const monthYear = format(startDate, 'MMMM yyyy');
      
      if (!campaignsByMonth[monthYear]) {
        campaignsByMonth[monthYear] = [];
      }
      
      campaignsByMonth[monthYear].push(campaign);
    } catch (error) {
      // Skip if date is invalid
    }
  });

  // Sort the months chronologically
  const sortedMonths = Object.keys(campaignsByMonth).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card className="border-gray-800/30 bg-beam-dark-accent/50 backdrop-blur-md shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-white">Campaign Calendar</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              size="sm"
              className={view === "calendar" ? "bg-beam-blue" : "border-gray-700 text-gray-300"}
              onClick={() => setView("calendar")}
            >
              <CalendarIcon size={16} className="mr-1" />
              Calendar
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              className={view === "list" ? "bg-beam-blue" : "border-gray-700 text-gray-300"}
              onClick={() => setView("list")}
            >
              <CalendarIcon size={16} className="mr-1" />
              List
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "calendar" ? (
          <div className="rounded-md border border-gray-700/50 p-3 bg-beam-dark/70">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => {
                  const prevMonth = new Date(date);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setDate(prevMonth);
                }}
              >
                <ChevronLeft size={16} />
              </Button>
              <h3 className="text-white font-medium">
                {format(date, 'MMMM yyyy')}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => {
                  const nextMonth = new Date(date);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  setDate(nextMonth);
                }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
            
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="pointer-events-auto"
              modifiers={{
                hasCampaign: (day) => getCampaignsForDay(day).length > 0,
              }}
              modifiersStyles={{
                hasCampaign: {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '0',
                },
              }}
              components={{
                DayContent: (props) => {
                  const campaignsForDay = getCampaignsForDay(props.date);
                  return (
                    <div className="relative h-10 w-10 p-0 flex items-center justify-center">
                      <span>{format(props.date, 'd')}</span>
                      {campaignsForDay.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {campaignsForDay.slice(0, 3).map((_, idx) => (
                            <div
                              key={idx}
                              className="h-1.5 w-1.5 rounded-full bg-beam-blue"
                            />
                          ))}
                          {campaignsForDay.length > 3 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                },
              }}
            />
            
            <div className="mt-4 space-y-2">
              <h4 className="text-white font-medium">
                Campaigns on {format(date, 'MMMM d, yyyy')}
              </h4>
              <div className="space-y-2">
                {getCampaignsForDay(date).length > 0 ? (
                  getCampaignsForDay(date).map(campaign => (
                    <div
                      key={campaign.id}
                      className="p-2 border border-gray-700/50 rounded bg-gray-800/30 cursor-pointer hover:bg-gray-800/50"
                      onClick={() => onSelectCampaign(campaign)}
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="text-white">{campaign.name}</h5>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          campaign.status === 'Active' ? 'bg-green-900/50 text-green-400' :
                          campaign.status === 'Paused' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {format(parseISO(campaign.startDate), 'MMM d')} - {format(parseISO(campaign.endDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-3">No campaigns scheduled for this day</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {sortedMonths.length > 0 ? (
              sortedMonths.map(month => (
                <div key={month}>
                  <h3 className="text-white font-medium mb-3 sticky top-0 bg-beam-dark-accent/90 py-2 z-10">
                    {month}
                  </h3>
                  <div className="space-y-2">
                    {campaignsByMonth[month].map(campaign => (
                      <div
                        key={campaign.id}
                        className="p-3 border border-gray-700/50 rounded bg-gray-800/30 cursor-pointer hover:bg-gray-800/50"
                        onClick={() => onSelectCampaign(campaign)}
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="text-white font-medium">{campaign.name}</h5>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            campaign.status === 'Active' ? 'bg-green-900/50 text-green-400' :
                            campaign.status === 'Paused' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                            {campaign.type}
                          </span>
                          <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                            {campaign.target}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                          {format(parseISO(campaign.startDate), 'MMM d')} - {format(parseISO(campaign.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-10">No active campaigns scheduled</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

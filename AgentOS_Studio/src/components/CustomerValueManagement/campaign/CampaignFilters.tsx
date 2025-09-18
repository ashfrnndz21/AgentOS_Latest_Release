
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CampaignFilters = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Campaign Type</label>
        <Select defaultValue="all">
          <SelectTrigger className="bg-beam-dark/70 border-gray-700">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-beam-dark border-gray-700">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="acquisition">Acquisition</SelectItem>
            <SelectItem value="retention">Retention</SelectItem>
            <SelectItem value="upsell">Upsell</SelectItem>
            <SelectItem value="cross-sell">Cross-sell</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Target Segment</label>
        <Select defaultValue="all">
          <SelectTrigger className="bg-beam-dark/70 border-gray-700">
            <SelectValue placeholder="All Segments" />
          </SelectTrigger>
          <SelectContent className="bg-beam-dark border-gray-700">
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="high">High Value</SelectItem>
            <SelectItem value="medium">Medium Value</SelectItem>
            <SelectItem value="low">Low Value</SelectItem>
            <SelectItem value="new">New Customers</SelectItem>
            <SelectItem value="risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Status</label>
        <Select defaultValue="active">
          <SelectTrigger className="bg-beam-dark/70 border-gray-700">
            <SelectValue placeholder="Active Campaigns" />
          </SelectTrigger>
          <SelectContent className="bg-beam-dark border-gray-700">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Date Range</label>
        <Select defaultValue="current">
          <SelectTrigger className="bg-beam-dark/70 border-gray-700">
            <SelectValue placeholder="Current Quarter" />
          </SelectTrigger>
          <SelectContent className="bg-beam-dark border-gray-700">
            <SelectItem value="current">Current Quarter</SelectItem>
            <SelectItem value="previous">Previous Quarter</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

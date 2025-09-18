
export interface CampaignType {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  target: string;
  targetSize: number;
  conversion: number;
  roi: number;
  status: string;
  revenue: number;
  cost: number;
}

export interface PerformanceDataType {
  month: string;
  conversion: number;
  roi: number;
  targetConversion: number;
}

export interface CampaignFiltersType {
  type: string;
  target: string;
  status: string;
  dateRange: string;
}

export interface CampaignVariantType {
  id: string;
  name: string;
  description: string;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
  };
}

export interface ABTestType {
  id: string;
  name: string;
  description: string;
  status: 'Running' | 'Completed' | 'Draft';
  startDate: string;
  endDate: string;
  variants: CampaignVariantType[];
}

export interface CampaignTemplateType {
  id: string;
  name: string;
  description: string;
  type: string;
  target: string;
}

export interface CampaignNotificationType {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  date: Date;
  campaign?: CampaignType;
  read: boolean;
}

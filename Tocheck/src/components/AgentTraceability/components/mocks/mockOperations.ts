
// Mock operations data for nodes
export const mockOperations: {[key: string]: Array<{name: string, description: string, executionTime?: string, status?: 'success' | 'warning' | 'error'}>} = {
  'decision-1': [
    { 
      name: 'Data Extraction', 
      description: 'Extracted customer data from CRM database', 
      executionTime: '245ms',
      status: 'success'
    },
    {
      name: 'LLM Processing',
      description: 'Applied data analysis using GPT-4o model',
      executionTime: '1.2s',
      status: 'success'
    }
  ],
  'decision-2': [
    { 
      name: 'Revenue Forecasting', 
      description: 'Applied time-series analysis to historical sales data', 
      executionTime: '567ms',
      status: 'warning'
    },
    {
      name: 'PII Filtering',
      description: 'Detected and sanitized personally identifiable information',
      executionTime: '89ms',
      status: 'success'
    }
  ],
  'tool-1': [
    { 
      name: 'Database Query', 
      description: 'Executed SQL to fetch customer lifetime value metrics', 
      executionTime: '178ms',
      status: 'success'
    },
    {
      name: 'Data Aggregation',
      description: 'Grouped results by customer segments',
      executionTime: '42ms',
      status: 'success'
    }
  ],
  'lineage-1': [
    { 
      name: 'Data Source Access', 
      description: 'Connected to Customer Analytics Warehouse', 
      executionTime: '215ms',
      status: 'success'
    },
    {
      name: 'Data Transformation',
      description: 'Applied aggregation by customer segment',
      executionTime: '156ms',
      status: 'success'
    },
    {
      name: 'PII Compliance Check',
      description: 'Verified no individual customer records are exposed',
      executionTime: '65ms',
      status: 'success'
    }
  ],
  'lineage-2': [
    { 
      name: 'Marketing Data Access', 
      description: 'Connected to Marketing Campaign Database', 
      executionTime: '198ms',
      status: 'success'
    },
    {
      name: 'ROI Calculation',
      description: 'Calculated return on investment for each campaign',
      executionTime: '120ms',
      status: 'success'
    }
  ],
  'lineage-3': [
    { 
      name: 'Quality Metric Collection', 
      description: 'Gathered data quality metrics from monitoring service', 
      executionTime: '145ms',
      status: 'success'
    },
    {
      name: 'Completeness Analysis',
      description: 'Verified data completeness across all required fields',
      executionTime: '78ms',
      status: 'success'
    },
    {
      name: 'Data Accuracy Validation',
      description: 'Compared sample data with source of truth',
      executionTime: '210ms',
      status: 'warning'
    }
  ]
};

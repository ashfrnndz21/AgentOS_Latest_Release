
import { ConversationMessage } from '../conversation/types';

// Banking-specific conversation history for different nodes
export const mockConversationHistory: Record<string, ConversationMessage[]> = {
  'start': [
    {
      id: 'start-1',
      type: 'user',
      content: 'New loan application received from customer John Smith for $250,000 home mortgage',
      timestamp: '2024-01-15 09:15:23'
    },
    {
      id: 'start-2',
      type: 'agent', 
      content: 'Loan application received and logged. Initiating comprehensive processing workflow including KYC verification, credit assessment, and risk analysis. Application ID: LA-2024-001534',
      timestamp: '2024-01-15 09:15:24'
    },
    {
      id: 'start-3',
      type: 'system',
      content: 'Processing initiated: Customer onboarding agent activated for KYC verification',
      timestamp: '2024-01-15 09:15:25'
    }
  ],

  'tool1': [
    {
      id: 'tool1-1',
      type: 'system',
      content: 'KYC verification process started for customer ID: CUST-789012',
      timestamp: '2024-01-15 09:15:26'
    },
    {
      id: 'tool1-2',
      type: 'agent',
      content: 'Performing comprehensive KYC checks including identity verification, document validation, and regulatory screening against sanctions lists',
      timestamp: '2024-01-15 09:15:27'
    },
    {
      id: 'tool1-3',
      type: 'system',
      content: 'Document OCR completed: Driver\'s license verified, Social Security card validated, Utility bill processed for address confirmation',
      timestamp: '2024-01-15 09:16:45'
    },
    {
      id: 'tool1-4',
      type: 'agent',
      content: 'Identity verification successful with 96.2% confidence. Customer cleared against all watchlists. Address confirmed through utility bill dated within 90 days.',
      timestamp: '2024-01-15 09:16:46'
    }
  ],

  'decision1': [
    {
      id: 'decision1-1',
      type: 'system',
      content: 'Evaluating KYC verification results against regulatory compliance thresholds',
      timestamp: '2024-01-15 09:16:47'
    },
    {
      id: 'decision1-2',
      type: 'agent',
      content: 'KYC verification exceeds required confidence threshold of 95%. Customer meets all regulatory requirements for proceeding to credit assessment phase.',
      timestamp: '2024-01-15 09:16:48'
    },
    {
      id: 'decision1-3',
      type: 'guardrail',
      content: 'Guardrail check: PII data encryption verified, customer consent recorded, audit trail logged',
      timestamp: '2024-01-15 09:16:49',
      guardrailType: 'pii'
    }
  ],

  'tool2': [
    {
      id: 'tool2-1',
      type: 'system',
      content: 'Initiating credit assessment through integrated bureau services',
      timestamp: '2024-01-15 09:16:50'
    },
    {
      id: 'tool2-2',
      type: 'agent',
      content: 'Retrieving credit reports from Experian, Equifax, and TransUnion. Analyzing 7-year payment history and current credit utilization.',
      timestamp: '2024-01-15 09:17:15'
    },
    {
      id: 'tool2-3',
      type: 'system',
      content: 'Credit data retrieved: FICO Score 742, No delinquencies in 24 months, Current utilization 18%',
      timestamp: '2024-01-15 09:17:16'
    },
    {
      id: 'tool2-4',
      type: 'agent',
      content: 'Income verification completed through employer payroll service. Annual income $95,000 confirmed. Debt-to-income ratio calculated at 32% including proposed mortgage.',
      timestamp: '2024-01-15 09:17:45'
    },
    {
      id: 'tool2-5',
      type: 'guardrail',
      content: 'Guardrail activated: Credit inquiry consent verified before bureau access',
      timestamp: '2024-01-15 09:17:16',
      guardrailType: 'content'
    }
  ],

  'tool3': [
    {
      id: 'tool3-1',
      type: 'system',
      content: 'Executing comprehensive risk assessment algorithm',
      timestamp: '2024-01-15 09:17:46'
    },
    {
      id: 'tool3-2',
      type: 'agent',
      content: 'Applying multi-factor risk model considering credit score, income stability, employment history, and current market conditions. Property appraisal value $320,000 provides adequate collateral coverage.',
      timestamp: '2024-01-15 09:18:30'
    },
    {
      id: 'tool3-3',
      type: 'system',
      content: 'Risk calculation complete: Medium-Low risk profile assigned, Loan-to-Value ratio 78.1%',
      timestamp: '2024-01-15 09:18:31'
    },
    {
      id: 'tool3-4',
      type: 'agent',
      content: 'Based on risk assessment and current market rates, recommended loan terms: $250,000 at 4.25% interest for 30-year fixed term. Monthly payment $1,229.85',
      timestamp: '2024-01-15 09:18:32'
    }
  ],

  'decision2': [
    {
      id: 'decision2-1',
      type: 'system',
      content: 'Final approval decision point: Reviewing all assessment criteria',
      timestamp: '2024-01-15 09:18:33'
    },
    {
      id: 'decision2-2',
      type: 'agent',
      content: 'All approval criteria satisfied: Credit score above minimum, DTI within limits, adequate collateral, income verified. Loan approved for requested amount with prime rate terms.',
      timestamp: '2024-01-15 09:18:34'
    },
    {
      id: 'decision2-3',
      type: 'guardrail',
      content: 'Guardrail check: Fair lending practices validated, no discriminatory factors detected',
      timestamp: '2024-01-15 09:18:35',
      guardrailType: 'content'
    },
    {
      id: 'decision2-4',
      type: 'system',
      content: 'Regulatory compliance confirmed: All lending regulations satisfied',
      timestamp: '2024-01-15 09:18:36'
    }
  ],

  'tool4': [
    {
      id: 'tool4-1',
      type: 'system',
      content: 'Executing loan setup and account creation processes',
      timestamp: '2024-01-15 09:18:37'
    },
    {
      id: 'tool4-2',
      type: 'agent',
      content: 'Generating loan documents including promissory note, mortgage agreement, and disclosure statements. Setting up automated payment processing and escrow account.',
      timestamp: '2024-01-15 09:19:15'
    },
    {
      id: 'tool4-3',
      type: 'system',
      content: 'Account created: Loan account LA-2024-001534, Payment due date set for 15th of each month',
      timestamp: '2024-01-15 09:19:16'
    },
    {
      id: 'tool4-4',
      type: 'agent',
      content: 'Loan setup complete. Customer notification sent with approval details and next steps for closing. Loan ready for funding upon completion of closing requirements.',
      timestamp: '2024-01-15 09:19:17'
    }
  ],

  'alternate1': [
    {
      id: 'alternate1-1',
      type: 'system',
      content: 'KYC verification failed - initiating remediation workflow',
      timestamp: '2024-01-15 09:16:47'
    },
    {
      id: 'alternate1-2',
      type: 'agent',
      content: 'KYC verification could not be completed due to document quality issues. Customer notification sent requesting clearer copies of identification documents.',
      timestamp: '2024-01-15 09:16:48'
    },
    {
      id: 'alternate1-3',
      type: 'system',
      content: 'Resubmission window opened: Customer has 7 days to provide updated documentation',
      timestamp: '2024-01-15 09:16:49'
    }
  ],

  'alternate2': [
    {
      id: 'alternate2-1',
      type: 'system',
      content: 'Loan application declined - generating adverse action notice',
      timestamp: '2024-01-15 09:18:33'
    },
    {
      id: 'alternate2-2',
      type: 'agent',
      content: 'Loan application declined due to debt-to-income ratio exceeding 43% threshold. Customer notified with specific decline reasons and credit improvement recommendations.',
      timestamp: '2024-01-15 09:18:34'
    },
    {
      id: 'alternate2-3',
      type: 'system',
      content: 'Alternative product recommendations generated: Credit counseling service, secured credit card options',
      timestamp: '2024-01-15 09:18:35'
    },
    {
      id: 'alternate2-4',
      type: 'guardrail',
      content: 'Guardrail check: Fair Credit Reporting Act compliance verified in adverse action notice',
      timestamp: '2024-01-15 09:18:36',
      guardrailType: 'content'
    }
  ],

  // Corporate Banking conversations
  'corporate-credit': [
    {
      id: 'corporate-1',
      type: 'user',
      content: 'Corporate credit facility request: $5M revolving line of credit for TechCorp Manufacturing Inc.',
      timestamp: '2024-01-15 10:30:00'
    },
    {
      id: 'corporate-2',
      type: 'agent',
      content: 'Analyzing corporate financials: Revenue $45M, EBITDA $8.2M, Current assets $12M. Debt service coverage ratio 1.8x meets minimum requirements.',
      timestamp: '2024-01-15 10:45:30'
    },
    {
      id: 'corporate-3',
      type: 'system',
      content: 'Industry analysis: Manufacturing sector showing stable growth, moderate risk classification applied',
      timestamp: '2024-01-15 10:45:31'
    }
  ],

  // Wealth Management conversations  
  'portfolio-optimization': [
    {
      id: 'wealth-1',
      type: 'user',
      content: 'Client portfolio review: $2.5M portfolio, moderate risk tolerance, seeking growth with income',
      timestamp: '2024-01-15 14:20:00'
    },
    {
      id: 'wealth-2',
      type: 'agent',
      content: 'Current allocation: 65% equities, 30% bonds, 5% alternatives. Recommending rebalancing to 60% equities, 25% bonds, 10% REITs, 5% commodities for better diversification.',
      timestamp: '2024-01-15 14:25:15'
    },
    {
      id: 'wealth-3',
      type: 'system',
      content: 'Tax-loss harvesting opportunity identified: $15K in unrealized losses available for offset',
      timestamp: '2024-01-15 14:25:16'
    }
  ]
};

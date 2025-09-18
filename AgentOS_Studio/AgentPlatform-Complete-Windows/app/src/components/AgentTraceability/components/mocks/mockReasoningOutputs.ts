
import { ReasoningOutput } from '@/components/AgentWorkspace/types';

// Enhanced banking-specific reasoning outputs for different nodes
export const mockReasoningOutputs: Record<string, ReasoningOutput> = {
  // Consumer Banking - Loan Application Process
  'start': {
    objective: "Process new customer loan application ensuring compliance with banking regulations and risk management policies",
    thought: "I need to initiate a comprehensive loan application workflow that validates customer identity, assesses creditworthiness, and ensures all regulatory requirements are met before approval.",
    reasoning: [
      { step: "Validate customer application completeness and required documentation", confidence: 0.98 },
      { step: "Initiate KYC (Know Your Customer) verification process", confidence: 0.95 },
      { step: "Check customer against sanctions and watchlists", confidence: 0.97 },
      { step: "Determine loan type and applicable interest rates", confidence: 0.92 }
    ],
    constraints: [
      "Must comply with Anti-Money Laundering (AML) regulations",
      "All customer data must be handled according to GDPR/privacy laws",
      "Loan amount cannot exceed regulatory lending limits",
      "Interest rates must align with current market conditions and bank policy"
    ],
    tools: [
      "Customer Application Parser",
      "Document Verification System",
      "Regulatory Compliance Checker",
      "Interest Rate Calculator"
    ],
    databases: [
      "Customer Master Database",
      "Loan Products Catalog",
      "Regulatory Requirements Database",
      "Market Rate Reference"
    ],
    verification: "Application received and initial validation confirms all required fields are present. Process can proceed to KYC verification stage.",
    confidence: 0.94
  },

  'tool1': {
    objective: "Verify customer identity and perform comprehensive KYC checks to ensure regulatory compliance",
    thought: "KYC verification is critical for banking compliance. I must validate identity documents, check against government databases, and assess customer risk profile.",
    reasoning: [
      { step: "Parse and validate government-issued identification documents", confidence: 0.96 },
      { step: "Cross-reference customer details with official registries", confidence: 0.93 },
      { step: "Perform facial recognition matching against provided photo ID", confidence: 0.89 },
      { step: "Check customer against PEP (Politically Exposed Persons) lists", confidence: 0.97 },
      { step: "Validate address proof and residency status", confidence: 0.91 }
    ],
    constraints: [
      "Identity verification must achieve 95% confidence threshold",
      "All checks must complete within 3 minutes for customer experience",
      "Data retention policies must be followed for audit trail",
      "Failed verification requires manual review escalation"
    ],
    tools: [
      "Document OCR Engine",
      "Government Database API",
      "Facial Recognition System",
      "PEP Screening Service",
      "Address Validation Service"
    ],
    databases: [
      "KYC Documentation Store",
      "Customer Risk Profiles",
      "Government Registry APIs",
      "Sanctions Lists Database"
    ],
    verification: "Customer identity successfully verified with 96.2% confidence. All regulatory checks passed. Customer cleared for credit assessment.",
    confidence: 0.93
  },

  'decision1': {
    objective: "Evaluate KYC verification results and determine if customer meets regulatory compliance requirements",
    thought: "Based on KYC verification results, I need to assess whether the customer passes all regulatory requirements or requires additional verification steps.",
    reasoning: [
      { step: "Analyze identity verification confidence score against minimum threshold", confidence: 0.95 },
      { step: "Review any flags from sanctions or PEP screening", confidence: 0.98 },
      { step: "Validate completeness of required documentation", confidence: 0.92 },
      { step: "Assess overall customer risk profile classification", confidence: 0.89 }
    ],
    constraints: [
      "KYC confidence must be above 95% for automatic approval",
      "Any sanctions flags require immediate escalation",
      "Incomplete documentation must trigger resubmission request",
      "High-risk customers require enhanced due diligence"
    ],
    tools: [
      "Risk Assessment Engine",
      "Compliance Decision Matrix",
      "Escalation Workflow Manager"
    ],
    databases: [
      "Compliance Rules Database",
      "Customer Risk Classifications",
      "Audit Trail Repository"
    ],
    verification: "KYC verification results meet all regulatory requirements. Customer approved for credit assessment with standard risk classification.",
    confidence: 0.94
  },

  'tool2': {
    objective: "Perform comprehensive credit assessment by analyzing customer's credit history, income, and financial stability",
    thought: "Credit assessment is crucial for loan approval. I need to evaluate creditworthiness using multiple data sources and risk models to determine appropriate loan terms.",
    reasoning: [
      { step: "Retrieve credit report from major credit bureaus", confidence: 0.97 },
      { step: "Analyze credit score and payment history patterns", confidence: 0.95 },
      { step: "Verify income through employment and bank statements", confidence: 0.91 },
      { step: "Calculate debt-to-income ratio and financial obligations", confidence: 0.93 },
      { step: "Apply bank's proprietary credit scoring model", confidence: 0.88 }
    ],
    constraints: [
      "Credit score must be above 650 for standard loan approval",
      "Debt-to-income ratio cannot exceed 40%",
      "Income verification must be within last 3 months",
      "Multiple recent credit inquiries may impact approval"
    ],
    tools: [
      "Credit Bureau Integration",
      "Income Verification System",
      "Debt Analysis Calculator",
      "Proprietary Credit Scoring Model",
      "Financial Statement Analyzer"
    ],
    databases: [
      "Credit Bureau Data",
      "Employment Verification Database",
      "Bank Statement Repository",
      "Credit Scoring Models Database"
    ],
    verification: "Credit assessment completed. Customer has credit score of 742 with DTI ratio of 32%. Qualifies for prime rate lending terms.",
    confidence: 0.92
  },

  'tool3': {
    objective: "Calculate comprehensive risk assessment and determine optimal loan terms based on customer profile and market conditions",
    thought: "Risk assessment combines credit data with behavioral analytics and market conditions to determine the most appropriate loan structure and pricing.",
    reasoning: [
      { step: "Apply multi-factor risk scoring algorithm including credit, income, and employment stability", confidence: 0.94 },
      { step: "Analyze customer banking relationship history and deposit patterns", confidence: 0.91 },
      { step: "Evaluate loan-to-value ratio for secured loans", confidence: 0.89 },
      { step: "Consider macroeconomic factors and interest rate environment", confidence: 0.87 },
      { step: "Determine appropriate loan terms, amount, and interest rate", confidence: 0.93 }
    ],
    constraints: [
      "Maximum loan amount based on income multiples (5x annual income)",
      "Interest rate must reflect risk profile and market conditions",
      "Loan term cannot exceed regulatory maximum for loan type",
      "Must maintain bank's target profit margins"
    ],
    tools: [
      "Multi-Factor Risk Engine",
      "Behavioral Analytics Platform",
      "Market Rate Monitoring System",
      "Loan Pricing Calculator",
      "Portfolio Risk Analyzer"
    ],
    databases: [
      "Customer Banking History",
      "Market Rate Database",
      "Risk Model Parameters",
      "Loan Portfolio Analytics"
    ],
    verification: "Risk assessment completed with medium-low risk classification. Approved for $250,000 loan at 4.25% interest rate over 30-year term.",
    confidence: 0.91
  },

  'decision2': {
    objective: "Make final loan approval decision based on comprehensive risk assessment and regulatory requirements",
    thought: "This is the critical decision point where all assessment data is synthesized to make a final approval or denial decision that balances risk and business objectives.",
    reasoning: [
      { step: "Review all assessment results against approval criteria matrix", confidence: 0.96 },
      { step: "Validate loan terms are within regulatory and policy limits", confidence: 0.98 },
      { step: "Confirm adequate portfolio capacity for this risk profile", confidence: 0.92 },
      { step: "Ensure proposed terms align with customer's repayment capacity", confidence: 0.94 }
    ],
    constraints: [
      "Must meet all regulatory capital requirements",
      "Loan concentration limits by industry and geography",
      "Customer debt service coverage ratio minimum 1.25x",
      "Approval authority limits based on loan amount"
    ],
    tools: [
      "Approval Decision Engine",
      "Regulatory Compliance Validator",
      "Portfolio Concentration Monitor",
      "Authority Limits Checker"
    ],
    databases: [
      "Approval Criteria Database",
      "Portfolio Risk Limits",
      "Regulatory Requirements",
      "Authority Matrix"
    ],
    verification: "All criteria met for loan approval. Loan terms validated against regulatory requirements and portfolio limits. Final approval granted.",
    confidence: 0.95
  },

  'tool4': {
    objective: "Execute approved loan setup including account creation, documentation generation, and system integration",
    thought: "Final step requires precise execution of loan setup processes while maintaining data integrity and ensuring all legal requirements are met.",
    reasoning: [
      { step: "Generate loan agreement and legal documentation", confidence: 0.97 },
      { step: "Create loan account in core banking system", confidence: 0.96 },
      { step: "Set up automated payment schedules and notifications", confidence: 0.94 },
      { step: "Initialize loan monitoring and servicing workflows", confidence: 0.92 },
      { step: "Send approval notification and next steps to customer", confidence: 0.95 }
    ],
    constraints: [
      "All legal documentation must comply with state and federal regulations",
      "Account setup must complete within 24 hours of approval",
      "Customer notifications must include all required disclosures",
      "Loan must be funded according to agreed timeline"
    ],
    tools: [
      "Document Generation Engine",
      "Core Banking Integration",
      "Payment Processing Setup",
      "Loan Servicing Platform",
      "Customer Communication System"
    ],
    databases: [
      "Core Banking System",
      "Document Management System",
      "Customer Communication Logs",
      "Loan Servicing Database"
    ],
    verification: "Loan account successfully created. Documentation generated and customer notified. Loan ready for funding.",
    confidence: 0.96
  },

  'alternate1': {
    objective: "Handle KYC verification failure by requesting additional documentation and providing customer guidance",
    thought: "When KYC verification fails, I need to identify specific deficiencies and guide the customer through remediation while maintaining security protocols.",
    reasoning: [
      { step: "Analyze specific KYC failure points to provide targeted guidance", confidence: 0.93 },
      { step: "Generate list of required additional documentation", confidence: 0.96 },
      { step: "Assess if manual review is required for edge cases", confidence: 0.89 },
      { step: "Provide clear instructions for resubmission process", confidence: 0.95 }
    ],
    constraints: [
      "Cannot disclose specific security algorithm details",
      "Must provide reasonable timeline for document resubmission",
      "Customer has maximum 3 attempts for verification",
      "Certain failures require mandatory cooling-off period"
    ],
    tools: [
      "KYC Failure Analysis Engine",
      "Document Requirements Generator",
      "Customer Guidance System",
      "Resubmission Workflow Manager"
    ],
    databases: [
      "KYC Requirements Database",
      "Customer Attempt History",
      "Document Standards Repository"
    ],
    verification: "KYC failure analysis completed. Customer provided with specific guidance for document resubmission.",
    confidence: 0.92
  },

  'alternate2': {
    objective: "Process loan application denial with appropriate reasoning and alternative product recommendations",
    thought: "When declining a loan application, I must provide clear rationale while exploring alternative banking products that might serve the customer's needs.",
    reasoning: [
      { step: "Generate adverse action notice with specific decline reasons", confidence: 0.97 },
      { step: "Analyze customer profile for alternative product suitability", confidence: 0.91 },
      { step: "Recommend credit improvement strategies and timeline", confidence: 0.88 },
      { step: "Suggest appropriate banking products or services", confidence: 0.93 }
    ],
    constraints: [
      "Must comply with Fair Credit Reporting Act requirements",
      "Decline reasons must be specific and actionable",
      "Cannot recommend products outside customer's qualification criteria",
      "Must provide credit report information as required by law"
    ],
    tools: [
      "Adverse Action Notice Generator",
      "Alternative Product Matching Engine",
      "Credit Improvement Advisor",
      "Regulatory Compliance Validator"
    ],
    databases: [
      "Product Eligibility Database",
      "Credit Improvement Programs",
      "Regulatory Templates",
      "Customer Product History"
    ],
    verification: "Loan declined with proper adverse action notice. Customer provided with alternative product recommendations and improvement pathway.",
    confidence: 0.94
  },

  // Corporate Banking specific reasoning
  'corporate-credit': {
    objective: "Evaluate corporate credit application considering business financials, industry risk, and market conditions",
    thought: "Corporate credit assessment requires analysis of complex financial statements, industry dynamics, and macroeconomic factors affecting business viability.",
    reasoning: [
      { step: "Analyze audited financial statements and cash flow projections", confidence: 0.94 },
      { step: "Evaluate industry sector risk and competitive positioning", confidence: 0.89 },
      { step: "Assess management team experience and track record", confidence: 0.87 },
      { step: "Review existing banking relationships and payment history", confidence: 0.93 },
      { step: "Calculate debt service coverage and leverage ratios", confidence: 0.96 }
    ],
    constraints: [
      "Minimum debt service coverage ratio of 1.35x required",
      "Maximum leverage ratio of 4.0x for most industries",
      "Must have 3 years of audited financial statements",
      "Industry concentration limits apply"
    ],
    tools: [
      "Financial Statement Analyzer",
      "Industry Risk Assessment Tool",
      "Management Evaluation Framework",
      "Credit Rating Model",
      "Covenant Monitoring System"
    ],
    databases: [
      "Corporate Financial Database",
      "Industry Risk Metrics",
      "Management Database",
      "Market Intelligence"
    ],
    verification: "Corporate credit analysis completed. Company shows strong financial metrics with DSCR of 1.8x and leverage of 2.3x.",
    confidence: 0.91
  },

  // Wealth Management specific reasoning
  'portfolio-optimization': {
    objective: "Optimize investment portfolio allocation based on client risk profile, investment objectives, and market outlook",
    thought: "Portfolio optimization requires balancing risk-return objectives while considering client constraints, tax implications, and current market conditions.",
    reasoning: [
      { step: "Analyze client risk tolerance questionnaire and investment objectives", confidence: 0.93 },
      { step: "Review current portfolio allocation and performance attribution", confidence: 0.95 },
      { step: "Apply modern portfolio theory with current market assumptions", confidence: 0.88 },
      { step: "Consider tax implications and harvest loss opportunities", confidence: 0.91 },
      { step: "Validate recommendations against suitability requirements", confidence: 0.96 }
    ],
    constraints: [
      "Must align with client's stated risk tolerance",
      "Minimum diversification requirements across asset classes",
      "Consider liquidity needs for next 12 months",
      "Stay within regulatory concentration limits"
    ],
    tools: [
      "Portfolio Optimization Engine",
      "Risk Analytics Platform",
      "Tax Optimization Calculator",
      "Suitability Assessment Tool",
      "Market Research Database"
    ],
    databases: [
      "Client Profile Database",
      "Market Data Feeds",
      "Securities Master Database",
      "Tax Rate Tables"
    ],
    verification: "Portfolio optimization completed with 15% expected return and 12% volatility, meeting client's moderate risk profile.",
    confidence: 0.92
  }
};

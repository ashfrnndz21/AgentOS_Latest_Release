
import { useState, useEffect } from 'react';

const defaultPrompts = [
  "How does this project relate to our quarterly goals?",
  "What data sources does this project use?",
  "Summarize the key findings from this project",
  "What are the main challenges this project addresses?"
];

const voiceAnalyticsPrompts = [
  "Analyze the sentiment in my recent customer calls",
  "What are the most common topics discussed in voice conversations?",
  "Show me voice quality metrics for last week's calls",
  "Generate insights from call transcriptions",
  "Which conversations had the highest customer satisfaction?",
  "Identify patterns in customer complaints from voice data"
];

const customerInsightsPrompts = [
  "What emotions are customers expressing in their calls?",
  "How does call duration correlate with customer satisfaction?",
  "What are the trending topics in customer conversations?",
  "Show me voice-based customer journey insights",
  "Which products get mentioned most in support calls?"
];

export function useSuggestedPrompts(projectId: string | null) {
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(defaultPrompts);

  // Update suggested prompts when project changes
  useEffect(() => {
    if (projectId === 'voice-analytics') {
      setSuggestedPrompts(voiceAnalyticsPrompts);
    } else if (projectId === 'customer-insights') {
      setSuggestedPrompts(customerInsightsPrompts);
    } else {
      setSuggestedPrompts(defaultPrompts);
    }
  }, [projectId]);

  return { suggestedPrompts };
}

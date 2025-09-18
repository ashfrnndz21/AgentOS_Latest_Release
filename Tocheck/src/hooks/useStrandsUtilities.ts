import { useState, useEffect } from 'react';
import { StrandsSDK, StrandsUtilityTool } from '../lib/frameworks/StrandsSDK';
import { 
  ArrowRightLeft, 
  Combine, 
  Shield, 
  GitBranch, 
  Activity, 
  Database, 
  User 
} from 'lucide-react';

// Icon mapping for utilities
const UTILITY_ICONS = {
  'ArrowRightLeft': ArrowRightLeft,
  'Combine': Combine,
  'Shield': Shield,
  'GitBranch': GitBranch,
  'Activity': Activity,
  'Database': Database,
  'User': User
};

export interface StrandsUtilityNode {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  color: string;
  configurable: boolean;
  localOnly: boolean;
  requiresApiKey: boolean;
}

export function useStrandsUtilities() {
  const [utilityNodes, setUtilityNodes] = useState<StrandsUtilityNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStrandsUtilities();
  }, []);

  const loadStrandsUtilities = async () => {
    try {
      setLoading(true);
      const strandsSDK = new StrandsSDK();
      const utilities = await strandsSDK.getAvailableUtilities();
      
      const mappedUtilities = utilities.map((utility: StrandsUtilityTool) => ({
        id: utility.id,
        name: utility.name,
        category: utility.category,
        description: utility.description,
        icon: UTILITY_ICONS[utility.icon as keyof typeof UTILITY_ICONS] || Activity,
        color: getUtilityColor(utility.category),
        configurable: utility.configurable,
        localOnly: utility.local_only,
        requiresApiKey: utility.requires_external_api
      }));

      setUtilityNodes(mappedUtilities);
      setError(null);
    } catch (err) {
      console.error('Failed to load Strands utilities:', err);
      setError('Failed to load utilities');
      // Fallback to empty array
      setUtilityNodes([]);
    } finally {
      setLoading(false);
    }
  };

  const getUtilityColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'handoff': 'text-blue-400',
      'aggregator': 'text-purple-400',
      'guardrail': 'text-red-400',
      'decision': 'text-yellow-400',
      'monitor': 'text-cyan-400',
      'memory': 'text-green-400',
      'human': 'text-orange-400'
    };
    return colorMap[category] || 'text-gray-400';
  };

  const getUtilityStatus = (category: string): string => {
    const statusMap: Record<string, string> = {
      'handoff': 'Active',
      'aggregator': 'Configuring',
      'guardrail': 'Ready',
      'decision': 'Configuring',
      'monitor': 'Active',
      'memory': 'Active',
      'human': 'Ready'
    };
    return statusMap[category] || 'Ready';
  };

  const configureUtility = async (utilityId: string, config: any) => {
    try {
      const strandsSDK = new StrandsSDK();
      await strandsSDK.configureUtility(utilityId, config);
      return true;
    } catch (err) {
      console.error('Failed to configure utility:', err);
      return false;
    }
  };

  return {
    utilityNodes,
    loading,
    error,
    reload: loadStrandsUtilities,
    configureUtility,
    getUtilityStatus
  };
}
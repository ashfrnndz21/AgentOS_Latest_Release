
import { ModelOption } from '../types';
import { openaiModels } from './openai';
import { anthropicModels } from './anthropic';
import { metaModels } from './meta';
import { deepseekModels } from './deepseek';
import { amazonModels } from './amazon';

// Export all models in a grouped object
export const AIModels: Record<string, ModelOption[]> = {
  openai: openaiModels,
  anthropic: anthropicModels,
  meta: metaModels,
  deepseek: deepseekModels,
  amazon: amazonModels
};

// Export individual model arrays for direct access
export {
  openaiModels,
  anthropicModels,
  metaModels,
  deepseekModels,
  amazonModels
};

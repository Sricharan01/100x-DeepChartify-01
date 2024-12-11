import { HfInference } from '@huggingface/inference';
import { ProcessedFileData } from '../types/fileTypes';
import { calculateDatasetStatistics } from '../utils/statisticsUtils';
import { generateAnalysisPrompt } from '../utils/promptUtils';
import { parseAnalysisResponse } from '../utils/analysisUtils';

const DEFAULT_TOKEN = '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';

export interface AnalysisResult {
  text: string;
  insights: {
    summary: string;
    keyFindings: string[];
    trends: string[];
    correlations: string[];
    recommendations: string[];
    dependencies?: string[];
  };
}

export const analyzeData = async (
  datasets: ProcessedFileData[],
  prompt: string,
  token: string = DEFAULT_TOKEN
): Promise<AnalysisResult> => {
  if (!datasets || datasets.length === 0) {
    throw new Error('No data provided for analysis');
  }

  try {
    const hf = new HfInference(token);

    // Combine all datasets
    const combinedData = datasets.reduce((acc, curr) => [...acc, ...curr.data], []);
    const statistics = calculateDatasetStatistics(combinedData, Array.from(new Set(datasets.flatMap(d => d.columns))));

    // Generate analysis prompt
    const systemPrompt = generateAnalysisPrompt({
      datasets,
      statistics,
      userPrompt: prompt
    });

    // Get AI analysis
    const response = await hf.textGeneration({
      model: 'meta-llama/Llama-3.2-3B-Instruct',
      inputs: systemPrompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
        repetition_penalty: 1.2,
        do_sample: true
      }
    });

    if (!response.generated_text) {
      throw new Error('No analysis generated from the model');
    }

    // Parse the analysis into structured sections
    const insights = parseAnalysisResponse(response.generated_text);

    return {
      text: response.generated_text,
      insights
    };
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    throw new Error(
      error.message === 'Failed to fetch'
        ? 'Network error: Please check your internet connection'
        : `Analysis failed: ${error.message || 'Unknown error'}`
    );
  }
};
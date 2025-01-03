import { HfInference } from '@huggingface/inference';
import { ProcessedFileData } from '../types/fileTypes';
import { calculateDatasetStatistics } from '../utils/statisticsUtils';
import { generateAnalysisPrompt } from '../utils/promptUtils';
import { parseAnalysisResponse } from '../utils/analysisUtils';
import { formatChartData } from '../utils/chart/formatters.ts';
import { createChartOptions } from '../utils/chart/options.ts';
import { processChartData } from '../utils/chart/processors.ts';

const DEFAULT_TOKEN = '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';

export interface AnalysisResult {
  text: string;
  insights: {
    summary: string;
    keyFindings: string[];
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

  if (!prompt?.trim()) {
    throw new Error('Please provide a valid prompt');
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
      userPrompt: prompt.trim()
    });

    // Get AI analysis with increased token limit
    const response = await hf.textGeneration({
      model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      inputs: systemPrompt,
      parameters: {
        max_new_tokens: 2000, // Increased from 1000
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
        repetition_penalty: 1.2,
        do_sample: true
      }
    });

    if (!response.generated_text) {
      throw new Error('No analysis generated');
    }

    // Parse and clean the response
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
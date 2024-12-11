import { ProcessedFileData } from '../types/fileTypes';
import { DatasetStatistics } from '../types/analysisTypes';

interface PromptParams {
  datasets: ProcessedFileData[];
  statistics: DatasetStatistics;
  userPrompt: string;
}

export const generateAnalysisPrompt = ({
  datasets,
  statistics,
  userPrompt
}: PromptParams): string => {
  const { columnStats, correlations, outliers, summary } = statistics;

  const datasetOverview = `You are a data analysis expert. Analyze this dataset and provide detailed insights.

Dataset Overview:
Files: ${datasets.map(d => d.name).join(', ')}
Total Records: ${summary.totalRecords}
Data Completeness: ${summary.completeness.toFixed(1)}%

Statistical Summary:
${Object.entries(columnStats)
  .map(([col, stats]) => `
${col} (${stats.type}):
${stats.type === 'numeric' ? 
  `- Range: ${stats.min} to ${stats.max}
   - Mean: ${stats.mean?.toFixed(2)}
   - Median: ${stats.median?.toFixed(2)}
   - Standard Deviation: ${stats.stdDev?.toFixed(2)}
   - Outliers: ${outliers[col]?.length || 0} detected` :
stats.type === 'categorical' ?
  `- Unique Values: ${stats.uniqueValues}
   - Most Common: ${stats.mode}
   - Distribution: Top 3 categories
     ${Object.entries(stats.frequencies || {})
       .sort(([, a], [, b]) => b - a)
       .slice(0, 3)
       .map(([cat, count]) => `${cat}: ${count}`)
       .join('\n     ')}` :
  `- Date Range: ${stats.dateRange?.start} to ${stats.dateRange?.end}`
}`).join('\n')}

${Object.entries(correlations)
  .flatMap(([col1, corrs]) => 
    Object.entries(corrs)
      .filter(([col2]) => col1 < col2)
      .map(([col2, corr]) => `${col1} vs ${col2}: ${corr.toFixed(2)}`)
  ).length > 0 ? `
Correlations:
${Object.entries(correlations)
  .flatMap(([col1, corrs]) => 
    Object.entries(corrs)
      .filter(([col2]) => col1 < col2)
      .map(([col2, corr]) => `${col1} vs ${col2}: ${corr.toFixed(2)}`)
  ).join('\n')}` : ''}

User Question: ${userPrompt}

Provide a comprehensive analysis with the following sections:
1. Summary: A brief overview of the key insights
2. Key Findings: 3-5 main discoveries from the data
3. Trends: Notable patterns and trends
4. Correlations: Important relationships between variables
5. Recommendations: Suggested visualizations and next steps

Format each section with clear headers and bullet points.`;

  return datasetOverview;
};
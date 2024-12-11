import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnalysisResult } from '../services/aiService';
import CopyButton from './CopyButton';
import { formatChartData } from '../utils/chart/formatters.ts';
import { createChartOptions } from '../utils/chart/options.ts';
import { processChartData } from '../utils/chart/processors.ts';

interface AnalysisResultsProps {
  analysis?: AnalysisResult;
  loading?: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis?.insights) {
    return null;
  }

  const { insights } = analysis;

  const formatAnalysisText = () => {
    return [
      `Summary:\n${insights.summary}`,
      insights.keyFindings?.length > 0 && `Key Findings:\n${insights.keyFindings.map(f => `• ${f}`).join('\n')}`
    ].filter(Boolean).join('\n\n');
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
        <CopyButton text={formatAnalysisText()} />
      </div>

      <div className="prose prose-blue max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => <p className="text-gray-700 mb-4" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-4" {...props} />,
            li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2" {...props} />
          }}
        >
          {insights.summary}
        </ReactMarkdown>

        {insights.keyFindings?.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mb-2">Key Findings</h3>
            <ul className="list-disc list-inside space-y-2">
              {insights.keyFindings.map((finding, index) => (
                <li key={index} className="text-gray-700">{finding}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
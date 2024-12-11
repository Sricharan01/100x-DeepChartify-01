import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BarChart2, TrendingUp, GitBranch, Lightbulb, ArrowUpDown } from 'lucide-react';
import { AnalysisResult } from '../services/aiService';
import CopyButton from './CopyButton';

interface AnalysisResultsProps {
  analysis?: AnalysisResult;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  if (!analysis?.insights) {
    return null;
  }

  const { insights } = analysis;

  const formatAnalysisText = () => {
    const sections = [
      { title: 'Summary', content: insights.summary },
      { title: 'Key Findings', content: insights.keyFindings },
      { title: 'Trends', content: insights.trends },
      { title: 'Recommendations', content: insights.recommendations }
    ];

    return sections
      .filter(section => section.content && (!Array.isArray(section.content) || section.content.length > 0))
      .map(section => {
        const content = Array.isArray(section.content)
          ? section.content.map(item => `• ${item}`).join('\n')
          : section.content;
        return `${section.title}:\n${content}`;
      })
      .join('\n\n');
  };

  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-blue max-w-none"
      components={{
        p: ({ node, ...props }) => <p className="text-gray-700" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2" {...props} />,
        li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
        a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-800" {...props} />,
        code: ({ node, ...props }) => <code className="bg-gray-100 rounded px-1" {...props} />
      }}
    >
      {content}
    </ReactMarkdown>
  );

  const renderSection = (
    title: string,
    content: string | string[],
    icon: React.ReactNode,
    iconColor: string
  ) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;

    return (
      <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
        <div className="flex items-center gap-2 mb-3">
          <div className={`${iconColor}`}>{icon}</div>
          <h4 className="text-lg font-semibold">{title}</h4>
        </div>
        {renderMarkdown(
          Array.isArray(content)
            ? content.map(item => `- ${item}`).join('\n')
            : content
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
        <CopyButton text={formatAnalysisText()} />
      </div>

      {renderSection(
        'Data Analysis Summary',
        insights.summary,
        <BarChart2 className="h-5 w-5" />,
        'text-blue-500'
      )}
      
      
    </div>
  );
};

export default AnalysisResults;
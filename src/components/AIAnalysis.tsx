import React, { useState, useCallback } from 'react';
import { Send, Loader, AlertCircle } from 'lucide-react';
import { analyzeData, AnalysisResult } from '../services/aiService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIAnalysisProps {
  data: any[];
  onAnalysisComplete: (analysis: AnalysisResult) => void;
}

// Predefined prompt templates to help users
const PROMPT_TEMPLATES = [
  "What are the main trends in this data?",
  "Can you identify any patterns or correlations?",
  "What insights can you provide about [column name]?",
  "How has [metric] changed over time?",
  "What are the key statistics for [column name]?"
];

const AIAnalysis: React.FC<AIAnalysisProps> = ({ data, onAnalysisComplete }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Function to validate and enhance the prompt
  const enhancePrompt = useCallback((rawPrompt: string) => {
    let enhancedPrompt = rawPrompt.trim();
    
    // Add context if not present
    if (!enhancedPrompt.toLowerCase().includes('data')) {
      enhancedPrompt = `In this dataset, ${enhancedPrompt}`;
    }
    
    // Add request for specific details if prompt is too general
    if (enhancedPrompt.length < 20) {
      enhancedPrompt += " Please provide specific details and statistics to support your analysis.";
    }
    
    return enhancedPrompt;
  }, []);

  const handlePromptSelect = (template: string) => {
    setPrompt(template);
    setShowTemplates(false);
  };

  const handleAnalysis = async () => {
    if (!prompt.trim() || !data?.length) {
      setError('Please enter a question and ensure your data is loaded.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Enhance the prompt before sending
      const enhancedPrompt = enhancePrompt(prompt);
      
      // Get available column names from data
      const columns = Object.keys(data[0] || {});
      
      // Replace template placeholders with actual column names
      const finalPrompt = columns.reduce((acc, col) => {
        return acc.replace('[column name]', col);
      }, enhancedPrompt);

      const analysis = await analyzeData(data, finalPrompt);
      
      setAnalysisResult(analysis);
      onAnalysisComplete(analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try a different question or check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a specific question about your data..."
          className="w-full p-4 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAnalysis();
            }
          }}
        />
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="absolute left-2 top-2 text-gray-400 hover:text-gray-600"
        >
          <AlertCircle className="h-5 w-5" />
        </button>
        <button
          onClick={handleAnalysis}
          disabled={loading || !prompt.trim()}
          className="absolute right-2 bottom-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
        >
          {loading ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {showTemplates && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Example Questions:</h3>
          <ul className="space-y-2">
            {PROMPT_TEMPLATES.map((template, index) => (
              <li key={index}>
                <button
                  onClick={() => handlePromptSelect(template)}
                  className="text-left text-blue-600 hover:text-blue-700"
                >
                  {template}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <div className="rounded-lg border p-4 bg-white">
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
            <div className="whitespace-pre-wrap text-gray-700">
              {analysisResult.text}
            </div>
            {analysisResult.insights && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Key Insights:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.insights.keyFindings?.map((finding, index) => (
                    <li key={index} className="text-gray-700">{finding}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
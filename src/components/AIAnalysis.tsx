import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { analyzeData, AnalysisResult } from '../services/aiService';

interface AIAnalysisProps {
  data: any[];
  onAnalysisComplete: (analysis: AnalysisResult) => void;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ data, onAnalysisComplete }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  const handleAnalysis = async () => {
    if (!prompt.trim() || !data?.length) {
      setError('Please enter a prompt and ensure data is loaded.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const analysis = await analyzeData(data, prompt);
      setAnalysisResult(analysis.text);
      onAnalysisComplete(analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a question about your data (e.g., 'What are the main trends?')"
          className="w-full p-4 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAnalysis();
            }
          }}
        />
        <button
          onClick={handleAnalysis}
          disabled={loading || !prompt.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader className="h-6 w-6 animate-spin" />
          ) : (
            <Send className="h-6 w-6" />
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {analysisResult && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {analysisResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
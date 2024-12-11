import React, { useState, useCallback } from 'react';
import { Send, Loader, HelpCircle } from 'lucide-react';
import { validatePrompt } from '../utils/analysisUtils';

interface CustomPromptProps {
  onSubmit: (prompt: string) => Promise<void>;
  loading: boolean;
}

const EXAMPLE_PROMPTS = [
  "What are the main trends in this data?",
  "Show me any correlations between variables",
  "What insights can you provide about [specific column]?",
  "Identify any outliers or anomalies in the data"
];

const CustomPrompt: React.FC<CustomPromptProps> = ({ onSubmit, loading }) => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value);
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePrompt(prompt);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onSubmit(prompt);
      setPrompt('');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to process prompt');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && prompt.trim()) {
        handleSubmit(e as any);
      }
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
    setError(null);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-semibold">Ask About Your Data</h3>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <HelpCircle className="h-3 w-3" />
          <span className="text-xs">Example Questions</span>
        </button>
      </div>

      {showExamples && (
        <div className="mb-2 p-2 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm mb-1">Example Questions:</h4>
          <ul className="space-y-1">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <li key={index}>
                <button
                  onClick={() => handleExampleClick(example)}
                  className="text-blue-600 hover:text-blue-700 text-xs"
                >
                  "{example}"
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a specific question about your data..."
            className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] text-sm"
            disabled={loading}
          />
          <div className="absolute right-2 bottom-2 flex items-center">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Ask about trends, patterns, correlations, or specific aspects of your data
        </p>
      </form>
    </div>
  );
};

export default CustomPrompt;
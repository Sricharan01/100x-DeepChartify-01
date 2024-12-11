import React, { useState } from 'react';
import { Send, Loader, HelpCircle } from 'lucide-react';

interface CustomPromptProps {
  onSubmit: (prompt: string) => Promise<void>;
  loading: boolean;
}

const EXAMPLE_PROMPTS = [
  "What are the main trends in the data?",
  "Show me any correlations between variables",
  "What insights can you provide about [specific column]?",
  "Compare the distribution of values across categories",
  "Identify any outliers or anomalies in the data"
];

const CustomPrompt: React.FC<CustomPromptProps> = ({ onSubmit, loading }) => {
  const [prompt, setPrompt] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onSubmit(prompt);
    setPrompt('');
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ask Questions About Your Data</h3>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm">Example Questions</span>
        </button>
      </div>

      {showExamples && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Example Questions:</h4>
          <ul className="space-y-2">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <li key={index}>
                <button
                  onClick={() => handleExampleClick(example)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  "{example}"
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question about your data..."
              className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Ask about trends, patterns, correlations, or specific aspects of your data
          </p>
        </div>
      </form>
    </div>
  );
};

export default CustomPrompt;
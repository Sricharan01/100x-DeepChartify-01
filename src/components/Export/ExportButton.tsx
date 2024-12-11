import React from 'react';
import { Download } from 'lucide-react';
import { exportToPDF, exportToDocx, exportToImage, exportToJSON } from '../../utils/exportUtils';
import { AnalysisResult } from '../../types/analysisTypes';

interface ExportButtonProps {
  analysis: AnalysisResult;
  data: any[];
  chartRef: React.RefObject<HTMLDivElement>;
}

const ExportButton: React.FC<ExportButtonProps> = ({ analysis, data, chartRef }) => {
  const [showOptions, setShowOptions] = React.useState(false);

  const handleExport = async (format: 'pdf' | 'docx' | 'image' | 'json') => {
    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(analysis, chartRef);
          break;
        case 'docx':
          await exportToDocx(analysis, data);
          break;
        case 'image':
          await exportToImage(chartRef);
          break;
        case 'json':
          await exportToJSON(analysis, data);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="mr-2 h-5 w-5" />
        Export
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
          <div className="py-1">
            {[
              { format: 'pdf', label: 'Export as PDF' },
              { format: 'docx', label: 'Export as Word' },
              { format: 'image', label: 'Export as Image' },
              { format: 'json', label: 'Export as JSON' }
            ].map(({ format, label }) => (
              <button
                key={format}
                onClick={() => handleExport(format as 'pdf' | 'docx' | 'image' | 'json')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
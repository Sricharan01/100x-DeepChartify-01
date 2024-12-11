import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ColumnSelectorProps {
  columns: string[];
  selectedColumns: string[];
  onColumnSelect: (column: string, axis: 'x' | 'y') => void;
  disabled?: boolean;
  chartType?: string;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns = [],
  selectedColumns = [],
  onColumnSelect,
  disabled = false,
  chartType = 'bar'
}) => {
  const handleColumnSelect = (value: string, axis: 'x' | 'y') => {
    onColumnSelect(value, axis);
    // For pie charts, when x-axis changes, update y-axis to match
    if (chartType === 'pie' && axis === 'x') {
      onColumnSelect(value, 'y');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className={chartType === 'pie' ? 'w-full' : 'flex-1'}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {chartType === 'pie' ? 'Category' : 'X-Axis Column'}
          </label>
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md disabled:bg-gray-100"
              onChange={(e) => handleColumnSelect(e.target.value, 'x')}
              value={selectedColumns[0] || ''}
              disabled={disabled}
            >
              <option value="">Select Column</option>
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        {chartType !== 'pie' && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y-Axis Column
            </label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md disabled:bg-gray-100"
                onChange={(e) => handleColumnSelect(e.target.value, 'y')}
                value={selectedColumns[1] || ''}
                disabled={disabled}
              >
                <option value="">Select Column</option>
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnSelector;
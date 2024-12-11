import React from 'react';
import { BarChart2, LineChart, PieChart, ScatterChart } from 'lucide-react';

interface ChartTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
  disabled?: boolean;
}

const chartTypes = [
  { id: 'bar', label: 'Bar Chart', icon: BarChart2 },
  { id: 'line', label: 'Line Chart', icon: LineChart },
  { id: 'scatter', label: 'Scatter Plot', icon: ScatterChart },
  { id: 'pie', label: 'Pie Chart', icon: PieChart },
];

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Chart Type
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {chartTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTypeSelect(id)}
            disabled={disabled}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${selectedType === id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon className={`h-6 w-6 ${selectedType === id ? 'text-blue-500' : 'text-gray-500'}`} />
              <span className={`text-sm ${selectedType === id ? 'text-blue-700' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartTypeSelector;
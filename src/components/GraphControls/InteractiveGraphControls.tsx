import React, { useState, useEffect, useMemo } from 'react';
import ColumnSelector from './ColumnSelector';
import ChartTypeSelector from './ChartTypeSelector';
import ChartDisplay from '../ChartDisplay';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  PieController,
  LineController,
  ScatterController,
  RadarController,
  BarController,
  BubbleController, 
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  PieController,
  LineController,
  ScatterController,
  RadarController,
  BarController,
  BubbleController, 
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Colors
);
import { Chart } from 'react-chartjs-2';


interface InteractiveGraphControlsProps {
  data: any[];
  columns: string[];
  loading?: boolean;
}

const InteractiveGraphControls: React.FC<InteractiveGraphControlsProps> = ({
  data,
  columns,
  loading = false,
}) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [error, setError] = useState<string | null>(null);

  // Function to calculate quartiles and IQR
  const calculateQuartiles = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    return {
      q1,
      q3,
      iqr,
      lowerBound: q1 - 1.5 * iqr,
      upperBound: q3 + 1.5 * iqr,
    };
  };

  // Process data to remove outliers
  const processedData = useMemo(() => {
    if (!data || selectedColumns.length < 2) return data;
    const numericValues = data
      .map(item => Number(item[selectedColumns[1]]))
      .filter(val => !isNaN(val));
    if (numericValues.length === 0) return data;
    const { lowerBound, upperBound } = calculateQuartiles(numericValues);
    return data.filter(item => {
      const value = Number(item[selectedColumns[1]]);
      return !isNaN(value) && value >= lowerBound && value <= upperBound;
    });
  }, [data, selectedColumns]);

  const handleColumnSelect = (column: string, axis: 'x' | 'y') => {
    const index = axis === 'x' ? 0 : 1;
    setSelectedColumns(prev => {
      const newColumns = [...prev];
      newColumns[index] = column;
      return newColumns;
    });
  };

  const handleChartTypeChange = (type: string) => {
    setSelectedChartType(type);
    if (type === 'pie') {
      // Reset columns when switching to pie chart
      setSelectedColumns([]);
    }
  };

  const canShowChart =
    selectedChartType === 'pie'
      ? selectedColumns.length > 0 && selectedColumns[0] !== ''
      : selectedColumns.length === 2 && selectedColumns.every(col => col);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Customize Your Visualization
        </h3>
        <ChartTypeSelector
          selectedType={selectedChartType}
          onTypeSelect={handleChartTypeChange}
          disabled={loading}
        />
        {/* {selectedChartType === 'pie' ? (
          <div className="text-sm text-gray-600 mb-4">
            For pie charts, select one column
          </div>
        ) : null} */}
        <ColumnSelector
          columns={columns}
          selectedColumns={selectedColumns}
          onColumnSelect={handleColumnSelect}
          disabled={loading}
          // Pass the current chart type to control axis visibility
          chartType={selectedChartType}
        />
      </div>
      {canShowChart && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <ChartDisplay
            type={selectedChartType}
            data={processedData}
            columns={selectedColumns}
            xAxisLabel={selectedColumns[0]}
            yAxisLabel={selectedColumns[1]}
          />
        </div>
      )}
    </div>
  );
};

export default InteractiveGraphControls;
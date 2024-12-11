import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
  ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { createChartData } from '../utils/chartDataUtils';
import { createChartOptions } from '../utils/chart/options.ts';
import { processChartData } from '../utils/chart/processors.ts';
import { formatChartData } from '../utils/chart/formatters.ts';
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

interface ChartDisplayProps {
  type: string;
  data: any[];
  columns: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ 
  type, 
  data = [], 
  columns = [],
  xAxisLabel,
  yAxisLabel,
  title
}) => {
  if (!data.length || !columns.length) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for visualization</p>
      </div>
    );
  }

  const chartData = formatChartData(type, data, columns[0], columns[1]);
  const options = createChartOptions(type, {
    title,
    xAxisLabel: xAxisLabel || columns[0],
    yAxisLabel: yAxisLabel || columns[1]
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <Chart 
        type={type as 'bar' | 'line' | 'pie' | 'scatter'} 
        data={chartData} 
        options={options}
      />
    </div>
  );
};

export default ChartDisplay;
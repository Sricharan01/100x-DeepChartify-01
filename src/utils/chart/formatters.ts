import { ChartData } from 'chart.js';
import { ChartDataPoint, ProcessedChartData } from './types';
import { processChartData, getChartColors } from './processors';

export const formatChartData = (
  type: string,
  data: ChartDataPoint[],
  xColumn: string,
  yColumn: string
): ChartData => {
  const { labels, values } = processChartData(data, xColumn, yColumn);

  switch (type) {
    case 'pie':
      return {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map((_, i) => getChartColors(i)),
          borderColor: labels.map((_, i) => getChartColors(i, 1)),
          borderWidth: 1
        }]
      };

    case 'bar':
      return {
        labels,
        datasets: [{
          label: yColumn,
          data: values,
          backgroundColor: getChartColors(0),
          borderColor: getChartColors(0, 1),
          borderWidth: 1
        }]
      };

    case 'line':
      return {
        labels,
        datasets: [{
          label: yColumn,
          data: values,
          borderColor: getChartColors(0, 1),
          backgroundColor: getChartColors(0, 0.1),
          fill: true,
          tension: 0.4
        }]
      };

    case 'scatter':
      return {
        datasets: [{
          label: `${xColumn} vs ${yColumn}`,
          data: data.map(item => ({
            x: String(item[xColumn]),
            y: Number(item[yColumn]) || 0
          })),
          backgroundColor: getChartColors(0, 0.6),
          borderColor: getChartColors(0)
        }]
      };

    default:
      return formatChartData('bar', data, xColumn, yColumn);
  }
};
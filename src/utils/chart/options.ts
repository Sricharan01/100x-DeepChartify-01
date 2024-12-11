import { ChartOptions as ChartJSOptions } from 'chart.js';
import { ChartOptions } from './types';
import { formatChartData } from '../utils/chart/formatters.ts';
import { createChartOptions } from '../utils/chart/options.ts';
import { processChartData } from '../utils/chart/processors.ts';

export const createChartOptions = (
  type: string,
  options: ChartOptions = {}
): ChartJSOptions => {
  const {
    title,
    xAxisLabel,
    yAxisLabel,
    showLegend = true,
    showTooltips = true
  } = options;

  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        display: showLegend
      },
      tooltip: {
        enabled: showTooltips,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            if (type === 'pie') {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const value = context.raw as number;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} (${percentage}%)`;
            }
            return `${context.dataset.label}: ${context.formattedValue}`;
          }
        }
      },
      title: title ? {
        display: true,
        text: title
      } : undefined
    },
    scales: type !== 'pie' ? {
      x: {
        type: 'category',
        display: true,
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        display: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel
        },
        beginAtZero: true
      }
    } : undefined
  };
};
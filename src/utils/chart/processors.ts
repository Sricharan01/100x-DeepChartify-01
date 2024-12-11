import { ChartDataPoint, ProcessedChartData } from './types';
import { formatChartData } from '../utils/chart/formatters.ts';

export const processChartData = (
  data: ChartDataPoint[],
  xColumn: string,
  yColumn: string
): ProcessedChartData => {
  // Get unique categories from x-axis
  const uniqueCategories = Array.from(new Set(data.map(item => String(item[xColumn]))));
  
  // Create a map to store aggregated values for each category
  const categoryValues = new Map<string, number>();
  uniqueCategories.forEach(category => {
    const matchingRows = data.filter(item => String(item[xColumn]) === category);
    const sum = matchingRows.reduce((acc, item) => acc + (Number(item[yColumn]) || 0), 0);
    categoryValues.set(category, sum);
  });

  // Sort categories alphabetically
  const sortedCategories = Array.from(categoryValues.keys()).sort();

  return {
    labels: sortedCategories,
    values: sortedCategories.map(category => categoryValues.get(category) || 0)
  };
};

export const getChartColors = (index: number, alpha = 0.7): string => 
  `hsla(${index * 137.5}, 70%, 50%, ${alpha})`;
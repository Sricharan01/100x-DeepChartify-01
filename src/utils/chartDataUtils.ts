import { ChartData } from 'chart.js';

interface DataPoint {
  [key: string]: any;
}

export const processChartData = (
  data: DataPoint[],
  xColumn: string,
  yColumn: string
): { labels: string[]; values: number[] } => {
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

export const createChartData = (
  type: string,
  data: DataPoint[],
  xColumn: string,
  yColumn: string
): ChartData => {
  const { labels, values } = processChartData(data, xColumn, yColumn);

  const getColor = (index: number, alpha = 0.7) => 
    `hsla(${index * 137.5}, 70%, 50%, ${alpha})`;

  switch (type) {
    case 'pie':
      return {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map((_, i) => getColor(i)),
          borderColor: labels.map((_, i) => getColor(i, 1)),
          borderWidth: 1
        }]
      };

    case 'bar':
      return {
        labels,
        datasets: [{
          label: yColumn,
          data: values,
          backgroundColor: getColor(0),
          borderColor: getColor(0, 1),
          borderWidth: 1
        }]
      };

    case 'line':
      return {
        labels,
        datasets: [{
          label: yColumn,
          data: values,
          borderColor: getColor(0, 1),
          backgroundColor: getColor(0, 0.1),
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
          backgroundColor: getColor(0, 0.6),
          borderColor: getColor(0)
        }]
      };

    default:
      return createChartData('bar', data, xColumn, yColumn);
  }
};
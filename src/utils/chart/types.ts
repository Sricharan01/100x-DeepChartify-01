export interface ChartDataPoint {
  [key: string]: any;
}

export interface ProcessedChartData {
  labels: string[];
  values: number[];
}

export interface ChartOptions {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showTooltips?: boolean;
}
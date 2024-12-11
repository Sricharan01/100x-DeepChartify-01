import { ColumnStats, DatasetStatistics } from '../types/analysisTypes';

export const calculateDatasetStatistics = (
  data: any[],
  columns: string[]
): DatasetStatistics => {
  const columnStats = calculateColumnStatistics(data, columns);
  const correlations = calculateCorrelations(data, columns, columnStats);
  const outliers = detectOutliers(data, columns, columnStats);

  return {
    totalRecords: data.length,
    columnStats,
    correlations,
    outliers,
    summary: generateSummaryStats(data, columnStats)
  };
};

const calculateColumnStatistics = (
  data: any[],
  columns: string[]
): Record<string, ColumnStats> => {
  return columns.reduce((acc, col) => {
    const values = data.map(row => row[col]).filter(v => v != null);
    
    if (values.length === 0) {
      acc[col] = { type: 'categorical', uniqueValues: 0 };
      return acc;
    }

    const isNumeric = values.every(v => !isNaN(Number(v)));
    const isDate = values.every(v => !isNaN(Date.parse(String(v))));
    
    if (isNumeric) {
      const numbers = values.map(Number);
      const sorted = [...numbers].sort((a, b) => a - b);
      const quartiles = calculateQuartiles(sorted);
      const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
      
      acc[col] = {
        type: 'numeric',
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        mean,
        median: quartiles.q2,
        quartiles,
        stdDev: calculateStdDev(numbers, mean),
        skewness: calculateSkewness(numbers, mean, calculateStdDev(numbers, mean)),
        kurtosis: calculateKurtosis(numbers, mean, calculateStdDev(numbers, mean))
      };
    } else if (isDate) {
      const dates = values.map(v => new Date(v));
      acc[col] = {
        type: 'date',
        dateRange: {
          start: new Date(Math.min(...dates)).toISOString(),
          end: new Date(Math.max(...dates)).toISOString()
        },
        distribution: calculateDateDistribution(dates)
      };
    } else {
      const frequencies = calculateFrequencies(values);
      acc[col] = {
        type: 'categorical',
        uniqueValues: Object.keys(frequencies).length,
        frequencies,
        mode: findMode(frequencies),
        entropy: calculateEntropy(frequencies, values.length)
      };
    }
    
    return acc;
  }, {} as Record<string, ColumnStats>);
};

const calculateQuartiles = (sorted: number[]) => {
  const q2 = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const lowerHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const upperHalf = sorted.slice(Math.ceil(sorted.length / 2));
  
  return {
    q1: lowerHalf.length % 2 === 0
      ? (lowerHalf[lowerHalf.length / 2 - 1] + lowerHalf[lowerHalf.length / 2]) / 2
      : lowerHalf[Math.floor(lowerHalf.length / 2)],
    q2,
    q3: upperHalf.length % 2 === 0
      ? (upperHalf[upperHalf.length / 2 - 1] + upperHalf[upperHalf.length / 2]) / 2
      : upperHalf[Math.floor(upperHalf.length / 2)]
  };
};

const calculateStdDev = (numbers: number[], mean: number): number => {
  const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
  return Math.sqrt(variance);
};

const calculateSkewness = (numbers: number[], mean: number, stdDev: number): number => {
  const n = numbers.length;
  const m3 = numbers.reduce((sum, x) => sum + Math.pow(x - mean, 3), 0) / n;
  return m3 / Math.pow(stdDev, 3);
};

const calculateKurtosis = (numbers: number[], mean: number, stdDev: number): number => {
  const n = numbers.length;
  const m4 = numbers.reduce((sum, x) => sum + Math.pow(x - mean, 4), 0) / n;
  return m4 / Math.pow(stdDev, 4) - 3;
};

const calculateFrequencies = (values: any[]): Record<string, number> => {
  return values.reduce((freq, val) => {
    const key = String(val);
    freq[key] = (freq[key] || 0) + 1;
    return freq;
  }, {} as Record<string, number>);
};

const findMode = (frequencies: Record<string, number>): string => {
  return Object.entries(frequencies)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

const calculateEntropy = (frequencies: Record<string, number>, total: number): number => {
  return -Object.values(frequencies)
    .reduce((sum, count) => {
      const p = count / total;
      return sum + p * Math.log2(p);
    }, 0);
};

const calculateDateDistribution = (dates: Date[]): Record<string, number> => {
  const distribution: Record<string, number> = {};
  dates.forEach(date => {
    const month = date.toISOString().slice(0, 7);
    distribution[month] = (distribution[month] || 0) + 1;
  });
  return distribution;
};

const calculateCorrelations = (
  data: any[],
  columns: string[],
  columnStats: Record<string, ColumnStats>
): Record<string, Record<string, number>> => {
  const numericColumns = columns.filter(col => columnStats[col].type === 'numeric');
  
  return numericColumns.reduce((acc, col1) => {
    acc[col1] = {};
    numericColumns.forEach(col2 => {
      if (col1 === col2) {
        acc[col1][col2] = 1;
      } else {
        const values1 = data.map(row => Number(row[col1]));
        const values2 = data.map(row => Number(row[col2]));
        acc[col1][col2] = calculatePearsonCorrelation(values1, values2);
      }
    });
    return acc;
  }, {} as Record<string, Record<string, number>>);
};

const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b) / n;
  const meanY = y.reduce((a, b) => a + b) / n;
  
  const numerator = x.reduce((sum, xi, i) => 
    sum + (xi - meanX) * (y[i] - meanY), 0);
  
  const denominator = Math.sqrt(
    x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0) *
    y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
  );
  
  return numerator / denominator;
};

const detectOutliers = (
  data: any[],
  columns: string[],
  columnStats: Record<string, ColumnStats>
): Record<string, number[]> => {
  return columns.reduce((acc, col) => {
    if (columnStats[col].type === 'numeric') {
      const values = data.map(row => Number(row[col]));
      const stats = columnStats[col];
      const iqr = stats.quartiles.q3 - stats.quartiles.q1;
      const lowerBound = stats.quartiles.q1 - 1.5 * iqr;
      const upperBound = stats.quartiles.q3 + 1.5 * iqr;
      
      acc[col] = values.filter(v => v < lowerBound || v > upperBound);
    }
    return acc;
  }, {} as Record<string, number[]>);
};

const generateSummaryStats = (
  data: any[],
  columnStats: Record<string, ColumnStats>
): Record<string, any> => {
  return {
    totalRecords: data.length,
    numericColumns: Object.values(columnStats).filter(s => s.type === 'numeric').length,
    categoricalColumns: Object.values(columnStats).filter(s => s.type === 'categorical').length,
    dateColumns: Object.values(columnStats).filter(s => s.type === 'date').length,
    completeness: calculateCompleteness(data, Object.keys(columnStats))
  };
};

const calculateCompleteness = (data: any[], columns: string[]): number => {
  const totalCells = data.length * columns.length;
  const nonNullCells = columns.reduce((sum, col) => 
    sum + data.filter(row => row[col] != null).length, 0);
  return (nonNullCells / totalCells) * 100;
};
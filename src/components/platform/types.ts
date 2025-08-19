
export interface EquityDataPoint {
  date: string;
  value: number;
  benchmark: number;
  drawdown: number;
}

export interface ReturnsDataPoint {
  return: string;
  frequency: number;
  percentage?: number; // Optional for the enhanced component
}

export interface StockDataPoint {
  date: string;
  value: number;
  position: string | null;
}

export interface MonthlyPnLData {
  year: number;
  Jan: number;
  Feb: number;
  Mar: number;
  Apr: number;
  May: number;
  Jun: number;
  Jul: number;
  Aug: number;
  Sep: number;
  Oct: number;
  Nov: number;
  Dec: number;
}

export interface PerformanceMetric {
  metric: string;
  value: string;
  description: string;
}

export interface StockData {
  [key: string]: StockDataPoint[];
}

import { Card } from '@/components/ui/card';
import { PerformanceMetric } from './types';

interface PerformanceMetricsGridProps {
  performanceMetrics: PerformanceMetric[];
}

const getValueColor = (metric: string, value: string) => {
  // Special case for drawdown and risk metrics
  if (metric.includes('Drawdown') || metric.includes('VaR') || metric.includes('CVaR')) {
    return 'text-red-400';
  }
  
  // Special case for profit factor
  if (metric === 'Profit Factor') {
    const num = parseFloat(value);
    return num > 1 ? 'text-green-400' : num < 1 ? 'text-red-400' : 'text-amber-400';
  }
  
  // Try to parse numeric value
  const numValue = parseFloat(value.replace('%', ''));
  
  if (!isNaN(numValue)) {
    if (metric.includes('Return') || metric.includes('CAGR') || 
        metric.includes('Sharpe') || metric.includes('Sortino') || 
        metric.includes('Calmar') || metric.includes('Win Rate')) {
      return numValue > 0 ? 'text-green-400' : numValue < 0 ? 'text-red-400' : 'text-gray-300';
    }
  }
  
  return 'text-gray-300';
};

const formatValue = (metric: string, value: string) => {
  if (metric.includes('Win Rate') || metric.includes('Return') || 
      metric.includes('CAGR') || metric.includes('Volatility') || 
      metric.includes('Drawdown') || metric.includes('VaR') || 
      metric.includes('CVaR')) {
    return value;
  }
  
  // Format numbers with commas
  const num = parseFloat(value);
  if (!isNaN(num)) {
    if (Number.isInteger(num)) {
      return num.toLocaleString();
    }
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  return value;
};

const PerformanceMetricsGrid = ({ performanceMetrics }: PerformanceMetricsGridProps) => {
  return (
    <Card className="p-6 bg-gray-800/50 border border-emerald-900/30 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-6">Performance Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceMetrics.map((metric) => (
          <div 
            key={metric.metric} 
            className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-300">{metric.metric}</h4>
              <span className={`text-lg font-bold ${getValueColor(metric.metric, metric.value)}`}>
                {formatValue(metric.metric, metric.value)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{metric.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PerformanceMetricsGrid;
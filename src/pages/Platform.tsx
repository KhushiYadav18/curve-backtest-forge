import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ReturnsHistogram from '@/components/platform/ReturnsHistogram';
import { ReturnsDataPoint } from '@/components/platform/types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity, 
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PortfolioDataPoint {
  date: number; // timestamp
  value: number;
  drawdown: number;
}

interface CandlestickDataPoint {
  date: string;
  value: number;
  action: string | null;
}

interface StockData {
  [key: string]: CandlestickDataPoint[];
}

interface PerformanceMetric {
  metric: string;
  value: string;
  description: string;
}

const Platform = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioDataPoint[]>([]);
  const [stockData, setStockData] = useState<StockData>({});
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [returnsHistogram, setReturnsHistogram] = useState<ReturnsDataPoint[]>([]);

  const monthlyPnL = [
    { year: 2023, Jan: 2.5, Feb: -0.8, Mar: 4.2, Apr: -1.5, May: 3.8, Jun: -0.3, Jul: 5.1, Aug: -2.1, Sep: 3.6, Oct: -1.2, Nov: 4.5, Dec: 2.8 },
    { year: 2024, Jan: 3.2, Feb: 1.8, Mar: -2.3, Apr: 4.6, May: -0.9, Jun: 2.1, Jul: 3.7, Aug: -1.6, Sep: 5.2, Oct: -0.7, Nov: 3.9, Dec: 2.4 },
  ];

  const timeframes = ['1M', '3M', '6M', '1Y', 'ALL'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch portfolio summary data
        const portfolioRes = await fetch('http://localhost:5001/portfolio_summary');
        if (!portfolioRes.ok) throw new Error('Failed to fetch portfolio data');
        const portfolioJson = await portfolioRes.json();
        
        // Format data for charts
        const formattedData = portfolioJson.map((item: any) => ({
          date: new Date(item.date).getTime(),
          value: item.equity,
          drawdown: item.drawdown
        }));
        setPortfolioData(formattedData);
        
        // Fetch available tickers
        const tickersRes = await fetch('http://localhost:5001/tickers');
        if (!tickersRes.ok) throw new Error('Failed to fetch tickers');
        const tickers = await tickersRes.json();
        setTickers(tickers);

        // Fetch returns histogram data
        const histogramRes = await fetch('http://localhost:5001/returns_histogram');
        const rawData = await histogramRes.json();

        const formattedHistogram = rawData.map(bin => ({
          ...bin,
          midpoint: ((bin.bin_start + bin.bin_end) / 2).toFixed(3)
        }));
        setReturnsHistogram(formattedHistogram);



        

        // Set default selected stocks (first 3)
        const defaultStocks = tickers.slice(0, 3);
        setSelectedStocks(defaultStocks);
        
        // Fetch data for default stocks
        const stockData: StockData = {};
        for (const ticker of defaultStocks) {
          const res = await fetch(`http://localhost:5001/candlestick/${ticker}`);
          if (!res.ok) continue;
          const data = await res.json();
          stockData[ticker] = data.data.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
            value: item.close,
            action: item.action
          }));
        }
        setStockData(stockData);
        
        // Fetch performance metrics
        const metricsRes = await fetch('http://localhost:5001/performance_metrics');
        if (!metricsRes.ok) throw new Error('Failed to fetch performance metrics');
        const metricsData: PerformanceMetric[] = await metricsRes.json();
        setPerformanceMetrics(metricsData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Create formatter for currency values
  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Calculate portfolio metrics for the top cards
  const initialValue = portfolioData.length > 0 ? portfolioData[0].value : 0;
  const finalValue = portfolioData.length > 0 ? portfolioData[portfolioData.length - 1].value : 0;
  const profit = finalValue - initialValue;
  
  // Format profit with sign and currency symbol
  let profitText = currencyFormatter.format(Math.abs(profit));
  if (profit > 0) {
    profitText = `+${profitText}`;
  } else if (profit < 0) {
    profitText = `-${profitText}`;
  }

  // Get metric value safely
  const getMetricValue = (metricName: string) => {
    const metric = performanceMetrics.find(m => m.metric === metricName);
    return metric ? metric.value : 'N/A';
  };

  // Helper to get numeric value safely
  const getMetricNumericValue = (metricName: string) => {
    const value = getMetricValue(metricName);
    if (value === 'N/A') return NaN;
    // Remove percentage sign if present
    const cleanValue = value.replace('%', '');
    return parseFloat(cleanValue);
  };

  // Get position color for buy/sell markers
  const getPositionColor = (position: string | null) => {
    if (position === 'buy') return '#10b981';
    if (position === 'sell') return '#ef4444';
    return 'transparent';
  };

  // Get CSS class for PnL cell based on value
  const getPnLCellColor = (value: number) => {
    if (value > 3) return 'bg-green-600/30 text-green-300';
    if (value > 1) return 'bg-green-500/20 text-green-400';
    if (value > 0) return 'bg-green-400/10 text-green-500';
    if (value > -1) return 'bg-red-400/10 text-red-500';
    if (value > -2) return 'bg-red-500/20 text-red-400';
    return 'bg-red-600/30 text-red-300';
  };

  const handleBackToCodeEditor = () => {
    navigate('/code-editor');
  };

  const handleStockToggle = async (stock: string, checked: boolean) => {
    if (checked) {
      // Add stock to selection
      setSelectedStocks(prev => [...prev, stock]);
      
      // Fetch data for this stock if not already loaded
      if (!stockData[stock]) {
        try {
          const res = await fetch(`http://localhost:5001/candlestick/${stock}`);
          if (!res.ok) return;
          const data = await res.json();
          const formattedData = data.data.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
            value: item.close,
            action: item.action
          }));
          
          setStockData(prev => ({
            ...prev,
            [stock]: formattedData
          }));
        } catch (error) {
          console.error(`Error fetching data for ${stock}:`, error);
        }
      }
    } else {
      // Remove stock from selection
      setSelectedStocks(prev => prev.filter(s => s !== stock));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p>Loading backtest results...</p>
        </div>
      </div>
    );
  }


  // Precompute metric values for top cards
  const totalReturn = getMetricValue('Total Return');
  const cagr = getMetricValue('CAGR');
  const sharpeRatio = getMetricValue('Sharpe Ratio');
  const maxDrawdown = getMetricValue('Max Drawdown');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-black border-b border-emerald-900/20 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToCodeEditor}
              className="flex items-center space-x-2 text-gray-300 hover:text-emerald-400 transition-colors mr-6"
            >
              <ArrowLeft size={20} />
              <span>Back to Code Editor</span>
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                Backtest Strategy Analysis
              </h1>
              <p className="text-gray-300 mt-2">
                Comprehensive backtesting results and performance metrics
              </p>
            </div>
            
            <div className="flex space-x-2">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={selectedTimeframe === timeframe 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "border-emerald-700 text-emerald-400 hover:bg-emerald-900/30"
                  }
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Return</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {totalReturn}
                </p>
                <p className="text-sm text-emerald-400 flex items-center">
                  <ArrowUpRight size={16} className="mr-1" />
                  {cagr}
                </p>
              </div>
              <TrendingUp className="text-emerald-400" size={32} />
            </div>
          </Card>
          
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Portfolio Value</p>
                <p className="text-2xl font-bold text-white">
                  {currencyFormatter.format(finalValue)}
                </p>
                <p className={`text-sm flex items-center ${
                  profit >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {profit >= 0 ? (
                    <ArrowUpRight size={16} className="mr-1" />
                  ) : (
                    <ArrowDownRight size={16} className="mr-1" />
                  )}
                  {profitText}
                </p>
              </div>
              <DollarSign className="text-green-400" size={32} />
            </div>
          </Card>
          
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-blue-400">
                  {sharpeRatio}
                </p>
                <p className="text-sm text-blue-400 flex items-center">
                  <ArrowUpRight size={16} className="mr-1" />
                  {!isNaN(getMetricNumericValue('Sharpe Ratio')) && 
                    (getMetricNumericValue('Sharpe Ratio') > 1.5 ? 'Excellent' : 'Good')}
                </p>
              </div>
              <Target className="text-blue-400" size={32} />
            </div>
          </Card>
          
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-400">
                  {maxDrawdown}
                </p>
                <p className="text-sm text-red-400 flex items-center">
                  <ArrowDownRight size={16} className="mr-1" />
                  {!isNaN(getMetricNumericValue('Max Drawdown')) && 
                    (Math.abs(getMetricNumericValue('Max Drawdown')) < 10 ? 
                    'Within limits' : 'High risk')}
                </p>
              </div>
              <Activity className="text-red-400" size={32} />
            </div>
          </Card>
        </div>

        {/* Equity Curve and Drawdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">Equity Curve</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(timestamp) => new Date(timestamp).getFullYear().toString()}
                  minTickGap={40}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Portfolio Value']} 
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#equityGradient)"
                  name="Portfolio Value"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6">Drawdown Curve</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(timestamp) => new Date(timestamp).getFullYear().toString()}
                  minTickGap={40}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  }}
                  formatter={(value) => [`${value}%`, 'Drawdown']} 
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#drawdownGradient)"
                  name="Drawdown %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Returns Histogram */}
        {returnsHistogram.length > 0 ? (
          <Card className="p-6 bg-gray-800/50 border-gray-700 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <BarChart3 className="mr-2" />
              Histogram of Returns
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={returnsHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="midpoint"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  height={60}
                />


                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [value, 'Frequency']}
                  labelFormatter={(label: any, payload: any[]) => {
                    if (!payload || !payload.length || !payload[0]?.payload) return '';
                    
                    const bin = payload[0].payload;
                    return `[${bin.bin_start.toFixed(3)}, ${bin.bin_end.toFixed(3)}]`;
                  }}
                />



                <Bar dataKey="frequency" fill="#3b82f6" name="Frequency" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        ) : !loading && (
          <Card className="p-6 bg-gray-800/50 border-gray-700 mb-8 h-80 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <BarChart3 className="mx-auto mb-4" size={48} />
              <p>No returns distribution data available</p>
            </div>
          </Card>
        )}

        {/* Stock Selection and Individual Curves */}
        <Card className="p-6 bg-gray-800/50 border-gray-700 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold text-white">Individual Stock Performance</h3>
            <div className="flex flex-wrap gap-2">
              {tickers.map((ticker) => (
                <div key={ticker} className="flex items-center space-x-2">
                  <Checkbox
                    id={ticker}
                    checked={selectedStocks.includes(ticker)}
                    onCheckedChange={(checked) => 
                      handleStockToggle(ticker, checked === true)
                    }
                  />
                  <label htmlFor={ticker} className="text-sm text-gray-300">{ticker}</label>
                </div>
              ))}
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              {selectedStocks.map((ticker, index) => {
                const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];
                const stockPoints = stockData[ticker] || [];
                
                return (
                  <Line
                    key={ticker}
                    type="monotone"
                    dataKey="value"
                    data={stockPoints}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={ticker}
                    dot={(props: any) => {
                      const point = stockPoints[props.index];
                      if (!point) return null;
                      
                      const action = point.action;
                      return action === 'buy' || action === 'sell' ? (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={4}
                          fill={getPositionColor(action)}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      ) : null;
                    }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly PnL Heatmap */}
        <Card className="p-6 bg-gray-800/50 border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Calendar className="mr-2" />
            Monthly P&L Heatmap
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Year</TableHead>
                  <TableHead className="text-gray-300">Jan</TableHead>
                  <TableHead className="text-gray-300">Feb</TableHead>
                  <TableHead className="text-gray-300">Mar</TableHead>
                  <TableHead className="text-gray-300">Apr</TableHead>
                  <TableHead className="text-gray-300">May</TableHead>
                  <TableHead className="text-gray-300">Jun</TableHead>
                  <TableHead className="text-gray-300">Jul</TableHead>
                  <TableHead className="text-gray-300">Aug</TableHead>
                  <TableHead className="text-gray-300">Sep</TableHead>
                  <TableHead className="text-gray-300">Oct</TableHead>
                  <TableHead className="text-gray-300">Nov</TableHead>
                  <TableHead className="text-gray-300">Dec</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyPnL.map((yearData) => (
                  <TableRow key={yearData.year}>
                    <TableCell className="font-medium text-white">{yearData.year}</TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Jan)}`}>
                      {yearData.Jan > 0 ? '+' : ''}{yearData.Jan}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Feb)}`}>
                      {yearData.Feb > 0 ? '+' : ''}{yearData.Feb}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Mar)}`}>
                      {yearData.Mar > 0 ? '+' : ''}{yearData.Mar}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Apr)}`}>
                      {yearData.Apr > 0 ? '+' : ''}{yearData.Apr}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.May)}`}>
                      {yearData.May > 0 ? '+' : ''}{yearData.May}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Jun)}`}>
                      {yearData.Jun > 0 ? '+' : ''}{yearData.Jun}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Jul)}`}>
                      {yearData.Jul > 0 ? '+' : ''}{yearData.Jul}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Aug)}`}>
                      {yearData.Aug > 0 ? '+' : ''}{yearData.Aug}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Sep)}`}>
                      {yearData.Sep > 0 ? '+' : ''}{yearData.Sep}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Oct)}`}>
                      {yearData.Oct > 0 ? '+' : ''}{yearData.Oct}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Nov)}`}>
                      {yearData.Nov > 0 ? '+' : ''}{yearData.Nov}%
                    </TableCell>
                    <TableCell className={`text-center font-medium ${getPnLCellColor(yearData.Dec)}`}>
                      {yearData.Dec > 0 ? '+' : ''}{yearData.Dec}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Performance Metrics Table */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceMetrics.map((metric) => (
              <div key={metric.metric} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-gray-300">{metric.metric}</h4>
                  <span className={`text-lg font-bold ${
                    metric.value.includes('-') ? 'text-red-400' : 
                    metric.value.includes('+') || parseFloat(metric.value) > 0 ? 'text-green-400' : 
                    'text-white'
                  }`}>
                    {metric.value}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{metric.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Platform;
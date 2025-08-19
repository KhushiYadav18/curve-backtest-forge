'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { parse } from 'date-fns';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';

interface PortfolioDataPoint {
  date: string;
  equity: number;
  returns: number;
  drawdown: number;
  
}

const EquityDrawdownCharts = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/portfolio_summary');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched portfolio data:', data);

        
        // Format dates and convert numbers
        // const formattedData = data.map((item: any) => {
        //   const parsedDate = parse(item.date, 'yyyy-MM-dd HH:mm:ss', new Date());

        //   return {
        //     ...item,
        //     date: format(parsedDate, 'MMM dd, yyyy'),
        //     equity: parseFloat(item.equity),
        //     drawdown: parseFloat(item.drawdown) * 100,
        //     returns: parseFloat(item.returns) * 100
        //   };
        // });
        const formattedData = data.map((item: any) => ({
            ...item,
            date: new Date(item.date), // Keep as actual Date object
            equity: parseFloat(item.equity),
            drawdown: parseFloat(item.drawdown) * 100,
            returns: parseFloat(item.returns) * 100
          })).sort((a, b) => a.date.getTime() - b.date.getTime()); // Ensure chronological order


        console.log('Formatted data:', formattedData);

        
        setPortfolioData(formattedData);
      } catch (err) {
        console.error('Failed to fetch portfolio data:', err);
        setError('Failed to load portfolio data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-lg">
          <p className="text-sm text-gray-300 mb-2">{format(new Date(label), 'MMM yyyy')}</p>

          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.name.includes('drawdown') ? `${entry.value.toFixed(2)}%` : `$${entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6 bg-gray-800/50 border-gray-700 h-[350px] flex items-center justify-center">
          <div className="text-gray-400">Loading equity curve...</div>
        </Card>
        <Card className="p-6 bg-gray-800/50 border-gray-700 h-[350px] flex items-center justify-center">
          <div className="text-gray-400">Loading drawdown curve...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6 bg-gray-800/50 border-gray-700 h-[350px] flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </Card>
        <Card className="p-6 bg-gray-800/50 border-gray-700 h-[350px] flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </Card>
      </div>
    );
  }

  if (portfolioData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6 bg-gray-800/50 border-gray-700 h-[350px] flex items-center justify-center">
          <div className="text-gray-400">No portfolio data available</div>
        </Card>
        <Card className="p-6 bg-gray-800/50 border-gray-700 h-[350px] flex items-center justify-center">
          <div className="text-gray-400">No portfolio data available</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Equity Curve Card */}
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6">Equity Curve</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={portfolioData}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tickFormatter={(value) => format(new Date(value), 'yyyy')}  // Show only year
              interval="preserveStartEnd"
              minTickGap={50}
            />


            <YAxis 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#equityGradient)"
              name="Portfolio Value"
              activeDot={{ r: 6, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Drawdown Curve Card */}
      <Card className="p-6 bg-gray-800/50 border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6">Drawdown Curve</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={portfolioData}>
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tickFormatter={(value) => format(new Date(value), 'yyyy')}  // Show only year
              interval="preserveStartEnd"
              minTickGap={50}
            />


            <YAxis 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#drawdownGradient)"
              name="Drawdown"
              activeDot={{ r: 6, fill: '#ef4444' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default EquityDrawdownCharts;
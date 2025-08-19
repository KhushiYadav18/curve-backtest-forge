import { Card } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { ReturnsDataPoint } from './types';

interface ReturnsHistogramProps {
  returnsHistogram: ReturnsDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-emerald-700/30 rounded-lg p-4 shadow-lg">
        <p className="text-emerald-400 font-medium">{`Return: ${payload[0].payload.return}`}</p>
        <p className="text-blue-400">{`Frequency: ${payload[0].value}`}</p>
        <p className="text-xs text-gray-400 mt-2">
          {payload[0].value === 1 ? '1 occurrence' : `${payload[0].value} occurrences`}
        </p>
      </div>
    );
  }
  return null;
};

const ReturnsHistogram = ({ returnsHistogram }: ReturnsHistogramProps) => {
  // Sort the data by return value (lowest to highest)
  const sortedData = [...returnsHistogram].sort((a, b) => {
    const aValue = parseInt(a.return.replace('%', ''));
    const bValue = parseInt(b.return.replace('%', ''));
    return aValue - bValue;
  });

  // Calculate total occurrences for percentage calculation
  const totalFrequency = sortedData.reduce((sum, item) => sum + item.frequency, 0);

  // Add percentage to each data point
  const dataWithPercentage = sortedData.map(item => ({
    ...item,
    percentage: totalFrequency > 0 ? Math.round((item.frequency / totalFrequency) * 100) : 0
  }));

  return (
    <Card className="p-6 bg-gray-800/50 border border-emerald-900/30 rounded-xl shadow-lg mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <BarChart3 className="mr-2 text-emerald-400" size={24} />
          Distribution of Daily Returns
        </h3>
        <div className="text-sm text-gray-400">
          Total days: {totalFrequency}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataWithPercentage} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="rangeLabel"
            stroke="#9ca3af"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
          />

          <YAxis 
            stroke="#9ca3af" 
            axisLine={false}
            tickLine={false}
            tickCount={6}
            domain={[0, 'dataMax + 5']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="frequency" 
            fill="#3b82f6" 
            name="Frequency"
            radius={[4, 4, 0, 0]}
          >
            <LabelList 
              dataKey="percentage" 
              position="top" 
              //labelFormatter={(label: string) => `Range: ${label}`}
              formatter={(val, name, props) => {
                const { payload } = props[0];
                return [`[${payload.bin_start}, ${payload.bin_end}]`, 'Returns Range'];
              }} 
              fill="#93c5fd"
              className="text-xs"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-400 flex justify-between">
        <div className="text-emerald-400">
          Most frequent: {dataWithPercentage.reduce((max, item) => 
            item.frequency > max.frequency ? item : max, dataWithPercentage[0]).return}
        </div>
        <div className="text-rose-400">
          Least frequent: {dataWithPercentage.reduce((min, item) => 
            item.frequency < min.frequency ? item : min, dataWithPercentage[0]).return}
        </div>
      </div>
    </Card>
  );
};

export default ReturnsHistogram;
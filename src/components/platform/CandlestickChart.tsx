// components/CandlestickChart.tsx
'use client';

import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const CandlestickChart = () => {
  const [plotData, setPlotData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5001/candlestick')
      .then((res) => res.json())
      .then((data) => {
        setPlotData(data);
      });
  }, []);

  if (!plotData) return <p className="text-white">Loading candlestick chart...</p>;

  return (
    <div className="p-4 bg-gray-900 rounded-xl">
      <Plot
        data={plotData.data}
        layout={plotData.layout}
        config={{ responsive: true }}
        style={{ width: '100%', height: '500px' }}
      />
    </div>
  );
};

export default CandlestickChart;

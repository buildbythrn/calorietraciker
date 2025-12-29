'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';

interface WeightChartProps {
  data: { date: string; weight: number }[];
  goalWeight?: number;
}

export default function WeightChart({ data, goalWeight }: WeightChartProps) {
  const chartData = data.map(item => ({
    date: format(parseISO(item.date), 'MMM d'),
    weight: item.weight,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          formatter={(value: number) => [`${value} kg`, 'Weight']}
        />
        <Legend />
        {goalWeight && (
          <ReferenceLine 
            y={goalWeight} 
            stroke="#ef4444" 
            strokeDasharray="5 5"
            label={{ value: 'Goal', position: 'right' }}
          />
        )}
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#f59e0b" 
          strokeWidth={2}
          dot={{ fill: '#f59e0b', r: 4 }}
          name="Weight (kg)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


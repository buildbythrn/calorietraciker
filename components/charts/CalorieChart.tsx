'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface CalorieChartProps {
  data: { date: string; calories: number }[];
}

export default function CalorieChart({ data }: CalorieChartProps) {
  const chartData = data.map(item => ({
    date: format(parseISO(item.date), 'MMM d'),
    calories: item.calories,
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
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          formatter={(value: number) => [`${value} cal`, 'Calories']}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="calories" 
          stroke="#22c55e" 
          strokeWidth={2}
          dot={{ fill: '#22c55e', r: 4 }}
          name="Calories"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


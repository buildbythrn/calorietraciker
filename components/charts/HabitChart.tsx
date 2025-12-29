'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface HabitChartProps {
  data: { date: string; completed: number; total: number }[];
}

export default function HabitChart({ data }: HabitChartProps) {
  const chartData = data.map(item => ({
    date: format(parseISO(item.date), 'MMM d'),
    completionRate: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
    completed: item.completed,
    total: item.total,
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
          domain={[0, 100]}
          label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          formatter={(value: number, name: string) => {
            if (name === 'completionRate') {
              return [`${value}%`, 'Completion Rate'];
            }
            return [value, name];
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="completionRate" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          name="Completion Rate (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


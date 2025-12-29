'use client';

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface ProgressChartProps {
  calorieData: { date: string; calories: number }[];
  workoutData: { date: string; calories: number }[];
}

export default function ProgressChart({ calorieData, workoutData }: ProgressChartProps) {
  // Combine data by date
  const combined: Record<string, { date: string; caloriesIn: number; caloriesOut: number; net: number }> = {};
  
  calorieData.forEach(item => {
    if (!combined[item.date]) {
      combined[item.date] = {
        date: format(parseISO(item.date), 'MMM d'),
        caloriesIn: 0,
        caloriesOut: 0,
        net: 0,
      };
    }
    combined[item.date].caloriesIn = item.calories;
  });
  
  workoutData.forEach(item => {
    if (!combined[item.date]) {
      combined[item.date] = {
        date: format(parseISO(item.date), 'MMM d'),
        caloriesIn: 0,
        caloriesOut: 0,
        net: 0,
      };
    }
    combined[item.date].caloriesOut = item.calories;
  });

  const chartData = Object.values(combined)
    .map(item => ({
      ...item,
      net: item.caloriesIn - item.caloriesOut,
    }))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <Bar 
          yAxisId="left"
          dataKey="caloriesIn" 
          fill="#22c55e" 
          name="Calories In"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          yAxisId="left"
          dataKey="caloriesOut" 
          fill="#ec4899" 
          name="Calories Out"
          radius={[4, 4, 0, 0]}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="net" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          name="Net Calories"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}


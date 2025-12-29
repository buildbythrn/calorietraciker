'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface WorkoutChartProps {
  frequencyData: { date: string; count: number }[];
  caloriesData: { date: string; calories: number }[];
}

export default function WorkoutChart({ frequencyData, caloriesData }: WorkoutChartProps) {
  // Combine data
  const combinedData: Record<string, { date: string; workouts: number; calories: number }> = {};
  
  frequencyData.forEach(item => {
    combinedData[item.date] = {
      date: format(parseISO(item.date), 'MMM d'),
      workouts: item.count,
      calories: 0,
    };
  });
  
  caloriesData.forEach(item => {
    if (combinedData[item.date]) {
      combinedData[item.date].calories = item.calories;
    } else {
      combinedData[item.date] = {
        date: format(parseISO(item.date), 'MMM d'),
        workouts: 0,
        calories: item.calories,
      };
    }
  });

  const chartData = Object.values(combinedData).sort((a, b) => 
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
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
          dataKey="workouts" 
          fill="#8b5cf6" 
          name="Workouts"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          yAxisId="right"
          dataKey="calories" 
          fill="#ec4899" 
          name="Calories Burned"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}


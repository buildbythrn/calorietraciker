import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  getCalorieEntries, 
  getWorkouts, 
  getHabits, 
  getWeightEntries,
  getWaterEntries,
  getBodyMeasurements 
} from './db';
import { format, parseISO } from 'date-fns';
import { getDateRange, DateRange } from './analytics';

export const exportToCSV = async (userId: string) => {
  // Get all data
  const allData: any = {
    calories: [],
    workouts: [],
    habits: [],
    weight: [],
    water: [],
    measurements: [],
  };

  // Get date range for entries
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30); // Last 30 days

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const calories = await getCalorieEntries(userId, dateStr);
    allData.calories.push(...calories);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const workouts = await getWorkouts(userId);
  const habits = await getHabits(userId);
  const weight = await getWeightEntries(userId);
  
  // Get water entries
  currentDate.setTime(start.getTime());
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const water = await getWaterEntries(userId, dateStr);
    allData.water.push(...water);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const measurements = await getBodyMeasurements(userId);

  // Convert to CSV
  let csv = 'Calorie Entries\n';
  csv += 'Date,Food,Calories,Meal Type\n';
  allData.calories.forEach((entry: any) => {
    csv += `${entry.date},${entry.food},${entry.calories},${entry.mealType}\n`;
  });

  csv += '\nWorkouts\n';
  csv += 'Date,Name,Type,Duration,Calories Burned,Weight,Sets,Reps\n';
  workouts.forEach((workout: any) => {
    csv += `${workout.date},${workout.name},${workout.type},${workout.duration || ''},${workout.caloriesBurned || ''},${workout.weight || ''},${workout.sets || ''},${workout.reps || ''}\n`;
  });

  csv += '\nWeight Entries\n';
  csv += 'Date,Weight (kg),Notes\n';
  weight.forEach((entry: any) => {
    csv += `${entry.date},${entry.weight},${entry.notes || ''}\n`;
  });

  csv += '\nWater Intake\n';
  csv += 'Date,Amount (ml)\n';
  allData.water.forEach((entry: any) => {
    csv += `${entry.date},${entry.amount}\n`;
  });

  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitflow-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = async (userId: string, dateRange: DateRange = 'month') => {
  const doc = new jsPDF();
  const { start, end } = getDateRange(dateRange);

  // Title
  doc.setFontSize(20);
  doc.text('FitFlow Report', 14, 20);
  doc.setFontSize(12);
  doc.text(`Period: ${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`, 14, 30);

  let yPos = 40;

  // Calorie Entries
  doc.setFontSize(16);
  doc.text('Calorie Entries', 14, yPos);
  yPos += 10;

  const currentDate = new Date(start);
  const calorieData: any[] = [];
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const entries = await getCalorieEntries(userId, dateStr);
    entries.forEach(entry => {
      calorieData.push([
        format(parseISO(entry.date), 'MMM d, yyyy'),
        entry.food,
        entry.calories.toString(),
        entry.mealType,
      ]);
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (calorieData.length > 0) {
    autoTable(doc, {
      head: [['Date', 'Food', 'Calories', 'Meal Type']],
      body: calorieData.slice(0, 50), // Limit to 50 entries
      startY: yPos,
      styles: { fontSize: 8 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Workouts
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.text('Workouts', 14, yPos);
  yPos += 10;

  const workouts = await getWorkouts(userId);
  const workoutData = workouts
    .filter(w => {
      const workoutDate = parseISO(w.date);
      return workoutDate >= start && workoutDate <= end;
    })
    .slice(0, 50)
    .map(workout => [
      format(parseISO(workout.date), 'MMM d, yyyy'),
      workout.name,
      workout.type,
      workout.duration?.toString() || '',
      workout.caloriesBurned?.toString() || '',
    ]);

  if (workoutData.length > 0) {
    autoTable(doc, {
      head: [['Date', 'Exercise', 'Type', 'Duration (min)', 'Calories']],
      body: workoutData,
      startY: yPos,
      styles: { fontSize: 8 },
    });
  }

  // Save PDF
  doc.save(`fitflow-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const backupData = async (userId: string): Promise<string> => {
  // Get all data
  const backup: any = {
    timestamp: new Date().toISOString(),
    calories: [],
    workouts: [],
    habits: [],
    weight: [],
    water: [],
    measurements: [],
  };

  // Get all calorie entries (last 365 days)
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 365);

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const calories = await getCalorieEntries(userId, dateStr);
    backup.calories.push(...calories.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const workouts = await getWorkouts(userId);
  backup.workouts = workouts.map(w => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
  }));

  const habits = await getHabits(userId);
  backup.habits = habits.map(h => ({
    ...h,
    createdAt: h.createdAt.toISOString(),
  }));

  const weight = await getWeightEntries(userId);
  backup.weight = weight.map(w => ({
    ...w,
    createdAt: w.createdAt.toISOString(),
  }));

  // Get water entries
  currentDate.setTime(start.getTime());
  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const water = await getWaterEntries(userId, dateStr);
    backup.water.push(...water.map(w => ({
      ...w,
      createdAt: w.createdAt.toISOString(),
    })));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const measurements = await getBodyMeasurements(userId);
  backup.measurements = measurements.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  // Convert to JSON and download
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitflow-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  return json;
};

export const restoreData = async (userId: string, backupJson: string) => {
  // This would require implementing restore functions in db.ts
  // For now, just parse and validate
  try {
    const backup = JSON.parse(backupJson);
    if (!backup.timestamp) {
      throw new Error('Invalid backup file');
    }
    // TODO: Implement restore logic
    return backup;
  } catch (error) {
    throw new Error('Failed to parse backup file');
  }
};


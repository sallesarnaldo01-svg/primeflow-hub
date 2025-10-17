import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BurndownChartProps {
  sprintData?: {
    totalStoryPoints: number;
    completedStoryPoints: number;
    sprintDays: number;
    currentDay: number;
  };
}

export function BurndownChart({ sprintData }: BurndownChartProps) {
  // Gera dados do burndown baseado em dados reais ou usa mock
  const generateBurndownData = () => {
    if (!sprintData) {
      return [
        { day: 'Dia 1', ideal: 42, real: 42 },
        { day: 'Dia 2', ideal: 39, real: 40 },
        { day: 'Dia 3', ideal: 36, real: 38 },
        { day: 'Dia 4', ideal: 33, real: 35 },
        { day: 'Dia 5', ideal: 30, real: 32 },
        { day: 'Dia 6', ideal: 27, real: 28 },
        { day: 'Dia 7', ideal: 24, real: 25 },
        { day: 'Dia 8', ideal: 21, real: 22 },
        { day: 'Dia 9', ideal: 18, real: 18 },
        { day: 'Dia 10', ideal: 15, real: 15 },
      ];
    }

    const { totalStoryPoints, completedStoryPoints, sprintDays, currentDay } = sprintData;
    const data = [];
    const idealDecrement = totalStoryPoints / sprintDays;
    let remainingPoints = totalStoryPoints;

    for (let i = 0; i <= Math.min(currentDay, sprintDays); i++) {
      const ideal = Math.max(0, totalStoryPoints - idealDecrement * i);
      const real = i === currentDay ? totalStoryPoints - completedStoryPoints : remainingPoints;
      
      data.push({
        day: `Dia ${i + 1}`,
        ideal: Math.round(ideal),
        real: Math.round(real),
      });

      if (i < currentDay) {
        remainingPoints -= Math.random() * idealDecrement * 1.5;
      }
    }

    return data;
  };

  const burndownData = generateBurndownData();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Burndown Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={burndownData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#94a3b8"
              strokeWidth={2}
              name="Ideal"
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="real"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Real"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

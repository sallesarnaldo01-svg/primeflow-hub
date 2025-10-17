import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface VelocityChartProps {
  sprints?: Array<{
    name: string;
    totalStoryPoints: number;
    completedStoryPoints: number;
  }>;
}

export function VelocityChart({ sprints }: VelocityChartProps) {
  // Usa dados reais ou fallback para mock
  const velocityData = sprints && sprints.length > 0
    ? sprints.map(sprint => ({
        sprint: sprint.name,
        planejado: sprint.totalStoryPoints,
        concluido: sprint.completedStoryPoints,
      }))
    : [
        { sprint: 'Sprint 18', planejado: 35, concluido: 32 },
        { sprint: 'Sprint 19', planejado: 38, concluido: 38 },
        { sprint: 'Sprint 20', planejado: 40, concluido: 36 },
        { sprint: 'Sprint 21', planejado: 42, concluido: 40 },
        { sprint: 'Sprint 22', planejado: 42, concluido: 42 },
        { sprint: 'Sprint 23', planejado: 42, concluido: 27 },
      ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Velocity Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={velocityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sprint" />
            <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="planejado" fill="#94a3b8" name="Planejado" />
            <Bar dataKey="concluido" fill="hsl(var(--primary))" name="Concluído" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

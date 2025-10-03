import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, TooltipProps, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface ModernPieChartProps {
  data: ChartData[];
  title?: string;
  description?: string;
  height?: number;
  innerRadius?: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--warning))',
  'hsl(var(--success))',
  'hsl(var(--info))',
];

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass-effect rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: data.payload.fill }} />
          <span className="text-sm font-semibold text-foreground">{data.name}</span>
        </div>
        <p className="text-lg font-bold mt-1" style={{ color: data.payload.fill }}>
          {data.value} ({((data.value / data.payload.total) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export function ModernPieChart({
  data,
  title,
  description,
  height = 300,
  innerRadius = 0,
}: ModernPieChartProps) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const dataWithTotal = data.map((entry) => ({ ...entry, total }));

  return (
    <Card className="card-modern">
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex gap-1">
              {data.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full"
                  style={{ background: item.color || COLORS[index % COLORS.length] }}
                />
              ))}
            </div>
            {title}
          </CardTitle>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={innerRadius ? 100 : 80}
              paddingAngle={2}
              dataKey="value"
              animationDuration={1000}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
            >
              {dataWithTotal.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span className="text-sm">
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
  name: string;
  [key: string]: any;
}

interface BarConfig {
  dataKey: string;
  name: string;
  color: string;
}

interface ModernBarChartProps {
  data: ChartData[];
  bars: BarConfig[];
  title?: string;
  description?: string;
  height?: number;
  stacked?: boolean;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-effect rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ModernBarChart({
  data,
  bars,
  title,
  description,
  height = 300,
  stacked = false,
}: ModernBarChartProps) {
  return (
    <Card className="card-modern">
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex gap-1">
              {bars.slice(0, 3).map((bar, index) => (
                <div
                  key={index}
                  className="w-1 h-4 rounded-full animate-pulse-glow"
                  style={{ background: bar.color, animationDelay: `${index * 0.2}s` }}
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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            {bars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

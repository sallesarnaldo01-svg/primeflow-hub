import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiUsageService, UsageStats } from '@/services/aiUsage';
import { ModernBarChart } from '@/components/charts/ModernBarChart';
import { ModernPieChart } from '@/components/charts/ModernPieChart';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function IAPerformance() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // @ts-ignore - Supabase types not regenerated
      const { data: usageData, error } = await (supabase as any)
        .from('ai_usage')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      if (!usageData || usageData.length === 0) {
        setStats({
          totalInteractions: 0,
          totalTokens: 0,
          totalCost: 0,
          totalPromptTokens: 0,
          totalCompletionTokens: 0,
          byModel: []
        });
        setLoading(false);
        return;
      }

      // Agrupar por modelo
      const byModel = usageData.reduce((acc: any, usage: any) => {
        const model = usage.model || 'unknown';
        if (!acc[model]) {
          acc[model] = { 
            model, 
            interactions: 0, 
            totalTokens: 0, 
            totalCost: 0 
          };
        }
        acc[model].interactions++;
        acc[model].totalTokens += usage.total_tokens || 0;
        acc[model].totalCost += parseFloat(usage.cost?.toString() || '0');
        return acc;
      }, {});

      const processedStats: UsageStats = {
        totalInteractions: usageData.length,
        totalTokens: usageData.reduce((sum: number, u: any) => sum + (u.total_tokens || 0), 0),
        totalCost: usageData.reduce((sum: number, u: any) => sum + parseFloat(u.cost?.toString() || '0'), 0),
        totalPromptTokens: usageData.reduce((sum: number, u: any) => sum + (u.prompt_tokens || 0), 0),
        totalCompletionTokens: usageData.reduce((sum: number, u: any) => sum + (u.completion_tokens || 0), 0),
        byModel: Object.values(byModel) as { model: string; interactions: number; totalTokens: number; totalCost: number; }[]
      };

      setStats(processedStats);
    } catch (error: any) {
      toast.error('Erro ao carregar estatísticas: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  };

  if (!stats) {
    return <div className="container mx-auto p-6">Sem dados disponíveis</div>;
  }

  const barChartData = stats.byModel.map(m => ({
    name: m.model,
    Interações: m.interactions,
    Tokens: m.totalTokens,
    Custo: parseFloat(m.totalCost.toFixed(2))
  }));

  const pieChartData = stats.byModel.map(m => ({
    name: m.model,
    value: m.interactions
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Performance de IA</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Interações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalInteractions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalTokens.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Custo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">R$ {stats.totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tokens de Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalPromptTokens.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernBarChart
          data={barChartData}
          bars={[
            { dataKey: 'Interações', name: 'Interações', color: 'hsl(var(--primary))' },
            { dataKey: 'Tokens', name: 'Tokens', color: 'hsl(var(--secondary))' },
          ]}
          title="Uso por Modelo"
          description="Interações e tokens por modelo de IA"
        />

        <ModernPieChart
          data={pieChartData}
          title="Distribuição de Interações"
          description="Porcentagem de interações por modelo"
        />

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes por Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byModel.map((model) => (
                <div
                  key={model.model}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{model.model}</p>
                    <p className="text-sm text-muted-foreground">
                      {model.interactions} interações
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {model.totalCost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {model.totalTokens.toLocaleString()} tokens
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

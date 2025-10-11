import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  Filter,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

const funnelStages = [
  { name: 'Prospects', value: 1250, percentage: 100, conversion: 0, color: 'bg-blue-500' },
  { name: 'Qualificados', value: 825, percentage: 66, conversion: 34, color: 'bg-green-500' },
  { name: 'Proposta', value: 412, percentage: 33, conversion: 50, color: 'bg-yellow-500' },
  { name: 'Negociação', value: 206, percentage: 16.5, conversion: 50, color: 'bg-orange-500' },
  { name: 'Fechados', value: 82, percentage: 6.6, conversion: 40, color: 'bg-purple-500' },
];

const metrics = [
  {
    title: 'Receita Total',
    value: 'R$ 485.2K',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    title: 'Taxa de Conversão',
    value: '6.6%',
    change: '+2.1%',
    trend: 'up',
    icon: Target,
  },
  {
    title: 'Tempo Médio',
    value: '28 dias',
    change: '-3 dias',
    trend: 'up',
    icon: Clock,
  },
  {
    title: 'Leads Ativos',
    value: '1,168',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
  },
];

const recentDeals = [
  {
    id: 1,
    company: 'TechCorp LTDA',
    value: 'R$ 25.000',
    stage: 'Negociação',
    probability: 80,
    owner: 'João Santos',
    daysInStage: 5,
    tags: ['Corporativo', 'WhatsApp'],
  },
  {
    id: 2,
    company: 'Startup ABC',
    value: 'R$ 12.500',
    stage: 'Proposta',
    probability: 60,
    owner: 'Ana Costa',
    daysInStage: 12,
    tags: ['Startup', 'Instagram'],
  },
  {
    id: 3,
    company: 'Empresa XYZ',
    value: 'R$ 45.000',
    stage: 'Fechados',
    probability: 100,
    owner: 'Pedro Lima',
    daysInStage: 0,
    tags: ['Enterprise', 'Facebook'],
  },
];

const tagPerformance = [
  { tag: 'WhatsApp', deals: 145, value: 'R$ 180K', conversion: 8.5 },
  { tag: 'Facebook', deals: 89, value: 'R$ 125K', conversion: 6.2 },
  { tag: 'Instagram', deals: 76, value: 'R$ 95K', conversion: 5.8 },
  { tag: 'Corporativo', deals: 34, value: 'R$ 210K', conversion: 12.1 },
  { tag: 'Startup', deals: 52, value: 'R$ 68K', conversion: 4.3 },
];

export default function FunilVendas() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Funil de Vendas</h1>
            <p className="text-muted-foreground">
              Análise de performance e conversão do pipeline
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="30">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <div className="flex items-center mt-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span
                          className={`text-sm ${
                            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funil Visual */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Funil de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelStages.map((stage, index) => (
                  <div key={stage.name} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{stage.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {stage.value.toLocaleString()} leads
                        </span>
                        <Badge variant="outline">{stage.percentage}%</Badge>
                        {index > 0 && (
                          <Badge
                            variant={stage.conversion >= 50 ? 'default' : 'secondary'}
                          >
                            {stage.conversion}% conv.
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${stage.color} transition-all duration-500 ease-out`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {stage.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance por Etiquetas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Performance por Origem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tagPerformance.map((item) => (
                  <div key={item.tag} className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {item.tag}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {item.deals} deals • {item.value}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.conversion}%</p>
                      <p className="text-xs text-muted-foreground">conversão</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deals Recentes e Analytics */}
        <Tabs defaultValue="deals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="deals">Deals em Destaque</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="forecast">Previsão</TabsTrigger>
          </TabsList>

          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades em Destaque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{deal.company}</h4>
                          <Badge variant="outline">{deal.stage}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>👤 {deal.owner}</span>
                          <span>📅 {deal.daysInStage} dias no estágio</span>
                          <span>🎯 {deal.probability}% probabilidade</span>
                        </div>
                        <div className="flex space-x-1 mt-2">
                          {deal.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{deal.value}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Tendências de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Gráficos em Desenvolvimento</h3>
                    <p className="text-muted-foreground">
                      Visualizações detalhadas de tendências e comparativos serão implementadas aqui.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecast">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Previsão de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold text-lg">Este Mês</h4>
                    <p className="text-2xl font-bold text-green-600 mt-2">R$ 125K</p>
                    <p className="text-sm text-muted-foreground">82% da meta</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold text-lg">Próximo Mês</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-2">R$ 180K</p>
                    <p className="text-sm text-muted-foreground">Projeção</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold text-lg">Trimestre</h4>
                    <p className="text-2xl font-bold text-purple-600 mt-2">R$ 450K</p>
                    <p className="text-sm text-muted-foreground">Meta Q1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
}
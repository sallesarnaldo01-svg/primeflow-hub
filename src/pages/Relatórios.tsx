import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRange } from 'react-day-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  MessageSquare,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

// Mock data for charts
const salesData = [
  { month: 'Jan', vendas: 45000, leads: 320, conversoes: 58 },
  { month: 'Fev', vendas: 52000, leads: 410, conversoes: 72 },
  { month: 'Mar', vendas: 48000, leads: 380, conversoes: 65 },
  { month: 'Abr', vendas: 61000, leads: 450, conversoes: 89 },
  { month: 'Mai', vendas: 58000, leads: 420, conversoes: 78 },
  { month: 'Jun', vendas: 67000, leads: 510, conversoes: 94 },
];

const channelData = [
  { name: 'WhatsApp', value: 45, color: '#25D366' },
  { name: 'Instagram', value: 25, color: '#E4405F' },
  { name: 'Facebook', value: 20, color: '#1877F2' },
  { name: 'Site', value: 10, color: '#6366F1' },
];

const agentPerformance = [
  { nome: 'Maria Silva', atendimentos: 89, satisfacao: 4.8, conversoes: 23 },
  { nome: 'João Santos', atendimentos: 76, satisfacao: 4.6, conversoes: 19 },
  { nome: 'Ana Costa', atendimentos: 68, satisfacao: 4.9, conversoes: 21 },
  { nome: 'Pedro Lima', atendimentos: 54, satisfacao: 4.5, conversoes: 15 },
];

const customerSatisfaction = [
  { periodo: 'Jan', satisfacao: 4.2, tickets: 145 },
  { periodo: 'Fev', satisfacao: 4.4, tickets: 167 },
  { periodo: 'Mar', satisfacao: 4.3, tickets: 189 },
  { periodo: 'Abr', satisfacao: 4.6, tickets: 156 },
  { periodo: 'Mai', satisfacao: 4.7, tickets: 134 },
  { periodo: 'Jun', satisfacao: 4.8, tickets: 142 },
];

const metrics = [
  {
    title: 'Receita Total',
    value: 'R$ 331K',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: DollarSign,
    description: 'Últimos 6 meses',
  },
  {
    title: 'Leads Gerados',
    value: '2,490',
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: Users,
    description: 'Últimos 6 meses',
  },
  {
    title: 'Taxa de Conversão',
    value: '18.7%',
    change: '+2.1%',
    changeType: 'positive' as const,
    icon: Target,
    description: 'Média do período',
  },
  {
    title: 'Satisfação',
    value: '4.6/5',
    change: '+0.3',
    changeType: 'positive' as const,
    icon: MessageSquare,
    description: 'Avaliação média',
  },
];

export default function Relatorios() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedReport, setSelectedReport] = useState('vendas');

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios & Analytics</h1>
            <p className="text-muted-foreground">
              Análise completa de performance e métricas de negócio
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="1year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className={`flex items-center ${
                      metric.changeType === 'positive' ? 'text-success' : 'text-destructive'
                    }`}>
                      {metric.changeType === 'positive' ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      )}
                      {metric.change}
                    </span>
                    <span className="ml-2">{metric.description}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Reports */}
        <Tabs defaultValue="vendas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Evolução de Vendas
                  </CardTitle>
                  <CardDescription>
                    Receita mensal e performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                      <Area 
                        type="monotone" 
                        dataKey="vendas" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Funil de Conversão</CardTitle>
                  <CardDescription>
                    Taxa de conversão por etapa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="leads" fill="hsl(var(--muted))" name="Leads" />
                      <Bar dataKey="conversoes" fill="hsl(var(--primary))" name="Conversões" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Sales Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Período</th>
                        <th className="text-left p-2">Vendas</th>
                        <th className="text-left p-2">Leads</th>
                        <th className="text-left p-2">Conversões</th>
                        <th className="text-left p-2">Taxa (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">{row.month}</td>
                          <td className="p-2">R$ {row.vendas.toLocaleString()}</td>
                          <td className="p-2">{row.leads}</td>
                          <td className="p-2">{row.conversoes}</td>
                          <td className="p-2">{((row.conversoes / row.leads) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Channel Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="mr-2 h-4 w-4" />
                    Leads por Canal
                  </CardTitle>
                  <CardDescription>
                    Distribuição de leads por origem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Campaign Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance de Campanhas</CardTitle>
                  <CardDescription>
                    ROI e efetividade das campanhas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Campanha Black Friday</p>
                        <p className="text-sm text-muted-foreground">67 conversões</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">ROI: 340%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Promoção Verão</p>
                        <p className="text-sm text-muted-foreground">43 conversões</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700">ROI: 180%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Anúncios Facebook</p>
                        <p className="text-sm text-muted-foreground">89 conversões</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">ROI: 250%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="atendimento" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Customer Satisfaction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-4 w-4" />
                    Satisfação do Cliente
                  </CardTitle>
                  <CardDescription>
                    Evolução da satisfação mensal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={customerSatisfaction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis domain={[4, 5]} />
                      <Tooltip formatter={(value) => [value, 'Satisfação']} />
                      <Line 
                        type="monotone" 
                        dataKey="satisfacao" 
                        stroke="hsl(var(--success))" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Ticket Volume */}
              <Card>
                <CardHeader>
                  <CardTitle>Volume de Tickets</CardTitle>
                  <CardDescription>
                    Quantidade de tickets por mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={customerSatisfaction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tickets" fill="hsl(var(--warning))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Agent Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Agentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Agente</th>
                        <th className="text-left p-2">Atendimentos</th>
                        <th className="text-left p-2">Satisfação</th>
                        <th className="text-left p-2">Conversões</th>
                        <th className="text-left p-2">Taxa (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentPerformance.map((agent, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{agent.nome}</td>
                          <td className="p-2">{agent.atendimentos}</td>
                          <td className="p-2">{agent.satisfacao}/5</td>
                          <td className="p-2">{agent.conversoes}</td>
                          <td className="p-2">{((agent.conversoes / agent.atendimentos) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6">
              {/* System Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance do Sistema</CardTitle>
                  <CardDescription>
                    Métricas de uptime e resposta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded">
                      <p className="text-2xl font-bold text-success">99.9%</p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <p className="text-2xl font-bold">1.2s</p>
                      <p className="text-sm text-muted-foreground">Tempo de Resposta</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <p className="text-2xl font-bold text-primary">2.4M</p>
                      <p className="text-sm text-muted-foreground">Mensagens Processadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance de Workflows</CardTitle>
                  <CardDescription>
                    Automações mais utilizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Boas-vindas WhatsApp</p>
                        <p className="text-sm text-muted-foreground">1,245 execuções</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">95% sucesso</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Follow-up vendas</p>
                        <p className="text-sm text-muted-foreground">876 execuções</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">88% sucesso</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Suporte automático</p>
                        <p className="text-sm text-muted-foreground">654 execuções</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700">78% sucesso</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
}
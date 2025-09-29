import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Target,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
  Phone,
  Bot,
  Zap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock data
const metrics = [
  {
    title: 'Leads Gerados',
    value: '324',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Users,
    description: 'Novos leads este mês',
  },
  {
    title: 'Taxa de Conversão',
    value: '18.2%',
    change: '+2.1%',
    changeType: 'positive' as const,
    icon: Target,
    description: 'Meta: 20%',
  },
  {
    title: 'Atendimentos',
    value: '1,247',
    change: '-5.3%',
    changeType: 'negative' as const,
    icon: MessageSquare,
    description: '89 em andamento',
  },
  {
    title: 'Receita',
    value: 'R$ 45.2K',
    change: '+8.7%',
    changeType: 'positive' as const,
    icon: DollarSign,
    description: 'Meta mensal atingida',
  },
];

const chartData = [
  { name: 'Jan', leads: 120, conversoes: 24 },
  { name: 'Fev', leads: 180, conversoes: 32 },
  { name: 'Mar', leads: 210, conversoes: 45 },
  { name: 'Abr', leads: 324, conversoes: 59 },
];

const recentDeals = [
  {
    id: '1',
    company: 'TechCorp Solutions',
    value: 'R$ 25.000',
    stage: 'Proposta',
    probability: 75,
    owner: 'Maria Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
  },
  {
    id: '2',
    company: 'StartupXYZ',
    value: 'R$ 12.500',
    stage: 'Negociação',
    probability: 60,
    owner: 'João Santos',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
  },
  {
    id: '3',
    company: 'Empresa ABC',
    value: 'R$ 8.300',
    stage: 'Qualificação',
    probability: 40,
    owner: 'Ana Costa',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
  },
];

const recentActivities = [
  {
    id: '1',
    type: 'deal',
    message: 'Deal "TechCorp Solutions" movido para Proposta',
    time: '2 min atrás',
    user: 'Maria Silva',
    icon: Target,
  },
  {
    id: '2',
    type: 'ticket',
    message: 'Ticket #1247 resolvido',
    time: '15 min atrás',
    user: 'João Santos',
    icon: CheckCircle,
  },
  {
    id: '3',
    type: 'meeting',
    message: 'Reunião agendada com StartupXYZ',
    time: '1h atrás',
    user: 'Ana Costa',
    icon: Calendar,
  },
  {
    id: '4',
    type: 'lead',
    message: '3 novos leads do WhatsApp',
    time: '2h atrás',
    user: 'Sistema',
    icon: MessageSquare,
  },
  {
    id: '5',
    type: 'automation',
    message: 'Workflow "Boas-vindas" executado 12 vezes',
    time: '3h atrás',
    user: 'IA PrimeZap',
    icon: Bot,
  },
];

const upcomingTasks = [
  {
    id: '1',
    title: 'Follow-up com TechCorp',
    time: '14:30',
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Proposta para StartupXYZ',
    time: '16:00',
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'Call de descoberta - Empresa ABC',
    time: '17:30',
    priority: 'low' as const,
  },
];

export default function Dashboard() {
  const { user } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Bom dia, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Aqui está o resumo das suas atividades hoje
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Conectar WhatsApp
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Deal
            </Button>
          </div>
        </motion.div>

        {/* Metrics Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title} className="hover:shadow-md transition-shadow cursor-pointer">
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
                    <Separator orientation="vertical" className="mx-2 h-3" />
                    <span>{metric.description}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Leads</CardTitle>
              <CardDescription>Leads gerados e conversões nos últimos 4 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" name="Leads" />
                  <Bar dataKey="conversoes" fill="hsl(var(--success))" name="Conversões" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance de Canais</CardTitle>
              <CardDescription>Origem dos leads por canal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">WhatsApp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">156 leads</span>
                    <span className="text-sm font-medium">48%</span>
                  </div>
                </div>
                <Progress value={48} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">Facebook</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">89 leads</span>
                    <span className="text-sm font-medium">27%</span>
                  </div>
                </div>
                <Progress value={27} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pink-500 rounded-full" />
                    <span className="text-sm">Instagram</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">67 leads</span>
                    <span className="text-sm font-medium">21%</span>
                  </div>
                </div>
                <Progress value={21} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-sm">Site</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">12 leads</span>
                    <span className="text-sm font-medium">4%</span>
                  </div>
                </div>
                <Progress value={4} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Deals */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Deals Recentes</CardTitle>
                    <CardDescription>
                      Pipeline de vendas em andamento
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDeals.map((deal) => (
                    <div key={deal.id} className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={deal.avatar} />
                        <AvatarFallback>
                          {deal.owner.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{deal.company}</p>
                          <p className="font-semibold text-primary">{deal.value}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{deal.stage}</Badge>
                          <span>•</span>
                          <span>{deal.owner}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={deal.probability} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {deal.probability}%
                          </span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Tarefas de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-destructive' :
                        task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">{activity.message}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{activity.user}</span>
                            <span>•</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
}
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  GitBranch,
  Calendar,
  Target,
  Users,
  Clock,
  BarChart3,
  Plus,
  Play,
  Pause,
  CheckCircle,
} from 'lucide-react';

const sprintData = {
  current: {
    name: 'Sprint 23',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    progress: 65,
    totalStoryPoints: 42,
    completedStoryPoints: 27,
    remainingDays: 5,
  },
  team: {
    velocity: 38,
    capacity: 42,
    members: [
      { name: 'João Santos', capacity: 8, allocated: 7 },
      { name: 'Ana Costa', capacity: 8, allocated: 8 },
      { name: 'Pedro Lima', capacity: 8, allocated: 6 },
      { name: 'Maria Silva', capacity: 8, allocated: 6 },
    ],
  },
};

const backlogItems = [
  {
    id: 1,
    type: 'story',
    title: 'Implementar autenticação de usuário',
    description: 'Como usuário, quero fazer login para acessar o sistema',
    points: 8,
    priority: 'high',
    status: 'todo',
    assignee: 'João Santos',
    epic: 'Autenticação',
  },
  {
    id: 2,
    type: 'story',
    title: 'Dashboard de métricas',
    description: 'Como gestor, quero visualizar KPIs em tempo real',
    points: 13,
    priority: 'high',
    status: 'in-progress',
    assignee: 'Ana Costa',
    epic: 'Dashboard',
  },
  {
    id: 3,
    type: 'bug',
    title: 'Corrigir erro no formulário de contato',
    description: 'Campos não estão sendo validados corretamente',
    points: 3,
    priority: 'medium',
    status: 'done',
    assignee: 'Pedro Lima',
    epic: 'Bugs',
  },
];

const ceremonies = [
  {
    name: 'Daily Standup',
    nextDate: '2024-01-16 09:00',
    duration: '15 min',
    participants: 4,
    status: 'scheduled',
  },
  {
    name: 'Sprint Review',
    nextDate: '2024-01-29 14:00',
    duration: '2 horas',
    participants: 8,
    status: 'scheduled',
  },
  {
    name: 'Retrospectiva',
    nextDate: '2024-01-29 16:00',
    duration: '1 hora',
    participants: 4,
    status: 'scheduled',
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'story':
      return 'bg-blue-100 text-blue-800';
    case 'bug':
      return 'bg-red-100 text-red-800';
    case 'task':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'todo':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

export default function Scrum() {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Scrum</h1>
            <p className="text-muted-foreground">
              Gerencie sprints, backlog e cerimônias ágeis
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Novo Sprint
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova História
            </Button>
          </div>
        </div>

        {/* Sprint Atual */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                {sprintData.current.name} - Sprint Ativo
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {sprintData.current.remainingDays} dias restantes
                </Badge>
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Encerrar Sprint
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Progresso</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Story Points</span>
                    <span>{sprintData.current.completedStoryPoints}/{sprintData.current.totalStoryPoints}</span>
                  </div>
                  <Progress value={sprintData.current.progress} className="h-2" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Velocidade da Equipe</p>
                <p className="text-2xl font-bold">{sprintData.team.velocity}</p>
                <p className="text-xs text-muted-foreground">pontos por sprint</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Capacidade</p>
                <p className="text-2xl font-bold">{sprintData.team.capacity}</p>
                <p className="text-xs text-muted-foreground">pontos disponíveis</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Período</p>
                <p className="text-sm font-medium">
                  {new Date(sprintData.current.startDate).toLocaleDateString('pt-BR')} -{' '}
                  {new Date(sprintData.current.endDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Capacidade da Equipe */}
            <div className="space-y-3">
              <h4 className="font-semibold">Capacidade da Equipe</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sprintData.team.members.map((member) => (
                  <div key={member.name} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{member.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            member.allocated > member.capacity ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(member.allocated / member.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {member.allocated}/{member.capacity}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="backlog" className="space-y-4">
          <TabsList>
            <TabsTrigger value="backlog">Backlog</TabsTrigger>
            <TabsTrigger value="board">Quadro Sprint</TabsTrigger>
            <TabsTrigger value="ceremonies">Cerimônias</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="backlog">
            <Card>
              <CardHeader>
                <CardTitle>Product Backlog</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {backlogItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(item.type)} variant="secondary">
                          {item.type}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Epic: {item.epic}</span>
                          <span>Responsável: {item.assignee}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{item.points} pts</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="board">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">A Fazer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backlogItems.filter(item => item.status === 'todo').map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={getTypeColor(item.type)} variant="secondary">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.points} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Em Progresso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backlogItems.filter(item => item.status === 'in-progress').map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg bg-blue-50">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={getTypeColor(item.type)} variant="secondary">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.points} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Concluído</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backlogItems.filter(item => item.status === 'done').map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg bg-green-50">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={getTypeColor(item.type)} variant="secondary">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.points} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ceremonies">
            <Card>
              <CardHeader>
                <CardTitle>Cerimônias Agendadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ceremonies.map((ceremony) => (
                    <div
                      key={ceremony.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{ceremony.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ceremony.nextDate).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{ceremony.duration}</p>
                          <p>{ceremony.participants} participantes</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Burndown Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Gráfico de burndown será implementado aqui
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Velocity Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Gráfico de velocidade será implementado aqui
                    </p>
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
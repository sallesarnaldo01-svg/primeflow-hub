import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Target,
  Play,
  Pause,
} from 'lucide-react';
import { useScrum } from '@/hooks/useScrum';
import { CreateBacklogItemDialog } from '@/components/scrum/CreateBacklogItemDialog';
import { CreateSprintDialog } from '@/components/scrum/CreateSprintDialog';
import { BurndownChart } from '@/components/scrum/BurndownChart';
import { VelocityChart } from '@/components/scrum/VelocityChart';
import { SprintBoard } from '@/components/scrum/SprintBoard';
import { TeamManagementDialog } from '@/components/scrum/TeamManagementDialog';
import { PlanningPoker } from '@/components/scrum/PlanningPoker';
import { RetrospectiveBoard } from '@/components/scrum/RetrospectiveBoard';
import { CeremonyDialog } from '@/components/scrum/CeremonyDialog';

// TODO: Substituir por seleção de equipe real
const DEFAULT_TEAM_ID = 'default-team-id';

const getTypeColor = (type: string) => {
  switch (type) {
    case 'STORY':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'BUG':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'TASK':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-muted';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 dark:text-red-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'low':
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'todo':
      return 'bg-muted-foreground';
    default:
      return 'bg-muted-foreground';
  }
};

export default function Scrum() {
  const {
    sprints,
    activeSprint,
    backlogItems,
    ceremonies,
    createBacklogItem,
    createSprint,
    moveItemToStatus,
  } = useScrum();

  const sprintProgress = activeSprint
    ? (activeSprint.completedStoryPoints / activeSprint.totalStoryPoints) * 100
    : 0;

  const remainingDays = activeSprint
    ? Math.max(0, Math.ceil((new Date(activeSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const teamData = {
    velocity: 38,
    capacity: 42,
    members: [
      { name: 'João Santos', capacity: 8, allocated: 7 },
      { name: 'Ana Costa', capacity: 8, allocated: 8 },
      { name: 'Pedro Lima', capacity: 8, allocated: 6 },
      { name: 'Maria Silva', capacity: 8, allocated: 6 },
    ],
  };

  return (
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
            <TeamManagementDialog onCreateTeam={(data) => console.log('Create team:', data)} />
            <CeremonyDialog 
              teamId={DEFAULT_TEAM_ID}
              onCreateCeremony={(data) => console.log('Create ceremony:', data)}
            />
            <CreateSprintDialog 
              teamId={DEFAULT_TEAM_ID}
              onCreateSprint={(data) => createSprint.mutate(data)} 
            />
            <CreateBacklogItemDialog onCreateItem={(data) => createBacklogItem.mutate(data)} />
          </div>
        </div>

        {/* Sprint Atual */}
        {activeSprint && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  {activeSprint.name} - Sprint Ativo
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {remainingDays} dias restantes
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
                      <span>{activeSprint.completedStoryPoints}/{activeSprint.totalStoryPoints}</span>
                    </div>
                    <Progress value={sprintProgress} className="h-2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Velocidade da Equipe</p>
                  <p className="text-2xl font-bold">{teamData.velocity}</p>
                  <p className="text-xs text-muted-foreground">pontos por sprint</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Capacidade</p>
                  <p className="text-2xl font-bold">{teamData.capacity}</p>
                  <p className="text-xs text-muted-foreground">pontos disponíveis</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="text-sm font-medium">
                    {new Date(activeSprint.startDate).toLocaleDateString('pt-BR')} -{' '}
                    {new Date(activeSprint.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Capacidade da Equipe */}
              <div className="space-y-3">
                <h4 className="font-semibold">Capacidade da Equipe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamData.members.map((member) => (
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
        )}

        <Tabs defaultValue="backlog" className="space-y-4">
          <TabsList>
            <TabsTrigger value="backlog">Backlog</TabsTrigger>
            <TabsTrigger value="board">Quadro Sprint</TabsTrigger>
            <TabsTrigger value="ceremonies">Cerimônias</TabsTrigger>
            <TabsTrigger value="planning">Planning Poker</TabsTrigger>
            <TabsTrigger value="retrospective">Retrospectiva</TabsTrigger>
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
            <SprintBoard items={backlogItems} onMoveItem={moveItemToStatus} />
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
                            {new Date(ceremony.scheduledAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{ceremony.duration} min</p>
                          <p>{ceremony.participants.length} participantes</p>
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

          <TabsContent value="planning">
            <PlanningPoker />
          </TabsContent>

          <TabsContent value="retrospective">
            <RetrospectiveBoard />
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BurndownChart 
                sprintData={activeSprint ? {
                  totalStoryPoints: activeSprint.totalStoryPoints,
                  completedStoryPoints: activeSprint.completedStoryPoints,
                  sprintDays: 14,
                  currentDay: Math.floor((new Date().getTime() - new Date(activeSprint.startDate).getTime()) / (1000 * 60 * 60 * 24))
                } : undefined}
              />
              <VelocityChart sprints={sprints} />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
  );
}
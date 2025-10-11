import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Paperclip,
  User,
  Calendar,
  Tag,
  TrendingUp,
  TrendingDown,
  Users,
  Timer,
  Target,
  Activity
} from 'lucide-react';

interface TicketData {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  assignee?: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  slaDeadline: Date;
  tags: string[];
  messages: {
    id: string;
    content: string;
    author: string;
    timestamp: Date;
    type: 'message' | 'note' | 'system';
  }[];
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResolutionTime: number;
  slaCompliance: number;
}

const mockTickets: TicketData[] = [
  {
    id: 'T-001',
    title: 'Problema no login do sistema',
    description: 'Usuário não consegue fazer login na plataforma após a última atualização.',
    status: 'open',
    priority: 'high',
    category: 'Técnico',
    customer: {
      name: 'João Silva',
      email: 'joao@empresa.com',
      avatar: '/avatars/01.png'
    },
    assignee: {
      name: 'Ana Costa',
      avatar: '/avatars/02.png'
    },
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T14:20:00'),
    slaDeadline: new Date('2024-01-16T10:30:00'),
    tags: ['login', 'urgente', 'bug'],
    messages: [
      {
        id: '1',
        content: 'Usuário reportou erro 500 ao tentar fazer login.',
        author: 'João Silva',
        timestamp: new Date('2024-01-15T10:30:00'),
        type: 'message'
      },
      {
        id: '2',
        content: 'Investigando logs do servidor. Possível problema na autenticação.',
        author: 'Ana Costa',
        timestamp: new Date('2024-01-15T11:15:00'),
        type: 'note'
      }
    ]
  },
  {
    id: 'T-002',
    title: 'Solicitação de nova funcionalidade',
    description: 'Cliente solicita implementação de relatórios personalizados.',
    status: 'in_progress',
    priority: 'medium',
    category: 'Funcionalidade',
    customer: {
      name: 'Maria Santos',
      email: 'maria@cliente.com'
    },
    assignee: {
      name: 'Pedro Lima',
      avatar: '/avatars/03.png'
    },
    createdAt: new Date('2024-01-14T09:00:00'),
    updatedAt: new Date('2024-01-15T16:45:00'),
    slaDeadline: new Date('2024-01-20T09:00:00'),
    tags: ['funcionalidade', 'relatórios'],
    messages: [
      {
        id: '1',
        content: 'Gostaríamos de ter relatórios mais detalhados no dashboard.',
        author: 'Maria Santos',
        timestamp: new Date('2024-01-14T09:00:00'),
        type: 'message'
      },
      {
        id: '2',
        content: 'Analisando requisitos técnicos. Prazo estimado: 1 semana.',
        author: 'Pedro Lima',
        timestamp: new Date('2024-01-14T10:30:00'),
        type: 'note'
      }
    ]
  }
];

const ticketStats: TicketStats = {
  total: 245,
  open: 45,
  inProgress: 32,
  resolved: 128,
  closed: 40,
  avgResolutionTime: 4.2,
  slaCompliance: 94.5
};

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketData[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Técnico',
    customer: '',
    assignee: ''
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const createTicket = () => {
    if (!newTicket.title || !newTicket.description) {
      toast.error('Título e descrição são obrigatórios');
      return;
    }

    const ticket: TicketData = {
      id: `T-${String(tickets.length + 1).padStart(3, '0')}`,
      title: newTicket.title,
      description: newTicket.description,
      status: 'open',
      priority: newTicket.priority as TicketData['priority'],
      category: newTicket.category,
      customer: {
        name: newTicket.customer || 'Cliente Desconhecido',
        email: 'cliente@email.com'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      tags: [],
      messages: [
        {
          id: '1',
          content: newTicket.description,
          author: newTicket.customer || 'Cliente',
          timestamp: new Date(),
          type: 'message'
        }
      ]
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({
      title: '',
      description: '',
      priority: 'medium',
      category: 'Técnico',
      customer: '',
      assignee: ''
    });
    setIsCreateModalOpen(false);
    toast.success('Ticket criado com sucesso!');
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketData['status']) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date() }
        : ticket
    ));
    toast.success('Status do ticket atualizado');
  };

  const getPriorityColor = (priority: TicketData['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: TicketData['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: TicketData['status']) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityText = (priority: TicketData['priority']) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  const getSlaStatus = (deadline: Date) => {
    const now = new Date();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return { color: 'text-red-500', text: 'Vencido' };
    if (hoursLeft < 2) return { color: 'text-orange-500', text: 'Crítico' };
    if (hoursLeft < 8) return { color: 'text-yellow-500', text: 'Atenção' };
    return { color: 'text-green-500', text: 'No prazo' };
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tickets de Suporte</h1>
            <p className="text-muted-foreground">Gerencie solicitações e problemas dos clientes</p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Ticket</DialogTitle>
                <DialogDescription>
                  Preencha as informações para criar um novo ticket de suporte
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Descreva o problema em poucas palavras"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Cliente</Label>
                    <Input
                      id="customer"
                      value={newTicket.customer}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, customer: e.target.value }))}
                      placeholder="Nome do cliente"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva detalhadamente o problema ou solicitação"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select value={newTicket.priority} onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Técnico">Técnico</SelectItem>
                        <SelectItem value="Funcionalidade">Funcionalidade</SelectItem>
                        <SelectItem value="Billing">Cobrança</SelectItem>
                        <SelectItem value="Suporte">Suporte Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createTicket}>
                    Criar Ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.total}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.open}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                -8% este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.avgResolutionTime}h</div>
              <p className="text-xs text-muted-foreground">
                Tempo de resolução
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.slaCompliance}%</div>
              <Progress value={ticketStats.slaCompliance} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Tickets */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Tickets</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="open">Abertos</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="resolved">Resolvidos</SelectItem>
                      <SelectItem value="closed">Fechados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedTicket?.id === ticket.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{ticket.id}</Badge>
                            <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                              {getStatusText(ticket.status)}
                            </Badge>
                            <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                              {getPriorityText(ticket.priority)}
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium mb-1 truncate">{ticket.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {ticket.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {ticket.customer.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {ticket.createdAt.toLocaleDateString('pt-BR')}
                            </span>
                            {ticket.assignee && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {ticket.assignee.name}
                              </span>
                            )}
                          </div>
                          
                          {ticket.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {ticket.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-xs font-medium ${getSlaStatus(ticket.slaDeadline).color}`}>
                            {getSlaStatus(ticket.slaDeadline).text}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            SLA: {ticket.slaDeadline.toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredTickets.length === 0 && (
                  <div className="text-center py-12">
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum ticket encontrado</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'Crie seu primeiro ticket usando o botão acima'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do Ticket */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>
                  {selectedTicket ? `Ticket ${selectedTicket.id}` : 'Selecione um Ticket'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTicket ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">{selectedTicket.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedTicket.description}
                      </p>
                      
                      <div className="flex gap-2 mb-4">
                        <Badge className={`${getStatusColor(selectedTicket.status)} text-white`}>
                          {getStatusText(selectedTicket.status)}
                        </Badge>
                        <Badge className={`${getPriorityColor(selectedTicket.priority)} text-white`}>
                          {getPriorityText(selectedTicket.priority)}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{selectedTicket.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedTicket.customer.email}</p>
                        </div>
                      </div>
                      
                      {selectedTicket.assignee && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Responsável</p>
                            <p className="text-xs text-muted-foreground">{selectedTicket.assignee.name}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Criado em</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTicket.createdAt.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">SLA</p>
                          <p className={`text-xs ${getSlaStatus(selectedTicket.slaDeadline).color}`}>
                            {selectedTicket.slaDeadline.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Alterar Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant={selectedTicket.status === 'in_progress' ? 'default' : 'outline'}
                          onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                        >
                          Em Andamento
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedTicket.status === 'resolved' ? 'default' : 'outline'}
                          onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                        >
                          Resolver
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Mensagens ({selectedTicket.messages.length})</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedTicket.messages.map((message) => (
                          <div key={message.id} className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{message.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione um ticket para ver os detalhes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tickets;
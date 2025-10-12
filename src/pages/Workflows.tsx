import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import WorkflowCanvas from '@/components/workflows/WorkflowCanvas';
import { Node, Edge } from 'react-flow-renderer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Settings,
  Zap,
  Clock,
  Users,
  MessageSquare,
  Mail,
  Phone,
  Tag,
  Calendar,
  Database,
  GitBranch,
  Timer,
  Target,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download
} from 'lucide-react';

interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  trigger: {
    type: 'contact_created' | 'deal_stage_changed' | 'ticket_created' | 'tag_added' | 'manual' | 'scheduled';
    conditions?: any[];
  };
  actions: {
    id: string;
    type: 'send_email' | 'send_whatsapp' | 'add_tag' | 'create_task' | 'update_field' | 'wait' | 'condition';
    config: any;
    delay?: number;
  }[];
  stats: {
    triggered: number;
    completed: number;
    failed: number;
    successRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  category: 'sales' | 'marketing' | 'support' | 'general';
}

const mockWorkflows: WorkflowData[] = [
  {
    id: '1',
    name: 'Boas-vindas para Novos Leads',
    description: 'Sequência de boas-vindas automática para novos leads que se cadastram',
    status: 'active',
    trigger: {
      type: 'contact_created',
      conditions: [
        { field: 'source', operator: 'equals', value: 'website' }
      ]
    },
    actions: [
      {
        id: '1',
        type: 'wait',
        config: { duration: 5, unit: 'minutes' },
        delay: 5
      },
      {
        id: '2',
        type: 'send_email',
        config: {
          template: 'welcome_email',
          subject: 'Bem-vindo(a) à nossa plataforma!'
        }
      },
      {
        id: '3',
        type: 'wait',
        config: { duration: 1, unit: 'days' },
        delay: 1440
      },
      {
        id: '4',
        type: 'send_whatsapp',
        config: {
          template: 'follow_up_whatsapp',
          message: 'Olá! Como tem sido sua experiência com nossa plataforma?'
        }
      },
      {
        id: '5',
        type: 'add_tag',
        config: { tag: 'lead-ativo' }
      }
    ],
    stats: {
      triggered: 245,
      completed: 198,
      failed: 12,
      successRate: 80.8
    },
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'Marketing Team',
    category: 'marketing'
  },
  {
    id: '2',
    name: 'Follow-up de Vendas',
    description: 'Acompanhamento automático de oportunidades em negociação',
    status: 'active',
    trigger: {
      type: 'deal_stage_changed',
      conditions: [
        { field: 'stage', operator: 'equals', value: 'negotiation' }
      ]
    },
    actions: [
      {
        id: '1',
        type: 'create_task',
        config: {
          title: 'Acompanhar negociação',
          assignee: 'sales_team',
          dueDate: '+2 days'
        }
      },
      {
        id: '2',
        type: 'wait',
        config: { duration: 3, unit: 'days' },
        delay: 4320
      },
      {
        id: '3',
        type: 'condition',
        config: {
          field: 'deal.stage',
          operator: 'not_equals',
          value: 'closed'
        }
      },
      {
        id: '4',
        type: 'send_email',
        config: {
          template: 'follow_up_proposal',
          subject: 'Proposta em análise - Como podemos ajudar?'
        }
      }
    ],
    stats: {
      triggered: 89,
      completed: 73,
      failed: 3,
      successRate: 82.0
    },
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-08'),
    createdBy: 'Sales Team',
    category: 'sales'
  },
  {
    id: '3',
    name: 'Suporte Ticket Crítico',
    description: 'Escalação automática para tickets de alta prioridade',
    status: 'active',
    trigger: {
      type: 'ticket_created',
      conditions: [
        { field: 'priority', operator: 'equals', value: 'urgent' }
      ]
    },
    actions: [
      {
        id: '1',
        type: 'add_tag',
        config: { tag: 'escalado' }
      },
      {
        id: '2',
        type: 'send_email',
        config: {
          template: 'urgent_ticket_notification',
          to: 'manager@company.com',
          subject: 'Ticket Urgente Criado'
        }
      },
      {
        id: '3',
        type: 'send_whatsapp',
        config: {
          template: 'urgent_support',
          message: 'Recebemos seu ticket urgente. Nossa equipe entrará em contato em até 1 hora.'
        }
      }
    ],
    stats: {
      triggered: 15,
      completed: 15,
      failed: 0,
      successRate: 100.0
    },
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
    createdBy: 'Support Team',
    category: 'support'
  },
  {
    id: '4',
    name: 'Reativação de Leads Inativos',
    description: 'Tentativa de reengajamento com leads que não interagem há 30 dias',
    status: 'paused',
    trigger: {
      type: 'scheduled',
      conditions: [
        { field: 'last_interaction', operator: 'older_than', value: '30 days' }
      ]
    },
    actions: [
      {
        id: '1',
        type: 'send_email',
        config: {
          template: 'reactivation_email',
          subject: 'Sentimos sua falta! Veja nossas novidades'
        }
      },
      {
        id: '2',
        type: 'wait',
        config: { duration: 3, unit: 'days' },
        delay: 4320
      },
      {
        id: '3',
        type: 'condition',
        config: {
          field: 'email.opened',
          operator: 'equals',
          value: false
        }
      },
      {
        id: '4',
        type: 'send_whatsapp',
        config: {
          template: 'reactivation_whatsapp',
          message: 'Olá! Preparamos uma oferta especial para você. Que tal dar uma olhada?'
        }
      }
    ],
    stats: {
      triggered: 67,
      completed: 23,
      failed: 8,
      successRate: 34.3
    },
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'Marketing Team',
    category: 'marketing'
  }
];

const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowData[]>(mockWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowData | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    category: 'general' as WorkflowData['category'],
    triggerType: 'contact_created' as WorkflowData['trigger']['type']
  });

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const createWorkflow = () => {
    if (!newWorkflow.name) {
      toast.error('Nome do workflow é obrigatório');
      return;
    }

    const workflow: WorkflowData = {
      id: String(workflows.length + 1),
      name: newWorkflow.name,
      description: newWorkflow.description || undefined,
      status: 'draft',
      trigger: {
        type: newWorkflow.triggerType,
        conditions: []
      },
      actions: [],
      stats: {
        triggered: 0,
        completed: 0,
        failed: 0,
        successRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Current User',
      category: newWorkflow.category
    };

    setWorkflows(prev => [workflow, ...prev]);
    setNewWorkflow({
      name: '',
      description: '',
      category: 'general',
      triggerType: 'contact_created'
    });
    setIsCreateModalOpen(false);
    toast.success('Workflow criado com sucesso!');
  };

  const updateWorkflowStatus = (workflowId: string, newStatus: WorkflowData['status']) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: newStatus, updatedAt: new Date() }
        : workflow
    ));
    
    const statusText = newStatus === 'active' ? 'ativado' : 
                      newStatus === 'paused' ? 'pausado' : 'salvo como rascunho';
    toast.success(`Workflow ${statusText} com sucesso!`);
  };

  const duplicateWorkflow = (workflow: WorkflowData) => {
    const duplicatedWorkflow: WorkflowData = {
      ...workflow,
      id: String(workflows.length + 1),
      name: `${workflow.name} (Cópia)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        triggered: 0,
        completed: 0,
        failed: 0,
        successRate: 0
      }
    };

    setWorkflows(prev => [duplicatedWorkflow, ...prev]);
    toast.success('Workflow duplicado com sucesso!');
  };

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId));
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(null);
    }
    toast.success('Workflow excluído com sucesso!');
  };

  const openEditor = (workflow: WorkflowData) => {
    setEditingWorkflow(workflow);
    setIsEditorOpen(true);
  };

  const handleSaveWorkflow = (workflow: any) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflow.id ? { ...w, ...workflow, updatedAt: new Date() } : w
    ));
    toast.success('Workflow salvo!');
  };

  const handleValidateWorkflow = async (workflow: any) => {
    // Simulated validation
    return { valid: true, errors: [] };
  };

  const handlePublishWorkflow = (workflow: any) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflow.id 
        ? { ...w, ...workflow, status: 'active' as const, updatedAt: new Date() } 
        : w
    ));
    setIsEditorOpen(false);
    toast.success('Workflow publicado com sucesso!');
  };

  const getStatusColor = (status: WorkflowData['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: WorkflowData['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paused': return 'Pausado';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  const getCategoryText = (category: WorkflowData['category']) => {
    switch (category) {
      case 'sales': return 'Vendas';
      case 'marketing': return 'Marketing';
      case 'support': return 'Suporte';
      case 'general': return 'Geral';
      default: return category;
    }
  };

  const getCategoryColor = (category: WorkflowData['category']) => {
    switch (category) {
      case 'sales': return 'bg-purple-500';
      case 'marketing': return 'bg-orange-500';
      case 'support': return 'bg-red-500';
      case 'general': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTriggerText = (triggerType: WorkflowData['trigger']['type']) => {
    switch (triggerType) {
      case 'contact_created': return 'Contato Criado';
      case 'deal_stage_changed': return 'Estágio do Deal Alterado';
      case 'ticket_created': return 'Ticket Criado';
      case 'tag_added': return 'Tag Adicionada';
      case 'manual': return 'Manual';
      case 'scheduled': return 'Agendado';
      default: return triggerType;
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_email': return <Mail className="h-4 w-4" />;
      case 'send_whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'add_tag': return <Tag className="h-4 w-4" />;
      case 'create_task': return <CheckCircle className="h-4 w-4" />;
      case 'update_field': return <Database className="h-4 w-4" />;
      case 'wait': return <Timer className="h-4 w-4" />;
      case 'condition': return <GitBranch className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getActionText = (actionType: string) => {
    switch (actionType) {
      case 'send_email': return 'Enviar E-mail';
      case 'send_whatsapp': return 'Enviar WhatsApp';
      case 'add_tag': return 'Adicionar Tag';
      case 'create_task': return 'Criar Tarefa';
      case 'update_field': return 'Atualizar Campo';
      case 'wait': return 'Aguardar';
      case 'condition': return 'Condição';
      default: return actionType;
    }
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Workflows e Automação</h1>
            <p className="text-muted-foreground">Automatize processos e melhore a eficiência da sua equipe</p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Workflow</DialogTitle>
                <DialogDescription>
                  Configure um novo workflow de automação para sua equipe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Workflow *</Label>
                  <Input
                    id="name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Boas-vindas para novos leads"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o propósito deste workflow"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={newWorkflow.category} onValueChange={(value: WorkflowData['category']) => setNewWorkflow(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral</SelectItem>
                        <SelectItem value="sales">Vendas</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="support">Suporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Gatilho</Label>
                    <Select value={newWorkflow.triggerType} onValueChange={(value: WorkflowData['trigger']['type']) => setNewWorkflow(prev => ({ ...prev, triggerType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contact_created">Contato Criado</SelectItem>
                        <SelectItem value="deal_stage_changed">Estágio do Deal Alterado</SelectItem>
                        <SelectItem value="ticket_created">Ticket Criado</SelectItem>
                        <SelectItem value="tag_added">Tag Adicionada</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createWorkflow}>
                    Criar Workflow
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
              <CardTitle className="text-sm font-medium">Total de Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflows.length}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +2 este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows Ativos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workflows.filter(w => w.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((workflows.filter(w => w.status === 'active').length / workflows.length) * 100)}% do total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workflows.reduce((acc, w) => acc + (w.status === 'active' ? Math.floor(Math.random() * 10) : 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Automações executadas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workflows.length > 0 ? 
                  Math.round(workflows.reduce((acc, w) => acc + w.stats.successRate, 0) / workflows.length) 
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Média geral
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Workflows */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Workflows</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar workflows..."
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
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="paused">Pausados</SelectItem>
                      <SelectItem value="draft">Rascunhos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="support">Suporte</SelectItem>
                      <SelectItem value="general">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredWorkflows.map((workflow) => (
                    <motion.div
                      key={workflow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedWorkflow?.id === workflow.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getStatusColor(workflow.status)} text-white`}>
                              {getStatusText(workflow.status)}
                            </Badge>
                            <Badge className={`${getCategoryColor(workflow.category)} text-white`}>
                              {getCategoryText(workflow.category)}
                            </Badge>
                            <Badge variant="outline">
                              {getTriggerText(workflow.trigger.type)}
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium mb-1">{workflow.name}</h3>
                          {workflow.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {workflow.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-blue-500" />
                              <span>{workflow.stats.triggered} execuções</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{workflow.stats.successRate}% sucesso</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span>{workflow.actions.length} ações</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {workflow.status === 'active' ? (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                updateWorkflowStatus(workflow.id, 'paused'); 
                              }}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                updateWorkflowStatus(workflow.id, 'active'); 
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              duplicateWorkflow(workflow); 
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => { 
                              e.stopPropagation();
                              openEditor(workflow);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              deleteWorkflow(workflow.id); 
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {filteredWorkflows.length === 0 && (
                    <div className="text-center py-12">
                      <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Nenhum workflow encontrado</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                          ? 'Tente ajustar os filtros de busca'
                          : 'Crie seu primeiro workflow usando o botão acima'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do Workflow */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>
                  {selectedWorkflow ? 'Detalhes do Workflow' : 'Selecione um Workflow'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedWorkflow ? (
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                      <TabsTrigger value="actions">Ações</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Badge className={`${getStatusColor(selectedWorkflow.status)} text-white`}>
                            {getStatusText(selectedWorkflow.status)}
                          </Badge>
                          <Badge className={`${getCategoryColor(selectedWorkflow.category)} text-white`}>
                            {getCategoryText(selectedWorkflow.category)}
                          </Badge>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Descrição</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedWorkflow.description || 'Sem descrição'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Gatilho</Label>
                          <p className="text-sm text-muted-foreground">
                            {getTriggerText(selectedWorkflow.trigger.type)}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <Label className="text-sm font-medium">Estatísticas</Label>
                          <div className="space-y-2 mt-2">
                            <div className="flex justify-between text-sm">
                              <span>Execuções</span>
                              <span className="font-medium">{selectedWorkflow.stats.triggered}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Concluídas</span>
                              <span className="font-medium text-green-600">{selectedWorkflow.stats.completed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Falharam</span>
                              <span className="font-medium text-red-600">{selectedWorkflow.stats.failed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Taxa de Sucesso</span>
                              <span className="font-medium">{selectedWorkflow.stats.successRate}%</span>
                            </div>
                            <Progress value={selectedWorkflow.stats.successRate} className="mt-2" />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm font-medium">Criado por</Label>
                            <p className="text-sm text-muted-foreground">{selectedWorkflow.createdBy}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Criado em</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedWorkflow.createdAt.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Última atualização</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedWorkflow.updatedAt.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="actions" className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Sequência de Ações ({selectedWorkflow.actions.length})</Label>
                        <div className="space-y-3 mt-3">
                          {selectedWorkflow.actions.map((action, index) => (
                            <div key={action.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2 flex-1">
                                {getActionIcon(action.type)}
                                <div>
                                  <p className="text-sm font-medium">{getActionText(action.type)}</p>
                                  {action.delay && (
                                    <p className="text-xs text-muted-foreground">
                                      Aguardar {action.delay > 60 ? Math.round(action.delay / 60) + 'h' : action.delay + 'min'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {selectedWorkflow.actions.length === 0 && (
                            <div className="text-center py-6">
                              <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Nenhuma ação configurada</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-12">
                    <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione um workflow para ver os detalhes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Editor Modal */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-7xl h-[90vh] p-0">
            <div className="overflow-y-auto h-full p-6">
              <WorkflowBuilder
                workflow={editingWorkflow as any}
                onSave={handleSaveWorkflow}
                onValidate={handleValidateWorkflow}
                onPublish={handlePublishWorkflow}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Workflows;
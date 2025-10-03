import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkAIDialog } from '@/components/crm/BulkAIDialog';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  DollarSign, 
  Calendar, 
  User, 
  Phone,
  Mail,
  Building,
  Edit,
  Trash2,
  Eye,
  Target,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Mock data for deals
const mockDeals = [
  {
    id: '1',
    company: 'TechCorp Solutions',
    contact: 'Carlos Silva',
    email: 'carlos@techcorp.com',
    phone: '+55 11 99999-9999',
    value: 25000,
    stage: 'proposta',
    probability: 75,
    owner: 'Maria Silva',
    lastContact: '2024-01-15',
    tags: ['Enterprise', 'Hot'],
    description: 'Interessados em solução completa de CRM para 50 usuários.',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    company: 'StartupXYZ',
    contact: 'Ana Santos',
    email: 'ana@startupxyz.com',
    phone: '+55 21 88888-8888',
    value: 12500,
    stage: 'negociacao',
    probability: 60,
    owner: 'João Santos',
    lastContact: '2024-01-14',
    tags: ['Startup', 'SaaS'],
    description: 'Startup em crescimento buscando ferramenta de automação.',
    createdAt: '2024-01-08',
  },
  {
    id: '3',
    company: 'Empresa ABC',
    contact: 'Pedro Costa',
    email: 'pedro@empresaabc.com',
    phone: '+55 31 77777-7777',
    value: 8300,
    stage: 'qualificacao',
    probability: 40,
    owner: 'Ana Costa',
    lastContact: '2024-01-13',
    tags: ['SMB'],
    description: 'Empresa familiar interessada em digitalizar processos.',
    createdAt: '2024-01-12',
  },
  {
    id: '4',
    company: 'MegaCorp Industries',
    contact: 'Julia Oliveira',
    email: 'julia@megacorp.com',
    phone: '+55 11 55555-5555',
    value: 45000,
    stage: 'leads',
    probability: 25,
    owner: 'Pedro Lima',
    lastContact: '2024-01-16',
    tags: ['Enterprise', 'Cold'],
    description: 'Grande corporação avaliando mudança de fornecedor.',
    createdAt: '2024-01-16',
  },
];

const stages = [
  { id: 'leads', name: 'Leads', color: 'bg-gray-100', textColor: 'text-gray-700' },
  { id: 'qualificacao', name: 'Qualificação', color: 'bg-blue-100', textColor: 'text-blue-700' },
  { id: 'proposta', name: 'Proposta', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { id: 'negociacao', name: 'Negociação', color: 'bg-orange-100', textColor: 'text-orange-700' },
  { id: 'fechado', name: 'Fechado', color: 'bg-green-100', textColor: 'text-green-700' },
];

interface DealCardProps {
  deal: typeof mockDeals[0];
  onEdit: (deal: typeof mockDeals[0]) => void;
  isSelected: boolean;
  onSelectChange: (id: string, selected: boolean) => void;
}

function DealCard({ deal, onEdit, isSelected, onSelectChange }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-4 bg-card border rounded-lg cursor-grab hover:shadow-md transition-all"
    >
      <div className="space-y-3">
        {/* Checkbox de seleção */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectChange(deal.id, checked as boolean)}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs text-muted-foreground">Selecionar para ação em massa</span>
        </div>

        {/* Company and Value */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm line-clamp-1">
              {deal.company}
            </h4>
            <p className="text-xs text-muted-foreground">
              {deal.contact}
            </p>
            <p className="text-xs text-muted-foreground">
              {deal.email}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary text-sm">
              R$ {deal.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {deal.probability}%
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {deal.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {deal.description}
        </p>

        {/* Owner and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {deal.owner.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {deal.owner}
            </span>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Phone className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Mail className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(deal);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Last Contact */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Último contato: {new Date(deal.lastContact).toLocaleDateString('pt-BR')}
        </div>
      </div>
    </motion.div>
  );
}

export default function CRM() {
  const [deals, setDeals] = useState(mockDeals);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<typeof mockDeals[0] | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [isBulkAIDialogOpen, setIsBulkAIDialogOpen] = useState(false);

  const handleSelectDeal = (dealId: string, selected: boolean) => {
    setSelectedDeals(prev => 
      selected 
        ? [...prev, dealId]
        : prev.filter(id => id !== dealId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedDeals(selected ? filteredDeals.map(d => d.id) : []);
  };

  const handleBulkAIComplete = () => {
    setSelectedDeals([]);
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOwner = selectedOwner === 'all' || deal.owner.toLowerCase().includes(selectedOwner);
    
    return matchesSearch && matchesOwner;
  });

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = filteredDeals.filter(deal => deal.stage === stage.id);
    return acc;
  }, {} as Record<string, typeof deals>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dropping on a stage
    const targetStage = stages.find(stage => stage.id === overId);
    
    if (targetStage) {
      setDeals(prev => prev.map(deal => 
        deal.id === activeId 
          ? { ...deal, stage: targetStage.id }
          : deal
      ));
    }

    setActiveId(null);
  };

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const avgProbability = filteredDeals.length > 0 
    ? filteredDeals.reduce((sum, deal) => sum + deal.probability, 0) / filteredDeals.length 
    : 0;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM / Pipeline de Vendas</h1>
            <p className="text-muted-foreground">
              Gerencie seu pipeline de vendas com kanban interativo
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {selectedDeals.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => setIsBulkAIDialogOpen(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Ação em Massa com IA ({selectedDeals.length})
              </Button>
            )}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Deal</DialogTitle>
                </DialogHeader>
                {/* Add Deal form would go here */}
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Empresa</Label>
                      <Input id="company" placeholder="Nome da empresa" />
                    </div>
                    <div>
                      <Label htmlFor="contact">Contato</Label>
                      <Input id="contact" placeholder="Nome do contato" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="email@empresa.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" placeholder="+55 11 99999-9999" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="value">Valor</Label>
                      <Input id="value" type="number" placeholder="25000" />
                    </div>
                    <div>
                      <Label htmlFor="owner">Responsável</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maria">Maria Silva</SelectItem>
                          <SelectItem value="joao">João Santos</SelectItem>
                          <SelectItem value="ana">Ana Costa</SelectItem>
                          <SelectItem value="pedro">Pedro Lima</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" placeholder="Descreva o deal..." />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(false)}>
                      Criar Deal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Pipeline</p>
                  <p className="text-2xl font-bold">R$ {totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Deals Ativos</p>
                  <p className="text-2xl font-bold">{filteredDeals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Prob. Média</p>
                  <p className="text-2xl font-bold">{avgProbability.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold">R$ {(totalValue / filteredDeals.length || 0).toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDeals.length === filteredDeals.length && filteredDeals.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Selecionar todos</span>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar deals, empresas, contatos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="maria">Maria Silva</SelectItem>
                  <SelectItem value="joao">João Santos</SelectItem>
                  <SelectItem value="ana">Ana Costa</SelectItem>
                  <SelectItem value="pedro">Pedro Lima</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-x-auto">
            {stages.map((stage) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="min-w-[300px] lg:min-w-0"
              >
                <Card className="h-full min-h-[600px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${stage.color} mr-2`} />
                        {stage.name}
                      </span>
                      <Badge variant="secondary">
                        {dealsByStage[stage.id]?.length || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <SortableContext items={dealsByStage[stage.id]?.map(d => d.id) || []} strategy={verticalListSortingStrategy}>
                      {dealsByStage[stage.id]?.map((deal) => (
                        <DealCard 
                          key={deal.id} 
                          deal={deal} 
                          onEdit={setEditingDeal}
                          isSelected={selectedDeals.includes(deal.id)}
                          onSelectChange={handleSelectDeal}
                        />
                      ))}
                    </SortableContext>

                    {/* Add Deal Button */}
                    <Button 
                      variant="ghost" 
                      className="w-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Deal
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="rotate-3 opacity-80">
                <DealCard 
                  deal={deals.find(d => d.id === activeId)!} 
                  onEdit={() => {}}
                  isSelected={selectedDeals.includes(activeId)}
                  onSelectChange={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Edit Deal Dialog */}
        <Dialog open={!!editingDeal} onOpenChange={() => setEditingDeal(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Deal - {editingDeal?.company}</DialogTitle>
            </DialogHeader>
            {editingDeal && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                  <TabsTrigger value="tasks">Tarefas</TabsTrigger>
                  <TabsTrigger value="notes">Notas</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-company">Empresa</Label>
                      <Input id="edit-company" defaultValue={editingDeal.company} />
                    </div>
                    <div>
                      <Label htmlFor="edit-contact">Contato</Label>
                      <Input id="edit-contact" defaultValue={editingDeal.contact} />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input id="edit-email" defaultValue={editingDeal.email} />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Telefone</Label>
                      <Input id="edit-phone" defaultValue={editingDeal.phone} />
                    </div>
                    <div>
                      <Label htmlFor="edit-value">Valor</Label>
                      <Input id="edit-value" type="number" defaultValue={editingDeal.value} />
                    </div>
                    <div>
                      <Label htmlFor="edit-probability">Probabilidade (%)</Label>
                      <Input id="edit-probability" type="number" defaultValue={editingDeal.probability} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea id="edit-description" defaultValue={editingDeal.description} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingDeal(null)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setEditingDeal(null)}>
                      Salvar Alterações
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  <div className="space-y-4">
                    <h4 className="font-medium">Histórico de Atividades</h4>
                    <div className="space-y-2">
                      <div className="border-l-2 border-primary pl-4">
                        <p className="text-sm">Deal criado</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(editingDeal.createdAt).toLocaleDateString('pt-BR')} - {editingDeal.owner}
                        </p>
                      </div>
                      <div className="border-l-2 border-muted pl-4">
                        <p className="text-sm">Último contato realizado</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(editingDeal.lastContact).toLocaleDateString('pt-BR')} - {editingDeal.owner}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="tasks">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Tarefas</h4>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Tarefa
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 border rounded">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Enviar proposta comercial</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 border rounded">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm line-through text-muted-foreground">Primeira reunião</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="notes">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Notas</h4>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Nota
                      </Button>
                    </div>
                    <Textarea placeholder="Adicionar nota sobre este deal..." />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
}
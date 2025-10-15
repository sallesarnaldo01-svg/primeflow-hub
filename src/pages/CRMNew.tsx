import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Deal, dealsService } from '@/services/deals';
import { Property, propertiesService } from '@/services/properties';
import { BulkAIDialog } from '@/components/crm/BulkAIDialog';
import { ScheduleVisitDialog } from '@/components/crm/ScheduleVisitDialog';
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  DollarSign, 
  Sparkles, 
  Calendar,
  Home,
  Eye,
  Edit,
  Trash2,
  Target
} from 'lucide-react';

const STAGES = [
  { id: 'new_lead', label: 'Novo Lead', color: 'bg-blue-500' },
  { id: 'qualification', label: 'Qualificação', color: 'bg-yellow-500' },
  { id: 'visit_scheduled', label: 'Visita Agendada', color: 'bg-purple-500' },
  { id: 'visit_done', label: 'Visita Realizada', color: 'bg-indigo-500' },
  { id: 'proposal', label: 'Proposta', color: 'bg-orange-500' },
  { id: 'negotiation', label: 'Negociação', color: 'bg-amber-500' },
  { id: 'contract', label: 'Contrato', color: 'bg-cyan-500' },
  { id: 'closed_won', label: 'Ganho', color: 'bg-green-500' },
  { id: 'closed_lost', label: 'Perdido', color: 'bg-red-500' }
];

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string, checked: boolean) => void;
  isSelected: boolean;
  onScheduleVisit: (deal: Deal) => void;
}

function DealCard({ deal, onEdit, onDelete, onSelect, isSelected, onScheduleVisit }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'A definir';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
      <Card className="hover:shadow-md transition-shadow cursor-move">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(deal.id, checked as boolean)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{deal.title}</h4>
                {deal.property && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Home className="h-3 w-3 mr-1" />
                    {deal.property.title}
                  </p>
                )}
              </div>
            </div>
            
            {deal.aiScore > 0 && (
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                {deal.aiScore}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valor</span>
              <span className="font-semibold text-primary">{formatPrice(deal.value)}</span>
            </div>
            
            {deal.expectedCloseDate && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Previsão</span>
                <span>{new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}</span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onScheduleVisit(deal); }}>
                <Calendar className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit(deal); }}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CRMNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [isBulkAIOpen, setIsBulkAIOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState<Partial<Deal>>({});

  const sensors = useSensors(useSensor(PointerSensor));

  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsService.getDeals()
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesService.getProperties({ status: 'available' })
  });

  const createMutation = useMutation({
    mutationFn: dealsService.createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: 'Deal criado com sucesso!' });
      setIsDialogOpen(false);
      setFormData({});
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deal> }) =>
      dealsService.updateDeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: 'Deal atualizado!' });
      setIsDialogOpen(false);
      setSelectedDeal(null);
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: (data: { id: string; stage: Deal['stage']; position: number }) =>
      dealsService.moveStage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: dealsService.deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: 'Deal removido!' });
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as Deal['stage'];
    const deal = dealsData?.data.find(d => d.id === dealId);
    
    if (deal && deal.stage !== newStage) {
      const dealsInNewStage = dealsData?.data.filter(d => d.stage === newStage) || [];
      updateStageMutation.mutate({
        id: dealId,
        stage: newStage,
        position: dealsInNewStage.length
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeal) {
      updateMutation.mutate({ id: selectedDeal.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setFormData(deal);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este deal?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSelectDeal = (id: string, checked: boolean) => {
    setSelectedDeals(prev =>
      checked ? [...prev, id] : prev.filter(dealId => dealId !== id)
    );
  };

  const handleScheduleVisit = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsVisitDialogOpen(true);
  };

  const dealsByStage = STAGES.map(stage => ({
    ...stage,
    deals: (dealsData?.data || [])
      .filter(deal => deal.stage === stage.id)
      .sort((a, b) => (a.position || 0) - (b.position || 0))
  }));

  const totalValue = dealsData?.data.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;
  const avgScore = dealsData?.data.reduce((sum, deal) => sum + (deal.aiScore || 0), 0) / (dealsData?.data.length || 1) || 0;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM - Negócios Imobiliários</h1>
            <p className="text-muted-foreground">Gerencie seus deals e oportunidades</p>
          </div>

          <div className="flex space-x-2">
            {selectedDeals.length > 0 && (
              <Button variant="outline" onClick={() => setIsBulkAIOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Ação IA em Massa ({selectedDeals.length})
              </Button>
            )}
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setSelectedDeal(null); setFormData({}); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>{selectedDeal ? 'Editar' : 'Criar'} Deal</DialogTitle>
                  <DialogDescription>Preencha os dados do negócio</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Venda Apartamento Centro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Imóvel</Label>
                    <Select
                      value={formData.propertyId}
                      onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um imóvel" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertiesData?.data.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor Estimado</Label>
                      <Input
                        type="number"
                        value={formData.value || ''}
                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                        placeholder="350000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Probabilidade (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.probability || 0}
                        onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Origem do Lead</Label>
                    <Select
                      value={formData.leadSource}
                      onValueChange={(value: any) => setFormData({ ...formData, leadSource: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a origem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="olx">OLX</SelectItem>
                        <SelectItem value="zap">Zap Imóveis</SelectItem>
                        <SelectItem value="vivareal">VivaReal</SelectItem>
                        <SelectItem value="referral">Indicação</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {selectedDeal ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dealsData?.data.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Score Médio IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                <Target className="mr-2 h-5 w-5 text-primary" />
                {avgScore.toFixed(0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((dealsData?.data.filter(d => d.stage === 'closed_won').length || 0) / (dealsData?.data.length || 1) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {dealsByStage.map((stage) => (
              <Card key={stage.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
                    </div>
                    <Badge variant="secondary">{stage.deals.length}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto max-h-[600px]">
                  <SortableContext items={stage.deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    <div>
                      {stage.deals.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onSelect={handleSelectDeal}
                          isSelected={selectedDeals.includes(deal.id)}
                          onScheduleVisit={handleScheduleVisit}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            ))}
          </div>
        </DndContext>

        <BulkAIDialog
          open={isBulkAIOpen}
          onOpenChange={setIsBulkAIOpen}
          selectedLeads={selectedDeals}
          onComplete={() => {
            setSelectedDeals([]);
            queryClient.invalidateQueries({ queryKey: ['deals'] });
          }}
        />

        <ScheduleVisitDialog
          open={isVisitDialogOpen}
          onOpenChange={setIsVisitDialogOpen}
          dealId={selectedDeal?.id}
          propertyId={selectedDeal?.propertyId}
          contactId={selectedDeal?.contactId}
        />
      </div>
    </Layout>
  );
}

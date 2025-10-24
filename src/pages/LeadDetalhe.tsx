import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads';
import { leadInteractionsService } from '@/services/leadInteractions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Phone, Mail, MessageSquare, Calendar, CheckSquare, 
  FileText, Users, TrendingUp, Clock, Star
} from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function LeadDetalhe() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsService.getLeadById(id!)
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['lead-interactions', id],
    queryFn: () => leadInteractionsService.list(id!)
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ status }: { status: any }) => leadsService.updateLead(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      toast.success('Status atualizado com sucesso');
    }
  });

  const createInteractionMutation = useMutation({
    mutationFn: (tipo: string) => leadInteractionsService.create(id!, { 
      tipo: tipo as any, 
      descricao: `${tipo} registrado`,
      concluido: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-interactions', id] });
      toast.success('Interação registrada');
    }
  });

  if (isLoading) return <div>Carregando...</div>;
  if (!lead) return <div>Lead não encontrado</div>;

  const leadScore = lead.score || 66;
  const possibilidadeVenda = Math.ceil((leadScore / 100) * 5);

  const statusFunil = [
    { label: 'Em Atendimento', value: 'EM_ATENDIMENTO' },
    { label: 'Visita Agendada', value: 'VISITA_AGENDADA' },
    { label: 'Visita Realizada', value: 'VISITA_REALIZADA' },
    { label: 'Em Análise de Crédito', value: 'ANALISE_CREDITO' },
    { label: 'Com Reserva', value: 'COM_RESERVA' },
    { label: 'Venda Realizada', value: 'VENDA_REALIZADA' },
    { label: 'Descartar', value: 'DESCARTADO' }
  ];

  const acoesRapidas = [
    { icon: FileText, label: 'ANOTAÇÃO', tipo: 'ANOTACAO' },
    { icon: Phone, label: 'LIGAÇÃO', tipo: 'LIGACAO' },
    { icon: Mail, label: 'E-MAIL', tipo: 'EMAIL' },
    { icon: MessageSquare, label: 'SMS', tipo: 'SMS' },
    { icon: MessageSquare, label: 'WHATSAPP', tipo: 'WHATSAPP' },
    { icon: Calendar, label: 'VISITA', tipo: 'VISITA' },
    { icon: CheckSquare, label: 'TAREFA', tipo: 'TAREFA' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{lead.name}</h1>
          <p className="text-muted-foreground">{lead.email} • {lead.phone}</p>
        </div>
        <Badge variant={lead.status === 'QUALIFIED' ? 'default' : 'secondary'}>
          {lead.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Lead Score</div>
              <div className="flex items-center gap-4">
                <Progress value={leadScore} className="flex-1" />
                <span className="text-2xl font-bold">{leadScore}%</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Possibilidade de Venda</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    className={`h-6 w-6 ${i <= possibilidadeVenda ? 'fill-primary text-primary' : 'text-muted'}`} 
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">Última Interação</div>
              <div className="font-medium">
                {interactions[0] ? new Date(interactions[0].createdAt).toLocaleDateString() : 'Nenhuma'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Kanban de Ações</h3>
          <div className="grid grid-cols-4 gap-2">
            {acoesRapidas.map(acao => (
              <Button
                key={acao.tipo}
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => createInteractionMutation.mutate(acao.tipo)}
              >
                <acao.icon className="h-5 w-5" />
                <span className="text-xs">{acao.label}</span>
              </Button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-4">Ações de Venda</h4>
            <div className="flex gap-2">
              <Button variant="outline">RESERVA</Button>
              <Button variant="outline">PRÉ-CADASTRO</Button>
              <Button variant="outline">SIMULAÇÃO</Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Funil de Vendas</h3>
        <div className="flex gap-2 flex-wrap">
          {statusFunil.map(status => (
            <Button
              key={status.value}
              variant={lead.status === status.value ? 'default' : 'outline'}
              onClick={() => updateLeadMutation.mutate({ status: status.value })}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="insights">CVMagic | Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4 mt-4">
            {interactions.map(interaction => (
              <div key={interaction.id} className="flex gap-4 border-l-2 pl-4 py-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{interaction.tipo}</div>
                      <div className="text-sm text-muted-foreground">{interaction.descricao}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(interaction.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <p>Clique para obter insights sobre este lead usando IA</p>
              <Button className="mt-4">Gerar Insights</Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

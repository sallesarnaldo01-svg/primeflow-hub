import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads';
import { leadInteractionsService } from '@/services/leadInteractions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Star, ArrowLeft, Phone, Mail, MessageSquare, Calendar, TrendingUp, FileText, Users } from 'lucide-react';
import EventTimeline from '@/components/conversations/EventTimeline';
import { LeadActionsKanban } from '@/components/crm/LeadActionsKanban';
import { LeadSalesFunnel } from '@/components/crm/LeadSalesFunnel';
import { DocumentUploadManager } from '@/components/crm/DocumentUploadManager';
import { useToast } from '@/hooks/use-toast';

export default function LeadDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: lead, isLoading, refetch: refetchLead } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsService.getLeadById(id!)
  });

  const { data: interactions = [], refetch: refetchInteractions } = useQuery({
    queryKey: ['lead-interactions', id],
    queryFn: () => leadInteractionsService.list(id!)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Lead não encontrado</p>
          <Button className="mt-4" onClick={() => navigate('/leads')}>
            Voltar para Leads
          </Button>
        </div>
      </div>
    );
  }

  const leadScore = lead.score || 66;
  const possibilidadeVenda = Math.ceil((leadScore / 100) * 5);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lead.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {lead.email && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {lead.email}
                </span>
              )}
              {lead.phone && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={lead.status === 'QUALIFIED' ? 'default' : 'secondary'} className="text-sm">
            {lead.status === 'NEW' ? 'Novo' :
             lead.status === 'CONTACTED' ? 'Contatado' :
             lead.status === 'QUALIFIED' ? 'Qualificado' :
             lead.status === 'CONVERTED' ? 'Convertido' :
             lead.status === 'LOST' ? 'Perdido' : lead.status}
          </Badge>
        </div>
      </div>

      {/* Score and Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Pontuação</span>
                <span className="text-2xl font-bold text-primary">{leadScore}%</span>
              </div>
              <Progress value={leadScore} className="h-3" />
            </div>
            
            <div className="pt-4 border-t">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Origem</div>
              <div className="font-medium">{lead.origin || 'Não especificado'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Última Interação</div>
              <div className="font-medium">
                {interactions[0] 
                  ? new Date(interactions[0].createdAt).toLocaleDateString('pt-BR') 
                  : 'Nenhuma'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total de Interações</div>
              <div className="font-medium">{interactions.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lead.tags && lead.tags.length > 0 ? (
                lead.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Nenhuma tag</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="info">Detalhes</TabsTrigger>
          <TabsTrigger value="deals">Negociações</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          <LeadActionsKanban 
            leadId={id!} 
            onActionComplete={() => {
              refetchInteractions();
              refetchLead();
            }}
          />
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <LeadSalesFunnel 
            currentStage={lead?.metadata?.salesStage}
            onStageChange={async (stage) => {
              try {
                await leadsService.updateLead(id!, {
                  metadata: { ...lead?.metadata, salesStage: stage }
                });
                toast({
                  title: 'Etapa atualizada',
                  description: 'Lead movido para nova etapa do funil'
                });
                refetchLead();
              } catch (error: any) {
                toast({
                  title: 'Erro',
                  description: error.message,
                  variant: 'destructive'
                });
              }
            }}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Interações</CardTitle>
              <CardDescription>Todas as atividades e interações com este lead</CardDescription>
            </CardHeader>
            <CardContent>
              <EventTimeline 
                events={interactions.map((interaction: any) => ({
                  id: interaction.id,
                  type: interaction.tipo,
                  description: interaction.descricao,
                  timestamp: new Date(interaction.createdAt),
                  user: interaction.createdBy
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentUploadManager 
            entityType="lead"
            entityId={id!}
            onDocumentChange={() => {
              toast({
                title: 'Documento atualizado',
                description: 'Lista de documentos atualizada'
              });
            }}
          />
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Nome</div>
                  <div className="font-medium">{lead.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge>{lead.status}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{lead.email || 'Não informado'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Telefone</div>
                  <div className="font-medium">{lead.phone || 'Não informado'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Origem</div>
                  <div className="font-medium">{lead.origin || 'Não especificado'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Data de Criação</div>
                  <div className="font-medium">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {lead.customFields && Object.keys(lead.customFields).length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Campos Customizados</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(lead.customFields).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-sm text-muted-foreground">{key}</div>
                        <div className="font-medium">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Negociações Relacionadas</CardTitle>
              <CardDescription>Deals e oportunidades vinculadas a este lead</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma negociação vinculada a este lead</p>
                <Button className="mt-4" onClick={() => navigate('/crm')}>
                  Criar Deal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

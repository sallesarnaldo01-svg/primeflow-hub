import { useState } from 'react';
import { Plus, Search, Users, FileText, Calendar, Calculator, Building2, UserCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { leadsService } from '@/services/leads';
import { preCadastrosService } from '@/services/preCadastros';
import { empreendimentosService } from '@/services/empreendimentos';
import { correspondentesService } from '@/services/correspondentes';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export default function CRM() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsService.getLeads()
  });

  const { data: preCadastros = [] } = useQuery({
    queryKey: ['pre-cadastros'],
    queryFn: () => preCadastrosService.list()
  });

  const { data: empreendimentos = [] } = useQuery({
    queryKey: ['empreendimentos'],
    queryFn: () => empreendimentosService.list()
  });

  const { data: correspondentes = [] } = useQuery({
    queryKey: ['correspondentes'],
    queryFn: () => correspondentesService.list()
  });

  // Calculate stats
  const leadsStats = {
    total: leads.length,
    novos: leads.filter((l: any) => l.status === 'NEW').length,
    atendimento: leads.filter((l: any) => l.status === 'CONTACTED').length,
    qualificados: leads.filter((l: any) => l.status === 'QUALIFIED').length,
    convertidos: leads.filter((l: any) => l.status === 'CONVERTED').length,
    scoreAlto: leads.filter((l: any) => l.score >= 70).length
  };

  const preCadastrosStats = {
    total: preCadastros.length,
    novaAvaliacao: preCadastros.filter((p: any) => p.situacao === 'NOVA_AVALIACAO').length,
    emAnalise: preCadastros.filter((p: any) => p.situacao === 'EM_ANALISE').length,
    pendente: preCadastros.filter((p: any) => p.situacao === 'PENDENTE_APROVACAO').length,
    aprovado: preCadastros.filter((p: any) => p.situacao === 'APROVADO').length
  };

  const filteredLeads = leads.filter((lead: any) => 
    lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.phone?.includes(searchQuery)
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Imobiliário</h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa de leads, pré-cadastros e vendas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/leads')}>
            <Users className="h-4 w-4 mr-2" />
            Ver Todos os Leads
          </Button>
          <Button onClick={() => navigate('/leads')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/leads')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsStats.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">{leadsStats.novos} novos</Badge>
              <Badge variant="default" className="text-xs">{leadsStats.scoreAlto} score alto</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/pre-cadastros')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pré-Cadastros</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{preCadastrosStats.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">{preCadastrosStats.aprovado} aprovados</Badge>
              <Badge variant="outline" className="text-xs">{preCadastrosStats.pendente} pendentes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/empreendimentos')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Empreendimentos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empreendimentos.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                {empreendimentos.filter((e: any) => e.ativo).length} ativos
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/correspondentes')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Correspondentes</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{correspondentes.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default" className="text-xs">
                {correspondentes.filter((c: any) => c.ativo).length} ativos
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="leads">
            <Users className="h-4 w-4 mr-2" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="pre-cadastros">
            <FileText className="h-4 w-4 mr-2" />
            Pré-Cadastros
          </TabsTrigger>
          <TabsTrigger value="empreendimentos">
            <Building2 className="h-4 w-4 mr-2" />
            Empreendimentos
          </TabsTrigger>
          <TabsTrigger value="correspondentes">
            <UserCheck className="h-4 w-4 mr-2" />
            Correspondentes
          </TabsTrigger>
          <TabsTrigger value="simulador">
            <Calculator className="h-4 w-4 mr-2" />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="agendamentos">
            <Calendar className="h-4 w-4 mr-2" />
            Agendamentos
          </TabsTrigger>
        </TabsList>

        {/* LEADS TAB */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leads Recentes</CardTitle>
                  <CardDescription>Leads com maior score e mais recentes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button onClick={() => navigate('/leads')}>Ver Todos</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredLeads.slice(0, 10).map((lead: any) => (
                    <Card 
                      key={lead.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <h4 className="font-semibold">{lead.name}</h4>
                                <p className="text-sm text-muted-foreground">{lead.email || lead.phone}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Score: {lead.score}%</span>
                              </div>
                              <Progress value={lead.score} className="w-24 h-2 mt-1" />
                            </div>
                            <Badge variant={
                              lead.status === 'NEW' ? 'secondary' :
                              lead.status === 'CONTACTED' ? 'default' :
                              lead.status === 'QUALIFIED' ? 'default' :
                              lead.status === 'CONVERTED' ? 'default' : 'outline'
                            }>
                              {lead.status === 'NEW' ? 'Novo' :
                               lead.status === 'CONTACTED' ? 'Contatado' :
                               lead.status === 'QUALIFIED' ? 'Qualificado' :
                               lead.status === 'CONVERTED' ? 'Convertido' :
                               lead.status === 'LOST' ? 'Perdido' : lead.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRÉ-CADASTROS TAB */}
        <TabsContent value="pre-cadastros" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pré-Cadastros Recentes</CardTitle>
                  <CardDescription>Acompanhe o status dos pré-cadastros</CardDescription>
                </div>
                <Button onClick={() => navigate('/pre-cadastros')}>Ver Todos</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {preCadastros.slice(0, 10).map((pc: any) => (
                    <Card 
                      key={pc.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/pre-cadastros/${pc.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{pc.nomeCliente}</h4>
                            <p className="text-sm text-muted-foreground">
                              CPF: {pc.cpfCliente} | {pc.empreendimento?.nome || 'Sem empreendimento'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">Documentação:</span>
                              <Progress value={pc.percentualDocumentacao || 0} className="w-32 h-2" />
                              <span className="text-xs font-medium">{pc.percentualDocumentacao || 0}%</span>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge variant={
                              pc.situacao === 'APROVADO' ? 'default' :
                              pc.situacao === 'NOVA_AVALIACAO' ? 'secondary' :
                              pc.situacao === 'EM_ANALISE' ? 'outline' :
                              pc.situacao === 'PENDENTE_APROVACAO' ? 'outline' : 'secondary'
                            }>
                              {pc.situacao === 'NOVA_AVALIACAO' ? 'Nova Avaliação' :
                               pc.situacao === 'EM_ANALISE' ? 'Em Análise' :
                               pc.situacao === 'PENDENTE_APROVACAO' ? 'Pendente' :
                               pc.situacao === 'APROVADO' ? 'Aprovado' :
                               pc.situacao === 'REPROVADO' ? 'Reprovado' : pc.situacao}
                            </Badge>
                            <div className="text-sm font-medium">
                              R$ {(pc.valorAprovado || pc.valorAvaliacao || 0).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMPREENDIMENTOS TAB */}
        <TabsContent value="empreendimentos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Empreendimentos Ativos</CardTitle>
                  <CardDescription>Gerencie os empreendimentos disponíveis</CardDescription>
                </div>
                <Button onClick={() => navigate('/empreendimentos')}>Gerenciar</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {empreendimentos.map((emp: any) => (
                    <Card key={emp.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{emp.nome}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{emp.descricao}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              {emp.cidade}, {emp.estado}
                            </p>
                            {emp.construtora && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Construtora: {emp.construtora}
                              </p>
                            )}
                          </div>
                          <Badge variant={emp.ativo ? 'default' : 'secondary'}>
                            {emp.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        {(emp.valorMinimo || emp.valorMaximo) && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium">
                              Faixa de Valores: R$ {(emp.valorMinimo || 0).toLocaleString('pt-BR')} - R$ {(emp.valorMaximo || 0).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CORRESPONDENTES TAB */}
        <TabsContent value="correspondentes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Correspondentes Bancários</CardTitle>
                  <CardDescription>Empresas parceiras para financiamento</CardDescription>
                </div>
                <Button onClick={() => navigate('/correspondentes')}>Gerenciar</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {correspondentes.map((corr: any) => (
                    <Card key={corr.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{corr.nome}</h4>
                            {corr.cnpj && (
                              <p className="text-sm text-muted-foreground mt-1">CNPJ: {corr.cnpj}</p>
                            )}
                            {corr.email && (
                              <p className="text-sm text-muted-foreground">{corr.email}</p>
                            )}
                            {corr.telefone && (
                              <p className="text-sm text-muted-foreground">{corr.telefone}</p>
                            )}
                          </div>
                          <Badge variant={corr.ativo ? 'default' : 'secondary'}>
                            {corr.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SIMULADOR TAB */}
        <TabsContent value="simulador" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Financiamento</CardTitle>
              <CardDescription>Calcule parcelas e condições de financiamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Clique em um lead ou pré-cadastro para simular financiamento</p>
                <Button className="mt-4" onClick={() => navigate('/leads')}>
                  Selecionar Lead
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AGENDAMENTOS TAB */}
        <TabsContent value="agendamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Próximos Agendamentos</CardTitle>
                  <CardDescription>Visitas e atendimentos agendados</CardDescription>
                </div>
                <Button onClick={() => navigate('/agendamentos')}>Ver Calendário</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum agendamento próximo</p>
                <Button className="mt-4" onClick={() => navigate('/agendamentos')}>
                  Criar Agendamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

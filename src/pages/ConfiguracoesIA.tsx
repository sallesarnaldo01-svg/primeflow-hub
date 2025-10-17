import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SystemPromptEditor } from '@/components/ai/SystemPromptEditor';
import { useAIAgent, useAIAgents } from '@/hooks/useAIAgent';
import { useUserRole } from '@/hooks/useUserRole';
import { Settings, Sparkles, Brain, Zap, ArrowLeft, Shield, AlertCircle, Bot, MessageSquare, Users, Headphones, CheckCircle, XCircle, Send, Play, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const agentTemplates = [
  {
    id: 'receptionist',
    name: 'Recepcionista',
    icon: <Headphones className="h-8 w-8" />,
    description: 'Atende consultas iniciais, qualifica leads e direciona para o setor correto',
    capabilities: ['Qualificação de leads', 'Triagem de tickets', 'Agendamento', 'FAQ básico']
  },
  {
    id: 'sales',
    name: 'Vendas',
    icon: <Users className="h-8 w-8" />,
    description: 'Auxilia no processo de vendas, qualifica oportunidades e fecha negócios',
    capabilities: ['Qualificação de leads', 'Apresentação de produtos', 'Geração de propostas', 'Follow-up automático']
  },
  {
    id: 'support',
    name: 'Suporte',
    icon: <MessageSquare className="h-8 w-8" />,
    description: 'Resolve dúvidas técnicas, troubleshooting e escala para humanos quando necessário',
    capabilities: ['Troubleshooting', 'Base de conhecimento', 'Escalação inteligente', 'Análise de logs']
  }
];

const ConfiguracoesIA: React.FC = () => {
  const navigate = useNavigate();
  const { agents, isLoading: isLoadingAgents } = useAIAgents();
  const { isAdmin, roles, isLoading: isLoadingRole } = useUserRole();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testMessages, setTestMessages] = useState<Array<{role: string; content: string}>>([]);
  const [testInput, setTestInput] = useState('');
  const [agentActions, setAgentActions] = useState({
    canAssign: true,
    canClose: true,
    canUpdateFields: true,
    canUpdateLifecycle: true,
    canInterpretImages: true,
    canRecommendProducts: true
  });
  
  const { agent, isLoading, updateSystemPrompt, isUpdating } = useAIAgent(
    selectedAgentId || (agents.length > 0 ? agents[0]?.id : null)
  );

  React.useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId]);

  const handleSavePrompt = async (prompt: string) => {
    await updateSystemPrompt(prompt);
  };

  const handleTestMessage = async () => {
    if (!testInput.trim()) return;
    
    const newMessages = [...testMessages, { role: 'user', content: testInput }];
    setTestMessages(newMessages);
    setTestInput('');

    // Simula resposta do agente
    setTimeout(() => {
      setTestMessages([...newMessages, {
        role: 'assistant',
        content: 'Esta é uma resposta simulada do agente. Em produção, o agente usará a base de conhecimento e executará ações configuradas.'
      }]);
    }, 1000);
  };

  const handleResetTest = () => {
    setTestMessages([]);
    toast.success('Conversa de teste resetada');
  };

  const handleApplyTemplate = (templateId: string) => {
    toast.success(`Template "${templateId}" será aplicado ao agente`);
  };

  if (isLoadingAgents || isLoading || isLoadingRole) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!agents.length) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ia')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configurações do Agente de IA</h1>
            <p className="text-muted-foreground">Configure a persona e comportamento do seu agente</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Nenhum Agente Configurado
            </CardTitle>
            <CardDescription>
              Você precisa criar um agente de IA primeiro. Vá para Provedores de IA para criar seu primeiro agente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/ia/providers')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Ir para Provedores de IA
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/ia')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Configurações do Agente de IA</h1>
                {isAdmin && (
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">Configure a persona e comportamento do seu agente</p>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissões de administrador. Algumas configurações podem estar restritas.
              Entre em contato com um administrador para obter acesso completo.
            </AlertDescription>
          </Alert>
        )}

        {/* Agent Selector */}
        {agents.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Selecione o Agente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {agents.map((a) => (
                  <Button
                    key={a.id}
                    variant={selectedAgentId === a.id ? "default" : "outline"}
                    onClick={() => setSelectedAgentId(a.id)}
                  >
                    {a.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Agent Info */}
        {agent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {agent.name}
              </CardTitle>
              <CardDescription>
                Modelo: {agent.model} | Provider: {agent.provider?.name || 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">{agent.temperature}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Tokens</p>
                <p className="text-2xl font-bold">{agent.maxTokens}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={agent.active ? "default" : "secondary"}>
                  {agent.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
            <TabsTrigger value="test">Testar</TabsTrigger>
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            <TabsTrigger value="followup">Follow-up</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Prompt de Sistema
                </CardTitle>
                <CardDescription>
                  Define a personalidade, objetivos e diretrizes do agente de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agent && (
                  <SystemPromptEditor
                    agentId={agent.id}
                    initialPrompt={agent.systemPrompt}
                    onSave={handleSavePrompt}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Templates de Agentes
                </CardTitle>
                <CardDescription>
                  Aplique templates prontos ou customize seu agente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {agentTemplates.map((template) => (
                    <Card key={template.id} className="p-4 hover:border-primary transition-colors cursor-pointer">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="text-primary">{template.icon}</div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="space-y-1 w-full">
                          {template.capabilities.map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleApplyTemplate(template.id)}
                        >
                          Aplicar Template
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Ações do Agente
                </CardTitle>
                <CardDescription>
                  Configure quais ações o agente pode executar durante conversas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Atribuir a agentes/equipes</Label>
                      <p className="text-sm text-muted-foreground">Permitir atribuição automática de conversas</p>
                    </div>
                    <Switch
                      checked={agentActions.canAssign}
                      onCheckedChange={(checked) => setAgentActions({...agentActions, canAssign: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Fechar conversas</Label>
                      <p className="text-sm text-muted-foreground">Permitir encerramento com resumo automático</p>
                    </div>
                    <Switch
                      checked={agentActions.canClose}
                      onCheckedChange={(checked) => setAgentActions({...agentActions, canClose: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Atualizar campos de contato</Label>
                      <p className="text-sm text-muted-foreground">Salvar informações coletadas automaticamente</p>
                    </div>
                    <Switch
                      checked={agentActions.canUpdateFields}
                      onCheckedChange={(checked) => setAgentActions({...agentActions, canUpdateFields: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Atualizar estágio de Lifecycle</Label>
                      <p className="text-sm text-muted-foreground">Mover leads entre estágios automaticamente</p>
                    </div>
                    <Switch
                      checked={agentActions.canUpdateLifecycle}
                      onCheckedChange={(checked) => setAgentActions({...agentActions, canUpdateLifecycle: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Interpretar imagens e arquivos</Label>
                      <p className="text-sm text-muted-foreground">Analisar fotos, PDFs e documentos enviados</p>
                    </div>
                    <Switch
                      checked={agentActions.canInterpretImages}
                      onCheckedChange={(checked) => setAgentActions({...agentActions, canInterpretImages: checked})}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Recomendar produtos/serviços</Label>
                      <p className="text-sm text-muted-foreground">Sugerir produtos baseado no contexto da conversa</p>
                    </div>
                    <Switch
                      checked={agentActions.canRecommendProducts}
                      onCheckedChange={(checked) => setAgentActions({...agentActions, canRecommendProducts: checked})}
                    />
                  </div>
                </div>
                
                <Button className="w-full" onClick={() => toast.success('Configurações de ações salvas')}>
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Painel de Teste
                </CardTitle>
                <CardDescription>
                  Teste seu agente antes de publicar em produção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3">
                  {testMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Inicie uma conversa de teste</p>
                    </div>
                  ) : (
                    testMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma mensagem de teste..."
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                  />
                  <Button onClick={handleTestMessage} disabled={!testInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleResetTest}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    O painel de teste simula ações e respostas. Campos de contato e outras ações não serão executadas de verdade.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Ferramentas e Integrações
                </CardTitle>
                <CardDescription>
                  Configure ferramentas externas e integrações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/ia/tools')}
                >
                  Gerenciar Ferramentas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Follow-up Automático
                </CardTitle>
                <CardDescription>
                  Configure regras de follow-up automático
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em desenvolvimento - Defina cadências de follow-up automático
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/followup')}
                >
                  Ir para Follow-up
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ConfiguracoesIA;

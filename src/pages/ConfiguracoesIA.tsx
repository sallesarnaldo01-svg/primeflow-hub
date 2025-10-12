import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SystemPromptEditor } from '@/components/ai/SystemPromptEditor';
import { useAIAgent, useAIAgents } from '@/hooks/useAIAgent';
import { useUserRole } from '@/hooks/useUserRole';
import { Settings, Sparkles, Brain, Zap, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ConfiguracoesIA: React.FC = () => {
  const navigate = useNavigate();
  const { agents, isLoading: isLoadingAgents } = useAIAgents();
  const { isAdmin, roles, isLoading: isLoadingRole } = useUserRole();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  const { agent, isLoading, updateSystemPrompt, isUpdating } = useAIAgent(
    selectedAgentId || (agents.length > 0 ? agents[0]?.id : null)
  );

  // Auto-select first agent when loaded
  React.useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId]);

  const handleSavePrompt = async (prompt: string) => {
    await updateSystemPrompt(prompt);
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Configurações Básicas</TabsTrigger>
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
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

          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Ferramentas Disponíveis
                </CardTitle>
                <CardDescription>
                  Configure quais ferramentas o agente pode utilizar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em desenvolvimento - Configure ferramentas customizadas para o agente
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                >
                  Gerenciar Ferramentas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pipeline de Saída
                </CardTitle>
                <CardDescription>
                  Configure o fluxo de processamento das respostas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em desenvolvimento - Defina stages de processamento e validação
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                >
                  Configurar Pipeline
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

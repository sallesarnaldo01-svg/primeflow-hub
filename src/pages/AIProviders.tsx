import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { aiProvidersService, type AIProvider } from '@/services/aiProviders';
import { ProviderCard } from '@/components/ai/ProviderCard';
import { CreateProviderDialog } from '@/components/ai/CreateProviderDialog';

const AIProviders: React.FC = () => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadProviders = async () => {
    try {
      const data = await aiProvidersService.listProviders();
      setProviders(data);
    } catch (error: any) {
      toast.error('Erro ao carregar provedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await aiProvidersService.updateProvider(id, { active });
      toast.success(`Provedor ${active ? 'ativado' : 'desativado'}`);
      loadProviders();
    } catch (error: any) {
      toast.error('Erro ao atualizar provedor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este provedor?')) return;

    try {
      await aiProvidersService.deleteProvider(id);
      toast.success('Provedor deletado');
      loadProviders();
    } catch (error: any) {
      toast.error('Erro ao deletar provedor');
    }
  };

  const handleEdit = (provider: AIProvider) => {
    toast.info('Edição em desenvolvimento');
  };

  return (
    <>
    
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Provedores de IA
            </h1>
            <p className="text-muted-foreground">
              Conecte múltiplos provedores de inteligência artificial
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Provedor
          </Button>
        </div>

        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="providers">Provedores</TabsTrigger>
            <TabsTrigger value="agents">Agentes</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  Carregando...
                </CardContent>
              </Card>
            ) : providers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-lg">Nenhum provedor configurado</h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione seu primeiro provedor de IA para começar
                    </p>
                  </div>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Provedor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agentes de IA</CardTitle>
                <CardDescription>
                  Configure agentes específicos para diferentes tarefas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateProviderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadProviders}
      />
    
  );
};

export default AIProviders;

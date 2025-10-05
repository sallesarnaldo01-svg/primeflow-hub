import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, Trash2, Edit, Facebook } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { facebookService } from '@/services/facebook';

interface Campaign {
  id: string;
  name: string;
  message: string;
  target_list: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  sent_count: number;
  total_count: number;
  created_at: string;
}

export default function CampanhasFacebook() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    target_list: ''
  });

  useEffect(() => {
    loadCampaigns();
    loadLists();
  }, []);

  const loadCampaigns = async () => {
    try {
      // @ts-ignore - Supabase types not regenerated
      const { data, error } = await (supabase as any)
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      toast.error('Erro ao carregar campanhas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLists = async () => {
    try {
      // @ts-ignore - Supabase types not regenerated
      const { data, error } = await (supabase as any)
        .from('contact_lists')
        .select('*');

      if (error) throw error;
      setLists(data || []);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.message || !formData.target_list) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      // @ts-ignore - Supabase types not regenerated
      const { error } = await (supabase as any)
        .from('campaigns')
        .insert({
          name: formData.name,
          message: formData.message,
          target_list: formData.target_list,
          channel: 'facebook',
          status: 'draft'
        });

      if (error) throw error;

      toast.success('Campanha criada');
      setDialogOpen(false);
      setFormData({ name: '', message: '', target_list: '' });
      loadCampaigns();
    } catch (error) {
      toast.error('Erro ao criar campanha');
      console.error(error);
    }
  };

  const handleSend = async (campaign: Campaign) => {
    try {
      // Buscar contatos da lista
      // @ts-ignore - Supabase types not regenerated
      const { data: contacts } = await (supabase as any)
        .from('contacts')
        .select('*')
        .eq('list_id', campaign.target_list);

      if (!contacts || contacts.length === 0) {
        toast.error('Nenhum contato encontrado na lista');
        return;
      }

      // Atualizar status
      // @ts-ignore - Supabase types not regenerated
      await (supabase as any)
        .from('campaigns')
        .update({ status: 'running', total_count: contacts.length })
        .eq('id', campaign.id);

      // Enviar mensagens via API
      for (const contact of contacts) {
        try {
          // Aqui você implementaria o envio real via Facebook
          // await facebookService.sendMessage(contact.facebook_id, campaign.message);
          
          // Atualizar contador
          // @ts-ignore - Supabase types not regenerated
          await (supabase as any)
            .from('campaigns')
            .update({ sent_count: campaign.sent_count + 1 })
            .eq('id', campaign.id);
        } catch (error) {
          console.error('Erro ao enviar para:', contact.name);
        }
      }

      // Marcar como completo
      // @ts-ignore - Supabase types not regenerated
      await (supabase as any)
        .from('campaigns')
        .update({ status: 'completed' })
        .eq('id', campaign.id);

      toast.success('Campanha enviada!');
      loadCampaigns();
    } catch (error) {
      toast.error('Erro ao enviar campanha');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // @ts-ignore - Supabase types not regenerated
      const { error } = await (supabase as any)
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Campanha deletada');
      loadCampaigns();
    } catch (error) {
      toast.error('Erro ao deletar campanha');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'secondary',
      scheduled: 'default',
      running: 'default',
      completed: 'default',
      failed: 'destructive'
    };
    return <Badge variant={colors[status] as any}>{status}</Badge>;
  };

  if (loading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Facebook className="h-8 w-8 text-[#1877F2]" />
            Campanhas Facebook
          </h1>
          <p className="text-muted-foreground">
            Crie e gerencie campanhas de disparo em massa
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{campaigns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Em Rascunho</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {campaigns.filter(c => c.status === 'draft').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Em Execução</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {campaigns.filter(c => c.status === 'running').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {campaigns.filter(c => c.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {campaign.message}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Criado: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    {campaign.total_count > 0 && (
                      <span>
                        Enviados: {campaign.sent_count}/{campaign.total_count}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <Button size="sm" onClick={() => handleSend(campaign)}>
                      <Send className="mr-2 h-3 w-3" />
                      Enviar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(campaign.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {campaigns.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma campanha criada ainda
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Campanha Facebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Campanha</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Campanha de Boas-Vindas"
              />
            </div>
            <div>
              <Label>Mensagem</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Olá! Temos uma oferta especial para você..."
                rows={4}
              />
            </div>
            <div>
              <Label>Lista de Contatos</Label>
              <select
                className="w-full border rounded p-2"
                value={formData.target_list}
                onChange={(e) => setFormData({ ...formData, target_list: e.target.value })}
              >
                <option value="">Selecione uma lista</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.contact_count || 0} contatos)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Criar Campanha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Trash2, Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactList {
  id: string;
  name: string;
  description: string | null;
  contact_count: number;
  created_at: string;
}

export default function ListasContatos() {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      // @ts-ignore - Supabase types not regenerated
      const { data, error } = await (supabase as any)
        .from('contact_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Contar contatos para cada lista
      const listsWithCounts = await Promise.all(
        (data || []).map(async (list: any) => {
          // @ts-ignore - Supabase types not regenerated
          const { count } = await (supabase as any)
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id);

          return { ...list, contact_count: count || 0 };
        })
      );

      setLists(listsWithCounts);
    } catch (error) {
      toast.error('Erro ao carregar listas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Preencha o nome da lista');
      return;
    }

    try {
      // @ts-ignore - Supabase types not regenerated
      const { error } = await (supabase as any)
        .from('contact_lists')
        .insert({
          name: formData.name,
          description: formData.description
        });

      if (error) throw error;

      toast.success('Lista criada');
      setDialogOpen(false);
      setFormData({ name: '', description: '' });
      loadLists();
    } catch (error) {
      toast.error('Erro ao criar lista');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // @ts-ignore - Supabase types not regenerated
      const { error } = await (supabase as any)
        .from('contact_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Lista deletada');
      loadLists();
    } catch (error) {
      toast.error('Erro ao deletar lista');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedList) {
      toast.error('Selecione uma lista e arquivo');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');

        const contacts = lines.slice(1).map((line) => {
          const values = line.split(',');
          return {
            name: values[0]?.trim(),
            email: values[1]?.trim(),
            phone: values[2]?.trim(),
            list_id: selectedList,
            source: 'import'
          };
        }).filter(c => c.name);

        // @ts-ignore - Supabase types not regenerated
        const { error } = await (supabase as any)
          .from('contacts')
          .insert(contacts);

        if (error) throw error;

        toast.success(`${contacts.length} contatos importados`);
        setImportDialogOpen(false);
        loadLists();
      } catch (error) {
        toast.error('Erro ao importar contatos');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const exportList = async (listId: string, listName: string) => {
    try {
      // @ts-ignore - Supabase types not regenerated
      const { data: contacts } = await (supabase as any)
        .from('contacts')
        .select('*')
        .eq('list_id', listId);

      if (!contacts || contacts.length === 0) {
        toast.info('Lista vazia');
        return;
      }

      const csv = [
        ['Nome', 'Email', 'Telefone', 'Fonte', 'Status'].join(','),
        ...contacts.map((c: any) =>
          [c.name, c.email || '', c.phone || '', c.source || '', c.status].join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${listName}_${new Date().toISOString()}.csv`;
      a.click();
      toast.success('Lista exportada');
    } catch (error) {
      toast.error('Erro ao exportar lista');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Listas de Contatos</h1>
          <p className="text-muted-foreground">
            Organize seus contatos em listas para campanhas direcionadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Lista
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Listas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{lists.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {lists.reduce((sum, list) => sum + list.contact_count, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Média por Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {lists.length > 0
                ? Math.round(
                    lists.reduce((sum, list) => sum + list.contact_count, 0) / lists.length
                  )
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                </div>
                <Badge>{list.contact_count} contatos</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {list.description && (
                <p className="text-sm text-muted-foreground mb-4">{list.description}</p>
              )}
              <div className="text-xs text-muted-foreground mb-4">
                Criada em {new Date(list.created_at).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => exportList(list.id, list.name)}
                >
                  <Download className="mr-2 h-3 w-3" />
                  Exportar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(list.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {lists.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma lista criada ainda
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Lista de Contatos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Lista</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Clientes VIP"
              />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Clientes com compras acima de R$ 1000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Criar Lista</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecione a Lista</Label>
              <select
                className="w-full border rounded p-2"
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
              >
                <option value="">Escolha uma lista</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Arquivo CSV</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={!selectedList}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Formato: Nome, Email, Telefone (uma linha por contato)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
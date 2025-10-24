import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { correspondentesService } from '@/services/correspondentes';
import { Plus, Edit, Trash2, Users, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Correspondentes() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [selectedCorrespondente, setSelectedCorrespondente] = useState<string | null>(null);

  const { data: correspondentes = [] } = useQuery({
    queryKey: ['correspondentes'],
    queryFn: () => correspondentesService.list()
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['correspondente-usuarios', selectedCorrespondente],
    queryFn: () => correspondentesService.getUsuarios(selectedCorrespondente!),
    enabled: !!selectedCorrespondente
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => correspondentesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondentes'] });
      toast.success('Correspondente criado com sucesso');
      setDialogOpen(false);
      setEditando(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      correspondentesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondentes'] });
      toast.success('Correspondente atualizado com sucesso');
      setDialogOpen(false);
      setEditando(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => correspondentesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondentes'] });
      toast.success('Correspondente excluído com sucesso');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get('nome') as string,
      cnpj: formData.get('cnpj') as string,
      email: formData.get('email') as string,
      telefone: formData.get('telefone') as string,
      ativo: true
    };

    if (editando) {
      updateMutation.mutate({ id: editando.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Correspondentes</h1>
          <p className="text-muted-foreground">Gestão de empresas correspondentes bancárias</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditando(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Correspondente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editando ? 'Editar Correspondente' : 'Novo Correspondente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input name="nome" defaultValue={editando?.nome} required />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input name="cnpj" defaultValue={editando?.cnpj} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" name="email" defaultValue={editando?.email} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input name="telefone" defaultValue={editando?.telefone} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {correspondentes.map((corresp: any) => (
          <Card key={corresp.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{corresp.nome}</h3>
                  {corresp.cnpj && <p className="text-sm text-muted-foreground">{corresp.cnpj}</p>}
                </div>
              </div>
              <Badge variant={corresp.ativo ? 'default' : 'secondary'}>
                {corresp.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            {corresp.email && (
              <p className="text-sm text-muted-foreground mb-2">{corresp.email}</p>
            )}
            {corresp.telefone && (
              <p className="text-sm text-muted-foreground mb-4">{corresp.telefone}</p>
            )}
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditando(corresp);
                  setDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteMutation.mutate(corresp.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedCorrespondente(corresp.id)}
              >
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

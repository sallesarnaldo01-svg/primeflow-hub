import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empreendimentosService } from '@/services/empreendimentos';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Empreendimentos() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  const { data: empreendimentos = [], isLoading } = useQuery({
    queryKey: ['empreendimentos'],
    queryFn: () => empreendimentosService.list()
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => empreendimentosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empreendimentos'] });
      toast.success('Empreendimento criado com sucesso');
      setDialogOpen(false);
      setEditando(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      empreendimentosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empreendimentos'] });
      toast.success('Empreendimento atualizado com sucesso');
      setDialogOpen(false);
      setEditando(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => empreendimentosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empreendimentos'] });
      toast.success('Empreendimento excluído com sucesso');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      endereco: formData.get('endereco') as string,
      cidade: formData.get('cidade') as string,
      estado: formData.get('estado') as string,
      construtora: formData.get('construtora') as string,
      valorMinimo: Number(formData.get('valorMinimo')),
      valorMaximo: Number(formData.get('valorMaximo')),
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
          <h1 className="text-3xl font-bold">Empreendimentos</h1>
          <p className="text-muted-foreground">Gestão de projetos imobiliários</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditando(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Empreendimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editando ? 'Editar Empreendimento' : 'Novo Empreendimento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input name="nome" defaultValue={editando?.nome} required />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea name="descricao" defaultValue={editando?.descricao} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Endereço</Label>
                  <Input name="endereco" defaultValue={editando?.endereco} />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input name="cidade" defaultValue={editando?.cidade} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Estado</Label>
                  <Input name="estado" defaultValue={editando?.estado} />
                </div>
                <div>
                  <Label>Construtora</Label>
                  <Input name="construtora" defaultValue={editando?.construtora} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Mínimo</Label>
                  <Input type="number" name="valorMinimo" defaultValue={editando?.valorMinimo} />
                </div>
                <div>
                  <Label>Valor Máximo</Label>
                  <Input type="number" name="valorMaximo" defaultValue={editando?.valorMaximo} />
                </div>
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
        {empreendimentos.map((emp: any) => (
          <Card key={emp.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{emp.nome}</h3>
                  {emp.cidade && <p className="text-sm text-muted-foreground">{emp.cidade}/{emp.estado}</p>}
                </div>
              </div>
              <Badge variant={emp.ativo ? 'default' : 'secondary'}>
                {emp.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            {emp.descricao && (
              <p className="text-sm text-muted-foreground mb-4">{emp.descricao}</p>
            )}
            
            {(emp.valorMinimo || emp.valorMaximo) && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Faixa de Valor</p>
                <p className="text-lg font-bold">
                  R$ {emp.valorMinimo?.toLocaleString('pt-BR')} - 
                  R$ {emp.valorMaximo?.toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditando(emp);
                  setDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteMutation.mutate(emp.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

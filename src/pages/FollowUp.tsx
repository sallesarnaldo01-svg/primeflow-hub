import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Play, Trash2, Edit } from 'lucide-react';
import { followUpCadenceService, FollowUpCadence } from '@/services/followupCadence';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function FollowUp() {
  const [cadences, setCadences] = useState<FollowUpCadence[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCadence, setEditingCadence] = useState<FollowUpCadence | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: '{}',
    steps: '[]',
    active: true,
  });

  useEffect(() => {
    loadCadences();
  }, []);

  const loadCadences = async () => {
    try {
      const data = await followUpCadenceService.list();
      setCadences(data);
    } catch (error) {
      toast.error('Erro ao carregar cadências');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        trigger: JSON.parse(formData.trigger),
        steps: JSON.parse(formData.steps),
      };

      if (editingCadence) {
        await followUpCadenceService.update(editingCadence.id, data);
        toast.success('Cadência atualizada');
      } else {
        await followUpCadenceService.create(data);
        toast.success('Cadência criada');
      }

      setDialogOpen(false);
      setEditingCadence(null);
      setFormData({
        name: '',
        trigger: '{}',
        steps: '[]',
        active: true,
      });
      loadCadences();
    } catch (error) {
      toast.error('Erro ao salvar cadência');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await followUpCadenceService.delete(id);
      toast.success('Cadência deletada');
      loadCadences();
    } catch (error) {
      toast.error('Erro ao deletar cadência');
    }
  };

  const handleEdit = (cadence: FollowUpCadence) => {
    setEditingCadence(cadence);
    setFormData({
      name: cadence.name,
      trigger: JSON.stringify(cadence.trigger, null, 2),
      steps: JSON.stringify(cadence.steps, null, 2),
      active: cadence.active,
    });
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cadências de Follow-up</h1>
          <p className="text-muted-foreground">
            Configure sequências automáticas de reativação de leads
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Cadência
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cadences.map((cadence) => (
            <Card key={cadence.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{cadence.name}</h3>
                  <Badge variant={cadence.active ? 'default' : 'secondary'}>
                    {cadence.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(cadence)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cadence.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(cadence.steps) ? cadence.steps.length : 0} etapas
                </p>
                <p className="text-xs text-muted-foreground">
                  Criado em {new Date(cadence.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCadence ? 'Editar' : 'Nova'} Cadência
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Reativação Flash"
              />
            </div>
            <div>
              <Label>Trigger (JSON)</Label>
              <textarea
                value={formData.trigger}
                onChange={(e) =>
                  setFormData({ ...formData, trigger: e.target.value })
                }
                placeholder='{"condition": "inativo > 30min"}'
                className="w-full h-24 p-2 border rounded font-mono text-xs"
              />
            </div>
            <div>
              <Label>Steps (JSON Array)</Label>
              <textarea
                value={formData.steps}
                onChange={(e) =>
                  setFormData({ ...formData, steps: e.target.value })
                }
                placeholder='[{"delay": 30, "message": "Oi, tudo bem?"}]'
                className="w-full h-32 p-2 border rounded font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

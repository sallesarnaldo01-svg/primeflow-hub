import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { Sprint } from '@/hooks/useScrum';

interface CreateSprintDialogProps {
  teamId: string;
  onCreateSprint: (sprint: Omit<Sprint, 'id' | 'completedStoryPoints'>) => void;
}

export function CreateSprintDialog({ teamId, onCreateSprint }: CreateSprintDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    totalStoryPoints: 0,
    status: 'PLANNED' as Sprint['status'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) return;

    onCreateSprint({
      ...formData,
      teamId
    });
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      totalStoryPoints: 0,
      status: 'PLANNED',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Novo Sprint
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Sprint</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Sprint</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Sprint 24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalPoints">Story Points Planejados</Label>
            <Input
              id="totalPoints"
              type="number"
              min="0"
              value={formData.totalStoryPoints}
              onChange={(e) =>
                setFormData({ ...formData, totalStoryPoints: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Sprint</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

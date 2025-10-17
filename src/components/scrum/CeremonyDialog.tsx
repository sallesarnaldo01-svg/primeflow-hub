import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import type { Ceremony } from '@/services/scrum';

interface CeremonyDialogProps {
  teamId: string;
  onCreateCeremony: (ceremony: Omit<Ceremony, 'id' | 'status'>) => void;
}

export function CeremonyDialog({ teamId, onCreateCeremony }: CeremonyDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'DAILY' | 'PLANNING' | 'REVIEW' | 'RETROSPECTIVE'>('DAILY');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(15);

  const ceremonyDurations = {
    DAILY: 15,
    PLANNING: 120,
    REVIEW: 60,
    RETROSPECTIVE: 90,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduledAt) {
      const ceremonyNames = {
        DAILY: 'Daily Standup',
        PLANNING: 'Sprint Planning',
        REVIEW: 'Sprint Review',
        RETROSPECTIVE: 'Sprint Retrospective',
      };

      onCreateCeremony({
        teamId,
        name: ceremonyNames[type],
        type,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration,
        participants: [],
      });
      setScheduledAt('');
      setType('DAILY');
      setDuration(15);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Agendar Cerimônia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar Nova Cerimônia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ceremony-type">Tipo de Cerimônia</Label>
            <Select
              value={type}
              onValueChange={(value: any) => {
                setType(value);
                setDuration(ceremonyDurations[value as keyof typeof ceremonyDurations]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily Standup</SelectItem>
                <SelectItem value="PLANNING">Sprint Planning</SelectItem>
                <SelectItem value="REVIEW">Sprint Review</SelectItem>
                <SelectItem value="RETROSPECTIVE">Retrospective</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scheduled-at">Data e Hora</Label>
            <Input
              id="scheduled-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={5}
              max={480}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agendar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

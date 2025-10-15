import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsService } from '@/services/visits';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ScheduleVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId?: string;
  propertyId?: string;
  contactId?: string;
}

export function ScheduleVisitDialog({
  open,
  onOpenChange,
  dealId,
  propertyId,
  contactId
}: ScheduleVisitDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');

  const createMutation = useMutation({
    mutationFn: visitsService.createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      toast({
        title: 'Visita agendada!',
        description: 'A visita foi agendada com sucesso.'
      });
      onOpenChange(false);
      setDate(undefined);
      setTime('');
    },
    onError: () => {
      toast({
        title: 'Erro ao agendar visita',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time) {
      toast({
        title: 'Preencha todos os campos',
        variant: 'destructive'
      });
      return;
    }

    const [hours, minutes] = time.split(':');
    const scheduledAt = new Date(date);
    scheduledAt.setHours(parseInt(hours), parseInt(minutes));

    createMutation.mutate({
      propertyId: propertyId || '',
      dealId,
      contactId,
      scheduledAt: scheduledAt.toISOString(),
      status: 'scheduled'
    });
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Visita</DialogTitle>
          <DialogDescription>
            Escolha a melhor data e horário para a visita
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Data da Visita</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <Label>Horário</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {date && time && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center text-sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>
                  Agendado para {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {time}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Confirmar Agendamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

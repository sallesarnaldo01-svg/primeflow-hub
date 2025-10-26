import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  CheckSquare,
  FileText,
  Calculator,
  Archive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface LeadActionsKanbanProps {
  leadId: string;
  onActionComplete?: () => void;
}

export function LeadActionsKanban({ leadId, onActionComplete }: LeadActionsKanbanProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const interactionActions = [
    { icon: MessageSquare, label: 'Anotação', color: 'text-blue-500', action: 'note' },
    { icon: Phone, label: 'Ligação', color: 'text-green-500', action: 'call' },
    { icon: Mail, label: 'E-mail', color: 'text-purple-500', action: 'email' },
    { icon: MessageCircle, label: 'SMS', color: 'text-yellow-500', action: 'sms' },
    { icon: MessageCircle, label: 'WhatsApp', color: 'text-green-600', action: 'whatsapp' },
    { icon: Calendar, label: 'Visita', color: 'text-red-500', action: 'visit' },
    { icon: CheckSquare, label: 'Tarefa', color: 'text-indigo-500', action: 'task' }
  ];

  const saleActions = [
    { icon: Archive, label: 'Reserva', color: 'text-orange-500', action: 'reserve' },
    { icon: FileText, label: 'Pré-Cadastro', color: 'text-cyan-500', action: 'pre-register' },
    { icon: Calculator, label: 'Simulação', color: 'text-pink-500', action: 'simulate' }
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case 'pre-register':
        navigate(`/pre-cadastros/novo?leadId=${leadId}`);
        break;
      case 'simulate':
        toast({
          title: 'Simulador',
          description: 'Abrindo simulador de financiamento...'
        });
        break;
      case 'visit':
        navigate(`/agendamentos/novo?leadId=${leadId}`);
        break;
      default:
        toast({
          title: action.charAt(0).toUpperCase() + action.slice(1),
          description: `Ação "${action}" registrada para o lead.`
        });
        onActionComplete?.();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas - Interação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {interactionActions.map((action) => (
              <Button
                key={action.action}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => handleAction(action.action)}
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações de Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {saleActions.map((action) => (
              <Button
                key={action.action}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => handleAction(action.action)}
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

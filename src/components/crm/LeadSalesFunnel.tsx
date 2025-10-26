import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  FileSearch, 
  Archive, 
  DollarSign, 
  XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadSalesFunnelProps {
  currentStage?: string;
  onStageChange?: (stage: string) => void;
}

export function LeadSalesFunnel({ currentStage = 'EM_ATENDIMENTO', onStageChange }: LeadSalesFunnelProps) {
  const [selectedStage, setSelectedStage] = useState(currentStage);

  const stages = [
    { id: 'EM_ATENDIMENTO', label: 'Em Atendimento', icon: Users, color: 'bg-blue-500' },
    { id: 'VISITA_AGENDADA', label: 'Visita Agendada', icon: Calendar, color: 'bg-purple-500' },
    { id: 'VISITA_REALIZADA', label: 'Visita Realizada', icon: CheckCircle, color: 'bg-indigo-500' },
    { id: 'EM_ANALISE_CREDITO', label: 'Em Análise de Crédito', icon: FileSearch, color: 'bg-yellow-500' },
    { id: 'COM_RESERVA', label: 'Com Reserva', icon: Archive, color: 'bg-orange-500' },
    { id: 'VENDA_REALIZADA', label: 'Venda Realizada', icon: DollarSign, color: 'bg-green-500' },
    { id: 'DESCARTAR', label: 'Descartar', icon: XCircle, color: 'bg-red-500' }
  ];

  const handleStageClick = (stageId: string) => {
    setSelectedStage(stageId);
    onStageChange?.(stageId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const isActive = stage.id === selectedStage;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                  isActive 
                    ? "bg-primary/10 border-2 border-primary shadow-md" 
                    : "bg-muted/50 hover:bg-muted border border-transparent"
                )}
                onClick={() => handleStageClick(stage.id)}
              >
                <div className={cn(
                  "rounded-full p-2",
                  isActive ? stage.color : "bg-muted-foreground/20"
                )}>
                  <Icon className={cn(
                    "h-4 w-4",
                    isActive ? "text-white" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "flex-1 font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {stage.label}
                </span>
                {isActive && (
                  <Badge variant="default">Atual</Badge>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3">Status de Documentação</h4>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center py-2">
              Assinatura Caixa
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              Comissão Recebida
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              Formulários
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              Não Comprou
            </Badge>
            <Badge variant="secondary" className="justify-center py-2">
              Doc. Completa
            </Badge>
            <Badge variant="secondary" className="justify-center py-2">
              Doc. Incompleta
            </Badge>
            <Badge variant="default" className="justify-center py-2 col-span-2">
              Retorno
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

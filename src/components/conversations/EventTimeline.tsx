import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Bot, User, Settings, MessageSquare } from 'lucide-react';
import { ConversationEvent } from '@/services/conversationEvents';

interface EventTimelineProps {
  events: ConversationEvent[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  const getIcon = (actor: string) => {
    switch (actor) {
      case 'ai_agent':
        return <Bot className="h-4 w-4" />;
      case 'human_agent':
        return <User className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActorLabel = (actor: string) => {
    switch (actor) {
      case 'ai_agent':
        return 'IA';
      case 'human_agent':
        return 'Agente';
      case 'system':
        return 'Sistema';
      default:
        return 'Cliente';
    }
  };

  const getActorColor = (actor: string) => {
    switch (actor) {
      case 'ai_agent':
        return 'bg-blue-50 border-blue-200';
      case 'human_agent':
        return 'bg-green-50 border-green-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-border';
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className={`p-2 rounded-full ${getActorColor(event.actor)}`}>
              {getIcon(event.actor)}
            </div>
          </div>
          <div className="flex-1">
            <Card className={`p-3 ${getActorColor(event.actor)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{getActorLabel(event.actor)}</Badge>
                {event.actorName && (
                  <span className="text-sm font-medium">{event.actorName}</span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {format(new Date(event.createdAt), "HH:mm", { locale: ptBR })}
                </span>
              </div>
              {event.content && (
                <div className="text-sm">{event.content}</div>
              )}
              {event.metadata && (
                <div className="text-xs text-muted-foreground mt-2">
                  {JSON.stringify(event.metadata)}
                </div>
              )}
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}

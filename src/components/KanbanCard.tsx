import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MoreHorizontal,
  Flag,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Clock,
} from 'lucide-react';

const priorityColors = {
  high: 'text-red-600 bg-red-100',
  medium: 'text-yellow-600 bg-yellow-100',
  low: 'text-green-600 bg-green-100',
};

const priorityLabels = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

interface KanbanCardProps {
  card: any;
  onClick: (card: any) => void;
}

export function KanbanCard({ card, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
      onClick={() => onClick(card)}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          {/* Priority & Menu */}
          <div className="flex items-center justify-between">
            <Badge className={`${priorityColors[card.priority]} text-xs`}>
              <Flag className="h-3 w-3 mr-1" />
              {priorityLabels[card.priority]}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Title & Description */}
          <div>
            <h4 className="font-semibold text-sm line-clamp-2">
              {card.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {card.description}
            </p>
          </div>

          {/* Tags */}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {card.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{card.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Progress & Stats */}
          <div className="space-y-2">
            {card.checklist.total > 0 && (
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="h-2 bg-primary rounded-full transition-all"
                    style={{
                      width: `${(card.checklist.completed / card.checklist.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {card.checklist.completed}/{card.checklist.total}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-3">
                {card.attachments > 0 && (
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-3 w-3" />
                    <span>{card.attachments}</span>
                  </div>
                )}
                {card.comments > 0 && (
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{card.comments}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className={isOverdue(card.dueDate) ? 'text-red-600' : ''}>
                  {formatDate(card.dueDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">
                  {card.assignee?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {card.assignee}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
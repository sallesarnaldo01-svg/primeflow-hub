import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BacklogItem } from '@/hooks/useScrum';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';

interface SprintBoardProps {
  items: BacklogItem[];
  onMoveItem: (itemId: string, newStatus: BacklogItem['status']) => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'story':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'bug':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'task':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-muted';
  }
};

const columns: { id: BacklogItem['status']; title: string; bgClass: string }[] = [
  { id: 'todo', title: 'A Fazer', bgClass: '' },
  { id: 'in-progress', title: 'Em Progresso', bgClass: 'bg-blue-50 dark:bg-blue-950' },
  { id: 'done', title: 'Concluído', bgClass: 'bg-green-50 dark:bg-green-950' },
];

export function SprintBoard({ items, onMoveItem }: SprintBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const newStatus = over.id as BacklogItem['status'];
      onMoveItem(active.id as string, newStatus);
    }
  };

  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <Card key={column.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                {column.title}
                <Badge variant="secondary">
                  {items.filter(item => item.status === column.id).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 min-h-[400px]">
                {items
                  .filter(item => item.status === column.id)
                  .map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('itemId', item.id);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('itemId');
                        if (draggedId && draggedId !== item.id) {
                          onMoveItem(draggedId, column.id);
                        }
                      }}
                      className={`p-3 border rounded-lg cursor-move hover:shadow-md transition-shadow ${column.bgClass}`}
                    >
                      <h4 className="font-medium text-sm mb-2">{item.title}</h4>
                      <div className="flex items-center justify-between">
                        <Badge className={getTypeColor(item.type)} variant="secondary">
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.points} pts</span>
                      </div>
                      {item.assignee && (
                        <p className="text-xs text-muted-foreground mt-2">{item.assignee}</p>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="p-3 border rounded-lg bg-background shadow-lg">
            <h4 className="font-medium text-sm mb-2">{activeItem.title}</h4>
            <div className="flex items-center justify-between">
              <Badge className={getTypeColor(activeItem.type)} variant="secondary">
                {activeItem.type}
              </Badge>
              <span className="text-xs text-muted-foreground">{activeItem.points} pts</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

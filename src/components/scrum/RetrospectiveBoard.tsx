import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, ThumbsUp } from 'lucide-react';

interface RetroItem {
  id: string;
  text: string;
  author: string;
  likes: number;
}

interface RetroColumn {
  title: string;
  color: string;
  items: RetroItem[];
}

export function RetrospectiveBoard() {
  const [columns, setColumns] = useState<RetroColumn[]>([
    {
      title: 'Continue (Keep)',
      color: 'bg-green-100 dark:bg-green-900',
      items: [
        { id: '1', text: 'Daily meetings estão produtivas', author: 'João', likes: 3 },
        { id: '2', text: 'Code reviews em menos de 24h', author: 'Ana', likes: 5 },
      ],
    },
    {
      title: 'Pare (Stop)',
      color: 'bg-red-100 dark:bg-red-900',
      items: [
        { id: '3', text: 'Reuniões sem pauta definida', author: 'Pedro', likes: 4 },
      ],
    },
    {
      title: 'Comece (Start)',
      color: 'bg-blue-100 dark:bg-blue-900',
      items: [
        { id: '4', text: 'Pair programming nas sextas', author: 'Maria', likes: 2 },
        { id: '5', text: 'Tech talks quinzenais', author: 'João', likes: 6 },
      ],
    },
  ]);

  const [newItems, setNewItems] = useState<{ [key: number]: string }>({});

  const handleAddItem = (columnIndex: number) => {
    const text = newItems[columnIndex];
    if (!text?.trim()) return;

    const newItem: RetroItem = {
      id: Date.now().toString(),
      text,
      author: 'Você',
      likes: 0,
    };

    setColumns((prev) => {
      const updated = [...prev];
      updated[columnIndex].items.push(newItem);
      return updated;
    });

    setNewItems({ ...newItems, [columnIndex]: '' });
  };

  const handleLike = (columnIndex: number, itemId: string) => {
    setColumns((prev) => {
      const updated = [...prev];
      const item = updated[columnIndex].items.find((i) => i.id === itemId);
      if (item) item.likes++;
      return updated;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Retrospectiva - Keep/Stop/Start
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column, columnIndex) => (
            <div key={column.title} className="space-y-3">
              <div className={`${column.color} p-3 rounded-lg`}>
                <h3 className="font-semibold text-center">{column.title}</h3>
              </div>

              <div className="space-y-2">
                {column.items.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg space-y-2">
                    <p className="text-sm">{item.text}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.author}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(columnIndex, item.id)}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        <span className="text-xs">{item.likes}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Adicionar item..."
                  value={newItems[columnIndex] || ''}
                  onChange={(e) => setNewItems({ ...newItems, [columnIndex]: e.target.value })}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleAddItem(columnIndex)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

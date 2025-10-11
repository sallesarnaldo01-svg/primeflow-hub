import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KanbanCard } from '@/components/KanbanCard';
import {
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  Flag,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Clock,
  Filter,
  Search,
} from 'lucide-react';

const initialColumns = [
  {
    id: 'todo',
    title: 'A Fazer',
    color: 'border-gray-300',
    cards: [
      {
        id: 1,
        title: 'Implementar autenticação',
        description: 'Criar sistema de login e registro de usuários',
        priority: 'high',
        assignee: 'João Santos',
        dueDate: '2024-01-15',
        tags: ['Frontend', 'Backend'],
        attachments: 2,
        comments: 3,
        checklist: { completed: 2, total: 5 },
      },
      {
        id: 2,
        title: 'Design do dashboard',
        description: 'Criar mockups e protótipos das telas principais',
        priority: 'medium',
        assignee: 'Ana Costa',
        dueDate: '2024-01-20',
        tags: ['Design', 'UX'],
        attachments: 1,
        comments: 1,
        checklist: { completed: 0, total: 3 },
      },
    ],
  },
  {
    id: 'doing',
    title: 'Em Progresso',
    color: 'border-blue-300',
    cards: [
      {
        id: 3,
        title: 'Integração com API',
        description: 'Conectar frontend com serviços backend',
        priority: 'high',
        assignee: 'Pedro Lima',
        dueDate: '2024-01-18',
        tags: ['API', 'Integration'],
        attachments: 0,
        comments: 5,
        checklist: { completed: 3, total: 4 },
      },
    ],
  },
  {
    id: 'review',
    title: 'Em Revisão',
    color: 'border-yellow-300',
    cards: [
      {
        id: 4,
        title: 'Documentação da API',
        description: 'Criar documentação técnica completa',
        priority: 'low',
        assignee: 'Maria Silva',
        dueDate: '2024-01-25',
        tags: ['Docs'],
        attachments: 3,
        comments: 2,
        checklist: { completed: 4, total: 4 },
      },
    ],
  },
  {
    id: 'done',
    title: 'Concluído',
    color: 'border-green-300',
    cards: [
      {
        id: 5,
        title: 'Setup do projeto',
        description: 'Configuração inicial do ambiente',
        priority: 'medium',
        assignee: 'João Santos',
        dueDate: '2024-01-10',
        tags: ['Setup'],
        attachments: 1,
        comments: 0,
        checklist: { completed: 3, total: 3 },
      },
    ],
  },
];

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

export default function Kanban() {
  const [columns, setColumns] = useState(initialColumns);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredColumns = columns.map(column => ({
    ...column,
    cards: column.cards.filter(card =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
  }));

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setIsCardDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = columns
      .flatMap(col => col.cards)
      .find(card => card.id === active.id);
    setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCardId = active.id;
    const overId = over.id;

    // Find the source column and card
    const sourceColumn = columns.find(column =>
      column.cards.some(card => card.id === activeCardId)
    );
    const activeCard = sourceColumn?.cards.find(card => card.id === activeCardId);

    if (!sourceColumn || !activeCard) return;

    // Find target column (either by column id or card id)
    let targetColumn = columns.find(column => column.id === overId);
    if (!targetColumn) {
      targetColumn = columns.find(column =>
        column.cards.some(card => card.id === overId)
      );
    }

    if (!targetColumn) return;

    // If dropped in the same column, just reorder
    if (sourceColumn.id === targetColumn.id) {
      const targetCardIndex = targetColumn.cards.findIndex(card => card.id === overId);
      const activeCardIndex = sourceColumn.cards.findIndex(card => card.id === activeCardId);
      
      if (targetCardIndex !== -1 && activeCardIndex !== targetCardIndex) {
        const newCards = [...sourceColumn.cards];
        const [removed] = newCards.splice(activeCardIndex, 1);
        newCards.splice(targetCardIndex, 0, removed);

        setColumns(columns.map(col =>
          col.id === sourceColumn.id ? { ...col, cards: newCards } : col
        ));
      }
    } else {
      // Move between columns
      const sourceCards = sourceColumn.cards.filter(card => card.id !== activeCardId);
      const targetCards = [...targetColumn.cards, activeCard];

      setColumns(columns.map(col => {
        if (col.id === sourceColumn.id) {
          return { ...col, cards: sourceCards };
        }
        if (col.id === targetColumn.id) {
          return { ...col, cards: targetCards };
        }
        return col;
      }));
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 h-full flex flex-col"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kanban</h1>
            <p className="text-muted-foreground">
              Gerencie tarefas e projetos com metodologia Kanban
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((column) => (
            <Card key={column.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {column.title}
                    </p>
                    <p className="text-2xl font-bold">{column.cards.length}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${column.color.replace('border', 'bg')}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Board */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex space-x-6 h-full min-w-max pb-6">
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {filteredColumns.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80">
                  <Card className={`h-full border-t-4 ${column.color}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                          {column.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{column.cards.length}</Badge>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                      <SortableContext
                        items={column.cards.map(card => card.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <AnimatePresence>
                          {column.cards.map((card) => (
                            <motion.div
                              key={card.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <KanbanCard card={card} onClick={handleCardClick} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </SortableContext>
                    </CardContent>
                  </Card>
                </div>
              ))}
              <DragOverlay>
                {activeCard ? (
                  <KanbanCard card={activeCard} onClick={() => {}} />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Card Detail Dialog */}
        <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCard?.title}</DialogTitle>
            </DialogHeader>
            {selectedCard && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Responsável</Label>
                    <Select defaultValue={selectedCard.assignee}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="João Santos">João Santos</SelectItem>
                        <SelectItem value="Ana Costa">Ana Costa</SelectItem>
                        <SelectItem value="Pedro Lima">Pedro Lima</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prazo</Label>
                    <Input type="date" defaultValue={selectedCard.dueDate} />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    defaultValue={selectedCard.description}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button>Salvar Alterações</Button>
                  <Button variant="outline">Comentar</Button>
                  <Button variant="outline">Anexar Arquivo</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
}
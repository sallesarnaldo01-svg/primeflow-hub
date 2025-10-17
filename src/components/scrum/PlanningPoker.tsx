import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Eye, EyeOff } from 'lucide-react';

const FIBONACCI_CARDS = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'];

interface Vote {
  userId: string;
  userName: string;
  value: number | string;
}

export function PlanningPoker() {
  const [revealed, setRevealed] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | string | null>(null);
  const [votes, setVotes] = useState<Vote[]>([
    { userId: '1', userName: 'João Santos', value: 8 },
    { userId: '2', userName: 'Ana Costa', value: 5 },
    { userId: '3', userName: 'Pedro Lima', value: 8 },
    { userId: '4', userName: 'Maria Silva', value: 5 },
  ]);

  const handleVote = (value: number | string) => {
    setSelectedCard(value);
  };

  const handleReveal = () => {
    setRevealed(!revealed);
  };

  const handleReset = () => {
    setRevealed(false);
    setSelectedCard(null);
  };

  const average = revealed
    ? Math.round(
        votes.reduce((sum, v) => sum + (typeof v.value === 'number' ? v.value : 0), 0) /
          votes.filter((v) => typeof v.value === 'number').length
      )
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            Planning Poker
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReveal}>
              {revealed ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {revealed ? 'Ocultar' : 'Revelar'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Resetar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cards de Votação */}
        <div className="flex flex-wrap gap-2 justify-center">
          {FIBONACCI_CARDS.map((card) => (
            <Button
              key={card}
              variant={selectedCard === card ? 'default' : 'outline'}
              className="h-20 w-16 text-2xl font-bold"
              onClick={() => handleVote(card)}
            >
              {card}
            </Button>
          ))}
        </div>

        {/* Votos dos Participantes */}
        <div className="space-y-2">
          <h4 className="font-semibold">Votos da Equipe</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {votes.map((vote) => (
              <div key={vote.userId} className="flex flex-col items-center p-3 border rounded">
                <span className="text-sm font-medium mb-2">{vote.userName}</span>
                <Badge variant={revealed ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  {revealed ? vote.value : '?'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Resultado */}
        {revealed && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Média da Estimativa</p>
            <p className="text-3xl font-bold">{average} pontos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

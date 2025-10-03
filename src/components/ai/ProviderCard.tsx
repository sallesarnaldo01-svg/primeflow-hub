import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Trash2, Bot } from 'lucide-react';
import type { AIProvider } from '@/services/aiProviders';

interface ProviderCardProps {
  provider: AIProvider;
  onEdit: (provider: AIProvider) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}

const providerIcons: Record<string, string> = {
  LOVABLE: '💜',
  OPENAI: '🤖',
  MANUS: '🧠',
  GEMINI: '✨',
  CLAUDE: '🎭'
};

const providerColors: Record<string, string> = {
  LOVABLE: 'bg-purple-500',
  OPENAI: 'bg-green-500',
  MANUS: 'bg-blue-500',
  GEMINI: 'bg-yellow-500',
  CLAUDE: 'bg-orange-500'
};

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onEdit,
  onDelete,
  onToggle
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${providerColors[provider.type]} flex items-center justify-center text-2xl`}>
            {providerIcons[provider.type]}
          </div>
          <div>
            <CardTitle className="text-lg">{provider.name}</CardTitle>
            <CardDescription>{provider.type}</CardDescription>
          </div>
        </div>
        <Switch
          checked={provider.active}
          onCheckedChange={(checked) => onToggle(provider.id, checked)}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {provider.agents?.length || 0} agente(s)
              </span>
            </div>
            <Badge variant={provider.active ? 'default' : 'secondary'}>
              {provider.active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(provider)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(provider.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

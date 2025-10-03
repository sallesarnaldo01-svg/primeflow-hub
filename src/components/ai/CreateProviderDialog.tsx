import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { aiProvidersService, type AIProviderType } from '@/services/aiProviders';

interface CreateProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const providerOptions: { value: AIProviderType; label: string; description: string }[] = [
  { value: 'LOVABLE', label: 'Lovable AI', description: 'Gemini + GPT-5 via Lovable Gateway' },
  { value: 'OPENAI', label: 'OpenAI', description: 'GPT-4, GPT-5, etc.' },
  { value: 'MANUS', label: 'Manus AI', description: 'Manus AI Models' },
  { value: 'GEMINI', label: 'Google Gemini', description: 'Gemini Pro, Flash, etc.' },
  { value: 'CLAUDE', label: 'Anthropic Claude', description: 'Claude Opus, Sonnet, Haiku' }
];

export const CreateProviderDialog: React.FC<CreateProviderDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<AIProviderType>('LOVABLE');
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await aiProvidersService.createProvider({
        type,
        name,
        apiKey: apiKey || undefined
      });

      toast.success('Provedor criado com sucesso!');
      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setName('');
      setApiKey('');
      setType('LOVABLE');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar provedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Provedor de IA</DialogTitle>
            <DialogDescription>
              Configure um novo provedor de inteligência artificial
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Provedor</Label>
              <Select value={type} onValueChange={(v) => setType(v as AIProviderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Meu ChatGPT"
                required
              />
            </div>

            {type !== 'LOVABLE' && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground">
                  Sua chave de API ficará armazenada de forma segura
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Provedor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

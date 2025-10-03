import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Facebook, Loader2 } from 'lucide-react';
import { facebookService } from '@/services/facebook';
import { toast } from 'sonner';

interface FacebookConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function FacebookConnectDialog({
  open,
  onOpenChange,
  onConnected
}: FacebookConnectDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!email || !password) {
      toast.error('Preencha email e senha');
      return;
    }

    try {
      setLoading(true);
      await facebookService.initiate(email, password, name || 'Facebook');
      toast.success('Conectando ao Facebook...');
      onConnected();
      onOpenChange(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      toast.error('Erro ao conectar Facebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-[#1877F2]" />
            Conectar Facebook
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Conexão</Label>
            <Input
              id="name"
              placeholder="Ex: Página Principal"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">Email ou Telefone</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Conectar
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

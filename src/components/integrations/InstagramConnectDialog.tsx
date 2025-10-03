import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Instagram, Loader2 } from 'lucide-react';
import { instagramService } from '@/services/instagram';
import { toast } from 'sonner';

interface InstagramConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function InstagramConnectDialog({
  open,
  onOpenChange,
  onConnected
}: InstagramConnectDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!username || !password) {
      toast.error('Preencha usuário e senha');
      return;
    }

    try {
      setLoading(true);
      await instagramService.initiate(username, password, name || 'Instagram');
      toast.success('Conectando ao Instagram...');
      onConnected();
      onOpenChange(false);
      setUsername('');
      setPassword('');
      setName('');
    } catch (error) {
      toast.error('Erro ao conectar Instagram');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-[#E4405F]" />
            Conectar Instagram
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Conexão</Label>
            <Input
              id="name"
              placeholder="Ex: Conta Comercial"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              placeholder="@usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

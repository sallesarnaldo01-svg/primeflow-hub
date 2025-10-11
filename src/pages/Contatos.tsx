import { useState } from 'react';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Download,
  RefreshCw,
  Search,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

export default function Contatos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedChannels, setSelectedChannels] = useState({
    whatsapp: false,
    facebook: false,
    instagram: false,
  });

  // Mock data
  const contacts = [
    {
      id: '1',
      name: 'João Silva',
      phone: '+55 11 98765-4321',
      email: 'joao@example.com',
      origin: 'whatsapp',
      tags: ['Cliente', 'VIP'],
      lastContact: '2024-01-15',
    },
    {
      id: '2',
      name: 'Maria Santos',
      phone: '+55 11 98765-4322',
      email: 'maria@example.com',
      origin: 'instagram',
      tags: ['Lead'],
      lastContact: '2024-01-14',
    },
  ];

  const stats = {
    total: 1247,
    new: 32,
    synced: 1200,
    failed: 15,
  };

  const handleSync = async () => {
    const selected = Object.entries(selectedChannels)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    if (selected.length === 0) {
      toast.error('Selecione pelo menos um canal');
      return;
    }

    setSyncing(true);
    setSyncProgress(0);

    // Simular sincronização
    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncing(false);
          setSyncModalOpen(false);
          toast.success('Contatos sincronizados com sucesso!');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleExport = () => {
    toast.success('Exportação iniciada. O arquivo será baixado em breve.');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contatos</h1>
            <p className="text-muted-foreground">
              Gerencie e sincronize seus contatos de todos os canais
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSyncModalOpen(true)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">contatos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.new}</div>
              <p className="text-xs text-muted-foreground">últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sincronizados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.synced}</div>
              <p className="text-xs text-muted-foreground">com canais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">erros na sincronização</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Contatos</CardTitle>
            <CardDescription>
              {contacts.length} contatos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{contact.name}</h3>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>{contact.phone}</span>
                        {contact.email && <span>• {contact.email}</span>}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="capitalize">
                      {contact.origin}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Último contato: {contact.lastContact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sync Modal */}
        <Dialog open={syncModalOpen} onOpenChange={setSyncModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sincronizar Contatos</DialogTitle>
              <DialogDescription>
                Selecione os canais que deseja sincronizar
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={selectedChannels.whatsapp}
                  onCheckedChange={(checked) =>
                    setSelectedChannels({ ...selectedChannels, whatsapp: checked as boolean })
                  }
                />
                <label htmlFor="whatsapp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  WhatsApp
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="facebook"
                  checked={selectedChannels.facebook}
                  onCheckedChange={(checked) =>
                    setSelectedChannels({ ...selectedChannels, facebook: checked as boolean })
                  }
                />
                <label htmlFor="facebook" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Facebook
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instagram"
                  checked={selectedChannels.instagram}
                  onCheckedChange={(checked) =>
                    setSelectedChannels({ ...selectedChannels, instagram: checked as boolean })
                  }
                />
                <label htmlFor="instagram" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Instagram
                </label>
              </div>

              {syncing && (
                <div className="space-y-2">
                  <Progress value={syncProgress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Sincronizando... {syncProgress}%
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSyncModalOpen(false)} disabled={syncing}>
                Cancelar
              </Button>
              <Button onClick={handleSync} disabled={syncing}>
                {syncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sincronizar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
}

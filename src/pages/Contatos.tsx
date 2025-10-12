import { useState, useEffect } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  Plus,
  Upload,
} from 'lucide-react';
import { contactsService, Contact } from '@/services/contacts';

export default function Contatos() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedChannels, setSelectedChannels] = useState({
    whatsapp: false,
    facebook: false,
    instagram: false,
  });
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'manual',
  });

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => {
      const created = new Date(c.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length,
    synced: contacts.filter(c => c.source !== 'manual').length,
    failed: 0,
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data } = await contactsService.getContacts();
      setContacts(data.data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar contatos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    const selected = Object.entries(selectedChannels)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    if (selected.length === 0) {
      toast.error('Selecione pelo menos um canal');
      return;
    }

    try {
      setSyncing(true);
      setSyncProgress(0);

      // Simulate progress
      const interval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const { data } = await contactsService.syncFromChannels({ sources: selected });
      
      clearInterval(interval);
      setSyncProgress(100);
      
      toast.success(`${data.data.synced} contatos sincronizados com sucesso!`);
      setSyncModalOpen(false);
      loadContacts();
    } catch (error: any) {
      toast.error('Erro ao sincronizar contatos');
    } finally {
      setSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await contactsService.exportCSV({ search: searchTerm });
      const url = window.URL.createObjectURL(blob.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contatos_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Contatos exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar contatos');
    }
  };

  const handleCreateContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    try {
      await contactsService.createContact(newContact);
      toast.success('Contato criado com sucesso!');
      setCreateModalOpen(false);
      setNewContact({ name: '', phone: '', email: '', source: 'manual' });
      loadContacts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar contato');
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data } = await contactsService.importCSV(file);
      toast.success(`${data.data.imported} contatos importados!`);
      if (data.data.errors.length > 0) {
        toast.error(`${data.data.errors.length} erros durante importação`);
      }
      loadContacts();
    } catch (error) {
      toast.error('Erro ao importar contatos');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />
              </label>
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
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
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.new}</div>
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
              {filteredContacts.length} contatos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum contato encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {contact.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>{contact.phone}</span>
                          {contact.email && <span>• {contact.email}</span>}
                        </div>
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex gap-2 mt-1">
                            {contact.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="capitalize">
                        {contact.source || 'manual'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Criado: {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Contact Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Contato</DialogTitle>
            <DialogDescription>
              Adicione um novo contato ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="+55 11 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateContact}>
                Criar Contato
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              <label htmlFor="whatsapp" className="text-sm font-medium leading-none">
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
              <label htmlFor="facebook" className="text-sm font-medium leading-none">
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
              <label htmlFor="instagram" className="text-sm font-medium leading-none">
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
    </>
  );
}

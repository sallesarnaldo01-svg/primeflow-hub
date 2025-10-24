import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus, Filter, Download, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  score: number;
  origin: string;
  assigned_to: string | null;
  created_at: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, statusFilter, searchTerm]);

  const loadLeads = async () => {
    try {
      // @ts-ignore - Supabase types not regenerated
      const { data, error } = await (supabase as any)
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      toast.error('Erro ao carregar leads');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        lead =>
          lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone?.includes(searchTerm)
      );
    }

    setFilteredLeads(filtered);
  };

  const distributeLeads = async () => {
    try {
      // Buscar atendentes disponíveis
      // @ts-ignore - Supabase types not regenerated
      const { data: agents } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('role', 'agent')
        .limit(10);

      if (!agents || agents.length === 0) {
        toast.error('Nenhum atendente disponível');
        return;
      }

      // Leads não atribuídos
      const unassignedLeads = leads.filter(lead => !lead.assigned_to);
      
      if (unassignedLeads.length === 0) {
        toast.info('Não há leads para distribuir');
        return;
      }

      // Distribuir round-robin
      const updates = unassignedLeads.map((lead, index) => ({
        id: lead.id,
        assigned_to: agents[index % agents.length].id
      }));

      // @ts-ignore - Supabase types not regenerated
      const { error } = await (supabase as any)
        .from('contacts')
        .upsert(updates);

      if (error) throw error;

      toast.success(`${updates.length} leads distribuídos com sucesso`);
      loadLeads();
    } catch (error) {
      toast.error('Erro ao distribuir leads');
      console.error(error);
    }
  };

  const exportLeads = () => {
    const csv = [
      ['Nome', 'Email', 'Telefone', 'Fonte', 'Status', 'Data'].join(','),
      ...filteredLeads.map(lead =>
        [
          lead.name,
          lead.email || '',
          lead.phone || '',
          lead.source || '',
          lead.status,
          new Date(lead.created_at).toLocaleDateString()
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString()}.csv`;
    a.click();
    toast.success('Leads exportados');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      new: 'default',
      contacted: 'secondary',
      qualified: 'default',
      lost: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return <div className="container mx-auto p-6">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Leads</h1>
          <p className="text-muted-foreground">Gerencie e distribua leads para sua equipe</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportLeads}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" onClick={distributeLeads}>
            <UserPlus className="mr-2 h-4 w-4" />
            Distribuir
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{leads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Novos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leads.filter(l => l.status === 'new').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Qualificados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leads.filter(l => l.status === 'qualified').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Não Atribuídos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leads.filter(l => !l.assigned_to).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Buscar</Label>
              <Input
                placeholder="Nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="contacted">Contatado</SelectItem>
                  <SelectItem value="qualified">Qualificado</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{lead.name}</h3>
                      {lead.score > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">{lead.score}%</span>
                          <Progress value={lead.score} className="w-20 h-2" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.email || lead.phone}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{lead.origin || lead.source}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(lead.status)}
                    {lead.assigned_to ? (
                      <Badge variant="outline">Atribuído</Badge>
                    ) : (
                      <Badge variant="secondary">Não atribuído</Badge>
                    )}
                    <Link to={`/leads/${lead.id}`}>
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
            {filteredLeads.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum lead encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
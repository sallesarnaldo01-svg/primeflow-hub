import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { preCadastrosService } from '@/services/preCadastros';
import { useNavigate } from 'react-router-dom';

export default function PreCadastros() {
  const navigate = useNavigate();
  const [filtroSituacao, setFiltroSituacao] = useState<string>('');
  const [busca, setBusca] = useState('');

  const { data: preCadastros = [], isLoading } = useQuery({
    queryKey: ['pre-cadastros', filtroSituacao],
    queryFn: () => preCadastrosService.list({ situacao: filtroSituacao })
  });

  const contadores = {
    total: preCadastros.length,
    novas: preCadastros.filter(p => p.situacao === 'NOVA').length,
    analise: preCadastros.filter(p => p.situacao === 'ANALISE').length,
    aprovados: preCadastros.filter(p => p.situacao === 'APROVADO').length,
    pendentes: preCadastros.filter(p => p.situacao === 'PENDENTE').length
  };

  const getSituacaoBadge = (situacao: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      NOVA: { variant: 'default', icon: FileText },
      ANALISE: { variant: 'secondary', icon: Clock },
      APROVADO: { variant: 'default', icon: CheckCircle },
      REJEITADO: { variant: 'destructive', icon: XCircle },
      PENDENTE: { variant: 'secondary', icon: Clock }
    };
    
    const config = variants[situacao] || variants.NOVA;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {situacao}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pré-Cadastros</h1>
          <p className="text-muted-foreground">Gestão de propostas de financiamento</p>
        </div>
        <Button onClick={() => navigate('/pre-cadastros/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pré-Cadastro
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4 cursor-pointer hover:bg-accent" onClick={() => setFiltroSituacao('')}>
          <div className="text-2xl font-bold">{contadores.total}</div>
          <div className="text-sm text-muted-foreground">Todos</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:bg-accent" onClick={() => setFiltroSituacao('NOVA')}>
          <div className="text-2xl font-bold">{contadores.novas}</div>
          <div className="text-sm text-muted-foreground">Novas</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:bg-accent" onClick={() => setFiltroSituacao('ANALISE')}>
          <div className="text-2xl font-bold">{contadores.analise}</div>
          <div className="text-sm text-muted-foreground">Em Andamento</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:bg-accent" onClick={() => setFiltroSituacao('PENDENTE')}>
          <div className="text-2xl font-bold">{contadores.pendentes}</div>
          <div className="text-sm text-muted-foreground">Pend. Aprovação</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:bg-accent" onClick={() => setFiltroSituacao('APROVADO')}>
          <div className="text-2xl font-bold">{contadores.aprovados}</div>
          <div className="text-sm text-muted-foreground">Aprovados</div>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF, nº do pré-cadastro..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Nº Pré-Cadastro</th>
                <th className="text-left p-4 font-medium">Data</th>
                <th className="text-left p-4 font-medium">Cliente</th>
                <th className="text-left p-4 font-medium">Empreendimento</th>
                <th className="text-left p-4 font-medium">Valor</th>
                <th className="text-left p-4 font-medium">Situação</th>
                <th className="text-right p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {preCadastros
                .filter(pc => 
                  pc.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
                  pc.clienteCpf.includes(busca) ||
                  pc.numero.includes(busca)
                )
                .map(preCadastro => (
                  <tr key={preCadastro.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono">{preCadastro.numero}</td>
                    <td className="p-4">{new Date(preCadastro.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="font-medium">{preCadastro.clienteNome}</div>
                      <div className="text-sm text-muted-foreground">{preCadastro.clienteCpf}</div>
                    </td>
                    <td className="p-4">{preCadastro.empreendimentoId}</td>
                    <td className="p-4">
                      R$ {preCadastro.valorAvaliacao.toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4">{getSituacaoBadge(preCadastro.situacao)}</td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/pre-cadastros/${preCadastro.id}`)}
                      >
                        Abrir
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

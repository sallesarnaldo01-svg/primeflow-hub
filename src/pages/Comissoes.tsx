import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { ModernBarChart } from '@/components/charts/ModernBarChart';

const mockCommissions = [
  { id: '1', broker: 'João Silva', deal: 'Apartamento Centro', amount: 15000, status: 'paid', date: '2024-01-15' },
  { id: '2', broker: 'Maria Santos', deal: 'Casa Jardins', amount: 25000, status: 'approved', date: '2024-01-20' },
  { id: '3', broker: 'Pedro Costa', deal: 'Sala Comercial', amount: 8000, status: 'pending', date: '2024-01-25' },
];

const chartData = [
  { name: 'Jan', value: 45000 },
  { name: 'Fev', value: 52000 },
  { name: 'Mar', value: 48000 },
  { name: 'Abr', value: 61000 },
  { name: 'Mai', value: 55000 },
  { name: 'Jun', value: 67000 },
];

export default function Comissoes() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const totalPaid = mockCommissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPending = mockCommissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Comissões</h1>
          <p className="text-muted-foreground">
            Gerencie as comissões dos corretores
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalPaid)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {mockCommissions.filter(c => c.status === 'paid').length} pagamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalPending)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {mockCommissions.filter(c => c.status === 'pending').length} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(mockCommissions.reduce((sum, c) => sum + c.amount, 0))}
              </div>
              <p className="text-xs text-success mt-1">
                +12% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Corretores Ativos</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(mockCommissions.map(c => c.broker)).size}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Com vendas este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Comissões</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ModernBarChart 
              data={chartData} 
              bars={[{ 
                dataKey: 'value', 
                name: 'Comissões',
                color: 'hsl(var(--primary))' 
              }]} 
            />
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Comissões Recentes</CardTitle>
            <CardDescription>Histórico de comissões por corretor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCommissions.map((commission) => (
                <div 
                  key={commission.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{commission.broker}</div>
                    <div className="text-sm text-muted-foreground">{commission.deal}</div>
                  </div>
                  
                  <div className="text-right mr-4">
                    <div className="font-bold text-primary">{formatPrice(commission.amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(commission.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <Badge 
                    variant={
                      commission.status === 'paid' ? 'default' :
                      commission.status === 'approved' ? 'secondary' : 
                      'outline'
                    }
                  >
                    {commission.status === 'paid' ? 'Pago' :
                     commission.status === 'approved' ? 'Aprovado' : 
                     'Pendente'}
                  </Badge>

                  {commission.status === 'pending' && (
                    <div className="ml-2 space-x-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

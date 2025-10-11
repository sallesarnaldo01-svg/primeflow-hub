import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  DollarSign,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  Filter,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Settings
} from "lucide-react";

const faturas = [
  {
    id: "INV-001",
    cliente: "Empresa ABC Ltda",
    valor: 1250.00,
    status: "pago",
    vencimento: "2024-01-15",
    pagamento: "2024-01-14",
    servico: "Plano Professional"
  },
  {
    id: "INV-002", 
    cliente: "Tech Solutions Inc",
    valor: 750.00,
    status: "pendente",
    vencimento: "2024-01-20",
    pagamento: null,
    servico: "Plano Starter"
  },
  {
    id: "INV-003",
    cliente: "Marketing Digital SA",
    valor: 2500.00,
    status: "vencido",
    vencimento: "2024-01-10",
    pagamento: null,
    servico: "Plano Enterprise"
  },
  {
    id: "INV-004",
    cliente: "Startup Inovadora",
    valor: 500.00,
    status: "cancelado",
    vencimento: "2024-01-25",
    pagamento: null,
    servico: "Plano Básico"
  }
];

const propostas = [
  {
    id: "PROP-001",
    cliente: "Consultoria XYZ",
    valor: 3500.00,
    status: "enviada",
    validade: "2024-02-15",
    servicos: ["CRM Completo", "Automação", "Suporte Premium"]
  },
  {
    id: "PROP-002",
    cliente: "E-commerce 123",
    valor: 1800.00,
    status: "aprovada",
    validade: "2024-02-20",
    servicos: ["Integração Loja", "WhatsApp Business"]
  },
  {
    id: "PROP-003", 
    cliente: "Agência Criativa",
    valor: 950.00,
    status: "rejeitada",
    validade: "2024-01-30",
    servicos: ["Plano Professional"]
  }
];

const assinaturas = [
  {
    id: "SUB-001",
    cliente: "Empresa ABC Ltda",
    plano: "Professional",
    valor: 250.00,
    status: "ativa",
    proxCobranca: "2024-02-15",
    tipo: "mensal"
  },
  {
    id: "SUB-002",
    cliente: "Tech Solutions Inc",
    plano: "Starter", 
    valor: 750.00,
    status: "ativa",
    proxCobranca: "2024-07-20",
    tipo: "anual"
  },
  {
    id: "SUB-003",
    cliente: "Marketing Digital SA", 
    plano: "Enterprise",
    valor: 500.00,
    status: "cancelada",
    proxCobranca: null,
    tipo: "mensal"
  }
];

export default function Financeiro() {
  const { toast } = useToast();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [isNovaFaturaOpen, setIsNovaFaturaOpen] = useState(false);

  const statusIcons = {
    pago: <CheckCircle className="h-4 w-4 text-green-500" />,
    pendente: <Clock className="h-4 w-4 text-yellow-500" />,
    vencido: <AlertCircle className="h-4 w-4 text-red-500" />,
    cancelado: <XCircle className="h-4 w-4 text-gray-500" />,
    enviada: <Clock className="h-4 w-4 text-blue-500" />,
    aprovada: <CheckCircle className="h-4 w-4 text-green-500" />,
    rejeitada: <XCircle className="h-4 w-4 text-red-500" />,
    ativa: <CheckCircle className="h-4 w-4 text-green-500" />,
    cancelada: <XCircle className="h-4 w-4 text-red-500" />
  };

  const statusColors = {
    pago: "bg-green-100 text-green-800",
    pendente: "bg-yellow-100 text-yellow-800", 
    vencido: "bg-red-100 text-red-800",
    cancelado: "bg-gray-100 text-gray-800",
    enviada: "bg-blue-100 text-blue-800",
    aprovada: "bg-green-100 text-green-800",
    rejeitada: "bg-red-100 text-red-800",
    ativa: "bg-green-100 text-green-800",
    cancelada: "bg-red-100 text-red-800"
  };

  // Métricas resumo
  const totalRecebido = faturas.filter(f => f.status === "pago").reduce((acc, f) => acc + f.valor, 0);
  const totalPendente = faturas.filter(f => f.status === "pendente").reduce((acc, f) => acc + f.valor, 0);
  const totalVencido = faturas.filter(f => f.status === "vencido").reduce((acc, f) => acc + f.valor, 0);
  const totalPropostas = propostas.reduce((acc, p) => acc + p.valor, 0);

  const handleGerarFatura = () => {
    toast({
      title: "Fatura gerada",
      description: "A fatura foi criada e enviada para o cliente."
    });
    setIsNovaFaturaOpen(false);
  };

  const handleExportarRelatorio = () => {
    toast({
      title: "Relatório exportado",
      description: "O arquivo foi baixado para sua pasta de downloads."
    });
  };

  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Financeiro</h1>
            <p className="text-muted-foreground">
              Gerencie faturas, propostas e assinaturas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportarRelatorio}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isNovaFaturaOpen} onOpenChange={setIsNovaFaturaOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Fatura
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Fatura</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente1">Empresa ABC Ltda</SelectItem>
                        <SelectItem value="cliente2">Tech Solutions Inc</SelectItem>
                        <SelectItem value="cliente3">Marketing Digital SA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input id="valor" type="number" placeholder="0,00" />
                  </div>
                  <div>
                    <Label htmlFor="vencimento">Data de Vencimento</Label>
                    <Input id="vencimento" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição dos Serviços</Label>
                    <Input id="descricao" placeholder="Descreva os serviços..." />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleGerarFatura}>
                      Gerar Fatura
                    </Button>
                    <Button variant="outline" onClick={() => setIsNovaFaturaOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Receber</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {faturas.filter(f => f.status === "pendente").length} faturas pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {faturas.filter(f => f.status === "vencido").length} faturas vencidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Propostas</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {totalPropostas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {propostas.length} propostas ativas
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faturas">
          <TabsList>
            <TabsTrigger value="faturas">Faturas</TabsTrigger>
            <TabsTrigger value="propostas">Propostas</TabsTrigger>
            <TabsTrigger value="assinaturas">Assinaturas</TabsTrigger>
          </TabsList>

          <TabsContent value="faturas" className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente ou número da fatura..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturas.map((fatura) => (
                    <TableRow key={fatura.id}>
                      <TableCell className="font-medium">{fatura.id}</TableCell>
                      <TableCell>{fatura.cliente}</TableCell>
                      <TableCell>R$ {fatura.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[fatura.status]}
                          <Badge className={statusColors[fatura.status]}>
                            {fatura.status.charAt(0).toUpperCase() + fatura.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(fatura.vencimento).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="propostas" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposta</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propostas.map((proposta) => (
                    <TableRow key={proposta.id}>
                      <TableCell className="font-medium">{proposta.id}</TableCell>
                      <TableCell>{proposta.cliente}</TableCell>
                      <TableCell>R$ {proposta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[proposta.status]}
                          <Badge className={statusColors[proposta.status]}>
                            {proposta.status.charAt(0).toUpperCase() + proposta.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(proposta.validade).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="assinaturas" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assinatura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Próxima Cobrança</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assinaturas.map((assinatura) => (
                    <TableRow key={assinatura.id}>
                      <TableCell className="font-medium">{assinatura.id}</TableCell>
                      <TableCell>{assinatura.cliente}</TableCell>
                      <TableCell>{assinatura.plano}</TableCell>
                      <TableCell>
                        R$ {assinatura.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/{assinatura.tipo === "mensal" ? "mês" : "ano"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[assinatura.status]}
                          <Badge className={statusColors[assinatura.status]}>
                            {assinatura.status.charAt(0).toUpperCase() + assinatura.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assinatura.proxCobranca ? new Date(assinatura.proxCobranca).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    
  );
}
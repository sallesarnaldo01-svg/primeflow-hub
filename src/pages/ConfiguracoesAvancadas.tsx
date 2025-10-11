import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Users,
  Shield,
  Database,
  Mail,
  Bell,
  Palette,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key
} from "lucide-react";

const usuarios = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@empresa.com",
    papel: "admin",
    status: "ativo",
    ultimoAcesso: "2024-01-15 14:30"
  },
  {
    id: "2", 
    nome: "Maria Santos",
    email: "maria@empresa.com",
    papel: "vendedor",
    status: "ativo",
    ultimoAcesso: "2024-01-15 12:15"
  },
  {
    id: "3",
    nome: "Pedro Costa",
    email: "pedro@empresa.com", 
    papel: "suporte",
    status: "inativo",
    ultimoAcesso: "2024-01-10 09:45"
  }
];

const logs = [
  {
    id: "1",
    usuario: "João Silva",
    acao: "Login no sistema",
    ip: "192.168.1.100",
    timestamp: "2024-01-15 14:30:25",
    status: "sucesso"
  },
  {
    id: "2",
    usuario: "Maria Santos", 
    acao: "Exportação de dados",
    ip: "192.168.1.105",
    timestamp: "2024-01-15 12:15:10",
    status: "sucesso"
  },
  {
    id: "3",
    usuario: "Sistema",
    acao: "Backup automático",
    ip: "127.0.0.1",
    timestamp: "2024-01-15 03:00:00",
    status: "sucesso"
  },
  {
    id: "4",
    usuario: "Pedro Costa",
    acao: "Tentativa de login",
    ip: "192.168.1.120", 
    timestamp: "2024-01-14 18:45:30",
    status: "falha"
  }
];

export default function ConfiguracoesAvancadas() {
  const { toast } = useToast();
  const [configSistema, setConfigSistema] = useState({
    manutencao: false,
    registroPublico: true,
    autenticacao2FA: false,
    sessaoTimeout: 30,
    backupAutomatico: true,
    logs: true
  });
  const [isNovoUsuarioOpen, setIsNovoUsuarioOpen] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const papeis = [
    { value: "admin", label: "Administrador", desc: "Acesso total ao sistema" },
    { value: "gerente", label: "Gerente", desc: "Gestão de equipes e relatórios" },
    { value: "vendedor", label: "Vendedor", desc: "Gestão de leads e oportunidades" },
    { value: "suporte", label: "Suporte", desc: "Atendimento e tickets" },
    { value: "visualizador", label: "Visualizador", desc: "Apenas leitura" }
  ];

  const statusIcons = {
    ativo: <CheckCircle className="h-4 w-4 text-green-500" />,
    inativo: <Clock className="h-4 w-4 text-yellow-500" />,
    bloqueado: <Lock className="h-4 w-4 text-red-500" />,
    sucesso: <CheckCircle className="h-4 w-4 text-green-500" />,
    falha: <AlertTriangle className="h-4 w-4 text-red-500" />
  };

  const statusColors = {
    ativo: "bg-green-100 text-green-800",
    inativo: "bg-yellow-100 text-yellow-800",
    bloqueado: "bg-red-100 text-red-800",
    sucesso: "bg-green-100 text-green-800",
    falha: "bg-red-100 text-red-800"
  };

  const handleSalvarConfig = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações do sistema foram atualizadas com sucesso."
    });
  };

  const handleCriarUsuario = () => {
    toast({
      title: "Usuário criado",
      description: "O novo usuário foi criado e receberá um email de boas-vindas."
    });
    setIsNovoUsuarioOpen(false);
  };

  const handleBackup = () => {
    toast({
      title: "Backup iniciado",
      description: "O backup foi iniciado e você será notificado quando concluído."
    });
  };

  const handleExportarLogs = () => {
    toast({
      title: "Logs exportados",
      description: "O arquivo de logs foi baixado para sua pasta de downloads."
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Configurações Avançadas</h1>
            <p className="text-muted-foreground">
              Gerencie usuários, segurança e configurações do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackup}>
              <Download className="h-4 w-4 mr-2" />
              Backup Manual
            </Button>
            <Button onClick={handleSalvarConfig}>
              <Settings className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>

        <Tabs defaultValue="usuarios">
          <TabsList className="grid grid-cols-5 w-fit">
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Usuários</h2>
              <Dialog open={isNovoUsuarioOpen} onOpenChange={setIsNovoUsuarioOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" placeholder="Digite o nome" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="usuario@empresa.com" />
                    </div>
                    <div>
                      <Label htmlFor="papel">Papel</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um papel" />
                        </SelectTrigger>
                        <SelectContent>
                          {papeis.map((papel) => (
                            <SelectItem key={papel.value} value={papel.value}>
                              <div>
                                <div className="font-medium">{papel.label}</div>
                                <div className="text-sm text-muted-foreground">{papel.desc}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="senha-temp">Senha Temporária</Label>
                      <div className="relative">
                        <Input 
                          id="senha-temp" 
                          type={senhaVisivel ? "text" : "password"}
                          placeholder="Senha será gerada automaticamente"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-0 h-full"
                          onClick={() => setSenhaVisivel(!senhaVisivel)}
                        >
                          {senhaVisivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCriarUsuario}>
                        Criar Usuário
                      </Button>
                      <Button variant="outline" onClick={() => setIsNovoUsuarioOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {papeis.find(p => p.value === usuario.papel)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[usuario.status]}
                          <Badge className={statusColors[usuario.status]}>
                            {usuario.status.charAt(0).toUpperCase() + usuario.status.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{usuario.ultimoAcesso}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Políticas de Segurança</CardTitle>
                  <CardDescription>Configure as regras de segurança do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Autenticação de Dois Fatores (2FA)</Label>
                      <p className="text-sm text-muted-foreground">
                        Exigir código adicional no login
                      </p>
                    </div>
                    <Switch
                      checked={configSistema.autenticacao2FA}
                      onCheckedChange={(checked) => 
                        setConfigSistema(prev => ({ ...prev, autenticacao2FA: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Timeout de Sessão (minutos)</Label>
                    <Select 
                      value={configSistema.sessaoTimeout.toString()}
                      onValueChange={(value) => 
                        setConfigSistema(prev => ({ ...prev, sessaoTimeout: parseInt(value) }))
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="480">8 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Registro Público</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir criação de contas sem aprovação
                      </p>
                    </div>
                    <Switch
                      checked={configSistema.registroPublico}
                      onCheckedChange={(checked) => 
                        setConfigSistema(prev => ({ ...prev, registroPublico: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Email</CardTitle>
                  <CardDescription>Configure servidor SMTP para envio de emails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp-host">Servidor SMTP</Label>
                      <Input id="smtp-host" placeholder="smtp.gmail.com" />
                    </div>
                    <div>
                      <Label htmlFor="smtp-port">Porta</Label>
                      <Input id="smtp-port" placeholder="587" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp-user">Usuário</Label>
                      <Input id="smtp-user" placeholder="seu-email@empresa.com" />
                    </div>
                    <div>
                      <Label htmlFor="smtp-pass">Senha</Label>
                      <Input id="smtp-pass" type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Testar Conexão</Button>
                    <Button>Salvar Configurações</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                  <CardDescription>Configurações básicas do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Modo Manutenção</Label>
                      <p className="text-sm text-muted-foreground">
                        Bloquear acesso para manutenção
                      </p>
                    </div>
                    <Switch
                      checked={configSistema.manutencao}
                      onCheckedChange={(checked) => 
                        setConfigSistema(prev => ({ ...prev, manutencao: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Logs do Sistema</Label>
                      <p className="text-sm text-muted-foreground">
                        Registrar atividades do sistema
                      </p>
                    </div>
                    <Switch
                      checked={configSistema.logs}
                      onCheckedChange={(checked) => 
                        setConfigSistema(prev => ({ ...prev, logs: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select>
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="America/Sao_Paulo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america/sao_paulo">America/Sao_Paulo (UTC-3)</SelectItem>
                        <SelectItem value="america/new_york">America/New_York (UTC-5)</SelectItem>
                        <SelectItem value="europe/london">Europe/London (UTC+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Idioma do Sistema</Label>
                    <Select>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Português (BR)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-br">Português (BR)</SelectItem>
                        <SelectItem value="en-us">English (US)</SelectItem>
                        <SelectItem value="es-es">Español (ES)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personalização</CardTitle>
                  <CardDescription>Customize a aparência do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input placeholder="Minha Empresa CRM" />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo da Empresa</Label>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input type="color" value="#0EA5E9" className="w-20" />
                      <Input value="#0EA5E9" className="flex-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup e Restauração</CardTitle>
                <CardDescription>Gerencie backups automáticos e manuais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Backup diário às 03:00 (horário do servidor)
                    </p>
                  </div>
                  <Switch
                    checked={configSistema.backupAutomatico}
                    onCheckedChange={(checked) => 
                      setConfigSistema(prev => ({ ...prev, backupAutomatico: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Retenção de Backups</Label>
                  <Select>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="30 dias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="365">1 ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Último backup: 15/01/2024 às 03:00 - Status: Sucesso
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button onClick={handleBackup}>
                    <Download className="h-4 w-4 mr-2" />
                    Backup Manual
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Restaurar Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Logs de Atividade</h2>
              <Button variant="outline" onClick={handleExportarLogs}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Logs
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                      <TableCell>{log.usuario}</TableCell>
                      <TableCell>{log.acao}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[log.status]}
                          <Badge className={statusColors[log.status]}>
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </Badge>
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
    </>
  );
}
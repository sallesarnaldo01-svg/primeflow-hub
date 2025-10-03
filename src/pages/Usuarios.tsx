import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users, 
  Shield, 
  UserPlus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Crown,
  Star,
  Clock,
  Mail,
  Phone
} from 'lucide-react';

// Mock data for users
const mockUsers = [
  {
    id: '1',
    name: 'Carlos Admin',
    email: 'carlos@primezap.com',
    phone: '+55 11 99999-9999',
    role: 'admin',
    department: 'TI',
    status: 'active',
    lastLogin: '2024-01-16T10:30:00',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    permissions: ['all'],
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Maria Silva',
    email: 'maria@primezap.com',
    phone: '+55 11 88888-8888',
    role: 'manager',
    department: 'Vendas',
    status: 'active',
    lastLogin: '2024-01-16T09:15:00',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    permissions: ['crm', 'vendas', 'relatorios'],
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'João Santos',
    email: 'joao@primezap.com',
    phone: '+55 11 77777-7777',
    role: 'agent',
    department: 'Atendimento',
    status: 'active',
    lastLogin: '2024-01-16T08:45:00',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    permissions: ['conversas', 'tickets'],
    createdAt: '2024-01-03',
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@primezap.com',
    phone: '+55 11 66666-6666',
    role: 'agent',
    department: 'Suporte',
    status: 'inactive',
    lastLogin: '2024-01-15T16:20:00',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    permissions: ['tickets', 'base-conhecimento'],
    createdAt: '2024-01-04',
  },
  {
    id: '5',
    name: 'Pedro Lima',
    email: 'pedro@primezap.com',
    phone: '+55 11 55555-5555',
    role: 'viewer',
    department: 'Financeiro',
    status: 'active',
    lastLogin: '2024-01-16T07:30:00',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    permissions: ['relatorios'],
    createdAt: '2024-01-05',
  },
];

const roleColors = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-blue-100 text-blue-700',
  agent: 'bg-green-100 text-green-700',
  viewer: 'bg-gray-100 text-gray-700',
};

const roleIcons = {
  admin: Crown,
  manager: Star,
  agent: Users,
  viewer: Eye,
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

export default function Usuarios() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [editingUser, setEditingUser] = useState<typeof mockUsers[0] | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    agent: users.filter(u => u.role === 'agent').length,
    viewer: users.filter(u => u.role === 'viewer').length,
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Usuários & Times</h1>
            <p className="text-muted-foreground">
              Gerencie usuários, permissões e controle de acesso
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex justify-center">
                    <AvatarUpload
                      fallback="U"
                      onUpload={(file) => {
                        console.log('Avatar uploaded:', file);
                        toast.success('Foto carregada com sucesso!');
                      }}
                      size="lg"
                    />
                  </div>

                  <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" placeholder="Nome do usuário" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="usuario@empresa.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" placeholder="+55 11 99999-9999" />
                    </div>
                    <div>
                      <Label htmlFor="department">Departamento</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="atendimento">Atendimento</SelectItem>
                          <SelectItem value="suporte">Suporte</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="ti">TI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Função</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="agent">Agente</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue="active">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(false)}>
                      Criar Usuário
                    </Button>
                  </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(roleStats).map(([role, count]) => {
            const Icon = roleIcons[role as keyof typeof roleIcons];
            return (
              <Card key={role}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground capitalize">{role}s</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="agent">Agente</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Atendimento">Atendimento</SelectItem>
                  <SelectItem value="Suporte">Suporte</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="TI">TI</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Usuário</th>
                    <th className="text-left p-3">Função</th>
                    <th className="text-left p-3">Departamento</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Último Login</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const RoleIcon = roleIcons[user.role as keyof typeof roleIcons];
                    return (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                            <RoleIcon className="mr-1 h-3 w-3" />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-3">{user.department}</td>
                        <td className="p-3">
                          <Badge className={statusColors[user.status as keyof typeof statusColors]}>
                            {user.status === 'active' ? 'Ativo' : 
                             user.status === 'inactive' ? 'Inativo' : 'Pendente'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatLastLogin(user.lastLogin)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Usuário - {editingUser?.name}</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="permissions">Permissões</TabsTrigger>
                  <TabsTrigger value="activity">Atividade</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">Nome</Label>
                      <Input id="edit-name" defaultValue={editingUser.name} />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input id="edit-email" defaultValue={editingUser.email} />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Telefone</Label>
                      <Input id="edit-phone" defaultValue={editingUser.phone} />
                    </div>
                    <div>
                      <Label htmlFor="edit-department">Departamento</Label>
                      <Select defaultValue={editingUser.department.toLowerCase()}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="atendimento">Atendimento</SelectItem>
                          <SelectItem value="suporte">Suporte</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="ti">TI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-role">Função</Label>
                      <Select defaultValue={editingUser.role}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="agent">Agente</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-status">Status</Label>
                      <Select defaultValue={editingUser.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => setEditingUser(null)}>
                      Salvar Alterações
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="permissions" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Permissões de Acesso</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="perm-dashboard">Dashboard</Label>
                        <Switch id="perm-dashboard" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="perm-conversas">Conversas</Label>
                        <Switch id="perm-conversas" defaultChecked={editingUser.permissions.includes('conversas')} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="perm-crm">CRM</Label>
                        <Switch id="perm-crm" defaultChecked={editingUser.permissions.includes('crm')} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="perm-tickets">Tickets</Label>
                        <Switch id="perm-tickets" defaultChecked={editingUser.permissions.includes('tickets')} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="perm-relatorios">Relatórios</Label>
                        <Switch id="perm-relatorios" defaultChecked={editingUser.permissions.includes('relatorios')} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="perm-configuracoes">Configurações</Label>
                        <Switch id="perm-configuracoes" defaultChecked={editingUser.role === 'admin'} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="activity">
                  <div className="space-y-4">
                    <h4 className="font-medium">Atividade Recente</h4>
                    <div className="space-y-2">
                      <div className="border-l-2 border-primary pl-4">
                        <p className="text-sm">Login realizado</p>
                        <p className="text-xs text-muted-foreground">
                          {formatLastLogin(editingUser.lastLogin)}
                        </p>
                      </div>
                      <div className="border-l-2 border-muted pl-4">
                        <p className="text-sm">Perfil atualizado</p>
                        <p className="text-xs text-muted-foreground">3 dias atrás</p>
                      </div>
                      <div className="border-l-2 border-muted pl-4">
                        <p className="text-sm">Conta criada</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(editingUser.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
}
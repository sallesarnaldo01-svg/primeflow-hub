import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  Phone,
  Mail,
  MapPin,
  Globe,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  FileText,
  MessageSquare,
  Edit,
  Trash2,
  Eye,
  Tag,
  Target,
  Clock
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  cnpj?: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  status: 'active' | 'inactive' | 'prospect' | 'churned';
  website?: string;
  phone?: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contacts: {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    isPrimary: boolean;
  }[];
  deals: {
    id: string;
    title: string;
    value: number;
    stage: string;
    probability: number;
  }[];
  tickets: {
    id: string;
    title: string;
    status: string;
    priority: string;
  }[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  totalRevenue: number;
  notes?: string;
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    cnpj: '12.345.678/0001-90',
    industry: 'Tecnologia',
    size: 'medium',
    status: 'active',
    website: 'https://techcorp.com',
    phone: '+55 11 3333-4444',
    email: 'contato@techcorp.com',
    address: {
      street: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'Brasil'
    },
    contacts: [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@techcorp.com',
        phone: '+55 11 99999-9999',
        position: 'CEO',
        isPrimary: true
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@techcorp.com',
        phone: '+55 11 88888-8888',
        position: 'CTO',
        isPrimary: false
      }
    ],
    deals: [
      {
        id: '1',
        title: 'Implementação ERP',
        value: 250000,
        stage: 'Negociação',
        probability: 75
      },
      {
        id: '2',
        title: 'Consultoria DevOps',
        value: 80000,
        stage: 'Proposta',
        probability: 60
      }
    ],
    tickets: [
      {
        id: '1',
        title: 'Problema no login',
        status: 'open',
        priority: 'high'
      }
    ],
    tags: ['cliente-vip', 'tecnologia', 'enterprise'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10'),
    totalRevenue: 450000,
    notes: 'Cliente estratégico com potencial de crescimento'
  },
  {
    id: '2',
    name: 'StartupX',
    industry: 'Fintech',
    size: 'startup',
    status: 'prospect',
    website: 'https://startupx.com',
    email: 'hello@startupx.com',
    address: {
      street: 'Rua das Flores, 123',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22070-100',
      country: 'Brasil'
    },
    contacts: [
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@startupx.com',
        phone: '+55 21 77777-7777',
        position: 'Founder',
        isPrimary: true
      }
    ],
    deals: [
      {
        id: '3',
        title: 'MVP Development',
        value: 120000,
        stage: 'Qualificação',
        probability: 40
      }
    ],
    tickets: [],
    tags: ['startup', 'fintech', 'prospecto'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
    totalRevenue: 0
  }
];

const Empresas: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    cnpj: '',
    industry: '',
    size: 'small' as Company['size'],
    website: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.cnpj?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    const matchesIndustry = filterIndustry === 'all' || company.industry === filterIndustry;
    const matchesSize = filterSize === 'all' || company.size === filterSize;
    
    return matchesSearch && matchesStatus && matchesIndustry && matchesSize;
  });

  const createCompany = () => {
    if (!newCompany.name || !newCompany.industry) {
      toast.error('Nome e setor são obrigatórios');
      return;
    }

    const company: Company = {
      id: String(companies.length + 1),
      name: newCompany.name,
      cnpj: newCompany.cnpj || undefined,
      industry: newCompany.industry,
      size: newCompany.size,
      status: 'prospect',
      website: newCompany.website || undefined,
      phone: newCompany.phone || undefined,
      email: newCompany.email || undefined,
      address: {
        street: newCompany.street,
        city: newCompany.city,
        state: newCompany.state,
        zipCode: newCompany.zipCode,
        country: 'Brasil'
      },
      contacts: [],
      deals: [],
      tickets: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalRevenue: 0,
      notes: newCompany.notes || undefined
    };

    setCompanies(prev => [company, ...prev]);
    setNewCompany({
      name: '',
      cnpj: '',
      industry: '',
      size: 'small',
      website: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      notes: ''
    });
    setIsCreateModalOpen(false);
    toast.success('Empresa criada com sucesso!');
  };

  const deleteCompany = (companyId: string) => {
    setCompanies(prev => prev.filter(company => company.id !== companyId));
    if (selectedCompany?.id === companyId) {
      setSelectedCompany(null);
    }
    toast.success('Empresa removida com sucesso!');
  };

  const getStatusColor = (status: Company['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'prospect': return 'bg-blue-500';
      case 'churned': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Company['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'prospect': return 'Prospecto';
      case 'churned': return 'Cancelado';
      default: return status;
    }
  };

  const getSizeText = (size: Company['size']) => {
    switch (size) {
      case 'startup': return 'Startup';
      case 'small': return 'Pequena';
      case 'medium': return 'Média';
      case 'large': return 'Grande';
      case 'enterprise': return 'Enterprise';
      default: return size;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Empresas</h1>
            <p className="text-muted-foreground">Gerencie informações das empresas clientes</p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Nova Empresa</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova empresa ao seu cadastro
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Logo Upload */}
                  <div className="flex justify-center">
                    <AvatarUpload
                      fallback={newCompany.name[0] || 'E'}
                      onUpload={(file) => {
                        console.log('Logo uploaded:', file);
                        toast.success('Logo carregado com sucesso!');
                      }}
                      size="lg"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Empresa *</Label>
                    <Input
                      id="name"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={newCompany.cnpj}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Setor *</Label>
                    <Input
                      id="industry"
                      value={newCompany.industry}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="Ex: Tecnologia, Saúde, Educação"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Porte</Label>
                    <Select value={newCompany.size} onValueChange={(value: Company['size']) => setNewCompany(prev => ({ ...prev, size: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="small">Pequena</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCompany.email}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newCompany.phone}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+55 11 3333-4444"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://empresa.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={newCompany.street}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="Rua/Avenida"
                    />
                    <Input
                      value={newCompany.city}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Cidade"
                    />
                    <Input
                      value={newCompany.state}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Estado"
                    />
                    <Input
                      value={newCompany.zipCode}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="CEP"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newCompany.notes}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Informações adicionais sobre a empresa"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createCompany}>
                    Criar Empresa
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +5 este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.filter(c => c.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((companies.filter(c => c.status === 'active').length / companies.length) * 100)}% do total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Prospectos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.filter(c => c.status === 'prospect').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(companies.reduce((acc, c) => acc + c.totalRevenue, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Todas as empresas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Empresas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Empresas</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar empresas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="prospect">Prospecto</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="churned">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSize} onValueChange={setFilterSize}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Porte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="small">Pequena</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCompanies.map((company) => (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedCompany?.id === company.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedCompany(company)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getStatusColor(company.status)} text-white`}>
                              {getStatusText(company.status)}
                            </Badge>
                            <Badge variant="outline">{getSizeText(company.size)}</Badge>
                            {company.totalRevenue > 0 && (
                              <Badge variant="secondary">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {formatCurrency(company.totalRevenue)}
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-medium mb-1">{company.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{company.industry}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {company.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {company.email}
                              </span>
                            )}
                            {company.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {company.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {company.contacts.length} contatos
                            </span>
                          </div>
                          
                          {company.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {company.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {company.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{company.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedCompany(company); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); /* TODO: Edit */ }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteCompany(company.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredCompanies.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma empresa encontrada</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterStatus !== 'all' || filterSize !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'Adicione sua primeira empresa usando o botão acima'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalhes da Empresa */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>
                  {selectedCompany ? selectedCompany.name : 'Selecione uma Empresa'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCompany ? (
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Info</TabsTrigger>
                      <TabsTrigger value="contacts">Contatos</TabsTrigger>
                      <TabsTrigger value="activity">Atividade</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Badge className={`${getStatusColor(selectedCompany.status)} text-white`}>
                            {getStatusText(selectedCompany.status)}
                          </Badge>
                          <Badge variant="outline">{getSizeText(selectedCompany.size)}</Badge>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Setor</Label>
                          <p className="text-sm text-muted-foreground">{selectedCompany.industry}</p>
                        </div>
                        
                        {selectedCompany.cnpj && (
                          <div>
                            <Label className="text-sm font-medium">CNPJ</Label>
                            <p className="text-sm text-muted-foreground">{selectedCompany.cnpj}</p>
                          </div>
                        )}
                        
                        {selectedCompany.email && (
                          <div>
                            <Label className="text-sm font-medium">E-mail</Label>
                            <p className="text-sm text-muted-foreground">{selectedCompany.email}</p>
                          </div>
                        )}
                        
                        {selectedCompany.phone && (
                          <div>
                            <Label className="text-sm font-medium">Telefone</Label>
                            <p className="text-sm text-muted-foreground">{selectedCompany.phone}</p>
                          </div>
                        )}
                        
                        {selectedCompany.website && (
                          <div>
                            <Label className="text-sm font-medium">Website</Label>
                            <a 
                              href={selectedCompany.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              {selectedCompany.website}
                            </a>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-sm font-medium">Endereço</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedCompany.address.street}<br />
                            {selectedCompany.address.city}, {selectedCompany.address.state}<br />
                            {selectedCompany.address.zipCode}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Receita Total</Label>
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(selectedCompany.totalRevenue)}
                          </p>
                        </div>
                        
                        {selectedCompany.notes && (
                          <div>
                            <Label className="text-sm font-medium">Observações</Label>
                            <p className="text-sm text-muted-foreground">{selectedCompany.notes}</p>
                          </div>
                        )}
                        
                        {selectedCompany.tags.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Tags</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedCompany.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="contacts" className="space-y-4">
                      <div className="space-y-3">
                        {selectedCompany.contacts.map((contact) => (
                          <div key={contact.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{contact.name}</h4>
                              {contact.isPrimary && (
                                <Badge variant="secondary" className="text-xs">Principal</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{contact.position}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                              <p>{contact.email}</p>
                              <p>{contact.phone}</p>
                            </div>
                          </div>
                        ))}
                        
                        {selectedCompany.contacts.length === 0 && (
                          <div className="text-center py-6">
                            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nenhum contato cadastrado</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="activity" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Deals ({selectedCompany.deals.length})</h4>
                          <div className="space-y-2">
                            {selectedCompany.deals.map((deal) => (
                              <div key={deal.id} className="p-2 border rounded text-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{deal.title}</p>
                                    <p className="text-muted-foreground">{deal.stage}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{formatCurrency(deal.value)}</p>
                                    <p className="text-xs text-muted-foreground">{deal.probability}%</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Tickets ({selectedCompany.tickets.length})</h4>
                          <div className="space-y-2">
                            {selectedCompany.tickets.map((ticket) => (
                              <div key={ticket.id} className="p-2 border rounded text-sm">
                                <p className="font-medium">{ticket.title}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{ticket.status}</Badge>
                                  <Badge variant="outline" className="text-xs">{ticket.priority}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {selectedCompany.deals.length === 0 && selectedCompany.tickets.length === 0 && (
                          <div className="text-center py-6">
                            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma empresa para ver os detalhes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Empresas;
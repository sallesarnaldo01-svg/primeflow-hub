import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Hash,
  Palette,
  Edit,
  Trash2,
  Users,
  MessageSquare,
  Building2,
  Ticket,
  TrendingUp,
  BarChart3,
  Eye,
  Archive,
  Settings,
  Copy,
  Download
} from 'lucide-react';

interface TagData {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: 'general' | 'customer' | 'product' | 'support' | 'sales' | 'marketing';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: {
    contacts: number;
    companies: number;
    deals: number;
    tickets: number;
    conversations: number;
  };
  createdBy: string;
}

const mockTags: TagData[] = [
  {
    id: '1',
    name: 'VIP',
    color: '#FFD700',
    description: 'Clientes premium com alta prioridade',
    category: 'customer',
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10'),
    usageCount: {
      contacts: 15,
      companies: 8,
      deals: 25,
      tickets: 12,
      conversations: 45
    },
    createdBy: 'Admin'
  },
  {
    id: '2',
    name: 'Urgente',
    color: '#FF4444',
    description: 'Itens que precisam de atenção imediata',
    category: 'support',
    isActive: true,
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2024-01-08'),
    usageCount: {
      contacts: 5,
      companies: 2,
      deals: 8,
      tickets: 35,
      conversations: 22
    },
    createdBy: 'Support Team'
  },
  {
    id: '3',
    name: 'Enterprise',
    color: '#4A90E2',
    description: 'Empresas de grande porte',
    category: 'sales',
    isActive: true,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2024-01-05'),
    usageCount: {
      contacts: 12,
      companies: 20,
      deals: 18,
      tickets: 8,
      conversations: 30
    },
    createdBy: 'Sales Team'
  },
  {
    id: '4',
    name: 'Bug',
    color: '#FF6B6B',
    description: 'Problemas técnicos reportados',
    category: 'support',
    isActive: true,
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2024-01-12'),
    usageCount: {
      contacts: 0,
      companies: 0,
      deals: 0,
      tickets: 28,
      conversations: 15
    },
    createdBy: 'Dev Team'
  },
  {
    id: '5',
    name: 'Hot Lead',
    color: '#FF8C00',
    description: 'Leads com alta probabilidade de conversão',
    category: 'marketing',
    isActive: true,
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2024-01-01'),
    usageCount: {
      contacts: 32,
      companies: 15,
      deals: 40,
      tickets: 2,
      conversations: 28
    },
    createdBy: 'Marketing Team'
  },
  {
    id: '6',
    name: 'Descontinuado',
    color: '#999999',
    description: 'Produtos ou serviços não mais oferecidos',
    category: 'product',
    isActive: false,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-12-20'),
    usageCount: {
      contacts: 0,
      companies: 0,
      deals: 5,
      tickets: 3,
      conversations: 1
    },
    createdBy: 'Product Team'
  }
];

const colorOptions = [
  { name: 'Azul', value: '#4A90E2' },
  { name: 'Verde', value: '#50C878' },
  { name: 'Vermelho', value: '#FF4444' },
  { name: 'Laranja', value: '#FF8C00' },
  { name: 'Roxo', value: '#9B59B6' },
  { name: 'Rosa', value: '#FF69B4' },
  { name: 'Dourado', value: '#FFD700' },
  { name: 'Turquesa', value: '#40E0D0' },
  { name: 'Cinza', value: '#95A5A6' },
  { name: 'Marrom', value: '#8B4513' }
];

const Tags: React.FC = () => {
  const [tags, setTags] = useState<TagData[]>(mockTags);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTag, setNewTag] = useState({
    name: '',
    color: '#4A90E2',
    description: '',
    category: 'general' as TagData['category']
  });

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || tag.category === filterCategory;
    const matchesActive = filterActive === 'all' || 
                         (filterActive === 'active' && tag.isActive) ||
                         (filterActive === 'inactive' && !tag.isActive);
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  const createTag = () => {
    if (!newTag.name) {
      toast.error('Nome da tag é obrigatório');
      return;
    }

    if (tags.some(tag => tag.name.toLowerCase() === newTag.name.toLowerCase())) {
      toast.error('Já existe uma tag com este nome');
      return;
    }

    const tag: TagData = {
      id: String(tags.length + 1),
      name: newTag.name,
      color: newTag.color,
      description: newTag.description || undefined,
      category: newTag.category,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: {
        contacts: 0,
        companies: 0,
        deals: 0,
        tickets: 0,
        conversations: 0
      },
      createdBy: 'Current User'
    };

    setTags(prev => [tag, ...prev]);
    setNewTag({
      name: '',
      color: '#4A90E2',
      description: '',
      category: 'general'
    });
    setIsCreateModalOpen(false);
    toast.success('Tag criada com sucesso!');
  };

  const updateTag = (tagId: string, updates: Partial<TagData>) => {
    setTags(prev => prev.map(tag => 
      tag.id === tagId 
        ? { ...tag, ...updates, updatedAt: new Date() }
        : tag
    ));
    toast.success('Tag atualizada com sucesso!');
  };

  const deleteTag = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;

    const totalUsage = Object.values(tag.usageCount).reduce((acc, count) => acc + count, 0);
    
    if (totalUsage > 0) {
      toast.error('Não é possível excluir uma tag que está sendo usada. Desative-a primeiro.');
      return;
    }

    setTags(prev => prev.filter(tag => tag.id !== tagId));
    if (selectedTag?.id === tagId) {
      setSelectedTag(null);
    }
    toast.success('Tag excluída com sucesso!');
  };

  const duplicateTag = (tag: TagData) => {
    const duplicatedTag: TagData = {
      ...tag,
      id: String(tags.length + 1),
      name: `${tag.name} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: {
        contacts: 0,
        companies: 0,
        deals: 0,
        tickets: 0,
        conversations: 0
      }
    };

    setTags(prev => [duplicatedTag, ...prev]);
    toast.success('Tag duplicada com sucesso!');
  };

  const getCategoryText = (category: TagData['category']) => {
    switch (category) {
      case 'general': return 'Geral';
      case 'customer': return 'Cliente';
      case 'product': return 'Produto';
      case 'support': return 'Suporte';
      case 'sales': return 'Vendas';
      case 'marketing': return 'Marketing';
      default: return category;
    }
  };

  const getCategoryColor = (category: TagData['category']) => {
    switch (category) {
      case 'general': return 'bg-gray-500';
      case 'customer': return 'bg-blue-500';
      case 'product': return 'bg-green-500';
      case 'support': return 'bg-red-500';
      case 'sales': return 'bg-purple-500';
      case 'marketing': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTotalUsage = (tag: TagData) => {
    return Object.values(tag.usageCount).reduce((acc, count) => acc + count, 0);
  };

  const exportTags = () => {
    const csvContent = [
      ['Nome', 'Categoria', 'Cor', 'Descrição', 'Status', 'Uso Total', 'Criado em'].join(','),
      ...filteredTags.map(tag => [
        tag.name,
        getCategoryText(tag.category),
        tag.color,
        tag.description || '',
        tag.isActive ? 'Ativo' : 'Inativo',
        getTotalUsage(tag),
        tag.createdAt.toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tags.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Tags exportadas com sucesso!');
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tags e Etiquetas</h1>
            <p className="text-muted-foreground">Organize e categorize seus dados com tags personalizadas</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportTags}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Tag</DialogTitle>
                  <DialogDescription>
                    Crie uma nova tag para organizar seus dados
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Tag *</Label>
                    <Input
                      id="name"
                      value={newTag.name}
                      onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome da tag"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={newTag.category} onValueChange={(value: TagData['category']) => setNewTag(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Geral</SelectItem>
                          <SelectItem value="customer">Cliente</SelectItem>
                          <SelectItem value="product">Produto</SelectItem>
                          <SelectItem value="support">Suporte</SelectItem>
                          <SelectItem value="sales">Vendas</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <Select value={newTag.color} onValueChange={(value) => setNewTag(prev => ({ ...prev, color: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newTag.description}
                      onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o propósito desta tag"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: newTag.color }}
                    />
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: newTag.color + '20', color: newTag.color }}
                    >
                      {newTag.name || 'Nome da Tag'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Preview</span>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createTag}>
                      Criar Tag
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tags</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tags.length}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +3 este mês
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tags Ativas</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tags.filter(t => t.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((tags.filter(t => t.isActive).length / tags.length) * 100)}% do total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mais Usada</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tags.length > 0 ? 
                  tags.reduce((prev, current) => 
                    getTotalUsage(prev) > getTotalUsage(current) ? prev : current
                  ).name : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {tags.length > 0 ? 
                  `${getTotalUsage(tags.reduce((prev, current) => 
                    getTotalUsage(prev) > getTotalUsage(current) ? prev : current
                  ))} usos` : 'Nenhuma tag'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uso Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tags.reduce((acc, tag) => acc + getTotalUsage(tag), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Todas as aplicações
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Tags */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Tags</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Pesquisar tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="customer">Cliente</SelectItem>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="support">Suporte</SelectItem>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterActive} onValueChange={setFilterActive}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="active">Ativas</SelectItem>
                      <SelectItem value="inactive">Inativas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTags.map((tag) => (
                    <motion.div
                      key={tag.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedTag?.id === tag.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: tag.color }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{tag.name}</h3>
                              <Badge className={`${getCategoryColor(tag.category)} text-white text-xs`}>
                                {getCategoryText(tag.category)}
                              </Badge>
                              {!tag.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Inativa
                                </Badge>
                              )}
                            </div>
                            
                            {tag.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                {tag.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Uso total: {getTotalUsage(tag)}</span>
                              <span>Criada em: {tag.createdAt.toLocaleDateString('pt-BR')}</span>
                              <span>Por: {tag.createdBy}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedTag(tag); 
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              duplicateTag(tag); 
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              updateTag(tag.id, { isActive: !tag.isActive }); 
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              deleteTag(tag.id); 
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredTags.length === 0 && (
                  <div className="text-center py-12">
                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma tag encontrada</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterCategory !== 'all' || filterActive !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'Crie sua primeira tag usando o botão acima'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalhes da Tag */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>
                  {selectedTag ? 'Detalhes da Tag' : 'Selecione uma Tag'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTag ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-full mx-auto mb-3" 
                        style={{ backgroundColor: selectedTag.color }}
                      />
                      <h3 className="text-lg font-medium">{selectedTag.name}</h3>
                      <div className="flex justify-center gap-2 mt-2">
                        <Badge className={`${getCategoryColor(selectedTag.category)} text-white`}>
                          {getCategoryText(selectedTag.category)}
                        </Badge>
                        {!selectedTag.isActive && (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </div>
                    </div>

                    {selectedTag.description && (
                      <div>
                        <Label className="text-sm font-medium">Descrição</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedTag.description}
                        </p>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">Uso por Módulo</Label>
                      <div className="space-y-3 mt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Contatos</span>
                          </div>
                          <Badge variant="secondary">{selectedTag.usageCount.contacts}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Empresas</span>
                          </div>
                          <Badge variant="secondary">{selectedTag.usageCount.companies}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Deals</span>
                          </div>
                          <Badge variant="secondary">{selectedTag.usageCount.deals}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Tickets</span>
                          </div>
                          <Badge variant="secondary">{selectedTag.usageCount.tickets}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Conversas</span>
                          </div>
                          <Badge variant="secondary">{selectedTag.usageCount.conversations}</Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-sm">Total</span>
                          <Badge>{getTotalUsage(selectedTag)}</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Criada por</Label>
                        <p className="text-sm text-muted-foreground">{selectedTag.createdBy}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Criada em</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTag.createdAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Última atualização</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedTag.updatedAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={selectedTag.isActive ? "destructive" : "default"}
                        onClick={() => updateTag(selectedTag.id, { isActive: !selectedTag.isActive })}
                        className="flex-1"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        {selectedTag.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateTag(selectedTag)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione uma tag para ver os detalhes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tags;
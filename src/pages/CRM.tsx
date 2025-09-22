import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  DollarSign, 
  Calendar, 
  User, 
  Phone,
  Mail,
  Building
} from 'lucide-react';

// Mock data for deals
const mockDeals = [
  {
    id: '1',
    company: 'TechCorp Solutions',
    contact: 'Carlos Silva',
    value: 25000,
    stage: 'Proposta',
    probability: 75,
    owner: 'Maria Silva',
    lastContact: '2024-01-15',
    tags: ['Enterprise', 'Hot'],
  },
  {
    id: '2',
    company: 'StartupXYZ',
    contact: 'Ana Santos',
    value: 12500,
    stage: 'Negociação',
    probability: 60,
    owner: 'João Santos',
    lastContact: '2024-01-14',
    tags: ['Startup', 'SaaS'],
  },
  {
    id: '3',
    company: 'Empresa ABC',
    contact: 'Pedro Costa',
    value: 8300,
    stage: 'Qualificação',
    probability: 40,
    owner: 'Ana Costa',
    lastContact: '2024-01-13',
    tags: ['SMB'],
  },
];

const stages = [
  { id: 'leads', name: 'Leads', color: 'bg-gray-100' },
  { id: 'qualificacao', name: 'Qualificação', color: 'bg-blue-100' },
  { id: 'proposta', name: 'Proposta', color: 'bg-yellow-100' },
  { id: 'negociacao', name: 'Negociação', color: 'bg-orange-100' },
  { id: 'fechado', name: 'Fechado', color: 'bg-green-100' },
];

export default function CRM() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('all');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM / Kanban</h1>
          <p className="text-muted-foreground">
            Gerencie seu pipeline de vendas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Deal
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar deals, empresas, contatos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="maria">Maria Silva</SelectItem>
                <SelectItem value="joao">João Santos</SelectItem>
                <SelectItem value="ana">Ana Costa</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-x-auto">
        {stages.map((stage) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="min-w-[300px] lg:min-w-0"
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${stage.color} mr-2`} />
                    {stage.name}
                  </span>
                  <Badge variant="secondary">
                    {stage.id === 'proposta' ? mockDeals.length : 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stage.id === 'proposta' && mockDeals.map((deal) => (
                  <motion.div
                    key={deal.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 bg-card border rounded-lg cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      {/* Company and Value */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm line-clamp-1">
                            {deal.company}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {deal.contact}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary text-sm">
                            R$ {deal.value.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {deal.probability}%
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {deal.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Owner and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {deal.owner.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {deal.owner}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Last Contact */}
                      <div className="text-xs text-muted-foreground border-t pt-2">
                        Último contato: {new Date(deal.lastContact).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add Deal Button */}
                <Button 
                  variant="ghost" 
                  className="w-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Deal
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">R$ 45.8K</p>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Deals Ativos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">58%</p>
              <p className="text-sm text-muted-foreground">Taxa Média</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">12 dias</p>
              <p className="text-sm text-muted-foreground">Ciclo Médio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
export const mockData = {
  deals: [
    {
      id: '1',
      title: 'Implementação Sistema CRM',
      value: 25000,
      currency: 'BRL',
      probability: 80,
      stage: 'proposta',
      expectedCloseDate: '2024-02-15',
      contactId: '1',
      ownerId: '1',
      source: 'website',
      tags: ['Enterprise', 'CRM'],
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
    },
    {
      id: '2', 
      title: 'Consultoria Digital',
      value: 15000,
      currency: 'BRL',
      probability: 60,
      stage: 'qualificacao',
      expectedCloseDate: '2024-02-28',
      contactId: '2',
      ownerId: '1',
      source: 'linkedin',
      tags: ['Consultoria'],
      createdAt: '2024-01-12T09:00:00Z',
      updatedAt: '2024-01-16T11:00:00Z',
    }
  ],

  stages: [
    { id: 'prospecto', name: 'Prospecto', order: 1, color: '#6B7280', probability: 10 },
    { id: 'qualificacao', name: 'Qualificação', order: 2, color: '#3B82F6', probability: 25 },
    { id: 'proposta', name: 'Proposta', order: 3, color: '#F59E0B', probability: 60 },
    { id: 'fechamento', name: 'Fechamento', order: 4, color: '#10B981', probability: 90 },
  ],

  events: [
    {
      id: '1',
      title: 'Reunião de Apresentação',
      description: 'Apresentar proposta para cliente',
      start: '2024-01-20T10:00:00',
      end: '2024-01-20T11:00:00',
      contactId: '1',
      status: 'scheduled',
      createdBy: '1',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    }
  ],

  conversations: [
    {
      id: '1',
      contactId: '1',
      channel: 'whatsapp' as const,
      status: 'open' as const,
      assignedTo: '1',
      lastMessageAt: '2024-01-20T14:30:00Z',
      unreadCount: 2,
      tags: ['Suporte'],
      priority: 'medium' as const,
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    }
  ],

  messages: [
    {
      id: '1',
      conversationId: '1',
      content: 'Olá! Preciso de ajuda com o sistema.',
      type: 'text' as const,
      direction: 'inbound' as const,
      status: 'read' as const,
      createdAt: '2024-01-20T14:30:00Z',
    }
  ],

  tags: [
    { id: '1', name: 'Cliente VIP', color: '#10B981', description: 'Clientes prioritários', category: 'Cliente', isGlobal: true, workspaceId: '1', usageCount: 15, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z', createdBy: '1' },
    { id: '2', name: 'Suporte', color: '#F59E0B', description: 'Tickets de suporte', category: 'Atendimento', isGlobal: true, workspaceId: '1', usageCount: 32, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z', createdBy: '1' },
  ],

  companies: [
    { id: '1', name: 'Empresa ABC Ltda', cnpj: '12.345.678/0001-90', email: 'contato@empresaabc.com', phone: '+55 11 9999-9999', industry: 'Tecnologia', size: 'medium' as const, status: 'active' as const, tags: ['Cliente'], createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-15T14:00:00Z' }
  ],

  tickets: [
    { id: '1', title: 'Problema no login', description: 'Usuário não consegue fazer login', status: 'open' as const, priority: 'high' as const, category: 'Técnico', assignedTo: '1', contactId: '1', source: 'chat' as const, tags: ['Login'], createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-20T10:00:00Z' }
  ]
};
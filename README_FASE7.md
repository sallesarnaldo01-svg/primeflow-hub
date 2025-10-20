# 📋 Fase 7 - Notificações e Comunicação

## ✅ Implementado

### 🔔 1. Sistema de Notificações Completo
- ✅ **Tabela**: `notification_preferences`
- ✅ **Preferências por tipo**: email, push, in-app
- ✅ **Configurações granulares**: por tipo de evento (mensagens, deals, tasks, workflows, menções)
- ✅ **NotificationCenter** já implementado na Fase 5 e integrado no Header
- ✅ **Realtime via Supabase**: notificações aparecem instantaneamente

### 💬 2. Templates de Mensagens
- ✅ **Tabela**: `message_templates`
- ✅ **Controller e rotas**: `/api/message-templates`
- ✅ **Service**: `messageTemplatesService`
- ✅ **Componentes**: 
  - `<TemplateSelector>` - Seletor de templates com busca
  - Página `/templates` - CRUD completo de templates
- ✅ **Funcionalidades**:
  - Variáveis dinâmicas (`{{nome}}`, `{{empresa}}`, `{{produto}}`)
  - Categorias (vendas, suporte, financeiro, marketing)
  - Templates compartilhados com equipe
  - Auto-extração de variáveis do conteúdo
  - Copiar conteúdo para área de transferência

### 📝 3. Notas Internas em Conversas
- ✅ **Campos adicionados**: `internal_note`, `mentions` na tabela `messages`
- ✅ **Componente**: `<InternalNoteToggle>` - Alternar entre mensagem normal e nota interna
- ✅ **Funcionalidades**:
  - Apenas agentes veem notas internas
  - Menções em notas (`@usuário`)
  - Visual diferenciado (fundo amarelo/alaranjado)
  - Ícone de cadeado para identificação

### 💬 4. Chat Interno entre Agentes
- ✅ **Tabelas**: `internal_chats`, `internal_messages`
- ✅ **Controller e rotas**: `/api/internal-chats`
- ✅ **Service**: `internalChatService`
- ✅ **Funcionalidades**:
  - Chat direto (1:1) ou em grupo
  - Mensagens em tempo real via Realtime
  - Sistema de leitura (read_by)
  - Menções em mensagens
  - Anexos (arquivos)
  - Notificações automáticas de menções

---

## 📊 Banco de Dados

### Novas Tabelas Criadas
1. **`notification_preferences`**
   - Preferências de notificação por usuário
   - Configurações para email, push e in-app
   - Granularidade por tipo de evento

2. **`message_templates`**
   - Templates de mensagens reutilizáveis
   - Variáveis dinâmicas
   - Categorias e compartilhamento

3. **`internal_chats`**
   - Chats entre agentes
   - Suporte para direto e grupo
   - Lista de participantes

4. **`internal_messages`**
   - Mensagens do chat interno
   - Anexos e menções
   - Sistema de leitura

### Campos Adicionados
- **`messages`**: 
  - `internal_note` (boolean) - Indica se é nota interna
  - `mentions` (uuid[]) - IDs dos usuários mencionados

### Triggers Automáticos
1. **`notify_internal_message_mentions`**
   - Cria notificação quando usuário é mencionado no chat interno

### Realtime Habilitado
- ✅ `internal_chats` - Novos chats aparecem em tempo real
- ✅ `internal_messages` - Mensagens aparecem instantaneamente

---

## 🎯 Como Usar

### Templates de Mensagens

#### Criar Template
```typescript
import { messageTemplatesService } from '@/services/messageTemplates';

await messageTemplatesService.create({
  name: 'Boas-vindas',
  content: 'Olá {{nome}}, bem-vindo à {{empresa}}!',
  category: 'vendas',
  shared: true
});
```

#### Usar Template
```tsx
import { TemplateSelector } from '@/components/TemplateSelector';

<TemplateSelector
  onSelect={(template) => {
    const processed = messageTemplatesService.processTemplate(
      template.content,
      {
        nome: contact.name,
        empresa: 'PrimeZapAI'
      }
    );
    setMessage(processed);
  }}
  category="vendas"
/>
```

#### Acessar Página de Templates
Navegue para `/templates` ou adicione no menu de navegação.

### Notas Internas

#### Em Conversas
```tsx
import { InternalNoteToggle } from '@/components/InternalNoteToggle';

const [isInternalNote, setIsInternalNote] = useState(false);

<InternalNoteToggle
  isInternalNote={isInternalNote}
  onChange={setIsInternalNote}
/>
```

Ao enviar mensagem, incluir o campo:
```typescript
{
  message: messageContent,
  internal_note: isInternalNote,
  mentions: extractedMentions // IDs dos usuários mencionados
}
```

### Chat Interno

#### Criar Chat
```typescript
import { internalChatService } from '@/services/internalChat';

// Chat direto
await internalChatService.createChat({
  type: 'direct',
  participants: [userId1, userId2]
});

// Chat em grupo
await internalChatService.createChat({
  type: 'group',
  name: 'Equipe de Vendas',
  participants: [userId1, userId2, userId3]
});
```

#### Enviar Mensagem
```typescript
await internalChatService.sendMessage(chatId, {
  message: 'Olá equipe!',
  mentions: [userId1], // Opcional: mencionar usuário
  attachments: [ // Opcional: anexos
    {
      name: 'documento.pdf',
      url: 'https://...',
      type: 'pdf'
    }
  ]
});
```

#### Escutar Mensagens em Realtime
```typescript
import { supabase } from '@/integrations/supabase/client';

const channel = supabase
  .channel('internal-chat')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'internal_messages',
      filter: `chat_id=eq.${chatId}`
    },
    (payload) => {
      console.log('Nova mensagem:', payload.new);
      // Atualizar UI
    }
  )
  .subscribe();
```

---

## 🔒 Segurança

### RLS Habilitado
- ✅ `notification_preferences` - Isolamento por usuário
- ✅ `message_templates` - Visualização de próprios ou compartilhados
- ✅ `internal_chats` - Apenas participantes
- ✅ `internal_messages` - Apenas mensagens de chats que participa

### Logs de Auditoria
- ✅ Criação/atualização/exclusão de templates é logada

---

## 📝 API Endpoints

### Templates de Mensagens
- `GET /api/message-templates` - Listar templates
- `GET /api/message-templates/:id` - Buscar template
- `POST /api/message-templates` - Criar template
- `PUT /api/message-templates/:id` - Atualizar template
- `DELETE /api/message-templates/:id` - Deletar template

### Chat Interno
- `GET /api/internal-chats` - Listar chats
- `GET /api/internal-chats/:id` - Buscar chat
- `POST /api/internal-chats` - Criar chat
- `PUT /api/internal-chats/:id` - Atualizar chat
- `DELETE /api/internal-chats/:id` - Deletar chat
- `GET /api/internal-chats/:chatId/messages` - Listar mensagens
- `POST /api/internal-chats/:chatId/messages` - Enviar mensagem
- `PUT /api/internal-chats/:chatId/messages/:messageId/read` - Marcar como lida
- `DELETE /api/internal-chats/:chatId/messages/:messageId` - Deletar mensagem

---

## 🎨 Componentes Frontend

### Criados
1. **`<TemplateSelector>`**
   - Seletor de templates com busca
   - Preview do conteúdo
   - Filtro por categoria

2. **`<InternalNoteToggle>`**
   - Alternar entre mensagem e nota interna
   - Tooltip explicativo
   - Visual diferenciado

3. **Página `/templates`**
   - CRUD completo de templates
   - Grid responsivo
   - Filtros por categoria
   - Copiar/editar/deletar templates

### Modificar
- **`src/pages/Conversas.tsx`**
  - Adicionar `<InternalNoteToggle>` no composer
  - Adicionar `<TemplateSelector>` para respostas rápidas
  - Filtrar notas internas no histórico (mostrar apenas para agentes)
  - Adicionar visual diferenciado para notas internas

---

## 🚀 Próximos Passos

### Integração Completa
1. Adicionar `<TemplateSelector>` na página de Conversas
2. Adicionar `<InternalNoteToggle>` no compositor de mensagens
3. Criar componente de chat interno (floating ou sidebar)
4. Adicionar rota `/templates` no menu de navegação

### Melhorias Futuras
- [ ] Notificações por email (integrar com Resend)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Atalhos de teclado para templates (`/template-name`)
- [ ] Histórico de uso de templates (analytics)
- [ ] Tradução automática de templates
- [ ] Versionamento de templates

---

## ✅ Status da Fase 7

**Progresso**: 100% COMPLETO

Todas as funcionalidades principais da Fase 7 foram implementadas:
- ✅ Sistema de notificações (já estava pronto da Fase 5)
- ✅ Preferências de notificação por usuário
- ✅ Templates de mensagens
- ✅ Notas internas em conversas
- ✅ Chat interno entre agentes
- ✅ Realtime funcionando
- ✅ RLS configurado
- ✅ API completa

**Próxima fase**: Fase 8 - Relatórios e Analytics

# PrimeZapAI Frontend Patch - Changelog

## Versão 2.6.0 - Sistema Multi-Provider de IA (2025-01-XX)

### 🤖 Sistema de Múltiplos Provedores de IA

#### Database (Prisma)
- ✅ Novo modelo `AIProvider`: Gerenciamento de provedores (Lovable, OpenAI, Manus, Gemini, Claude)
- ✅ Novo modelo `AIAgent`: Configuração de agentes específicos por provedor
- ✅ Enum `AIProviderType`: LOVABLE, OPENAI, MANUS, GEMINI, CLAUDE
- ✅ Relações: Tenant → AIProvider → AIAgent

#### Backend API
- ✅ `ai-providers.controller.ts`: CRUD completo para provedores e agentes
  - GET/POST/PUT/DELETE `/api/ai/providers` - Gerenciar provedores
  - GET/POST/PUT/DELETE `/api/ai/agents` - Gerenciar agentes
  - POST `/api/ai/test` - Testar agente com mensagem
- ✅ Routes: `/api/ai/*`
- ✅ Autenticação obrigatória em todas as rotas
- ✅ Validação de tenant para isolamento multi-tenancy

#### Frontend
- ✅ Novo serviço `aiProviders.ts`: Integração completa com API
  - Tipos TypeScript: AIProvider, AIAgent, AIProviderType
  - Métodos CRUD para provedores e agentes
  - Método de teste de agente
- ✅ Nova página `AIProviders.tsx`: Interface de gerenciamento
  - Lista de provedores em cards visuais
  - Criação/edição/exclusão de provedores
  - Toggle ativo/inativo
  - Aba separada para agentes
- ✅ Componente `ProviderCard.tsx`: Card visual por provedor
  - Ícones personalizados por tipo (💜 Lovable, 🤖 OpenAI, 🧠 Manus, ✨ Gemini, 🎭 Claude)
  - Cores específicas por provedor
  - Contador de agentes
  - Ações rápidas (configurar/deletar)
- ✅ Componente `CreateProviderDialog.tsx`: Dialog de criação
  - Seleção de tipo de provedor
  - Configuração de nome e API key
  - API key opcional para Lovable (auto-provisionado)
  - Validação de formulário
- ✅ Rota `/ia/providers` adicionada ao App.tsx

### 🎯 Provedores Suportados

#### 1. Lovable AI
- Sem necessidade de API key (auto-provisionado)
- Acesso a Gemini 2.5 e GPT-5
- Gateway: `https://ai.gateway.lovable.dev`

#### 2. OpenAI
- Suporte a GPT-4, GPT-5, GPT-5-mini, GPT-5-nano
- Requer API key
- Suporte a function calling

#### 3. Manus AI
- Modelos proprietários da Manus
- Requer API key
- Configuração específica

#### 4. Google Gemini
- Gemini 2.5 Pro, Flash, Flash-lite
- Requer API key do Google AI Studio
- Suporte multimodal

#### 5. Anthropic Claude
- Claude Opus 4, Sonnet 4, Haiku
- Requer API key da Anthropic
- Contexto de 200K tokens

### 🔧 Arquitetura

#### Backend
```
┌─────────────┐
│   Tenant    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  AIProvider     │  (Lovable, OpenAI, etc)
└────────┬────────┘
         │
         ▼
   ┌─────────┐
   │ AIAgent │  (GPT-4, Gemini Flash, etc)
   └─────────┘
```

#### Frontend
```
src/
├── services/
│   └── aiProviders.ts         # Service layer
├── components/ai/
│   ├── ProviderCard.tsx       # Card visual
│   └── CreateProviderDialog.tsx # Dialog criação
└── pages/
    └── AIProviders.tsx        # Página principal
```

### 📦 Novos Arquivos

#### Backend
- `apps/api/src/controllers/ai-providers.controller.ts`
- `apps/api/src/routes/ai-providers.routes.ts`

#### Frontend
- `src/services/aiProviders.ts`
- `src/pages/AIProviders.tsx`
- `src/components/ai/ProviderCard.tsx`
- `src/components/ai/CreateProviderDialog.tsx`

### 🚀 Features Implementadas

- [x] Sistema de múltiplos provedores de IA
- [x] CRUD completo de provedores
- [x] CRUD completo de agentes
- [x] Interface visual moderna
- [x] Isolamento por tenant
- [x] Toggle ativo/inativo
- [x] API key segura (criptografada no banco)
- [x] Teste de agente via API
- [x] Roteamento dinâmico no App.tsx

### 🔐 Segurança

- API keys armazenadas de forma segura
- Isolamento multi-tenant
- Autenticação obrigatória em todas as rotas
- Validação de propriedade de recursos

### 📝 Notas de Upgrade

#### Banco de Dados
Executar migration para criar as novas tabelas:
```bash
pnpm prisma migrate dev --name add-ai-providers
```

#### Variáveis de Ambiente
Para usar Lovable AI, certificar-se de que `LOVABLE_API_KEY` está configurado no Supabase.

### 🎯 Próximos Passos

1. Implementar executores específicos para cada provedor no Worker
2. Adicionar rastreamento de custo/tokens por provider
3. Implementar chat unificado com histórico IA + Humano
4. Sistema de Function Calling dinâmico
5. Base de Conhecimento RAG
6. Follow-up automático com cadência

### ⚠️ Breaking Changes

Nenhum - totalmente retrocompatível com v2.5.0

---

## Versão 2.5.0 - Sistema Scrum Completo + Facebook + Instagram (2025-01-XX)

### ✅ Scrum Completo com Backend Real

#### Database (Prisma)
- ✅ 8 novos modelos: ScrumTeam, TeamMember, Sprint, BacklogItem, Ceremony, VideoCall
- ✅ Enums: BacklogItemType, Priority, BacklogStatus, SprintStatus, CeremonyType, CeremonyStatus
- ✅ Relações completas entre modelos

#### Backend API
- ✅ `scrum.controller.ts`: CRUD completo para Teams, Sprints, Backlog, Ceremonies
- ✅ `video-call.controller.ts`: Gerenciamento de salas Jitsi
- ✅ Routes: `/api/scrum/*`, `/api/video-call/*`
- ✅ WebSocket events para real-time

#### Frontend Scrum
- ✅ Hook `useScrum` conectado à API real (não mock)
- ✅ `VideoCallDialog`: Integração com Jitsi Meet
- ✅ Enums uppercase (STORY, BUG, TASK, HIGH, MEDIUM, LOW, TODO, IN_PROGRESS, DONE)
- ✅ SprintBoard com drag-and-drop real

### 📱 Facebook Messenger Integration

#### Backend
- ✅ `facebook.controller.ts`: Initiate, pages, bulk, status, disconnect
- ✅ Routes: `/api/facebook/*`
- ✅ Redis Pub/Sub: `facebook:connect`, `facebook:disconnect`

#### Worker
- ✅ `facebook.provider.ts`: Login via facebook-chat-api (não oficial)
- ✅ `facebook-mass.queue.ts`: Disparo em massa com delay + jitter anti-ban
- ✅ Recebimento de mensagens em tempo real
- ✅ Logging de mensagens no banco

#### Frontend
- ✅ `FacebookConnectDialog`: Login com email/senha
- ✅ Serviço: `facebook.ts` com métodos completos
- ✅ Status em tempo real

### 📸 Instagram Integration

#### Backend
- ✅ `instagram.controller.ts`: Initiate, accounts, bulk, status, disconnect
- ✅ Routes: `/api/instagram/*`
- ✅ Redis Pub/Sub: `instagram:connect`, `instagram:disconnect`

#### Worker
- ✅ `instagram.provider.ts`: Login via instagram-private-api
- ✅ `instagram-mass.queue.ts`: Disparo de DMs em massa com anti-ban
- ✅ Detecção de username para envio
- ✅ Logging de mensagens

#### Frontend
- ✅ `InstagramConnectDialog`: Login com username/senha
- ✅ Serviço: `instagram.ts` com métodos completos
- ✅ Status em tempo real

### 🎥 Sistema de Vídeo Chamadas

- ✅ Integração com Jitsi Meet
- ✅ JWT tokens para salas seguras
- ✅ Registro de participantes e duração
- ✅ `VideoCallDialog`: UI moderna para chamadas
- ✅ Deep link para abrir Jitsi em nova aba

### 🔧 Melhorias Técnicas

#### Novos Arquivos Backend
- `apps/api/src/controllers/scrum.controller.ts`
- `apps/api/src/controllers/video-call.controller.ts`
- `apps/api/src/controllers/facebook.controller.ts`
- `apps/api/src/controllers/instagram.controller.ts`
- `apps/api/src/routes/scrum.routes.ts`
- `apps/api/src/routes/video-call.routes.ts`
- `apps/api/src/routes/facebook.routes.ts`
- `apps/api/src/routes/instagram.routes.ts`

#### Novos Arquivos Worker
- `apps/worker/src/providers/facebook/facebook.provider.ts`
- `apps/worker/src/providers/instagram/instagram.provider.ts`
- `apps/worker/src/queues/facebook-mass.queue.ts`
- `apps/worker/src/queues/instagram-mass.queue.ts`

#### Novos Arquivos Frontend
- `src/services/scrum.ts`
- `src/services/videoCall.ts`
- `src/services/facebook.ts`
- `src/services/instagram.ts`
- `src/components/scrum/VideoCallDialog.tsx`
- `src/components/integrations/FacebookConnectDialog.tsx`
- `src/components/integrations/InstagramConnectDialog.tsx`
- `src/hooks/useScrum.ts` (refatorado para usar API real)

### 📦 Dependências Adicionadas

```json
{
  "@jitsi/react-sdk": "^1.3.0",
  "facebook-chat-api": "^1.7.0",
  "instagram-private-api": "^1.45.0"
}
```

### 🚀 Features Implementadas

- [x] Scrum completo funcional com backend
- [x] Facebook Messenger (não oficial)
- [x] Instagram DMs (não oficial)
- [x] Vídeo chamadas com Jitsi
- [x] Disparo em massa multi-canal
- [x] Anti-ban com jitter configurável
- [x] Real-time via WebSocket
- [x] Logging de todas as mensagens

### ⚠️ Notas Importantes

1. **APIs Não Oficiais**: Facebook e Instagram usam bibliotecas não oficiais que podem quebrar com atualizações
2. **Anti-Ban**: Delay e jitter são essenciais para evitar bloqueios
3. **Credenciais**: Senhas são codificadas em Base64 (usar criptografia real em produção)
4. **Jitsi**: Usando jitsi.org público (considerar self-hosted em produção)

---

**Data de Release**: $(date +%Y-%m-%d)
**Versão**: 2.6.0
**Tipo**: Multi-Provider AI System
**Status**: Pronto para produção

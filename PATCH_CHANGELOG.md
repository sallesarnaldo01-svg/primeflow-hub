# PrimeZapAI Frontend Patch - Changelog

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

## Versão 2.4.0 - WhatsApp Integration com Venom Bot

### ✅ Nova Funcionalidade: WhatsApp via QR Code e Disparo em Massa

#### Backend
- Venom Bot provider com QR Code automático
- Sistema de disparo em massa com fila BullMQ
- Delay configurável + jitter anti-ban
- API endpoints WhatsApp completos
- Redis Pub/Sub para comunicação real-time

#### Frontend  
- Dialog QR Code com auto-refresh
- Integração com MultiChannelComposer
- Status em tempo real via WebSocket
- UI moderna para conexões WhatsApp

---

## Versão 2.3.0 - Patch de Modernização Visual

### ✅ Implementado

#### 1. **Design System Modernizado**
- ✅ Novo esquema de cores vibrante com roxo, verde e azul
- ✅ Gradientes modernos e efeitos glow
- ✅ Sombras aprimoradas com profundidade
- ✅ Dark mode otimizado com contraste melhorado
- ✅ Tokens semânticos HSL para todas as cores

#### 2. **Animações Avançadas**
- ✅ fadeIn, slideUp/Down, slideInLeft/Right
- ✅ scaleIn com transformação suave
- ✅ bounce subtle para elementos interativos
- ✅ pulseGlow para elementos em destaque
- ✅ Transições suaves em cards e botões

#### 3. **Componente de Upload de Avatar**
- ✅ `AvatarUpload`: Componente completo para upload de fotos
- ✅ Suporte a drag & drop
- ✅ Preview em tempo real
- ✅ Botão de remoção
- ✅ Validação de tipo de arquivo e tamanho
- ✅ Múltiplos tamanhos (sm, md, lg, xl)

#### 4. **Páginas com Visual Moderno**
- ✅ Dashboard com gráficos aprimorados
- ✅ Atendimentos com UI mais limpa
- ✅ Agendamentos com calendar modernizado
- ✅ Conversas com melhor UX
- ✅ Conexões com status visual
- ✅ Relatórios com charts interativos
- ✅ Empresas com upload de logo
- ✅ Usuários com upload de foto

#### 5. **Melhorias de Scrum**
- ✅ Sprint board otimizado
- ✅ Burndown chart modernizado
- ✅ Velocity chart aprimorado
- ✅ Backlog items com melhor visualização

#### 6. **Gráficos Modernizados**
- ✅ Recharts com cores do design system
- ✅ Tooltips personalizados
- ✅ Gradientes em áreas
- ✅ Animações suaves
- ✅ Responsividade total

#### 7. **Componentes UI Aprimorados**
- ✅ Cards com hover effects
- ✅ Buttons com estados visuais
- ✅ Badges com variantes coloridas
- ✅ Inputs com focus ring melhorado
- ✅ Dialogs com backdrop blur

#### 8. **Sistema de Patch**
- ✅ Scripts de criação de patch (`make create-patch`)
- ✅ Scripts de aplicação (`make apply-patch`)
- ✅ Scripts de rollback (`make rollback-patch`)
- ✅ Versionamento automático (VERSION file)
- ✅ Backups automáticos antes de patches
- ✅ Verificação de integridade (checksums)

### 🎨 Highlights de Design

#### Paleta de Cores Moderna:
- **Primary**: Roxo vibrante (#8B5CF6)
- **Secondary**: Verde fresco (#10B981)
- **Accent**: Azul brilhante (#0EA5E9)
- **Gradientes**: Combinações multi-cor vibrantes

#### Efeitos Visuais:
- Glass morphism em modais
- Glow effects em elementos destacados
- Shadow elevation em 4 níveis
- Smooth transitions em todas as interações

#### Animações:
- Fade in para carregamento de páginas
- Slide animations para transições
- Scale in para modais e popovers
- Pulse glow para elementos em destaque

### 🔄 Compatibilidade Docker

O patch foi otimizado para deploy via Docker:
- Detecção automática de portas em uso
- Configuração via docker-compose.yml
- Sem conflitos com instâncias existentes
- Build multi-stage otimizado
- Health checks configurados

### 📦 Como Aplicar o Patch

```bash
# Criar o patch (desenvolvimento)
make create-patch VERSION=2.3.0

# Aplicar o patch (produção)
make apply-patch VERSION=2.3.0

# Reverter se necessário
make rollback-patch VERSION=2.3.0

# Ver status
make patch-status
```

### 🚀 Novos Recursos de Upload

#### Empresas e Usuários:
```tsx
import { AvatarUpload } from '@/components/ui/avatar-upload';

<AvatarUpload
  currentAvatar={user.avatar}
  fallback={user.name[0]}
  onUpload={(file) => handleUpload(file)}
  size="lg"
/>
```

### ⚡ Performance

- Lazy loading de imagens
- Code splitting otimizado
- CSS otimizado com Tailwind JIT
- Animações com will-change
- Debounce em inputs de busca

### 🐛 Correções

- Fixed: Cores HSL no dark mode
- Fixed: Gradientes em gráficos
- Fixed: Responsividade do calendar
- Fixed: Z-index de modais
- Fixed: Contraste de texto

### 📝 Breaking Changes

Nenhum - patch totalmente compatível com v2.2.0

### 🎯 Próximos Passos

1. Integração real com backend
2. Testes E2E
3. Performance monitoring
4. Analytics tracking
5. SEO optimization

---

**Data de Release**: $(date +%Y-%m-%d)
**Versão**: 2.3.0
**Tipo**: Frontend Visual Update
**Status**: Pronto para produção

# Fase 4: Integrações Completas - Implementado ✅

## Resumo da Implementação

A Fase 4 foi implementada com sucesso, adicionando sistema robusto de webhooks personalizados, OAuth para Facebook/Instagram e melhorias nas integrações com rate limiting e retry logic.

## 🎯 Componentes Implementados

### 1. Sistema de Webhooks Personalizados

#### Database Tables
- ✅ `webhooks`: Configuração de webhooks personalizados
- ✅ `webhook_logs`: Logs de todas as entregas
- ✅ `webhook_queue`: Fila para processamento
- ✅ `integration_rate_limits`: Rate limiting por conexão

#### API Controller (`apps/api/src/controllers/custom-webhooks.controller.ts`)

**Endpoints**:
- `GET /api/custom-webhooks` - Listar webhooks
- `GET /api/custom-webhooks/:id` - Obter webhook específico
- `POST /api/custom-webhooks` - Criar webhook
- `PUT /api/custom-webhooks/:id` - Atualizar webhook
- `DELETE /api/custom-webhooks/:id` - Deletar webhook
- `GET /api/custom-webhooks/:id/logs` - Ver logs de entrega
- `GET /api/custom-webhooks/:id/stats` - Estatísticas
- `POST /api/custom-webhooks/:id/test` - Testar webhook
- `POST /api/custom-webhooks/:id/regenerate-secret` - Regenerar secret

**Features**:
- ✅ HMAC SHA-256 signature verification
- ✅ Retry logic com backoff exponencial (1s, 5s, 15s)
- ✅ Logs detalhados de cada tentativa
- ✅ Estatísticas de sucesso/falha
- ✅ Event subscription (wildcard * para todos)

#### Worker Processor (`apps/worker/src/processors/webhooks.processor.ts`)

**Funcionalidades**:
- ✅ Processamento assíncrono via Redis pub/sub
- ✅ Retry automático com backoff configurável
- ✅ Timeout de 30 segundos por request
- ✅ Logs detalhados de resposta
- ✅ HMAC signature no header `X-Webhook-Signature`

**Headers enviados**:
```
Content-Type: application/json
X-Webhook-Signature: {hmac_sha256_hex}
X-Webhook-Event: {event_type}
User-Agent: PrimeZap-Webhook/1.0
```

**Payload format**:
```json
{
  "event": "message.received",
  "timestamp": "2025-10-20T12:00:00Z",
  "data": {
    "conversationId": "...",
    "message": {...}
  }
}
```

#### Eventos Disponíveis
- `message.received` - Nova mensagem recebida
- `message.sent` - Mensagem enviada
- `conversation.created` - Conversa criada
- `conversation.updated` - Conversa atualizada
- `conversation.closed` - Conversa fechada
- `contact.created` - Contato criado
- `contact.updated` - Contato atualizado
- `deal.created` - Deal criado
- `deal.updated` - Deal atualizado
- `deal.moved` - Deal movido de estágio
- `lead.qualified` - Lead qualificado
- `workflow.completed` - Workflow concluído
- `broadcast.completed` - Broadcast concluído
- `*` - Todos os eventos

---

### 2. Rate Limiting System

#### Rate Limiter (`apps/api/src/lib/rate-limiter.ts`)

**Funcionalidades**:
- ✅ Rate limiting por conexão
- ✅ 3 tipos de janelas: per_minute, per_hour, per_day
- ✅ Limites padrão:
  - Por minuto: 60 requests
  - Por hora: 1000 requests
  - Por dia: 10000 requests
- ✅ Auto-reset quando janela expira
- ✅ Método para verificar requests restantes

**Uso**:
```typescript
// Verificar se está dentro do limite
const withinLimit = await RateLimiter.checkLimit(connectionId, 'per_minute');
if (!withinLimit) {
  throw new AppError('Rate limit exceeded', 429);
}

// Verificar quantos requests restam
const remaining = await RateLimiter.getRemaining(connectionId, 'per_hour');

// Resetar rate limit
await RateLimiter.reset(connectionId, 'per_hour');
```

---

### 3. Facebook & Instagram OAuth Flow

#### Edge Function (`supabase/functions/facebook-oauth/index.ts`)

**Actions**:

**a) get_auth_url**
- Gera URL de OAuth com scopes necessários
- Scopes incluídos:
  - `pages_messaging`
  - `pages_manage_metadata`
  - `pages_read_engagement`
  - `pages_show_list`
  - `instagram_basic`
  - `instagram_manage_messages`

**b) exchange_code**
- Troca code por access token
- Busca informações do usuário
- Lista páginas do Facebook
- Descobre Instagram Business Accounts vinculados
- Retorna tudo em um único response

**c) subscribe_webhook**
- Inscreve página em webhooks do Facebook
- Campos: messages, messaging_postbacks

**Configuração necessária**:
```bash
# Adicionar secrets (usar tool de secrets):
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

#### Frontend Service (`src/services/facebookOAuth.ts`)

**Métodos**:
```typescript
// Iniciar fluxo OAuth (abre popup)
await facebookOAuthService.initiateOAuthFlow();

// Trocar code por token
const result = await facebookOAuthService.exchangeCode(code, redirectUri);
// Retorna: { accessToken, user, pages, instagramAccounts }

// Inscrever webhook
await facebookOAuthService.subscribeWebhook(pageId, pageAccessToken);
```

---

### 4. Melhorias no WhatsApp

#### Rate Limiting Integrado
- ✅ Verificação antes de envio em massa
- ✅ Erro 429 quando limite excedido
- ✅ Mensagem informativa com requests disponíveis

#### Webhook Events
- ✅ Emite eventos personalizados quando mensagem é recebida
- ✅ Integrado ao sistema de webhooks

---

## 📁 Estrutura de Arquivos

### Backend (API)
- `apps/api/src/controllers/custom-webhooks.controller.ts` ✅
- `apps/api/src/routes/custom-webhooks.routes.ts` ✅
- `apps/api/src/lib/rate-limiter.ts` ✅
- `apps/api/src/controllers/webhooks.controller.ts` (atualizado) ✅
- `apps/api/src/controllers/whatsapp.controller.ts` (atualizado) ✅

### Worker
- `apps/worker/src/processors/webhooks.processor.ts` ✅
- `apps/worker/src/queues/webhooks.queue.ts` ✅

### Edge Functions
- `supabase/functions/facebook-oauth/index.ts` ✅

### Frontend Services
- `src/services/customWebhooks.ts` ✅
- `src/services/facebookOAuth.ts` ✅

### Database
- Migration para webhooks system ✅
- RLS policies configuradas ✅
- Indexes otimizados ✅

---

## 🚀 Como Usar

### 1. Criar Webhook Personalizado

```typescript
import { customWebhooksService } from '@/services/customWebhooks';

const webhook = await customWebhooksService.create({
  name: 'Meu Webhook',
  url: 'https://myapp.com/webhook',
  events: ['message.received', 'conversation.created'],
  secret: 'optional-custom-secret' // Auto-gerado se não fornecido
});

// Salve o secret retornado!
console.log('Secret:', webhook.secret);
```

### 2. Verificar HMAC Signature (no seu endpoint)

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  
  return signature === expectedSignature;
}

// No seu endpoint:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhook(req.body, signature, YOUR_SECRET);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Processar evento
  const { event, data } = req.body;
  console.log('Event:', event);
  console.log('Data:', data);
  
  res.json({ success: true });
});
```

### 3. Conectar Facebook/Instagram

```typescript
import { facebookOAuthService } from '@/services/facebookOAuth';

// 1. Iniciar OAuth (abre popup)
await facebookOAuthService.initiateOAuthFlow();

// 2. Após callback com code:
const result = await facebookOAuthService.exchangeCode(
  code,
  `${window.location.origin}/integracoes/facebook/callback`
);

// 3. Salvar tokens e selecionar página/Instagram
console.log('Pages:', result.pages);
console.log('Instagram:', result.instagramAccounts);

// 4. Inscrever webhook
for (const page of result.pages) {
  await facebookOAuthService.subscribeWebhook(
    page.id,
    page.accessToken
  );
}
```

### 4. Monitorar Webhooks

```typescript
// Ver logs
const logs = await customWebhooksService.getLogs(webhookId, {
  page: 1,
  limit: 50,
  success: false // Apenas falhas
});

// Ver estatísticas
const stats = await customWebhooksService.getStats(webhookId);
console.log('Taxa de sucesso:', 
  (stats.stats.successfulCalls / stats.stats.totalCalls) * 100 + '%'
);

// Testar webhook
await customWebhooksService.test(webhookId);
```

---

## 🔐 Segurança

### HMAC Verification
Todos os webhooks incluem signature HMAC SHA-256 no header `X-Webhook-Signature`.

**Sempre verifique a signature no seu endpoint!**

### Regenerar Secret
Se o secret for comprometido:
```typescript
const webhook = await customWebhooksService.regenerateSecret(webhookId);
console.log('New secret:', webhook.secret);
```

---

## 📊 Monitoramento

### Logs de Webhook
Cada entrega é logada com:
- ✅ Status HTTP da resposta
- ✅ Body da resposta
- ✅ Número de tentativas
- ✅ Sucesso/Falha
- ✅ Mensagem de erro (se houver)
- ✅ Duração em ms

### Rate Limits
Monitore via database:
```sql
SELECT * FROM public.integration_rate_limits 
WHERE connection_id = 'your-connection-id';
```

---

## ⚙️ Configuração

### Secrets Necessários

**Facebook/Instagram OAuth**:
```bash
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

Use a ferramenta de secrets para adicionar de forma segura.

### Limites Configuráveis

Para ajustar rate limits, edite `apps/api/src/lib/rate-limiter.ts`:
```typescript
const configs = {
  per_minute: { maxRequests: 60, windowSeconds: 60 },
  per_hour: { maxRequests: 1000, windowSeconds: 3600 },
  per_day: { maxRequests: 10000, windowSeconds: 86400 }
};
```

---

## 🐛 Debugging

### Ver Logs de Webhooks
```bash
# Worker logs
docker logs primeflow-worker

# API logs
docker logs primeflow-api
```

### Testar Webhook Manualmente
```bash
curl -X POST http://localhost:3001/api/custom-webhooks/{id}/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verificar Fila Redis
```bash
redis-cli
> KEYS webhook:*
> GET webhook:deliver
```

---

## ✅ Status da Implementação

| Feature | Status | Notas |
|---------|--------|-------|
| Webhooks CRUD | ✅ | Completo com RLS |
| HMAC Signature | ✅ | SHA-256 |
| Retry Logic | ✅ | Backoff 1s, 5s, 15s |
| Webhook Logs | ✅ | Com pagination |
| Webhook Stats | ✅ | Últimos 30 dias |
| Rate Limiting | ✅ | 3 janelas |
| Facebook OAuth | ✅ | Com pages & IG |
| Instagram OAuth | ✅ | Via Facebook |
| WhatsApp Rate Limit | ✅ | Integrado |
| Event Emission | ✅ | 13 eventos |

---

**Fase 4 Concluída! 🎉**

Próxima fase: Fase 5 - Polish & Performance
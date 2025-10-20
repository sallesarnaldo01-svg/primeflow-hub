# 🚀 Plano de Ação Completo - PrimeZapAI

## Data: 2025-01-15

---

## 🎯 OBJETIVO GERAL

Completar as funcionalidades faltantes do PrimeZapAI, priorizando funcionalidades críticas que impedem o uso em produção e melhoram a experiência do usuário.

---

## 📊 RESUMO EXECUTIVO

- **Total de Tarefas**: 52
- **Prioridade Alta (P1)**: 18 tarefas
- **Prioridade Média (P2)**: 20 tarefas
- **Prioridade Baixa (P3)**: 14 tarefas
- **Tempo Estimado Total**: ~160 horas (20 dias úteis)
- **Fases**: 6 fases sequenciais

---

## 📅 FASES DE IMPLEMENTAÇÃO

### **FASE 5: Fundação e Segurança** (Semana 1-2)
**Objetivo**: Estabelecer base sólida para produção
**Duração**: 10 dias
**Prioridade**: 🔴 CRÍTICA

### **FASE 6: Integração de Dados Reais** (Semana 3)
**Objetivo**: Substituir mock data por dados reais do backend
**Duração**: 5 dias
**Prioridade**: 🔴 ALTA

### **FASE 7: Notificações e Comunicação** (Semana 4)
**Objetivo**: Sistema de notificações completo
**Duração**: 4 dias
**Prioridade**: 🟡 MÉDIA

### **FASE 8: Relatórios e Analytics** (Semana 5)
**Objetivo**: Dashboards e relatórios avançados
**Duração**: 5 dias
**Prioridade**: 🟡 MÉDIA

### **FASE 9: Integrações Externas** (Semana 6)
**Objetivo**: Completar integrações pendentes
**Duração**: 6 dias
**Prioridade**: 🟡 MÉDIA

### **FASE 10: Polimento e Qualidade** (Semana 7-8)
**Objetivo**: UX, performance, mobile, testes
**Duração**: 10 dias
**Prioridade**: 🟢 BAIXA

---

## 🔥 FASE 5: FUNDAÇÃO E SEGURANÇA

### Tarefas

#### 5.1. Sistema de Roles e Permissões 🔴 P1
**Duração**: 2 dias  
**Descrição**: Implementar sistema completo de permissões granulares

**Subtarefas**:
- [ ] Criar tabela `role_permissions` no banco
- [ ] Definir permissões por módulo (ex: `contacts.read`, `deals.write`, `workflows.execute`)
- [ ] Criar hook `usePermissions()` para verificar permissões
- [ ] Implementar middleware de permissões no backend
- [ ] Adicionar guard de permissões em rotas protegidas
- [ ] Criar componente `<PermissionGate>` para UI condicional
- [ ] Adicionar interface de gestão de roles (criar, editar, atribuir)
- [ ] Testar com usuários de diferentes roles

**Arquivos a Modificar**:
- `prisma/schema.prisma` (adicionar tabela role_permissions)
- `src/hooks/usePermissions.ts` (criar)
- `apps/api/src/middleware/permissions.ts` (criar)
- `src/components/PermissionGate.tsx` (criar)
- Nova página: `src/pages/Configuracoes/Roles.tsx`

**Critérios de Aceitação**:
- ✅ Admin pode criar e atribuir roles customizados
- ✅ Usuários veem apenas módulos que têm permissão
- ✅ API retorna 403 para ações não autorizadas
- ✅ Logs de auditoria registram mudanças de permissões

---

#### 5.2. Auditoria de Ações 🔴 P1
**Duração**: 1 dia  
**Descrição**: Registrar todas ações críticas no sistema

**Subtarefas**:
- [ ] Criar tabela `audit_logs` (user_id, action, entity, entity_id, old_value, new_value, ip, timestamp)
- [ ] Criar service `auditService.log(action, details)`
- [ ] Adicionar auditoria em:
  - Login/logout
  - CRUD de deals
  - CRUD de contatos
  - Mudanças de configuração
  - Exclusões
  - Envio de mensagens em massa
- [ ] Criar página de visualização de logs de auditoria
- [ ] Filtros por usuário, ação, data, entidade
- [ ] Exportação de logs

**Arquivos a Criar/Modificar**:
- `prisma/schema.prisma`
- `src/services/audit.ts`
- `apps/api/src/services/audit.service.ts`
- `src/pages/Configuracoes/AuditLogs.tsx`

**Critérios de Aceitação**:
- ✅ Todas ações críticas são registradas
- ✅ Logs incluem IP, user-agent, timestamp
- ✅ Admin pode visualizar e filtrar logs
- ✅ Logs não podem ser deletados por usuários

---

#### 5.3. Autenticação de Dois Fatores (2FA) 🔴 P2
**Duração**: 2 dias  
**Descrição**: Adicionar camada extra de segurança

**Subtarefas**:
- [ ] Adicionar campos `two_factor_enabled`, `two_factor_secret` em profiles
- [ ] Integrar biblioteca `speakeasy` para TOTP
- [ ] Criar página de configuração de 2FA
- [ ] Gerar QR Code para aplicativos (Google Authenticator, Authy)
- [ ] Implementar verificação de código no login
- [ ] Códigos de recuperação (backup codes)
- [ ] Notificar usuário quando 2FA é habilitado/desabilitado

**Arquivos a Criar/Modificar**:
- `src/pages/Configuracoes/Security.tsx`
- `apps/api/src/controllers/auth.controller.ts`
- `apps/api/src/services/two-factor.service.ts`

**Critérios de Aceitação**:
- ✅ Usuário pode habilitar 2FA escaneando QR Code
- ✅ Login requer código 2FA quando habilitado
- ✅ Códigos de recuperação funcionam se perder acesso ao app
- ✅ Notificação por email ao habilitar/desabilitar 2FA

---

#### 5.4. Configurações da Empresa 🔴 P1
**Duração**: 1 dia  
**Descrição**: Centralizar configurações globais

**Subtarefas**:
- [ ] Criar tabela `company_settings` (logo, nome, timezone, moeda, idioma, etc.)
- [ ] Criar página `/configuracoes/empresa`
- [ ] Campos:
  - Nome da empresa
  - Logo
  - Fuso horário
  - Moeda padrão (BRL, USD, EUR)
  - Idioma padrão (pt-BR, en-US, es-ES)
  - Formato de data
  - Horário de funcionamento
- [ ] Integrar timezone em exibição de datas
- [ ] Integrar moeda em formatação de valores

**Arquivos a Criar/Modificar**:
- `prisma/schema.prisma`
- `src/pages/Configuracoes/Empresa.tsx`
- `src/services/settings.ts`
- `src/utils/formatters.ts` (usar settings globais)

**Critérios de Aceitação**:
- ✅ Admin pode configurar dados da empresa
- ✅ Logo aparece no sidebar e emails
- ✅ Datas e moedas respeitam configurações
- ✅ Timezone é aplicado em agendamentos

---

#### 5.5. Backup e Restore 🔴 P2
**Duração**: 2 dias  
**Descrição**: Sistema de backup automático

**Subtarefas**:
- [ ] Script de backup diário do PostgreSQL
- [ ] Backup de arquivos do Supabase Storage
- [ ] Armazenar backups em local seguro (S3/Cloud Storage)
- [ ] Criar endpoint `/api/admin/backup` (manual)
- [ ] Criar endpoint `/api/admin/restore`
- [ ] Página admin para gerenciar backups
- [ ] Notificar admin se backup falhar
- [ ] Retenção de backups (7 dias, 4 semanas, 12 meses)

**Arquivos a Criar**:
- `scripts/backup.sh`
- `scripts/restore.sh`
- `apps/api/src/controllers/admin.controller.ts`
- `src/pages/Admin/Backups.tsx`

**Critérios de Aceitação**:
- ✅ Backup automático roda diariamente
- ✅ Admin pode fazer backup manual
- ✅ Restore funciona sem perda de dados
- ✅ Notificação em caso de falha

---

#### 5.6. Monitoramento de Erros 🔴 P2
**Duração**: 1 dia  
**Descrição**: Centralizar logs de erros e monitoramento

**Subtarefas**:
- [ ] Integrar Sentry ou LogRocket (opcional, pode usar logs internos)
- [ ] Criar tabela `error_logs` (frontend e backend)
- [ ] Capturar erros não tratados no frontend (ErrorBoundary global)
- [ ] Capturar erros no backend (middleware de erro)
- [ ] Criar página admin para visualizar erros
- [ ] Alertas para erros críticos (via email/webhook)
- [ ] Métricas: taxa de erro, erros por página, erros por usuário

**Arquivos a Criar/Modificar**:
- `src/components/GlobalErrorBoundary.tsx`
- `apps/api/src/middleware/error.ts` (já existe, melhorar)
- `prisma/schema.prisma`
- `src/pages/Admin/ErrorLogs.tsx`

**Critérios de Aceitação**:
- ✅ Erros são capturados e logados
- ✅ Admin recebe alerta de erros críticos
- ✅ Dashboard mostra taxa de erro
- ✅ Erros incluem stack trace e contexto

---

#### 5.7. Rate Limiting Avançado 🔴 P2
**Duração**: 1 dia  
**Descrição**: Proteger API contra abuso

**Subtarefas**:
- [ ] Já existe `apps/api/src/lib/rate-limiter.ts` (Fase 4)
- [ ] Aplicar rate limiting em todos endpoints sensíveis
- [ ] Configurar limites específicos por endpoint:
  - Login: 5 req/min
  - Criação de contatos: 100 req/hora
  - Envio de mensagens: 1000 req/dia
  - Workflows: 10 exec/min
- [ ] Responder com 429 Too Many Requests
- [ ] Headers de rate limit (X-RateLimit-*)
- [ ] Dashboard de rate limits por usuário/IP

**Arquivos a Modificar**:
- `apps/api/src/middleware/rate-limit.ts` (criar wrapper)
- Todos controllers (adicionar middleware)

**Critérios de Aceitação**:
- ✅ Endpoints sensíveis têm rate limiting
- ✅ Resposta 429 com tempo de retry
- ✅ Headers informativos
- ✅ Admin pode ver quem está sendo rate limited

---

**📊 Progresso Fase 5**: 0/7 tarefas (0%)

---

## 🔄 FASE 6: INTEGRAÇÃO DE DADOS REAIS

### Tarefas

#### 6.1. Dashboard com Dados Reais 🔴 P1
**Duração**: 1 dia  
**Descrição**: Substituir mock data por dados do backend

**Subtarefas**:
- [ ] Usar métricas reais de:
  - Leads gerados (tabela contacts)
  - Taxa de conversão (contacts → deals)
  - Atendimentos (tabela conversations)
  - Receita (deals com stage='won')
- [ ] Implementar endpoint `/api/dashboard/metrics?period=30d`
- [ ] Gráfico de tendências com dados históricos
- [ ] Performance por canal (agrupar por source)
- [ ] Deals recentes (top 5 do dia)
- [ ] Atividades recentes (últimas 10 ações)

**Arquivos a Modificar**:
- `src/pages/Dashboard.tsx` (remover mock data)
- `apps/api/src/controllers/dashboard.controller.ts` (já existe, verificar)
- `src/services/dashboard.ts`

**Critérios de Aceitação**:
- ✅ Métricas refletem dados reais do banco
- ✅ Gráficos são gerados a partir de histórico
- ✅ Performance sob 500ms
- ✅ Cache de 5 minutos

---

#### 6.2. Funil de Vendas com Dados Reais 🔴 P1
**Duração**: 1 dia  
**Descrição**: Conectar FunilVendas.tsx ao backend

**Subtarefas**:
- [ ] Endpoint `/api/reports/sales-funnel?period=30d`
- [ ] Calcular estágios do funil a partir de deals
- [ ] Taxas de conversão entre estágios
- [ ] Tempo médio em cada estágio
- [ ] Previsão de receita (weighted pipeline)
- [ ] Performance por origem (tag)

**Arquivos a Modificar**:
- `src/pages/FunilVendas.tsx`
- `apps/api/src/controllers/reports.controller.ts` (criar)
- `apps/api/src/services/reports.service.ts` (criar)

**Critérios de Aceitação**:
- ✅ Funil mostra dados reais
- ✅ Conversão calculada corretamente
- ✅ Filtros por período funcionam
- ✅ Exportação de relatório

---

#### 6.3. Kanban de Tarefas com Backend 🔴 P2
**Duração**: 1.5 dias  
**Descrição**: Implementar backend para Kanban.tsx

**Subtarefas**:
- [ ] Criar tabela `tasks` (id, title, description, status, priority, assignee_id, due_date, checklist, attachments, comments, created_at, updated_at)
- [ ] Criar service `tasksService` (CRUD, move)
- [ ] Criar API `/api/tasks`
- [ ] Integrar Kanban.tsx com backend real
- [ ] Drag-and-drop persiste no backend
- [ ] Comentários em tasks (tabela task_comments)
- [ ] Upload de anexos (Storage)
- [ ] Checklist funcional (JSON no banco ou tabela separada)

**Arquivos a Criar**:
- `prisma/schema.prisma` (tabela tasks)
- `apps/api/src/controllers/tasks.controller.ts`
- `apps/api/src/services/tasks.service.ts`
- `src/services/tasks.ts`

**Arquivos a Modificar**:
- `src/pages/Kanban.tsx`

**Critérios de Aceitação**:
- ✅ Tasks persistem no banco
- ✅ Drag-and-drop salva no backend
- ✅ Comentários e anexos funcionam
- ✅ Notificações quando atribuído

---

#### 6.4. Histórico de Conversas por Contato 🔴 P2
**Duração**: 1 dia  
**Descrição**: Visualizar histórico completo de interações

**Subtarefas**:
- [ ] Criar página `/contatos/:id/historico`
- [ ] Endpoint `/api/contacts/:id/history` retorna:
  - Conversas
  - Deals
  - Tasks
  - Notas
  - Emails
  - Chamadas
  - Workflows executados
- [ ] Timeline unificada ordenada por data
- [ ] Filtros por tipo de evento
- [ ] Exportar histórico

**Arquivos a Criar**:
- `src/pages/Contatos/ContatoHistorico.tsx`
- `apps/api/src/controllers/contacts.controller.ts` (adicionar endpoint)

**Critérios de Aceitação**:
- ✅ Timeline mostra todos eventos do contato
- ✅ Eventos são ordenados corretamente
- ✅ Filtros funcionam
- ✅ Performance com muitos eventos

---

#### 6.5. Listas de Contatos Completas 🔴 P2
**Duração**: 0.5 dia  
**Descrição**: Melhorar gestão de listas

**Subtarefas**:
- [ ] Página `/contatos/listas` dedicada
- [ ] Criar lista a partir de filtros salvos
- [ ] Adicionar/remover contatos de listas
- [ ] Importar contatos para lista via CSV
- [ ] Estatísticas por lista (engajamento, conversão)
- [ ] Tags automáticas em listas

**Arquivos a Modificar**:
- `src/pages/Contatos.tsx` (já tem funcionalidade básica)
- Melhorar UI/UX

**Critérios de Aceitação**:
- ✅ Listas dinâmicas (filtros salvos)
- ✅ Importação CSV para lista específica
- ✅ Estatísticas por lista

---

**📊 Progresso Fase 6**: 0/5 tarefas (0%)

---

## 🔔 FASE 7: NOTIFICAÇÕES E COMUNICAÇÃO

### Tarefas

#### 7.1. Sistema de Notificações 🔴 P1
**Duração**: 2 dias  
**Descrição**: Notificações in-app, email e push

**Subtarefas**:
- [ ] Criar tabela `notifications` (user_id, type, title, message, link, read, created_at)
- [ ] Criar service `notificationService`
- [ ] Componente de notificações no header (badge com contador)
- [ ] Popup de notificações (últimas 10)
- [ ] Marcar como lida
- [ ] Preferências de notificação por usuário
- [ ] Tipos de notificação:
  - Nova mensagem
  - Deal movido
  - Task atribuída
  - Workflow completado
  - Mention em comentário
- [ ] Notificações por email (templates)
- [ ] Notificações push (opcional: Firebase Cloud Messaging)

**Arquivos a Criar**:
- `prisma/schema.prisma` (tabela notifications)
- `src/components/NotificationCenter.tsx`
- `src/services/notifications.ts`
- `apps/api/src/controllers/notifications.controller.ts`
- `apps/api/src/services/notification.service.ts`

**Critérios de Aceitação**:
- ✅ Notificações aparecem em tempo real
- ✅ Badge no header com contador
- ✅ Usuário pode marcar como lida/não lida
- ✅ Emails são enviados conforme preferências
- ✅ Push notifications (opcional)

---

#### 7.2. Notas Internas em Conversas 🟡 P2
**Duração**: 0.5 dia  
**Descrição**: Adicionar notas privadas entre agentes

**Subtarefas**:
- [ ] Adicionar campo `internal_note` em messages (boolean)
- [ ] UI para alternar entre mensagem normal e nota interna
- [ ] Notas aparecem em cor diferente
- [ ] Apenas agentes veem notas internas (filtrar no frontend)
- [ ] Menções em notas (@usuário)

**Arquivos a Modificar**:
- `src/pages/Conversas.tsx`
- `apps/api/src/controllers/conversations.controller.ts`

**Critérios de Aceitação**:
- ✅ Agente pode deixar nota interna
- ✅ Cliente não vê notas internas
- ✅ Menções notificam usuário

---

#### 7.3. Templates de Mensagens 🟡 P2
**Duração**: 1 dia  
**Descrição**: Respostas rápidas e templates salvos

**Subtarefas**:
- [ ] Criar tabela `message_templates` (name, content, variables, category, created_by)
- [ ] Página `/configuracoes/templates`
- [ ] CRUD de templates
- [ ] Variáveis dinâmicas ({{nome}}, {{empresa}}, {{produto}})
- [ ] Categorias de templates (vendas, suporte, financeiro)
- [ ] Atalhos de teclado para inserir template (/nome-template)
- [ ] Compartilhar templates entre equipe

**Arquivos a Criar**:
- `prisma/schema.prisma`
- `src/pages/Configuracoes/Templates.tsx`
- `src/components/TemplateSelector.tsx`

**Critérios de Aceitação**:
- ✅ Usuário cria e salva templates
- ✅ Templates usam variáveis dinâmicas
- ✅ Atalho rápido funciona
- ✅ Templates são compartilháveis

---

#### 7.4. Chat Interno entre Agentes 🟡 P3
**Duração**: 1 dia  
**Descrição**: Chat privado para colaboração

**Subtarefas**:
- [ ] Criar tabela `internal_chats` e `internal_messages`
- [ ] Interface de chat no canto inferior direito
- [ ] Lista de usuários online (Socket.io)
- [ ] Mensagens em tempo real
- [ ] Notificações de novas mensagens
- [ ] Histórico de conversas

**Arquivos a Criar**:
- `prisma/schema.prisma`
- `src/components/InternalChat.tsx`
- `apps/api/src/controllers/internal-chat.controller.ts`

**Critérios de Aceitação**:
- ✅ Agentes podem conversar internamente
- ✅ Mensagens em realtime
- ✅ Histórico é salvo
- ✅ Notificação de nova mensagem

---

**📊 Progresso Fase 7**: 0/4 tarefas (0%)

---

## 📈 FASE 8: RELATÓRIOS E ANALYTICS

### Tarefas

#### 8.1. Dashboard de Analytics Avançado 🟡 P1
**Duração**: 2 dias  
**Descrição**: Painel completo de métricas

**Subtarefas**:
- [ ] Página `/analytics`
- [ ] Seções:
  - Conversas (volume, tempo médio de resposta, satisfação)
  - Vendas (pipeline, conversão, ticket médio)
  - Performance de agentes (produtividade, qualidade)
  - Canais (volume por canal, engajamento)
  - IA (uso, economia de tempo, qualidade)
- [ ] Filtros: período, equipe, canal, produto
- [ ] Comparação com período anterior
- [ ] Exportar gráficos como imagem
- [ ] Gráficos interativos (Recharts)

**Arquivos a Criar**:
- `src/pages/Analytics.tsx`
- `apps/api/src/controllers/analytics.controller.ts`
- `apps/api/src/services/analytics.service.ts`

**Critérios de Aceitação**:
- ✅ Dashboard mostra métricas abrangentes
- ✅ Filtros funcionam corretamente
- ✅ Performance < 1s
- ✅ Exportação funciona

---

#### 8.2. Relatórios Customizáveis 🟡 P2
**Duração**: 1.5 dias  
**Descrição**: Usuário cria relatórios personalizados

**Subtarefas**:
- [ ] Construtor de relatórios (query builder visual)
- [ ] Selecionar:
  - Entidades (deals, contacts, conversations)
  - Campos
  - Filtros
  - Agrupamento
  - Ordenação
- [ ] Salvar relatórios customizados
- [ ] Executar relatório agendado (cron)
- [ ] Exportar: CSV, Excel, PDF
- [ ] Compartilhar relatórios

**Arquivos a Criar**:
- `src/pages/Relatorios/Construtor.tsx`
- `apps/api/src/controllers/reports.controller.ts`

**Critérios de Aceitação**:
- ✅ Usuário cria relatório sem SQL
- ✅ Relatório pode ser salvo
- ✅ Agendamento funciona
- ✅ Exportação em múltiplos formatos

---

#### 8.3. Relatórios Agendados por Email 🟡 P2
**Duração**: 1 dia  
**Descrição**: Envio automático de relatórios

**Subtarefas**:
- [ ] Tabela `scheduled_reports` (report_id, schedule, recipients, format)
- [ ] Cron job para processar agendamentos
- [ ] Gerar PDF/CSV do relatório
- [ ] Enviar por email
- [ ] Logs de envios

**Arquivos a Criar**:
- `apps/worker/src/processors/scheduled-reports.processor.ts`

**Critérios de Aceitação**:
- ✅ Relatórios são enviados conforme agendamento
- ✅ Emails incluem anexo
- ✅ Logs registram sucesso/falha

---

#### 8.4. ROI por Canal 🟡 P2
**Duração**: 0.5 dia  
**Descrição**: Calcular retorno sobre investimento

**Subtarefas**:
- [ ] Adicionar campo `cost` em tabela campaigns
- [ ] Calcular ROI: (Receita - Custo) / Custo * 100
- [ ] Dashboard de ROI por canal
- [ ] Comparar canais
- [ ] Recomendar alocação de orçamento

**Arquivos a Modificar**:
- `src/pages/Analytics.tsx`
- `apps/api/src/services/analytics.service.ts`

**Critérios de Aceitação**:
- ✅ ROI é calculado corretamente
- ✅ Dashboard mostra ROI por canal
- ✅ Recomendações são exibidas

---

**📊 Progresso Fase 8**: 0/4 tarefas (0%)

---

## 🔌 FASE 9: INTEGRAÇÕES EXTERNAS

### Tarefas

#### 9.1. Instagram Direct Funcional 🟡 P1
**Duração**: 2 dias  
**Descrição**: Completar integração com Instagram

**Subtarefas**:
- [ ] OAuth para Instagram Business
- [ ] Configurar webhook do Instagram
- [ ] Receber mensagens diretas
- [ ] Enviar mensagens
- [ ] Suporte a mídia (fotos, vídeos)
- [ ] Stories mentions
- [ ] Comentários em posts
- [ ] Provider no worker (instagramProvider)

**Arquivos a Criar/Modificar**:
- `apps/api/src/controllers/instagram.controller.ts` (já existe)
- `apps/worker/src/providers/instagram/instagram.provider.ts` (já existe)
- `src/services/instagram.ts`

**Critérios de Aceitação**:
- ✅ OAuth funciona
- ✅ Mensagens são recebidas
- ✅ Envio de mensagens funciona
- ✅ Mídia é suportada

---

#### 9.2. Email como Canal (SMTP/IMAP) 🟡 P1
**Duração**: 2 dias  
**Descrição**: Integrar email na plataforma

**Subtarefas**:
- [ ] Configurar servidor SMTP (envio)
- [ ] Configurar servidor IMAP (recebimento)
- [ ] Página de configuração de email
- [ ] Receber emails e criar conversa
- [ ] Enviar emails a partir de conversas
- [ ] Templates de email (HTML)
- [ ] Rastreamento de abertura (pixel tracking)
- [ ] Anexos

**Arquivos a Criar**:
- `apps/api/src/controllers/email.controller.ts`
- `apps/worker/src/providers/email/email.provider.ts`
- `src/pages/Integracoes/Email.tsx`

**Critérios de Aceitação**:
- ✅ Emails são recebidos e viram conversas
- ✅ Agente pode responder via email
- ✅ Templates funcionam
- ✅ Rastreamento de abertura

---

#### 9.3. Stripe Funcional 🟡 P2
**Duração**: 1 dia  
**Descrição**: Processamento de pagamentos

**Subtarefas**:
- [ ] Configurar Stripe (API keys)
- [ ] Criar clientes no Stripe
- [ ] Criar invoices
- [ ] Processar pagamentos
- [ ] Webhook de eventos do Stripe
- [ ] Sincronizar status de pagamento
- [ ] Dashboard de pagamentos

**Arquivos a Criar**:
- `apps/api/src/controllers/stripe.controller.ts`
- `apps/api/src/services/stripe.service.ts`
- `src/pages/Financeiro/Pagamentos.tsx`

**Critérios de Aceitação**:
- ✅ Pagamentos são processados
- ✅ Webhooks funcionam
- ✅ Status sincronizado

---

#### 9.4. Telegram 🟡 P3
**Duração**: 1.5 dias  
**Descrição**: Adicionar Telegram como canal

**Subtarefas**:
- [ ] Criar bot no Telegram (BotFather)
- [ ] Webhook para receber mensagens
- [ ] Enviar mensagens
- [ ] Suporte a mídia
- [ ] Grupos e canais
- [ ] Provider no worker

**Arquivos a Criar**:
- `apps/api/src/controllers/telegram.controller.ts`
- `apps/worker/src/providers/telegram/telegram.provider.ts`

**Critérios de Aceitação**:
- ✅ Bot recebe e envia mensagens
- ✅ Mídia funciona
- ✅ Grupos são suportados

---

#### 9.5. SMS (Twilio) 🟡 P3
**Duração**: 1 dia  
**Descrição**: Enviar/receber SMS

**Subtarefas**:
- [ ] Integrar Twilio
- [ ] Configurar número de SMS
- [ ] Receber SMS via webhook
- [ ] Enviar SMS
- [ ] Logs de SMS

**Arquivos a Criar**:
- `apps/api/src/controllers/sms.controller.ts`
- `apps/api/src/services/sms.service.ts`

**Critérios de Aceitação**:
- ✅ SMS são enviados
- ✅ SMS recebidos criam conversas

---

#### 9.6. WebChat Widget 🟡 P2
**Duração**: 1.5 dias  
**Descrição**: Chat embarcável para sites

**Subtarefas**:
- [ ] Criar widget JS (`webchat.js`)
- [ ] Interface de chat (popup)
- [ ] Configuração de cores/logo
- [ ] Enviar/receber mensagens via WebSocket
- [ ] Notificações de novo agente
- [ ] Upload de arquivos
- [ ] Snippet de instalação

**Arquivos a Criar**:
- `public/webchat.js`
- `apps/api/src/controllers/webchat.controller.ts`

**Critérios de Aceitação**:
- ✅ Widget funciona em sites externos
- ✅ Mensagens em realtime
- ✅ Customizável

---

**📊 Progresso Fase 9**: 0/6 tarefas (0%)

---

## ✨ FASE 10: POLIMENTO E QUALIDADE

### Tarefas

#### 10.1. Mobile Responsiveness 🟢 P1
**Duração**: 2 dias  
**Descrição**: Otimizar para dispositivos móveis

**Subtarefas**:
- [ ] Testar todas páginas em mobile
- [ ] Ajustar breakpoints Tailwind
- [ ] Menu hamburger funcional
- [ ] Touch gestures (swipe, pinch)
- [ ] Bottomsheet para modais
- [ ] Otimizar imagens (lazy load, WebP)
- [ ] Testar em iOS e Android
- [ ] PWA (Service Worker, manifest.json)

**Arquivos a Modificar**:
- Todos componentes de layout
- `src/components/layout/Sidebar.tsx`
- `public/manifest.json` (criar)
- `src/service-worker.ts` (criar)

**Critérios de Aceitação**:
- ✅ App funciona perfeitamente em mobile
- ✅ Navegação é intuitiva
- ✅ Performance aceitável (< 3s LCP)
- ✅ PWA instalável

---

#### 10.2. Lazy Loading e Code Splitting 🟢 P2
**Duração**: 1 dia  
**Descrição**: Melhorar performance de carregamento

**Subtarefas**:
- [ ] Lazy load de rotas (React.lazy)
- [ ] Code splitting por módulo
- [ ] Lazy load de componentes pesados (charts, editor)
- [ ] Prefetch de rotas prováveis
- [ ] Skeleton loaders
- [ ] Otimizar bundle size

**Arquivos a Modificar**:
- `src/App.tsx` (rotas)
- Componentes pesados (adicionar Suspense)

**Critérios de Aceitação**:
- ✅ Bundle inicial < 500KB
- ✅ FCP < 1.5s
- ✅ Skeleton loaders suaves

---

#### 10.3. Cache e Paginação 🟢 P2
**Duração**: 1.5 dias  
**Descrição**: Reduzir chamadas à API

**Subtarefas**:
- [ ] Implementar cache no React Query (staleTime, cacheTime)
- [ ] Paginação em todas listas:
  - Contatos (cursor-based pagination)
  - Conversas
  - Deals
  - Tasks
  - Workflows
- [ ] Infinite scroll onde fizer sentido
- [ ] Cache de imagens (Service Worker)

**Arquivos a Modificar**:
- Todas páginas com listas
- `src/lib/api-client.ts`

**Critérios de Aceitação**:
- ✅ Listas carregam rapidamente
- ✅ Paginação funciona
- ✅ Cache reduz requisições

---

#### 10.4. Testes Automatizados 🟢 P3
**Duração**: 3 dias  
**Descrição**: Cobertura de testes

**Subtarefas**:
- [ ] Setup Vitest (unit tests)
- [ ] Setup Playwright (E2E)
- [ ] Testes unitários:
  - Services
  - Hooks
  - Utils
- [ ] Testes de integração:
  - API endpoints
  - Workflows
- [ ] Testes E2E:
  - Login
  - Criar deal
  - Enviar mensagem
  - Executar workflow
- [ ] CI/CD (GitHub Actions)

**Arquivos a Criar**:
- `vitest.config.ts`
- `playwright.config.ts`
- `tests/` (pasta de testes)
- `.github/workflows/test.yml`

**Critérios de Aceitação**:
- ✅ Cobertura > 50%
- ✅ E2E principais fluxos
- ✅ CI roda testes automaticamente

---

#### 10.5. Acessibilidade (A11y) 🟢 P3
**Duração**: 1.5 dias  
**Descrição**: Melhorar acessibilidade

**Subtarefas**:
- [ ] Adicionar ARIA labels
- [ ] Navegação por teclado (tab, enter, esc)
- [ ] Skip links
- [ ] Focus indicators
- [ ] Contraste de cores (WCAG AA)
- [ ] Screen reader friendly
- [ ] Testar com Lighthouse Accessibility

**Arquivos a Modificar**:
- Todos componentes interativos

**Critérios de Aceitação**:
- ✅ Lighthouse A11y score > 90
- ✅ Navegação por teclado funciona
- ✅ Screen readers funcionam

---

#### 10.6. Internacionalização (i18n) 🟢 P3
**Duração**: 1 dia  
**Descrição**: Suporte a múltiplos idiomas

**Subtarefas**:
- [ ] Integrar react-i18next
- [ ] Criar arquivos de tradução (pt-BR, en-US, es-ES)
- [ ] Traduzir todas strings
- [ ] Seletor de idioma
- [ ] Persistir preferência
- [ ] Formatar datas/moedas por locale

**Arquivos a Criar**:
- `src/locales/pt-BR.json`
- `src/locales/en-US.json`
- `src/locales/es-ES.json`
- `src/i18n.ts`

**Critérios de Aceitação**:
- ✅ App funciona em 3 idiomas
- ✅ Troca de idioma funciona
- ✅ Formatos respeitam locale

---

**📊 Progresso Fase 10**: 0/6 tarefas (0%)

---

## 📊 RESUMO DE TODAS AS FASES

| Fase | Nome | Tarefas | Status | Dias |
|------|------|---------|--------|------|
| 1 | Core System | - | ✅ Completo | - |
| 2 | Realtime & WebSockets | 8 | ✅ Completo | - |
| 3 | AI Features | 3 | ✅ Completo | - |
| 4 | Integrações | 4 | ✅ Completo | - |
| **5** | **Fundação e Segurança** | **7** | ⏳ Pendente | **10** |
| **6** | **Dados Reais** | **5** | ⏳ Pendente | **5** |
| **7** | **Notificações** | **4** | ⏳ Pendente | **4** |
| **8** | **Analytics** | **4** | ⏳ Pendente | **5** |
| **9** | **Integrações Externas** | **6** | ⏳ Pendente | **6** |
| **10** | **Polimento** | **6** | ⏳ Pendente | **10** |
| **TOTAL** | - | **52** | **23.5%** | **40** |

---

## 🎯 PRIORIZAÇÃO RECOMENDADA

### Curto Prazo (Semana 1-2) - MVP Produção
**Objetivo**: Tornar o sistema utilizável em produção

1. ✅ Sistema de Roles e Permissões (5.1)
2. ✅ Auditoria de Ações (5.2)
3. ✅ Configurações da Empresa (5.4)
4. ✅ Dashboard com Dados Reais (6.1)
5. ✅ Funil de Vendas com Dados Reais (6.2)
6. ✅ Sistema de Notificações (7.1)

**Total**: 6 dias

### Médio Prazo (Semana 3-4) - Funcionalidades Essenciais
**Objetivo**: Completar funcionalidades core

7. ✅ 2FA (5.3)
8. ✅ Backup e Restore (5.5)
9. ✅ Kanban com Backend (6.3)
10. ✅ Histórico de Conversas (6.4)
11. ✅ Notas Internas (7.2)
12. ✅ Templates de Mensagens (7.3)
13. ✅ Dashboard Analytics (8.1)

**Total**: 8 dias

### Longo Prazo (Semana 5-8) - Aprimoramento
**Objetivo**: Integrações e polimento

14-22. Restante das tarefas (integrações, mobile, testes)

**Total**: 26 dias

---

## 🚀 COMO IMPLEMENTAR

### Metodologia

1. **Desenvolvimento Iterativo**: Uma fase por vez
2. **Testes Contínuos**: Testar cada funcionalidade antes de seguir
3. **Deploy Incremental**: Deploy a cada fase completa
4. **Feedback Loop**: Coletar feedback após cada fase

### Workflow de Desenvolvimento

```
1. Selecionar tarefa da fase atual
2. Criar branch: feature/[fase]-[tarefa]
3. Implementar backend (se necessário)
4. Implementar frontend
5. Testar localmente
6. Code review
7. Merge para develop
8. Deploy em staging
9. Testar em staging
10. Deploy em produção (fim da fase)
```

### Ferramentas

- **Controle de Versão**: Git + GitHub
- **Gerenciamento de Tarefas**: GitHub Projects ou Jira
- **CI/CD**: GitHub Actions
- **Monitoramento**: Sentry, LogRocket
- **Analytics**: Google Analytics, Mixpanel

---

## 📈 MÉTRICAS DE SUCESSO

### Por Fase

- **Fase 5**: Sistema seguro para produção (100% das tarefas críticas)
- **Fase 6**: 0% de mock data nas páginas principais
- **Fase 7**: 90% de notificações funcionando
- **Fase 8**: Dashboard de analytics completo
- **Fase 9**: 5+ integrações funcionais
- **Fase 10**: Lighthouse score > 85, cobertura de testes > 50%

### Gerais

- **Uptime**: > 99.5%
- **Performance**: LCP < 2.5s
- **Satisfação**: NPS > 50
- **Bugs Críticos**: < 5 por semana
- **Tempo de Resposta API**: < 500ms (p95)

---

## 🆘 CONTINGÊNCIA

### Se Atrasos Ocorrerem

1. **Repriorizar**: Focar em P1 (alta prioridade)
2. **Simplificar**: Reduzir escopo de tarefas P3
3. **Paralelizar**: Dividir tarefas entre desenvolvedores
4. **Iterar**: Entregar MVP e melhorar depois

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Atrasos em integrações externas | Alta | Médio | Começar cedo, ter fallbacks |
| Complexidade de permissões | Média | Alto | Usar library pronta (ex: CASL) |
| Performance com dados reais | Média | Alto | Otimizar queries, adicionar indexes |
| Bugs em produção | Alta | Alto | Testes automatizados, monitoramento |

---

## 🎉 CONCLUSÃO

Este plano de ação cobre **52 tarefas** divididas em **6 fases** ao longo de **~40 dias de trabalho**.

**Próximos Passos**:
1. ✅ Aprovar este plano
2. ✅ Iniciar Fase 5 (Fundação e Segurança)
3. ✅ Configurar ferramentas de gestão (GitHub Projects)
4. ✅ Definir sprints de 1 semana
5. ✅ Começar implementação!

---

**Plano de Ação gerado em**: 2025-01-15  
**Responsável**: Equipe de Desenvolvimento PrimeZapAI  
**Revisão**: Mensal

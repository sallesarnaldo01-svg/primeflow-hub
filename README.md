# PrimeZapAI - Sistema CRM & Omnichannel

Sistema completo de CRM e atendimento omnichannel desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix)
- **Animações**: Framer Motion
- **Routing**: React Router v6
- **Estado Global**: Zustand
- **Fetch/Cache**: TanStack Query
- **Calendário**: FullCalendar
- **Validação**: Zod
- **Ícones**: Lucide React

## 📋 Funcionalidades Implementadas

### ✅ Core System
- [x] Sistema de design moderno e responsivo
- [x] Tema claro/escuro com persistência
- [x] Animações suaves entre páginas
- [x] Layout responsivo (mobile-first)
- [x] Loading screens e skeletons

### ✅ Autenticação & Sessão
- [x] Login com e-mail/senha
- [x] Interface para SSO (Google/Apple)
- [x] Validação em tempo real
- [x] Gerenciamento de sessão
- [x] Proteção de rotas

### ✅ Dashboard
- [x] Métricas executivas em tempo real
- [x] Cards interativos com drill-down
- [x] Pipeline de vendas
- [x] Atividades recentes
- [x] Tarefas do dia

### ✅ CRM/Kanban
- [x] Board de vendas por estágios
- [x] Cards de deals com informações completas
- [x] Filtros e busca
- [x] Arrastar e soltar (UI pronta)
- [x] Ações rápidas

### ✅ Atendimentos (Omnichannel)
- [x] Lista de conversas
- [x] Interface de chat tipo WhatsApp
- [x] Múltiplos canais (WhatsApp/Instagram/Facebook)
- [x] Status de atendimento
- [x] Respostas rápidas (UI)

### 🚧 Em Desenvolvimento
- [ ] Funil de Vendas (Analytics)
- [ ] Agendamentos (Calendário)
- [ ] Chamadas (Vídeo/Áudio)
- [ ] Tickets (Suporte)
- [ ] Gestão de Empresas
- [ ] Tags e Etiquetas
- [ ] Workflows (Automação)
- [ ] Integrações
- [ ] IA (Sugestões/Resumos)
- [ ] Financeiro
- [ ] Configurações Avançadas

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Setup
```bash
# Clone o repositório
git clone <seu-repo-url>
cd primezapai-frontend

# Instale as dependências
npm install

# Execute o ambiente de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificação ESLint
npm run typecheck    # Verificação TypeScript
```

## 📁 Estrutura do Projeto

```
src/
├── assets/          # Imagens, logos, ícones
├── components/      # Componentes reutilizáveis
│   ├── ui/         # shadcn/ui components
│   └── layout/     # Header, Sidebar, Layout
├── hooks/          # Custom React hooks
├── lib/            # Utilitários (utils, constants)
├── pages/          # Páginas da aplicação
├── stores/         # Zustand stores (auth, ui, theme)
├── types/          # Definições TypeScript
└── services/       # Chamadas API (futuro)
```

## 🎨 Design System

O sistema utiliza tokens semânticos definidos em `src/index.css`:

### Cores Principais
- **Primary**: Azul royal moderno (`hsl(234 89% 74%)`)
- **Secondary**: Verde sucesso (`hsl(142 76% 36%)`)
- **Accent**: Roxo elegante (`hsl(269 97% 85%)`)

### Gradientes
- `gradient-primary`: Primary + Accent
- `gradient-secondary`: Secondary + Primary
- `gradient-subtle`: Fundo sutil

### Componentes
Todos os componentes seguem o design system e são totalmente customizáveis via CSS Variables.

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# API Base URL (quando backend estiver disponível)
VITE_API_BASE_URL=http://localhost:3001

# Social Login (para implementação futura)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APPLE_CLIENT_ID=your_apple_client_id
```

### Configuração do MSW (Mocks)
Para ativar os mocks locais durante desenvolvimento:

```bash
# Instalar MSW
npm install -D msw

# Inicializar service worker
npx msw init public/
```

## 📱 Responsividade

O sistema é **mobile-first** com breakpoints:
- **XS**: 0-639px (Mobile)
- **SM**: 640-767px (Mobile Large)  
- **MD**: 768-1023px (Tablet)
- **LG**: 1024-1279px (Desktop)
- **XL**: 1280px+ (Desktop Large)

### Características Mobile
- Drawer de navegação
- Componentes tocáveis ≥44px
- Swipe actions em listas
- Teclados móveis otimizados

## ♿ Acessibilidade

- **ARIA**: Labels, roles e states apropriados
- **Navegação**: Suporte completo ao teclado
- **Contraste**: AA/AAA nos componentes
- **Screen Readers**: Compatibilidade total
- **Focus Management**: Foco visível e lógico

## 🚀 Performance

### Otimizações Implementadas
- Code splitting por rotas
- Lazy loading de componentes
- Otimização de imagens
- Cache inteligente (TanStack Query)
- Tree shaking automático
- Minificação e compressão

### Metas de Performance
- **Lighthouse Score**: ≥90 em todas as métricas
- **FCP**: <1.5s
- **LCP**: <2.5s
- **Bundle Size**: <500KB (gzipped)

## 🔒 Segurança

### Frontend Security
- Sanitização de HTML em rich-text
- Validação client-side (Zod)
- Proteção XSS em inputs
- Headers de segurança
- HTTPS obrigatório em produção

### LGPD Compliance
- Consentimentos granulares
- Direito ao esquecimento
- Portabilidade de dados
- Auditoria de acessos

## 🐛 Debug e Logs

### Console Logs
O sistema inclui logs estruturados:
```typescript
// Exemplo de log
console.log('[AUTH]', 'User login attempt', { email, timestamp });
```

### Debug Mode
Para ativar modo debug:
```bash
VITE_DEBUG=true npm run dev
```

## 📊 Monitoramento

### Métricas Coletadas
- Performance (Core Web Vitals)
- Erros JavaScript
- Interações do usuário
- Tempo de sessão
- Conversões

## 🤝 Contribuição

### Padrões de Código
- **TypeScript strict mode**
- **ESLint + Prettier**
- **Conventional Commits**
- **Husky pre-commit hooks**

### Pull Request
1. Fork o projeto
2. Crie uma branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Projeto proprietário - Todos os direitos reservados.

## 📞 Suporte

- **Email**: suporte@primezapai.com
- **Discord**: [PrimeZapAI Community](#)
- **Docs**: [Documentação Completa](#)

---

**PrimeZapAI** - Transformando o atendimento ao cliente com inteligência artificial 🚀
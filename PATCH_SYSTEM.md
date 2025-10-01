# 🔧 Sistema de Patches PrimeFlow

Sistema completo de criação, aplicação e rollback de patches para deploy em produção.

## 📋 Visão Geral

Este sistema permite atualizar instalações do PrimeFlow em produção de forma segura e controlada, com:
- ✅ Versionamento automático
- ✅ Backups automáticos antes de aplicar patches
- ✅ Verificação de integridade (checksums)
- ✅ Rollback seguro em caso de problemas
- ✅ Health checks automáticos
- ✅ Migrações de banco de dados inclusas

## 🚀 Comandos Disponíveis

### Ver Status e Ajuda
```bash
make help              # Listar todos os comandos disponíveis
make patch-status      # Ver versão atual e patches disponíveis
```

### Criar um Patch
```bash
# Criar patch com a versão atual (do arquivo VERSION)
make create-patch

# Criar patch com versão específica
make create-patch VERSION=2.3.0
```

### Aplicar um Patch
```bash
# Aplicar patch em produção
make apply-patch VERSION=2.3.0
```

### Rollback
```bash
# Reverter para versão anterior
make rollback-patch VERSION=2.3.0
```

## 📦 Estrutura de um Patch

Cada patch criado contém:

```
patches/v2.3.0/
├── patch-v2.3.0.tar.gz    # Arquivos do projeto compactados
├── checksum.md5            # Hash para verificação de integridade
├── README.md               # Documentação do patch
├── CHANGELOG.md            # Lista de mudanças
└── schema.sql              # SQL das mudanças no banco
```

## 🔄 Fluxo de Trabalho

### 1. Desenvolvimento
```bash
# Trabalhe normalmente no seu projeto
git add .
git commit -m "feat: nova funcionalidade"
```

### 2. Criar Patch
```bash
# Quando estiver pronto para deploy
make create-patch VERSION=2.3.0
```

O sistema irá:
- Criar diretório `patches/v2.3.0/`
- Copiar todos os arquivos relevantes (excluindo node_modules, .git, etc)
- Incluir migrações do Prisma
- Gerar checksum MD5
- Criar documentação automática

### 3. Distribuir Patch
```bash
# Upload para servidor (exemplo com SCP)
scp -r patches/v2.3.0 user@server:/path/to/primeflow/patches/

# Ou via rsync
rsync -avz patches/v2.3.0/ user@server:/path/to/primeflow/patches/v2.3.0/
```

### 4. Aplicar em Produção
```bash
# No servidor de produção
cd /path/to/primeflow
make apply-patch VERSION=2.3.0
```

O sistema irá:
1. ✅ Verificar integridade do patch (checksum)
2. ✅ Parar todos os serviços
3. ✅ Criar backup completo (código + banco)
4. ✅ Aplicar novos arquivos
5. ✅ Instalar dependências
6. ✅ Executar migrações do banco
7. ✅ Build do projeto
8. ✅ Reiniciar serviços
9. ✅ Health check automático

### 5. Verificar Deploy
```bash
# Ver logs dos serviços
make logs

# Ver status dos containers
make ps

# Testar API
curl http://localhost:3001/health
```

### 6. Rollback (se necessário)
```bash
# Se algo der errado
make rollback-patch VERSION=2.3.0
```

## 🔐 Segurança e Backup

### Backups Automáticos
Cada aplicação de patch cria um backup completo em:
```
backups/pre-patch-v2.3.0_20250101_143022/
├── apps/              # Código da API e Worker
├── src/               # Frontend
├── prisma/            # Schema e migrações
├── database.sql       # Dump completo do banco
└── VERSION            # Versão anterior
```

### Verificação de Integridade
- Checksums MD5 são verificados antes de aplicar patches
- Health checks automáticos após aplicação
- Rollback automático se health check falhar

## 📝 Exemplos Práticos

### Exemplo 1: Deploy Simples
```bash
# No ambiente de desenvolvimento
make create-patch VERSION=2.3.0

# Transferir para produção
scp -r patches/v2.3.0 prod-server:/app/patches/

# No servidor de produção
ssh prod-server
cd /app
make apply-patch VERSION=2.3.0
```

### Exemplo 2: Deploy com Teste em Staging
```bash
# Criar patch
make create-patch VERSION=2.3.0

# Testar em staging
scp -r patches/v2.3.0 staging-server:/app/patches/
ssh staging-server "cd /app && make apply-patch VERSION=2.3.0"

# Se OK, aplicar em produção
scp -r patches/v2.3.0 prod-server:/app/patches/
ssh prod-server "cd /app && make apply-patch VERSION=2.3.0"
```

### Exemplo 3: Rollback de Emergência
```bash
# Se algo der errado após deploy
ssh prod-server
cd /app
make rollback-patch VERSION=2.3.0

# Sistema volta automaticamente para versão anterior
```

## 🛠️ Troubleshooting

### Problema: Health check falhou
```bash
# Ver logs detalhados
make logs

# Verificar status dos containers
make ps

# Se necessário, fazer rollback
make rollback-patch VERSION=2.3.0
```

### Problema: Erro nas migrações
```bash
# Ver logs do banco
make logs SERVICE=postgres

# Se necessário, rollback manual
make rollback-patch VERSION=2.3.0
```

### Problema: Serviços não iniciam
```bash
# Verificar Docker
docker compose -f docker/docker-compose.yml ps

# Reiniciar serviços
make restart

# Se persistir, rollback
make rollback-patch VERSION=2.3.0
```

## 📊 Melhores Práticas

### Antes de Criar Patch
- ✅ Testar completamente em desenvolvimento
- ✅ Executar `make preflight` (lint + typecheck)
- ✅ Documentar mudanças em PATCH_CHANGELOG.md
- ✅ Incrementar versão seguindo [Semantic Versioning](https://semver.org/)

### Antes de Aplicar em Produção
- ✅ Testar patch em ambiente de staging
- ✅ Verificar espaço em disco para backups
- ✅ Notificar usuários sobre manutenção (se necessário)
- ✅ Ter plano de rollback pronto

### Após Aplicar Patch
- ✅ Monitorar logs por pelo menos 30 minutos
- ✅ Verificar funcionalidades críticas
- ✅ Manter backup por pelo menos 7 dias
- ✅ Documentar problemas encontrados

## 🔢 Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (x.0.0): Mudanças incompatíveis na API
- **MINOR** (0.x.0): Novas funcionalidades compatíveis
- **PATCH** (0.0.x): Correções de bugs

Exemplos:
```bash
make create-patch VERSION=2.3.0   # Nova funcionalidade
make create-patch VERSION=2.2.1   # Correção de bug
make create-patch VERSION=3.0.0   # Breaking change
```

## 📁 Estrutura de Arquivos

```
.
├── VERSION                      # Versão atual do projeto
├── PATCH_SYSTEM.md             # Esta documentação
├── PATCH_CHANGELOG.md          # Changelog das mudanças
├── Makefile                    # Comandos make
├── scripts/
│   ├── create-patch.sh         # Script de criação
│   ├── apply-patch.sh          # Script de aplicação
│   └── rollback-patch.sh       # Script de rollback
├── patches/                    # Patches criados
│   ├── v2.2.0/
│   ├── v2.3.0/
│   └── ...
└── backups/                    # Backups automáticos
    ├── pre-patch-v2.3.0_20250101_143022/
    └── ...
```

## 🎯 Checklist de Deploy

### Pré-Deploy
- [ ] Código testado e validado
- [ ] `make preflight` passou sem erros
- [ ] PATCH_CHANGELOG.md atualizado
- [ ] Versão incrementada corretamente
- [ ] Patch criado e verificado
- [ ] Patch testado em staging

### Durante Deploy
- [ ] Notificar usuários (se necessário)
- [ ] Aplicar patch em produção
- [ ] Aguardar health check
- [ ] Verificar logs iniciais
- [ ] Testar funcionalidades críticas

### Pós-Deploy
- [ ] Monitorar logs (30min)
- [ ] Confirmar todas as funcionalidades
- [ ] Atualizar documentação
- [ ] Notificar sucesso do deploy
- [ ] Manter backup acessível

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `make logs`
2. Consulte esta documentação
3. Execute rollback se necessário: `make rollback-patch VERSION=X.X.X`
4. Entre em contato com a equipe de desenvolvimento

---

**Versão do Sistema de Patches:** 1.0.0
**Última atualização:** 2025-01-01

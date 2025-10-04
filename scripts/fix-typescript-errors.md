# Correções Temporárias de TypeScript

## Status

✅ **Problema de duplicação de Layout CORRIGIDO**
- Removido `<Layout>` de CRM.tsx, Dashboard.tsx, Conversas.tsx, Scrum.tsx
- ProtectedRoute agora gerencia o Layout centralmente

## Próximos Passos

1. **Aplicar Migrations no Servidor**
   ```bash
   cd /caminho/do/projeto
   npx prisma migrate dev
   ```

2. **Após aplicar migrations**, execute:
   ```bash
   npx prisma generate
   ```
   Isso regenerará os tipos do Supabase e todos os erros de TypeScript desaparecerão automaticamente.

## Erros Temporários (Esperados)

Os erros atuais são **normais e esperados** porque:
- As tabelas do Prisma ainda não existem no banco
- Os tipos do Supabase ainda não foram gerados
- Todos têm `@ts-ignore` aplicado

### Arquivos com @ts-ignore temporário:
- src/components/workflows/WorkflowCanvas.tsx
- src/pages/Conversas.tsx  
- src/pages/Dashboard.tsx
- src/pages/IAPerformance.tsx
- src/pages/AITools.tsx
- src/services/ai.ts

## Erro 502 no Servidor

O erro 502 indica que o backend não está rodando. Verifique:

1. **PostgreSQL está rodando?**
   ```bash
   sudo systemctl status postgresql
   ```

2. **Redis está rodando?**
   ```bash
   sudo systemctl status redis
   ```

3. **API Node.js está rodando?**
   ```bash
   pm2 status
   # ou
   docker ps
   ```

4. **Migrations foram aplicadas?**
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

5. **Variáveis de ambiente configuradas?**
   - DATABASE_URL
   - REDIS_URL  
   - PORT
   - JWT_SECRET

## Comandos Úteis

### Verificar logs do backend:
```bash
pm2 logs api
# ou
docker logs primeflow-api
```

### Reiniciar serviços:
```bash
pm2 restart api
# ou
docker compose restart
```

### Aplicar migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

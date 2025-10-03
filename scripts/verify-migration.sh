#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verificando integridade do banco de dados..."
echo ""

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ DATABASE_URL não está configurada${NC}"
  exit 1
fi

# Verificar tabelas criadas
echo "📊 Verificando tabelas..."
TABLES=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")
echo -e "${GREEN}✅ $TABLES tabelas criadas no schema public${NC}"

# Listar tabelas principais
echo ""
echo "📋 Tabelas principais:"
psql "$DATABASE_URL" -c "\dt" | grep -E "(tenants|users|contacts|conversations|messages|deals|flows|ai_usage|knowledge_documents|products)" || echo -e "${YELLOW}⚠️  Algumas tabelas podem estar faltando${NC}"

# Verificar RLS (Row Level Security)
echo ""
echo "🔒 Verificando RLS..."
RLS_ENABLED=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM pg_tables WHERE schemaname='public' AND rowsecurity='t'")
echo -e "${GREEN}✅ $RLS_ENABLED tabelas com RLS habilitado${NC}"

# Verificar Storage buckets (via API Supabase)
echo ""
echo "📦 Verificando Storage buckets..."

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo -e "${YELLOW}⚠️  SUPABASE_URL ou SUPABASE_ANON_KEY não configurados${NC}"
else
  BUCKETS=$(curl -s "$SUPABASE_URL/rest/v1/rpc/list_buckets" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    2>/dev/null)
  
  if [ $? -eq 0 ]; then
    echo "$BUCKETS" | jq -r '.[].name' 2>/dev/null | while read bucket; do
      echo -e "${GREEN}✅ Bucket: $bucket${NC}"
    done || echo -e "${YELLOW}⚠️  Não foi possível listar buckets${NC}"
  else
    echo -e "${YELLOW}⚠️  Erro ao conectar com Supabase Storage${NC}"
  fi
fi

# Verificar Edge Functions (listar arquivos)
echo ""
echo "⚡ Verificando Edge Functions..."
if [ -d "supabase/functions" ]; then
  for func in supabase/functions/*/; do
    func_name=$(basename "$func")
    if [ -f "$func/index.ts" ]; then
      echo -e "${GREEN}✅ Edge Function: $func_name${NC}"
    fi
  done
else
  echo -e "${YELLOW}⚠️  Diretório supabase/functions não encontrado${NC}"
fi

# Verificar triggers e functions do banco
echo ""
echo "⚙️  Verificando triggers e functions..."
FUNCTIONS=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')")
TRIGGERS=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM pg_trigger WHERE tgname NOT LIKE 'RI_%'")
echo -e "${GREEN}✅ $FUNCTIONS functions criadas${NC}"
echo -e "${GREEN}✅ $TRIGGERS triggers criados${NC}"

echo ""
echo "✅ Verificação concluída!"

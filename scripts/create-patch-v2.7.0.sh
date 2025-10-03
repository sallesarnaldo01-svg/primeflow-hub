#!/bin/bash

VERSION="2.7.0"
PATCH_NAME="primeflow-ai-complete-${VERSION}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/${TIMESTAMP}"

echo "🚀 Criando Patch Completo v${VERSION}"
echo "======================================"

# 1. Criar estrutura de diretórios
mkdir -p patches/${PATCH_NAME}/{backend,worker,frontend,supabase,scripts}

# 2. Copiar novos arquivos backend
echo "📦 Copiando arquivos backend..."
cp -r apps/api/src/controllers/{ai-tools,knowledge,followup-cadence,products,custom-fields,ai-usage,conversation-events}.controller.ts \
  patches/${PATCH_NAME}/backend/controllers/

cp -r apps/api/src/routes/{ai-tools,knowledge,followup-cadence,products,custom-fields,ai-usage,conversation-events}.routes.ts \
  patches/${PATCH_NAME}/backend/routes/

# 3. Copiar workers
echo "⚙️  Copiando workers..."
cp -r apps/worker/src/processors/{knowledge,followup-cadence,bulk-ai}.processor.ts \
  patches/${PATCH_NAME}/worker/processors/

cp -r apps/worker/src/queues/{knowledge,followup-cadence,bulk-ai}.queue.ts \
  patches/${PATCH_NAME}/worker/queues/

cp apps/worker/src/executors/function-call.executor.ts \
  patches/${PATCH_NAME}/worker/executors/

# 4. Copiar frontend
echo "🎨 Copiando frontend..."
cp -r src/pages/{AITools,KnowledgeBase,FollowUp,Produtos,CamposCustomizados}.tsx \
  patches/${PATCH_NAME}/frontend/pages/

cp -r src/services/{aiTools,knowledge,followupCadence,products,customFields,aiUsage,conversationEvents}.ts \
  patches/${PATCH_NAME}/frontend/services/

# 5. Copiar edge functions
echo "☁️  Copiando edge functions..."
cp -r supabase/functions/{ai-function-call,rag-search} \
  patches/${PATCH_NAME}/supabase/functions/

# 6. Schema atualizado
cp prisma/schema.prisma patches/${PATCH_NAME}/prisma/

# 7. Criar README do patch
cat > patches/${PATCH_NAME}/README.md << 'EOF'
# PrimeFlow AI Complete v2.7.0

## 🎯 Funcionalidades Implementadas

### Módulo 1: Function Calling Dinâmico
- ✅ Backend: Controller + Routes para AI Tools
- ✅ Worker: Executor de Function Calling
- ✅ Frontend: Página AITools.tsx com CRUD completo
- ✅ Edge Function: ai-function-call

### Módulo 2: Base de Conhecimento RAG
- ✅ Backend: Controller + Routes para Knowledge
- ✅ Worker: Processor de documentos com embeddings
- ✅ Frontend: Página KnowledgeBase.tsx
- ✅ Edge Function: rag-search

### Módulo 3: Cadências de Follow-up
- ✅ Backend: Controller + Routes para Cadences
- ✅ Worker: Processor de cadências automáticas
- ✅ Frontend: Página FollowUp.tsx

### Módulo 4: Produtos com Tags para IA
- ✅ Backend: Controller + Routes para Products
- ✅ Frontend: Página Produtos.tsx (a criar)

### Módulo 5: Bulk AI
- ✅ Worker: Processor de ações em massa com IA

### Módulo 6: Campos Customizados
- ✅ Backend: Controller + Routes
- ✅ Frontend: Service

### Módulo 7: Tracking de Uso de IA
- ✅ Backend: Controller para AI Usage
- ✅ Service: aiUsage.ts

### Módulo 8: Timeline de Conversas
- ✅ Backend: Controller para Conversation Events
- ✅ Service: conversationEvents.ts

## 📋 Schema Prisma Atualizado
- AITool, KnowledgeDocument, FollowUpCadence
- Product, ProductImage, CustomField
- AIUsage, ConversationEvent

## 🚀 Instalação

```bash
# 1. Aplicar o patch
make intelligent-patch

# 2. O script irá automaticamente:
# - Criar backup
# - Copiar novos arquivos
# - Aplicar migrações Prisma
# - Reiniciar serviços Docker
```

## ⚠️ Importante
- Todos os controllers já possuem autenticação
- Edge functions usam LOVABLE_API_KEY
- Workers conectados ao Redis/BullMQ
EOF

echo "✅ Patch v${VERSION} criado em patches/${PATCH_NAME}"
echo "📦 Para aplicar: make intelligent-patch"

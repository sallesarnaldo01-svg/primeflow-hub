#!/bin/bash
# Script para remover import de Layout e seus wrappers de todos os arquivos

# Remove import do Layout em todos os arquivos tsx
find src/pages -name "*.tsx" -type f -exec sed -i "/import.*Layout.*from '@\/components\/layout\/Layout';/d" {} \;

# Remove wrappers <Layout> e </Layout> (mantém o conteúdo interno)
find src/pages -name "*.tsx" -type f -exec sed -i 's/<Layout>//g' {} \;
find src/pages -name "*.tsx" -type f -exec sed -i 's/<\/Layout>//g' {} \;

echo "✅ Layout removido de todos os arquivos em src/pages"

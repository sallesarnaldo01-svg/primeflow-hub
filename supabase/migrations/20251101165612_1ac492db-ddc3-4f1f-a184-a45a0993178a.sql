-- =====================================================
-- MÓDULO DE PRÉ-CADASTROS - TABELAS COMPLETAS
-- =====================================================

-- Criar enum para status de pré-cadastro
CREATE TYPE pre_cadastro_status AS ENUM (
  'NOVA_AVALIACAO',
  'EM_ANALISE', 
  'APROVADO',
  'APROVADO_COM_RESTRICAO',
  'REPROVADO',
  'PENDENTE_DOCUMENTACAO',
  'CANCELADO'
);

-- Criar enum para sistema de amortização
CREATE TYPE sistema_amortizacao AS ENUM ('SAC', 'PRICE', 'SACRE');

-- Criar enum para status de documento
CREATE TYPE documento_status AS ENUM (
  'PENDENTE',
  'ENVIADO',
  'AGUARDANDO_APROVACAO',
  'APROVADO',
  'REJEITADO'
);

-- Criar enum para pessoa do documento
CREATE TYPE documento_pessoa AS ENUM ('TITULAR', 'CONJUGE', 'AVALISTA', 'OUTROS');

-- Criar enum para categoria de documento
CREATE TYPE documento_categoria AS ENUM (
  'IDENTIFICACAO',
  'COMPROVANTE_RENDA',
  'COMPROVANTE_RESIDENCIA',
  'CERTIDOES',
  'DOCUMENTOS_IMOVEL',
  'OUTROS'
);

-- =====================================================
-- TABELA: empreendimentos
-- =====================================================
CREATE TABLE public.empreendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  construtora TEXT,
  incorporadora TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  tipo TEXT, -- Residencial, Comercial, Misto
  status TEXT DEFAULT 'ATIVO', -- ATIVO, LANCAMENTO, EM_OBRA, CONCLUIDO, INATIVO
  data_lancamento DATE,
  data_entrega_prevista DATE,
  total_unidades INTEGER,
  unidades_disponiveis INTEGER,
  valor_minimo DECIMAL(15, 2),
  valor_maximo DECIMAL(15, 2),
  imagens JSONB DEFAULT '[]'::jsonb,
  documentos JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_empreendimentos_tenant ON public.empreendimentos(tenant_id);
CREATE INDEX idx_empreendimentos_status ON public.empreendimentos(status);
CREATE INDEX idx_empreendimentos_cidade ON public.empreendimentos(cidade);

-- RLS para empreendimentos
ALTER TABLE public.empreendimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant empreendimentos"
  ON public.empreendimentos FOR SELECT
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Users can create empreendimentos"
  ON public.empreendimentos FOR INSERT
  WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update their tenant empreendimentos"
  ON public.empreendimentos FOR UPDATE
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete their tenant empreendimentos"
  ON public.empreendimentos FOR DELETE
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- =====================================================
-- TABELA: correspondentes (Empresas)
-- =====================================================
CREATE TABLE public.correspondentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT,
  inscricao_estadual TEXT,
  email TEXT,
  telefone TEXT,
  celular TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  responsavel_nome TEXT,
  responsavel_email TEXT,
  responsavel_telefone TEXT,
  banco_credenciado TEXT, -- Caixa, Itaú, Bradesco, etc.
  comissao_padrao DECIMAL(5, 2), -- Percentual
  status TEXT DEFAULT 'ATIVO', -- ATIVO, INATIVO, SUSPENSO
  observacoes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_correspondentes_tenant ON public.correspondentes(tenant_id);
CREATE INDEX idx_correspondentes_status ON public.correspondentes(status);
CREATE INDEX idx_correspondentes_cnpj ON public.correspondentes(cnpj);

-- RLS para correspondentes
ALTER TABLE public.correspondentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant correspondentes"
  ON public.correspondentes FOR SELECT
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Admins can manage correspondentes"
  ON public.correspondentes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- TABELA: correspondentes_usuarios
-- =====================================================
CREATE TABLE public.correspondentes_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  correspondente_id UUID NOT NULL REFERENCES public.correspondentes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  celular TEXT,
  cargo TEXT,
  status TEXT DEFAULT 'ATIVO',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_correspondentes_usuarios_tenant ON public.correspondentes_usuarios(tenant_id);
CREATE INDEX idx_correspondentes_usuarios_correspondente ON public.correspondentes_usuarios(correspondente_id);

-- RLS para correspondentes_usuarios
ALTER TABLE public.correspondentes_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant correspondentes usuarios"
  ON public.correspondentes_usuarios FOR SELECT
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Admins can manage correspondentes usuarios"
  ON public.correspondentes_usuarios FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- TABELA: pre_cadastros
-- =====================================================
CREATE TABLE public.pre_cadastros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  numero TEXT NOT NULL, -- Número sequencial do pré-cadastro
  
  -- Relacionamentos
  lead_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  empreendimento_id UUID REFERENCES public.empreendimentos(id) ON DELETE SET NULL,
  correspondente_id UUID REFERENCES public.correspondentes(id) ON DELETE SET NULL,
  correspondente_usuario_id UUID REFERENCES public.correspondentes_usuarios(id) ON DELETE SET NULL,
  
  -- Localização no empreendimento
  bloco TEXT,
  unidade TEXT,
  
  -- Valores do financiamento
  valor_avaliacao DECIMAL(15, 2) NOT NULL,
  valor_aprovado DECIMAL(15, 2),
  valor_subsidio DECIMAL(15, 2) DEFAULT 0,
  valor_fgts DECIMAL(15, 2) DEFAULT 0,
  valor_entrada DECIMAL(15, 2) DEFAULT 0,
  valor_total DECIMAL(15, 2),
  
  -- Informações de renda
  renda_mensal_bruta DECIMAL(15, 2),
  renda_familiar_bruta DECIMAL(15, 2),
  
  -- Financiamento
  prazo_meses INTEGER,
  valor_prestacao DECIMAL(15, 2),
  taxa_juros DECIMAL(5, 4),
  sistema_amortizacao sistema_amortizacao DEFAULT 'SAC',
  
  -- Status e datas
  status pre_cadastro_status DEFAULT 'NOVA_AVALIACAO',
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_aprovacao TIMESTAMPTZ,
  data_vencimento_aprovacao DATE,
  
  -- Responsáveis
  owner_id UUID, -- Usuário responsável
  corretor_nome TEXT,
  imobiliaria_nome TEXT,
  
  -- Observações
  observacoes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(tenant_id, numero)
);

CREATE INDEX idx_pre_cadastros_tenant ON public.pre_cadastros(tenant_id);
CREATE INDEX idx_pre_cadastros_status ON public.pre_cadastros(status);
CREATE INDEX idx_pre_cadastros_empreendimento ON public.pre_cadastros(empreendimento_id);
CREATE INDEX idx_pre_cadastros_correspondente ON public.pre_cadastros(correspondente_id);
CREATE INDEX idx_pre_cadastros_lead ON public.pre_cadastros(lead_id);
CREATE INDEX idx_pre_cadastros_numero ON public.pre_cadastros(tenant_id, numero);

-- RLS para pre_cadastros
ALTER TABLE public.pre_cadastros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant pre cadastros"
  ON public.pre_cadastros FOR SELECT
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Users can create pre cadastros"
  ON public.pre_cadastros FOR INSERT
  WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update their tenant pre cadastros"
  ON public.pre_cadastros FOR UPDATE
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete their tenant pre cadastros"
  ON public.pre_cadastros FOR DELETE
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- =====================================================
-- TABELA: documentos_pre_cadastro
-- =====================================================
CREATE TABLE public.documentos_pre_cadastro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  pre_cadastro_id UUID NOT NULL REFERENCES public.pre_cadastros(id) ON DELETE CASCADE,
  
  -- Informações do documento
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- RG, CPF, COMPROVANTE_RENDA, etc.
  categoria documento_categoria NOT NULL,
  pessoa documento_pessoa NOT NULL,
  obrigatorio BOOLEAN DEFAULT false,
  
  -- Armazenamento
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  
  -- Status e aprovação
  status documento_status DEFAULT 'PENDENTE',
  uploaded_by UUID,
  aprovado_por UUID,
  data_aprovacao TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documentos_pre_cadastro_tenant ON public.documentos_pre_cadastro(tenant_id);
CREATE INDEX idx_documentos_pre_cadastro_pre_cadastro ON public.documentos_pre_cadastro(pre_cadastro_id);
CREATE INDEX idx_documentos_pre_cadastro_status ON public.documentos_pre_cadastro(status);
CREATE INDEX idx_documentos_pre_cadastro_tipo ON public.documentos_pre_cadastro(tipo);

-- RLS para documentos_pre_cadastro
ALTER TABLE public.documentos_pre_cadastro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant documentos"
  ON public.documentos_pre_cadastro FOR SELECT
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Users can create documentos"
  ON public.documentos_pre_cadastro FOR INSERT
  WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Users can update their tenant documentos"
  ON public.documentos_pre_cadastro FOR UPDATE
  USING (tenant_id::text = current_setting('app.tenant_id', true));

CREATE POLICY "Users can delete their tenant documentos"
  ON public.documentos_pre_cadastro FOR DELETE
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para gerar número automático de pré-cadastro
CREATE OR REPLACE FUNCTION public.generate_pre_cadastro_numero(p_tenant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
  v_ano TEXT;
  v_numero TEXT;
BEGIN
  v_ano := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.pre_cadastros
  WHERE tenant_id = p_tenant_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  v_numero := v_ano || '-' || LPAD(v_count::TEXT, 6, '0');
  
  RETURN v_numero;
END;
$$;

-- Função para calcular percentual de documentos obrigatórios
CREATE OR REPLACE FUNCTION public.calcular_percentual_documentos(p_pre_cadastro_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INTEGER;
  v_completos INTEGER;
  v_percentual INTEGER;
BEGIN
  -- Total de documentos obrigatórios
  SELECT COUNT(*) INTO v_total
  FROM public.documentos_pre_cadastro
  WHERE pre_cadastro_id = p_pre_cadastro_id
    AND obrigatorio = true;
  
  IF v_total = 0 THEN
    RETURN 0;
  END IF;
  
  -- Documentos aprovados
  SELECT COUNT(*) INTO v_completos
  FROM public.documentos_pre_cadastro
  WHERE pre_cadastro_id = p_pre_cadastro_id
    AND obrigatorio = true
    AND status = 'APROVADO';
  
  v_percentual := ROUND((v_completos::DECIMAL / v_total::DECIMAL) * 100);
  
  RETURN v_percentual;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empreendimentos_updated_at
  BEFORE UPDATE ON public.empreendimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_correspondentes_updated_at
  BEFORE UPDATE ON public.correspondentes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_correspondentes_usuarios_updated_at
  BEFORE UPDATE ON public.correspondentes_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pre_cadastros_updated_at
  BEFORE UPDATE ON public.pre_cadastros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documentos_pre_cadastro_updated_at
  BEFORE UPDATE ON public.documentos_pre_cadastro
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET PARA DOCUMENTOS
-- =====================================================

-- Criar bucket para documentos de pré-cadastros
INSERT INTO storage.buckets (id, name, public)
VALUES ('pre-cadastro-documentos', 'pre-cadastro-documentos', false)
ON CONFLICT (id) DO NOTHING;

-- Policies para o bucket
CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pre-cadastro-documentos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their tenant documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pre-cadastro-documentos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pre-cadastro-documentos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pre-cadastro-documentos' AND
    auth.role() = 'authenticated'
  );
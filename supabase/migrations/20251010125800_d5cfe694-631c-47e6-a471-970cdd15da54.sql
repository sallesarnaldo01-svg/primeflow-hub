-- ========================================
-- Criar Administrador Supremo
-- ========================================

-- Esta migração atribui a role 'admin' ao usuário admin@primezap.com
-- IMPORTANTE: O usuário deve se registrar primeiro no sistema

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Busca o user_id do usuário admin@primezap.com
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'admin@primezap.com';
  
  -- Se o usuário existe, atribui a role admin
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Role admin atribuída com sucesso ao usuário admin@primezap.com';
  ELSE
    RAISE NOTICE 'Usuário admin@primezap.com ainda não existe. Registre-se primeiro no sistema.';
  END IF;
END $$;

-- Comentário para referência futura
COMMENT ON TABLE public.user_roles IS 'Tabela de roles - admin@primezap.com é o administrador supremo';
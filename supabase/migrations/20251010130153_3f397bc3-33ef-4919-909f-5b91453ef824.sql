-- ========================================
-- Atribuir Role Admin ao Usuário
-- ========================================

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
    
    RAISE NOTICE 'Role admin atribuída com sucesso!';
  ELSE
    RAISE NOTICE 'Usuário ainda não registrado. Pulando atribuição de role.';
  END IF;
END $$;
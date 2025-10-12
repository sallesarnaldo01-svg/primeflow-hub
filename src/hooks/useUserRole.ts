import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/auth';

export type UserRole = 'admin' | 'manager' | 'seller' | 'support' | 'guest';

export function useUserRole() {
  const { user } = useAuthStore();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data?.map(r => r.role as UserRole) || [];
    },
    enabled: !!user?.id,
  });

  const hasRole = (role: UserRole): boolean => {
    return roles?.includes(role) || false;
  };

  const isAdmin = hasRole('admin');
  const isManager = hasRole('manager') || isAdmin;
  const isSeller = hasRole('seller') || isManager;

  return {
    roles: roles || [],
    isLoading,
    hasRole,
    isAdmin,
    isManager,
    isSeller,
  };
}

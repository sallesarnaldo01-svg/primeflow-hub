import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/auth';

export type AppRole = 'admin' | 'manager' | 'seller' | 'support' | 'guest';

export type Permission = 
  | 'contacts.read' | 'contacts.write' | 'contacts.delete'
  | 'deals.read' | 'deals.write' | 'deals.delete'
  | 'workflows.read' | 'workflows.write' | 'workflows.execute'
  | 'conversations.read' | 'conversations.write'
  | 'settings.read' | 'settings.write'
  | 'users.read' | 'users.write' | 'users.delete'
  | 'reports.read' | 'reports.export'
  | 'audit.read';

export function usePermissions() {
  const { user } = useAuthStore();

  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []).map(r => r.role as AppRole);
    },
    enabled: !!user?.id,
  });

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['role-permissions', userRoles],
    queryFn: async () => {
      if (!userRoles || userRoles.length === 0) return [];
      
      const { data, error } = await supabase
        .from('role_permissions' as any)
        .select('permission')
        .in('role', userRoles);

      if (error) throw error;
      return (data || []).map((p: any) => p.permission as Permission);
    },
    enabled: !!userRoles && userRoles.length > 0,
  });

  const hasRole = (role: AppRole): boolean => {
    return userRoles?.includes(role) || false;
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissions?.includes(permission) || false;
  };

  const hasAnyRole = (roles: AppRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every(perm => hasPermission(perm));
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some(perm => hasPermission(perm));
  };

  const isAdmin = hasRole('admin');
  const isManager = hasRole('manager') || isAdmin;
  const isSeller = hasRole('seller') || isManager;

  return {
    roles: userRoles || [],
    permissions: permissions || [],
    isLoading: rolesLoading || permissionsLoading,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isManager,
    isSeller,
  };
}

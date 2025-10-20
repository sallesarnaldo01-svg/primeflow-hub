import { ReactNode } from 'react';
import { usePermissions, Permission, AppRole } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface PermissionGateProps {
  children: ReactNode;
  permissions?: Permission[];
  roles?: AppRole[];
  requireAll?: boolean; // Se true, requer todas as permissões/roles; se false, requer pelo menos uma
  fallback?: ReactNode;
  showLoader?: boolean;
}

export function PermissionGate({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  showLoader = false,
}: PermissionGateProps) {
  const { hasAllPermissions, hasAnyPermission, hasAnyRole, isLoading } = usePermissions();

  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Verificar roles
  if (roles.length > 0) {
    const hasRequiredRole = hasAnyRole(roles);
    if (!hasRequiredRole) return <>{fallback}</>;
  }

  // Verificar permissões
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasRequiredPermissions) return <>{fallback}</>;
  }

  return <>{children}</>;
}

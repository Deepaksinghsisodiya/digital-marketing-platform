import { useAppSelector } from "../store/hooks";

export const useAuth = () => {
  const { user, isInitialized } = useAppSelector((state) => state.auth);

  const permissions = user?.permissions || [];
  const roles = user?.roles || [];
  const isOwner = roles.includes("Owner");

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (isOwner) return true;
    return permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    return roles.includes(role);
  };

  return {
    user,
    roles,
    permissions,
    isOwner,
    isInitialized,
    hasPermission,
    hasRole,
  };
};

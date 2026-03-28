import { useMemo } from "react";
import { permissionsForRole } from "./permissions";

// Minimal scaffold: permissions come from the current company session.
// Later replace with real auth (JWT) + user profile.
export function usePermissions({ company }) {
  const role = company?.role || "owner";

  const permissions = useMemo(() => {
    return new Set(permissionsForRole(role));
  }, [role]);

  function can(permission) {
    return permissions.has(permission);
  }

  return { role, can };
}

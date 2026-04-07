export const PERMISSIONS = {
  VIEW_DASHBOARD: "view:dashboard",
  VIEW_FINANCIALS: "view:financials",
  VIEW_ASSETS: "view:assets",
  VIEW_OPEX: "view:opex",
  VIEW_REPORTS: "view:reports",
  MANAGE_SETTINGS: "manage:settings",
};

export const ROLES = {
  OWNER: "owner",
  OPS_MANAGER: "ops_manager",
  ANALYST: "analyst",
};

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS),
  [ROLES.OPS_MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_ASSETS,
    PERMISSIONS.VIEW_OPEX,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.ANALYST]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_REPORTS,
  ],
};

export function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

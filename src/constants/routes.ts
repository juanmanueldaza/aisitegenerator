// Application routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SITE_BUILDER: '/builder',
  PREVIEW: '/preview',
  SETTINGS: '/settings',
} as const;

// Route names for navigation
export const ROUTE_NAMES = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.SITE_BUILDER]: 'Site Builder',
  [ROUTES.PREVIEW]: 'Preview',
  [ROUTES.SETTINGS]: 'Settings',
} as const;
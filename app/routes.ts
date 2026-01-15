import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
  // Public routes
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),

  // Protected routes (dashboard layout with /dashboard prefix)
  layout('routes/dashboard/layout.tsx', [
    route('dashboard', 'routes/dashboard/index.tsx'),
    route('dashboard/business-profile', 'routes/dashboard/business-profile.tsx'),
    route('dashboard/ingredients', 'routes/dashboard/ingredients/index.tsx'),
    route('dashboard/ingredients/new', 'routes/dashboard/ingredients/new.tsx'),
    route('dashboard/ingredients/:id/edit', 'routes/dashboard/ingredients/edit.tsx'),
    route('dashboard/ingredients/upload', 'routes/dashboard/ingredients/upload.tsx'),
    route('dashboard/expenses', 'routes/dashboard/expenses/index.tsx'),
    route('dashboard/expenses/new', 'routes/dashboard/expenses/new.tsx'),
    route('dashboard/expenses/:id/edit', 'routes/dashboard/expenses/edit.tsx'),
    // route('dashboard/expenses/upload', 'routes/dashboard/expenses/upload.tsx'), // Removed - replaced by scan-receipt
    // Recipes
    route('dashboard/recipes', 'routes/dashboard/recipes/index.tsx'),
    route('dashboard/recipes/new', 'routes/dashboard/recipes/new.tsx'),
    route('dashboard/recipes/edit', 'routes/dashboard/recipes/edit.tsx'),
    // Sales
    route('dashboard/sales', 'routes/dashboard/sales/index.tsx'),
    route('dashboard/sales/new', 'routes/dashboard/sales/new.tsx'),
    route('dashboard/sales/edit/:id', 'routes/dashboard/sales/edit.tsx'),
    // Purchases
    route('dashboard/purchases', 'routes/dashboard/purchases/index.tsx'),
    route('dashboard/purchases/new', 'routes/dashboard/purchases/new.tsx'),
    // Inventory
    route('dashboard/inventory', 'routes/dashboard/inventory/index.tsx'),
    route('dashboard/inventory/new', 'routes/dashboard/inventory/new.tsx'),
    route('dashboard/inventory/:id', 'routes/dashboard/inventory/period.tsx'),
    // Scan Receipt
    route('dashboard/scan-receipt', 'routes/dashboard/scan-receipt/index.tsx'),
    // Reports
    route('dashboard/reports', 'routes/dashboard/reports/index.tsx'),
    // Admin Panel
    layout('routes/dashboard/admin/layout.tsx', [
      route('dashboard/admin', 'routes/dashboard/admin/index.tsx'),
      route('dashboard/admin/users', 'routes/dashboard/admin/users/index.tsx'),
      route('dashboard/admin/inventory', 'routes/dashboard/admin/inventory/index.tsx'),
      route('dashboard/admin/recipes', 'routes/dashboard/admin/recipes/index.tsx'),
      route('dashboard/admin/sales', 'routes/dashboard/admin/sales/index.tsx'),
      route('dashboard/admin/expenses', 'routes/dashboard/admin/expenses/index.tsx'),
      route('dashboard/admin/reports', 'routes/dashboard/admin/reports/index.tsx'),
      route('dashboard/admin/activity', 'routes/dashboard/admin/activity/index.tsx'),
      route('dashboard/admin/settings', 'routes/dashboard/admin/settings/index.tsx'),
    ]),
  ]),
] satisfies RouteConfig;

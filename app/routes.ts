import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // Public routes
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),

  // Protected routes (dashboard layout with /dashboard prefix)
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route(
      "dashboard/business-profile",
      "routes/dashboard/business-profile.tsx"
    ),
    route("dashboard/ingredients", "routes/dashboard/ingredients/index.tsx"),
    route("dashboard/ingredients/new", "routes/dashboard/ingredients/new.tsx"),
    route(
      "dashboard/ingredients/:id/edit",
      "routes/dashboard/ingredients/edit.tsx"
    ),
    route(
      "dashboard/ingredients/upload",
      "routes/dashboard/ingredients/upload.tsx"
    ),
    route("dashboard/expenses", "routes/dashboard/expenses/index.tsx"),
    route("dashboard/expenses/new", "routes/dashboard/expenses/new.tsx"),
    route("dashboard/expenses/:id/edit", "routes/dashboard/expenses/edit.tsx"),
    route("dashboard/expenses/upload", "routes/dashboard/expenses/upload.tsx"),
    // Recipes
    route("dashboard/recipes", "routes/dashboard/recipes/index.tsx"),
    route("dashboard/recipes/new", "routes/dashboard/recipes/new.tsx"),
    route("dashboard/recipes/edit", "routes/dashboard/recipes/edit.tsx"),
    // Sales
    route("dashboard/sales", "routes/dashboard/sales/index.tsx"),
    route("dashboard/sales/new", "routes/dashboard/sales/new.tsx"),
    // Reports
    route("dashboard/reports", "routes/dashboard/reports/index.tsx"),
  ]),
] satisfies RouteConfig;

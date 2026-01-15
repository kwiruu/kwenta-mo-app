import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  LayoutDashboard,
  Receipt,
  Building2,
  FileText,
  LogOut,
  Menu,
  X,
  ChefHat,
  ShoppingCart,
  Warehouse,
  Scan,
  Shield,
  Users,
  Activity,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { clearTokenCache } from '~/lib/supabase';
import { useAuthStore } from '~/stores/authStore';
import { useBusinessStore } from '~/stores/businessStore';
import { useUserProfile } from '~/hooks/useBusiness';

// Regular user navigation
const userNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Business Profile',
    href: '/dashboard/business-profile',
    icon: Building2,
  },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Warehouse },
  { name: 'Recipes', href: '/dashboard/recipes', icon: ChefHat },
  { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
  { name: 'Sales', href: '/dashboard/sales', icon: ShoppingCart },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Scan', href: '/dashboard/scan-receipt', icon: Scan },
];

// Admin-only navigation (full admin panel)
const adminNavigation = [
  { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Businesses', href: '/dashboard/admin/users', icon: Users },
  { name: 'Inventory', href: '/dashboard/admin/inventory', icon: Warehouse },
  { name: 'Recipes', href: '/dashboard/admin/recipes', icon: ChefHat },
  { name: 'Sales', href: '/dashboard/admin/sales', icon: ShoppingCart },
  { name: 'Expenses', href: '/dashboard/admin/expenses', icon: Receipt },
  { name: 'Reports', href: '/dashboard/admin/reports', icon: FileText },
  { name: 'Activity', href: '/dashboard/admin/activity', icon: Activity },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isImpersonating,
    isLoggingOut,
    stopImpersonation,
    signOut,
  } = useAuthStore();
  const { business } = useBusinessStore();

  // Select navigation based on admin status (when not impersonating)
  const navigation = isAdmin && !isImpersonating ? adminNavigation : userNavigation;

  // Fetch profile from API (includes impersonated user data if impersonating)
  const { data: profile } = useUserProfile();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Redirect admins to admin dashboard if they try to access regular user routes
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin && !isImpersonating) {
      // If admin is on a non-admin route, redirect to admin dashboard
      const isOnAdminRoute = location.pathname.startsWith('/dashboard/admin');
      if (!isOnAdminRoute) {
        navigate('/dashboard/admin', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, isImpersonating, location.pathname, navigate]);

  const handleLogout = async () => {
    // Clear all cached data
    clearTokenCache();
    queryClient.clear();
    await signOut();
    navigate('/login');
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto">
            <DotLottieReact src="/assets/loading.lottie" loop autoplay />
          </div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleExitImpersonation = () => {
    stopImpersonation();
    navigate('/dashboard/admin/users');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-amber-500 text-white py-2 px-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">You are viewing as another user</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitImpersonation}
              className="text-white hover:bg-white/20"
            >
              Exit Impersonation
            </Button>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-gray-100">
            <Link
              to={isAdmin && !isImpersonating ? '/dashboard/admin' : '/dashboard'}
              className="flex items-center"
            >
              <img src="/logo-text.svg" alt="Kwenta MO" className="h-10" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Admin Badge */}
          {isAdmin && !isImpersonating && (
            <div className="px-4 py-2 bg-slate-900 text-white">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                Admin Panel
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 bg-primary-foreground">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== '/dashboard' &&
                  item.href !== '/dashboard/admin' &&
                  location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white border text-greenz'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100 bg-primary-foreground">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <div className="h-[18px] w-[18px] border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-[18px] w-[18px]" />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">
                {business?.businessName || profile?.email || user?.email || 'My Business'}
              </span>
              {business?.businessName && <p className="text-xs text-gray-500">{profile?.email || user?.email}</p>}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 bg-white min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

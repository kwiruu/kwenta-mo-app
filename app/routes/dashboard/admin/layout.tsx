import { Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuthStore } from '~/stores/authStore';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  // Redirect non-admins to dashboard
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Don't render anything if not admin
  if (!isAdmin) {
    return null;
  }

  // Simple pass-through layout - navigation is handled by main dashboard sidebar
  return <Outlet />;
}

import { createBrowserRouter, Navigate } from 'react-router'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import Spinner from '../components/ui/feedback/Spinner'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/admin' replace />,
  },
  {
    Component: AuthLayout,
    children: [
      {
        path: '/login',
        lazy: async () => ({ Component: (await import('../pages/auth/LoginPage')).default }),
      },
    ],
  },
  {
    path: '/admin',
    Component: ProtectedRoute,
    HydrateFallback: () => (
      <section className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </section>
    ),
    children: [
      {
        Component: AdminLayout,
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('../pages/admin/DashboardPage')).default }),
          },
          {
            path: 'dashboard',
            lazy: async () => ({ Component: (await import('../pages/admin/DashboardPage')).default }),
          },
          {
            path: 'items',
            lazy: async () => ({ Component: (await import('../pages/admin/ItemsPage')).default }),
          },
          {
            path: 'items/create',
            lazy: async () => ({ Component: (await import('../pages/admin/CreateItemPage')).default }),
          },
          {
            path: 'items/:id',
            lazy: async () => ({ Component: (await import('../pages/admin/ItemDetailPage')).default }),
          },
          {
            path: 'items/:id/edit',
            lazy: async () => ({ Component: (await import('../pages/admin/EditItemPage')).default }),
          },
          {
            path: 'categories',
            lazy: async () => ({ Component: (await import('../pages/admin/CategoriesPage')).default }),
          },
          {
            path: 'categories/create',
            lazy: async () => ({ Component: (await import('../pages/admin/CreateCategoryPage')).default }),
          },
          {
            path: 'categories/:id',
            lazy: async () => ({ Component: (await import('../pages/admin/CategoryDetailPage')).default }),
          },
          {
            path: 'categories/:id/edit',
            lazy: async () => ({ Component: (await import('../pages/admin/EditCategoryPage')).default }),
          },
          {
            path: 'orders',
            lazy: async () => ({ Component: (await import('../pages/admin/OrdersPage')).default }),
          },
          {
            path: 'orders/:id',
            lazy: async () => ({ Component: (await import('../pages/admin/OrderDetailPage')).default }),
          },
          {
            path: 'users',
            lazy: async () => ({ Component: (await import('../pages/admin/UsersPage')).default }),
          },
          {
            path: 'subscription-plans',
            lazy: async () => ({ Component: (await import('../pages/admin/SubscriptionPlansPage')).default }),
          },
          {
            path: 'subscription-plans/create',
            lazy: async () => ({ Component: (await import('../pages/admin/CreateSubscriptionPlanPage')).default }),
          },
          {
            path: 'subscription-plans/:id',
            lazy: async () => ({ Component: (await import('../pages/admin/SubscriptionPlanDetailPage')).default }),
          },
          {
            path: 'subscription-plans/:id/edit',
            lazy: async () => ({ Component: (await import('../pages/admin/EditSubscriptionPlanPage')).default }),
          },
          {
            path: 'users/:id',
            lazy: async () => ({ Component: (await import('../pages/admin/UserDetailPage')).default }),
          },
          {
            path: 'users/:id/edit',
            lazy: async () => ({ Component: (await import('../pages/admin/EditUserPage')).default }),
          },
        ],
      },
    ],
  },
])

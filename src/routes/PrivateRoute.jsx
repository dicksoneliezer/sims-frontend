import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getHomePath } from '../utils/constants'

export function PrivateRoute({ roles, children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />
  }

  // Kama kuna children (kama ilivyotumika kwenye routes za kawaida), waonyeshe.
  // Kama hakuna children (kama ilivyotumika kwenye Nested Routes), tumia Outlet.
  return children ? children : <Outlet />
}
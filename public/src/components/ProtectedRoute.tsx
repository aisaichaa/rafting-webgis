import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  console.log('ProtectedRoute - Auth State:', { user, loading })

  if (loading) {
    console.log('ProtectedRoute - Loading state')
    return <div>Loading...</div>
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute - User authenticated, rendering children')
  return <>{children}</>
} 
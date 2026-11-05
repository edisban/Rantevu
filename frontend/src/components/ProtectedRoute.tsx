import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'

// Without `role`, any signed-in user may enter
export default function ProtectedRoute({ role, children }: { role?: string; children: ReactElement }) {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')
  if (!token || (role && userRole !== role)) return <Navigate to="/auth" replace />
  return children
}

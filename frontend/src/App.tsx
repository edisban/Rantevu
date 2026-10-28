import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import ClientDashboard from './pages/ClientDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/client/dashboard" element={<ProtectedRoute role="ROLE_CLIENT"><ClientDashboard /></ProtectedRoute>} />
          <Route path="/provider/dashboard" element={<ProtectedRoute role="ROLE_PROVIDER"><ProviderDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute role="ROLE_PROVIDER"><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

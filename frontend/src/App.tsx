import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import ClientDashboard from './pages/ClientDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'
import ProtectedRoute from './components/ProtectedRoute'
import { ChatProvider } from './chat'

export default function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/client/dashboard" element={<ProtectedRoute role="ROLE_CLIENT"><ClientDashboard /></ProtectedRoute>} />
            <Route path="/provider/dashboard" element={<ProtectedRoute role="ROLE_PROVIDER"><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute role="ROLE_PROVIDER"><ProfilePage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </ChatProvider>
    </BrowserRouter>
  )
}

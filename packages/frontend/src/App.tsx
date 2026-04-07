import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import Dashboard from './pages/Dashboard'
import BotManagementPage from './pages/BotManagement'
import TransactionHistoryPage from './pages/TransactionHistory'
import Settings from './pages/Settings'
import BotDetails from './pages/BotDetails'
import TransactionDetails from './pages/TransactionDetails'

const TOASTER_OPTIONS = {
  style: {
    background: '#0a0a0a',
    color: '#fff',
    border: '1px solid rgba(139, 92, 246, 0.3)',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
}

function PrivateAppRoutes() {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/painel" replace />} />
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/bots" element={<BotManagementPage />} />
          <Route path="/bots/:id" element={<BotDetails />} />
          <Route path="/transacoes" element={<TransactionHistoryPage />} />
          <Route path="/transacoes/:id" element={<TransactionDetails />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<PrivateAppRoutes />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-black">
        <AppRoutes />
        <Toaster position="top-right" toastOptions={TOASTER_OPTIONS} />
      </div>
    </Router>
  )
}

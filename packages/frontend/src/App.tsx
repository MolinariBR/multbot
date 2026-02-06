import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import Dashboard from './pages/Dashboard'
import Gerenciamento from './pages/BotManagement'
import HistoricoTransacoes from './pages/TransactionHistory'
import Settings from './pages/Settings'
import BotDetails from './pages/BotDetails'
import TransactionDetails from './pages/TransactionDetails'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Routes>
          {/* Rota de Login (sem Layout) */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas (com Layout) */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/painel" replace />} />
                    <Route path="/painel" element={<Dashboard />} />
                    <Route path="/bots" element={<Gerenciamento />} />
                    <Route path="/bots/:id" element={<BotDetails />} />
                    <Route path="/transacoes" element={<HistoricoTransacoes />} />
                    <Route path="/transacoes/:id" element={<TransactionDetails />} />
                    <Route path="/configuracoes" element={<Settings />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
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
          }}
        />
      </div>
    </Router>
  )
}

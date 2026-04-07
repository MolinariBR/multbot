import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('adminEmail', data.admin.email);
        localStorage.setItem('adminName', data.admin.name);
        setSuccess(true);
        setTimeout(() => navigate('/'), 500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Email ou senha inválidos');
      }
    } catch (err) {
      setError('Falha na conexão: verifique sua internet ou tente novamente mais tarde');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-black to-zinc-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-fuchsia-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/50">
              <Zap className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            MultiBot
          </h1>
          <p className="text-gray-400">Painel de Administração</p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl shadow-2xl border border-violet-500/10 p-8 backdrop-blur-sm">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex gap-3 items-start">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-400 text-sm font-medium">Erro na Autenticação</p>
                <p className="text-red-300 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg flex gap-3 items-start">
              <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-emerald-400 text-sm font-medium">Login Realizado!</p>
                <p className="text-emerald-300 text-xs mt-1">Redirecionando...</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-violet-500/20 text-white rounded-xl placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                required
                disabled={loading || success}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-violet-500/20 text-white rounded-xl placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                required
                disabled={loading || success}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-8 px-4 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Autenticando...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  Login Realizado!
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-8 p-4 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-xl border border-violet-500/20">
            <p className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              🧪 Credenciais de Teste
            </p>
            <div className="space-y-2 text-xs text-gray-300">
              <p><span className="text-violet-400 font-medium">Email:</span> admin@test.com</p>
              <p><span className="text-violet-400 font-medium">Senha:</span> password123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          MultiBot © 2026 • Plataforma de Administração de Bots
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getApiError } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { CornerSprig } from '../components/Botanicals'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { refresh } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/register', { email, password })
      await refresh()
      navigate('/dashboard')
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-vellum flex flex-col">
      <nav className="px-6 py-4 border-b border-border">
        <Link to="/" className="font-serif text-xl text-charcoal">MIRROR</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-between mb-6">
            <CornerSprig />
            <CornerSprig flip />
          </div>
          <h1 className="font-serif text-3xl text-charcoal mb-1">Create account</h1>
          <p className="text-mutedgray text-sm mb-8">Start generating content in minutes</p>
          <form onSubmit={submit} className="space-y-4">
            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-mutedgray text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-charcoal underline underline-offset-2 hover:text-inkwell">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { CornerSprig } from '../components/Botanicals'

interface Job {
  id: number
  status: string
  created_at: string
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/jobs').then(r => { setJobs(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-vellum">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl text-charcoal">MIRROR</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-mutedgray">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-mutedgray hover:text-charcoal">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CornerSprig />
              <h1 className="font-serif text-4xl text-charcoal">Dashboard</h1>
            </div>
            <p className="text-mutedgray">Your content generations</p>
          </div>
          <Link to="/generate" className="btn-primary px-6 py-2.5">
            New generation
          </Link>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mutedgray mb-1">Credits remaining</p>
              <p className="font-serif text-3xl text-charcoal">{user?.credits || 0}</p>
            </div>
            <span className="text-storygreen text-2xl">✦</span>
          </div>
        </div>

        {loading ? (
          <p className="text-mutedgray text-center py-12">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-mutedgray mb-4">No generations yet</p>
            <Link to="/generate" className="btn-secondary px-6 py-2">
              Create your first
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <Link
                key={job.id}
                to={`/result/${job.id}`}
                className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-charcoal mb-1">Generation #{job.id}</p>
                  <p className="text-xs text-mutedgray">
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    job.status === 'completed'
                      ? 'bg-storygreen/10 text-storygreen'
                      : job.status === 'failed'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-border text-mutedgray'
                  }`}
                >
                  {job.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

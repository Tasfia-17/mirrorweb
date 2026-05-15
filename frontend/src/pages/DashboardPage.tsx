import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { CornerSprig } from '../components/Botanicals'

interface Job {
  id: string
  status: string
  created_at: string
  total_outputs?: number
  emotion?: string
  duration_seconds?: number
}

const STATUS_STYLE: Record<string, string> = {
  complete: 'bg-storygreen/10 text-storygreen',
  error: 'bg-red-50 text-red-600',
  running: 'bg-border text-mutedgray',
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/jobs').then(r => { setJobs(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-vellum">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl text-charcoal">MIRROR</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-mutedgray">{user?.email}</span>
          <button onClick={() => logout().then(() => navigate('/login'))} className="text-sm text-mutedgray hover:text-charcoal">Sign out</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1"><CornerSprig /><h1 className="font-serif text-4xl text-charcoal">Dashboard</h1></div>
            <p className="text-mutedgray">Your content generations</p>
          </div>
          <Link to="/generate" className="btn-primary px-6 py-2.5">New generation</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Credits', value: user?.credits ?? 0 },
            { label: 'Total jobs', value: jobs.length },
            { label: 'Completed', value: jobs.filter(j => j.status === 'complete').length },
            { label: 'Total outputs', value: jobs.reduce((s, j) => s + (j.total_outputs || 0), 0) },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-xs text-mutedgray mb-1">{label}</p>
              <p className="font-serif text-2xl text-charcoal">{value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <p className="text-mutedgray text-center py-12">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-mutedgray mb-4">No generations yet</p>
            <Link to="/generate" className="btn-secondary px-6 py-2">Create your first</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <Link key={job.id} to={`/result/${job.id}`}
                className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-medium text-charcoal mb-1">Generation #{job.id.slice(0, 8)}</p>
                  <div className="flex items-center gap-3 text-xs text-mutedgray">
                    <span>{new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    {job.emotion && <span className="capitalize">· {job.emotion}</span>}
                    {job.total_outputs ? <span>· {job.total_outputs} outputs</span> : null}
                    {job.duration_seconds ? <span>· {job.duration_seconds.toFixed(0)}s</span> : null}
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${STATUS_STYLE[job.status] || STATUS_STYLE.running}`}>
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

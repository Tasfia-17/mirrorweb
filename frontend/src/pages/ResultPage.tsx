import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { CornerSprig } from '../components/Botanicals'
import HyperframesPreview from '../components/HyperframesPreview'

interface Job {
  id: number
  status: string
  created_at: string
  result_json?: any
  audio_path?: string
  error?: string
}

export default function ResultPage() {
  const { jobId: id } = useParams<{ jobId: string }>()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = () => {
      api
        .get(`/api/jobs/${id}`)
        .then(r => {
          setJob(r.data)
          setLoading(false)
        })
        .catch(() => {
          setError('Job not found')
          setLoading(false)
        })
    }
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [id])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vellum flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal mb-4"></div>
          <p className="text-mutedgray">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-vellum flex items-center justify-center">
        <div className="text-center">
          <p className="text-mutedgray mb-4">{error || 'Job not found'}</p>
          <Link to="/dashboard" className="btn-secondary px-6 py-2">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vellum">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl text-charcoal">MIRROR</Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-mutedgray hover:text-charcoal">
            Dashboard
          </Link>
          <span className="text-sm text-mutedgray">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-mutedgray hover:text-charcoal">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <CornerSprig />
          <h1 className="font-serif text-4xl text-charcoal">Generation #{job.id}</h1>
        </div>
        <p className="text-mutedgray mb-8">
          Created {new Date(job.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mutedgray mb-1">Status</p>
              <p className="font-serif text-2xl text-charcoal capitalize">{job.status}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                job.status === 'complete'
                  ? 'bg-storygreen/10 text-storygreen'
                  : job.status === 'error'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-border text-mutedgray'
              }`}
            >
              {job.status === 'running' && '⏳ Processing'}
              {job.status === 'complete' && '✓ Complete'}
              {job.status === 'error' && '✗ Failed'}
            </span>
          </div>
        </div>

        {job.status === 'running' && (
          <div className="card p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal mb-4"></div>
            <p className="text-charcoal font-medium mb-2">Generating your content</p>
            <p className="text-sm text-mutedgray">This usually takes 10-15 minutes. Feel free to close this page.</p>
          </div>
        )}

        {job.status === 'error' && (
          <div className="card p-8 bg-red-50 border-red-200">
            <p className="text-red-600 font-medium mb-2">Generation failed</p>
            <pre className="text-xs text-red-600/80 whitespace-pre-wrap overflow-auto max-h-64">
              {job.error || 'An error occurred during processing. Please try again.'}
            </pre>
          </div>
        )}

        {job.status === 'complete' && job.result_json && (() => {
          const r = typeof job.result_json === 'string' ? JSON.parse(job.result_json) : job.result_json
          const videos: Record<string, string> = r.videos || {}
          const translations: Record<string, string> = r.translations || {}
          const scores: Record<string, number> = r.quality_scores || {}
          const scripts: Record<string, string> = r.scripts || {}
          return (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Emotion', value: r.emotion || '—' },
                  { label: 'Videos', value: Object.keys(videos).length },
                  { label: 'Languages', value: Object.keys(translations).length },
                  { label: 'Total outputs', value: r.total_outputs || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="card p-4 text-center">
                    <p className="text-xs text-mutedgray mb-1">{label}</p>
                    <p className="font-serif text-2xl text-charcoal capitalize">{value}</p>
                  </div>
                ))}
              </div>

              {/* Quality scores */}
              {Object.keys(scores).length > 0 && (
                <div className="card p-6">
                  <h2 className="font-serif text-xl text-charcoal mb-4">Quality scores</h2>
                  <div className="space-y-3">
                    {Object.entries(scores).map(([platform, score]) => (
                      <div key={platform} className="flex items-center gap-3">
                        <span className="text-sm text-charcoal w-20 capitalize">{platform}</span>
                        <div className="flex-1 bg-border rounded-full h-2">
                          <div
                            className="bg-storygreen h-2 rounded-full transition-all"
                            style={{ width: `${(score / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-charcoal w-10 text-right">{score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hyperframes live preview */}
              {Object.keys(scripts).length > 0 && (
                <HyperframesPreview scripts={scripts} videos={videos} />
              )}

              {/* Platform videos */}
              {Object.keys(videos).length > 0 && (
                <div className="card p-6">
                  <h2 className="font-serif text-xl text-charcoal mb-4">Platform videos</h2>
                  <div className="space-y-4">
                    {Object.entries(videos).map(([platform, url]) => (
                      <div key={platform} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <span className="font-medium text-charcoal capitalize">{platform}</span>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-storygreen hover:underline flex-shrink-0"
                          >
                            Open video ↗
                          </a>
                        </div>
                        {scripts[platform] && (
                          <p className="text-xs text-mutedgray line-clamp-3">{scripts[platform]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Translations */}
              {Object.keys(translations).length > 0 && (
                <div className="card p-6">
                  <h2 className="font-serif text-xl text-charcoal mb-4">Translations ({Object.keys(translations).length} languages)</h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(translations).map(([lang, url]) => (
                      <a
                        key={lang}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border border-border text-bookgray text-xs px-3 py-1.5 rounded-full hover:border-storygreen hover:text-storygreen transition-colors"
                      >
                        {lang} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimizer insights */}
              {r.optimized_prompts?.improvement?.status === 'improved' && (
                <div className="card p-6 bg-white">
                  <h2 className="font-serif text-xl text-charcoal mb-3">Self-improvement</h2>
                  <p className="text-sm text-mutedgray whitespace-pre-line font-mono text-xs">
                    {r.optimized_prompts.improvement.demo_narrative}
                  </p>
                </div>
              )}
            </div>
          )
        })()}

        <div className="mt-8 flex gap-3">
          <Link to="/dashboard" className="btn-secondary px-6 py-2">
            Back to dashboard
          </Link>
          {job.status === 'complete' && (
            <Link to="/generate" className="btn-primary px-6 py-2">
              New generation
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

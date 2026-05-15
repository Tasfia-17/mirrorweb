import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import HyperframesPreview from '../components/HyperframesPreview'

interface Job {
  id: string
  status: string
  created_at: string
  result_json?: any
  error?: string
}

type Tab = 'videos' | 'scripts' | 'translations' | 'hyperframes' | 'insights'

const PLATFORM_EMOJI: Record<string, string> = {
  linkedin: '💼', tiktok: '🎵', youtube: '▶️', sales: '💰', podcast: '🎙',
}

const INTEGRATIONS = [
  { name: 'Copy script', icon: '📋', action: 'copy' },
  { name: 'Download HTML', icon: '⬇️', action: 'html' },
  { name: 'Share link', icon: '🔗', action: 'share' },
  { name: 'Open video', icon: '▶️', action: 'video' },
]

export default function ResultPage() {
  const { jobId: id } = useParams<{ jobId: string }>()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('videos')
  const [activePlatform, setActivePlatform] = useState<string>('')
  const [editedScript, setEditedScript] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState('')
  const [notif, setNotif] = useState('')

  useEffect(() => {
    const poll = () => api.get(`/api/jobs/${id}`)
      .then(r => { setJob(r.data); setLoading(false) })
      .catch(() => { setLoading(false) })
    poll()
    const t = setInterval(poll, 5000)
    return () => clearInterval(t)
  }, [id])

  const notify = (msg: string) => { setNotif(msg); setTimeout(() => setNotif(''), 2500) }

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    notify(`✓ ${label} copied`)
    setTimeout(() => setCopied(''), 2000)
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-vellum flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal" />
    </div>
  )

  if (!job) return (
    <div className="min-h-screen bg-vellum flex items-center justify-center">
      <div className="text-center">
        <p className="text-mutedgray mb-4">Job not found</p>
        <Link to="/dashboard" className="btn-secondary px-6 py-2">Back</Link>
      </div>
    </div>
  )

  const r = job.result_json
    ? (typeof job.result_json === 'string' ? JSON.parse(job.result_json) : job.result_json)
    : null
  const videos: Record<string, string> = r?.videos || {}
  const translations: Record<string, string> = r?.translations || {}
  const scores: Record<string, number> = r?.quality_scores || {}
  const baseScripts: Record<string, string> = r?.scripts || {}
  const scripts = { ...baseScripts, ...editedScript }
  const platforms = Object.keys(videos)
  const active = activePlatform || platforms[0] || ''

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'videos', label: 'Videos', count: platforms.length },
    { id: 'scripts', label: 'Scripts', count: platforms.length },
    { id: 'hyperframes', label: 'Hyperframes' },
    { id: 'translations', label: 'Translations', count: Object.keys(translations).length },
    { id: 'insights', label: 'Insights' },
  ]

  return (
    <div className="min-h-screen bg-vellum">
      {/* Notification toast */}
      {notif && (
        <div className="fixed top-4 right-4 z-50 bg-charcoal text-white text-sm px-4 py-2 rounded-full shadow-lg transition-all">
          {notif}
        </div>
      )}

      <nav className="border-b border-border px-6 py-4 flex items-center justify-between bg-vellum/95 backdrop-blur sticky top-0 z-40">
        <Link to="/" className="font-serif text-xl text-charcoal">MIRROR</Link>
        <div className="flex items-center gap-3">
          <Link to="/generate" className="btn-primary text-xs px-4 py-1.5">+ New</Link>
          <Link to="/dashboard" className="text-sm text-mutedgray hover:text-charcoal">Dashboard</Link>
          <button onClick={() => logout().then(() => navigate('/login'))} className="text-sm text-mutedgray hover:text-charcoal">Sign out</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl text-charcoal mb-1">
              {r?.emotion ? <span className="capitalize">{r.emotion}</span> : 'Generation'} · {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </h1>
            <div className="flex items-center gap-3 text-sm text-mutedgray">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'complete' ? 'bg-storygreen/10 text-storygreen' : job.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-border text-mutedgray'}`}>
                {job.status === 'running' ? '⏳ Processing' : job.status === 'complete' ? '✓ Complete' : '✗ Failed'}
              </span>
              {r && <span>{platforms.length} videos · {Object.keys(translations).length} languages · {r.total_outputs || 0} total outputs</span>}
            </div>
          </div>
          {job.status === 'complete' && r && (
            <button onClick={() => copy(JSON.stringify(r, null, 2), 'Full result')}
              className="btn-secondary text-xs px-4 py-1.5">Export JSON</button>
          )}
        </div>

        {/* Running state */}
        {job.status === 'running' && (
          <div className="card p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal mb-4" />
            <p className="font-serif text-xl text-charcoal mb-2">Pipeline running…</p>
            <p className="text-sm text-mutedgray">Check back in a few minutes. This page auto-refreshes.</p>
          </div>
        )}

        {/* Error state */}
        {job.status === 'error' && (
          <div className="card p-8 border-red-200 bg-red-50">
            <p className="text-red-600 font-medium mb-3">Generation failed</p>
            <pre className="text-xs text-red-600/80 whitespace-pre-wrap overflow-auto max-h-64 bg-white p-3 rounded-lg border border-red-100">
              {job.error || 'Unknown error'}
            </pre>
            <Link to="/generate" className="btn-primary mt-4 inline-block px-6 py-2">Try again</Link>
          </div>
        )}

        {/* Complete state */}
        {job.status === 'complete' && r && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Emotion', value: r.emotion || '—', emoji: '🎭' },
                { label: 'Videos', value: platforms.length, emoji: '🎬' },
                { label: 'Languages', value: Object.keys(translations).length, emoji: '🌍' },
                { label: 'Outputs', value: r.total_outputs || 0, emoji: '✦' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="card p-4 text-center">
                  <p className="text-lg mb-1">{emoji}</p>
                  <p className="font-serif text-2xl text-charcoal capitalize">{value}</p>
                  <p className="text-xs text-mutedgray">{label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
              {TABS.filter(t => t.id !== 'translations' || Object.keys(translations).length > 0).map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-charcoal text-charcoal' : 'border-transparent text-mutedgray hover:text-charcoal'}`}>
                  {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
                </button>
              ))}
            </div>

            {/* VIDEOS TAB */}
            {tab === 'videos' && (
              <div className="space-y-4">
                {platforms.map(platform => (
                  <div key={platform} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{PLATFORM_EMOJI[platform] || '🎬'}</span>
                        <span className="font-serif text-lg text-charcoal capitalize">{platform}</span>
                        {scores[platform] && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${scores[platform] >= 8 ? 'bg-storygreen/10 text-storygreen' : scores[platform] >= 6 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
                            {scores[platform].toFixed(1)}/10
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => copy(scripts[platform] || '', `${platform} script`)}
                          className="text-xs px-3 py-1.5 border border-border rounded-full hover:border-charcoal transition-colors">
                          {copied === `${platform} script` ? '✓' : '📋'} Copy script
                        </button>
                        <a href={videos[platform]} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 bg-charcoal text-white rounded-full hover:bg-inkwell transition-colors">
                          ▶ Open video
                        </a>
                      </div>
                    </div>
                    {scripts[platform] && (
                      <p className="text-sm text-mutedgray line-clamp-2 border-t border-border pt-3">
                        {scripts[platform]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SCRIPTS TAB — editable */}
            {tab === 'scripts' && (
              <div>
                {/* Platform selector */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {platforms.map(p => (
                    <button key={p} onClick={() => setActivePlatform(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${active === p ? 'bg-charcoal text-white border-charcoal' : 'border-border text-mutedgray hover:border-charcoal hover:text-charcoal'}`}>
                      {PLATFORM_EMOJI[p]} <span className="capitalize">{p}</span>
                    </button>
                  ))}
                </div>

                {active && (
                  <div className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-serif text-lg text-charcoal capitalize">{PLATFORM_EMOJI[active]} {active} script</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditedScript(e => ({ ...e, [active]: baseScripts[active] || '' })); notify('Script reset') }}
                          className="text-xs px-3 py-1.5 border border-border rounded-full hover:border-charcoal transition-colors">Reset</button>
                        <button onClick={() => copy(scripts[active] || '', `${active} script`)}
                          className="text-xs px-3 py-1.5 bg-charcoal text-white rounded-full hover:bg-inkwell transition-colors">
                          {copied === `${active} script` ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="w-full h-48 p-3 text-sm border border-border rounded-lg bg-vellum text-charcoal resize-none focus:outline-none focus:border-charcoal"
                      value={scripts[active] || ''}
                      onChange={e => setEditedScript(prev => ({ ...prev, [active]: e.target.value }))}
                    />
                    <p className="text-xs text-mutedgray mt-2">{(scripts[active] || '').length} characters · edits are local only</p>
                  </div>
                )}
              </div>
            )}

            {/* HYPERFRAMES TAB */}
            {tab === 'hyperframes' && (
              <HyperframesPreview scripts={scripts} videos={videos} />
            )}

            {/* TRANSLATIONS TAB */}
            {tab === 'translations' && (
              <div className="card p-6">
                <p className="text-sm text-mutedgray mb-4">{Object.keys(translations).length} lip-synced language versions of your LinkedIn video</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(translations).map(([lang, url]) => (
                    <div key={lang} className="border border-border rounded-xl p-4 flex items-center justify-between hover:border-charcoal transition-colors">
                      <span className="text-sm font-medium text-charcoal">{lang}</span>
                      <div className="flex gap-2">
                        <button onClick={() => copy(url, lang)} className="text-xs text-mutedgray hover:text-charcoal">🔗</button>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-storygreen hover:underline">▶</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INSIGHTS TAB */}
            {tab === 'insights' && (
              <div className="space-y-4">
                {/* Quality scores */}
                {Object.keys(scores).length > 0 && (
                  <div className="card p-6">
                    <h3 className="font-serif text-lg text-charcoal mb-4">Quality scores</h3>
                    <div className="space-y-3">
                      {Object.entries(scores).sort(([,a],[,b]) => b - a).map(([platform, score]) => (
                        <div key={platform} className="flex items-center gap-3">
                          <span className="text-sm w-6">{PLATFORM_EMOJI[platform]}</span>
                          <span className="text-sm text-charcoal w-20 capitalize">{platform}</span>
                          <div className="flex-1 bg-border rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${score >= 8 ? 'bg-storygreen' : score >= 6 ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{ width: `${score * 10}%` }} />
                          </div>
                          <span className="text-sm font-medium text-charcoal w-10 text-right">{score.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Self-improvement */}
                {r.optimized_prompts?.improvement?.status === 'improved' && (
                  <div className="card p-6">
                    <h3 className="font-serif text-lg text-charcoal mb-3">🔄 Self-improvement loop</h3>
                    <pre className="text-xs text-mutedgray whitespace-pre-wrap bg-vellum p-4 rounded-lg border border-border">
                      {r.optimized_prompts.improvement.demo_narrative}
                    </pre>
                  </div>
                )}

                {/* Integrations */}
                <div className="card p-6">
                  <h3 className="font-serif text-lg text-charcoal mb-4">Share & export</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => copy(window.location.href, 'Page link')}
                      className="flex flex-col items-center gap-2 p-4 border border-border rounded-xl hover:border-charcoal transition-colors">
                      <span className="text-2xl">🔗</span>
                      <span className="text-xs text-charcoal font-medium">Copy link</span>
                    </button>
                    <button onClick={() => copy(Object.values(scripts).join('\n\n---\n\n'), 'All scripts')}
                      className="flex flex-col items-center gap-2 p-4 border border-border rounded-xl hover:border-charcoal transition-colors">
                      <span className="text-2xl">📋</span>
                      <span className="text-xs text-charcoal font-medium">Copy all scripts</span>
                    </button>
                    <button onClick={() => {
                      const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' })
                      const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                      a.download = `mirror-${id?.slice(0,8)}.json`; a.click()
                    }} className="flex flex-col items-center gap-2 p-4 border border-border rounded-xl hover:border-charcoal transition-colors">
                      <span className="text-2xl">⬇️</span>
                      <span className="text-xs text-charcoal font-medium">Download JSON</span>
                    </button>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 border border-border rounded-xl hover:border-charcoal transition-colors">
                      <span className="text-2xl">💼</span>
                      <span className="text-xs text-charcoal font-medium">Share on LinkedIn</span>
                    </a>
                  </div>
                </div>

                {/* Transcript */}
                {r.transcript && (
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-lg text-charcoal">Transcript</h3>
                      <button onClick={() => copy(r.transcript, 'Transcript')} className="text-xs text-mutedgray hover:text-charcoal">📋 Copy</button>
                    </div>
                    <p className="text-sm text-mutedgray leading-relaxed">{r.transcript}</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom actions */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-border">
              <Link to="/dashboard" className="btn-secondary px-6 py-2">← Dashboard</Link>
              <Link to="/generate" className="btn-primary px-6 py-2">+ New generation</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

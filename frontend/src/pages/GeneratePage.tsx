import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api, { getApiError } from '../utils/api'
import { CornerSprig } from '../components/Botanicals'

const STEPS = [
  'Transcribing audio with ElevenLabs Scribe v2…',
  'Cloning your voice…',
  'Creating digital twin with HeyGen Avatar V…',
  'Writing 5 platform scripts in parallel…',
  'Critic scoring scripts (quality gate)…',
  'Generating cinematic B-roll with Fal Kling…',
  'Composing Hyperframes overlays…',
  'Translating to 10 languages…',
  'Running optimizer…',
  'Pipeline complete!',
]

export default function GeneratePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [audio, setAudio] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audio) return
    setError('')
    setUploading(true)
    setStep(0)

    const formData = new FormData()
    formData.append('file', audio)
    if (image) formData.append('image', image)

    try {
      const res = await api.post('/api/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const jobId = res.data.job_id

      // Simulate step progress while polling
      let s = 0
      const ticker = setInterval(() => {
        s = Math.min(s + 1, STEPS.length - 2)
        setStep(s)
      }, 8000)

      // Poll until done
      const poll = setInterval(async () => {
        try {
          const r = await api.get(`/api/jobs/${jobId}`)
          if (r.data.status === 'complete' || r.data.status === 'error') {
            clearInterval(poll)
            clearInterval(ticker)
            setStep(STEPS.length - 1)
            setTimeout(() => navigate(`/result/${jobId}`), 800)
          }
        } catch {}
      }, 5000)

    } catch (err) {
      setError(getApiError(err))
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-vellum">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl text-charcoal">MIRROR</Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-mutedgray hover:text-charcoal">Dashboard</Link>
          <span className="text-sm text-mutedgray">{user?.email}</span>
          <button onClick={() => logout().then(() => navigate('/login'))} className="text-sm text-mutedgray hover:text-charcoal">Sign out</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2"><CornerSprig /><h1 className="font-serif text-4xl text-charcoal">New generation</h1></div>
        <p className="text-mutedgray mb-8">Speak for 60 seconds. Get 50 pieces of content.</p>

        {uploading ? (
          <div className="card p-10 text-center space-y-6">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal"></div>
            <div>
              <p className="font-serif text-xl text-charcoal mb-2">Pipeline running</p>
              <p className="text-sm text-storygreen font-medium">{STEPS[step]}</p>
            </div>
            <div className="space-y-1">
              {STEPS.slice(0, -1).map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-left">
                  <span className={i < step ? 'text-storygreen' : i === step ? 'text-charcoal' : 'text-border'}>
                    {i < step ? '✓' : i === step ? '⏳' : '○'}
                  </span>
                  <span className={i <= step ? 'text-charcoal' : 'text-mutedgray'}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            {/* Audio upload */}
            <div className="card p-6">
              <span className="text-sm font-medium text-charcoal mb-3 block">Audio file <span className="text-red-500">*</span></span>
              <input type="file" accept="audio/*" required
                onChange={e => setAudio(e.target.files?.[0] || null)}
                className="block w-full text-sm text-mutedgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-charcoal file:text-white hover:file:bg-inkwell file:cursor-pointer"
              />
              <p className="text-xs text-mutedgray mt-2">MP3, WAV, M4A, OGG, WebM. 60 seconds recommended.</p>
              {audio && (
                <div className="mt-3 p-3 bg-vellum border border-border rounded-lg flex items-center justify-between">
                  <p className="text-sm text-charcoal font-medium">{audio.name}</p>
                  <p className="text-xs text-mutedgray">{(audio.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            {/* Image upload (optional — Vision agent) */}
            <div className="card p-6">
              <span className="text-sm font-medium text-charcoal mb-1 block">Reference image <span className="text-mutedgray font-normal">(optional)</span></span>
              <p className="text-xs text-mutedgray mb-3">Used by the Vision agent to add visual context to your scripts.</p>
              <input type="file" accept="image/*"
                onChange={e => setImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-mutedgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-white file:text-charcoal file:border file:border-border hover:file:border-storygreen file:cursor-pointer"
              />
              {image && (
                <p className="text-xs text-storygreen mt-2">✓ {image.name}</p>
              )}
            </div>

            {error && <div className="card p-4 bg-red-50 border-red-200"><p className="text-sm text-red-600">{error}</p></div>}

            {/* Pipeline preview */}
            <div className="card p-6 bg-white">
              <h3 className="font-serif text-lg text-charcoal mb-3">9-agent pipeline</h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  ['ElevenLabs Scribe v2', 'Transcription + emotion detection'],
                  ['ElevenLabs IVC', 'Voice clone from your audio'],
                  ['HeyGen Avatar V', 'Digital twin creation'],
                  ['Format Agent ×5', 'LinkedIn, TikTok, YouTube, Sales, Podcast'],
                  ['Critic Agent', 'Quality gate — rewrites if score < 7/10'],
                  ['Fal Kling 2.1 Pro', '4-shot cinematic B-roll'],
                  ['Hyperframes', 'Animated overlays per platform'],
                  ['HeyGen Translate', '10 languages, lip-synced'],
                  ['PostHog Optimizer', 'Self-improving loop'],
                ].map(([name, desc]) => (
                  <div key={name} className="flex items-start gap-2 text-xs">
                    <span className="text-storygreen mt-0.5 flex-shrink-0">✦</span>
                    <span><span className="font-medium text-charcoal">{name}</span> — <span className="text-mutedgray">{desc}</span></span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-mutedgray mt-4 pt-4 border-t border-border">~15 min · 50 outputs · $4.20 cost</p>
            </div>

            <button type="submit" disabled={!audio}
              className="btn-primary w-full py-3">
              Generate 50 pieces of content
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

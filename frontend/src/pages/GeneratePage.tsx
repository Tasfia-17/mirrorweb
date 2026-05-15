import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api, { getApiError } from '../utils/api'
import { CornerSprig } from '../components/Botanicals'

const STEPS = [
  'Transcribing audio…',
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

type Tab = 'audio' | 'text'

export default function GeneratePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('audio')
  const [audio, setAudio] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'quick' | 'full'>('quick')
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === 'audio' && !audio) return
    if (tab === 'text' && !text.trim()) return
    setError('')
    setUploading(true)
    setStep(0)

    const formData = new FormData()
    if (tab === 'audio' && audio) {
      formData.append('file', audio)
    } else {
      // Send text as a plain .txt file — backend converts via ElevenLabs TTS
      const blob = new Blob([text], { type: 'text/plain' })
      formData.append('file', blob, 'input.txt')
      formData.append('text_input', text)
    }
    if (image) formData.append('image', image)
    formData.append('mode', mode)

    try {
      const res = await api.post('/api/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const jobId = res.data.job_id

      let s = 0
      const ticker = setInterval(() => { s = Math.min(s + 1, STEPS.length - 2); setStep(s) }, 8000)
      const poll = setInterval(async () => {
        try {
          const r = await api.get(`/api/jobs/${jobId}`)
          if (r.data.status === 'complete' || r.data.status === 'error') {
            clearInterval(poll); clearInterval(ticker)
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
        <p className="text-mutedgray mb-8">Speak for 60 seconds — or paste your script. Get 50 pieces of content.</p>

        {uploading ? (
          <div className="card p-10 text-center space-y-6">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal"></div>
            <div>
              <p className="font-serif text-xl text-charcoal mb-2">Pipeline running</p>
              <p className="text-sm text-storygreen font-medium">{STEPS[step]}</p>
            </div>
            <div className="space-y-1 text-left max-w-xs mx-auto">
              {STEPS.slice(0, -1).map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
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
            {/* Tab switcher */}
            <div className="flex rounded-xl border border-border overflow-hidden">
              {(['audio', 'text'] as Tab[]).map(t => (
                <button key={t} type="button" onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t ? 'bg-charcoal text-white' : 'bg-white text-mutedgray hover:text-charcoal'}`}>
                  {t === 'audio' ? '🎙 Voice memo' : '✏️ Paste text'}
                </button>
              ))}
            </div>

            {/* Mode selector */}
            <div className="grid grid-cols-2 gap-3">
              {([['quick', '⚡ Quick', '4 platforms · ~5 min · $1.80', 'LinkedIn, TikTok, YouTube, Sales'],
                 ['full',  '🌍 Full',  '5 platforms + 10 languages · ~15 min · $4.20', '+ Podcast + 10 language translations']] as const).map(([val, label, desc, sub]) => (
                <button key={val} type="button" onClick={() => setMode(val)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${mode === val ? 'border-charcoal bg-white' : 'border-border bg-vellum hover:border-charcoal/40'}`}>
                  <p className="font-medium text-charcoal text-sm">{label}</p>
                  <p className="text-xs text-storygreen mt-0.5">{desc}</p>
                  <p className="text-xs text-mutedgray mt-0.5">{sub}</p>
                </button>
              ))}
            </div>

            {tab === 'audio' ? (
              <div className="card p-6">
                <span className="text-sm font-medium text-charcoal mb-3 block">Audio file</span>
                <input type="file" accept="audio/*" required={tab === 'audio'}
                  onChange={e => setAudio(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-mutedgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-charcoal file:text-white hover:file:bg-inkwell file:cursor-pointer"
                />
                <p className="text-xs text-mutedgray mt-2">MP3, WAV, M4A, OGG, WebM. 60 seconds recommended.</p>
                {audio && (
                  <div className="mt-3 p-3 bg-vellum border border-border rounded-lg flex justify-between">
                    <p className="text-sm text-charcoal font-medium">{audio.name}</p>
                    <p className="text-xs text-mutedgray">{(audio.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-6">
                <span className="text-sm font-medium text-charcoal mb-3 block">Your script or idea</span>
                <textarea
                  className="w-full h-40 p-3 text-sm border border-border rounded-lg bg-vellum text-charcoal placeholder-mutedgray resize-none focus:outline-none focus:border-charcoal"
                  placeholder="Paste your script, talking points, or idea here. MIRROR will rewrite it for each platform, clone a voice, and generate videos..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  required={tab === 'text'}
                  minLength={50}
                />
                <p className="text-xs text-mutedgray mt-2">{text.length} characters · min 50</p>
              </div>
            )}

            {/* Optional image */}
            <div className="card p-6">
              <span className="text-sm font-medium text-charcoal mb-1 block">Reference image <span className="text-mutedgray font-normal">(optional)</span></span>
              <p className="text-xs text-mutedgray mb-3">Vision agent uses this for visual context in scripts.</p>
              <input type="file" accept="image/*"
                onChange={e => setImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-mutedgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-white file:text-charcoal file:border file:border-border hover:file:border-storygreen file:cursor-pointer"
              />
              {image && <p className="text-xs text-storygreen mt-2">✓ {image.name}</p>}
            </div>

            {error && <div className="card p-4 bg-red-50 border-red-200"><p className="text-sm text-red-600">{error}</p></div>}

            <div className="card p-5 bg-white">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div><p className="font-medium text-charcoal text-lg">9</p><p className="text-mutedgray">AI agents</p></div>
                <div><p className="font-medium text-charcoal text-lg">50</p><p className="text-mutedgray">outputs</p></div>
                <div><p className="font-medium text-charcoal text-lg">$4.20</p><p className="text-mutedgray">cost</p></div>
              </div>
            </div>

            <button type="submit" disabled={tab === 'audio' ? !audio : text.length < 50}
              className="btn-primary w-full py-3">
              {mode === 'quick' ? 'Generate 4 platform videos' : 'Generate 50 pieces of content'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

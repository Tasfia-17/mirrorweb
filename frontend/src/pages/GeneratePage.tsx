import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api, { getApiError } from '../utils/api'
import { CornerSprig } from '../components/Botanicals'

export default function GeneratePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/api/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/result/${res.data.job_id}`)
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
          <Link to="/dashboard" className="text-sm text-mutedgray hover:text-charcoal">
            Dashboard
          </Link>
          <span className="text-sm text-mutedgray">{user?.email}</span>
          <button onClick={handleLogout} className="text-sm text-mutedgray hover:text-charcoal">
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <CornerSprig />
          <h1 className="font-serif text-4xl text-charcoal">New generation</h1>
        </div>
        <p className="text-mutedgray mb-8">Upload 60 seconds of audio to begin</p>

        <form onSubmit={submit} className="space-y-6">
          <div className="card p-8">
            <label className="block">
              <span className="text-sm font-medium text-charcoal mb-3 block">Audio file</span>
              <input
                type="file"
                accept="audio/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-mutedgray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-charcoal file:text-white hover:file:bg-inkwell file:cursor-pointer"
                required
              />
              <p className="text-xs text-mutedgray mt-2">
                MP3, WAV, M4A, or any audio format. 60 seconds recommended.
              </p>
            </label>

            {file && (
              <div className="mt-4 p-3 bg-vellum border border-border rounded-lg">
                <p className="text-sm text-charcoal font-medium">{file.name}</p>
                <p className="text-xs text-mutedgray">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="card p-4 bg-red-50 border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="card p-6 bg-white">
            <h3 className="font-serif text-lg text-charcoal mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-mutedgray">
              <li className="flex items-start gap-2">
                <span className="text-storygreen mt-0.5">✦</span>
                <span>Voice cloning with ElevenLabs (30 seconds)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-storygreen mt-0.5">✦</span>
                <span>5 platform scripts generated and scored (2 minutes)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-storygreen mt-0.5">✦</span>
                <span>Videos rendered with HeyGen (5 minutes)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-storygreen mt-0.5">✦</span>
                <span>10 language versions created (8 minutes)</span>
              </li>
            </ul>
            <p className="text-xs text-mutedgray mt-4 pt-4 border-t border-border">
              Total time: ~15 minutes. You'll be notified when complete.
            </p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={!file || uploading}
          >
            {uploading ? 'Starting generation...' : 'Generate content'}
          </button>
        </form>
      </div>
    </div>
  )
}

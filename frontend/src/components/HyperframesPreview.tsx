import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PLATFORMS = ['linkedin', 'tiktok', 'youtube', 'sales', 'podcast'] as const
type Platform = typeof PLATFORMS[number]

const PLATFORM_META: Record<Platform, { label: string; w: number; h: number; bg: string }> = {
  linkedin: { label: 'LinkedIn', w: 1080, h: 1080, bg: '#0077b5' },
  tiktok:   { label: 'TikTok',   w: 1080, h: 1920, bg: '#010101' },
  youtube:  { label: 'YouTube',  w: 1920, h: 1080, bg: '#ff0000' },
  sales:    { label: 'Sales',    w: 1920, h: 1080, bg: '#00c851' },
  podcast:  { label: 'Podcast',  w: 1920, h: 1080, bg: '#6b21a8' },
}

function buildHyperframesHTML(platform: Platform, hook: string, script: string, videoUrl: string): string {
  const meta = PLATFORM_META[platform]
  const isPortrait = meta.h > meta.w

  const waveformScript = platform === 'podcast' ? `
    <script>
      const canvas = document.getElementById('wf');
      const ctx = canvas.getContext('2d');
      let t = 0;
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height/2 + Math.sin((x + t) * 0.05) * 20 * Math.sin(t * 0.02 + x * 0.01);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        t += 2;
        requestAnimationFrame(draw);
      }
      draw();
    </script>` : ''

  const lowerThird = platform === 'youtube' ? `
    <div id="lt" style="position:absolute;bottom:80px;left:60px;border-left:6px solid #ff0000;padding-left:16px;animation:slideIn 0.5s ease forwards">
      <p style="color:white;font-size:22px;font-weight:700;margin:0;text-shadow:1px 1px 3px rgba(0,0,0,0.8)">${hook}</p>
    </div>` : ''

  const flashHook = platform === 'tiktok' ? `
    <div style="position:absolute;top:80px;left:0;right:0;text-align:center;animation:pulse 2s infinite">
      <p style="color:white;font-size:36px;font-weight:900;text-shadow:2px 2px 8px rgba(0,0,0,0.9);padding:0 20px">${hook}</p>
    </div>` : ''

  const linkedinBadge = platform === 'linkedin' ? `
    <div style="position:absolute;bottom:80px;left:40px;right:40px;background:rgba(0,0,0,0.85);padding:20px;border-radius:12px;border-left:4px solid #0077b5">
      <p style="color:white;font-size:18px;font-weight:600;margin:0">${hook}</p>
      <p style="color:#93c5fd;font-size:13px;margin:8px 0 0">Connect on LinkedIn →</p>
    </div>` : ''

  const salesCTA = platform === 'sales' ? `
    <div style="position:absolute;top:40px;left:0;right:0;text-align:center">
      <p style="color:white;font-size:28px;font-weight:800;text-shadow:1px 1px 4px rgba(0,0,0,0.8)">${hook}</p>
    </div>
    <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center">
      <span style="background:#00c851;color:white;padding:14px 40px;border-radius:8px;font-size:20px;font-weight:700;box-shadow:0 4px 20px rgba(0,200,81,0.5)">Book a Call →</span>
    </div>` : ''

  const podcastOverlay = platform === 'podcast' ? `
    <div style="position:absolute;bottom:0;left:0;right:0;height:100px;background:rgba(0,0,0,0.7);display:flex;align-items:center;padding:0 20px;gap:16px">
      <canvas id="wf" width="800" height="80" style="flex:1"></canvas>
      <p style="color:white;font-size:13px;max-width:200px;opacity:0.8">${hook}</p>
    </div>` : ''

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${meta.w}px; height: ${meta.h}px; overflow: hidden; background: #111; font-family: -apple-system, sans-serif; }
  #stage { position: relative; width: 100%; height: 100%; }
  #bg { position: absolute; inset: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
  #script-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 60px; }
  #script-text { color: rgba(255,255,255,0.15); font-size: ${isPortrait ? 28 : 22}px; line-height: 1.6; text-align: center; }
  @keyframes slideIn { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
  .platform-badge { position: absolute; top: 20px; right: 20px; background: ${meta.bg}; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
</style>
</head>
<body>
<div id="stage">
  <div id="bg"></div>
  <div id="script-overlay"><p id="script-text">${script.slice(0, 200)}…</p></div>
  <div class="platform-badge">${meta.label}</div>
  ${lowerThird}${flashHook}${linkedinBadge}${salesCTA}${podcastOverlay}
</div>
${waveformScript}
</body>
</html>`
}

interface Props {
  scripts: Record<string, string>
  videos: Record<string, string>
}

export default function HyperframesPreview({ scripts, videos }: Props) {
  const [active, setActive] = useState<Platform>('linkedin')
  const [copied, setCopied] = useState(false)

  const hook = (scripts[active] || '').split('.')[0] || active
  const html = buildHyperframesHTML(active, hook, scripts[active] || '', videos[active] || '')
  const blob = new Blob([html], { type: 'text/html' })
  const blobUrl = URL.createObjectURL(blob)

  const copyHTML = () => {
    navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const meta = PLATFORM_META[active]
  const isPortrait = meta.h > meta.w
  const previewH = isPortrait ? 400 : 225
  const previewW = isPortrait ? (400 * meta.w / meta.h) : 400

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl text-charcoal">Hyperframes preview</h2>
          <p className="text-xs text-mutedgray mt-0.5">Live HTML-to-video compositions — rendered in-browser</p>
        </div>
        <button onClick={copyHTML} className="text-xs px-3 py-1.5 border border-border rounded-full hover:border-storygreen hover:text-storygreen transition-colors">
          {copied ? '✓ Copied' : 'Copy HTML'}
        </button>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {PLATFORMS.map(p => (
          <button key={p} onClick={() => setActive(p)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${active === p ? 'bg-charcoal text-white border-charcoal' : 'border-border text-mutedgray hover:border-charcoal hover:text-charcoal'}`}>
            {PLATFORM_META[p].label}
          </button>
        ))}
      </div>

      {/* Live preview */}
      <div className="bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center p-4" style={{ minHeight: 260 }}>
        <div style={{ width: previewW, height: previewH, position: 'relative', borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <iframe
            key={active}
            src={blobUrl}
            style={{ width: meta.w, height: meta.h, transform: `scale(${previewW / meta.w})`, transformOrigin: 'top left', border: 'none' }}
            title={`${active} hyperframes preview`}
            sandbox="allow-scripts"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-mutedgray">
        <span>{meta.w}×{meta.h}px · {isPortrait ? '9:16' : '16:9'}</span>
        <a href={blobUrl} download={`mirror-${active}.html`}
          className="text-storygreen hover:underline">
          Download HTML ↓
        </a>
      </div>
    </div>
  )
}

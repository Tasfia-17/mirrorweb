import { Link } from 'react-router-dom'
import { BotanicalLeft, BotanicalRight, GardenDivider, CornerSprig, PetalRain } from '../components/Botanicals'

const STEPS = [
  { label: 'Speak for 60 seconds',         desc: 'Record a voice memo on your phone or upload any audio file.' },
  { label: 'Voice & identity cloned',      desc: 'ElevenLabs clones your voice. HeyGen Avatar V creates your digital twin.' },
  { label: '5 platform scripts written',   desc: 'LinkedIn, TikTok, YouTube, Sales pitch, Podcast, each rewritten for its audience.' },
  { label: 'Critic scores every script',   desc: 'AI quality gate scores hook, CTA, and emotion. Rewrites anything below 7/10.' },
  { label: 'Videos generated in parallel', desc: 'HeyGen Video Agent renders all 5 formats simultaneously with cinematic B-roll.' },
  { label: '10 languages, automatically',  desc: 'HeyGen Video Translate lip-syncs your content into 10 languages in your voice.' },
  { label: 'Gets smarter every run',       desc: 'PostHog tracks what performs. The optimizer improves your next generation.' },
]

const APIS = [
  'HeyGen Avatar V', 'HeyGen Video Agent', 'HeyGen Video Translate', 'Hyperframes',
  'ElevenLabs Scribe v2', 'ElevenLabs IVC', 'Fal Kling 2.1 Pro', 'Fal Wan 2.6 R2V',
  'FLUX.1 Pro', 'PostHog LLM Observability',
]

const FEATURES = [
  { icon: '✦', title: 'Voice identity',       body: 'Your voice cloned from 60 seconds of audio. Every video sounds exactly like you.' },
  { icon: '◈', title: 'Digital twin',         body: 'HeyGen Avatar V creates a persistent digital twin from a short video clip.' },
  { icon: '♪', title: 'Platform intelligence', body: '5 formats rewritten for their specific audience, hook style, and duration.' },
  { icon: '▶', title: 'Cinematic B-roll',     body: 'Fal Kling generates multi-shot cinematic sequences for every video.' },
  { icon: '✦', title: 'Global reach',         body: '10 languages with lip-synced dubbing. Your content, everywhere.' },
  { icon: '◈', title: 'Self-improving',       body: 'PostHog measures what works. MIRROR adjusts your prompts automatically.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-vellum font-sans overflow-x-hidden">
      <PetalRain />

      <nav className="sticky top-0 z-50 bg-vellum/95 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
        <span className="font-serif text-xl text-charcoal tracking-tight">MIRROR</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-mutedgray hover:text-charcoal transition-colors">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started</Link>
        </div>
      </nav>

      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-24 flex items-center justify-center min-h-[88vh]">
        <div className="absolute left-0 bottom-0 w-64 h-[560px] pointer-events-none select-none hidden lg:block"><BotanicalLeft /></div>
        <div className="absolute right-0 bottom-0 w-64 h-[560px] pointer-events-none select-none hidden lg:block"><BotanicalRight /></div>

        <div className="text-center max-w-2xl relative z-10">
          <div className="flex justify-between mb-2 lg:hidden px-2">
            <CornerSprig /><CornerSprig flip />
          </div>
          <h1 className="font-serif text-6xl md:text-8xl text-charcoal leading-[1.0] tracking-tight mb-6">
            Your voice,<br /><span className="italic">everywhere.</span>
          </h1>
          <p className="text-lg text-mutedgray max-w-lg mx-auto leading-relaxed mb-10">
            Speak for 60 seconds. MIRROR generates 50 pieces of platform-optimised content in 10 languages, in your voice, with your face.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register" className="btn-primary px-8 py-3 text-base">Start creating</Link>
            <Link to="/login" className="btn-secondary px-8 py-3 text-base">Sign in</Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6"><GardenDivider /></div>

      <section className="max-w-4xl mx-auto px-6 py-20 relative">
        <div className="absolute top-6 right-0 hidden md:block"><CornerSprig flip /></div>
        <h2 className="font-serif text-4xl text-charcoal mb-2">How it works</h2>
        <p className="text-mutedgray mb-12">Seven stages. Zero production team.</p>
        <div className="space-y-0">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-6 py-6 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">{i + 1}</div>
              <div className="flex-1">
                <p className="font-medium text-charcoal text-sm mb-0.5">{step.label}</p>
                <p className="text-sm text-mutedgray">{step.desc}</p>
              </div>
              <span className="text-storygreen text-lg flex-shrink-0 mt-0.5">✦</span>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6"><GardenDivider /></div>

      <section className="max-w-4xl mx-auto px-6 py-20 relative">
        <div className="absolute top-6 left-0 hidden md:block"><CornerSprig /></div>
        <h2 className="font-serif text-4xl text-charcoal mb-2">10 APIs. One pipeline.</h2>
        <p className="text-mutedgray mb-10">Not a single call. A full agentic loop.</p>
        <div className="flex flex-wrap gap-2">
          {APIS.map(api => (
            <span key={api} className="bg-white border border-border text-bookgray text-xs px-3 py-1.5 rounded-full font-mono hover:border-storygreen hover:text-storygreen transition-colors cursor-default">{api}</span>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6"><GardenDivider /></div>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl text-charcoal mb-12">Everything included</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
              <span className="text-storygreen text-lg block mb-3">{f.icon}</span>
              <h3 className="font-serif text-lg text-charcoal mb-2">{f.title}</h3>
              <p className="text-sm text-mutedgray leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-charcoal rounded-3xl px-8 py-16 text-center relative overflow-hidden">
          <div className="absolute left-4 bottom-0 w-40 h-56 opacity-[0.08] pointer-events-none"><BotanicalLeft /></div>
          <div className="absolute right-4 bottom-0 w-40 h-56 opacity-[0.08] pointer-events-none"><BotanicalRight /></div>
          <div className="relative z-10">
            <h2 className="font-serif text-4xl text-white mb-4">Ready to be everywhere?</h2>
            <p className="text-[#9e9a91] mb-8 max-w-md mx-auto">One voice memo. 50 pieces of content. 10 languages.</p>
            <Link to="/register" className="inline-block bg-white text-charcoal font-medium px-8 py-3 rounded-full text-sm hover:bg-vellum transition-colors">Start for free</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-mutedgray">
          <span className="font-serif text-sm text-charcoal">MIRROR</span>
          <span>2026</span>
        </div>
      </footer>
    </div>
  )
}

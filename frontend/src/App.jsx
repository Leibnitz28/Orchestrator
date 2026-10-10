import React, { useState, useEffect, useRef } from 'react';
import CampaignHeader from './components/CampaignHeader';
import ColorPalette from './components/ColorPalette';
import ImagePromptCard from './components/ImagePromptCard';
import SocialCopyCard from './components/SocialCopyCard';
const PRESETS = [
  { text: "Student drama club street play on August 15 about health awareness", icon: "🎭" },
  { text: "A bakery introducing festive gift boxes", icon: "🥐" },
  { text: "A college coding club's annual hackathon", icon: "💻" },
  { text: "A local gym launching a New Year fitness challenge", icon: "🏋️" }
];

/* Shimmer Skeleton Card matching Image & Social cards */
function SkeletonCard({ height = "h-48" }) {
  return (
    <div className={`rounded-2xl p-6 bg-white/[0.02] border border-white/[0.06] ${height} relative overflow-hidden flex flex-col justify-between`}>
      <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>
      <div>
        <div className="h-4 bg-white/[0.08] rounded-md w-1/3 mb-4"></div>
        <div className="h-3 bg-white/[0.04] rounded-md w-full mb-2.5"></div>
        <div className="h-3 bg-white/[0.04] rounded-md w-4/5 mb-2.5"></div>
        <div className="h-3 bg-white/[0.04] rounded-md w-2/3"></div>
      </div>
      <div className="h-7 bg-white/[0.06] rounded-lg w-24"></div>
    </div>
  );
}

export default function App() {
  const [idea, setIdea] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, error, success
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  // Smooth scroll to results when campaign generation finishes
  useEffect(() => {
    if (status === 'success' && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setStatus('loading');
    setErrorMsg('');
    setResult(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s hard timeout

    try {
      const response = await fetch(`${apiUrl}/api/generate-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail?.[0]?.msg || errData.detail || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setStatus('success');
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setErrorMsg('The request took too long. Please try again.');
      } else {
        setErrorMsg(err.message || 'An unexpected error occurred. Please check your connection.');
      }
      setStatus('error');
    }
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (result.campaign_title || 'campaign').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    a.download = `${slug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative pb-28 overflow-hidden">
      
      {/* Background Blobs for Glass Refraction */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[120px] mix-blend-screen opacity-50"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[100px] mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[150px] mix-blend-screen opacity-40"></div>
      </div>

      {/* Top Header Navigation */}
      <header className="border-b border-white/[0.06] bg-[#08080C]/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-display text-white tracking-tight">
                  Orchestra
                </h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium hidden sm:block">
                Campaign Asset Orchestrator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px] text-zinc-400">Gemini Ready</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        
        {/* Hero & Input Section */}
        <section className="mb-20 max-w-3xl mx-auto relative z-10">
          {/* Eyebrow and Headline */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-5 shadow-sm">
              <span className="text-indigo-400 text-xs">✨</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                Multi-Modal Campaign Generator
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400 tracking-tight leading-[1.1] mb-5">
              Turn raw ideas into full marketing campaigns.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Describe your concept in one sentence. In seconds, get brand colors, Midjourney visual prompts, and multi-platform copy.
            </p>
          </div>

          {/* Form with Liquid Glass */}
          <form 
            onSubmit={handleSubmit} 
            className="bg-liquid-glass rounded-3xl p-2 transition-all duration-300 focus-within:shadow-[0_0_50px_-10px_rgba(99,102,241,0.25)] focus-within:border-indigo-500/50"
          >
            <div className="relative">
              <textarea
                id="idea"
                rows={3}
                className="block w-full rounded-2xl bg-black/20 border-none text-white placeholder-zinc-500 focus:ring-0 text-base sm:text-lg p-5 sm:p-6 transition-colors resize-none leading-relaxed shadow-inner"
                placeholder="e.g., A boutique bakery introducing autumn gift boxes..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={status === 'loading'}
              />
              
              <div className="flex items-center justify-between p-3 sm:px-4 sm:pb-3 border-t border-white/[0.04]">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>Press</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 font-mono text-[10px]">Enter</kbd>
                  <span>to orchestrate</span>
                </div>

                {/* Liquid Glass Generate Button */}
                <button
                  type="submit"
                  disabled={status === 'loading' || !idea.trim()}
                  className="relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:scale-95 active:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 group"
                >
                  {/* Glowing gradient layer behind the glass */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 via-indigo-500/80 to-violet-600/80 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  {/* Top edge highlight arc */}
                  <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none"></div>

                  <div className="relative z-10 flex items-center">
                    {status === 'loading' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating Assets...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="tracking-wide">Generate Campaign</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </form>

          {/* Preset Prompts Pill Section */}
          <div className="mt-8 text-center">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3 block">
              Try an example prompt
            </span>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setIdea(preset.text)}
                  disabled={status === 'loading'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-white/[0.03] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.07] hover:border-indigo-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all duration-200"
                >
                  <span className="text-sm select-none">{preset.icon}</span>
                  <span>{preset.text}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Error State */}
        {status === 'error' && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 mb-16 max-w-3xl mx-auto backdrop-blur-md animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">
                  Generation Error
                </h3>
                <p className="mt-1.5 text-sm text-rose-200/90 leading-relaxed font-mono text-xs break-all">
                  {errorMsg}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-xs font-semibold text-white bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 px-3.5 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  Dismiss & Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty / Idle State */}
        {status === 'idle' && !result && (
          <div className="max-w-2xl mx-auto text-center py-24 px-6 border border-dashed border-white/[0.08] rounded-3xl bg-white/[0.01]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold font-display text-zinc-300">
              Studio Standby
            </h3>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Describe your campaign idea above to see your color palette, visuals, copy, and audio master right here.
            </p>
          </div>
        )}

        {/* Realistic Shimmer Skeletons shaped like actual output */}
        {status === 'loading' && (
          <div className="max-w-6xl mx-auto space-y-16 animate-fade-in-up">
            {/* Header skeleton */}
            <div>
              <div className="h-6 w-32 bg-white/[0.06] rounded-full mb-4 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
              </div>
              <div className="h-12 w-2/3 md:w-1/2 bg-white/[0.06] rounded-2xl mb-4 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
              </div>
              <div className="h-6 w-1/3 bg-white/[0.04] rounded-lg mb-6 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
              </div>
              <div className="h-8 w-64 bg-white/[0.05] rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
              </div>
            </div>

            {/* Palette skeleton */}
            <div>
              <div className="h-8 w-48 bg-white/[0.06] rounded-xl mb-6 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
                    <div className="w-20 h-20 rounded-full bg-white/[0.08] mb-4"></div>
                    <div className="h-4 w-16 bg-white/[0.06] rounded mb-2"></div>
                    <div className="h-3 w-12 bg-white/[0.04] rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <div className="h-8 w-44 bg-white/[0.06] rounded-xl mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <SkeletonCard height="h-56" />
                  <SkeletonCard height="h-56" />
                </div>
              </div>
              <div>
                <div className="h-8 w-44 bg-white/[0.06] rounded-xl mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full shimmer-sweep bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
                </div>
                <div className="space-y-6">
                  <SkeletonCard height="h-56" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Output State */}
        {status === 'success' && result && (
          <div ref={resultsRef} className="max-w-6xl mx-auto">
            
            {/* Header & Export Bar */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-4 animate-fade-in-up stagger-1">
              <div className="flex-1">
                <CampaignHeader 
                  title={result.campaign_title} 
                  tagline={result.tagline} 
                  targetAudience={result.target_audience} 
                />
              </div>

              {/* Export JSON Button */}
              <div className="self-start md:sticky md:top-28 z-10">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-200 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:text-white hover:border-white/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* 01 / Color Palette */}
            <div className="animate-fade-in-up stagger-2">
              <ColorPalette colors={result.color_palette} />
            </div>

            {/* 02 / Visual Assets & 03 / Social Copy 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-20 animate-fade-in-up stagger-3">
              
              {/* Visual Assets (Image Prompts) */}
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold tracking-wider text-indigo-400 uppercase block">
                        02 / Generative Imagery
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                        Visual Prompts
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    {result.image_prompts?.length || 0} Assets
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {result.image_prompts?.map((prompt, idx) => (
                    <ImagePromptCard 
                      key={idx}
                      assetType={prompt.asset_type}
                      aspectRatio={prompt.aspect_ratio}
                      prompt={prompt.prompt}
                    />
                  ))}
                </div>
              </div>

              {/* Social Media Copy */}
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold tracking-wider text-sky-400 uppercase block">
                        03 / Multi-Channel Copy
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                        Social Campaign
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    {result.social_copy?.length || 0} Channels
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {result.social_copy?.map((copy, idx) => (
                    <SocialCopyCard 
                      key={idx}
                      platform={copy.platform}
                      caption={copy.caption}
                      hashtags={copy.hashtags}
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

import React from 'react';

export default function CampaignHeader({ title, tagline, targetAudience }) {
  return (
    <div className="mb-14 relative">
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
          Campaign Master Asset
        </span>
      </div>

      {/* Hero Title */}
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400 leading-[1.1] mb-4">
        {title}
      </h2>

      {/* Tagline */}
      {tagline && (
        <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 font-light italic tracking-normal mb-6 flex items-start gap-2">
          <span className="text-indigo-400/80 font-serif select-none text-2xl -mt-1">“</span>
          <span>{tagline}</span>
          <span className="text-indigo-400/80 font-serif select-none text-2xl -mt-1">”</span>
        </p>
      )}

      {/* Target Audience */}
      {targetAudience && (
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-sm">
          <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Target Audience:
          </span>
          <span className="text-xs sm:text-sm text-zinc-100 font-medium tracking-normal">
            {targetAudience}
          </span>
        </div>
      )}
    </div>
  );
}

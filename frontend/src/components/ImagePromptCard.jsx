import React, { useState } from 'react';

const ASSET_ICONS = {
  poster: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  banner: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  square: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export default function ImagePromptCard({ assetType, aspectRatio, prompt }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const normalizedType = assetType?.toLowerCase() || '';
  const typeIcon = ASSET_ICONS[normalizedType] || (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="bg-glass-cool card-hover rounded-2xl p-6 flex flex-col h-full group relative overflow-hidden">
      {/* Subtle top edge highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>

      {/* Badges Bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shadow-sm">
          {typeIcon}
          <span className="capitalize">{assetType}</span>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-zinc-900/80 text-zinc-400 border border-white/[0.08]">
          {aspectRatio}
        </span>
      </div>

      {/* Prompt Body */}
      <p className="text-zinc-300 text-sm flex-grow mb-6 leading-relaxed group-hover:text-zinc-100 transition-colors">
        {prompt}
      </p>

      {/* Copy Prompt Button */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] text-zinc-500 font-medium">
          Ready for Midjourney / DALL-E
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            copied 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-white/[0.06] text-zinc-200 hover:text-white hover:bg-white/[0.12] border border-white/[0.08]'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

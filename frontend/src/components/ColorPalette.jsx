import React, { useState } from 'react';

export default function ColorPalette({ colors }) {
  const [copiedHex, setCopiedHex] = useState(null);

  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  if (!colors || colors.length === 0) return null;

  return (
    <div className="mb-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase block">
              01 / Visual Identity
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              Curated Color Palette
            </h3>
          </div>
        </div>
        <span className="text-xs text-zinc-500 font-mono hidden sm:inline-block">
          Click swatch to copy HEX
        </span>
      </div>

      {/* Swatches Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {colors.map((color, idx) => {
          const isCopied = copiedHex === color.hex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCopy(color.hex)}
              className="group relative flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              aria-label={`Copy hex code for ${color.name}`}
            >
              {/* Swatch circle with soft matching glow */}
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full relative overflow-hidden transition-all duration-300 group-hover:scale-105 border border-white/15 flex items-center justify-center mb-4 shadow-xl"
                style={{ 
                  backgroundColor: color.hex,
                  boxShadow: `0 14px 28px -6px ${color.hex}77, 0 6px 14px -3px ${color.hex}55` 
                }}
              >
                {/* Subtle glass reflection highlight */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25 pointer-events-none rounded-full"></div>

                {/* In-swatch hover & copied feedback */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isCopied ? (
                    <div className="flex flex-col items-center animate-in zoom-in-75 duration-200">
                      <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[10px] font-bold text-emerald-200 tracking-wider uppercase mt-1">
                        Copied
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-medium text-white/90 tracking-wide mt-1">
                        Copy
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Color Name & Hex */}
              <span className="text-sm font-semibold text-zinc-100 text-center tracking-tight mb-1 group-hover:text-white transition-colors">
                {color.name}
              </span>
              <span className="text-xs text-zinc-400 font-mono tracking-wider px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 group-hover:text-zinc-200 group-hover:border-white/10 transition-colors">
                {color.hex.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Shield, Sparkles, CheckCircle, FileText, Bell } from 'lucide-react';

export const FloatingHologram = ({ title = "AI Expiry Protection", subtitle = "Never miss a renewal, guarantee, or claim again." }) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 select-none">
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 bg-gold-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute w-48 h-48 bg-amber-600/25 rounded-full blur-2xl pointer-events-none" />

      {/* Hologram Rings */}
      <div className="relative w-52 h-52 flex items-center justify-center">
        {/* Outer Orbit 1 */}
        <div className="absolute inset-0 rounded-full border border-gold-500/30 border-dashed animate-spin-slow" />
        
        {/* Outer Orbit 2 */}
        <div 
          className="absolute -inset-4 rounded-full border border-amber-500/20 border-dotted" 
          style={{ animation: 'spin 20s linear infinite reverse' }}
        />

        {/* Inner Glowing Hexagon Base */}
        <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-gold-500/20 to-brown-900/80 border-2 border-gold-400/40 backdrop-blur-md shadow-gold-lg flex items-center justify-center transform rotate-6 animate-float-3d">
          <div className="w-28 h-28 rounded-xl bg-brown-950/90 border border-gold-500/30 flex flex-col items-center justify-center -rotate-6 shadow-inner">
            <Shield className="w-12 h-12 text-gold-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-gold-300 font-semibold mt-1 uppercase">GUARANTEED</span>
          </div>
        </div>

        {/* Orbiting Satellite 1: Smart OCR */}
        <div className="absolute -top-2 left-6 bg-brown-900/90 border border-gold-500/40 rounded-full px-2.5 py-1 text-xs text-gold-300 flex items-center gap-1.5 shadow-gold-sm animate-bounce" style={{ animationDuration: '3s' }}>
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span className="text-[11px] font-medium">Auto OCR</span>
        </div>

        {/* Orbiting Satellite 2: Active Protection */}
        <div className="absolute bottom-2 -right-3 bg-brown-900/90 border border-emerald-500/40 rounded-full px-2.5 py-1 text-xs text-emerald-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-bounce" style={{ animationDuration: '4s' }}>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium">DocAlert</span>
        </div>

        {/* Orbiting Satellite 3: Multi-channel Reminders */}
        <div className="absolute top-1/2 -left-8 -translate-y-1/2 bg-brown-900/90 border border-amber-500/40 rounded-full p-2 text-gold-300 shadow-gold-sm">
          <Bell className="w-4 h-4 text-gold-400" />
        </div>
      </div>

      {/* Text Info */}
      <div className="text-center mt-8 relative z-10 max-w-sm">
        <h3 className="text-xl font-bold gold-gradient-text tracking-tight">{title}</h3>
        <p className="text-brown-300 text-sm mt-2 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default FloatingHologram;

import React from 'react';
import { Layers } from 'lucide-react';

interface DynamicIslandProps {
  activeTab: 'dashboard' | 'editor';
  onNavigate: (tab: 'dashboard' | 'editor') => void;
  hasActiveDeclaration: boolean;
  isProcessing: boolean;
  processedCount: number;
  user?: { name?: string; email?: string; avatar?: string } | null;
  onSignOut?: () => void;
}

// Smart Handling SVG Logo Mark
const SmartHandlingMark: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer gold ring */}
    <circle cx="14" cy="14" r="13" stroke="#C9A84C" strokeWidth="1.5" />
    {/* Tick marks */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x1 = 14 + 11 * Math.cos(rad);
      const y1 = 14 + 11 * Math.sin(rad);
      const x2 = 14 + 12.5 * Math.cos(rad);
      const y2 = 14 + 12.5 * Math.sin(rad);
      return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A84C" strokeWidth="1" strokeLinecap="round" />;
    })}
    {/* SH lettermark in navy */}
    <text x="14" y="18" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="9" fill="#0C2461">SH</text>
  </svg>
);

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  activeTab,
  onNavigate,
  hasActiveDeclaration,
  isProcessing,
  processedCount,
  user,
  onSignOut,
}) => {
  return (
    <div className="w-full px-4 pt-4 flex justify-center z-50">
      <div
        className="w-full max-w-5xl h-[56px] bg-white border border-[#E5E7EB] rounded-full px-5 py-1.5 flex items-center justify-between shadow-sm transition-all"
        style={{ borderRadius: '50px' }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => onNavigate('dashboard')}
        >
          <SmartHandlingMark size={28} />
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-bold tracking-tight text-[#0A0A0A]">
              Smart <span className="text-[#0C2461]">Handling</span>
            </span>
            <span className="text-[9px] text-[#C9A84C] uppercase tracking-widest font-semibold hidden sm:block">
              Intelligent Customs
            </span>
          </div>
        </div>

        {/* Status Widget */}
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 bg-[#F7F7F7] border border-[#E5E7EB] rounded-full text-xs">
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
              <span className="text-[#0C2461] font-semibold">Extracting fields…</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#6B7280]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>System Ready</span>
              <span className="text-[#E5E7EB]">|</span>
              <span className="font-semibold text-[#0A0A0A]">{processedCount} drafts prepared</span>
            </div>
          )}
        </div>

        {/* Right side: tabs + user avatar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#0A0A0A] text-white'
                : 'text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]'
            }`}
          >
            Dashboard
          </button>

          {hasActiveDeclaration && (
            <button
              onClick={() => onNavigate('editor')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-[#0C2461] text-white'
                  : 'text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F3F4F6]'
              }`}
            >
              <Layers className="w-3 h-3" />
              Editor
            </button>
          )}

          {/* User avatar / sign-in indicator */}
          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-[#E5E7EB] hover:border-[#0A0A0A] transition-all group"
                title="Sign out"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#0C2461] flex items-center justify-center text-white text-[10px] font-bold">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-[11px] text-[#6B7280] group-hover:text-[#0A0A0A] max-w-[80px] truncate hidden sm:block">
                  {user.name || user.email}
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

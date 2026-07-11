import React, { useState, useRef, useEffect } from 'react';
import { Layers, LogOut, Trash2, ChevronDown } from 'lucide-react';

interface DynamicIslandProps {
  activeTab: 'dashboard' | 'editor';
  onNavigate: (tab: 'dashboard' | 'editor') => void;
  hasActiveDeclaration: boolean;
  user?: { name?: string; email?: string; avatar?: string } | null;
  onSignOut?: () => void;
  onDeleteAccount?: () => void;
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
  user,
  onSignOut,
  onDeleteAccount,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full px-4 pt-4 flex justify-center z-50">
      <div
        className="w-full max-w-7xl bg-white border border-[#E5E7EB] px-6 py-4 md:py-2.5 flex flex-col md:flex-row items-center justify-between shadow-sm transition-all gap-3 md:gap-0 rounded-2xl md:rounded-full relative min-h-[64px]"
      >
        {/* Brand Row (On mobile, we space between brand and profile trigger) */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onNavigate('dashboard')}
          >
            <SmartHandlingMark size={32} />
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[18px] font-semibold tracking-wide text-[#0A0A0A] italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Smart
                </span>
                <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.25em] text-[#0C2461]">
                  Handling
                </span>
              </div>
              <span className="text-[8px] text-[#C9A84C] uppercase tracking-[0.28em] font-bold mt-1">
                INTELLIGENT CUSTOMS
              </span>
            </div>
          </div>

          {/* User profile trigger (Mobile only - visible on right) */}
          {user && (
            <div className="md:hidden relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-[#E5E7EB] hover:border-[#0A0A0A] bg-white transition-all"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#0C2461] flex items-center justify-center text-white text-[10px] font-bold">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-10 mt-1 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-[#F3F4F6] mb-1">
                    <p className="text-[11px] font-semibold text-[#0A0A0A] truncate">{user.name || 'User'}</p>
                    <p className="text-[9px] text-[#6B7280] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onSignOut?.();
                    }}
                    className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      if (confirm("Are you sure you want to delete your account? This will permanently erase all your customs declarations and history.")) {
                        onDeleteAccount?.();
                      }
                    }}
                    className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sub-navigation Row (Tabs + Profile on desktop) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end border-t border-[#F3F4F6] pt-2.5 md:border-t-0 md:pt-0">
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

          {/* Desktop User profile block */}
          {user && (
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-[#E5E7EB] hover:border-[#0A0A0A] bg-white transition-all cursor-pointer"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#0C2461] flex items-center justify-center text-white text-[10px] font-bold">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-[11px] text-[#6B7280] font-semibold max-w-[80px] truncate">
                  {user.name || user.email}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-10 mt-1 w-44 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-[#F3F4F6] mb-1">
                    <p className="text-[11px] font-semibold text-[#0A0A0A] truncate">{user.name || 'User'}</p>
                    <p className="text-[9px] text-[#6B7280] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onSignOut?.();
                    }}
                    className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      if (confirm("Are you sure you want to delete your account? This will permanently erase all your customs declarations and history.")) {
                        onDeleteAccount?.();
                      }
                    }}
                    className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

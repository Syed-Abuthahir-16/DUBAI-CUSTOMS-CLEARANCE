import React from 'react';
import { Activity, Layers } from 'lucide-react';

interface DynamicIslandProps {
  activeTab: 'dashboard' | 'editor';
  onNavigate: (tab: 'dashboard' | 'editor') => void;
  hasActiveDeclaration: boolean;
  isProcessing: boolean;
  processedCount: number;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  activeTab,
  onNavigate,
  hasActiveDeclaration,
  isProcessing,
  processedCount
}) => {
  return (
    <div className="w-full px-4 pt-4 flex justify-center z-50">
      <div 
        className="w-full max-w-5xl h-[54px] bg-[#F2F2F2]/90 backdrop-blur-md border border-border-light rounded-full px-5 py-1.5 flex items-center justify-between shadow-sm transition-all"
        style={{ borderRadius: '50px' }}
      >
        {/* Brand/Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-7 h-7 rounded-full bg-accent-orange flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
            D
          </div>
          <span className="font-mono text-xs font-bold tracking-widest text-text-primary">
            DUBAI<span className="text-accent-orange">_CUSTOMS</span>
          </span>
        </div>

        {/* Dynamic Island Status Widget */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-1 bg-white/60 border border-white/40 rounded-full text-xs font-mono">
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-accent-violet animate-pulse" />
              <span className="text-accent-violet font-semibold animate-pulse">AI extracting details...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>System Ready</span>
              <span className="text-border-light">|</span>
              <span className="font-semibold text-text-primary">{processedCount} drafts prepared</span>
            </div>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all font-mono ${
              activeTab === 'dashboard'
                ? 'bg-text-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/40'
            }`}
          >
            Dashboard
          </button>
          
          {hasActiveDeclaration && (
            <button
              onClick={() => onNavigate('editor')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all font-mono flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-accent-violet text-white glow-violet'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/40'
              }`}
            >
              <Layers className="w-3 h-3" />
              Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { User, Shield, Info, LogOut, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  user: { name?: string; email?: string; avatar?: string };
  processedTodayCount: number;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  processedTodayCount,
  onSignOut,
  onDeleteAccount
}) => {
  const uploadPercentage = Math.min((processedTodayCount / 4) * 100, 100);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 animate-in-up">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] pb-4">
        <h2 className="text-lg font-bold text-[#0A0A0A] tracking-tight">System Settings</h2>
        <p className="text-xs text-[#6B7280] mt-0.5">Manage your broker profile and usage limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 columns: Cards */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* About Profile Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3">
              <User className="w-4 h-4 text-[#0C2461]" />
              <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">About Profile</h3>
            </div>
            
            <div className="flex items-center gap-4 py-2">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-14 h-14 rounded-full object-cover border border-[#E5E7EB]" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#E0E7FF] flex items-center justify-center text-xl font-bold text-[#0C2461]">
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              
              <div>
                <p className="text-sm font-bold text-[#0A0A0A]">{user.name || 'Customs Broker'}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-[#0C2461] bg-[#E0E7FF] px-2 py-0.5 rounded">Customs Broker</span>
                  <span className="text-[10px] font-bold text-gray-600 bg-gray-150 px-2 py-0.5 rounded">Active Agent</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[#F3F4F6] pt-4 text-xs text-[#6B7280]">
              <div>
                <p className="font-bold text-[#0A0A0A]">Brokerage Group</p>
                <p className="mt-0.5">Dubai Logistics Port Authority</p>
              </div>
              <div>
                <p className="font-bold text-[#0A0A0A]">Mirsal 2 Port ID</p>
                <p className="font-mono mt-0.5">DXB-7729-M2</p>
              </div>
            </div>
          </div>

          {/* Usage & Limitations Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3">
              <Shield className="w-4 h-4 text-[#0C2461]" />
              <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">Usage & Limits</h3>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#0A0A0A] mb-1.5">
                <span>Daily PDF Uploads</span>
                <span className={processedTodayCount >= 4 ? 'text-red-600' : 'text-[#0C2461]'}>
                  {processedTodayCount} / 4 PDFs processed today
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div 
                  className={`h-full transition-all duration-500 ${processedTodayCount >= 4 ? 'bg-red-500' : 'bg-[#0C2461]'}`}
                  style={{ width: `${uploadPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-[#6B7280] mt-2">
                {processedTodayCount >= 4 
                  ? '⚠ You have reached your daily upload limit for the sandbox account plan. Resetting in 24 hours.' 
                  : 'Your daily sandbox account quota allows up to 4 commercial invoice PDF extractions per day.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Profile actions panel */}
        <div className="flex flex-col gap-6">
          {/* Support Widget */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-3">
              <Info className="w-4 h-4 text-[#0C2461]" />
              <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">Account Actions</h3>
            </div>
            
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Sign out of your customs brokerage workspace, or request account data purge.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={onSignOut}
                className="w-full h-10 border border-[#E5E7EB] text-[#0A0A0A] bg-white hover:bg-[#F9FAFB] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
              
              <button
                onClick={onDeleteAccount}
                className="w-full h-10 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

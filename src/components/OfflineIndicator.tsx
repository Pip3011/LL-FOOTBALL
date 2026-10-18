import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 text-slate-950 font-bold px-3.5 py-2 text-xs shadow-xl backdrop-blur-sm border border-amber-300 animate-in slide-in-from-bottom duration-200">
      <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
      <span>⚡ Running Offline — All pitch &amp; ref assignments saved locally</span>
    </div>
  );
};

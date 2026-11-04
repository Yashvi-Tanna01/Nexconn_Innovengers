import React from 'react';
import { useNetworkStatus } from '../../utils/useNetworkStatus';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';

export const NetworkBanner: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-3.5 rounded-2xl border shadow-soft-xl flex items-center justify-between text-xs font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
        !isOnline
          ? 'bg-rose-50/95 border-rose-200 text-rose-900 backdrop-blur-md'
          : 'bg-emerald-50/95 border-emerald-200 text-emerald-900 backdrop-blur-md'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {!isOnline ? (
          <WifiOff size={16} className="text-rose-600 flex-shrink-0 animate-pulse" />
        ) : (
          <Wifi size={16} className="text-emerald-600 flex-shrink-0" />
        )}
        <span>
          {!isOnline
            ? 'Offline Mode Active. Cached spatial twin operational.'
            : 'Connection Restored. Synchronizing civic network...'}
        </span>
      </div>
    </div>
  );
};


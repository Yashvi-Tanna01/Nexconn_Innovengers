import React from 'react';
import { motion } from 'framer-motion';
import { AntahChromaticWordmark } from './AntahChromaticWordmark';
import { Radio } from 'lucide-react';

interface PageLoadingStateProps {
  message?: string;
  subMessage?: string;
  minHeight?: string;
  className?: string;
  theme?: 'light' | 'dark';
  cycleId?: number | string;
}

export const PageLoadingState: React.FC<PageLoadingStateProps> = ({
  message = 'Initializing spatial civic digital twin...',
  subMessage = 'ANTAH • Small signals today, safer tomorrow.',
  minHeight = 'h-[540px] sm:h-[620px] lg:h-[700px]',
  className = '',
  theme = 'light',
  cycleId,
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`w-full ${minHeight} rounded-3xl flex flex-col items-center justify-center p-6 relative overflow-hidden select-none border transition-all ${
        isLight
          ? 'bg-gradient-to-b from-[#FAFBF8] to-[#F3F4F1] border-slate-200/90 shadow-soft-md'
          : 'bg-slate-950 border-slate-800 shadow-soft-lg'
      } ${className}`}
    >
      {/* Ambient Radial Accent */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-[radial-gradient(circle_at_50%_45%,rgba(13,148,136,0.07),transparent_65%)]'
            : 'bg-[radial-gradient(circle_at_50%_45%,rgba(13,148,136,0.18),transparent_65%)]'
        }`}
      />

      {/* Centerpiece ANTAH Chromatic Kinetic Wordmark */}
      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        <AntahChromaticWordmark
          size="md"
          theme={theme}
          showSubtitle={true}
          showTagline={false}
          statusMessage={message}
          cycleId={cycleId}
          cadence="standard"
        />

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`text-xs font-mono italic mt-3 ${
            isLight ? 'text-antah-slate' : 'text-slate-400'
          }`}
        >
          {subMessage}
        </motion.p>
      </div>
    </div>
  );
};

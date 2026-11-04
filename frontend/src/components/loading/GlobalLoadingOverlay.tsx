import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { AntahChromaticWordmark } from './AntahChromaticWordmark';
import { Radio } from 'lucide-react';

export const GlobalLoadingOverlay: React.FC = () => {
  const { loading, isAppInitialized } = useLoading();

  if (!isAppInitialized || !loading.isActive) {
    return null;
  }

  return (
    <AnimatePresence>
      {loading.isActive && (
        <motion.div
          key="antah-global-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28 } }}
          className="fixed inset-0 z-[9990] bg-[#FBFBF9]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
        >
          {/* Translucent Frosted Glass Card Container */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-white/95 border border-slate-200/90 shadow-2xl flex flex-col items-center text-center space-y-6"
          >
            {/* Chromatic Wordmark in Light Theme */}
            <AntahChromaticWordmark
              size="md"
              theme="light"
              showSubtitle={true}
              showTagline={false}
              statusMessage="CIVIC OPERATION ACTIVE"
            />

            {/* Active Operation Message */}
            <div className="space-y-2 max-w-md">
              <p className="text-sm sm:text-base font-bold text-antah-navy tracking-tight">
                {loading.message}
              </p>
              <p className="text-xs text-antah-teal font-mono italic">
                &ldquo;Small signals today, safer tomorrow.&rdquo;
              </p>
            </div>

            {/* Micro Telemetry Bar */}
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-antah-teal to-transparent rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

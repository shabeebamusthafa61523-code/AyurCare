import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HeartPulse } from 'lucide-react';

export default function SplashScreen({ onFinish, minDuration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) {
        setTimeout(onFinish, 400); // allow exit animation to complete
      }
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-white via-emerald-50/40 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 backdrop-blur-md select-none overflow-hidden"
        >
          {/* Subtle Ayurvedic Background Glow Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-300/15 dark:bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Central Logo & Branding Content */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center text-center px-6"
          >
            {/* Login Logo with Floating Glow */}
            <div className="relative mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.03, 1],
                  rotate: [0, 0.5, -0.5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'easeInOut'
                }}
                className="relative z-10"
              >
                <img
                  src="/login-logo.png"
                  alt="AyurCare Hospital & Polyclinic"
                  className="h-28 sm:h-36 md:h-40 w-auto object-contain drop-shadow-2xl"
                />
              </motion.div>
            </div>

            {/* Subtitle / Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center space-x-2 text-xs sm:text-sm font-medium tracking-wider text-emerald-800/80 dark:text-emerald-300/90 uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Authentic Ayurvedic Care & Polyclinic CRM</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            </motion.div>

            {/* Smooth Animated Loading Bar */}
            <div className="w-48 sm:w-56 h-1.5 bg-emerald-200/50 dark:bg-emerald-950/60 rounded-full overflow-hidden mt-6 shadow-inner">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: minDuration / 1000,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              />
            </div>

            {/* Loading Status Pulse */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium tracking-wide"
            >
              Restoring balance & wellness...
            </motion.p>
          </motion.div>

          {/* Footer Accreditation Note */}
          <div className="absolute bottom-6 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 tracking-wider">
            AyurCare Health Systems • Classical Panchakarma Excellence
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

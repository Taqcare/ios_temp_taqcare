
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface IntroSplashProps {
  onComplete: () => void;
}

const IntroSplash = ({ onComplete }: IntroSplashProps) => {
  useEffect(() => {
    // Automatically hide splash screen after animation completes
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // 2 seconds total duration
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20, 
            delay: 0.2 
          }}
        >
          <img 
            src="/lovable-uploads/logo-preto.png" 
            alt="Taqcare Logo" 
            className="w-32 h-32"
          />
        </motion.div>
        
        <motion.div
          className="mb-12 text-black text-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p className="text-sm mb-1">From</p>
          <p className="text-xl font-medium">Taqcare</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default IntroSplash;

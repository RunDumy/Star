'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface CosmicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function CosmicModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: CosmicModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md mx-auto bg-cosmic-radial rounded-2xl border border-cosmic-glow/30 shadow-cosmic-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-star-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-cosmic-purple/20 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-star-white" />
            </button>
          </div>
          <div className={className}>
            {children}
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cosmic-accent/10 via-transparent to-cosmic-gold/5 pointer-events-none" />
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  brandName?: string;
  slogan?: string;
  logoUrl?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  brandName = 'PURPLE PUFF',
  slogan = 'PREMIUM COSMIC STORE EXPERIENCE',
  logoUrl = '/logo.png'
}) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      const exitTimer = setTimeout(onFinish, 600);
      return () => clearTimeout(exitTimer);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      id="splash-screen"
      onClick={() => {
        setFadingOut(true);
        setTimeout(onFinish, 300);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-cosmic-dark cursor-pointer transition-opacity duration-700 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Cosmic background stars / glowing nebula */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-fuchsia-600/15 rounded-full blur-2xl" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-indigo-500 p-[2px] shadow-2xl glow-purple animate-bounce-subtle overflow-hidden">
            <div className="w-full h-full rounded-[22px] bg-[#120826] flex items-center justify-center relative overflow-hidden p-2">
              <img
                src={logoUrl || '/logo.png'}
                alt={brandName}
                className="w-full h-full object-contain filter drop-shadow-md"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Sparkles className="w-5 h-5 text-yellow-300 absolute top-2 right-2 animate-pulse" />
            </div>
          </div>
          {/* Subtle ring glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-3xl opacity-40 blur-lg -z-10 animate-pulse" />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white mb-2 font-display">
          {brandName}
        </h1>

        {/* Slogan */}
        <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-purple-300 uppercase">
          {slogan}
        </p>

        {/* Loading dots */}
        <div className="mt-12 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
        </div>
        <p className="text-[11px] text-purple-400/50 mt-4 tracking-wider">
          แตะเพื่อข้าม
        </p>
      </div>
    </div>
  );
};

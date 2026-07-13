import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { ExternalLink } from 'lucide-react';

interface LandingPageProps {
  handleLogin: () => void;
  isLoggingIn: boolean;
  logoShield: string;
}

export default function LandingPage({ handleLogin, isLoggingIn, logoShield }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion values for 3D parallax and look-at effect for both elements
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const translateX = useMotionValue(0);
  const translateY = useMotionValue(0);

  // Smooth springs to make the movement fluid and responsive
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 20 });
  const springTranslateX = useSpring(translateX, { stiffness: 100, damping: 20 });
  const springTranslateY = useSpring(translateY, { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Normalize coordinates to -1 to 1 based on center of screen
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
    const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);

    // Dynamic rotation angles
    rotateX.set(-mouseY * 20); // Tilt up/down
    rotateY.set(mouseX * 20);  // Turn left/right
    
    // Translation offsets
    translateX.set(mouseX * 15);
    translateY.set(mouseY * 15);
  };

  const handleMouseLeave = () => {
    // Return smoothly to center when mouse leaves the screen
    rotateX.set(0);
    rotateY.set(0);
    translateX.set(0);
    translateY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="h-screen h-[100dvh] w-full bg-gradient-to-tr from-[#EBF2FF] via-[#F3F6FF] to-[#E5F5FF] text-slate-800 selection:bg-zinc-900 selection:text-white overflow-hidden relative flex flex-col md:flex-row items-center justify-center p-6 sm:p-12 md:p-16" 
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      
      {/* Soft Elegant Fluid Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#2E5BFF]/10 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF5CE3]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#60A5FA]/10 blur-[140px] pointer-events-none" />

      {/* Dark Dot Grid Overlay on light background */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000000 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }}
      />

      {/* Two-Column Responsive Layout */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center justify-items-center h-full md:h-auto">
        
        {/* LEFT COLUMN: INTERACTIVE LLAMA WITH 3D ROTATION */}
        <div className="flex flex-col items-center justify-center w-full min-h-[220px] md:min-h-[400px]">
          <motion.div 
            style={{ 
              rotateX: springRotateX, 
              rotateY: springRotateY,
              x: springTranslateX,
              y: springTranslateY,
              transformStyle: "preserve-3d"
            }}
            className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* Elegant Back Glow for Llama */}
            <div className="absolute inset-0 bg-[#2E5BFF]/10 blur-[50px] rounded-full pointer-events-none animate-pulse duration-[5000ms]" />
            
            <img 
              src={logoShield} 
              alt="Centinela Llama Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(46,91,255,0.15)] select-none pointer-events-none" 
              referrerPolicy="no-referrer"
              style={{ transform: "translateZ(40px)" }}
            />
          </motion.div>
        </div>

        {/* RIGHT COLUMN: MODERN LIGHT LOGIN CARD & PARTNER */}
        <div className="flex flex-col items-center justify-center w-full">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              rotateX: useSpring(useMotionValue(0), { stiffness: 100, damping: 20 }),
              rotateY: useSpring(useMotionValue(0), { stiffness: 100, damping: 20 }),
              transformStyle: "preserve-3d"
            }}
            className="w-full max-w-md bg-white/45 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] border border-white/80 flex flex-col items-center shadow-[0_16px_48px_rgba(46,91,255,0.06)] hover:shadow-[0_24px_64px_rgba(46,91,255,0.1)] transition-shadow duration-500"
          >
            {/* Centinela Mini Badge */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#2E5BFF]/10 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-[#2E5BFF] rounded-full animate-ping" />
              <span className="text-[10px] font-bold tracking-wider text-[#2E5BFF] uppercase">SISTEMA SEGURO</span>
            </div>

            {/* Description Text */}
            <p className="text-sm sm:text-base text-slate-500 text-center leading-relaxed mb-8 max-w-xs font-medium">
              Inicia sesión con tu cuenta de Google para sincronizar y gestionar tu negocio directamente en tu hoja de cálculo.
            </p>

            {/* Iniciar Sesión Button */}
            <motion.button
              id="login-button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-13 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 border border-slate-200/80 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all disabled:opacity-50 text-sm cursor-pointer relative overflow-hidden"
            >
              {isLoggingIn ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-[#2E5BFF]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="font-semibold text-slate-500">Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.17 0 12 0 7.31 0 3.25 2.69 1.28 6.61l4.03 3.13C6.27 6.86 8.92 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.72 2.88c2.18-2.01 3.71-4.97 3.71-8.62z" />
                    <path fill="#FBBC05" d="M5.31 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.28 6.61C.47 8.24 0 10.07 0 12s.47 3.76 1.28 5.39l4.03-3.11z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.92l-3.72-2.88c-1.03.69-2.35 1.1-4.24 1.1-3.08 0-5.73-1.82-6.69-4.7L1.28 17.71C3.25 21.31 7.31 24 12 24z" />
                  </svg>
                  <span className="text-slate-700 font-bold">Iniciar sesión con Google</span>
                </div>
              )}
            </motion.button>
          </motion.div>

          {/* Socio Tecnológico Credit / Branding exactly as before */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 text-center z-10"
          >
            <a 
              href="https://www.empresarioenlinea.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white/70 hover:bg-white backdrop-blur-md rounded-2xl border border-orange-100 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md group text-xs font-semibold text-slate-600 cursor-pointer"
            >
              <span className="flex items-center space-x-1">
                <span className="text-[10px] text-slate-400 font-medium">Socio Tecnológico:</span>
                <span className="text-orange-600 font-bold">EmpresarioPuntoCom</span>
              </span>
              <div className="w-6 h-4 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 68" className="w-5 h-3.5 fill-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M38 10 C25 10 16 19 16 32 C16 45 25 54 38 54 H54 V44 H38 C34 44 30 41 30 37 V35 H48 V27 H30 V25 C30 21 34 18 38 18 H54 V10 H38 Z" fill="#FF6600"/>
                  <path d="M54 13 H80" stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="83" cy="13" r="3" fill="#FF6600"/>
                  <path d="M54 21 H62 L68 15 H78" stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="81" cy="15" r="3" fill="#FF6600"/>
                  <path d="M48 31 H58 L64 25 H78" stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="81" cy="25" r="3" fill="#FF6600"/>
                  <path d="M54 39 H60 L66 33 H74" stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="77" cy="33" r="3" fill="#FF6600"/>
                  <path d="M54 47 H62 L68 41 H78" stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="81" cy="41" r="3" fill="#FF6600"/>
                  <path d="M54 51 H74" stroke="#FF6600" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="77" cy="51" r="3" fill="#FF6600"/>
                </svg>
              </div>
              <ExternalLink size={10} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
            </a>
          </motion.div>
        </div>

      </div>

    </div>
  );
}

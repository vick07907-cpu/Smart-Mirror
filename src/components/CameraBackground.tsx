import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface CameraBackgroundProps {
  mode?: string;
}

export const CameraBackground: React.FC<CameraBackgroundProps> = ({ mode = 'default' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const getModeColor = () => {
    switch(mode) {
      case 'fitness': return 'rgba(16, 185, 129, 0.5)'; // Emerald
      case 'zen': return 'rgba(165, 180, 252, 0.5)'; // Indigo
      case 'news': return 'rgba(239, 68, 68, 0.5)'; // Red
      case 'productivity': return 'rgba(251, 191, 36, 0.5)'; // Amber
      default: return 'rgba(16, 185, 129, 0.3)'; // Default Emerald
    }
  };

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Video play error:", e));
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute min-w-full min-h-full object-cover scale-x-[-1] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" // Mirror effect
      />
      
      {/* Futuristic Overlays */}
      <div className={`absolute inset-0 transition-all duration-1000 ${mode === 'zen' ? 'bg-indigo-900/40 backdrop-blur-[8px]' : mode === 'fitness' ? 'bg-emerald-900/20 backdrop-blur-[1px]' : 'bg-black/40 backdrop-blur-[1px]'}`} />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: mode === 'zen' ? 20 : 10, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 w-full h-[1px] z-10"
        style={{ 
          backgroundColor: getModeColor(),
          boxShadow: `0 0 15px ${getModeColor()}`
        }}
      />

      {/* Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white/20 rounded-tl-2xl" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-white/20 rounded-tr-2xl" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-white/20 rounded-bl-2xl" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-white/20 rounded-br-2xl" />
    </div>
  );
};

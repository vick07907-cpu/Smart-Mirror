import React, { useState } from 'react';
import { CameraBackground } from './CameraBackground';
import { Overlay } from './Overlay';
import { VoiceInterface } from './VoiceInterface';
import { TimerOverlay } from './TimerOverlay';
import { AnimatePresence, motion } from 'motion/react';

export const SmartMirror: React.FC = () => {
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [weather, setWeather] = useState({ temp: '22°C', condition: 'Partly Cloudy' });
  const [tasks, setTasks] = useState<string[]>(['Check morning emails', 'Review project plan', 'Call the team']);
  const [mode, setMode] = useState<string>('default');

  const handleTimerRequested = (minutes: number) => {
    setTimerMinutes(minutes);
  };

  const handleTimerClose = () => {
    setTimerMinutes(null);
  };

  const handleAddTask = (task: string) => {
    setTasks(prev => [...prev, task]);
  };

  const handleUpdateWeather = (temp: string, condition: string) => {
    setWeather({ temp, condition });
  };

  const handleSwitchMode = (newMode: string) => {
    setMode(newMode);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden font-sans">
      <CameraBackground mode={mode} />
      
      <AnimatePresence mode="wait">
        {timerMinutes === null ? (
          <motion.div 
            key="main-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <Overlay weather={weather} tasks={tasks} mode={mode} />
            <VoiceInterface 
              onTimerRequested={handleTimerRequested} 
              onAddTask={handleAddTask}
              onUpdateWeather={handleUpdateWeather}
              onSwitchMode={handleSwitchMode}
              currentMode={mode}
            />
          </motion.div>
        ) : (
          <TimerOverlay 
            key="timer-ui"
            minutes={timerMinutes} 
            onClose={handleTimerClose} 
          />
        )}
      </AnimatePresence>

      {/* Subtle scanline effect */}
      <div className="fixed inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-10 md:opacity-20" />
      
      {/* Vignette effect */}
      <div className="fixed inset-0 pointer-events-none z-30 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
};

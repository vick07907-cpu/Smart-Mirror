import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cloud, Calendar, Clock, ListTodo, Activity, Moon, Newspaper, Briefcase, Info } from 'lucide-react';

interface OverlayProps {
  weather: { temp: string; condition: string };
  tasks: string[];
  mode: string;
  news?: string[];
}

export const Overlay: React.FC<OverlayProps> = ({ 
  weather, 
  tasks, 
  mode,
  news = ['AI technology reaches new heights', 'Global space mission announced', 'Breakthrough in renewable energy'] 
}) => {
  const [time, setTime] = useState(new Date());
  const [showCommands, setShowCommands] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getModeCommands = () => {
    switch(mode) {
      case 'fitness': return ['Start workout', 'Show heart rate', 'Set 30 min timer', 'Play gym music'];
      case 'zen': return ['Start meditation', 'Play rain sounds', 'Show breathing exercise', 'Set 10 min timer'];
      case 'news': return ['Read top stories', 'Show tech news', 'Update weather', 'Next story'];
      case 'productivity': return ['Show my calendar', 'Add task: Finish report', 'Start Pomodoro', 'List my tasks'];
      default: return ['Switch to Zen mode', 'Start Fitness mode', 'What is the weather?', 'Add task: Buy milk'];
    }
  };

  const renderModeContent = () => {
    switch(mode) {
      case 'fitness':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-emerald-400">
              <Activity className="w-12 h-12 animate-pulse" />
              <div className="text-4xl font-light">72 BPM</div>
            </div>
            <div className="text-xl font-medium opacity-80 italic">"Keep pushing, you're doing great!"</div>
          </motion.div>
        );
      case 'zen':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-indigo-300">
              <Moon className="w-12 h-12" />
              <div className="text-4xl font-light">Breathe In...</div>
            </div>
            <div className="text-xl font-medium opacity-80 italic">"The present moment is all we have."</div>
          </motion.div>
        );
      case 'productivity':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-amber-400">
              <Briefcase className="w-12 h-12" />
              <div className="text-4xl font-light">Focus Mode</div>
            </div>
            <div className="text-xl font-medium opacity-80">Next: Marketing Strategy Sync @ 2:00 PM</div>
          </motion.div>
        );
      default:
        return (
          <ul className="space-y-2 md:space-y-4">
            {tasks.slice(0, 3).map((task, i) => (
              <li key={i} className="text-lg md:text-xl font-medium border-l-2 border-white/20 pl-3 md:pl-4 py-0.5 md:py-1">
                {task}
              </li>
            ))}
          </ul>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-10 p-6 md:p-12 flex flex-col justify-between pointer-events-none text-white font-sans">
      {/* Top Section: Time and Weather */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          <div className="text-6xl md:text-8xl font-light tracking-tighter">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-lg md:text-2xl font-medium opacity-60 mt-1 md:mt-2">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit backdrop-blur-md border border-white/10">
            <div className={`w-2 h-2 rounded-full ${mode === 'default' ? 'bg-white' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">{mode} mode</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-start md:items-end"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <Cloud className="w-8 h-8 md:w-12 md:h-12" />
            <span className="text-4xl md:text-6xl font-light">{weather.temp}</span>
          </div>
          <div className="text-base md:text-xl font-medium opacity-60 mt-1 md:mt-2">{weather.condition}</div>
        </motion.div>
      </div>

      {/* Middle Section: News Ticker (Always visible in News mode, otherwise subtle) */}
      <div className={`absolute top-1/2 left-0 w-full overflow-hidden py-4 bg-white/5 backdrop-blur-sm border-y border-white/10 -translate-y-1/2 hidden md:block ${mode === 'news' ? 'opacity-100 scale-y-110' : 'opacity-40'}`}>
        <motion.div 
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="whitespace-nowrap flex gap-12 items-center"
        >
          {news.map((item, i) => (
            <span key={i} className="text-sm font-bold uppercase tracking-[0.3em] opacity-80 flex items-center gap-4">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom Section: Mode Content and Command List */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 w-full">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full md:max-w-md"
        >
          <div className="flex items-center gap-2 mb-3 md:mb-4 opacity-60 uppercase tracking-widest text-[10px] md:text-sm font-bold">
            {mode === 'fitness' ? <Activity className="w-4 h-4" /> : 
             mode === 'zen' ? <Moon className="w-4 h-4" /> : 
             mode === 'productivity' ? <Briefcase className="w-4 h-4" /> : 
             <ListTodo className="w-4 h-4" />}
            {mode === 'default' ? 'Upcoming Tasks' : `${mode} overview`}
          </div>
          {renderModeContent()}
        </motion.div>

        {/* Command List - Interactive via voice but shown for guidance */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl pointer-events-auto cursor-help group"
          onMouseEnter={() => setShowCommands(true)}
          onMouseLeave={() => setShowCommands(false)}
        >
          <div className="flex items-center gap-2 mb-4 justify-end opacity-60 uppercase tracking-widest text-xs font-bold">
            <Info className="w-4 h-4" />
            Voice Commands
          </div>
          <div className="flex flex-col gap-2 items-end">
            {getModeCommands().map((cmd, i) => (
              <div key={i} className="text-sm font-medium opacity-40 group-hover:opacity-100 transition-opacity">
                "{cmd}"
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

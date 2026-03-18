import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, MessageSquare, Search, Timer as TimerIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processCommand, getTTS, getThinkingResponse } from '../services/geminiService';

interface VoiceInterfaceProps {
  onTimerRequested: (minutes: number) => void;
  onAddTask: (task: string) => void;
  onUpdateWeather: (temp: string, condition: string) => void;
  onSwitchMode: (mode: string) => void;
  currentMode: string;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  onTimerRequested, 
  onAddTask, 
  onUpdateWeather,
  onSwitchMode,
  currentMode
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const lastProcessedRef = useRef<string>("");
  const shouldListenRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser. Use Chrome for the best experience.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      shouldListenRef.current = true;
      setError(null);
    };

    recognition.onerror = (event: any) => {
      // 'aborted' is common when stopping/starting quickly, ignore it
      if (event.error === 'aborted') return;
      
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied.");
        setIsListening(false);
        shouldListenRef.current = false;
      }
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const fullTranscript = (finalTranscript || interimTranscript).toLowerCase();
      setTranscript(fullTranscript);

      // Check for wake word or direct commands if already listening
      if (fullTranscript.includes("hey google") || fullTranscript.includes("ok google") || fullTranscript.includes("mirror")) {
        // Debounce processing
        if (fullTranscript !== lastProcessedRef.current && fullTranscript.length > 10) {
          handleVoiceCommand(fullTranscript);
          lastProcessedRef.current = fullTranscript;
        }
      }
    };

    recognition.onend = () => {
      // Only restart if we're supposed to be listening
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // Ignore errors if it's already started
            }
          }
        }, 300); // Small delay to prevent rapid-fire restarts
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      recognition.stop();
    };
  }, []); // Remove isListening dependency to avoid re-creating recognition object

  const toggleListening = () => {
    if (isListening) {
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      shouldListenRef.current = true;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Start error:", e);
        setIsListening(true);
      }
    }
  };

  const handleVoiceCommand = async (command: string) => {
    if (isProcessing) return;
    
    const cleanCommand = command.replace(/hey google|ok google|mirror/g, "").trim();
    if (!cleanCommand) return;

    setIsProcessing(true);
    setAiResponse("Processing...");
    
    try {
      // For very complex "why" or "how" questions, use thinking mode
      if (cleanCommand.split(" ").length > 10 || cleanCommand.startsWith("why") || cleanCommand.startsWith("how")) {
        setAiResponse("Analyzing complex query...");
        const thinkingResponse = await getThinkingResponse(cleanCommand);
        setAiResponse(thinkingResponse || "I've thought about it, but couldn't reach a conclusion.");
        if (thinkingResponse) await getTTS(thinkingResponse);
        return;
      }

      const response = await processCommand(cleanCommand);
      
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === "setTimer") {
            const minutes = (call.args as any).minutes;
            onTimerRequested(minutes);
            const msg = `Setting a timer for ${minutes} minutes.`;
            setAiResponse(msg);
            await getTTS(msg);
          } else if (call.name === "getWeather") {
            const location = (call.args as any).location;
            setAiResponse(`Checking weather for ${location}...`);
            const weatherText = response.text || `The weather in ${location} is currently pleasant.`;
            setAiResponse(weatherText);
            onUpdateWeather("24°C", "Sunny"); 
            await getTTS(weatherText);
          } else if (call.name === "addTask") {
            const task = (call.args as any).task;
            onAddTask(task);
            const msg = `Added task: ${task}`;
            setAiResponse(msg);
            await getTTS(msg);
          } else if (call.name === "switchMode") {
            const mode = (call.args as any).mode;
            onSwitchMode(mode);
            const msg = `Switching to ${mode} mode. How can I help you there?`;
            setAiResponse(msg);
            await getTTS(msg);
          }
        }
      } else {
        const text = response.text || "I'm not sure how to help with that.";
        setAiResponse(text);
        await getTTS(text);
      }
    } catch (err) {
      console.error("Command error:", err);
      setAiResponse("Sorry, I encountered an error.");
    } finally {
      setIsProcessing(false);
      setTranscript("");
      lastProcessedRef.current = "";
    }
  };

  return (
    <div className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 md:gap-6 w-full max-w-2xl px-4 md:px-6">
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/20 backdrop-blur-md border border-red-500/50 p-3 rounded-xl text-sm font-medium text-red-200 text-center w-full"
          >
            {error}
          </motion.div>
        )}
        
        {aiResponse && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-3xl text-lg md:text-xl font-medium text-center w-full shadow-2xl max-h-[40vh] overflow-y-auto"
          >
            {aiResponse}
            {isProcessing && <div className="mt-2 text-xs opacity-50 animate-pulse">Processing...</div>}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-3 md:p-4 rounded-full border border-white/10">
        <button 
          onClick={toggleListening}
          className={`p-4 md:p-6 rounded-full transition-all duration-500 ${isListening ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105' : 'bg-white/10 hover:bg-white/20'}`}
        >
          {isListening ? <Mic className="w-6 h-6 md:w-8 md:h-8 text-white" /> : <MicOff className="w-6 h-6 md:w-8 md:h-8 text-white/60" />}
        </button>

        <div className="flex flex-col min-w-[120px] md:min-w-[200px]">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40 mb-0.5 md:mb-1">
            {isListening ? "Listening..." : "Voice Control Off"}
          </span>
          <span className="text-xs md:text-sm font-medium opacity-60 line-clamp-1">
            {isListening ? (transcript || "Say 'Hey Google'...") : "Tap to activate"}
          </span>
        </div>

        {/* Manual trigger for flexibility */}
        {!isListening && (
          <button 
            onClick={() => {
              const q = prompt("What would you like to ask?");
              if (q) handleVoiceCommand(q);
            }}
            className="p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            title="Type a command"
          >
            <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white/40" />
          </button>
        )}
      </div>
    </div>
  );
};

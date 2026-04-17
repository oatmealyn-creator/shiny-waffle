import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Phone, User, Calendar, MessageSquare, ShieldCheck, Heart, Zap, Clock, AlertTriangle, Scale } from 'lucide-react';
import { sendMessage, ChatMessage } from './services/geminiService';

type EnergyMode = 'hyped' | 'nervous' | 'direct' | 'frustrated' | 'neutral';

const MODE_CONFIG: Record<EnergyMode, { color: string, icon: any, label: string, bg: string }> = {
  hyped: { color: '#00FF9D', icon: Zap, label: 'HYPED RESPONSE', bg: 'bg-primary/20' },
  nervous: { color: '#FFD700', icon: Heart, label: 'WARM & GENTLE', bg: 'bg-yellow-500/20' },
  direct: { color: '#FFFFFF', icon: Clock, label: 'FAST & EFFICIENT', bg: 'bg-white/20' },
  frustrated: { color: '#FF4444', icon: AlertTriangle, label: 'CALM ANCHOR', bg: 'bg-red-500/20' },
  neutral: { color: '#999999', icon: MessageSquare, label: 'ADAPTING...', bg: 'bg-neutral-500/10' }
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [energyMode, setEnergyMode] = useState<EnergyMode>('neutral');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    const greet = async () => {
      setIsLoading(true);
      const res = await sendMessage([{ role: 'user', content: 'Hello' }]);
      processResponse(res);
      setIsLoading(false);
    };
    greet();
  }, []);

  const processResponse = (raw: string) => {
    let text = raw;
    let mode: EnergyMode = 'neutral';

    const modeMatch = raw.match(/\[ENERGY_MODE:\s*(\w+)\]/);
    if (modeMatch) {
      mode = modeMatch[1].toLowerCase() as EnergyMode;
      text = raw.replace(/\[ENERGY_MODE:\s*\w+\]/, '').trim();
    }

    setEnergyMode(mode);
    setMessages(prev => [...prev, { role: 'model', content: text }]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = [...messages, { role: 'user', content: userMsg }];
      const response = await sendMessage(history);
      processResponse(response);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "SYSTEM: Connection lost. Re-establishing link to IronClad HQ..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-black overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <div className="absolute inset-0 z-5 pointer-events-none opacity-30 noise" />
      <div className="scanline" />

      <div className="w-full max-w-4xl glass rounded-3xl overflow-hidden flex flex-col h-[85vh] z-10 shadow-2xl border-white/5">
        {/* Header */}
        <header className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-linear-to-tr from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
                <User className="text-black" size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-2 border-black rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Jordan</h2>
              <p className="text-xs text-white/50 uppercase tracking-widest font-mono">IronClad Front-Desk</p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
             <div className="flex flex-col items-end">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter ${MODE_CONFIG[energyMode].bg}`} style={{ color: MODE_CONFIG[energyMode].color }}>
                  {React.createElement(MODE_CONFIG[energyMode].icon, { size: 12 })}
                  {MODE_CONFIG[energyMode].label}
                </div>
             </div>
             <div className="h-8 w-px bg-white/10 mx-2" />
             <div className="flex items-center gap-4 text-white/40">
                <ShieldCheck size={18} className="hover:text-primary transition-colors cursor-help" title="Unbreakable Safety Mode Active" />
                <Scale size={18} className="hover:text-primary transition-colors cursor-help" title="HIPAA/GDPR Compliant" />
             </div>
          </div>
        </header>

        {/* Message Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-white/10 border border-white/5 rounded-tr-none' 
                    : 'bg-primary/5 border border-primary/20 rounded-tl-none text-primary-50'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl rounded-tl-none">
                 <div className="flex gap-1.5">
                   <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                 </div>
               </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-black/60 border-t border-white/10">
          <form onSubmit={handleSend} className="relative flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Talk to Jordan..."
              disabled={isLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-hidden focus:border-primary/50 transition-all text-sm md:text-base placeholder:text-white/20"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary text-black p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
            >
              <Send size={20} />
            </button>
          </form>
          
          <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-white/30 uppercase tracking-widest font-mono justify-center">
            <div className="flex items-center gap-1"><Phone size={10} /> Simulated Voice Call</div>
            <div className="flex items-center gap-1"><MessageSquare size={10} /> Text Support Active</div>
            <div className="flex items-center gap-1"><Calendar size={10} /> Strategy Session Booking</div>
          </div>
        </div>
      </div>

      {/* Aesthetic Accents */}
      <div className="z-1 fixed bottom-8 left-8 hidden lg:block">
        <div className="flex flex-col gap-2">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">System.Status</div>
            <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-primary shadow-[0_0_10px_#00FF9D]" />
                <div className="text-xs font-mono text-primary animate-pulse">JORDAN_ONLINE_SECURE</div>
            </div>
        </div>
      </div>
    </div>
  );
}

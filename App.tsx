
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, Send, Volume2, Sparkles, Image as ImageIcon, RefreshCcw, User, Star, Share2, Check } from 'lucide-react';
import { Vibe } from './types';
import * as gemini from './services/geminiService';

// The provided high-fashion portrait URL
const MUSE_IMAGE = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=1000";

const HeartBackground = () => {
  const hearts = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 20 + 10}px`,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 10}s`,
      opacity: Math.random() * 0.5 + 0.1
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map(h => (
        <div 
          key={h.id}
          className="heart text-rose-300"
          style={{
            left: h.left,
            fontSize: h.size,
            animationDuration: h.duration,
            animationDelay: h.delay,
            opacity: h.opacity
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [message, setMessage] = useState("You are the most beautiful vision I have ever seen. 🌹");
  const [vibe, setVibe] = useState<Vibe>(Vibe.ROMANTIC);
  const [recipient, setRecipient] = useState("");
  const [imageUrl, setImageUrl] = useState(MUSE_IMAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showShareFeedback, setShowShareFeedback] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Handle URL parsing on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('r'); // recipient
    const m = params.get('m'); // message
    const v = params.get('v'); // vibe

    if (r) setRecipient(decodeURIComponent(atob(r)));
    if (m) setMessage(decodeURIComponent(atob(m)));
    if (v && Object.values(Vibe).includes(v as Vibe)) setVibe(v as Vibe);
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const handleGenerateMessage = async (newVibe: Vibe) => {
    setIsLoading(true);
    setVibe(newVibe);
    try {
      const msg = await gemini.generateRomanticMessage(newVibe, recipient || "my love");
      setMessage(msg);
    } catch (error) {
      console.error(error);
      setMessage("You mean more to me than words can explain. ❤️");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const url = await gemini.generateLoveImage(`High-fashion editorial style, beautiful woman in a black turtleneck, moody red background, dramatic lighting, cinematic portrait, luxury aesthetic`);
      setImageUrl(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSpeak = async () => {
    initAudio();
    if (!audioCtxRef.current) return;
    setIsSpeaking(true);
    try {
      await gemini.speakMessage(message, audioCtxRef.current);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleShare = async () => {
    // We encode the content to base64 to handle special chars and emojis in the URL
    const rEnc = btoa(encodeURIComponent(recipient || "My Love"));
    const mEnc = btoa(encodeURIComponent(message));
    const vEnc = vibe;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?r=${rEnc}&m=${mEnc}&v=${vEnc}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "A Valentine for You ❤️",
          text: `Check out this special Valentine message for ${recipient || "you"}!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareFeedback(true);
        setTimeout(() => setShowShareFeedback(false), 3000);
      } catch (err) {
        alert("Could not copy link to clipboard.");
      }
    }
  };

  const [noPos, setNoPos] = useState({ top: 'auto', left: 'auto' });
  const moveNoButton = () => {
    const randomTop = Math.floor(Math.random() * 70) + 15;
    const randomLeft = Math.floor(Math.random() * 70) + 15;
    setNoPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
  };

  if (accepted) {
    return (
      <div className="min-h-screen bg-rose-600 flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
        <HeartBackground />
        <div className="text-center space-y-8 animate-bounce z-10">
          <Heart className="w-32 h-32 mx-auto fill-current text-white drop-shadow-lg" />
          <h1 className="text-6xl font-romantic font-bold">YES! ❤️</h1>
          <p className="text-2xl font-serif italic">My heart is yours forever.</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setAccepted(false)}
              className="px-8 py-3 bg-white text-rose-600 rounded-full font-bold hover:bg-rose-50 transition-all shadow-xl"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 md:p-8 overflow-x-hidden">
      <HeartBackground />
      
      <header className="max-w-4xl mx-auto text-center mb-12 relative z-10">
        <h1 className="text-6xl md:text-8xl font-romantic font-bold text-rose-600 mb-2 drop-shadow-sm">
          Be My Valentine
        </h1>
        <p className="text-slate-400 text-sm font-semibold uppercase tracking-[0.3em] font-sans">Elegance • Romance • Forever</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
        {/* Left Section: The Card */}
        <div className="relative group perspective-1000">
          <div className="absolute -inset-2 bg-gradient-to-r from-rose-300 via-rose-500 to-amber-300 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-rose-100 gold-glow transform transition-all duration-500 group-hover:-rotate-1">
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
              {isGeneratingImage && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                  <RefreshCcw className="w-12 h-12 text-white animate-spin mb-4" />
                  <p className="text-white font-serif italic text-xl animate-pulse">Capturing a new vision...</p>
                </div>
              )}
              
              <img 
                src={imageUrl} 
                alt="The Muse" 
                className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${isGeneratingImage ? 'opacity-40 grayscale' : 'opacity-100'}`}
              />

              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setImageUrl(MUSE_IMAGE)}
                    className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-lg ${imageUrl === MUSE_IMAGE ? 'bg-rose-600 text-white' : 'bg-white/80 text-rose-600 hover:bg-rose-500 hover:text-white'}`}
                    title="Original Muse"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="p-3 bg-white/80 hover:bg-rose-500 hover:text-white text-rose-600 rounded-full backdrop-blur-md shadow-lg transition-all active:scale-90 disabled:opacity-50"
                    title="Generate Inspired Art"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Muse Edition</span>
                </div>
              </div>
            </div>

            <div className="p-10 text-center min-h-[220px] flex flex-col justify-center bg-gradient-to-b from-white to-rose-50">
              <div className={`transition-all duration-700 ${isLoading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <p className="text-3xl md:text-4xl font-romantic text-rose-800 leading-tight italic px-4">
                  "{message}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Interaction */}
        <div className="space-y-8">
          <div className="glass-card p-10 rounded-3xl shadow-xl space-y-8 border-2 border-white">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">For My Dearest...</label>
              <input 
                type="text" 
                placeholder="Name of your Valentine"
                className="w-full px-6 py-4 rounded-2xl border-2 border-rose-50 focus:border-rose-300 outline-none transition bg-white/50 text-xl font-serif italic"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Choose the Tone</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(Vibe).map((v) => (
                  <button
                    key={v}
                    onClick={() => handleGenerateMessage(v)}
                    disabled={isLoading}
                    className={`px-4 py-4 rounded-2xl text-sm font-bold border transition-all active:scale-95 flex items-center justify-center gap-3 ${
                      vibe === v 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-200 -translate-y-1' 
                        : 'bg-white text-rose-500 border-rose-100 hover:bg-rose-50 hover:border-rose-200'
                    }`}
                  >
                    {isLoading && vibe === v ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-rose-100 grid grid-cols-4 gap-3">
              <button 
                onClick={handleSpeak}
                disabled={isSpeaking}
                className="col-span-2 flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-2xl disabled:opacity-50 group"
              >
                {isSpeaking ? (
                  <RefreshCcw className="w-6 h-6 animate-spin" />
                ) : (
                  <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-lg">Listen</span>
              </button>
              
              <button 
                onClick={handleShare}
                className={`col-span-1 flex items-center justify-center py-5 rounded-2xl font-bold transition-all active:scale-95 shadow-lg border-2 ${showShareFeedback ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-rose-600 border-rose-100 hover:bg-rose-50'}`}
                title="Share this creation"
              >
                {showShareFeedback ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
              </button>

              <button 
                onClick={() => handleGenerateMessage(vibe)}
                disabled={isLoading}
                className="col-span-1 py-5 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-2xl font-bold hover:bg-rose-100 transition-all active:scale-95"
                title="Regenerate Message"
              >
                <RefreshCcw className={`w-6 h-6 mx-auto ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {showShareFeedback && (
              <p className="text-emerald-600 text-center text-xs font-bold uppercase tracking-wider animate-pulse">
                Link copied to clipboard! Send it to your Valentine.
              </p>
            )}
          </div>

          {/* The Question */}
          <div className="bg-rose-600 p-12 rounded-[2.5rem] shadow-2xl text-white text-center space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-rose-500/50 pointer-events-none"></div>
            
            <Heart className="absolute -top-12 -left-12 w-48 h-48 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            <Heart className="absolute -bottom-12 -right-12 w-48 h-48 opacity-10 -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            
            <div className="relative z-10 space-y-4">
              <h2 className="text-5xl font-romantic font-bold drop-shadow-md">Will you be my Valentine?</h2>
              <p className="text-rose-100 font-serif italic text-lg opacity-80">Every second with you is a gift.</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative z-10">
              <button 
                onClick={() => setAccepted(true)}
                className="px-16 py-5 bg-white text-rose-600 rounded-full font-bold text-2xl hover:bg-rose-50 hover:scale-110 hover:rotate-2 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.3)]"
              >
                YES!
              </button>
              
              <button 
                onMouseEnter={moveNoButton}
                onClick={moveNoButton}
                style={{ 
                  position: noPos.top === 'auto' ? 'relative' : 'fixed',
                  top: noPos.top,
                  left: noPos.left,
                  zIndex: 1000,
                  transition: 'all 0.1s ease-out'
                }}
                className="px-10 py-4 bg-transparent text-rose-200 rounded-full font-bold text-lg border-2 border-rose-400 hover:text-white hover:border-white transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto mt-24 text-center pb-12 space-y-6 relative z-10">
        <div className="flex justify-center gap-4">
          <div className="w-2 h-2 rounded-full bg-rose-200"></div>
          <div className="w-2 h-2 rounded-full bg-rose-300"></div>
          <div className="w-2 h-2 rounded-full bg-rose-200"></div>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-3">
          Made with <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" /> For My Muse
        </p>
      </footer>
    </div>
  );
};

export default App;

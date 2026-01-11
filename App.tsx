
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Copy, Check, Menu, X, Wand2, Download, Loader2, Sparkles, Wallet, Coins, Search, ShoppingCart, ChevronDown, Pencil, Eraser, Trash2, Zap, Rocket, Type, AlertCircle, Dice6, Mail, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";

const CONTRACT_ADDRESS = "DvRKC2rex4C4M93t2ue2ndkx3yM451Vf6tHNGqsCKmKN";
const X_OFFICIAL_URL = "https://x.com/"; 
const LOGO_URL = "https://pbs.twimg.com/media/G-Y4GksWwAApfj5?format=jpg&name=small";
const PUMP_FUN_URL = `https://pump.fun/coin/${CONTRACT_ADDRESS}`;
const THEME_PINK = "#f472b6";

const XLogo = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298l13.31 17.41z" />
  </svg>
);

const SectionReveal: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className, id }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.section>
);

// New SpermSwarm Component
const SpermSwarm: React.FC = () => {
  const swimmers = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      // Start mostly from bottom and sides
      initialX: Math.random() * 100, 
      initialY: 90 + Math.random() * 20, 
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 5,
      scale: 0.5 + Math.random() * 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {swimmers.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          initial={{ left: `${s.initialX}%`, top: `${s.initialY}%`, opacity: 0 }}
          animate={{ 
            left: "50%", // Target center (logo x)
            top: "15%",  // Target top (logo y)
            opacity: [0, 1, 1, 0] 
          }}
          transition={{ 
            duration: s.duration, 
            delay: s.delay, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ transform: `scale(${s.scale})` }}
        >
          {/* Sperm SVG shape */}
          <div className="relative w-8 h-20 origin-center rotate-45">
             {/* Head */}
             <div className="w-3 h-4 bg-pink-400 rounded-full absolute top-0 left-1/2 -translate-x-1/2 blur-[1px]"></div>
             {/* Tail (Wiggling SVG) */}
             <svg className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-16 overflow-visible" viewBox="0 0 10 40">
                <path 
                  d="M5 0 Q 10 10 5 20 T 5 40" 
                  fill="none" 
                  stroke="#f472b6" 
                  strokeWidth="2"
                  className="animate-wiggle"
                  style={{ opacity: 0.6 }}
                />
             </svg>
          </div>
        </motion.div>
      ))}
      <style>{`
        @keyframes wiggle {
          0% { d: path("M5 0 Q 0 10 5 20 T 5 40"); }
          50% { d: path("M5 0 Q 10 10 5 20 T 5 40"); }
          100% { d: path("M5 0 Q 0 10 5 20 T 5 40"); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

const MarqueeBar: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-pink-400 text-black overflow-hidden font-black uppercase border-y-4 border-black ${className} relative z-20`}>
    <div className="flex animate-marquee gap-12 md:gap-20 whitespace-nowrap items-center">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="text-xl">●</span>
          <span>THE EGG IS RARE</span>
          <span className="text-xl">●</span>
          <span>$EGG</span>
        </div>
      ))}
    </div>
  </div>
);

const DrawingBoard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [mode, setMode] = useState<'pen' | 'eraser'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        const context = canvas.getContext('2d');
        if (context) {
          context.scale(2, 2);
          context.lineCap = 'round';
          context.strokeStyle = THEME_PINK;
          context.lineWidth = 5;
          context.fillStyle = "black";
          context.fillRect(0, 0, rect.width, rect.height);
          contextRef.current = context;
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: (e as React.TouchEvent).touches[0].clientX - rect.left,
        y: (e as React.TouchEvent).touches[0].clientY - rect.top
      };
    } else {
      return {
        x: (e as React.MouseEvent).nativeEvent.offsetX,
        y: (e as React.MouseEvent).nativeEvent.offsetY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!contextRef.current) return;
    const { x, y } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const { x, y } = getCoordinates(e);
    contextRef.current.strokeStyle = mode === 'pen' ? THEME_PINK : 'black';
    contextRef.current.lineWidth = mode === 'pen' ? 5 : 25;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    if ('touches' in e && e.cancelable) e.preventDefault();
  };

  const stopDrawing = () => {
    if (contextRef.current) contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    context.fillStyle = "black";
    const rect = canvas.getBoundingClientRect();
    context.fillRect(0, 0, rect.width, rect.height);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'my-egg.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <SectionReveal id="draw" className="py-20 md:py-32 px-4 md:px-6 bg-black relative">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
        <div className="text-center">
          <h2 className="text-5xl md:text-7xl text-pink-400 mb-2 pink-glow uppercase leading-none">Egg Studio</h2>
          <p className="text-gray-400 text-xl tracking-widest">DECORATE THE ORIGIN</p>
        </div>
        
        <div className="w-full relative">
           {/* Canvas Container */}
           <div className="bg-pink-900/10 border-4 border-pink-400 rounded-3xl p-2 md:p-4 shadow-[0_0_30px_#831843] mx-auto w-full md:w-[80%] aspect-[4/3] md:aspect-video">
              <div className="relative bg-black rounded-2xl overflow-hidden cursor-crosshair touch-none w-full h-full">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full"
                />
              </div>
           </div>

           {/* Floating Tools */}
           <div className="mt-8 flex flex-wrap justify-center gap-4 bg-black/80 backdrop-blur-md border border-pink-400/30 p-4 rounded-full max-w-fit mx-auto shadow-2xl">
             <button onClick={() => setMode('pen')} className={`p-3 rounded-full border-2 transition-all ${mode === 'pen' ? 'bg-pink-400 text-black border-pink-400' : 'bg-transparent text-pink-400 border-pink-400'}`}><Pencil size={24} /></button>
             <button onClick={() => setMode('eraser')} className={`p-3 rounded-full border-2 transition-all ${mode === 'eraser' ? 'bg-pink-400 text-black border-pink-400' : 'bg-transparent text-pink-400 border-pink-400'}`}><Eraser size={24} /></button>
             <div className="w-[1px] bg-pink-400/30 mx-2"></div>
             <button onClick={clearCanvas} className="p-3 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-all"><Trash2 size={24} /></button>
             <button onClick={downloadDrawing} className="p-3 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all"><Download size={24} /></button>
           </div>
        </div>
      </div>
    </SectionReveal>
  );
};

const MemeGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [memeText, setMemeText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const randomScenarios = [
    "A giant pink egg sitting on the Iron Throne",
    "An egg cracking open to reveal a galaxy inside",
    "An egg wearing sunglasses cool skating",
    "An egg floating in zero gravity space",
    "An egg commanding an army of sperms",
    "An egg meditating in a zen garden",
  ];

  const handleRandom = () => {
    const scenario = randomScenarios[Math.floor(Math.random() * randomScenarios.length)];
    setPrompt(scenario);
    generateMeme(scenario);
  };

  const getLogoBase64 = async () => {
    try {
      const response = await fetch(LOGO_URL);
      const blob = await response.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  };

  const generateMeme = async (overridePrompt?: string) => {
    const activePrompt = (overridePrompt || prompt).trim();
    if (!activePrompt || generating) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const logoData = await getLogoBase64();
      
      const contents: any[] = [];
      
      if (logoData) {
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: logoData
          }
        });
      }

      const instruction = `
        STYLE: Crude primitive marker doodle, simple 2D sketch.
        COLORS: Strictly Pure Black and Pink (#f472b6) ONLY.
        MANDATORY CHARACTER DESIGN: An EGG. A simple, perfect, oval-shaped EGG. Minimalist style.
        BACKGROUND: Absolute solid black.
        SCENE: ${activePrompt}.
        ${memeText ? `Include text "${memeText.toUpperCase()}" in hand-drawn messy pink marker letters.` : ""}
        NO GRADIENTS. NO SHADING. ONLY FLAT PINK AND BLACK.
      `;

      contents.push({ text: instruction });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: contents },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData) {
        setResultImage(`data:image/png;base64,${part.inlineData.data}`);
      } else {
        throw new Error("No image generated. Please check your API key.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SectionReveal id="incubator" className="py-20 md:py-32 px-4 md:px-6 bg-black border-t border-pink-900/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Sparkles size={40} className="mx-auto mb-4 text-pink-400 animate-pulse" />
          <h2 className="text-5xl md:text-8xl text-pink-400 mb-4 pink-glow uppercase">Incubator</h2>
          <p className="text-lg md:text-xl text-white/50 tracking-widest italic">GENERATE RARE ARTIFACTS</p>
        </div>

        <div className="flex flex-col gap-8">
            {/* Display Area - Centered & Prominent */}
            <div className="w-full max-w-2xl mx-auto aspect-square bg-pink-900/5 rounded-3xl border-2 border-dashed border-pink-400/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_50px_rgba(244,114,182,0.15)]">
               <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-20 h-24 bg-pink-400 rounded-full animate-bounce blur-[2px]"></div>
                      <div className="absolute top-0 left-0 w-20 h-24 border-2 border-black rounded-full animate-bounce"></div>
                    </div>
                    <p className="text-pink-400 animate-pulse text-sm tracking-widest mt-8">INCUBATING...</p>
                  </motion.div>
                ) : resultImage ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative group">
                    <img src={resultImage} className="w-full h-full object-contain p-4" />
                    <a href={resultImage} download="egg-meme.png" className="absolute bottom-6 right-6 bg-pink-400 text-black p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110"><Download size={24} /></a>
                  </motion.div>
                ) : (
                  <div className="text-center opacity-30 flex flex-col items-center gap-4">
                    <div className="w-32 h-40 border-4 border-pink-400 rounded-[50%] flex items-center justify-center">
                        <span className="text-6xl">?</span>
                    </div>
                    <p className="tracking-widest font-bold">AWAITING INPUT</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls Area - Below */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-pink-900/5 border border-pink-400/20 p-6 rounded-2xl">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-pink-400 font-bold tracking-widest text-xs">DNA SEQUENCE (PROMPT)</label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="An egg floating in the cosmos..."
                    className="w-full bg-black/50 border border-pink-400/30 rounded-lg p-3 text-pink-100 focus:border-pink-400 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-pink-400 font-bold tracking-widest text-xs">INSCRIPTION</label>
                  <input
                    type="text"
                    value={memeText}
                    onChange={(e) => setMemeText(e.target.value)}
                    placeholder="LIFE BEGINS"
                    className="w-full bg-black/50 border border-pink-400/30 rounded-lg p-3 text-pink-100 focus:border-pink-400 outline-none"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-3 justify-end">
                <button
                  onClick={() => generateMeme()}
                  disabled={generating || !prompt.trim()}
                  className="bg-pink-400 text-black font-black text-lg py-3 rounded-xl hover:bg-pink-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_0_#be185d] active:translate-y-1 active:shadow-none"
                >
                  {generating ? <Loader2 className="animate-spin" /> : <Wand2 />} FERTILIZE
                </button>
                <button
                  onClick={handleRandom}
                  disabled={generating}
                  className="bg-transparent border-2 border-pink-400 text-pink-400 font-black text-lg py-3 rounded-xl hover:bg-pink-400/10 transition-all flex items-center justify-center gap-2"
                >
                   <Dice6 /> RANDOM MUTATION
                </button>
              </div>
            </div>
            {error && <div className="text-red-400 text-center bg-red-900/20 p-2 rounded-lg border border-red-500/50">{error}</div>}
        </div>
      </div>
    </SectionReveal>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-pink-400/20 py-4 px-6 backdrop-blur-md">
      <motion.div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-pink-400 origin-left" style={{ scaleX }} />
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
          <img src={LOGO_URL} alt="logo" className="w-10 h-10 object-contain rounded-full group-hover:rotate-12 transition-transform" />
          <span className="text-2xl text-pink-400 pink-glow uppercase tracking-widest">EGG</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-bold uppercase text-xs tracking-[0.2em] text-pink-200">
          {["Story", "Incubator", "Draw", "Buy", "Chart"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="hover:text-pink-400 transition-colors hover:scale-105 inline-block">{item}</a>
          ))}
          <a href={PUMP_FUN_URL} target="_blank" className="bg-pink-400 text-black px-6 py-2 rounded-full hover:bg-pink-300 transition-all shadow-[0_0_15px_rgba(244,114,182,0.4)] hover:shadow-[0_0_25px_rgba(244,114,182,0.6)]">GET $EGG</a>
        </div>

        <button className="md:hidden text-pink-400" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-black border-t border-pink-400/20"
          >
            <div className="flex flex-col p-6 gap-6 font-bold uppercase tracking-widest text-center text-pink-200">
              {["Story", "Incubator", "Draw", "Buy", "Chart"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} onClick={() => setIsOpen(false)} className="hover:text-pink-400">{item}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const App: React.FC = () => (
  <div className="min-h-screen bg-black text-pink-400 selection:bg-pink-400 selection:text-black font-['Permanent_Marker'] overflow-x-hidden">
    <SpermSwarm />
    <Navbar />
    
    <div className="pt-[74px] relative z-20">
      <MarqueeBar className="py-2 text-sm md:text-base" />
    </div>

    <main className="relative z-10 w-full">
      {/* Hero Section - Integrated into Flow */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 relative pt-10 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,114,182,0.15)_0%,_rgba(0,0,0,0)_60%)] pointer-events-none" />
        
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1 }}
           className="relative z-10 text-center w-full max-w-4xl"
        >
          {/* Logo - Target for Sperm */}
          <motion.img 
            animate={{ y: [0, -15, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
            src={LOGO_URL} 
            className="w-48 h-48 md:w-72 md:h-72 mx-auto mb-6 drop-shadow-[0_0_40px_rgba(244,114,182,0.4)] rounded-full border-4 border-pink-400/20" 
          />
          
          <h1 className="text-[18vw] md:text-[12rem] leading-none text-transparent bg-clip-text bg-gradient-to-b from-pink-300 to-pink-600 pink-glow select-none mb-4">EGG</h1>
          
          <p className="text-xl md:text-3xl text-white tracking-[0.5em] font-light mb-10 opacity-80">$EGG</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full px-4">
            <div onClick={() => navigator.clipboard.writeText(CONTRACT_ADDRESS)} className="cursor-pointer group bg-black border border-pink-400/50 px-6 py-4 rounded-xl flex items-center gap-4 hover:bg-pink-400/10 transition-all w-full md:w-auto shadow-[0_0_15px_rgba(244,114,182,0.1)]">
               <span className="text-pink-300 font-mono text-xs md:text-sm truncate max-w-[200px] md:max-w-[300px]">{CONTRACT_ADDRESS}</span>
               <Copy size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
            </div>
            <a href={PUMP_FUN_URL} target="_blank" className="bg-pink-400 text-black px-10 py-4 rounded-xl text-xl font-black hover:scale-105 transition-transform shadow-[4px_4px_0_#be185d] active:translate-y-[2px] active:shadow-none w-full md:w-auto text-center">
               START LIFE
            </a>
          </div>
        </motion.div>
      </section>

      <Story />
      <MemeGenerator />
      <DrawingBoard />
      <HowToBuy />
      <Chart />
    </main>

    <MarqueeBar className="py-6 text-2xl md:text-4xl" />

    <footer className="py-20 bg-black text-center border-t border-pink-900/30 px-6 relative z-10">
      <div className="flex flex-col items-center gap-8">
        <img src={LOGO_URL} className="w-20 h-20 rounded-full opacity-80 grayscale hover:grayscale-0 transition-all" />
        <div className="flex gap-8">
          <a href={X_OFFICIAL_URL} target="_blank" className="bg-pink-900/20 p-4 rounded-full text-pink-400 hover:bg-pink-400 hover:text-black transition-all hover:scale-110"><XLogo size={24} /></a>
          <a href={PUMP_FUN_URL} target="_blank" className="bg-pink-900/20 p-4 rounded-full text-pink-400 hover:bg-pink-400 hover:text-black transition-all hover:scale-110"><Rocket size={24} /></a>
          <a href="mailto:eggofficialcto@gmail.com" className="bg-pink-900/20 p-4 rounded-full text-pink-400 hover:bg-pink-400 hover:text-black transition-all hover:scale-110"><Mail size={24} /></a>
        </div>
        <div className="text-pink-400/40 text-sm tracking-widest flex flex-col gap-2">
           <p>CONTACT: eggofficialcto@gmail.com</p>
           <p>© 2026 $EGG. LIFE BEGINS NOW.</p>
        </div>
      </div>
    </footer>
  </div>
);

const Story: React.FC = () => (
  <SectionReveal id="story" className="py-32 px-4 bg-black relative overflow-hidden">
    <div className="max-w-5xl mx-auto relative">
       {/* Background Watermark */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 blur-sm pointer-events-none">
          <img src={LOGO_URL} className="w-[600px] h-[600px] rounded-full" />
       </div>

       <div className="relative z-10 text-center flex flex-col gap-12">
          <h2 className="text-6xl md:text-8xl text-pink-400 pink-glow uppercase opacity-90">THE ORIGIN</h2>
          
          <div className="space-y-8">
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="text-2xl md:text-4xl text-white font-bold leading-relaxed"
             >
               "Testicles make sperm. Sperm exist to find an egg."
             </motion.p>
             
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-3xl text-pink-200/60 leading-relaxed max-w-3xl mx-auto"
             >
               The egg is rare and valuable, while sperm are many and competitive. Only one sperm can enter one egg.
             </motion.p>
             
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="mt-12 inline-block bg-pink-400 text-black px-8 py-4 text-2xl md:text-4xl font-black uppercase rotate-2 rounded-xl shadow-[0_0_30px_rgba(244,114,182,0.6)]"
             >
               Life begins only when sperm and egg join.
             </motion.div>
          </div>
       </div>
    </div>
  </SectionReveal>
);

const HowToBuy: React.FC = () => (
  <SectionReveal id="buy" className="py-24 px-4 bg-black border-t border-pink-900/30">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-5xl md:text-7xl text-pink-400 mb-20 text-center pink-glow uppercase">Fertilization Guide</h2>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative">
        {/* Connector Line (Desktop) */}
        <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-pink-400/10 via-pink-400 to-pink-400/10 -z-10"></div>

        {[
          { t: "WALLET", d: "Get Phantom", i: <Wallet size={28} /> },
          { t: "SOLANA", d: "Load Gas", i: <Coins size={28} /> },
          { t: "PUMP.FUN", d: "Find Egg", i: <Search size={28} /> },
          { t: "SWAP", d: "Become Life", i: <Zap size={28} /> }
        ].map((step, idx) => (
          <div key={idx} className="flex-1 w-full relative group">
             <div className="bg-black border-2 border-pink-400 rounded-2xl p-6 flex flex-col items-center text-center gap-4 transition-transform group-hover:-translate-y-4 shadow-[0_10px_0_#831843] z-10 relative">
                <div className="bg-pink-400 text-black p-4 rounded-full -mt-12 shadow-lg group-hover:scale-110 transition-transform">
                  {step.i}
                </div>
                <h3 className="text-2xl font-black text-white">{step.t}</h3>
                <p className="text-pink-400/70 text-lg">{step.d}</p>
                {idx < 3 && <div className="md:hidden text-pink-400 mt-2"><ArrowRight className="rotate-90" /></div>}
             </div>
          </div>
        ))}
      </div>
    </div>
  </SectionReveal>
);

const Chart: React.FC = () => (
  <SectionReveal id="chart" className="py-24 px-4 bg-black">
    <div className="max-w-[95%] mx-auto">
      <div className="bg-black border-2 border-pink-400/50 rounded-3xl overflow-hidden p-1 shadow-[0_0_100px_rgba(244,114,182,0.1)]">
        <div className="bg-pink-400/10 p-4 flex justify-between items-center border-b border-pink-400/30">
            <h2 className="text-2xl md:text-3xl text-pink-400 pink-glow uppercase">Vitals Monitor</h2>
            <div className="flex items-center gap-2 text-green-400 animate-pulse text-sm font-mono border border-green-500/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              SYSTEM ONLINE
            </div>
        </div>
        <div className="h-[700px] w-full">
          <iframe src={`https://dexscreener.com/solana/${CONTRACT_ADDRESS}?embed=1&theme=dark&trades=0&info=0`} className="w-full h-full border-none" />
        </div>
      </div>
    </div>
  </SectionReveal>
);

export default App;

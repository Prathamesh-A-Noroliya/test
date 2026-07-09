import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Mic, X, Bot, Send, MicOff, Leaf,
  Volume2, VolumeX, Navigation, CheckCircle2, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBhoomi } from "@/lib/bhoomi-context";
import { useLanguage, type LangCode } from "@/lib/language-context";

type BhoomiMessage = { id: number; from: "user" | "bhoomi"; text: string; time: string };
type VoiceState = "idle" | "listening" | "processing" | "success" | "error";

const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const SPEECH_LANG: Record<LangCode, string> = { EN: "en-IN", HI: "hi-IN", MR: "mr-IN" };

const BHOOMI_RESPONSES: Array<{ keywords: string[]; reply: string }> = [
  { keywords: ["hello","hi","namaste","hey"], reply: "Namaste! I am BHOOMI, your AI farming assistant. Ask me about crop diseases, fertilizers, weather, and market prices." },
  { keywords: ["disease","infection","blight","rust","fungus","spot"], reply: "Upload clear photos via the AI Scan page. I'll analyse and provide a detailed diagnosis with treatment recommendations." },
  { keywords: ["scan","photo","upload","camera"], reply: "The AI Scan feature lets you upload 3 photos for the most accurate diagnosis. Tap 'AI Scan' in the sidebar to begin." },
  { keywords: ["wheat","gehu"], reply: "Wheat is at high risk for Yellow Leaf Rust. Apply Propiconazole 25% EC at 1 ml/litre water as a preventive spray this week." },
  { keywords: ["rice","paddy","dhan"], reply: "For rice, Blast Disease and Bacterial Leaf Blight are most common. Maintain 5 cm standing water and apply Tricyclazole 75% WP at 0.6 g/litre." },
  { keywords: ["tomato"], reply: "Tomato Early Blight is widespread. Start preventive spray with Mancozeb 75% WP at 2 g/litre every 10 days." },
  { keywords: ["fertilizer","urea","dap","nitrogen"], reply: "For most kharif crops, the recommended base dose is 20 kg Nitrogen + 40 kg P2O5 + 20 kg K2O per acre." },
  { keywords: ["water","irrigation","drip","pani"], reply: "Smart irrigation tip: Most cereal crops need 400-600 mm water per season. Drip irrigation saves 40-60% water." },
  { keywords: ["weather","rain","monsoon","temperature"], reply: "Today's forecast: 28C, partly cloudy with 65% humidity. Light rainfall expected around 3 PM. Optimal spray window: 6-9 AM tomorrow." },
  { keywords: ["price","market","mandi","rate","sell"], reply: "Current mandi prices: Wheat Rs 2,150/q, Rice Rs 1,980/q, Cotton Rs 6,200/q, Tomato Rs 850/q. Prices are 8% higher than last month." },
  { keywords: ["organic","natural","bio","neem"], reply: "Going organic? Neem oil (5 ml/litre) controls aphids, whiteflies, and fungal diseases. Trichoderma viride (4 g/litre) is a powerful soil biocontrol agent." },
  { keywords: ["subscription","premium","plan","upgrade","pro"], reply: "AgroLens Pro gives you unlimited AI scans, full treatment protocols, and market alerts - all for just Rs 79/month or Rs 849/year." },
  { keywords: ["help","what","how"], reply: "I can help you with: Crop disease diagnosis, Treatment plans, Weather advisories, Market prices, Organic alternatives." },
  { keywords: ["cotton","kapas"], reply: "Cotton Leaf Curl Virus is the biggest threat this season. Apply Imidacloprid 17.8% SL to control whitefly populations." },
  { keywords: ["soil","mitti"], reply: "Soil health is foundational! Conduct a soil test every 2 years. Target pH 6.0-7.5. Add organic matter (FYM 5 tons/acre) annually." },
];

function getBhoomiReply(text: string): string {
  const lower = text.toLowerCase();
  for (const item of BHOOMI_RESPONSES) {
    if (item.keywords.some((k) => lower.includes(k))) return item.reply;
  }
  const fallbacks = [
    "That's a great farming question! For region-specific advice, consult your local KVK, while I can help with general guidance here.",
    "Crop health depends on many factors. Could you tell me more about your specific situation?",
    "Try uploading a clear photo via the AI Scan feature - I can analyse it and give you a precise diagnosis.",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

const VOICE_NAV: Array<{ keywords: string[]; path: string; label: string }> = [
  { keywords: ["dashboard","home","main"], path: "/dashboard", label: "Dashboard" },
  { keywords: ["scan","camera","photo"], path: "/scan", label: "AI Scan" },
  { keywords: ["history","past"], path: "/history", label: "History" },
  { keywords: ["recommendation","advice","tip"], path: "/recommendations", label: "Recommendations" },
  { keywords: ["subscription","premium","upgrade"], path: "/subscription", label: "Subscription" },
  { keywords: ["payment","pay","checkout"], path: "/checkout", label: "Checkout" },
  { keywords: ["profile","account","settings"], path: "/profile", label: "Profile" },
  { keywords: ["irrigation","water","pump"], path: "/irrigation", label: "Irrigation" },
  { keywords: ["analytics","report"], path: "/analytics", label: "Analytics" },
];

function detectNavCommand(transcript: string): { path: string; label: string } | null {
  const lower = transcript.toLowerCase();
  const goPattern = /(?:go to|open|show|navigate to|take me to|visit)\s+(.+)/i;
  const match = goPattern.exec(lower);
  const searchText = match ? match[1] : lower;
  for (const cmd of VOICE_NAV) {
    if (cmd.keywords.some((k) => searchText.includes(k))) return { path: cmd.path, label: cmd.label };
  }
  return null;
}

interface SpeechRecognition extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void; abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
}
interface SpeechRecognitionCtor { new (): SpeechRecognition; }
declare global {
  interface Window { SpeechRecognition: SpeechRecognitionCtor; webkitSpeechRecognition: SpeechRecognitionCtor; }
}

export default function BhoomiButton() {
  const { open, setOpen } = useBhoomi();
  const { lang, t } = useLanguage();
  const [, navigate] = useLocation();

  const INITIAL: BhoomiMessage[] = [
    { id: 0, from: "bhoomi", text: "Namaste! I'm BHOOMI, your AI farming assistant. Ask me about crop diseases, fertilizers, weather, or market prices. You can also use your voice - I understand Hindi, Marathi, and English!", time: now() },
  ];

  const [messages, setMessages] = useState<BhoomiMessage[]>(INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [navSuggestion, setNavSuggestion] = useState<{ path: string; label: string } | null>(null);
  const [voiceNavMode, setVoiceNavMode] = useState(false);
  const [voiceNavTranscript, setVoiceNavTranscript] = useState("");
  const [voiceNavResult, setVoiceNavResult] = useState<{ path: string; label: string } | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [pulse, setPulse] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Stop pulse after user opens once
  useEffect(() => {
    if (open) setPulse(false);
  }, [open]);

  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[\ud800-\udfff]/g, ""));
    utterance.lang = SPEECH_LANG[lang] ?? "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, lang]);

  const addMessage = useCallback((from: "user" | "bhoomi", text: string) => {
    const msg: BhoomiMessage = { id: nextId.current++, from, text, time: now() };
    setMessages((prev) => [...prev, msg]);
    if (from === "bhoomi") speakText(text);
    return msg;
  }, [speakText]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    addMessage("user", trimmed);
    const navCmd = detectNavCommand(trimmed);
    if (navCmd) setNavSuggestion(navCmd);
    setTyping(true);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
    setTyping(false);
    const reply = navCmd
      ? `Sure! Navigating you to the ${navCmd.label} page now...`
      : getBhoomiReply(trimmed);
    addMessage("bhoomi", reply);
    if (navCmd) {
      await new Promise((r) => setTimeout(r, 800));
      navigate(navCmd.path);
      setNavSuggestion(null);
    }
  }, [addMessage, navigate]);

  const startSpeechRecognition = useCallback((
    onResult: (transcript: string) => void,
    onError: (code?: string) => void
  ) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onError("not-supported"); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = SPEECH_LANG[lang] ?? "en-IN";
    recognitionRef.current = recognition;
    recognition.onstart = () => setVoiceState("listening");
    recognition.onend = () => { setVoiceState((prev) => prev === "listening" ? "idle" : prev); };
    recognition.onerror = (e: Event & { error?: string }) => {
      const code = (e as unknown as { error?: string }).error ?? "";
      setVoiceState("error"); onError(code);
      setTimeout(() => setVoiceState("idle"), 3000);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      setVoiceState("processing");
      const transcript: string = e.results[0][0].transcript;
      onResult(transcript);
      setTimeout(() => setVoiceState("idle"), 1000);
    };
    try { recognition.start(); } catch {
      setVoiceState("error");
      setTimeout(() => setVoiceState("idle"), 2000);
    }
  }, [lang]);

  const startChatVoice = () => {
    startSpeechRecognition(
      (transcript) => { setInput(transcript); sendMessage(transcript); },
      (code) => {
        const permDenied = code === "not-allowed" || code === "service-not-allowed";
        addMessage("bhoomi", permDenied
          ? "Microphone access was denied. Please allow microphone permission in your browser settings."
          : t("bhoomi.micError"));
      }
    );
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setVoiceState("idle"); };

  const cancelVoiceNav = () => {
    recognitionRef.current?.stop(); setVoiceState("idle");
    setVoiceNavMode(false); setVoiceNavTranscript(""); setVoiceNavResult(null);
  };

  const startVoiceNavMode = useCallback(() => {
    setVoiceNavMode(true); setVoiceNavTranscript(""); setVoiceNavResult(null);
    startSpeechRecognition(
      (transcript) => {
        setVoiceNavTranscript(transcript);
        const navCmd = detectNavCommand(transcript);
        if (navCmd) {
          setVoiceNavResult(navCmd);
          setTimeout(() => { navigate(navCmd.path); cancelVoiceNav(); }, 1500);
        } else {
          cancelVoiceNav(); setOpen(true);
          setTimeout(() => { setInput(transcript); sendMessage(transcript); }, 400);
        }
      },
      () => { setVoiceNavTranscript("Voice input failed. Please try again."); setTimeout(() => cancelVoiceNav(), 2500); }
    );
  }, [startSpeechRecognition, navigate, setOpen, sendMessage]);

  const handleFloatingClick = () => {
    if (open) { setOpen(false); return; }
    startVoiceNavMode();
  };

  const listening = voiceState === "listening";

  return (
    <>
      {/* Voice Nav Overlay */}
      <AnimatePresence>
        {voiceNavMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end p-6 sm:items-center sm:justify-center pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto cursor-pointer"
              onClick={cancelVoiceNav}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative z-10 pointer-events-auto bg-white rounded-3xl shadow-2xl border border-white/60 p-6 w-full max-w-sm mx-4"
            >
              <button onClick={cancelVoiceNav} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors">
                <X className="h-4 w-4" />
              </button>
              <div className="flex flex-col items-center text-center mb-4">
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  {voiceState === "listening" && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-emerald-400/60 voice-ring" />
                      <div className="absolute inset-0 rounded-full border-2 border-sky-400/40 voice-ring" style={{ animationDelay: "0.4s" }} />
                    </>
                  )}
                  {voiceNavResult ? (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}>
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}>
                      <motion.div animate={voiceState === "listening" ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.7, repeat: Infinity }}>
                        <Mic className="h-9 w-9 text-white" />
                      </motion.div>
                    </div>
                  )}
                </div>
                <p className="font-bold text-foreground text-base mb-1">
                  {voiceNavResult ? `Navigating to ${voiceNavResult.label}...` :
                    voiceState === "listening" ? "Listening..." :
                    voiceState === "processing" ? "Understanding..." :
                    voiceState === "error" ? "Voice Error" : "Voice Navigation"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {voiceNavResult ? "Taking you there right now!" :
                    voiceState === "listening" ? `Say a page name or command` :
                    voiceState === "processing" ? "Got it! Processing your command..." :
                    voiceNavTranscript || 'Try: "Go to Dashboard" - "Open Scan" - "Show Profile"'}
                </p>
                {voiceNavTranscript && voiceState !== "error" && (
                  <div className="mt-3 w-full bg-muted/60 rounded-2xl px-4 py-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Heard</p>
                    <p className="text-sm font-medium text-foreground italic">"{voiceNavTranscript}"</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["Dashboard","AI Scan","Profile"].map((label) => (
                  <button key={label} onClick={() => {
                    recognitionRef.current?.stop();
                    const cmd = VOICE_NAV.find((v) => v.label === label || v.keywords.includes(label.toLowerCase()));
                    if (cmd) { setVoiceNavResult(cmd); setTimeout(() => { navigate(cmd.path); cancelVoiceNav(); }, 800); }
                  }} className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-border hover:bg-muted/60 transition-colors text-xs font-medium text-muted-foreground hover:text-foreground">
                    <Navigation className="h-4 w-4" />{label}
                  </button>
                ))}
              </div>
              <button onClick={() => { cancelVoiceNav(); setOpen(true); }} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}>
                <Bot className="h-4 w-4" /> Open Full Chat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-end sm:justify-end sm:p-6"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative z-10 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border/40 w-full max-w-md sm:max-w-sm sm:mb-0 flex flex-col"
              style={{ maxHeight: "80vh", height: "auto" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">BHOOMI</p>
                    <p className="text-[10px] text-muted-foreground">AI Farming Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setTtsEnabled((v) => !v)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                    {ttsEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.from === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", msg.from === "user" ? "bg-primary text-white rounded-br-md" : "bg-muted text-foreground rounded-bl-md")}>
                      {msg.text}
                      <p className={cn("text-[9px] mt-1", msg.from === "user" ? "text-white/60" : "text-muted-foreground")}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                )}
                {navSuggestion && (
                  <div className="flex justify-start">
                    <button onClick={() => { navigate(navSuggestion.path); setNavSuggestion(null); }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl rounded-bl-md px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5">
                      <Navigation className="h-3 w-3" /> Navigate to {navSuggestion.label}
                    </button>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/30">
                <div className="flex items-center gap-2 bg-muted rounded-2xl px-3 py-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
                    placeholder="Ask BHOOMI anything..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {input.trim() ? (
                    <button onClick={() => sendMessage(input)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}>
                      <Send className="h-4 w-4 text-white" />
                    </button>
                  ) : (
                    <button onClick={listening ? stopVoice : startChatVoice} className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", listening ? "bg-red-100" : "hover:bg-muted")}>
                      {listening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 flex flex-col items-center gap-2">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={handleFloatingClick}
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/25"
              style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
            >
              <Sparkles className="h-6 w-6 text-white" />
              {pulse && (
                <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/40" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

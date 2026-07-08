import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Mic, X, Bot, Send, MicOff, Leaf, ChevronDown,
  Volume2, VolumeX, Navigation, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBhoomi } from "@/lib/bhoomi-context";
import { useLanguage, type LangCode } from "@/lib/language-context";

/* ─── Types ──────────────────────────────────────────── */
type BhoomiMessage = { id: number; from: "user" | "bhoomi"; text: string; time: string };
type VoiceState = "idle" | "listening" | "processing" | "success" | "error";

const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

/* ─── Language → BCP-47 ──────────────────────────────── */
const SPEECH_LANG: Record<LangCode, string> = {
  EN: "en-IN",
  HI: "hi-IN",
  MR: "mr-IN",
};

/* ─── BHOOMI Responses ───────────────────────────────── */
const BHOOMI_RESPONSES: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["hello", "hi", "namaste", "namaskar", "hey", "नमस्ते", "नमस्कार", "हॅलो"],
    reply: "Namaste! 🌿 I am BHOOMI, your AI farming assistant. I can help you with crop diseases, fertilizer schedules, weather advice, and market prices. What would you like to know today?",
  },
  {
    keywords: ["disease", "infection", "blight", "rust", "fungus", "mould", "mold", "spot", "lesion", "बीमारी", "रोग", "कीट", "बुरशी", "डाग", "रोगराई"],
    reply: "For disease identification, upload clear photos of the affected leaves and stems via the AI Scan page. I'll analyse the images and provide a detailed diagnosis with treatment recommendations within seconds. Should I take you there?",
  },
  {
    keywords: ["scan", "photo", "upload", "image", "camera", "स्कैन", "तस्वीर", "फ़ोटो", "स्कॅन", "फोटो"],
    reply: "The AI Scan feature lets you upload 3 photos — a whole plant view, a leaf close-up, and a soil/root shot. This gives me the most accurate diagnosis. Tap 'AI Scan' in the sidebar to begin.",
  },
  {
    keywords: ["wheat", "roti", "gehu", "gehun", "गेहूं", "गेहूँ", "ज्वारी", "गहू"],
    reply: "Wheat is currently in high risk for Yellow Leaf Rust in Maharashtra and Punjab. I recommend applying Propiconazole 25% EC at 1 ml/litre water as a preventive spray this week.",
  },
  {
    keywords: ["rice", "paddy", "dhan", "chawal", "धान", "चावल", "तांदूळ", "भात"],
    reply: "For rice, Blast Disease and Bacterial Leaf Blight are most common this season. Maintain 5 cm standing water and apply Tricyclazole 75% WP at 0.6 g/litre if blast symptoms appear.",
  },
  {
    keywords: ["tomato", "tamatar", "tamater", "टमाटर", "टोमॅटो"],
    reply: "Tomato Early Blight is widespread this season. Start preventive spray with Mancozeb 75% WP at 2 g/litre every 10 days. Ensure adequate spacing for air circulation.",
  },
  {
    keywords: ["fertilizer", "fertiliser", "urea", "dap", "nitrogen", "npk", "nutrient", "khad", "खाद", "उर्वरक", "नाइट्रोजन", "खत", "रासायनिक"],
    reply: "For most kharif crops, the recommended base dose is 20 kg Nitrogen + 40 kg P₂O₅ + 20 kg K₂O per acre. Apply 50% N as basal dose and the remainder at 30 DAS.",
  },
  {
    keywords: ["water", "irrigation", "drip", "paani", "pani", "सिंचाई", "पानी", "सिंचन", "पाणी"],
    reply: "Smart irrigation tip: Most cereal crops need 400–600 mm water per season. Press soil 6 inches deep — if it crumbles, it's time to irrigate. Drip irrigation saves 40–60% water.",
  },
  {
    keywords: ["weather", "rain", "monsoon", "temperature", "mausam", "मौसम", "बारिश", "तापमान", "हवामान", "पाऊस"],
    reply: "Today's forecast: 28°C, partly cloudy with 65% humidity. Light rainfall expected around 3 PM. Avoid pesticide application before rain. Optimal spray window: 6–9 AM tomorrow.",
  },
  {
    keywords: ["price", "market", "mandi", "rate", "sell", "bazaar", "मंडी", "बाजार", "भाव", "किंमत"],
    reply: "Current mandi prices: Wheat ₹2,150/q, Rice ₹1,980/q, Cotton ₹6,200/q, Tomato ₹850/q. Prices are 8% higher than last month. Best markets: Azadpur (Delhi), Vashi (Mumbai).",
  },
  {
    keywords: ["organic", "natural", "bio", "neem", "jeev", "jaivik", "जैविक", "नीम", "सेंद्रिय", "प्राकृतिक"],
    reply: "Going organic? Neem oil (5 ml/litre) controls aphids, whiteflies, and fungal diseases. Trichoderma viride (4 g/litre) is a powerful soil biocontrol agent. Both available at your nearest KVK.",
  },
  {
    keywords: ["subscription", "premium", "plan", "upgrade", "pro", "payment", "pay", "सदस्यता", "प्रीमियम", "सदस्यत्व"],
    reply: "AgroLens Pro gives you unlimited AI scans, full treatment protocols, and market alerts — all for just ₹79/month or ₹849/year. Shall I take you to the subscription page?",
  },
  {
    keywords: ["help", "kya", "what", "how", "kaise", "batao", "bata", "मदद", "कैसे", "क्या", "मदत", "कसे"],
    reply: "I can help you with: 🌾 Crop disease diagnosis · 💊 Treatment plans · 🌧 Weather advisories · 💹 Market prices · 🌿 Organic alternatives. Just type or use the mic!",
  },
  {
    keywords: ["cotton", "kapas", "कपास", "कापूस"],
    reply: "Cotton Leaf Curl Virus is the biggest threat this season. Apply Imidacloprid 17.8% SL to control whitefly populations. Avoid excessive nitrogen.",
  },
  {
    keywords: ["soil", "mitti", "bhumi", "जमीन", "मिट्टी", "माती"],
    reply: "Soil health is foundational! Conduct a soil test every 2 years. Target pH 6.0–7.5. Add organic matter (FYM 5 tons/acre) annually to improve water retention.",
  },
];

function getBhoomiReply(text: string): string {
  const lower = text.toLowerCase();
  for (const item of BHOOMI_RESPONSES) {
    if (item.keywords.some((k) => lower.includes(k))) return item.reply;
  }
  const fallbacks = [
    "That's a great farming question! For region-specific advice, consult your local KVK, while I can help with general guidance here.",
    "Crop health depends on many factors — soil, moisture, temperature, and pest pressure. Could you tell me more about your specific situation?",
    "Try uploading a clear photo via the AI Scan feature — I can analyse it and give you a precise diagnosis.",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/* ─── Voice Navigation ───────────────────────────────── */
const VOICE_NAV: Array<{ keywords: string[]; path: string; label: string }> = [
  { keywords: ["dashboard", "home", "main", "होम", "डैशबोर्ड", "मुख्यपृष्ठ"], path: "/dashboard", label: "Dashboard" },
  { keywords: ["scan", "scan crop", "detect", "camera", "photo", "स्कैन", "स्कॅन"], path: "/scan", label: "AI Scan" },
  { keywords: ["history", "past scan", "previous", "इतिहास"], path: "/history", label: "Scan History" },
  { keywords: ["recommendation", "advice", "suggest", "tip", "सुझाव", "शिफारस"], path: "/recommendations", label: "Recommendations" },
  { keywords: ["subscription", "premium", "upgrade", "plan", "pricing", "सदस्यता", "सदस्यत्व"], path: "/subscription", label: "Subscription" },
  { keywords: ["payment", "pay", "checkout", "buy", "भुगतान", "पेमेंट"], path: "/checkout", label: "Checkout" },
  { keywords: ["profile", "account", "settings", "my profile", "प्रोफाइल"], path: "/profile", label: "Profile" },
  { keywords: ["premium recommendation", "full treatment", "treatment plan"], path: "/premium-recommendation", label: "Premium Recommendations" },
];

function detectNavCommand(transcript: string): { path: string; label: string } | null {
  const lower = transcript.toLowerCase();
  const goPattern = /(?:go to|open|show|navigate to|take me to|visit|जाओ|खोलो|दाखवा)\s+(.+)/i;
  const match = goPattern.exec(lower);
  const searchText = match ? match[1] : lower;
  for (const cmd of VOICE_NAV) {
    if (cmd.keywords.some((k) => searchText.includes(k))) return { path: cmd.path, label: cmd.label };
  }
  return null;
}

/* ─── Global type declaration ────────────────────────── */
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
}
interface SpeechRecognitionCtor {
  new (): SpeechRecognition;
}
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionCtor;
    webkitSpeechRecognition: SpeechRecognitionCtor;
  }
}

/* ─── Main Component ─────────────────────────────────── */
export default function BhoomiButton() {
  const { open, setOpen } = useBhoomi();
  const { lang, t } = useLanguage();
  const [, navigate] = useLocation();

  const INITIAL_MESSAGES: BhoomiMessage[] = [
    {
      id: 0,
      from: "bhoomi",
      text: "🌿 Namaste! I'm BHOOMI, your AI farming assistant. Ask me about crop diseases, fertilizers, weather, or market prices. You can also use your voice — I understand Hindi, Marathi, and English!",
      time: now(),
    },
  ];

  const [messages, setMessages] = useState<BhoomiMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [navSuggestion, setNavSuggestion] = useState<{ path: string; label: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  /* ─ Voice nav overlay (listen without opening chat) ─ */
  const [voiceNavMode, setVoiceNavMode] = useState(false);
  const [voiceNavTranscript, setVoiceNavTranscript] = useState("");
  const [voiceNavResult, setVoiceNavResult] = useState<{ path: string; label: string } | null>(null);

  /* ─ TTS ─ */
  const [ttsEnabled, setTtsEnabled] = useState(false);

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

  /* ─── TTS ───────────────────────────────────────────── */
  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[🌿🌾💊🌧💹]/g, ""));
    utterance.lang = SPEECH_LANG[lang] ?? "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, lang]);

  /* ─── Message helpers ────────────────────────────────── */
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
      ? `Sure! Navigating you to the ${navCmd.label} page now… 🚀`
      : getBhoomiReply(trimmed);
    addMessage("bhoomi", reply);
    if (navCmd) {
      await new Promise((r) => setTimeout(r, 800));
      navigate(navCmd.path);
      setNavSuggestion(null);
    }
  }, [addMessage, navigate]);

  /* ─── Voice Recognition (shared) ────────────────────── */
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
    recognition.onend = () => {
      setVoiceState((prev) => prev === "listening" ? "idle" : prev);
    };
    recognition.onerror = (e: Event & { error?: string }) => {
      const code = (e as unknown as { error?: string }).error ?? "";
      setVoiceState("error");
      onError(code);
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

  /* ─── Voice for in-chat ──────────────────────────────── */
  const startChatVoice = () => {
    startSpeechRecognition(
      (transcript) => {
        setInput(transcript);
        sendMessage(transcript);
      },
      (code) => {
        const permDenied = code === "not-allowed" || code === "service-not-allowed";
        addMessage("bhoomi", permDenied
          ? "Microphone access was denied. Please allow microphone permission in your browser settings."
          : t("bhoomi.micError"));
      }
    );
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setVoiceState("idle");
  };

  /* ─── Voice Navigation Mode (no chat needed) ─────────── */
  const startVoiceNavMode = useCallback(() => {
    setVoiceNavMode(true);
    setVoiceNavTranscript("");
    setVoiceNavResult(null);

    startSpeechRecognition(
      (transcript) => {
        setVoiceNavTranscript(transcript);
        const navCmd = detectNavCommand(transcript);
        if (navCmd) {
          setVoiceNavResult(navCmd);
          // Navigate after short delay for user to see the result
          setTimeout(() => {
            navigate(navCmd.path);
            setVoiceNavMode(false);
            setVoiceNavTranscript("");
            setVoiceNavResult(null);
          }, 1500);
        } else {
          // Not a nav command → open chat with transcript filled in
          setVoiceNavMode(false);
          setOpen(true);
          setTimeout(() => {
            setInput(transcript);
            sendMessage(transcript);
          }, 400);
        }
      },
      (code) => {
        const permDenied = code === "not-allowed" || code === "service-not-allowed" || code === "not-supported";
        setVoiceNavTranscript(permDenied
          ? "Microphone permission denied. Please allow access."
          : "Voice input failed. Please try again.");
        setTimeout(() => setVoiceNavMode(false), 2500);
      }
    );
  }, [startSpeechRecognition, navigate, setOpen, sendMessage]);

  const cancelVoiceNav = () => {
    recognitionRef.current?.stop();
    setVoiceState("idle");
    setVoiceNavMode(false);
    setVoiceNavTranscript("");
    setVoiceNavResult(null);
  };

  /* ─── Floating button click ──────────────────────────── */
  const handleFloatingClick = () => {
    if (open) {
      setOpen(false);
      return;
    }
    // Start voice nav mode (can navigate or open chat)
    startVoiceNavMode();
  };

  const listening = voiceState === "listening";

  return (
    <>
      {/* ─── Voice Navigation Overlay ─────────────────────── */}
      <AnimatePresence>
        {voiceNavMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end p-6 sm:items-center sm:justify-center pointer-events-none"
          >
            {/* Backdrop (click to cancel) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto cursor-pointer"
              onClick={cancelVoiceNav}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative z-10 pointer-events-auto bg-white rounded-3xl shadow-2xl border border-white/60 p-6 w-full max-w-sm mx-4"
            >
              {/* Close button */}
              <button
                onClick={cancelVoiceNav}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Mic ring animation */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  {/* Animated rings while listening */}
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
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
                    >
                      <motion.div
                        animate={voiceState === "listening" ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.7, repeat: Infinity }}
                      >
                        <Mic className="h-9 w-9 text-white" />
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* State labels */}
                <p className="font-bold text-foreground text-base mb-1">
                  {voiceNavResult
                    ? `Navigating to ${voiceNavResult.label}…`
                    : voiceState === "listening"
                      ? "Listening…"
                      : voiceState === "processing"
                        ? "Understanding…"
                        : voiceState === "error"
                          ? "Voice Error"
                          : "Voice Navigation"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {voiceNavResult
                    ? "Taking you there right now!"
                    : voiceState === "listening"
                      ? `Say a page name or command in ${lang === "HI" ? "Hindi" : lang === "MR" ? "Marathi" : "English"}`
                      : voiceState === "processing"
                        ? "Got it! Processing your command…"
                        : voiceNavTranscript || 'Try: "Go to Dashboard" · "Open Scan" · "Show Profile"'}
                </p>

                {/* Transcript display */}
                {voiceNavTranscript && voiceState !== "error" && (
                  <div className="mt-3 w-full bg-muted/60 rounded-2xl px-4 py-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Heard</p>
                    <p className="text-sm font-medium text-foreground italic">"{voiceNavTranscript}"</p>
                  </div>
                )}
              </div>

              {/* Quick command hints */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["Dashboard", "AI Scan", "Profile"].map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      recognitionRef.current?.stop();
                      const cmd = VOICE_NAV.find((v) => v.label === label || v.keywords.includes(label.toLowerCase()));
                      if (cmd) {
                        setVoiceNavResult(cmd);
                        setTimeout(() => {
                          navigate(cmd.path);
                          setVoiceNavMode(false);
                          setVoiceNavResult(null);
                        }, 800);
                      }
                    }}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-border hover:bg-muted/60 transition-colors text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Navigation className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Open Full Chat button */}
              <button
                onClick={() => {
                  cancelVoiceNav();
                  setOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
              >
                <Bot className="h-4 w-4" />
                Open BHOOMI Chat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Button ──────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <AnimatePresence>
          {showTooltip && !open && !voiceNavMode && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              className="bg-foreground text-background text-xs font-medium px-3 py-2 rounded-xl shadow-lg whitespace-nowrap flex items-center gap-1.5"
            >
              <Mic className="h-3.5 w-3.5" /> Tap to speak
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setShowTooltip(true)}
          onHoverEnd={() => setShowTooltip(false)}
          onClick={handleFloatingClick}
          className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          style={{ background: "linear-gradient(135deg, hsl(142 62% 36%) 0%, hsl(196 70% 44%) 100%)" }}
          aria-label="Voice navigation / Open BHOOMI"
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
            animate={open || voiceNavMode ? {} : { scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="x" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                <ChevronDown className="h-6 w-6 relative z-10" />
              </motion.div>
            ) : (
              <motion.div key="mic" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Mic className="h-6 w-6 relative z-10" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ─── Chat Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 sm:hidden bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={cn(
                "fixed z-50 flex flex-col bg-white shadow-2xl border border-border/60",
                "bottom-24 right-4 left-4 rounded-2xl",
                "sm:left-auto sm:right-6 sm:w-[370px] sm:bottom-24",
              )}
              style={{ maxHeight: "calc(100vh - 140px)" }}
            >
              {/* Chat Header */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 rounded-t-2xl shrink-0"
                style={{ background: "linear-gradient(90deg, hsl(142 40% 96%) 0%, hsl(196 50% 95%) 100%)" }}
              >
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
                  >
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">BHOOMI AI</p>
                  <p className="text-[11px] text-muted-foreground">{t("bhoomi.online")} · {SPEECH_LANG[lang]}</p>
                </div>
                <div className="flex items-center gap-1">
                  {/* TTS toggle */}
                  <button
                    onClick={() => {
                      if (ttsEnabled) window.speechSynthesis?.cancel();
                      setTtsEnabled((v) => !v);
                    }}
                    title={ttsEnabled ? "Disable voice responses" : "Enable voice responses"}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      ttsEnabled ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  {/* Lang badge */}
                  <div className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">{lang}</div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className={cn("flex gap-2", msg.from === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.from === "bhoomi" && (
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
                      >
                        <Leaf className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div className="max-w-[78%]">
                      <div className={cn(
                        "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                        msg.from === "user"
                          ? "text-white rounded-br-sm"
                          : "bg-emerald-50 border border-emerald-100 text-foreground rounded-bl-sm"
                      )}
                        style={msg.from === "user"
                          ? { background: "linear-gradient(135deg, hsl(196 70% 44%), hsl(210 70% 52%))" }
                          : {}}
                      >
                        {msg.text}
                      </div>
                      <p className={cn("text-[10px] text-muted-foreground mt-1", msg.from === "user" ? "text-right" : "text-left")}>
                        {msg.time}
                      </p>
                    </div>
                    {msg.from === "user" && (
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "linear-gradient(135deg, hsl(196 70% 44%), hsl(210 70% 52%))" }}
                      >
                        <span className="text-white text-[10px] font-bold">U</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {typing && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}>
                        <Leaf className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div key={i} className="w-2 h-2 rounded-full bg-emerald-400" animate={{ y: [0, -4, 0] }} transition={{ delay: i * 0.15, duration: 0.5, repeat: Infinity }} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nav suggestion pill */}
                <AnimatePresence>
                  {navSuggestion && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-center">
                      <div className="bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Navigation className="h-3 w-3" /> Navigating to {navSuggestion.label}…
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={bottomRef} />
              </div>

              {/* Voice state banner */}
              <AnimatePresence>
                {voiceState !== "idle" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden shrink-0"
                  >
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2.5 border-t text-xs font-medium",
                      voiceState === "listening"  && "bg-red-50 border-red-100 text-red-600",
                      voiceState === "processing" && "bg-amber-50 border-amber-100 text-amber-700",
                      voiceState === "success"    && "bg-emerald-50 border-emerald-100 text-emerald-700",
                      voiceState === "error"      && "bg-red-50 border-red-100 text-red-500",
                    )}>
                      {voiceState === "listening"  && <><motion.div className="w-2 h-2 rounded-full bg-red-500" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />{SPEECH_LANG[lang]} · Listening…</>}
                      {voiceState === "processing" && <><motion.div className="w-2 h-2 rounded-full bg-amber-500" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />Processing speech…</>}
                      {voiceState === "success"    && <><CheckCircle2 className="h-3.5 w-3.5" />Got it!</>}
                      {voiceState === "error"      && <><MicOff className="h-3.5 w-3.5" />Voice error — check mic permission</>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input bar */}
              <div className="p-3 border-t border-border/50 shrink-0 bg-muted/30 rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
                      }}
                      placeholder={t("bhoomi.placeholder")}
                      className="w-full bg-white border border-border/60 rounded-xl pl-3.5 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                    />
                  </div>

                  {/* Mic button */}
                  <button
                    onClick={listening ? stopVoice : startChatVoice}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0",
                      listening  ? "bg-red-100 text-red-600 animate-pulse"
                        : voiceState === "processing" ? "bg-amber-100 text-amber-600"
                        : voiceState === "error"      ? "bg-red-50 text-red-400"
                        : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                    title={listening ? "Stop listening" : `Voice input (${SPEECH_LANG[lang]})`}
                  >
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  {/* Send button */}
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-opacity"
                    style={{ background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" }}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 text-center">{t("bhoomi.hint")}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

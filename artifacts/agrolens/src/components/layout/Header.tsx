import { motion } from "framer-motion";
import { Leaf, Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useLanguage, type LangCode } from "@/lib/language-context";

const LANGUAGES: { code: LangCode; label: string; nativeLabel: string }[] = [
  { code: "EN", label: "English",  nativeLabel: "English"  },
  { code: "HI", label: "Hindi",    nativeLabel: "हिन्दी"   },
  { code: "MR", label: "Marathi",  nativeLabel: "मराठी"    },
];

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

export default function Header({ onMenuToggle, sidebarOpen }: HeaderProps) {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-3 border-b border-white/50"
      style={{
        background: "linear-gradient(90deg, hsl(142 45% 96%) 0%, hsl(170 40% 95.5%) 40%, hsl(205 50% 95%) 100%)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <motion.div
          animate={{ rotate: sidebarOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.div>
      </Button>

      {/* Logo */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-xl gradient-primary"
        >
          <Leaf className="h-4 w-4 text-white" />
        </div>
        <div className="hidden sm:flex flex-col leading-tight">
          <span
            className="text-sm font-bold tracking-wide bg-gradient-to-r from-emerald-700 to-sky-600 bg-clip-text text-transparent"
          >
            AgroLens
          </span>
          <span className="text-[10px] text-muted-foreground leading-none">{t("header.tagline")}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-medium min-w-[72px] bg-white/70 border-white/60 hover:bg-white/90"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{currentLang.code}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[130px]">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onClick={() => setLang(l.code)}
                className="flex items-center justify-between gap-3 cursor-pointer"
              >
                <span className={lang === l.code ? "text-primary font-semibold" : ""}>
                  {l.nativeLabel}
                </span>
                {lang === l.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Demo Mode badge */}
        {user?.isDemoUser && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300/60 text-amber-700 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            Demo Mode
          </div>
        )}

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2 ml-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm ${
                user.isDemoUser ? "bg-amber-500" : "gradient-primary"
              }`}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{user.fullName}</span>
              <span className="text-[10px] text-muted-foreground">{user.isDemoUser ? "Demo Session" : user.farmerId}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

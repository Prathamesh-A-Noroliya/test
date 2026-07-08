import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Sprout,
  CheckCircle2, XCircle, Zap, Droplets, Users, Sprout as SproutIcon,
  Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";

/* ──── Password rules ───────────────────────────────────── */
const PW_RULES = [
  { label: "At least 6 characters",      test: (p: string) => p.length >= 6 },
  { label: "Uppercase letter (A–Z)",      test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter (a–z)",      test: (p: string) => /[a-z]/.test(p) },
  { label: "Number (0–9)",                test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character (!@#$...)",   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function allPwRulesPassed(pw: string) {
  return PW_RULES.every((r) => r.test(pw));
}

const loginSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, loginDemo } = useAuth();
  const { t } = useLanguage();
  const { theme, toggle } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [pwFocused, setPwFocused] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const emailTouched = emailValue.length > 0;
  const emailValid = isValidEmail(emailValue);
  const emailInvalid = emailTouched && !emailValid;
  const pwStrong = allPwRulesPassed(passwordValue);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } finally { setLoading(false); }
  };

  const handleDemo = () => {
    setDemoLoading(true);
    setTimeout(() => { loginDemo(); navigate("/dashboard"); }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Hero Left Panel ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 text-white"
        style={{ background: "linear-gradient(135deg, hsl(142 65% 34%) 0%, hsl(170 60% 38%) 40%, hsl(200 72% 44%) 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(190 80% 70%) 0%, transparent 70%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold tracking-wide">AgroLens</div>
              <div className="text-xs text-white/70 font-medium">AI Crop Intelligence</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="w-48 h-48 mx-auto mb-8 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
            <Sprout className="h-24 w-24 text-white/80" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-3xl font-bold leading-tight mb-6">
            AI-Powered Crop Intelligence for Smarter Farming Decisions.
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 text-white/60 text-sm">
            <div className="text-center"><div className="text-2xl font-bold text-white">100+</div><div>Farmers</div></div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-bold text-white">10+</div><div>Diseases</div></div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center"><div className="text-2xl font-bold text-white">150+</div><div>Farms Irrigated</div></div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Right Form Panel ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        style={{ background: "linear-gradient(160deg, hsl(142 30% 97.5%) 0%, hsl(200 45% 97%) 100%)" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo + theme toggle */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold bg-gradient-to-r from-emerald-700 to-sky-600 bg-clip-text text-transparent">AgroLens</div>
                <div className="text-xs text-muted-foreground">AI Crop Intelligence</div>
              </div>
            </div>
            <button
              onClick={toggle}
              className="w-8 h-8 rounded-lg bg-white/70 border border-border/50 flex items-center justify-center hover:bg-white/90 dark:bg-card/80 dark:border-border/50"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-500" />
              )}
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Sign in to your AgroLens account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email" type="email" placeholder="farmer@example.com"
                  className={`pl-10 pr-10 h-12 rounded-xl transition-all ${
                    emailInvalid ? "border-destructive/70" : emailTouched && emailValid ? "border-emerald-400/70" : ""
                  }`}
                  {...register("email", { onChange: (e) => setEmailValue(e.target.value) })}
                />
                {emailTouched && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {emailValid ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive/70" />}
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <XCircle className="h-3 w-3 shrink-0" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline font-medium">Forgot Password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className={`pl-10 pr-10 h-12 rounded-xl transition-all ${passwordValue && pwStrong ? "border-emerald-400/70" : ""}`}
                  {...register("password", { onChange: (e) => setPasswordValue(e.target.value) })}
                  onFocus={() => setPwFocused(true)} onBlur={() => setPwFocused(false)}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {(pwFocused || passwordValue.length > 0) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeOut" as const }}
                  className="bg-muted/50 border border-border/60 rounded-xl px-3 py-2.5 space-y-1.5">
                  {PW_RULES.map((rule) => {
                    const passed = rule.test(passwordValue);
                    return (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        {passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          : <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
                        <span className={passed ? "text-emerald-700 font-medium" : "text-muted-foreground"}>{rule.label}</span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Sign In */}
            <Button type="submit"
              className="w-full h-12 rounded-xl text-sm font-semibold gap-2 border-0 text-white"
              style={{ background: "linear-gradient(135deg, hsl(142 62% 36%) 0%, hsl(196 70% 44%) 100%)" }}
              disabled={loading || !emailValid}>
              {loading ? (
                <motion.div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                  animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Demo */}
            <Button type="button" variant="outline"
              className="w-full h-12 rounded-xl text-sm font-semibold gap-2 border-amber-300/60 bg-amber-50/80 text-amber-700 hover:bg-amber-100/80"
              onClick={handleDemo} disabled={demoLoading}>
              {demoLoading ? (
                <motion.div className="w-4 h-4 border-2 border-amber-400/50 border-t-amber-600 rounded-full"
                  animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              ) : (
                <><Zap className="h-4 w-4" /> Continue as Demo User
                  <span className="ml-auto text-[10px] font-bold bg-amber-200/70 text-amber-700 px-1.5 py-0.5 rounded-full">FREE</span></>
              )}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground -mt-1">
              Demo gives full access to explore all premium features · No signup needed
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            New to AgroLens?{" "}
            <button onClick={() => navigate("/register")}
              className="font-semibold hover:underline bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
              Create account
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

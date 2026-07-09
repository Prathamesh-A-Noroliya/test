import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, ShieldCheck, Leaf, Camera, MapPin, Phone,
  Mail, CreditCard, Sparkles, CheckCircle2, Lock,
  Edit3, BadgeCheck, Tractor, BarChart3, Crown,
  Award, Settings, Bell, Globe, Moon, ThermometerSun,
  ChevronRight, LogOut, Star, TrendingUp,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

/* ─── Animation ──────────────────────────────────────────── */
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } } };

/* ─── Stat Pill ──────────────────────────────────────────── */
function StatPill({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/60 border border-border/40 p-2.5">
      <Icon className={cn("h-4 w-4", color)} />
      <p className="text-sm font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* ─── Info Row ──────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [editMode, setEditMode] = useState(false);

  if (!user) return null;
  const isPremium = user.isPremium;

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-6">

        {/* Page title */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Farmer Profile</h1>
            <p className="text-sm text-muted-foreground">Your account details and settings</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs" onClick={() => setEditMode((v) => !v)}>
            <Edit3 className="h-3.5 w-3.5" />
            {editMode ? "Done" : "Edit"}
          </Button>
        </motion.div>

        {/* Profile Hero Card */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-emerald-500 via-primary to-emerald-700 relative">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute top-3 right-4">
                {isPremium ? (
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-bold text-white">
                    <Crown className="h-3.5 w-3.5 text-amber-300" /> AgroLens Pro
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-white/80">Free Plan</div>
                )}
              </div>
            </div>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="flex items-end gap-4 -mt-7 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/80 to-primary border-3 border-white shadow-md flex items-center justify-center text-white text-2xl font-black">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  {isPremium && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="pb-1 flex-1 min-w-0">
                  <h2 className="text-lg font-black text-foreground leading-tight truncate">{user.fullName}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{user.farmerId}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-5">
                <StatPill icon={Camera} label="Total Scans" value="24" color="text-blue-500" />
                <StatPill icon={Leaf} label="Crop Type" value={user.cropType.slice(0,6)} color="text-emerald-500" />
                <StatPill icon={MapPin} label="Region" value={user.state.slice(0,6)} color="text-violet-500" />
                <StatPill icon={BarChart3} label="Health Score" value="87%" color="text-amber-500" />
              </div>
              <div>
                <InfoRow icon={User} label="Full Name" value={user.fullName} />
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Phone} label="Mobile" value={user.mobile} />
                <InfoRow icon={MapPin} label="State" value={user.state} />
                <InfoRow icon={Leaf} label="Crop Type" value={user.cropType} />
                <InfoRow icon={Tractor} label="Soil Type" value={user.soilType} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Identity Verification Card */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="pt-5 px-5 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <BadgeCheck className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-sm font-bold text-foreground">Identity Verification</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Aadhaar Verified</p>
                    <p className="text-[11px] text-muted-foreground">Identity confirmed</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Bank Linked</p>
                    <p className="text-[11px] text-muted-foreground">Account ending in 4829</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Linked</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Land Record</p>
                    <p className="text-[11px] text-muted-foreground">Survey No. 124/A</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Pending</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="pt-5 px-5 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-sm font-bold text-foreground">Achievements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Camera, label: "Scan Pro", sub: "50+ scans", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
                  { icon: Leaf, label: "Green Thumb", sub: "Healthy fields", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
                  { icon: Droplets, label: "Water Saver", sub: "18% saved", color: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-200" },
                  { icon: Star, label: "Early Adopter", sub: "Since 2024", color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-200" },
                  { icon: TrendingUp, label: "Top Yield", sub: "This season", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
                  { icon: CheckCircle2, label: "Verified", sub: "All docs done", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
                ].map((ach, i) => (
                  <div key={i} className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border ${ach.bg} ${ach.border}`}>
                    <ach.icon className={`h-5 w-5 ${ach.color}`} />
                    <p className="text-[11px] font-bold text-foreground text-center">{ach.label}</p>
                    <p className="text-[9px] text-muted-foreground text-center">{ach.sub}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div variants={item}>
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="pt-5 px-5 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-sm font-bold text-foreground">Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-2">
              {[
                { icon: Bell, label: "Notifications", desc: "Push & SMS alerts", action: "On" },
                { icon: Globe, label: "Language", desc: "English (EN)", action: "Change" },
                { icon: Moon, label: "Dark Mode", desc: "System default", action: "Auto" },
                { icon: ThermometerSun, label: "Units", desc: "Celsius & Metric", action: "Metric" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <s.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{s.action}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div variants={item}>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}

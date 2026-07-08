import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  LayoutDashboard, Camera, Lightbulb, History,
  MessageSquare, User, Leaf, LogOut, X, Star,
  CreditCard, Sparkles, Droplets, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useBhoomi } from "@/lib/bhoomi-context";
import { useLanguage } from "@/lib/language-context";

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  href: string;
  badgeKey?: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, labelKey: "nav.dashboard",        href: "/dashboard" },
  { icon: Camera,          labelKey: "nav.scan",             href: "/scan" },
  { icon: Lightbulb,       labelKey: "nav.recommendations",  href: "/recommendations" },
  { icon: Droplets,        labelKey: "nav.irrigation",       href: "/irrigation" },
  { icon: History,         labelKey: "nav.history",          href: "/history" },
  { icon: BarChart3,       labelKey: "nav.analytics",        href: "/analytics" },
  { icon: MessageSquare,   labelKey: "nav.bhoomi",           href: "__bhoomi__" },
  { icon: User,            labelKey: "nav.profile",          href: "/profile" },
];

const PAYMENT_ITEMS: NavItem[] = [
  { icon: Star,       labelKey: "nav.plans",   href: "/subscription", badgeKey: "Hot" },
  { icon: CreditCard, labelKey: "nav.billing", href: "/checkout" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { logout, user } = useAuth();
  const { setOpen: setBhoomiOpen } = useBhoomi();
  const { t } = useLanguage();

  const handleNav = (href: string) => {
    if (href === "__bhoomi__") {
      setBhoomiOpen(true);
      onClose();
      return;
    }
    navigate(href);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  const isActive = (href: string) =>
    location === href || (href !== "/dashboard" && location.startsWith(href));

  const NavButton = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <button
        onClick={() => handleNav(item.href)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group text-left",
          active
            ? "text-white shadow-sm"
            : "text-sidebar-foreground hover:bg-white/60 hover:text-sidebar-accent-foreground"
        )}
        style={active ? { background: "linear-gradient(135deg, hsl(142 62% 36%) 0%, hsl(196 70% 44%) 100%)" } : {}}
      >
        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
        <span className="flex-1">{t(item.labelKey)}</span>
        {item.badgeKey && !active && (
          <span className="text-[9px] font-bold bg-amber-400 text-white px-1.5 py-0.5 rounded-full">
            {item.badgeKey}
          </span>
        )}
        {active && <div className="w-1.5 h-1.5 rounded-full bg-white/60" />}
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full sidebar-gradient-bg">
      {/* Mobile header */}
      <div className="flex items-center justify-between p-4 border-b border-white/50 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center gradient-primary">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-emerald-700 to-sky-600 bg-clip-text text-transparent">AgroLens</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {/* Main Navigation */}
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-2">
          {t("nav.section.navigation")}
        </p>
        {NAV_ITEMS.map((item) => <NavButton key={item.href} item={item} />)}

        {/* Plans & Billing */}
        <div className="pt-3 mt-3 border-t border-white/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-2">
            {t("nav.section.billing")}
          </p>
          {PAYMENT_ITEMS.map((item) => <NavButton key={item.href} item={item} />)}
        </div>

        {/* Pro upsell card */}
        <div className="mt-3 mx-1">
          <button
            onClick={() => handleNav("/subscription")}
            className="w-full rounded-xl p-3 text-left hover:opacity-90 transition-all group border border-white/60"
            style={{ background: "linear-gradient(135deg, hsl(142 45% 93%) 0%, hsl(196 55% 92%) 100%)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center gradient-primary">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-foreground">{t("sidebar.upgradeTo")}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {t("sidebar.upgradeFeatures")}
            </p>
            <div className="mt-2 text-[11px] font-semibold flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
              {t("sidebar.viewPlans")}
            </div>
          </button>
        </div>
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-white/50 space-y-2">
        {user && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 border border-white/60">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 gradient-primary">
              <span className="text-white font-bold text-xs">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user.fullName}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{user.farmerId}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-destructive transition-all duration-150"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {t("sidebar.signOut")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-72 z-50 border-r border-white/40 shadow-xl lg:hidden overflow-hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex flex-col fixed top-16 left-0 h-[calc(100vh-64px)] w-64 z-30 border-r border-white/40 overflow-hidden">
        {sidebarContent}
      </aside>
    </>
  );
}

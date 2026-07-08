import { useLocation } from "wouter";
import {
  LayoutDashboard, Camera, Droplets, History, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { icon: LayoutDashboard, label: "Home",    href: "/dashboard" },
  { icon: Camera,          label: "Scan",    href: "/scan" },
  { icon: Droplets,        label: "Irrigate", href: "/irrigation" },
  { icon: History,         label: "History", href: "/history" },
  { icon: BarChart3,       label: "Analytics", href: "/analytics" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div
        className="h-16 flex items-center justify-around px-2 border-t"
        style={{
          background: "linear-gradient(180deg, hsl(142 40% 98%) 0%, white 100%)",
          borderColor: "hsl(170 30% 88%)",
          backdropFilter: "blur(12px)",
        }}
      >
        {TABS.map((tab) => {
          const isActive = location === tab.href || (tab.href !== "/dashboard" && location.startsWith(tab.href));
          return (
            <button
              key={tab.href}
              onClick={() => navigate(tab.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-2xl transition-all duration-150",
                isActive ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              style={isActive ? { background: "linear-gradient(135deg, hsl(142 62% 36%), hsl(196 70% 44%))" } : {}}
            >
              <tab.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
              <span className={cn("text-[9px] font-medium", isActive ? "text-white" : "text-muted-foreground")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer */}
      <div className="h-safe-bottom bg-white" />
    </nav>
  );
}

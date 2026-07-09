import { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import BhoomiButton from "./BhoomiButton";
import { BhoomiProvider } from "@/lib/bhoomi-context";
import { NotificationProvider } from "@/lib/notifications";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NotificationProvider>
      <BhoomiProvider>
        <div className="min-h-screen bg-background">
          <Header onMenuToggle={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="pt-16 lg:pl-64 min-h-screen pb-20 lg:pb-0">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-6 lg:p-8 w-full"
            >
              {children}
            </motion.div>
          </main>
          <BottomNav />
          <BhoomiButton />
        </div>
      </BhoomiProvider>
    </NotificationProvider>
  );
}

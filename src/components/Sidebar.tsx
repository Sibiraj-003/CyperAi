import { cn } from "../lib/utils";
import { LayoutDashboard, Mail, ShieldAlert, Link as LinkIcon, ScanFace, MessageSquare, Shield } from "lucide-react";

export type PageType = "dashboard" | "email" | "quarantine" | "url" | "deepfake" | "chatbot";

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "email", label: "Email Scanner", icon: Mail },
  { id: "url", label: "URL Scanner", icon: LinkIcon },
  { id: "deepfake", label: "Deepfake Detection", icon: ScanFace },
  { id: "quarantine", label: "Quarantine", icon: ShieldAlert },
  { id: "chatbot", label: "AI Assistant", icon: MessageSquare },
] as const;

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-[#060b14] border-r border-white/5 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          CyberShield AI
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as PageType)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-slate-400")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
            <span className="text-xs font-medium text-white">AD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Admin User</span>
            <span className="text-xs text-slate-500">System Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}

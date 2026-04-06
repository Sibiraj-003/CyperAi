/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sidebar, PageType } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { EmailScanner } from "./pages/EmailScanner";
import { Quarantine } from "./pages/Quarantine";
import { UrlScanner } from "./pages/UrlScanner";
import { DeepfakeDetection } from "./pages/DeepfakeDetection";
import { Chatbot } from "./pages/Chatbot";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");

  return (
    <div className="flex h-screen bg-[#0a0f1c] text-white overflow-hidden font-sans selection:bg-emerald-500/30">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Decorative background elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 min-h-full">
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "email" && <EmailScanner />}
          {currentPage === "url" && <UrlScanner />}
          {currentPage === "deepfake" && <DeepfakeDetection />}
          {currentPage === "quarantine" && <Quarantine />}
          {currentPage === "chatbot" && <Chatbot />}
        </div>
      </main>
    </div>
  );
}


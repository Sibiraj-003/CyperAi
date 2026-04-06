import { motion } from "motion/react";
import { ShieldAlert, Trash2, Search, CheckCircle, AlertCircle } from "lucide-react";

const quarantinedItems = [
  { id: "Q-1042", name: "invoice_update.pdf", type: "Malware", date: "2026-04-04 06:45", status: "Pending Review", risk: "High" },
  { id: "Q-1041", name: "ceo_message.mp4", type: "Deepfake", date: "2026-04-04 05:30", status: "Isolated", risk: "High" },
  { id: "Q-1040", name: "Account Verification", type: "Phishing", date: "2026-04-03 14:20", status: "Isolated", risk: "Medium" },
  { id: "Q-1039", name: "setup_v2.exe", type: "Trojan", date: "2026-04-03 09:15", status: "Pending Review", risk: "Critical" },
  { id: "Q-1038", name: "Q1_Report.docx", type: "Macro Virus", date: "2026-04-02 16:40", status: "Isolated", risk: "High" },
];

export function Quarantine() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            Quarantine Zone
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage isolated threats and suspicious files</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quarantine..."
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 w-64 transition-colors"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Threat Type</th>
                <th className="px-6 py-4 font-medium">Date Isolated</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {quarantinedItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.id}</td>
                  <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                    {item.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{item.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">{item.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors opacity-0 group-hover:opacity-100" title="Mark as Safe">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100" title="Delete Permanently">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

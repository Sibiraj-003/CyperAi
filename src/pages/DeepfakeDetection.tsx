import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScanFace, Image as ImageIcon, Video, Mic, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";

type MediaType = 'image' | 'video' | 'audio';

export function DeepfakeDetection() {
  const [activeTab, setActiveTab] = useState<MediaType>('image');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<null | 'fake' | 'real'>(null);

  const handleScan = () => {
    setIsScanning(true);
    setResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setResult('fake');
    }, 2500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ScanFace className="w-6 h-6 text-emerald-400" />
          Deepfake Detection
        </h2>
        <p className="text-slate-400 text-sm mt-1">Advanced AI analysis to detect manipulated media</p>
      </motion.div>

      <div className="flex p-1 bg-white/5 rounded-xl w-fit border border-white/10">
        {[
          { id: 'image', label: 'Image', icon: ImageIcon },
          { id: 'video', label: 'Video', icon: Video },
          { id: 'audio', label: 'Audio', icon: Mic },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as MediaType); setResult(null); }}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-emerald-500 text-black shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 border-dashed backdrop-blur-sm flex flex-col items-center justify-center text-center min-h-[300px] hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Upload {activeTab} for analysis</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Drag and drop your file here, or click to browse. Max file size: 50MB.
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-emerald-500/20"
          >
            {isScanning ? (
              <>
                <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Analyzing Media...
              </>
            ) : (
              "Start Analysis"
            )}
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {result === 'fake' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 backdrop-blur-sm flex flex-col"
            >
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-rose-500/20">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 shrink-0">
                  <AlertTriangle className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-rose-400">Deepfake Detected</h3>
                  <p className="text-rose-300/70 text-sm mt-1">High probability of AI manipulation</p>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-medium">Confidence Score</span>
                    <span className="text-rose-400 font-bold">98.5%</span>
                  </div>
                  <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '98.5%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-rose-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Manipulation Type</p>
                    <p className="text-white font-medium">Face Swap (GAN)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-xs text-slate-500 mb-1">Anomalies Found</p>
                    <p className="text-white font-medium">Eye blinking, Edge blending</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

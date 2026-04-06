import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link as LinkIcon, ShieldCheck, ShieldAlert, Globe, Lock, AlertTriangle, ExternalLink, XCircle } from "lucide-react";

interface ScanResult {
  safe: boolean;
  riskLevel: 'safe' | 'suspicious' | 'malicious';
  reasons: string[];
  details: any;
}

export function UrlScanner() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Basic URL validation
    let validUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      validUrl = 'https://' + url;
      setUrl(validUrl);
    }
    
    setIsScanning(true);
    setResult(null);
    setPreviewUrl(null);

    try {
      const response = await fetch('/api/scan-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: validUrl })
      });
      
      const data = await response.json();
      setResult(data);
      setPreviewUrl(validUrl);
    } catch (error) {
      console.error("Scan failed:", error);
      setResult({
        safe: false,
        riskLevel: 'suspicious',
        reasons: ["Failed to complete scan. Please try again later."],
        details: {}
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleGoToWebsite = () => {
    if (result?.safe && previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <LinkIcon className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">URL Scanner</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Analyze any website link for malware, phishing, and domain reputation before visiting.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleScan}
        className="relative max-w-2xl mx-auto"
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Globe className="w-5 h-5 text-slate-500" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full pl-12 pr-32 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-2xl"
          required
        />
        <button
          type="submit"
          disabled={isScanning || !url}
          className="absolute inset-y-2 right-2 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isScanning ? (
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            "Scan URL"
          )}
        </button>
      </motion.form>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Scan Results Panel */}
            <div className={`p-6 rounded-2xl border backdrop-blur-sm h-fit ${
              result.safe 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : result.riskLevel === 'suspicious'
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-rose-500/5 border-rose-500/20'
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                  result.safe 
                    ? 'bg-emerald-500/20 border-emerald-500/30' 
                    : result.riskLevel === 'suspicious'
                      ? 'bg-amber-500/20 border-amber-500/30'
                      : 'bg-rose-500/20 border-rose-500/30'
                }`}>
                  {result.safe ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  ) : result.riskLevel === 'suspicious' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-rose-400" />
                  )}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${
                    result.safe ? 'text-emerald-400' : result.riskLevel === 'suspicious' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {result.safe ? 'Safe Website' : result.riskLevel === 'suspicious' ? 'Suspicious Website' : 'Malicious Website Detected'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {result.safe ? 'No threats detected on this URL.' : 'This URL exhibits risky behavior or known threats.'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-slate-300">Analysis Details</h4>
                {result.reasons.map((reason, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                    {result.safe ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${result.riskLevel === 'suspicious' ? 'text-amber-400' : 'text-rose-400'}`} />
                    )}
                    <p className="text-sm text-slate-300">{reason}</p>
                  </div>
                ))}
              </div>

              {/* Risk Score Meter */}
              {result.details?.ipqs?.risk_score !== undefined && (
                <div className="mb-6 p-5 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300">Overall Risk Score</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Powered by IPQualityScore</p>
                    </div>
                    <div className={`text-3xl font-bold ${
                      result.details.ipqs.risk_score <= 30 ? 'text-emerald-400' :
                      result.details.ipqs.risk_score <= 75 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {result.details.ipqs.risk_score}<span className="text-base text-slate-500 font-normal">/100</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(result.details.ipqs.risk_score, 2)}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className={`h-full rounded-full ${
                        result.details.ipqs.risk_score <= 30 ? 'bg-emerald-500' :
                        result.details.ipqs.risk_score <= 75 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              {result.safe ? (
                <button
                  onClick={handleGoToWebsite}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Go to the website
                  <ExternalLink className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                  <XCircle className="w-5 h-5" />
                  Access Blocked for Your Safety
                </div>
              )}
            </div>

            {/* Website Preview Panel */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-slate-400" />
                  Website Preview
                </h3>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
              </div>
              
              <div className="flex-1 bg-black/50 rounded-xl border border-white/10 overflow-hidden relative">
                {previewUrl ? (
                  <div className="w-full h-full bg-white relative">
                    {/* We use a screenshot API because many sites block iframes via X-Frame-Options. 
                        This is also much safer for a security scanner as it prevents malicious code execution. */}
                    <img 
                      src={`https://image.thum.io/get/width/1200/crop/800/noanimate/${previewUrl}`}
                      alt="Website Preview"
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                    Preview will appear here
                  </div>
                )}
                
                {/* Overlay for unsafe sites to prevent interaction in preview */}
                {!result.safe && previewUrl && (
                  <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                    <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Preview Disabled</h4>
                    <p className="text-slate-300 text-sm max-w-xs">
                      For your protection, we have disabled the live preview of this potentially malicious website.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

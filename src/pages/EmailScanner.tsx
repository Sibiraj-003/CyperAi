import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Upload, ShieldAlert, AlertTriangle, CheckCircle, ArrowRight, RefreshCw, LogOut } from "lucide-react";

interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  body: string;
}

export function EmailScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<null | 'safe' | 'suspicious' | 'malicious'>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailContent, setEmailContent] = useState("");

  useEffect(() => {
    checkAuthStatus();

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkAuthStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsConnected(data.connected);
      if (data.connected) {
        fetchEmails();
      }
    } catch (error) {
      console.error('Failed to check auth status', error);
    }
  };

  const fetchEmails = async () => {
    setIsLoadingEmails(true);
    try {
      const res = await fetch('/api/emails');
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails);
      } else if (res.status === 401) {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to fetch emails', error);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsConnected(false);
      setEmails([]);
      setSelectedEmail(null);
      setEmailContent("");
      setResult(null);
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const handleScan = () => {
    if (!emailContent) return;
    setIsScanning(true);
    setResult(null);
    setTimeout(() => {
      setIsScanning(false);
      // Simple mock logic based on content
      const contentLower = emailContent.toLowerCase();
      if (contentLower.includes('password') || contentLower.includes('verify') || contentLower.includes('urgent')) {
        setResult('malicious');
      } else {
        setResult('safe');
      }
    }, 2000);
  };

  const selectEmail = (email: Email) => {
    setSelectedEmail(email);
    setEmailContent(`From: ${email.from}\nSubject: ${email.subject}\nDate: ${email.date}\n\n${email.body || email.snippet}`);
    setResult(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Email Scanner</h2>
          <p className="text-slate-400 text-sm mt-1">Analyze email content for phishing attempts and malicious payloads</p>
        </div>
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors flex items-center gap-2 text-sm"
          >
            <Mail className="w-4 h-4" />
            Connect Gmail
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Emails</h3>
              <button onClick={fetchEmails} disabled={isLoadingEmails} className="p-2 text-slate-400 hover:text-white transition-colors">
                <RefreshCw className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-2 h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {isLoadingEmails && emails.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">Loading emails...</div>
              ) : emails.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No recent emails found.</div>
              ) : (
                emails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => selectEmail(email)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedEmail?.id === email.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className="font-medium text-white text-sm truncate">{email.subject}</div>
                    <div className="text-xs text-slate-400 truncate mt-1">{email.from}</div>
                    <div className="text-xs text-slate-500 mt-2 line-clamp-2">{email.snippet}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${isConnected ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}
        >
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Email Content</label>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <Upload className="w-3 h-3" /> Upload .eml file
              </button>
            </div>
            <textarea
              className="w-full h-64 bg-black/50 border border-white/10 rounded-xl p-4 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all custom-scrollbar"
              placeholder={isConnected ? "Select an email from the list or paste content here..." : "Paste email headers and body here..."}
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
            <button
              onClick={handleScan}
              disabled={isScanning || !emailContent}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Scan Email
                </>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {result === 'malicious' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 backdrop-blur-sm flex flex-col"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 shrink-0">
                    <ShieldAlert className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-rose-400">High Risk Detected</h3>
                    <p className="text-slate-400 text-sm mt-1">This email exhibits strong indicators of a phishing attempt.</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Suspicious Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["password", "verify", "urgent"].filter(kw => emailContent.toLowerCase().includes(kw)).map(kw => (
                        <span key={kw} className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="mt-6 w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold transition-colors flex items-center justify-center gap-2">
                  Move to Quarantine
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {result === 'safe' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm flex flex-col"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-400">Safe Email</h3>
                    <p className="text-slate-400 text-sm mt-1">No malicious content or phishing indicators detected.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function LinkIcon(props: any) {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

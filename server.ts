import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import cookieParser from "cookie-parser";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get("/api/auth/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL}/api/auth/callback`;
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ url });
  });

  app.get(["/api/auth/callback", "/api/auth/callback/"], async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing code');
    }

    try {
      const redirectUri = `${process.env.APP_URL}/api/auth/callback`;
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );

      const { tokens } = await oauth2Client.getToken(code);
      
      res.cookie('gmail_tokens', JSON.stringify(tokens), {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      res.status(500).send('Authentication failed');
    }
  });

  app.get("/api/auth/status", (req, res) => {
    const tokensCookie = req.cookies.gmail_tokens;
    if (tokensCookie) {
      res.json({ connected: true });
    } else {
      res.json({ connected: false });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('gmail_tokens', {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
    });
    res.json({ success: true });
  });

  app.post("/api/scan-url", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      // 1. Google Safe Browsing
      const gsbResponse = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: "cybershield", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
          }
        })
      });
      const gsbData = await gsbResponse.json();
      const gsbThreats = gsbData.matches || [];

      // 2. IPQualityScore
      const encodedUrl = encodeURIComponent(url);
      const ipqsResponse = await fetch(`https://www.ipqualityscore.com/api/json/url/${process.env.IPQS_API_KEY}/${encodedUrl}`);
      const ipqsData = await ipqsResponse.json();

      // 3. Combine Results
      let isSafe = true;
      let riskLevel = 'safe';
      let reasons: string[] = [];

      if (gsbThreats.length > 0) {
        isSafe = false;
        riskLevel = 'malicious';
        reasons.push(`Google Safe Browsing flagged this as: ${gsbThreats.map((t: any) => t.threatType.replace(/_/g, ' ')).join(', ')}`);
      }

      if (ipqsData.success) {
        if (ipqsData.unsafe || ipqsData.risk_score > 75) {
          isSafe = false;
          riskLevel = 'malicious';
          if (ipqsData.phishing) reasons.push("Phishing detected by IPQualityScore");
          if (ipqsData.malware) reasons.push("Malware detected by IPQualityScore");
          if (ipqsData.spam) reasons.push("Spam detected by IPQualityScore");
          reasons.push(`High risk score: ${ipqsData.risk_score}/100`);
        } else if (ipqsData.risk_score > 50) {
          if (riskLevel !== 'malicious') riskLevel = 'suspicious';
          reasons.push(`Moderate risk score: ${ipqsData.risk_score}/100`);
        }
      }

      if (isSafe && reasons.length === 0) {
        reasons.push("No threats detected by Google Safe Browsing or IPQualityScore.");
      }

      res.json({
        safe: isSafe,
        riskLevel,
        reasons,
        details: {
          gsb: gsbThreats,
          ipqs: ipqsData
        }
      });

    } catch (error) {
      console.error("URL Scan Error:", error);
      res.status(500).json({ error: "Failed to scan URL" });
    }
  });

  app.get("/api/emails", async (req, res) => {
    const tokensCookie = req.cookies.gmail_tokens;
    if (!tokensCookie) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const tokens = JSON.parse(tokensCookie);
      const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      client.setCredentials(tokens);

      const gmail = google.gmail({ version: 'v1', auth: client });
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: 'in:inbox'
      });

      const messages = response.data.messages || [];
      
      const emailDetails = await Promise.all(
        messages.map(async (msg) => {
          const msgData = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full'
          });
          
          const headers = msgData.data.payload?.headers;
          const subject = headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
          const from = headers?.find(h => h.name === 'From')?.value || 'Unknown Sender';
          const date = headers?.find(h => h.name === 'Date')?.value || '';
          
          let body = '';
          if (msgData.data.payload?.parts) {
            const part = msgData.data.payload.parts.find(p => p.mimeType === 'text/plain');
            if (part && part.body?.data) {
              body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
          } else if (msgData.data.payload?.body?.data) {
            body = Buffer.from(msgData.data.payload.body.data, 'base64').toString('utf-8');
          }

          return {
            id: msg.id,
            subject,
            from,
            date,
            snippet: msgData.data.snippet,
            body
          };
        })
      );

      res.json({ emails: emailDetails });
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

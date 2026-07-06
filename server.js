// Digital Forensics Detective — zero-dependency static file server.
// Run: node server.js  (then open http://localhost:3000)
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');

// ---- Leaderboard (Google Sheet via Apps Script web app) ----
// Paste your deployed Apps Script "/exec" URL here, or set env APPS_SCRIPT_URL.
// See apps-script/Code.gs for deployment steps. Leave blank to disable.
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxG5Ft7rRDCzmn4pwi5MKtOVJl-KIlJ1OAqlBb96YnQ_EUuVB1GrAg6kn94S66JLjuh/exec';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendJson(res, code, obj) {
  const s = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(s);
}

// Forward a request to the Apps Script web app, following its 302 redirect
// (Apps Script /exec answers with a redirect to script.googleusercontent.com).
function proxyToAppsScript(method, urlStr, bodyStr, cb) {
  if (!APPS_SCRIPT_URL) return cb(new Error('leaderboard not configured'), null);
  let redirects = 0;
  const doReq = (target, m, payload) => {
    const u = new URL(target);
    const opts = {
      method: m,
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      headers: {},
    };
    if (payload) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const r = https.request(opts, resp => {
      // Follow redirects (GET) that Apps Script issues.
      if ([301, 302, 303, 307, 308].includes(resp.statusCode) && resp.headers.location && redirects < 5) {
        redirects++;
        resp.resume();
        const nextMethod = resp.statusCode === 307 || resp.statusCode === 308 ? m : 'GET';
        return doReq(resp.headers.location, nextMethod, nextMethod === m ? payload : null);
      }
      let data = '';
      resp.on('data', d => (data += d));
      resp.on('end', () => cb(null, { status: resp.statusCode, body: data }));
    });
    r.on('error', err => cb(err, null));
    if (payload) r.write(payload);
    r.end();
  };
  doReq(urlStr, method, bodyStr);
}

// Apps Script intermittently returns an HTML error page ("The JavaScript
// runtime exited unexpectedly", "Page Not Found") instead of JSON, especially
// under rapid/concurrent hits. Wrap the proxy: validate the body parses as
// JSON, and retry a few times with backoff before giving up. Returns the parsed
// object (or an {ok:false} on final failure) via cb(parsedObj).
function callAppsScript(method, target, bodyStr, cb, attempt) {
  attempt = attempt || 1;
  const MAX = 4;
  proxyToAppsScript(method, target, bodyStr, (err, out) => {
    let parsed = null;
    if (!err && out && out.body) {
      try { parsed = JSON.parse(out.body); } catch (_) { parsed = null; }
    }
    // Success: got valid JSON with an ok flag.
    if (parsed && typeof parsed.ok !== 'undefined') return cb(parsed);
    // Failure: transient upstream hiccup. Retry with backoff.
    if (attempt < MAX) {
      const delay = 250 * attempt;
      console.warn(`[leaderboard] ${method} attempt ${attempt} bad response, retrying in ${delay}ms`);
      return setTimeout(() => callAppsScript(method, target, bodyStr, cb, attempt + 1), delay);
    }
    console.error(`[leaderboard] ${method} failed after ${MAX} attempts`,
      err ? err.message : `HTTP ${out && out.status}`);
    cb({ ok: false, error: 'leaderboard upstream error — please retry' });
  });
}

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);

  // ---- API: leaderboard ----
  if (parsed.pathname === '/api/leaderboard') {
    if (!APPS_SCRIPT_URL) return sendJson(res, 503, { ok: false, error: 'leaderboard not configured' });

    if (req.method === 'GET') {
      const limit = parsed.searchParams.get('limit') || '20';
      const target = `${APPS_SCRIPT_URL}?limit=${encodeURIComponent(limit)}`;
      callAppsScript('GET', target, null, result =>
        sendJson(res, result.ok ? 200 : 502, result));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      let aborted = false;
      req.on('data', c => {
        body += c;
        if (body.length > 4096) { aborted = true; req.destroy(); } // cap payload
      });
      req.on('end', () => {
        if (aborted) return;
        callAppsScript('POST', APPS_SCRIPT_URL, body, result =>
          sendJson(res, result.ok ? 200 : 502, result));
      });
      return;
    }

    return sendJson(res, 405, { ok: false, error: 'method not allowed' });
  }

  // ---- static files ----
  // Strip query string, default to index.html.
  let urlPath = decodeURIComponent(parsed.pathname);
  if (urlPath === '/') urlPath = '/index.html';

  // Resolve safely inside ROOT to block path traversal.
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  🔍 Digital Forensics Detective running`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → leaderboard: ${APPS_SCRIPT_URL ? 'ON' : 'OFF (set APPS_SCRIPT_URL)'}\n`);
});

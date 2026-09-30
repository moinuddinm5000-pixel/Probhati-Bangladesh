import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-memory Login Rate Limiting (protect against brute force)
interface RateLimitRecord {
  attempts: number;
  lockUntil: number;
}
const loginAttempts: Map<string, RateLimitRecord> = new Map();

function checkLoginRateLimit(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown-client';
  const record = loginAttempts.get(clientIp);
  const now = Date.now();

  if (record && record.lockUntil > now) {
    const remainingSeconds = Math.ceil((record.lockUntil - now) / 1000);
    return res.status(429).json({
      error: `অতিরিক্ত ভুল চেষ্টার কারণে আপনার সংযোগ সাময়িক স্থগিত রয়েছে। অনুগ্রহ করে ${remainingSeconds} সেকেন্ড পর চেষ্টা করুন।`
    });
  }

  next();
}

function recordFailedLogin(ip: string) {
  const now = Date.now();
  const current = loginAttempts.get(ip) || { attempts: 0, lockUntil: 0 };
  current.attempts += 1;
  if (current.attempts >= 5) {
    current.lockUntil = now + 15 * 60 * 1000; // 15 min lock
    current.attempts = 0;
  }
  loginAttempts.set(ip, current);
}

function clearFailedLogin(ip: string) {
  loginAttempts.delete(ip);
}

// Authentication Middleware
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'প্রশাসক হিসেবে লগইন করা আবশ্যক।' });
  }

  const token = authHeader.substring(7);
  if (!db.verifySession(token)) {
    return res.status(401).json({ error: 'সেশনের মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।' });
  }

  next();
}

// --- Auth Routes ---
app.get('/api/auth/status', (req, res) => {
  const status = db.getAdminStatus();
  res.json(status);
});

app.post('/api/auth/setup', (req, res) => {
  const { username, password } = req.body;
  const status = db.getAdminStatus();

  if (status.isConfigured) {
    return res.status(400).json({ error: 'প্রশাসক অ্যাকাউন্ট ইতিমধ্যে প্রস্তুত করা হয়েছে।' });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'পাসওয়ার্ড অবশ্যই কমপক্ষে ৮ অক্ষরের হতে হবে।' });
  }

  const result = db.setupAdminPassword(username || 'Moinuddin', password);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  const token = db.createSession(username || 'Moinuddin');
  res.json({ success: true, token, username: username || 'Moinuddin', message: result.message });
});

app.post('/api/auth/login', checkLoginRateLimit, (req, res) => {
  const { username, password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown-client';

  if (!username || !password) {
    return res.status(400).json({ error: 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।' });
  }

  const isValid = db.verifyAdminPassword(username, password);
  if (!isValid) {
    recordFailedLogin(clientIp);
    return res.status(401).json({ error: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড।' });
  }

  clearFailedLogin(clientIp);
  const token = db.createSession(username);
  res.json({
    success: true,
    token,
    user: { username }
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    db.revokeSession(authHeader.substring(7));
  }
  res.json({ success: true, message: 'লগআউট সম্পন্ন হয়েছে।' });
});

app.post('/api/auth/change-password', requireAdminAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = db.changeAdminPassword(oldPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false });
  }
  const token = authHeader.substring(7);
  const isValid = db.verifySession(token);
  res.json({ authenticated: isValid, username: 'Moinuddin' });
});

// --- News API ---
app.get('/api/news', (req, res) => {
  const {
    status,
    category,
    search,
    tag,
    author,
    featured,
    breaking,
    topNews,
    limit,
    offset,
    sort
  } = req.query;

  const result = db.getArticles({
    status: status as string,
    category: category as string,
    search: search as string,
    tag: tag as string,
    author: author as string,
    isFeatured: featured === 'true' ? true : (featured === 'false' ? false : undefined),
    isBreaking: breaking === 'true' ? true : (breaking === 'false' ? false : undefined),
    isTopNews: topNews === 'true' ? true : (topNews === 'false' ? false : undefined),
    limit: limit ? parseInt(limit as string, 10) : undefined,
    offset: offset ? parseInt(offset as string, 10) : undefined,
    sort: sort as 'latest' | 'popular' | 'oldest'
  });

  res.json(result);
});

app.get('/api/news/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const incrementView = req.query.view !== 'false';
  const article = db.getArticleByIdOrSlug(idOrSlug, incrementView);

  if (!article) {
    return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি।' });
  }

  res.json(article);
});

app.post('/api/news', requireAdminAuth, (req, res) => {
  try {
    const article = db.createArticle(req.body);
    res.status(201).json(article);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'সংবাদ তৈরি ব্যর্থ হয়েছে।' });
  }
});

app.put('/api/news/:id', requireAdminAuth, (req, res) => {
  const updated = db.updateArticle(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি।' });
  }
  res.json(updated);
});

app.delete('/api/news/:id', requireAdminAuth, (req, res) => {
  const permanent = req.query.permanent === 'true';
  const success = db.deleteArticle(req.params.id, permanent);
  if (!success) {
    return res.status(404).json({ error: 'সংবাদটি পাওয়া যায়নি।' });
  }
  res.json({ success: true, message: permanent ? 'সংবাদটি সম্পূর্ণ মুছে ফেলা হয়েছে।' : 'সংবাদটি ট্র্যাশে সরানো হয়েছে।' });
});

// --- Categories API ---
app.get('/api/categories', (req, res) => {
  const categories = db.getCategories();
  res.json(categories);
});

app.post('/api/categories', requireAdminAuth, (req, res) => {
  const category = db.saveCategory(req.body);
  res.status(201).json(category);
});

app.put('/api/categories/:id', requireAdminAuth, (req, res) => {
  const category = db.saveCategory({ ...req.body, id: req.params.id });
  res.json(category);
});

app.delete('/api/categories/:id', requireAdminAuth, (req, res) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'ক্যাটাগরি পাওয়া যায়নি।' });
  }
  res.json({ success: true, message: 'ক্যাটাগরি মুছে ফেলা হয়েছে।' });
});

app.post('/api/categories/reorder', requireAdminAuth, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'অর্ডার তালিকা সঠিক নয়।' });
  }
  const updated = db.reorderCategories(orderedIds);
  res.json(updated);
});

// --- Settings API ---
app.get('/api/settings', (req, res) => {
  const settings = db.getSettings();
  res.json(settings);
});

app.put('/api/settings', requireAdminAuth, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// --- Advertisements API ---
app.get('/api/ads', (req, res) => {
  const ads = db.getAds();
  res.json(ads);
});

app.put('/api/ads/:id', requireAdminAuth, (req, res) => {
  const updated = db.updateAd(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'বিজ্ঞাপন স্লট পাওয়া যায়নি।' });
  }
  res.json(updated);
});

// --- Media Library API ---
app.get('/api/media', (req, res) => {
  const media = db.getMedia();
  res.json(media);
});

app.post('/api/media', requireAdminAuth, (req, res) => {
  try {
    const item = db.addMedia(req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'মিডিয়া আপলোড ব্যর্থ হয়েছে।' });
  }
});

app.delete('/api/media/:id', requireAdminAuth, (req, res) => {
  const success = db.deleteMedia(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'মিডিয়া পাওয়া যায়নি।' });
  }
  res.json({ success: true, message: 'মিডিয়া মুছে ফেলা হয়েছে।' });
});

// --- Admin Stats API ---
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  const stats = db.getStats();
  res.json(stats);
});

// --- XML Sitemap & Robots.txt for SEO ---
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const articles = db.getArticles({ status: 'published', limit: 200 }).articles;
  const categories = db.getCategories();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Home
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Categories
  categories.forEach(cat => {
    xml += `  <url>\n    <loc>${baseUrl}/category/${cat.slug}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Articles
  articles.forEach(art => {
    xml += `  <url>\n    <loc>${baseUrl}/news/${art.slug}</loc>\n    <lastmod>${new Date(art.updatedAt || art.publishDate).toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const text = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(text);
});

// --- Server & Vite Mounting ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Probhati Bangladesh portal server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Category,
  NewsArticle,
  SiteSettings,
  AdPlacement,
  MediaItem
} from '../src/types/news';
import {
  INITIAL_CATEGORIES,
  INITIAL_ARTICLES,
  INITIAL_SETTINGS,
  INITIAL_ADS,
  INITIAL_MEDIA
} from '../src/data/initialData';

interface AdminAccount {
  username: string;
  passwordHash: string | null;
  passwordSalt: string | null;
  isConfigured: boolean;
  lastLoginAt?: string;
  updatedAt?: string;
}

interface DatabaseSchema {
  admin: AdminAccount;
  categories: Category[];
  articles: NewsArticle[];
  settings: SiteSettings;
  ads: AdPlacement[];
  media: MediaItem[];
  sessions: { token: string; expiresAt: number; username: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'news_portal_db.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Merge in any missing defaults if file already existed
        return {
          admin: parsed.admin || {
            username: 'Moinuddin',
            passwordHash: null,
            passwordSalt: null,
            isConfigured: false
          },
          categories: parsed.categories?.length ? parsed.categories : INITIAL_CATEGORIES,
          articles: parsed.articles?.length ? parsed.articles : INITIAL_ARTICLES,
          settings: parsed.settings || INITIAL_SETTINGS,
          ads: parsed.ads?.length ? parsed.ads : INITIAL_ADS,
          media: parsed.media?.length ? parsed.media : INITIAL_MEDIA,
          sessions: parsed.sessions || []
        };
      }
    } catch (err) {
      console.error('Error loading database, resetting to defaults:', err);
    }

    // Default initialization
    const defaultData: DatabaseSchema = {
      admin: {
        username: 'Moinuddin',
        passwordHash: null,
        passwordSalt: null,
        isConfigured: false
      },
      categories: INITIAL_CATEGORIES,
      articles: INITIAL_ARTICLES,
      settings: INITIAL_SETTINGS,
      ads: INITIAL_ADS,
      media: INITIAL_MEDIA,
      sessions: []
    };

    this.persist(defaultData);
    return defaultData;
  }

  private persist(dataToSave?: DatabaseSchema) {
    const data = dataToSave || this.data;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Password Hashing with scrypt ---
  private hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  // --- Admin Authentication Methods ---
  public getAdminStatus(): { isConfigured: boolean; defaultUsername: string } {
    return {
      isConfigured: this.data.admin.isConfigured && !!this.data.admin.passwordHash,
      defaultUsername: this.data.admin.username || 'Moinuddin'
    };
  }

  public setupAdminPassword(username: string, password: string): { success: boolean; message: string } {
    if (!password || password.length < 8) {
      return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword(password, salt);

    this.data.admin = {
      username: username.trim() || 'Moinuddin',
      passwordHash: hash,
      passwordSalt: salt,
      isConfigured: true,
      updatedAt: new Date().toISOString()
    };

    this.persist();
    return { success: true, message: 'প্রশাসক পাসওয়ার্ড সফলভাবে সেট করা হয়েছে।' };
  }

  public verifyAdminPassword(username: string, password: string): boolean {
    if (!this.data.admin.isConfigured || !this.data.admin.passwordHash || !this.data.admin.passwordSalt) {
      return false;
    }

    if (username.trim().toLowerCase() !== this.data.admin.username.toLowerCase()) {
      return false;
    }

    const hash = this.hashPassword(password, this.data.admin.passwordSalt);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(this.data.admin.passwordHash, 'hex')
    );

    if (isValid) {
      this.data.admin.lastLoginAt = new Date().toISOString();
      this.persist();
    }
    return isValid;
  }

  public changeAdminPassword(oldPassword: string, newPassword: string): { success: boolean; message: string } {
    if (!this.verifyAdminPassword(this.data.admin.username, oldPassword)) {
      return { success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword(newPassword, salt);

    this.data.admin.passwordHash = hash;
    this.data.admin.passwordSalt = salt;
    this.data.admin.updatedAt = new Date().toISOString();

    // Revoke all existing sessions
    this.data.sessions = [];
    this.persist();

    return { success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।' };
  }

  // --- Session Management (24 hours expiration) ---
  public createSession(username: string): string {
    // Purge expired sessions
    const now = Date.now();
    this.data.sessions = this.data.sessions.filter(s => s.expiresAt > now);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

    this.data.sessions.push({ token, expiresAt, username });
    this.persist();
    return token;
  }

  public verifySession(token: string): boolean {
    if (!token) return false;
    const now = Date.now();
    const session = this.data.sessions.find(s => s.token === token && s.expiresAt > now);
    return !!session;
  }

  public revokeSession(token: string) {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  // --- News Articles Operations ---
  public getArticles(filter?: {
    status?: string;
    category?: string;
    search?: string;
    tag?: string;
    author?: string;
    isFeatured?: boolean;
    isBreaking?: boolean;
    isTopNews?: boolean;
    limit?: number;
    offset?: number;
    sort?: 'latest' | 'popular' | 'oldest';
  }): { articles: NewsArticle[]; total: number } {
    let list = [...this.data.articles];

    // Status filter: default to 'published' for public viewers unless status is specified
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(a => a.status === filter.status);
    }

    if (filter?.category && filter.category !== 'all') {
      const catLower = filter.category.toLowerCase();
      list = list.filter(a => 
        a.category.toLowerCase() === catLower || 
        a.categorySlug?.toLowerCase() === catLower
      );
    }

    if (filter?.tag) {
      const tagLower = filter.tag.toLowerCase();
      list = list.filter(a => a.tags?.some(t => t.toLowerCase().includes(tagLower)));
    }

    if (filter?.author) {
      const authLower = filter.author.toLowerCase();
      list = list.filter(a => a.author.toLowerCase().includes(authLower));
    }

    if (filter?.isFeatured !== undefined) {
      list = list.filter(a => !!a.isFeatured === filter.isFeatured);
    }

    if (filter?.isBreaking !== undefined) {
      list = list.filter(a => !!a.isBreaking === filter.isBreaking);
    }

    if (filter?.isTopNews !== undefined) {
      list = list.filter(a => !!a.isTopNews === filter.isTopNews);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (filter?.sort === 'popular') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (filter?.sort === 'oldest') {
      list.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
    } else {
      // Default: latest
      list.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    }

    const total = list.length;
    const offset = filter?.offset || 0;
    const limit = filter?.limit || total;
    const paginated = list.slice(offset, offset + limit);

    return { articles: paginated, total };
  }

  public getArticleByIdOrSlug(idOrSlug: string, incrementView = false): NewsArticle | null {
    const article = this.data.articles.find(a => a.id === idOrSlug || a.slug === idOrSlug);
    if (!article) return null;

    if (incrementView) {
      article.views = (article.views || 0) + 1;
      this.persist();
    }
    return article;
  }

  public createArticle(articleData: Partial<NewsArticle>): NewsArticle {
    const id = `news-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    
    // Generate slug from title if not given
    const slug = articleData.slug?.trim() || 
      articleData.title?.trim().toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-').replace(/^-+|-+$/g, '') ||
      `news-${Date.now()}`;

    // Find category slug
    const cat = this.data.categories.find(c => c.name === articleData.category || c.slug === articleData.categorySlug);

    const newArticle: NewsArticle = {
      id,
      title: articleData.title || 'শিরোনামহীন সংবাদ',
      slug,
      summary: articleData.summary || '',
      content: articleData.content || '',
      category: articleData.category || cat?.name || 'জাতীয়',
      categorySlug: cat?.slug || articleData.categorySlug || 'national',
      subcategory: articleData.subcategory || '',
      featuredImage: articleData.featuredImage || '/src/assets/images/bd_padma_bridge_1790774077362.jpg',
      imageCaption: articleData.imageCaption || '',
      imageAlt: articleData.imageAlt || articleData.title || '',
      imageAttribution: articleData.imageAttribution || '',
      additionalImages: articleData.additionalImages || [],
      author: articleData.author || 'প্রভাতী প্রতিবেদক',
      authorRole: articleData.authorRole || 'নিজস্ব প্রতিবেদক',
      tags: articleData.tags || [],
      status: articleData.status || 'published',
      publishDate: articleData.publishDate || now,
      scheduledDate: articleData.scheduledDate,
      createdAt: now,
      updatedAt: now,
      views: 0,
      isBreaking: !!articleData.isBreaking,
      isFeatured: !!articleData.isFeatured,
      isTopNews: !!articleData.isTopNews,
      isPinned: !!articleData.isPinned,
      seoTitle: articleData.seoTitle || articleData.title,
      seoDescription: articleData.seoDescription || articleData.summary,
      source: articleData.source || '',
      isSample: articleData.isSample ?? false
    };

    this.data.articles.unshift(newArticle);
    this.persist();
    return newArticle;
  }

  public updateArticle(id: string, updates: Partial<NewsArticle>): NewsArticle | null {
    const idx = this.data.articles.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const current = this.data.articles[idx];
    const cat = updates.category ? this.data.categories.find(c => c.name === updates.category || c.slug === updates.categorySlug) : undefined;

    const updated: NewsArticle = {
      ...current,
      ...updates,
      categorySlug: cat ? cat.slug : (updates.categorySlug || current.categorySlug),
      updatedAt: new Date().toISOString()
    };

    this.data.articles[idx] = updated;
    this.persist();
    return updated;
  }

  public deleteArticle(id: string, permanent = false): boolean {
    const idx = this.data.articles.findIndex(a => a.id === id);
    if (idx === -1) return false;

    if (permanent) {
      this.data.articles.splice(idx, 1);
    } else {
      // Soft delete to trash
      this.data.articles[idx].status = 'trash';
      this.data.articles[idx].updatedAt = new Date().toISOString();
    }
    this.persist();
    return true;
  }

  // --- Categories Operations ---
  public getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.order - b.order);
  }

  public saveCategory(categoryData: Partial<Category>): Category {
    if (categoryData.id) {
      const idx = this.data.categories.findIndex(c => c.id === categoryData.id);
      if (idx !== -1) {
        this.data.categories[idx] = { ...this.data.categories[idx], ...categoryData };
        this.persist();
        return this.data.categories[idx];
      }
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: categoryData.name || 'নতুন ক্যাটাগরি',
      slug: categoryData.slug || `cat-${Date.now()}`,
      order: categoryData.order || this.data.categories.length + 1,
      showOnHome: categoryData.showOnHome ?? true,
      color: categoryData.color || '#b91c1c'
    };

    this.data.categories.push(newCat);
    this.persist();
    return newCat;
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.persist();
    return true;
  }

  public reorderCategories(orderedIds: string[]): Category[] {
    orderedIds.forEach((id, index) => {
      const cat = this.data.categories.find(c => c.id === id);
      if (cat) cat.order = index + 1;
    });
    this.persist();
    return this.getCategories();
  }

  // --- Settings Operations ---
  public getSettings(): SiteSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }

  // --- Ads Operations ---
  public getAds(): AdPlacement[] {
    return [...this.data.ads];
  }

  public updateAd(id: string, updates: Partial<AdPlacement>): AdPlacement | null {
    const idx = this.data.ads.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.ads[idx] = { ...this.data.ads[idx], ...updates };
    this.persist();
    return this.data.ads[idx];
  }

  // --- Media Library Operations ---
  public getMedia(): MediaItem[] {
    return [...this.data.media].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addMedia(item: Partial<MediaItem>): MediaItem {
    const newMedia: MediaItem = {
      id: `media-${Date.now()}`,
      name: item.name || 'নতুন মিডিয়া ফাইল',
      url: item.url || '',
      caption: item.caption || '',
      alt: item.alt || item.name || '',
      attribution: item.attribution || 'সংগৃহীত',
      source: item.source || 'uploaded',
      createdAt: new Date().toISOString()
    };
    this.data.media.unshift(newMedia);
    this.persist();
    return newMedia;
  }

  public deleteMedia(id: string): boolean {
    const idx = this.data.media.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.data.media.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Dashboard Statistics ---
  public getStats() {
    const published = this.data.articles.filter(a => a.status === 'published').length;
    const drafts = this.data.articles.filter(a => a.status === 'draft').length;
    const scheduled = this.data.articles.filter(a => a.status === 'scheduled').length;
    const trash = this.data.articles.filter(a => a.status === 'trash').length;
    const totalViews = this.data.articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const categoriesCount = this.data.categories.length;

    return {
      totalArticles: this.data.articles.length,
      published,
      drafts,
      scheduled,
      trash,
      totalViews,
      categoriesCount,
      recentArticles: this.data.articles.slice(0, 5)
    };
  }
}

export const db = new Database();

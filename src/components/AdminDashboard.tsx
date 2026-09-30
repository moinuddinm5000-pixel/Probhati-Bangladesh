import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Image as ImageIcon,
  Settings,
  Megaphone,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  Search,
  KeyRound,
  ExternalLink,
  Upload,
  ArrowUpDown,
  Flame,
  Globe,
  Star,
  Clock,
  Pin
} from 'lucide-react';
import {
  NewsArticle,
  Category,
  SiteSettings,
  AdPlacement,
  MediaItem
} from '../types/news';
import { api, authStorage } from '../api/client';
import { toBengaliNumber, formatBengaliDate } from '../utils/bengali';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewSite: () => void;
}

type AdminTab = 'dashboard' | 'news' | 'add-news' | 'edit-news' | 'categories' | 'media' | 'settings' | 'ads';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onViewSite }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [ads, setAds] = useState<AdPlacement[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  // News editing state
  const [editingArticle, setEditingArticle] = useState<Partial<NewsArticle> | null>(null);
  const [newsFilterStatus, setNewsFilterStatus] = useState<string>('all');
  const [newsSearch, setNewsSearch] = useState('');

  // Category editing state
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Media selector modal
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [mediaUploadUrl, setMediaUploadUrl] = useState('');
  const [mediaUploadName, setMediaUploadName] = useState('');

  // Auto-clear notices
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  // Initial load
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sData, aData, cData, setts, adsData, mData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getArticles({ status: 'all' }),
        api.getCategories(),
        api.getSettings(),
        api.getAds(),
        api.getMedia()
      ]);

      setStats(sData);
      setArticles(aData.articles || []);
      setCategories(cData || []);
      setSettings(setts);
      setAds(adsData || []);
      setMediaList(mData || []);
    } catch (err: any) {
      setErrorMessage('তথ্য লোড করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Article Handlers ---
  const handleSaveArticle = async (statusOverride?: 'published' | 'draft' | 'scheduled') => {
    if (!editingArticle || !editingArticle.title?.trim()) {
      setErrorMessage('শিরোনাম আবশ্যক');
      return;
    }

    try {
      const statusToSave = statusOverride || editingArticle.status || 'published';
      const toSend = {
        ...editingArticle,
        status: statusToSave,
        categorySlug: categories.find(c => c.name === editingArticle.category)?.slug || editingArticle.categorySlug
      };

      if (editingArticle.id) {
        await api.updateArticle(editingArticle.id, toSend);
        setSuccessMessage('সংবাদ সফলভাবে আপডেট হয়েছে');
      } else {
        await api.createArticle(toSend);
        setSuccessMessage('নতুন সংবাদ সফলভাবে প্রকাশিত হয়েছে');
      }

      setEditingArticle(null);
      setCurrentTab('news');
      loadAllData();
    } catch (err: any) {
      setErrorMessage('সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  };

  const handleDeleteArticle = async (id: string, permanent = false) => {
    if (!window.confirm(permanent ? 'আপনি কি নিশ্চিত যে এই সংবাদটি সম্পূর্ণ মুছে ফেলতে চান?' : 'সংবাদটি কি ট্র্যাশে পাঠাতে চান?')) {
      return;
    }

    try {
      await api.deleteArticle(id, permanent);
      setSuccessMessage(permanent ? 'সংবাদটি সম্পূর্ণ মুছে ফেলা হয়েছে' : 'সংবাদটি ট্র্যাশে পাঠানো হয়েছে');
      loadAllData();
    } catch (err: any) {
      setErrorMessage('মুছে ফেলতে সমস্যা: ' + err.message);
    }
  };

  const handleQuickStatusChange = async (article: NewsArticle, newStatus: 'published' | 'draft' | 'trash') => {
    try {
      await api.updateArticle(article.id, { status: newStatus });
      setSuccessMessage(`সংবাদের স্থিতি '${newStatus}' এ পরিবর্তিত হয়েছে`);
      loadAllData();
    } catch (err: any) {
      setErrorMessage('আপডেট ব্যর্থ: ' + err.message);
    }
  };

  // --- Category Handlers ---
  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategory.name?.trim()) {
      setErrorMessage('ক্যাটাগরির নাম দিন');
      return;
    }

    try {
      const slug = editingCategory.slug?.trim() || editingCategory.name.trim().toLowerCase().replace(/\s+/g, '-');
      if (editingCategory.id) {
        await api.updateCategory(editingCategory.id, { ...editingCategory, slug });
        setSuccessMessage('ক্যাটাগরি আপডেট হয়েছে');
      } else {
        await api.createCategory({ ...editingCategory, slug });
        setSuccessMessage('নতুন ক্যাটাগরি যুক্ত হয়েছে');
      }
      setEditingCategory(null);
      loadAllData();
    } catch (err: any) {
      setErrorMessage('ক্যাটাগরি সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('আপনি কি এই ক্যাটাগরিটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteCategory(id);
      setSuccessMessage('ক্যাটাগরি মুছে ফেলা হয়েছে');
      loadAllData();
    } catch (err: any) {
      setErrorMessage('মুছতে ব্যর্থ: ' + err.message);
    }
  };

  // --- Ads Handlers ---
  const handleUpdateAd = async (ad: AdPlacement) => {
    try {
      await api.updateAd(ad.id, ad);
      setSuccessMessage('বিজ্ঞাপন স্লট আপডেট হয়েছে');
      loadAllData();
    } catch (err: any) {
      setErrorMessage('বিজ্ঞাপন সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  };

  // --- Media Handlers ---
  const handleAddMedia = async () => {
    if (!mediaUploadUrl.trim()) {
      setErrorMessage('ছবির ইউআরএল দিন');
      return;
    }

    try {
      await api.addMedia({
        name: mediaUploadName.trim() || 'চিত্র ফাইল',
        url: mediaUploadUrl.trim(),
        source: 'uploaded',
        attribution: 'প্রভাতী মিডিয়া'
      });
      setMediaUploadUrl('');
      setMediaUploadName('');
      setSuccessMessage('নতুন ছবি যুক্ত হয়েছে');
      loadAllData();
    } catch (err: any) {
      setErrorMessage('ছবি যোগ করা ব্যর্থ: ' + err.message);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('ছবিটি মিডিয়া লাইব্রেরি থেকে মুছতে চান?')) return;
    try {
      await api.deleteMedia(id);
      setSuccessMessage('ছবি মুছে ফেলা হয়েছে');
      loadAllData();
    } catch (err: any) {
      setErrorMessage('মুছতে ব্যর্থ: ' + err.message);
    }
  };

  // --- Password Change Handler ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMessage('নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে');
      return;
    }

    try {
      await api.changePassword(oldPassword, newPassword);
      setSuccessMessage('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে');
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setErrorMessage('পাসওয়ার্ড পরিবর্তন ব্যর্থ: ' + err.message);
    }
  };

  // Filtered Articles
  const filteredArticles = articles.filter(a => {
    if (newsFilterStatus !== 'all' && a.status !== newsFilterStatus) return false;
    if (!newsSearch.trim()) return true;
    const q = newsSearch.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.author.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-bengali">
      {/* Top Navbar */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <h1 className="text-lg font-bold font-serif-bn tracking-wide">
              প্রভাতী বাংলাদেশ | <span className="text-stone-400 font-sans text-xs">Admin Control Portal</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onViewSite}
              className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ওয়েবসাইট দেখুন</span>
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>পাসওয়ার্ড পরিবর্তন</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/60 px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global alert bar */}
      {successMessage && (
        <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-medium shadow animate-in fade-in duration-200 flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-600 text-white text-xs py-2 px-4 text-center font-medium shadow animate-in fade-in duration-200 flex items-center justify-center gap-2">
          <X className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Admin Body */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar (Cols 1-3) */}
        <nav className="md:col-span-3 space-y-1 bg-white p-3 rounded-lg border border-stone-200 shadow-xs h-fit">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              currentTab === 'dashboard' ? 'bg-red-700 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ড্যাশবোর্ড (Dashboard)</span>
          </button>

          <button
            onClick={() => {
              setEditingArticle({
                title: '',
                category: categories[0]?.name || 'জাতীয়',
                categorySlug: categories[0]?.slug || 'national',
                summary: '',
                content: '',
                author: 'নিজস্ব প্রতিবেদক',
                authorRole: 'সিনিয়র প্রতিবেদক',
                featuredImage: mediaList[0]?.url || '/src/assets/images/bd_padma_bridge_1790774077362.jpg',
                tags: ['বাংলাদেশ', 'সর্বশেষ'],
                status: 'published',
                isBreaking: false,
                isFeatured: false,
                isTopNews: false
              });
              setCurrentTab('add-news');
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              currentTab === 'add-news' ? 'bg-red-700 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>নতুন সংবাদ তৈরি (Add News)</span>
          </button>

          <button
            onClick={() => setCurrentTab('news')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              currentTab === 'news' || currentTab === 'edit-news' ? 'bg-red-700 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>সকল সংবাদ ({articles.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('categories')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              currentTab === 'categories' ? 'bg-red-700 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>ক্যাটাগরি ব্যবস্থাপনা ({categories.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('media')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              currentTab === 'media' ? 'bg-red-700 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>মিডিয়া লাইব্রেরি ({mediaList.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('ads')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              currentTab === 'ads' ? 'bg-red-700 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>বিজ্ঞাপন ব্যবস্থাপনা ({ads.length})</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              currentTab === 'settings' ? 'bg-red-700 text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>পোর্টাল সেটিংস</span>
          </button>
        </nav>

        {/* Content Area (Cols 4-12) */}
        <main className="md:col-span-9 bg-white p-5 rounded-lg border border-stone-200 shadow-xs min-h-[500px]">
          {/* TAB 1: DASHBOARD STATS */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-serif-bn text-stone-900 border-b border-stone-200 pb-3">
                পোর্টাল সার্বিক পরিসংখ্যান
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
                  <span className="text-xs text-stone-500 block">মোট সংবাদ</span>
                  <span className="text-2xl font-bold text-stone-900 font-serif-bn">
                    {toBengaliNumber(articles.length)}
                  </span>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-xs text-emerald-700 block">প্রকাশিত সংবাদ</span>
                  <span className="text-2xl font-bold text-emerald-800 font-serif-bn">
                    {toBengaliNumber(articles.filter(a => a.status === 'published').length)}
                  </span>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-xs text-amber-700 block">খসড়া (Drafts)</span>
                  <span className="text-2xl font-bold text-amber-800 font-serif-bn">
                    {toBengaliNumber(articles.filter(a => a.status === 'draft').length)}
                  </span>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-xs text-blue-700 block">মোট ক্যাটাগরি</span>
                  <span className="text-2xl font-bold text-blue-800 font-serif-bn">
                    {toBengaliNumber(categories.length)}
                  </span>
                </div>
              </div>

              {/* Quick Action Bar */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    setEditingArticle({
                      title: '',
                      category: 'জাতীয়',
                      categorySlug: 'national',
                      summary: '',
                      content: '',
                      author: 'নিজস্ব প্রতিবেদক',
                      status: 'published',
                      featuredImage: mediaList[0]?.url || '/src/assets/images/bd_padma_bridge_1790774077362.jpg',
                      tags: ['বাংলাদেশ']
                    });
                    setCurrentTab('add-news');
                  }}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>দ্রুত সংবাদ প্রকাশ করুন</span>
                </button>

                <button
                  onClick={() => setCurrentTab('categories')}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FolderTree className="w-4 h-4" />
                  <span>ক্যাটাগরি সাজান</span>
                </button>
              </div>

              {/* Recent articles overview */}
              <div className="pt-4">
                <h3 className="text-sm font-bold text-stone-800 mb-3">সাম্প্রতিক প্রকাশিত সংবাদ</h3>
                <div className="border border-stone-200 rounded-lg divide-y divide-stone-100 overflow-hidden">
                  {articles.slice(0, 5).map(art => (
                    <div key={art.id} className="p-3 flex items-center justify-between text-xs hover:bg-stone-50">
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="font-semibold text-red-700 mr-2">[{art.category}]</span>
                        <span className="text-stone-900 font-medium">{art.title}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-stone-400">
                        <span>{formatBengaliDate(art.publishDate)}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          art.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {art.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALL NEWS TABLE */}
          {currentTab === 'news' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-200 pb-3">
                <h2 className="text-xl font-bold font-serif-bn text-stone-900">
                  সকল সংবাদ তালিকা
                </h2>

                <button
                  onClick={() => {
                    setEditingArticle({
                      title: '',
                      category: categories[0]?.name || 'জাতীয়',
                      categorySlug: categories[0]?.slug || 'national',
                      summary: '',
                      content: '',
                      author: 'নিজস্ব প্রতিবেদক',
                      status: 'published',
                      featuredImage: mediaList[0]?.url || '/src/assets/images/bd_padma_bridge_1790774077362.jpg',
                      tags: ['বাংলাদেশ']
                    });
                    setCurrentTab('add-news');
                  }}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন সংবাদ লিখুন</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-stone-50 p-2.5 rounded border border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-600">ফিল্টার:</span>
                  <select
                    value={newsFilterStatus}
                    onChange={(e) => setNewsFilterStatus(e.target.value)}
                    className="bg-white border border-stone-300 rounded px-2 py-1 outline-none text-stone-800"
                  >
                    <option value="all">সকল স্থিতি ({articles.length})</option>
                    <option value="published">প্রকাশিত ({articles.filter(a => a.status === 'published').length})</option>
                    <option value="draft">ড্রাফট ({articles.filter(a => a.status === 'draft').length})</option>
                    <option value="trash">ট্র্যাশ ({articles.filter(a => a.status === 'trash').length})</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    placeholder="সংবাদ খুঁজুন..."
                    className="w-full pl-8 pr-3 py-1 text-xs border border-stone-300 rounded bg-white outline-none"
                  />
                </div>
              </div>

              {/* News Articles List */}
              <div className="overflow-x-auto border border-stone-200 rounded-lg">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100 text-stone-600 border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">ছবি</th>
                      <th className="p-2.5">শিরোনাম ও বিভাগ</th>
                      <th className="p-2.5">লেখক</th>
                      <th className="p-2.5">স্থিতি</th>
                      <th className="p-2.5">তারিখ</th>
                      <th className="p-2.5 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredArticles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-stone-400">
                          কোনো সংবাদ পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredArticles.map(article => (
                        <tr key={article.id} className="hover:bg-stone-50/80">
                          <td className="p-2.5 w-16">
                            <img
                              src={article.featuredImage}
                              alt=""
                              className="w-12 h-8 object-cover rounded bg-stone-200 border border-stone-200"
                            />
                          </td>
                          <td className="p-2.5 min-w-[200px]">
                            <div className="font-semibold text-stone-900 line-clamp-1">{article.title}</div>
                            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                              <span className="text-red-700 font-medium">{article.category}</span>
                              {article.isBreaking && <span className="bg-red-100 text-red-700 px-1 rounded text-[9px] font-bold">ব্রেকিং</span>}
                              {article.isFeatured && <span className="bg-amber-100 text-amber-700 px-1 rounded text-[9px] font-bold">ফিচার্ড</span>}
                            </div>
                          </td>
                          <td className="p-2.5 whitespace-nowrap text-stone-600">{article.author}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              article.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                              article.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {article.status === 'published' ? 'প্রকাশিত' : article.status === 'draft' ? 'খসড়া' : 'ট্র্যাশ'}
                            </span>
                          </td>
                          <td className="p-2.5 whitespace-nowrap text-stone-400 text-[11px]">
                            {formatBengaliDate(article.publishDate)}
                          </td>
                          <td className="p-2.5 text-right whitespace-nowrap space-x-1">
                            {/* Quick publish / unpublish */}
                            {article.status === 'published' ? (
                              <button
                                onClick={() => handleQuickStatusChange(article, 'draft')}
                                className="p-1 text-stone-500 hover:text-amber-700 rounded hover:bg-stone-100"
                                title="খসড়ায় নিন"
                              >
                                খসড়া
                              </button>
                            ) : (
                              <button
                                onClick={() => handleQuickStatusChange(article, 'published')}
                                className="p-1 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50 font-semibold"
                                title="এখনই প্রকাশ করুন"
                              >
                                প্রকাশ
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setEditingArticle(article);
                                setCurrentTab('edit-news');
                              }}
                              className="p-1 text-blue-600 hover:text-blue-700 rounded hover:bg-blue-50"
                              title="সম্পাদনা করুন"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteArticle(article.id, article.status === 'trash')}
                              className="p-1 text-red-600 hover:text-red-700 rounded hover:bg-red-50"
                              title={article.status === 'trash' ? 'স্থায়ীভাবে মুছুন' : 'ট্র্যাশে পাঠান'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ADD/EDIT NEWS FORM */}
          {(currentTab === 'add-news' || currentTab === 'edit-news') && editingArticle && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h2 className="text-xl font-bold font-serif-bn text-stone-900">
                  {currentTab === 'edit-news' ? 'সংবাদ সম্পাদনা করুন' : 'নতুন বাংলা সংবাদ প্রকাশ করুন'}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('news')}
                    className="px-3 py-1.5 border border-stone-300 text-stone-600 text-xs rounded hover:bg-stone-50 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => handleSaveArticle('draft')}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded cursor-pointer"
                  >
                    খসড়া সংরক্ষণ
                  </button>
                  <button
                    onClick={() => handleSaveArticle('published')}
                    className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded cursor-pointer shadow"
                  >
                    এখনই প্রকাশ করুন
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    সংবাদের শিরোনাম (Headline)*
                  </label>
                  <input
                    type="text"
                    value={editingArticle.title || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    placeholder="বাংলায় আকর্ষণীয় শিরোনাম লিখুন..."
                    className="w-full text-base sm:text-lg font-bold p-2.5 border border-stone-300 rounded focus:border-red-700 outline-none font-serif-bn"
                  />
                </div>

                {/* Category & Author Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">বিভাগ (Category)*</label>
                    <select
                      value={editingArticle.category || 'জাতীয়'}
                      onChange={(e) => {
                        const selectedCat = categories.find(c => c.name === e.target.value);
                        setEditingArticle({
                          ...editingArticle,
                          category: e.target.value,
                          categorySlug: selectedCat?.slug || 'national'
                        });
                      }}
                      className="w-full text-xs p-2 border border-stone-300 rounded bg-white outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">লেখক (Author)</label>
                    <input
                      type="text"
                      value={editingArticle.author || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                      placeholder="নিজস্ব প্রতিবেদক"
                      className="w-full text-xs p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">লেখকের পদবি (Author Role)</label>
                    <input
                      type="text"
                      value={editingArticle.authorRole || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, authorRole: e.target.value })}
                      placeholder="বিশেষ প্রতিনিধি"
                      className="w-full text-xs p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>
                </div>

                {/* Featured Image Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    প্রধান ছবি (Featured Image URL)*
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingArticle.featuredImage || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, featuredImage: e.target.value })}
                      placeholder="ছবির লিংক বা মিডিয়া লাইব্রেরি থেকে নির্বাচন করুন"
                      className="flex-1 text-xs p-2 border border-stone-300 rounded outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMediaSelector(true)}
                      className="px-3 py-1.5 bg-stone-800 text-white text-xs font-semibold rounded hover:bg-stone-700 cursor-pointer flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>মিডিয়া লাইব্রেরি</span>
                    </button>
                  </div>
                  {editingArticle.featuredImage && (
                    <div className="mt-2 w-32 aspect-16/10 rounded overflow-hidden border border-stone-300">
                      <img src={editingArticle.featuredImage} alt="প্রিভিউ" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Image Caption & Alt Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">ছবির ক্যাপশন (Caption)</label>
                    <input
                      type="text"
                      value={editingArticle.imageCaption || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, imageCaption: e.target.value })}
                      placeholder="ছবির সংক্ষিপ্ত বর্ণনা"
                      className="w-full text-xs p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">ছবি কৃতজ্ঞতা / সোর্স (Attribution)</label>
                    <input
                      type="text"
                      value={editingArticle.imageAttribution || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, imageAttribution: e.target.value })}
                      placeholder="যেমন: প্রভাতী ফটো ডেস্ক / রয়টার্স"
                      className="w-full text-xs p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>
                </div>

                {/* Short Summary */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    সংক্ষিপ্ত সারসংক্ষেপ (Lead Summary)*
                  </label>
                  <textarea
                    rows={2}
                    value={editingArticle.summary || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                    placeholder="সংবাদের মূল সারসংক্ষেপ এক বা দুই বাক্যে..."
                    className="w-full text-xs sm:text-sm p-2 border border-stone-300 rounded outline-none font-serif-bn"
                  />
                </div>

                {/* Full Article Content */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    পূর্ণাঙ্গ প্রতিবেদন (Full Article Body)*
                  </label>
                  <textarea
                    rows={8}
                    value={editingArticle.content || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                    placeholder="এখানে বিস্তারিত বাংলা সংবাদ লিখুন..."
                    className="w-full text-sm p-3 border border-stone-300 rounded focus:border-red-700 outline-none leading-relaxed font-bengali"
                  />
                </div>

                {/* Tags and Source */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      ট্যাগ (কমা দিয়ে আলাদা করুন)
                    </label>
                    <input
                      type="text"
                      value={editingArticle.tags?.join(', ') || ''}
                      onChange={(e) => setEditingArticle({
                        ...editingArticle,
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      })}
                      placeholder="জাতীয়, অর্থনীতি, ঢাকা"
                      className="w-full text-xs p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">তথ্যসূত্র (Source/Reference)</label>
                    <input
                      type="text"
                      value={editingArticle.source || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, source: e.target.value })}
                      placeholder="সংবাদ বিজ্ঞপ্তি / মন্ত্রণালয় ব্রিফিং"
                      className="w-full text-xs p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>
                </div>

                {/* Flags: Breaking, Featured, Top News */}
                <div className="flex flex-wrap items-center gap-6 p-3 bg-stone-50 border border-stone-200 rounded text-xs font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer text-red-700">
                    <input
                      type="checkbox"
                      checked={!!editingArticle.isBreaking}
                      onChange={(e) => setEditingArticle({ ...editingArticle, isBreaking: e.target.checked })}
                    />
                    <span>ব্রেকিং নিউজ হিসেবে চিহ্নিত করুন</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-amber-700">
                    <input
                      type="checkbox"
                      checked={!!editingArticle.isFeatured}
                      onChange={(e) => setEditingArticle({ ...editingArticle, isFeatured: e.target.checked })}
                    />
                    <span>হোমপেজ ফিচার্ড খবর</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-blue-700">
                    <input
                      type="checkbox"
                      checked={!!editingArticle.isTopNews}
                      onChange={(e) => setEditingArticle({ ...editingArticle, isTopNews: e.target.checked })}
                    />
                    <span>টপ স্টোরি হিসেবে প্রদর্শন</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORY MANAGEMENT */}
          {currentTab === 'categories' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h2 className="text-xl font-bold font-serif-bn text-stone-900">
                  ক্যাটাগরি ব্যবস্থাপনা (মৌলিক ২০+ বিভাগ)
                </h2>
                <button
                  onClick={() => setEditingCategory({ name: '', slug: '', order: categories.length + 1, showOnHome: true, color: '#b91c1c' })}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন ক্যাটাগরি</span>
                </button>
              </div>

              {/* Editing or Adding category drawer */}
              {editingCategory && (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold text-stone-800">
                    {editingCategory.id ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি যোগ করুন'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editingCategory.name || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      placeholder="বিভাগের নাম (যেমন: জলবায়ু)"
                      className="text-xs p-2 border border-stone-300 rounded outline-none"
                    />
                    <input
                      type="text"
                      value={editingCategory.slug || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                      placeholder="স্লাগ (যেমন: climate)"
                      className="text-xs p-2 border border-stone-300 rounded outline-none font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingCategory.color || '#b91c1c'}
                        onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                        className="w-8 h-8 rounded border p-0 cursor-pointer"
                      />
                      <label className="text-xs text-stone-600 flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={editingCategory.showOnHome ?? true}
                          onChange={(e) => setEditingCategory({ ...editingCategory, showOnHome: e.target.checked })}
                        />
                        হোমে দেখান
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveCategory}
                      className="px-3 py-1 bg-red-700 text-white text-xs rounded font-semibold cursor-pointer"
                    >
                      সংরক্ষণ
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="px-3 py-1 border text-stone-600 text-xs rounded cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              )}

              {/* Categories table */}
              <div className="border border-stone-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100 text-stone-600 border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">অর্ডার</th>
                      <th className="p-2.5">রং</th>
                      <th className="p-2.5">বিভাগের নাম</th>
                      <th className="p-2.5">স্লাগ</th>
                      <th className="p-2.5">সংবাদ সংখ্যা</th>
                      <th className="p-2.5 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {categories.map((cat, idx) => {
                      const count = articles.filter(a => a.category === cat.name || a.categorySlug === cat.slug).length;
                      return (
                        <tr key={cat.id} className="hover:bg-stone-50">
                          <td className="p-2.5 font-mono text-stone-400">{idx + 1}</td>
                          <td className="p-2.5">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: cat.color || '#b91c1c' }} />
                          </td>
                          <td className="p-2.5 font-bold text-stone-900">{cat.name}</td>
                          <td className="p-2.5 font-mono text-stone-500">{cat.slug}</td>
                          <td className="p-2.5 text-stone-600">{toBengaliNumber(count)} টি</td>
                          <td className="p-2.5 text-right space-x-1">
                            <button
                              onClick={() => setEditingCategory(cat)}
                              className="p-1 text-blue-600 hover:text-blue-700 rounded"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1 text-red-600 hover:text-red-700 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: MEDIA LIBRARY */}
          {currentTab === 'media' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h2 className="text-xl font-bold font-serif-bn text-stone-900">
                  মিডিয়া লাইব্রেরি ও কপিরাইট-মুক্ত চিত্র সংগ্রহ
                </h2>
              </div>

              {/* Add New Image Bar */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="ছবির নাম/ক্যাপশন"
                  value={mediaUploadName}
                  onChange={(e) => setMediaUploadName(e.target.value)}
                  className="text-xs p-2 border border-stone-300 rounded bg-white outline-none w-full sm:w-1/3"
                />
                <input
                  type="text"
                  placeholder="ছবির সরাসরি লিংক (Unsplash, Pexels, বা আপনার আপলোডকৃত ইউআরএল)"
                  value={mediaUploadUrl}
                  onChange={(e) => setMediaUploadUrl(e.target.value)}
                  className="text-xs p-2 border border-stone-300 rounded bg-white outline-none flex-1"
                />
                <button
                  onClick={handleAddMedia}
                  className="px-4 py-2 bg-red-700 text-white text-xs font-semibold rounded hover:bg-red-800 cursor-pointer shrink-0 flex items-center gap-1 justify-center"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>ছবি যোগ করুন</span>
                </button>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaList.map(item => (
                  <div key={item.id} className="border border-stone-200 rounded-lg overflow-hidden group bg-white shadow-xs">
                    <div className="aspect-16/10 bg-stone-100 relative">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-2 text-xs">
                      <p className="font-semibold text-stone-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 truncate">{item.attribution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ADS MANAGEMENT */}
          {currentTab === 'ads' && (
            <div className="space-y-5">
              <div className="border-b border-stone-200 pb-3">
                <h2 className="text-xl font-bold font-serif-bn text-stone-900">
                  বিজ্ঞাপন স্লট ব্যবস্থাপনা (Ad Placement Management)
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  পোর্টালের বিভিন্ন স্থানে বিজ্ঞাপন সক্রিয়/নিষ্ক্রিয় বা ব্যানার লিংক পরিবর্তন করুন।
                </p>
              </div>

              <div className="space-y-4">
                {ads.map(ad => (
                  <div key={ad.id} className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-stone-800">{ad.title}</h3>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ad.enabled}
                          onChange={(e) => {
                            const updated = { ...ad, enabled: e.target.checked };
                            handleUpdateAd(updated);
                          }}
                        />
                        <span className={ad.enabled ? 'text-emerald-700' : 'text-stone-400'}>
                          {ad.enabled ? 'বিজ্ঞাপন সক্রিয়' : 'বিজ্ঞাপন বন্ধ'}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-stone-600 mb-1">ব্যানার ইমেজ ইউআরএল (Image URL)</label>
                        <input
                          type="text"
                          value={ad.imageUrl || ''}
                          onChange={(e) => {
                            const updated = { ...ad, imageUrl: e.target.value };
                            setAds(ads.map(a => a.id === ad.id ? updated : a));
                          }}
                          className="w-full p-2 border border-stone-300 rounded bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-600 mb-1">টার্গেট লিঙ্ক (Target Click URL)</label>
                        <input
                          type="text"
                          value={ad.targetUrl || ''}
                          onChange={(e) => {
                            const updated = { ...ad, targetUrl: e.target.value };
                            setAds(ads.map(a => a.id === ad.id ? updated : a));
                          }}
                          className="w-full p-2 border border-stone-300 rounded bg-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpdateAd(ad)}
                      className="px-3 py-1 bg-stone-800 hover:bg-stone-900 text-white text-xs rounded font-semibold cursor-pointer"
                    >
                      স্লট তথ্য সংরক্ষণ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PORTAL SETTINGS */}
          {currentTab === 'settings' && settings && (
            <div className="space-y-5">
              <div className="border-b border-stone-200 pb-3">
                <h2 className="text-xl font-bold font-serif-bn text-stone-900">
                  ওয়েবসাইট ও এসইও কনফিগারেশন
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">পোর্টালের নাম</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">স্লোগান / ট্যাগলাইন</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">প্রধান সম্পাদক ও প্রকাশক</label>
                    <input
                      type="text"
                      value={settings.editorName}
                      onChange={(e) => setSettings({ ...settings, editorName: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">প্রকাশক প্রতিষ্ঠান</label>
                    <input
                      type="text"
                      value={settings.publisher}
                      onChange={(e) => setSettings({ ...settings, publisher: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">যোগাযোগের ইমেইল</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">যোগাযোগের ফোন নম্বর</label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">অফিস ঠিকানা</label>
                  <input
                    type="text"
                    value={settings.officeAddress}
                    onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded outline-none"
                  />
                </div>

                {/* SEO Settings */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-3">
                  <h3 className="font-bold text-stone-900">গুগল এসইও ও সার্চ মেটা (SEO)</h3>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">ডিফল্ট এসইও টাইটেল</label>
                    <input
                      type="text"
                      value={settings.seoMetaTitle}
                      onChange={(e) => setSettings({ ...settings, seoMetaTitle: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">মেটা ডেসক্রিপশন</label>
                    <textarea
                      rows={2}
                      value={settings.seoMetaDescription}
                      onChange={(e) => setSettings({ ...settings, seoMetaDescription: e.target.value })}
                      className="w-full p-2 border border-stone-300 rounded bg-white outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      await api.updateSettings(settings);
                      setSuccessMessage('পোর্টাল সেটিংস সফলভাবে আপডেট হয়েছে');
                    } catch (err: any) {
                      setErrorMessage('আপডেট ব্যর্থ: ' + err.message);
                    }
                  }}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded cursor-pointer"
                >
                  সেটিংস সংরক্ষণ করুন
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm border border-stone-200 shadow-xl">
            <h3 className="text-base font-bold font-serif-bn mb-3">প্রশাসক পাসওয়ার্ড পরিবর্তন</h3>
            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 mb-1">বর্তমান পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full p-2 border border-stone-300 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-700 mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full p-2 border border-stone-300 rounded outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3 py-1.5 border rounded text-stone-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-700 text-white rounded font-semibold"
                >
                  পরিবর্তন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Selector Modal */}
      {showMediaSelector && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-2xl border border-stone-200 shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm font-serif-bn">মিডিয়া লাইব্রেরি থেকে ছবি নির্বাচন করুন</h3>
              <button onClick={() => setShowMediaSelector(false)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 p-1">
              {mediaList.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (editingArticle) {
                      setEditingArticle({ ...editingArticle, featuredImage: item.url, imageCaption: item.caption, imageAttribution: item.attribution });
                    }
                    setShowMediaSelector(false);
                  }}
                  className="border border-stone-200 rounded overflow-hidden cursor-pointer hover:border-red-700 group"
                >
                  <img src={item.url} alt={item.name} className="w-full aspect-16/10 object-cover" />
                  <p className="text-[10px] p-1 truncate text-stone-600">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

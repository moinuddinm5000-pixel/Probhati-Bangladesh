import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { LeadStories } from './components/LeadStories';
import { CategoryBlock } from './components/CategoryBlock';
import { MultimediaSection } from './components/MultimediaSection';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ArticleDetail } from './components/ArticleDetail';
import { SearchModal } from './components/SearchModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { AdBanner } from './components/AdBanner';
import {
  NewsArticle,
  Category,
  SiteSettings,
  AdPlacement,
  MediaItem
} from './types/news';
import { api, authStorage } from './api/client';
import {
  INITIAL_CATEGORIES,
  INITIAL_ARTICLES,
  INITIAL_SETTINGS,
  INITIAL_ADS
} from './data/initialData';

export default function App() {
  // Navigation & view states
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'category' | 'admin-login' | 'admin-dashboard'>('home');
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // App data state
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [articles, setArticles] = useState<NewsArticle[]>(INITIAL_ARTICLES);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [ads, setAds] = useState<AdPlacement[]>(INITIAL_ADS);

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminConfigStatus, setAdminConfigStatus] = useState<{ isConfigured: boolean; defaultUsername: string }>({
    isConfigured: false,
    defaultUsername: 'Moinuddin'
  });

  // Load applet data
  useEffect(() => {
    async function initData() {
      try {
        const [cData, aData, sData, adsData, authStatus, verifyRes] = await Promise.all([
          api.getCategories().catch(() => INITIAL_CATEGORIES),
          api.getArticles({ status: 'all' }).catch(() => ({ articles: INITIAL_ARTICLES, total: INITIAL_ARTICLES.length })),
          api.getSettings().catch(() => INITIAL_SETTINGS),
          api.getAds().catch(() => INITIAL_ADS),
          api.getAuthStatus().catch(() => ({ isConfigured: false, defaultUsername: 'Moinuddin' })),
          api.verifyAuth().catch(() => ({ authenticated: false }))
        ]);

        if (cData && cData.length > 0) setCategories(cData);
        if (aData?.articles && aData.articles.length > 0) setArticles(aData.articles);
        if (sData) setSettings(sData);
        if (adsData && adsData.length > 0) setAds(adsData);
        if (authStatus) setAdminConfigStatus(authStatus);
        if (verifyRes?.authenticated) setIsAdminAuthenticated(true);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }

    initData();
  }, []);

  // Filtered published articles
  const publishedArticles = articles.filter(a => a.status === 'published');
  const breakingNews = publishedArticles.filter(a => a.isBreaking);
  const topNews = publishedArticles.filter(a => a.isTopNews);
  const featuredNews = publishedArticles.filter(a => a.isFeatured);

  // Lead story calculation
  const leadStory = topNews[0] || featuredNews[0] || publishedArticles[0];
  const secondaryLeadStories = publishedArticles.filter(a => a.id !== leadStory?.id).slice(0, 4);

  // Popular and Latest arrays
  const latestArticles = [...publishedArticles].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
  const popularArticles = [...publishedArticles].sort(
    (a, b) => (b.views || 0) - (a.views || 0)
  );

  // Ads mapped by slot ID
  const headerAd = ads.find(a => a.id === 'header');
  const homeMiddleAd = ads.find(a => a.id === 'home_middle');
  const sidebarAd = ads.find(a => a.id === 'sidebar');
  const articleTopAd = ads.find(a => a.id === 'article_top');
  const articleBottomAd = ads.find(a => a.id === 'article_bottom');
  const footerAd = ads.find(a => a.id === 'footer');

  // Video & photo articles
  const videoArticles = publishedArticles.filter(a => a.categorySlug === 'video' || a.category === 'ভিডিও');
  const photoArticles = publishedArticles.filter(a => a.categorySlug === 'photo-gallery' || a.category === 'ফটো গ্যালারি');

  // Navigation handlers
  const handleSelectArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setCurrentView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // increment view count
    api.getArticle(article.id, true).catch(() => {});
  };

  const handleSelectCategory = (categorySlug: string) => {
    setCurrentCategory(categorySlug);
    if (categorySlug === 'all') {
      setCurrentView('home');
    } else {
      setCurrentView('category');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('admin-login');
    }
  };

  const handleAdminLoginSuccess = (token: string, username: string) => {
    setIsAdminAuthenticated(true);
    setCurrentView('admin-dashboard');
    // Refresh auth status
    api.getAuthStatus().then(setAdminConfigStatus).catch(() => {});
  };

  const handleAdminLogout = async () => {
    await api.logoutAdmin().catch(() => {});
    authStorage.clearToken();
    setIsAdminAuthenticated(false);
    setCurrentView('home');
  };

  // If in Admin Dashboard view
  if (currentView === 'admin-dashboard' && isAdminAuthenticated) {
    return (
      <AdminDashboard
        onLogout={handleAdminLogout}
        onViewSite={() => setCurrentView('home')}
      />
    );
  }

  // If in Admin Login view
  if (currentView === 'admin-login') {
    return (
      <AdminLogin
        isConfigured={adminConfigStatus.isConfigured}
        defaultUsername={adminConfigStatus.defaultUsername}
        onSuccess={handleAdminLoginSuccess}
        onCancel={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-bengali text-stone-900 selection:bg-red-700 selection:text-white">
      {/* 1. Portal Header */}
      <Header
        categories={categories}
        currentCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        settings={settings}
        headerAd={headerAd}
      />

      {/* 2. Breaking News Marquee/Ticker */}
      {settings.breakingNewsEnabled && breakingNews.length > 0 && (
        <BreakingNewsTicker
          breakingArticles={breakingNews}
          onSelectArticle={handleSelectArticle}
        />
      )}

      {/* 3. Main Views (Home / Category / Article) */}
      <main className="flex-1">
        {/* VIEW A: ARTICLE DETAIL */}
        {currentView === 'article' && selectedArticle ? (
          <ArticleDetail
            article={selectedArticle}
            relatedArticles={publishedArticles.filter(
              a => a.categorySlug === selectedArticle.categorySlug && a.id !== selectedArticle.id
            )}
            latestArticles={latestArticles.filter(a => a.id !== selectedArticle.id)}
            popularArticles={popularArticles}
            topAd={articleTopAd}
            bottomAd={articleBottomAd}
            onBack={() => setCurrentView('home')}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={handleSelectCategory}
          />
        ) : currentView === 'category' ? (
          /* VIEW B: CATEGORY PAGE */
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="border-b-2 border-red-700 pb-3 mb-6 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold font-serif-bn text-stone-900">
                {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
              </h2>
              <span className="text-xs text-stone-500">
                মোট {publishedArticles.filter(a => a.categorySlug === currentCategory).length} টি সংবাদ
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                {publishedArticles
                  .filter(a => a.categorySlug === currentCategory)
                  .map(article => (
                    <article
                      key={article.id}
                      onClick={() => handleSelectArticle(article)}
                      className="cursor-pointer group pb-6 border-b border-stone-200 flex flex-col sm:flex-row gap-4"
                    >
                      <div className="w-full sm:w-56 aspect-16/10 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-red-700 transition-colors font-serif-bn leading-snug mb-2">
                          {article.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed mb-3">
                          {article.summary}
                        </p>
                        <div className="text-xs text-stone-400">
                          {article.author} · {new Date(article.publishDate).toLocaleDateString('bn-BD')}
                        </div>
                      </div>
                    </article>
                  ))}

                {publishedArticles.filter(a => a.categorySlug === currentCategory).length === 0 && (
                  <div className="p-12 text-center text-stone-400 bg-white rounded border border-stone-200">
                    এই বিভাগে বর্তমানে কোনো সংবাদ নেই।
                  </div>
                )}
              </div>

              <div className="lg:col-span-4">
                <Sidebar
                  latestArticles={latestArticles}
                  popularArticles={popularArticles}
                  sidebarAd={sidebarAd}
                  onSelectArticle={handleSelectArticle}
                  onSelectCategory={handleSelectCategory}
                />
              </div>
            </div>
          </div>
        ) : (
          /* VIEW C: HOMEPAGE */
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Top Stories Layout */}
            <LeadStories
              leadStory={leadStory}
              secondaryStories={secondaryLeadStories}
              latestNewsList={latestArticles}
              onSelectArticle={handleSelectArticle}
              onSelectCategory={handleSelectCategory}
            />

            {/* Homepage Mid Banner Ad */}
            {homeMiddleAd && homeMiddleAd.enabled && <AdBanner placement={homeMiddleAd} />}

            {/* Categorized News Blocks with Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
              {/* Category Columns (Cols 1-8) */}
              <div className="lg:col-span-8 space-y-6">
                {categories
                  .filter(cat => cat.showOnHome && cat.slug !== 'latest' && cat.slug !== 'video' && cat.slug !== 'photo-gallery')
                  .map(cat => {
                    const catArticles = publishedArticles.filter(
                      a => a.categorySlug === cat.slug || a.category === cat.name
                    );
                    if (catArticles.length === 0) return null;

                    return (
                      <CategoryBlock
                        key={cat.id}
                        category={cat}
                        articles={catArticles}
                        onSelectArticle={handleSelectArticle}
                        onSelectCategory={handleSelectCategory}
                      />
                    );
                  })}
              </div>

              {/* Sidebar (Cols 9-12) */}
              <div className="lg:col-span-4">
                <Sidebar
                  latestArticles={latestArticles}
                  popularArticles={popularArticles}
                  sidebarAd={sidebarAd}
                  onSelectArticle={handleSelectArticle}
                  onSelectCategory={handleSelectCategory}
                />
              </div>
            </div>

            {/* Multimedia (Video & Photo Gallery) Section */}
            {(videoArticles.length > 0 || photoArticles.length > 0) && (
              <MultimediaSection
                videoArticles={videoArticles}
                photoArticles={photoArticles}
                onSelectArticle={handleSelectArticle}
                onSelectCategory={handleSelectCategory}
              />
            )}
          </div>
        )}
      </main>

      {/* 4. Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        categories={categories}
        onSelectArticle={handleSelectArticle}
        allArticles={articles}
      />

      {/* 5. Portal Footer */}
      <Footer
        categories={categories}
        settings={settings}
        footerAd={footerAd}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={handleOpenAdmin}
      />
    </div>
  );
}

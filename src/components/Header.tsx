import React, { useState } from 'react';
import {
  Search,
  Menu,
  X,
  Lock,
  ChevronDown,
  Facebook,
  Twitter,
  Youtube,
  Share2,
  Calendar,
  MapPin,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { Category, SiteSettings, AdPlacement } from '../types/news';
import { getTodaysBanglaHeader } from '../utils/bengali';

interface HeaderProps {
  categories: Category[];
  currentCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  settings: SiteSettings;
  headerAd?: AdPlacement;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  currentCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenAdmin,
  settings,
  headerAd
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  // Divide categories into main navigation (first 10) and more dropdown (the rest)
  const visibleCategories = categories.slice(0, 11);
  const overflowCategories = categories.slice(11);

  return (
    <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      {/* 1. Top Utility Ribbon */}
      <div className="bg-stone-100 border-b border-stone-200 text-stone-600 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <Calendar className="w-3.5 h-3.5 text-red-700" />
              {getTodaysBanglaHeader()}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-stone-500">
              <MapPin className="w-3 h-3 text-stone-400" />
              ঢাকা ৩১° সে. (মেঘলা)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 text-stone-600 hover:text-red-700 transition-colors cursor-pointer"
              title="খবর খুঁজুন"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">অনুসন্ধান</span>
            </button>

            <span className="text-stone-300">|</span>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-stone-600 hover:text-red-700 transition-colors font-medium cursor-pointer"
              title="প্রশাসক প্যানেল"
            >
              <Lock className="w-3 h-3 text-red-700" />
              <span>প্রশাসক</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-stone-400 pl-2">
              <a
                href={settings.socialLinks.facebook || '#'}
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings.socialLinks.twitter || '#'}
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-500 transition-colors"
                title="X (Twitter)"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings.socialLinks.youtube || '#'}
                target="_blank"
                rel="noreferrer"
                className="hover:text-red-600 transition-colors"
                title="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Newspaper Masthead & Optional Header Ad */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Zone */}
        <div
          onClick={() => onSelectCategory('all')}
          className="flex flex-col items-center md:items-start cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-700 inline-block group-hover:scale-110 transition-transform"></span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-stone-900 font-serif-bn">
              {settings.siteName || 'প্রভাতী বাংলাদেশ'}
            </h1>
          </div>
          <p className="text-xs md:text-sm text-stone-500 tracking-wide mt-1 font-medium">
            {settings.tagline || 'সত্য ও নিরপেক্ষতার অঙ্গীকারে প্রতিদিন'}
          </p>
        </div>

        {/* Header Advertisement */}
        {headerAd && headerAd.enabled ? (
          <div className="w-full md:w-auto flex justify-center">
            <a
              href={headerAd.targetUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded border border-stone-200 max-h-[90px] max-w-[728px] relative group"
            >
              <img
                src={headerAd.imageUrl}
                alt={headerAd.altText || 'বিজ্ঞাপন'}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-[90px]"
              />
              <span className="absolute bottom-1 right-1 bg-stone-900/70 text-stone-300 text-[9px] px-1 py-0.5 rounded">
                বিজ্ঞাপন
              </span>
            </a>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-4 text-xs text-stone-500 border-l border-stone-200 pl-4 py-1">
            <div>
              <p className="font-semibold text-stone-800">সর্বশেষ সংস্করণ</p>
              <p>অনলাইন ২৪/৭ আপডেট</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Category Navigation Bar */}
      <nav className="bg-red-800 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden py-2.5 flex items-center gap-2 text-sm font-semibold focus:outline-none"
            aria-label="মেনু খুলুন"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>সকল বিভাগ</span>
          </button>

          {/* Desktop Categories */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors rounded ${
                currentCategory === 'all'
                  ? 'bg-red-950 text-white shadow-xs'
                  : 'text-stone-100 hover:bg-red-700/80 hover:text-white'
              }`}
            >
              প্রচ্ছদ
            </button>

            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded ${
                  currentCategory === cat.slug
                    ? 'bg-red-950 text-white shadow-xs'
                    : 'text-stone-100 hover:bg-red-700/80 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* Overflow "আরও" Dropdown */}
            {overflowCategories.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className="px-2.5 py-2 text-sm font-medium text-stone-100 hover:bg-red-700/80 rounded flex items-center gap-1 whitespace-nowrap"
                >
                  <span>আরও</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {moreDropdownOpen && (
                  <div
                    onMouseLeave={() => setMoreDropdownOpen(false)}
                    className="absolute right-0 top-full mt-1 w-52 bg-white text-stone-900 rounded-md shadow-xl border border-stone-200 py-2 z-50 grid grid-cols-2 gap-1 p-2"
                  >
                    {overflowCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.slug);
                          setMoreDropdownOpen(false);
                        }}
                        className={`text-left px-2 py-1.5 text-xs rounded transition-colors ${
                          currentCategory === cat.slug
                            ? 'bg-red-100 text-red-800 font-bold'
                            : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick search affordance right */}
          <div className="flex items-center gap-2 py-1">
            <button
              onClick={onOpenSearch}
              className="p-2 text-white/90 hover:text-white hover:bg-red-700 rounded transition-colors"
              title="খবর অনুসন্ধান"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-stone-900 text-stone-100 border-t border-red-900 p-4 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 text-sm rounded ${
                  currentCategory === 'all'
                    ? 'bg-red-700 text-white font-bold'
                    : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                }`}
              >
                প্রচ্ছদ
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left py-2 px-3 text-sm rounded ${
                    currentCategory === cat.slug
                      ? 'bg-red-700 text-white font-bold'
                      : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-stone-300 hover:text-white"
              >
                <Lock className="w-3.5 h-3.5 text-red-500" />
                <span>প্রশাসক লগইন</span>
              </button>
              <span>{getTodaysBanglaHeader()}</span>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

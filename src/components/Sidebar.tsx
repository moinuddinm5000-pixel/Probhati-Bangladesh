import React, { useState } from 'react';
import { Clock, Eye, TrendingUp } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { AdPlacement } from '../types/news';
import { formatRelativeBengaliTime, toBengaliNumber } from '../utils/bengali';
import { AdBanner } from './AdBanner';

interface SidebarProps {
  latestArticles: NewsArticle[];
  popularArticles: NewsArticle[];
  sidebarAd?: AdPlacement;
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  latestArticles,
  popularArticles,
  sidebarAd,
  onSelectArticle,
  onSelectCategory
}) => {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');

  const displayedArticles = activeTab === 'latest' ? latestArticles.slice(0, 6) : popularArticles.slice(0, 6);

  return (
    <aside className="w-full space-y-6">
      {/* 1. Tabs: সর্বশেষ / সর্বাধিক পঠিত */}
      <div className="bg-white rounded border border-stone-200 shadow-xs overflow-hidden">
        {/* Tab Buttons */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => setActiveTab('latest')}
            className={`py-2.5 text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'latest'
                ? 'bg-white text-red-700 border-t-2 border-red-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>সর্বশেষ সংবাদ</span>
          </button>

          <button
            onClick={() => setActiveTab('popular')}
            className={`py-2.5 text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'popular'
                ? 'bg-white text-red-700 border-t-2 border-red-700 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>সর্বাধিক পঠিত</span>
          </button>
        </div>

        {/* List of articles */}
        <div className="divide-y divide-stone-100 p-2">
          {displayedArticles.map((article, index) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="py-2.5 px-2 hover:bg-stone-50 rounded transition-colors cursor-pointer flex items-start gap-3 group"
            >
              {/* Numeric indicator */}
              <span className="text-xl font-bold font-serif-bn text-stone-300 group-hover:text-red-600 w-5 shrink-0 text-center">
                {toBengaliNumber(index + 1)}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[11px] text-red-700 font-medium mb-0.5">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory(article.categorySlug);
                    }}
                    className="hover:underline"
                  >
                    {article.category}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-stone-400 font-normal">
                    {formatRelativeBengaliTime(article.publishDate)}
                  </span>
                </div>

                <h4 className="text-xs md:text-sm font-medium text-stone-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h4>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 2. Sidebar Advertisement */}
      {sidebarAd && sidebarAd.enabled && (
        <AdBanner placement={sidebarAd} slotClass="bg-white p-2 rounded border border-stone-200 shadow-xs" />
      )}

      {/* 3. Prayer & Namaj Times Quick Widget (Bangladesh localized) */}
      <div className="bg-stone-50 p-4 rounded border border-stone-200 text-stone-800">
        <h3 className="font-bold text-sm text-stone-900 mb-2 border-b border-stone-200 pb-1.5 flex items-center justify-between">
          <span>নামাজের সময়সূচি (ঢাকা ও পার্শ্ববর্তী)</span>
          <span className="text-xs text-stone-500 font-normal">আজ</span>
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between bg-white p-2 rounded border border-stone-100">
            <span className="text-stone-600">ফজর:</span>
            <span className="font-semibold text-stone-900">৪:৩৬ ভোর</span>
          </div>
          <div className="flex justify-between bg-white p-2 rounded border border-stone-100">
            <span className="text-stone-600">যোহর:</span>
            <span className="font-semibold text-stone-900">১১:৫২ দুপুর</span>
          </div>
          <div className="flex justify-between bg-white p-2 rounded border border-stone-100">
            <span className="text-stone-600">আসর:</span>
            <span className="font-semibold text-stone-900">৪:১২ বিকাল</span>
          </div>
          <div className="flex justify-between bg-white p-2 rounded border border-stone-100">
            <span className="text-stone-600">মাগরিব:</span>
            <span className="font-semibold text-stone-900">৫:৪৭ সন্ধ্যা</span>
          </div>
        </div>
      </div>

      {/* 4. Opinion / Editorial highlight */}
      <div className="bg-white rounded border border-stone-200 p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
          <h3 className="font-bold text-sm text-red-800 font-serif-bn">সম্পাদকীয় ও মতামত</h3>
          <button
            onClick={() => onSelectCategory('opinion')}
            className="text-xs text-stone-500 hover:text-red-700 hover:underline"
          >
            সব দেখুন
          </button>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed italic">
          "স্বাধীন ও দায়িত্বশীল সাংবাদিকতাই একটি মুক্ত গণতান্ত্রিক সমাজের অন্যতম প্রধান ভিত্তি।"
        </p>
        <p className="text-right text-[11px] font-semibold text-stone-800 mt-2">
          — প্রভাতী বাংলাদেশ মতামত ডেস্ক
        </p>
      </div>
    </aside>
  );
};

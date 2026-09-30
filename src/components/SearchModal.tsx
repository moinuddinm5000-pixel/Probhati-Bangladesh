import React, { useState } from 'react';
import { Search as SearchIcon, X, Calendar, Filter, Clock, Eye } from 'lucide-react';
import { NewsArticle, Category } from '../types/news';
import { formatBengaliDate, toBengaliNumber } from '../utils/bengali';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSelectArticle: (article: NewsArticle) => void;
  allArticles: NewsArticle[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSelectArticle,
  allArticles
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  if (!isOpen) return null;

  // Filter articles
  const filtered = allArticles.filter((article) => {
    // Only published
    if (article.status !== 'published') return false;

    if (selectedCategory !== 'all' && article.categorySlug !== selectedCategory) {
      return false;
    }

    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase();
    const titleMatch = article.title.toLowerCase().includes(q);
    const summaryMatch = article.summary.toLowerCase().includes(q);
    const authorMatch = article.author.toLowerCase().includes(q);
    const tagMatch = article.tags?.some((t) => t.toLowerCase().includes(q));

    return titleMatch || summaryMatch || authorMatch || tagMatch;
  });

  // Sort
  if (sortBy === 'popular') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-start justify-center pt-10 sm:pt-16 px-4">
      <div className="bg-white rounded-lg shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Search header input */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-red-700 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="খবরের শিরোনাম, বিষয়বস্তু বা লেখকের নাম দিয়ে খুঁজুন..."
            autoFocus
            className="w-full text-base sm:text-lg outline-none text-stone-900 placeholder:text-stone-400 font-bengali"
          />
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-semibold text-stone-700">বিভাগ:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-stone-300 rounded px-2 py-1 text-stone-800 text-xs outline-none focus:border-red-700"
            >
              <option value="all">সব বিভাগ</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">সাজান:</span>
            <button
              onClick={() => setSortBy('latest')}
              className={`px-2 py-1 rounded transition-colors ${
                sortBy === 'latest' ? 'bg-red-700 text-white font-bold' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              সর্বশেষ
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-2 py-1 rounded transition-colors ${
                sortBy === 'popular' ? 'bg-red-700 text-white font-bold' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              সর্বাধিক পঠিত
            </button>
          </div>
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 divide-y divide-stone-100">
          <div className="text-xs text-stone-500 pb-3 font-medium">
            মোট ফলাফল: <strong className="text-stone-800">{toBengaliNumber(filtered.length)}</strong> টি সংবাদ
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <p className="text-sm">কোনো খবর পাওয়া যায়নি। অন্য শব্দ দিয়ে অনুসন্ধান করুন।</p>
            </div>
          ) : (
            filtered.map((item) => (
              <article
                key={item.id}
                onClick={() => {
                  onSelectArticle(item);
                  onClose();
                }}
                className="py-3 sm:py-4 flex gap-4 cursor-pointer hover:bg-stone-50/80 -mx-2 px-2 rounded transition-colors group"
              >
                <div className="w-20 sm:w-28 aspect-16/10 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-red-700 font-semibold mb-1">
                    <span>{item.category}</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-stone-400 font-normal">{formatBengaliDate(item.publishDate)}</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                    {item.summary}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

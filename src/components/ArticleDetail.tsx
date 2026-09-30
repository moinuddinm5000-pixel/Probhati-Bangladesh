import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Info
} from 'lucide-react';
import { NewsArticle, AdPlacement } from '../types/news';
import { formatBengaliDate, toBengaliNumber, calculateReadingTime } from '../utils/bengali';
import { AdBanner } from './AdBanner';

interface ArticleDetailProps {
  article: NewsArticle;
  relatedArticles: NewsArticle[];
  latestArticles: NewsArticle[];
  popularArticles: NewsArticle[];
  topAd?: AdPlacement;
  bottomAd?: AdPlacement;
  onBack: () => void;
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  relatedArticles,
  latestArticles,
  popularArticles,
  topAd,
  bottomAd,
  onBack,
  onSelectArticle,
  onSelectCategory
}) => {
  const [copied, setCopied] = useState(false);

  const articleUrl = typeof window !== 'undefined' ? window.location.href : `https://probhati-bangladesh.com/news/${article.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank', 'width=600,height=400');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`, '_blank', 'width=600,height=400');
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + articleUrl)}`, '_blank');
  };

  // Structured Data injection for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': article.title,
    'description': article.summary,
    'image': [article.featuredImage],
    'datePublished': article.publishDate,
    'dateModified': article.updatedAt || article.publishDate,
    'author': [{
      '@type': 'Person',
      'name': article.author
    }],
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'প্রভাতী বাংলাদেশ',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://probhati-bangladesh.com/logo.png'
      }
    }
  };

  return (
    <article className="max-w-7xl mx-auto px-4 py-6">
      {/* Dynamic JSON-LD structured schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center justify-between text-xs text-stone-500 mb-6 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-red-700 hover:text-red-800 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>প্রচ্ছদ</span>
          </button>
          <span>/</span>
          <button
            onClick={() => onSelectCategory(article.categorySlug)}
            className="hover:text-red-700 cursor-pointer font-medium"
          >
            {article.category}
          </button>
          {article.subcategory && (
            <>
              <span>/</span>
              <span>{article.subcategory}</span>
            </>
          )}
        </div>

        <div className="text-stone-400 text-xs hidden sm:flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{calculateReadingTime(article.content || article.summary)}</span>
        </div>
      </nav>

      {/* Optional Top Ad */}
      {topAd && topAd.enabled && <AdBanner placement={topAd} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column (Cols 1-8) */}
        <div className="lg:col-span-8">
          {/* Category Tag */}
          <div className="inline-block bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded mb-3">
            {article.category}
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight font-serif-bn mb-4">
            {article.title}
          </h1>

          {/* Author and Date Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 border-y border-stone-200 py-3 mb-6 bg-stone-50/60 px-3 rounded">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-sm">{article.author}</span>
              <span className="text-stone-300">|</span>
              <span className="text-stone-500">{article.authorRole || 'বিশেষ প্রতিনিধি'}</span>
            </div>

            <div className="flex items-center gap-4 text-stone-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {formatBengaliDate(article.publishDate)}
              </span>

              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                <span>{toBengaliNumber(article.views)} বার পঠিত</span>
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <figure className="mb-6">
            <div className="relative aspect-16/9 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
              <img
                src={article.featuredImage}
                alt={article.imageAlt || article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {(article.imageCaption || article.imageAttribution) && (
              <figcaption className="text-xs text-stone-500 mt-2 px-1 flex flex-col sm:flex-row justify-between gap-1 italic">
                <span>{article.imageCaption}</span>
                {article.imageAttribution && (
                  <span className="text-stone-400 not-italic font-sans text-[11px]">
                    ছবি সৌজন্যে: {article.imageAttribution}
                  </span>
                )}
              </figcaption>
            )}
          </figure>

          {/* Lead Summary */}
          {article.summary && (
            <p className="text-lg md:text-xl font-semibold text-stone-800 leading-relaxed font-serif-bn mb-6 border-l-4 border-red-700 pl-4 py-1 bg-stone-50 rounded-r">
              {article.summary}
            </p>
          )}

          {/* Social Share Bar Top */}
          <div className="flex items-center justify-between border-y border-stone-200 py-2.5 my-6 text-xs text-stone-600">
            <span className="font-bold text-stone-700 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-red-700" />
              <span>শেয়ার করুন:</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={shareFacebook}
                className="p-2 rounded bg-blue-600 text-white hover:opacity-90 transition-opacity cursor-pointer"
                title="ফেসবুকে শেয়ার করুন"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={shareTwitter}
                className="p-2 rounded bg-black text-white hover:opacity-90 transition-opacity cursor-pointer"
                title="X-এ শেয়ার করুন"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={shareWhatsApp}
                className="p-2 rounded bg-emerald-600 text-white hover:opacity-90 transition-opacity cursor-pointer"
                title="হোয়াটসঅ্যাপে শেয়ার করুন"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 p-2 rounded bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors cursor-pointer"
                title="লিংক কপি করুন"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="text-[11px] font-medium hidden sm:inline">
                  {copied ? 'কপি হয়েছে' : 'কপি লিঙ্ক'}
                </span>
              </button>
            </div>
          </div>

          {/* Article Body Content */}
          <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed text-base md:text-lg space-y-4 mb-8 font-bengali">
            {article.content ? (
              article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-justify leading-loose">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-stone-600">{article.summary}</p>
            )}
          </div>

          {/* Additional Article Images if any */}
          {article.additionalImages && article.additionalImages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
              {article.additionalImages.map((img, idx) => (
                <div key={idx} className="rounded border border-stone-200 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.alt || article.title}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-16/10 object-cover"
                  />
                  {img.caption && (
                    <p className="text-xs text-stone-500 p-2 italic bg-stone-50">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Source/Reference badge if present */}
          {article.source && (
            <div className="my-4 p-3 bg-stone-100 rounded border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-400 shrink-0" />
              <span>
                <strong>সূত্র / তথ্যসূত্র:</strong> {article.source}
              </span>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-stone-200 mb-8">
              <span className="text-xs font-bold text-stone-600">সম্পর্কিত বিষয়:</span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs px-2.5 py-1 rounded transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Article Ad */}
          {bottomAd && bottomAd.enabled && <AdBanner placement={bottomAd} />}

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <section className="mt-10 pt-6 border-t-2 border-red-700">
              <h3 className="text-xl font-bold font-serif-bn text-stone-900 mb-4">
                সম্পর্কিত আরও সংবাদ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectArticle(rel)}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div className="aspect-16/10 rounded overflow-hidden bg-stone-100 border border-stone-200 mb-2">
                      <img
                        src={rel.featuredImage}
                        alt={rel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column (Cols 9-12) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Latest from this category */}
          <div className="bg-white rounded border border-stone-200 p-4 shadow-xs">
            <h3 className="font-bold text-base text-red-800 border-b border-stone-200 pb-2 mb-3 font-serif-bn">
              এই বিভাগের অন্যান্য খবর
            </h3>
            <div className="space-y-3">
              {latestArticles.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectArticle(item)}
                  className="cursor-pointer group flex items-start gap-3 pb-2.5 border-b border-stone-100 last:border-b-0"
                >
                  <div className="w-16 aspect-16/10 rounded overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-stone-800 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {formatBengaliDate(item.publishDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most popular */}
          <div className="bg-stone-50 rounded border border-stone-200 p-4 shadow-xs">
            <h3 className="font-bold text-base text-stone-900 border-b border-stone-200 pb-2 mb-3 font-serif-bn">
              সর্বাধিক পঠিত খবর
            </h3>
            <div className="space-y-3">
              {popularArticles.slice(0, 5).map((pop, idx) => (
                <div
                  key={pop.id}
                  onClick={() => onSelectArticle(pop)}
                  className="cursor-pointer group flex items-start gap-3 pb-2 border-b border-stone-200/60 last:border-b-0"
                >
                  <span className="text-lg font-bold font-serif-bn text-stone-300 group-hover:text-red-700 w-4 text-center">
                    {toBengaliNumber(idx + 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-stone-800 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                      {pop.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
};

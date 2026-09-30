import React from 'react';
import { Clock, Eye, Newspaper, ArrowUpRight } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { formatRelativeBengaliTime, toBengaliNumber } from '../utils/bengali';

interface LeadStoriesProps {
  leadStory?: NewsArticle;
  secondaryStories: NewsArticle[];
  latestNewsList: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const LeadStories: React.FC<LeadStoriesProps> = ({
  leadStory,
  secondaryStories,
  latestNewsList,
  onSelectArticle,
  onSelectCategory
}) => {
  if (!leadStory && secondaryStories.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      {/* 3-Tier Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tier 1: Dominant Lead Story (Cols 1-7 on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-200 pb-6 lg:pb-0 lg:pr-6">
          {leadStory && (
            <article
              onClick={() => onSelectArticle(leadStory)}
              className="cursor-pointer group flex flex-col h-full"
            >
              {/* Featured Image with Fallback */}
              <div className="relative aspect-16/9 w-full overflow-hidden rounded-md bg-stone-100 mb-3 border border-stone-200/80">
                <img
                  src={leadStory.featuredImage}
                  alt={leadStory.imageAlt || leadStory.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                />
                {leadStory.isSample && (
                  <span className="absolute top-2 right-2 bg-stone-900/80 text-stone-200 text-[10px] font-sans px-2 py-0.5 rounded">
                    নমুনা প্রতিবেদন
                  </span>
                )}
              </div>

              {/* Unboxed Category Kicker */}
              <div className="flex items-center gap-2 text-xs text-red-700 font-bold mb-1">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCategory(leadStory.categorySlug);
                  }}
                  className="hover:underline uppercase tracking-wide cursor-pointer"
                >
                  {leadStory.category}
                </span>
                <span className="text-stone-300" aria-hidden="true">·</span>
                <span className="text-stone-500 font-normal">
                  {formatRelativeBengaliTime(leadStory.publishDate)}
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-stone-900 group-hover:text-red-700 transition-colors leading-tight font-serif-bn mb-3">
                {leadStory.title}
              </h2>

              {/* Summary */}
              <p className="text-stone-600 text-sm md:text-base leading-relaxed line-clamp-3 mb-4">
                {leadStory.summary}
              </p>

              {/* Quiet Metadata Footer */}
              <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700">{leadStory.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{leadStory.authorRole || 'প্রতিবেদক'}</span>
                </div>

                <div className="flex items-center gap-1 text-stone-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{toBengaliNumber(leadStory.views)}</span>
                </div>
              </div>
            </article>
          )}
        </div>

        {/* Tier 2: Secondary Top Features (Cols 8-12 on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            {secondaryStories.slice(0, 3).map((article, index) => (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className={`cursor-pointer group pb-4 ${
                  index !== secondaryStories.length - 1 ? 'border-b border-stone-200' : ''
                }`}
              >
                <div className="flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="w-28 sm:w-36 aspect-16/10 shrink-0 overflow-hidden rounded bg-stone-100 border border-stone-200">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-red-700 font-semibold mb-1">
                      <span>{article.category}</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-stone-400 font-normal">
                        {formatRelativeBengaliTime(article.publishDate)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2 font-serif-bn">
                      {article.title}
                    </h3>

                    <p className="text-stone-500 text-xs mt-1 line-clamp-2 hidden sm:block">
                      {article.summary}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Quick Notice Banner */}
          <div className="mt-4 p-3 bg-stone-100 rounded border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span className="font-semibold text-stone-800">
              আজকের আলোচিত সব সংবাদ এক নজরে
            </span>
            <button
              onClick={() => onSelectCategory('all')}
              className="text-red-700 font-bold hover:underline inline-flex items-center gap-0.5"
            >
              সব খবর <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

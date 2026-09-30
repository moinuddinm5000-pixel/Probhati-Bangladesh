import React from 'react';
import { ChevronRight, Clock, Eye } from 'lucide-react';
import { NewsArticle, Category } from '../types/news';
import { formatRelativeBengaliTime, toBengaliNumber } from '../utils/bengali';

interface CategoryBlockProps {
  category: Category;
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const CategoryBlock: React.FC<CategoryBlockProps> = ({
  category,
  articles,
  onSelectArticle,
  onSelectCategory
}) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  const primaryArticle = articles[0];
  const otherArticles = articles.slice(1, 4);

  return (
    <div className="border-t-2 border-red-700 pt-3 pb-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: category.color || '#b91c1c' }}
          />
          <h3
            onClick={() => onSelectCategory(category.slug)}
            className="text-lg md:text-xl font-bold text-stone-900 font-serif-bn hover:text-red-700 cursor-pointer transition-colors"
          >
            {category.name}
          </h3>
        </div>

        <button
          onClick={() => onSelectCategory(category.slug)}
          className="text-xs font-semibold text-red-700 hover:text-red-800 hover:underline flex items-center cursor-pointer"
        >
          আরও খবর <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Primary Story in this block */}
        <article
          onClick={() => onSelectArticle(primaryArticle)}
          className="cursor-pointer group flex flex-col md:col-span-2 border-b md:border-b-0 md:border-r border-stone-200 pb-4 md:pb-0 md:pr-4"
        >
          <div className="relative aspect-16/9 w-full overflow-hidden rounded bg-stone-100 mb-2 border border-stone-200">
            <img
              src={primaryArticle.featuredImage}
              alt={primaryArticle.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
            <span>{formatRelativeBengaliTime(primaryArticle.publishDate)}</span>
            <span aria-hidden="true">·</span>
            <span>{primaryArticle.author}</span>
          </div>

          <h4 className="text-base md:text-lg font-bold text-stone-900 group-hover:text-red-700 transition-colors leading-snug mb-1 font-serif-bn">
            {primaryArticle.title}
          </h4>

          <p className="text-stone-600 text-xs md:text-sm line-clamp-2 leading-relaxed">
            {primaryArticle.summary}
          </p>
        </article>

        {/* Other stories in this category block */}
        <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
          {otherArticles.map((article, idx) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className={`cursor-pointer group pb-2.5 ${
                idx !== otherArticles.length - 1 ? 'border-b border-stone-100' : ''
              }`}
            >
              <div className="flex gap-3 items-center">
                {article.featuredImage && (
                  <div className="w-20 aspect-16/10 shrink-0 overflow-hidden rounded bg-stone-100 border border-stone-200">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs md:text-sm font-semibold text-stone-800 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h5>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-1">
                    <span>{formatRelativeBengaliTime(article.publishDate)}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

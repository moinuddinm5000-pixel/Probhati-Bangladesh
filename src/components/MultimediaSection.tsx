import React from 'react';
import { PlayCircle, Camera, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../types/news';
import { formatRelativeBengaliTime } from '../utils/bengali';

interface MultimediaSectionProps {
  videoArticles: NewsArticle[];
  photoArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onSelectCategory: (categorySlug: string) => void;
}

export const MultimediaSection: React.FC<MultimediaSectionProps> = ({
  videoArticles,
  photoArticles,
  onSelectArticle,
  onSelectCategory
}) => {
  return (
    <section className="my-10 bg-stone-900 text-stone-100 rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
          <h2 className="text-xl md:text-2xl font-bold font-serif-bn tracking-wide">
            ভিডিও ও ছবির গল্প
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => onSelectCategory('video')}
            className="hover:text-red-400 font-medium transition-colors"
          >
            সব ভিডিও &rarr;
          </button>
          <button
            onClick={() => onSelectCategory('photo-gallery')}
            className="hover:text-red-400 font-medium transition-colors"
          >
            সব ফটো গ্যালারি &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Stories */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-red-500 font-semibold text-sm">
            <PlayCircle className="w-4 h-4" />
            <span>ভিডিও সংবাদ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videoArticles.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectArticle(item)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-16/9 rounded overflow-hidden bg-stone-800 border border-stone-700/60 mb-2">
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-stone-950/30 flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 fill-current" />
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <span className="text-[11px] text-stone-400 mt-1">
                  {formatRelativeBengaliTime(item.publishDate)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Galleries */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-red-500 font-semibold text-sm">
            <Camera className="w-4 h-4" />
            <span>ছবিতে বাংলাদেশ ও বিশ্ব</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photoArticles.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectArticle(item)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-16/9 rounded overflow-hidden bg-stone-800 border border-stone-700/60 mb-2">
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-2 right-2 bg-stone-900/80 text-stone-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>ফটো ফিচার</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <span className="text-[11px] text-stone-400 mt-1">
                  {formatRelativeBengaliTime(item.publishDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

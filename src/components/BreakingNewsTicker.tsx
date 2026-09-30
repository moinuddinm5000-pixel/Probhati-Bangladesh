import React, { useState, useEffect } from 'react';
import { Flame, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface BreakingNewsTickerProps {
  breakingArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  breakingArticles,
  onSelectArticle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (breakingArticles.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [breakingArticles.length, isPaused]);

  if (!breakingArticles || breakingArticles.length === 0) {
    return null;
  }

  const current = breakingArticles[currentIndex] || breakingArticles[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + breakingArticles.length) % breakingArticles.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-red-50 border-y border-red-200 text-stone-900 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        {/* Badge with pulse */}
        <div className="flex items-center gap-1.5 bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs shrink-0 uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>ব্রেকিং নিউজ</span>
        </div>

        {/* Headline Link */}
        <div className="flex-1 min-w-0 flex items-center">
          <button
            onClick={() => onSelectArticle(current)}
            className="text-sm font-semibold text-stone-900 hover:text-red-700 transition-colors truncate text-left cursor-pointer group"
          >
            <span className="text-red-600 font-bold mr-2">[{current.category}]</span>
            <span className="group-hover:underline">{current.title}</span>
          </button>
        </div>

        {/* Counter and controls */}
        {breakingArticles.length > 1 && (
          <div className="flex items-center gap-1 shrink-0 text-stone-500 text-xs">
            <span className="hidden sm:inline text-stone-400 font-medium mr-1">
              {currentIndex + 1}/{breakingArticles.length}
            </span>
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-red-100 rounded text-stone-700 transition-colors cursor-pointer"
              title="পূর্ববর্তী ব্রেকিং নিউজ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-red-100 rounded text-stone-700 transition-colors cursor-pointer"
              title="পরবর্তী ব্রেকিং নিউজ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  FileText,
  Lock,
  ArrowUp
} from 'lucide-react';
import { Category, SiteSettings, AdPlacement } from '../types/news';
import { AdBanner } from './AdBanner';

interface FooterProps {
  categories: Category[];
  settings: SiteSettings;
  footerAd?: AdPlacement;
  onSelectCategory: (categorySlug: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  settings,
  footerAd,
  onSelectCategory,
  onOpenAdmin
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 mt-16 border-t-4 border-red-700">
      {/* Optional Footer Ad */}
      {footerAd && footerAd.enabled && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <AdBanner placement={footerAd} />
        </div>
      )}

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Editorial Credentials */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-block"></span>
              <h2 className="text-2xl font-bold text-white font-serif-bn">
                {settings.siteName || 'প্রভাতী বাংলাদেশ'}
              </h2>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed">
              {settings.tagline || 'সত্য ও বস্তুনিষ্ঠ সাংবাদিকতার প্রতিশ্রুতি নিয়ে ২৪ ঘণ্টা পাঠকদের পাশে।'}
            </p>

            <div className="pt-2 text-xs space-y-1.5 text-stone-400 border-t border-stone-800">
              <p>
                <strong className="text-stone-300">প্রধান সম্পাদক ও প্রকাশক:</strong> {settings.editorName}
              </p>
              <p>
                <strong className="text-stone-300">প্রকাশক প্রতিষ্ঠান:</strong> {settings.publisher}
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{settings.officeAddress}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{settings.contactPhone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{settings.contactEmail}</span>
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href={settings.socialLinks.facebook || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-stone-300 hover:bg-blue-600 hover:text-white transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.twitter || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-stone-300 hover:bg-sky-500 hover:text-white transition-colors"
                title="X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.youtube || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-stone-300 hover:bg-red-600 hover:text-white transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.instagram || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-stone-300 hover:bg-pink-600 hover:text-white transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories Col 1 */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-stone-800 pb-2">
              প্রধান বিভাগ
            </h3>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.slug)}
                    className="hover:text-white hover:underline transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Categories Col 2 */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-stone-800 pb-2">
              অন্যান্য বিভাগ
            </h3>
            <ul className="space-y-2 text-xs">
              {categories.slice(8, 16).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.slug)}
                    className="hover:text-white hover:underline transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional links & Administrative Portal */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-stone-800 pb-2">
              নীতিমালা ও পোর্টাল
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  গোপনীয়তা নীতি (Privacy Policy)
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  ব্যবহারের শর্তাবলি (Terms)
                </a>
              </li>
              <li>
                <a href="#editorial" className="hover:text-white transition-colors">
                  সম্পাদকীয় নীতিমালা
                </a>
              </li>
              <li>
                <a href="#ads" className="hover:text-white transition-colors">
                  বিজ্ঞাপন মূল্যতালিকা
                </a>
              </li>
              <li>
                <a href="#archive" className="hover:text-white transition-colors">
                  সংবাদ আর্কাইভ
                </a>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>প্রশাসক ড্যাশবোর্ড</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal and Disclaimer bottom strip */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} {settings.siteName}। সর্বস্বত্ব সংরক্ষিত। অনুমতি ছাড়া এই ওয়েবসাইটের কোনো লেখা বা ছবি অনুলিপি করা আইনত দণ্ডনীয়।
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors p-1.5 rounded bg-stone-800 cursor-pointer"
            title="পৃষ্ঠার শীর্ষে যান"
          >
            <span>শীর্ষে</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

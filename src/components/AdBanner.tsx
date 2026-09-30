import React from 'react';
import { AdPlacement } from '../types/news';

interface AdBannerProps {
  placement?: AdPlacement;
  slotClass?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, slotClass }) => {
  if (!placement || !placement.enabled) {
    return null;
  }

  // If custom HTML is provided
  if (placement.customHtml) {
    return (
      <div className={`my-4 flex flex-col items-center justify-center ${slotClass || ''}`}>
        <div
          className="w-full text-center"
          dangerouslySetInnerHTML={{ __html: placement.customHtml }}
        />
        <span className="text-[10px] text-stone-400 mt-0.5">বিজ্ঞাপন</span>
      </div>
    );
  }

  // If Image URL is provided
  if (placement.imageUrl) {
    return (
      <div className={`my-4 flex flex-col items-center justify-center ${slotClass || ''}`}>
        <a
          href={placement.targetUrl || '#'}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded border border-stone-200 hover:opacity-95 transition-opacity max-w-full"
        >
          <img
            src={placement.imageUrl}
            alt={placement.altText || placement.title || 'বিজ্ঞাপন'}
            referrerPolicy="no-referrer"
            className="w-full h-auto object-cover max-h-[140px] md:max-h-[180px]"
          />
        </a>
        <span className="text-[10px] text-stone-400 tracking-wider mt-0.5 uppercase">বিজ্ঞাপন</span>
      </div>
    );
  }

  return null;
};

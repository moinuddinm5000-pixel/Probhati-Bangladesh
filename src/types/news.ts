export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  featuredImage: string;
  imageCaption?: string;
  imageAlt?: string;
  imageAttribution?: string;
  additionalImages?: { url: string; caption?: string; alt?: string }[];
  author: string;
  authorRole?: string;
  tags: string[];
  status: 'published' | 'draft' | 'scheduled' | 'trash';
  publishDate: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  isBreaking: boolean;
  isFeatured: boolean;
  isTopNews: boolean;
  isPinned?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  source?: string;
  isSample?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  showOnHome: boolean;
  color?: string;
}

export interface AdPlacement {
  id: 'header' | 'home_middle' | 'sidebar' | 'article_top' | 'article_bottom' | 'footer';
  title: string;
  enabled: boolean;
  imageUrl?: string;
  targetUrl?: string;
  altText?: string;
  customHtml?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  editorName: string;
  publisher: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
    instagram?: string;
  };
  seoMetaTitle: string;
  seoMetaDescription: string;
  googleAnalyticsId: string;
  breakingNewsEnabled: boolean;
  homeSectionsOrder: string[]; // array of category slugs
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  caption?: string;
  alt: string;
  attribution: string;
  source: 'uploaded' | 'unsplash' | 'pexels' | 'wikimedia' | 'generated';
  createdAt: string;
}

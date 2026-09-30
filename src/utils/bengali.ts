// Bengali number and date utilities

const BENGALI_NUMBERS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const str = num.toString();
  return str.replace(/[0-9]/g, (digit) => BENGALI_NUMBERS[parseInt(digit, 10)] || digit);
}

const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const BENGALI_DAYS = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

export function formatBengaliDate(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const dayName = BENGALI_DAYS[date.getDay()];
  const day = toBengaliNumber(date.getDate());
  const month = BENGALI_MONTHS[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());

  let hours = date.getHours();
  const minutes = toBengaliNumber(date.getMinutes().toString().padStart(2, '0'));
  let period = 'সকাল';
  if (hours >= 12 && hours < 16) period = 'দুপুর';
  else if (hours >= 16 && hours < 19) period = 'বিকেল';
  else if (hours >= 19 && hours <= 23) period = 'রাত';
  else if (hours < 6) period = 'রাত';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  const hourBn = toBengaliNumber(hours);

  return `${dayName}, ${day} ${month} ${year}, ${period} ${hourBn}:${minutes}`;
}

export function formatRelativeBengaliTime(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'এইমাত্র';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${toBengaliNumber(diffInMinutes)} মিনিট আগে`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${toBengaliNumber(diffInHours)} ঘণ্টা আগে`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${toBengaliNumber(diffInDays)} দিন আগে`;
  }

  return formatBengaliDate(isoString);
}

// Current Bangladeshi Date Bar (Gregorian + Bangla season header)
export function getTodaysBanglaHeader(): string {
  const now = new Date();
  const dayName = BENGALI_DAYS[now.getDay()];
  const day = toBengaliNumber(now.getDate());
  const month = BENGALI_MONTHS[now.getMonth()];
  const year = toBengaliNumber(now.getFullYear());
  
  // Approximate Bengali month calculation for traditional greeting
  // (Ashwin 1433 in Sept 2026)
  return `${dayName}, ${day} ${month} ${year} | ঢাকা, বাংলাদেশ`;
}

export function calculateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 150));
  return `${toBengaliNumber(minutes)} মিনিট পাঠ`;
}

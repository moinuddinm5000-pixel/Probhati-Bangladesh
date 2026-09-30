import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { api, authStorage } from '../api/client';

interface AdminLoginProps {
  isConfigured: boolean;
  defaultUsername: string;
  onSuccess: (token: string, username: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  isConfigured,
  defaultUsername,
  onSuccess,
  onCancel
}) => {
  const [username, setUsername] = useState(defaultUsername || 'Moinuddin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Setup mode when admin password hasn't been configured yet
  const isFirstTimeSetup = !isConfigured;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('ইউজারনেম দিন');
      return;
    }

    if (password.length < 8) {
      setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে');
      return;
    }

    if (isFirstTimeSetup && password !== confirmPassword) {
      setError('পাসওয়ার্ড দুটি মিলছে না');
      return;
    }

    setLoading(true);
    try {
      if (isFirstTimeSetup) {
        const res = await api.setupAdmin(username, password);
        if (res.token) {
          authStorage.setToken(res.token);
          authStorage.setUser(res.username);
          onSuccess(res.token, res.username);
        }
      } else {
        const res = await api.loginAdmin(username, password);
        if (res.token) {
          authStorage.setToken(res.token);
          authStorage.setUser(res.user.username);
          onSuccess(res.token, res.user.username);
        }
      }
    } catch (err: any) {
      setError(err.message || 'অনুরোধ ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      {/* Back to site button */}
      <button
        onClick={onCancel}
        className="mb-6 flex items-center gap-1.5 text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ওয়েবসাইটে ফিরে যান</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-md p-6 sm:p-8">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-700 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-serif-bn text-stone-900">
            {isFirstTimeSetup ? 'প্রশাসক অ্যাকাউন্ট কনফিগারেশন' : 'প্রশাসক লগইন'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {isFirstTimeSetup
              ? 'প্রথমবারের মতো নিরাপদ পাসওয়ার্ড নির্ধারণ করুন (Default: Moinuddin)'
              : 'সংবাদ পোর্টাল পরিচালনার জন্য আপনার অ্যাকাউন্টে প্রবেশ করুন'}
          </p>
        </div>

        {/* Security Warning Notice */}
        {isFirstTimeSetup && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              নিরাপত্তার স্বার্থে কোনো ডিফল্ট পাসওয়ার্ড কোডে সেভ নেই। আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন।
            </span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              প্রশাসক ইউজারনেম (Admin Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:border-red-700 focus:ring-1 focus:ring-red-700 outline-none text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {isFirstTimeSetup ? 'নতুন পাসওয়ার্ড (Password)' : 'পাসওয়ার্ড (Password)'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="কমপক্ষে ৮ অক্ষর"
                className="w-full pl-9 pr-10 py-2 text-sm border border-stone-300 rounded-lg focus:border-red-700 focus:ring-1 focus:ring-red-700 outline-none text-stone-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isFirstTimeSetup && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:border-red-700 focus:ring-1 focus:ring-red-700 outline-none text-stone-900"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>প্রক্রিয়াধীন...</span>
            ) : isFirstTimeSetup ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>অ্যাকাউন্ট নিশ্চিত ও প্রবেশ করুন</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>লগইন করুন</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-400">
          প্রভাতী বাংলাদেশ মিডিয়া ম্যানেজমেন্ট সিস্টেম
        </div>
      </div>
    </div>
  );
};

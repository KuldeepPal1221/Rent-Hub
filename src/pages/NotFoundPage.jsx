import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Home, Search } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
        <Layers className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          The page you are looking for might have been moved, removed, or is temporarily unavailable.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow hover:bg-emerald-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back Home</span>
        </Link>
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-200 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

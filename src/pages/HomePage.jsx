import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  Zap,
  DollarSign,
  Repeat,
  ArrowRight,
  Tv,
  Wrench,
  Armchair,
  Car,
  Camera,
  Laptop,
  Music,
  Trophy,
  Utensils,
  Shirt,
  BookOpen,
  Package,
  CheckCircle2,
  Users,
  Clock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { productService, categoryService } from '../services/api.js';
import ProductCard from '../components/common/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Icon map for categories
const categoryIcons = {
  'electronics': Tv,
  'home-appliances': Sparkles,
  'tools': Wrench,
  'furniture': Armchair,
  'vehicles': Car,
  'cameras': Camera,
  'computers': Laptop,
  'event-equipment': Music,
  'sports-equipment': Trophy,
  'kitchen-equipment': Utensils,
  'clothing': Shirt,
  'books': BookOpen,
  'other': Package
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search Bar State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const [catRes, prodRes] = await Promise.all([
          categoryService.getAll(),
          productService.getAll({ limit: 8, sort: 'newest' })
        ]);

        if (catRes.success) setCategories(catRes.categories);
        if (prodRes.success) {
          setFeaturedProducts(prodRes.products.slice(0, 4));
          setRecentProducts(prodRes.products);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedCity) params.append('city', selectedCity);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50 border-b border-slate-200/60">
        {/* Background glow dots */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-emerald-300/10 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>The #1 Local Peer-to-Peer Rental Marketplace</span>
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Rent Anything You Need,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Monetize What You Own.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Why buy when you can rent? Access power tools, steam presses, 4K cameras, camping gear, and appliances from trusted people near you.
            </p>
          </div>

          {/* Search Card Container */}
          <div className="max-w-4xl mx-auto bg-white p-3 sm:p-4 rounded-3xl shadow-card border border-slate-200/80">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
              {/* Product Keyword Input */}
              <div className="sm:col-span-5 relative flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-2xl px-3.5 py-2.5 transition-colors border border-slate-200/60 focus-within:border-emerald-500 focus-within:bg-white">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. Steam Iron, Sony A7, Drill, Tent..."
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Category Dropdown */}
              <div className="sm:col-span-3 relative flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-2xl px-3.5 py-2.5 transition-colors border border-slate-200/60 focus-within:border-emerald-500 focus-within:bg-white">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div className="sm:col-span-2 relative flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-2xl px-3.5 py-2.5 transition-colors border border-slate-200/60 focus-within:border-emerald-500 focus-within:bg-white">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="">Any City</option>
                  <option value="New York">New York</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="Chicago">Chicago</option>
                </select>
              </div>

              {/* Search Action Button */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Items</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick CTA Links & Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-slate-600">
            <Link
              to="/browse"
              className="font-bold text-slate-800 hover:text-emerald-600 flex items-center gap-1.5 group"
            >
              <span>Explore Marketplace</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-emerald-600" />
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              to={isAuthenticated ? "/add-product" : "/login?redirect=/add-product"}
              className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
            >
              <span>List Your First Product Free</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Browse Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              What are you looking to rent?
            </h2>
          </div>
          <Link
            to="/browse"
            className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View all categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const IconComponent = categoryIcons[cat.slug] || Package;
            return (
              <Link
                key={cat.id}
                to={`/browse?category=${cat.slug}`}
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/50 shadow-xs hover:shadow-card transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {cat.product_count || 0} available
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED & RECENT RENTALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Verified Listings
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Recently Listed for Rent
            </h2>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl transition-all shadow-xs"
          >
            <span>See all {recentProducts.length > 0 ? recentProducts.length : ''} products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Simple & Seamless
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              How RentHub Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Whether you need to borrow an item for a weekend or make passive income from items sitting in your closet, we make it effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {/* For Renters */}
            <div className="space-y-6 bg-slate-800/60 p-8 rounded-3xl border border-slate-700/60">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-bold">
                <Users className="w-4 h-4" />
                <span>For Renters</span>
              </div>
              <h3 className="text-xl font-bold">Need something for a few days?</h3>

              <div className="space-y-5 text-sm text-slate-300">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Search & Filter Nearby</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Find tools, cameras, electronics, or appliances available in your city.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Direct Contact or Inquiry</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Chat directly via WhatsApp, call the owner, or submit a formal rental inquiry with your desired dates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Pick Up, Use & Return</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Collect the item, use it for your project or event, and return it in good condition. Save up to 90% compared to buying!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Owners */}
            <div className="space-y-6 bg-slate-800/60 p-8 rounded-3xl border border-slate-700/60">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-xl text-xs font-bold">
                <DollarSign className="w-4 h-4" />
                <span>For Item Owners</span>
              </div>
              <h3 className="text-xl font-bold">Turn unused items into cash</h3>

              <div className="space-y-5 text-sm text-slate-300">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white">List in Under 2 Minutes</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Upload photos, set your price (per day/week/month), and optional security deposit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Control Your Privacy & Availability</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Choose whether renters contact you via WhatsApp, Phone, or in-app inquiries. Toggle listings active or paused anytime.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Earn Reliable Passive Income</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Hand over the gear, collect your rental earnings, and help your community live sustainably.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE RENTHUB (VALUE PROPOSITIONS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Why RentHub
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Built for Trust, Safety & Simplicity
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Privacy & Owner Control</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              You choose exactly what contact details are visible. Hide your phone or WhatsApp number anytime with 1-click privacy switches.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant Direct Communication</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              No endless middlemen. Tap the WhatsApp or Call button to coordinate pickup immediately with pre-filled availability questions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sustainable Circular Economy</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Save hundreds of dollars on one-time purchases and reduce electronic waste by sharing tools and gear within your neighborhood.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-8 sm:p-14 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to start renting or earning today?
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base">
              Join thousands of neighbors renting tools, appliances, and gear securely. Create your account in under 60 seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 text-sm font-bold rounded-2xl shadow text-center transition-all active:scale-95"
            >
              Create Free Account
            </Link>
            <Link
              to="/browse"
              className="px-6 py-3.5 bg-emerald-800/50 hover:bg-emerald-800 text-white border border-emerald-400/40 text-sm font-bold rounded-2xl text-center transition-all"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

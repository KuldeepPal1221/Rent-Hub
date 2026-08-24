import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  MapPin,
  Tag,
  Loader2,
  PackageOpen,
  DollarSign
} from 'lucide-react';
import { productService, categoryService } from '../services/api.js';
import ProductCard from '../components/common/ProductCard.jsx';
import { formatCurrency, formatPeriod } from '../utils/formatters.js';

export const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || '';
  const queryCity = searchParams.get('city') || '';
  const queryMinPrice = searchParams.get('min_price') || '';
  const queryMaxPrice = searchParams.get('max_price') || '';
  const queryPeriod = searchParams.get('price_period') || '';
  const queryCondition = searchParams.get('condition') || '';
  const querySort = searchParams.get('sort') || 'newest';

  // Local filter states
  const [search, setSearch] = useState(querySearch);
  const [category, setCategory] = useState(queryCategory);
  const [city, setCity] = useState(queryCity);
  const [minPrice, setMinPrice] = useState(queryMinPrice);
  const [maxPrice, setMaxPrice] = useState(queryMaxPrice);
  const [pricePeriod, setPricePeriod] = useState(queryPeriod);
  const [condition, setCondition] = useState(queryCondition);
  const [sort, setSort] = useState(querySort);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Fetch categories once
  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  // Sync from URL params when changed
  useEffect(() => {
    setSearch(querySearch);
    setCategory(queryCategory);
    setCity(queryCity);
    setMinPrice(queryMinPrice);
    setMaxPrice(queryMaxPrice);
    setPricePeriod(queryPeriod);
    setCondition(queryCondition);
    setSort(querySort);

    fetchProducts({
      search: querySearch,
      category: queryCategory,
      city: queryCity,
      min_price: queryMinPrice,
      max_price: queryMaxPrice,
      price_period: queryPeriod,
      condition: queryCondition,
      sort: querySort
    });
  }, [searchParams]);

  const fetchProducts = async (params) => {
    try {
      setIsLoading(true);
      const res = await productService.getAll(params);
      if (res.success) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (newParams = {}) => {
    const updated = new URLSearchParams();

    const finalSearch = newParams.search !== undefined ? newParams.search : search;
    const finalCat = newParams.category !== undefined ? newParams.category : category;
    const finalCity = newParams.city !== undefined ? newParams.city : city;
    const finalMin = newParams.min_price !== undefined ? newParams.min_price : minPrice;
    const finalMax = newParams.max_price !== undefined ? newParams.max_price : maxPrice;
    const finalPeriod = newParams.price_period !== undefined ? newParams.price_period : pricePeriod;
    const finalCond = newParams.condition !== undefined ? newParams.condition : condition;
    const finalSort = newParams.sort !== undefined ? newParams.sort : sort;

    if (finalSearch) updated.set('search', finalSearch);
    if (finalCat) updated.set('category', finalCat);
    if (finalCity) updated.set('city', finalCity);
    if (finalMin) updated.set('min_price', finalMin);
    if (finalMax) updated.set('max_price', finalMax);
    if (finalPeriod) updated.set('price_period', finalPeriod);
    if (finalCond) updated.set('condition', finalCond);
    if (finalSort && finalSort !== 'newest') updated.set('sort', finalSort);

    setSearchParams(updated);
    setIsMobileFilterOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setPricePeriod('');
    setCondition('');
    setSort('newest');
    setSearchParams({});
    setIsMobileFilterOpen(false);
  };

  const activeFilterCount = [
    category,
    city,
    minPrice,
    maxPrice,
    pricePeriod,
    condition
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Browse Rental Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Find items to rent near you, compare daily & weekly rates, and contact owners directly.
          </p>
        </div>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description, city..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  applyFilters({ search: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                applyFilters({ category: e.target.value });
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c.product_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* City / Location Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">City</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                applyFilters({ city: e.target.value });
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Cities</option>
              <option value="New York">New York</option>
              <option value="San Francisco">San Francisco</option>
              <option value="Chicago">Chicago</option>
            </select>
          </div>

          {/* Pricing Period Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Pricing Period</label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
              {['all', 'day', 'week', 'month'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const val = p === 'all' ? '' : p;
                    setPricePeriod(val);
                    applyFilters({ price_period: val });
                  }}
                  className={`text-[11px] font-bold py-1.5 rounded-lg capitalize transition-colors ${
                    (p === 'all' && !pricePeriod) || pricePeriod === p
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Max Rental Price ($)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => applyFilters({ min_price: minPrice, max_price: maxPrice })}
              className="w-full py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors mt-2"
            >
              Apply Price Filter
            </button>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block">Product Condition</label>
            <div className="flex flex-wrap gap-1.5">
              {['Brand New', 'Like New', 'Good', 'Fair'].map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => {
                    const val = condition === cond ? '' : cond;
                    setCondition(val);
                    applyFilters({ condition: val });
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                    condition === cond
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Display Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Bar: Sort & Filter triggers & View Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>

              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                Showing <strong className="text-slate-900">{products.length}</strong> rental item{products.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium hidden sm:inline">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    applyFilters({ sort: e.target.value });
                  }}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* View Grid / List Toggle */}
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-semibold">Active filters:</span>
              {category && (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  Category: {categories.find((c) => c.slug === category)?.name || category}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => applyFilters({ category: '' })} />
                </span>
              )}
              {city && (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  City: {city}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => applyFilters({ city: '' })} />
                </span>
              )}
              {pricePeriod && (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  Period: {pricePeriod}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => applyFilters({ price_period: '' })} />
                </span>
              )}
              {condition && (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  Condition: {condition}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => applyFilters({ condition: '' })} />
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  Price: {minPrice ? `$${minPrice}` : '$0'} - {maxPrice ? `$${maxPrice}` : 'Any'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => applyFilters({ min_price: '', max_price: '' })} />
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 font-bold hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Searching rental marketplace...</p>
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="py-20 px-4 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No rental products found</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  We couldn't find any products matching your filters. Try resetting your search or broadening the price range.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Products Grid */
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'grid grid-cols-1 gap-4'
              }
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center">
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Filter Products</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3"
              >
                <option value="">All Cities</option>
                <option value="New York">New York</option>
                <option value="San Francisco">San Francisco</option>
                <option value="Chicago">Chicago</option>
              </select>
            </div>

            {/* Mobile Period */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900">Pricing Period</label>
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                {['all', 'day', 'week', 'month'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPricePeriod(p === 'all' ? '' : p)}
                    className={`text-xs font-bold py-2 rounded-lg capitalize ${
                      (p === 'all' && !pricePeriod) || pricePeriod === p
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900">Max Price ($)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 50"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3"
              />
            </div>

            {/* Mobile Actions */}
            <div className="pt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;

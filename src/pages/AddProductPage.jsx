import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2, ArrowLeft, DollarSign, Image as ImageIcon, MapPin, Tag, Shield, HelpCircle } from 'lucide-react';
import { productService, categoryService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import ImageUploader from '../components/common/ImageUploader.jsx';

export const AddProductPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');
  const [pricePeriod, setPricePeriod] = useState('day');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [condition, setCondition] = useState('Like New');
  const [city, setCity] = useState(user?.city || 'New York');
  const [location, setLocation] = useState('');
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().split('T')[0]);
  const [availableUntil, setAvailableUntil] = useState('');
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('available');

  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.success && res.categories.length > 0) {
        setCategories(res.categories);
        setCategoryId(res.categories[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e, saveStatus = 'available') => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a product name.');
      return;
    }

    if (!categoryId) {
      toast.error('Please select a product category.');
      return;
    }

    if (!description.trim() || description.length < 20) {
      toast.error('Please provide a detailed description (at least 20 characters).');
      return;
    }

    if (!rentalPrice || Number(rentalPrice) <= 0) {
      toast.error('Please enter a valid rental price.');
      return;
    }

    if (!city.trim() || !location.trim()) {
      toast.error('Please specify the city and pickup location/neighborhood.');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload or provide at least one product photo.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        category_id: Number(categoryId),
        description: description.trim(),
        rental_price: Number(rentalPrice),
        price_period: pricePeriod,
        security_deposit: securityDeposit ? Number(securityDeposit) : 0,
        condition,
        city: city.trim(),
        location: location.trim(),
        available_from: availableFrom,
        available_until: availableUntil || null,
        images,
        status: saveStatus
      };

      const res = await productService.create(payload);
      if (res.success) {
        toast.success(saveStatus === 'available' ? 'Product published successfully!' : 'Saved as draft.');
        navigate(`/products/${res.productId}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create product listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Rent Out Your Product
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fill in the details below to list your item on the marketplace and start earning.
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, 'available')} className="space-y-8">
        {/* Section 1: Basic Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>1. Basic Product Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Title / Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Philips Steam Generator Iron / Sony A7 IV Mirrorless"
                required
                maxLength={100}
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              >
                <option value="Brand New">Brand New (Unopened/Flawless)</option>
                <option value="Like New">Like New (Mint Condition)</option>
                <option value="Good">Good (Minor normal cosmetic wear)</option>
                <option value="Fair">Fair (Fully functional, visible wear)</option>
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is included, specifications, recommended uses, and any instructions for the renter..."
                required
                className="w-full text-xs sm:text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none resize-y"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Include details like power wattage, lens attachments, included accessories, or carrying bags.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Photos */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>2. Product Images (Up to 6 Photos)</span>
          </h2>
          <p className="text-xs text-slate-500">
            High-quality, bright photos attract up to 3x more rental inquiries. The first image will be used as the cover.
          </p>
          <ImageUploader images={images} setImages={setImages} maxImages={6} />
        </div>

        {/* Section 3: Pricing & Deposit */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>3. Rental Pricing & Deposit</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Rental Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rental Price ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={rentalPrice}
                  onChange={(e) => setRentalPrice(e.target.value)}
                  placeholder="25"
                  required
                  className="w-full text-xs sm:text-sm pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Pricing Period */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pricing Period *
              </label>
              <select
                value={pricePeriod}
                onChange={(e) => setPricePeriod(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              >
                <option value="day">Per Day</option>
                <option value="week">Per Week</option>
                <option value="month">Per Month</option>
              </select>
            </div>

            {/* Security Deposit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Refundable Deposit ($) (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  placeholder="50"
                  className="w-full text-xs sm:text-sm pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Location & Availability */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>4. Location & Pickup Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco"
                required
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Pickup Location / Neighborhood */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pickup Neighborhood / Cross Street *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mission District / 16th St"
                required
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Available From */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Available From
              </label>
              <input
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Available Until */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Available Until (Optional)
              </label>
              <input
                type="date"
                min={availableFrom}
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'inactive')}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-2xl transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Publish Product to Marketplace</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;

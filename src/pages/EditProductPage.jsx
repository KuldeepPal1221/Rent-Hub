import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader2, ArrowLeft, Trash2, Tag, DollarSign, Image as ImageIcon, MapPin } from 'lucide-react';
import { productService, categoryService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import ImageUploader from '../components/common/ImageUploader.jsx';
import ConfirmModal from '../components/common/ConfirmModal.jsx';

export const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');
  const [pricePeriod, setPricePeriod] = useState('day');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [condition, setCondition] = useState('Good');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('available');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [catRes, prodRes] = await Promise.all([
          categoryService.getAll(),
          productService.getById(id)
        ]);

        if (catRes.success) setCategories(catRes.categories);

        if (prodRes.success && prodRes.product) {
          const p = prodRes.product;
          if (!p.is_owner) {
            toast.error('You do not have permission to edit this listing.');
            navigate('/dashboard');
            return;
          }
          setName(p.name);
          setCategoryId(p.category_id);
          setDescription(p.description);
          setRentalPrice(p.rental_price);
          setPricePeriod(p.price_period);
          setSecurityDeposit(p.security_deposit || '');
          setCondition(p.condition);
          setCity(p.city);
          setLocation(p.location);
          setAvailableFrom(p.available_from || '');
          setAvailableUntil(p.available_until || '');
          setImages(p.images || []);
          setStatus(p.availability_status);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load product for editing.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !categoryId || !description.trim() || !rentalPrice || !city.trim() || !location.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (images.length === 0) {
      toast.error('Please keep at least one product photo.');
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
        availability_status: status
      };

      const res = await productService.update(id, payload);
      if (res.success) {
        toast.success('Listing updated successfully!');
        navigate(`/products/${id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await productService.delete(id);
      if (res.success) {
        toast.success('Listing deleted successfully.');
        navigate('/dashboard?tab=my-products');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading product details for editing...</p>
      </div>
    );
  }

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
            Edit Product Listing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update pricing, photos, availability status, or description.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Listing</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Status Toggle Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Listing Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active listings are visible on the public marketplace. Inactive listings are hidden.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatus('available')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                status === 'available' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatus('inactive')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                status === 'inactive' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Inactive / Paused
            </button>
          </div>
        </div>

        {/* Section 1: Basic Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Product Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              >
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Description *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full text-xs sm:text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Photos */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>Product Photos</span>
          </h2>
          <ImageUploader images={images} setImages={setImages} maxImages={6} />
        </div>

        {/* Section 3: Pricing */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Pricing & Deposit</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Rental Price ($) *</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={rentalPrice}
                onChange={(e) => setRentalPrice(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pricing Period *</label>
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Security Deposit ($)</label>
              <input
                type="number"
                min="0"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Location */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Location & City</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pickup Location / Area *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Rental Listing"
        message={`Are you sure you want to permanently delete "${name}"? This action cannot be reversed.`}
        confirmText="Delete Permanently"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EditProductPage;

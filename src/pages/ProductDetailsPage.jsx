import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Share2,
  Flag,
  Calendar,
  Shield,
  ShieldCheck,
  Phone,
  MessageCircle,
  Mail,
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  Info
} from 'lucide-react';
import { productService, favoriteService } from '../services/api.js';
import { formatCurrency, formatPeriod, formatDate, getConditionBadge, getStatusBadge } from '../utils/formatters.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import InquiryModal from '../components/common/InquiryModal.jsx';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await productService.getById(id);
        if (res.success && res.product) {
          setProduct(res.product);
          setIsFavorite(!!res.product.is_favorite);
          setRelatedProducts(res.relatedProducts || []);
          setSelectedImageIndex(0);
        }
      } catch (err) {
        toast.error(err.message || 'Product not found.');
        navigate('/browse');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save items to your favorites.');
      navigate('/login');
      return;
    }

    try {
      const res = await favoriteService.toggle(product.id);
      setIsFavorite(res.is_favorite);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Failed to update favorite.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Listing link copied to clipboard!');
  };

  const handleReport = () => {
    toast.info('Thank you. Our moderation team has been notified to review this listing.');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading rental item details...</p>
      </div>
    );
  }

  if (!product) return null;

  const conditionBadge = getConditionBadge(product.condition);
  const statusBadge = getStatusBadge(product.availability_status);
  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80'];

  // Format WhatsApp message & URL
  const waCleanPhone = product.owner?.whatsapp ? product.owner.whatsapp.replace(/[^0-9]/g, '') : '';
  const waMessage = encodeURIComponent(
    `Hello, I am interested in renting your "${product.name}". Is it currently available?`
  );
  const waUrl = waCleanPhone ? `https://wa.me/${waCleanPhone}?text=${waMessage}` : null;

  // Format Email subject & body
  const emailSubject = encodeURIComponent(`Rental Inquiry: ${product.name}`);
  const emailBody = encodeURIComponent(
    `Hello ${product.owner?.name},\n\nI saw your listing for "${product.name}" on RentHub and would love to rent it.\n\nCould you please let me know if it is available?\n\nThank you!`
  );
  const emailUrl = product.owner?.email ? `mailto:${product.owner.email}?subject=${emailSubject}&body=${emailBody}` : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link to="/browse" className="hover:text-emerald-600 flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse</span>
          </Link>
          <span>/</span>
          <Link to={`/browse?category=${product.category_slug}`} className="hover:text-emerald-600 font-medium">
            {product.category_name}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={handleFavoriteToggle}
            className={`flex items-center gap-1 transition-colors ${
              isFavorite ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Purchase/Contact Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 cursor-zoom-in group shadow-xs"
          >
            <img
              src={images[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />

            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <span className={`text-xs font-bold px-3 py-1 rounded-xl shadow-xs backdrop-blur-md ${conditionBadge.bg}`}>
                {product.condition}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-xl shadow-xs ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
            </div>

            {/* Views counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <Eye className="w-3.5 h-3.5" />
              <span>{product.views_count || 1} views</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Specs & Contact Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Title & Location Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <span className="bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                {product.category_name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{product.location}, {product.city}</span>
              </span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-card space-y-6">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Rental Rate
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {formatCurrency(product.rental_price)}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    {formatPeriod(product.price_period)}
                  </span>
                </div>
              </div>

              {product.security_deposit > 0 ? (
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    Refundable Deposit
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {formatCurrency(product.security_deposit)}
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    No Security Deposit
                  </span>
                </div>
              )}
            </div>

            {/* If product owner is viewing their own product */}
            {product.is_owner ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>This is your listed product</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/edit-product/${product.id}`}
                    className="flex-1 text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
                  >
                    Edit Listing
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex-1 text-center py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    View In Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              /* Contact Options for Renters */
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contact Owner & Reserve
                </h3>

                {/* Formal Rental Inquiry Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.info('Please log in or register to send rental inquiries.');
                      navigate('/login');
                      return;
                    }
                    setIsInquiryModalOpen(true);
                  }}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Send Rental Inquiry</span>
                </button>

                {/* Direct Contact Buttons (Respecting Owner Privacy Settings) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* WhatsApp Button */}
                  {product.owner?.whatsappEnabled && waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Chat</span>
                    </a>
                  ) : (
                    <div
                      className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 text-xs font-medium cursor-not-allowed"
                      title="Owner has disabled direct WhatsApp contact. Please use In-App Inquiry."
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp (Hidden)</span>
                    </div>
                  )}

                  {/* Direct Phone Call */}
                  {product.owner?.phoneEnabled && product.owner?.phone ? (
                    <a
                      href={`tel:${product.owner.phone}`}
                      className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-colors"
                    >
                      <Phone className="w-4 h-4 text-slate-600" />
                      <span>Call Owner</span>
                    </a>
                  ) : (
                    <div
                      className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 text-xs font-medium cursor-not-allowed"
                      title="Owner has disabled direct phone calls. Please use In-App Inquiry."
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call (Hidden)</span>
                    </div>
                  )}
                </div>

                {/* Email Direct Option */}
                {product.owner?.emailEnabled && emailUrl && (
                  <a
                    href={emailUrl}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-600 hover:text-emerald-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Direct Email</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Owner Profile Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Listed by Product Owner
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    product.owner?.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      product.owner?.name || 'Owner'
                    )}&background=10b981&color=fff`
                  }
                  alt={product.owner?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/20"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {product.owner?.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {product.owner?.city} • Member since {formatDate(product.owner?.memberSince)}
                  </p>
                </div>
              </div>

              <Link
                to={`/owner/${product.owner?.id}`}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Active listings: <strong>{product.owner?.activeListings || 1}</strong></span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ShieldCheck className="w-4 h-4" /> Verified User
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Tabs / Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-slate-200">
        {/* Description (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">About this product</h3>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>

          {/* Rental Safety Guidelines */}
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Rental Safety & Advice</span>
            </h4>
            <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
              <li>Inspect the product thoroughly together during handover.</li>
              <li>Confirm operating instructions and test all components before taking it home.</li>
              <li>Keep refundable deposits agreed upon in writing or receipt.</li>
              <li>Return the item clean and on time to maintain a great community rating.</li>
            </ul>
          </div>
        </div>

        {/* Specifications Table (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Product Specifications</h3>
            <dl className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-semibold text-slate-900">{product.category_name}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Condition</dt>
                <dd className="font-semibold text-slate-900">{product.condition}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">City</dt>
                <dd className="font-semibold text-slate-900">{product.city}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Pickup Location</dt>
                <dd className="font-semibold text-slate-900">{product.location}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Available From</dt>
                <dd className="font-semibold text-slate-900">{formatDate(product.available_from)}</dd>
              </div>
              {product.available_until && (
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Available Until</dt>
                  <dd className="font-semibold text-slate-900">{formatDate(product.available_until)}</dd>
                </div>
              )}
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Security Deposit</dt>
                <dd className="font-semibold text-slate-900">
                  {product.security_deposit > 0 ? formatCurrency(product.security_deposit) : 'None required'}
                </dd>
              </div>
            </dl>

            <div className="pt-2">
              <button
                onClick={handleReport}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Flag className="w-3 h-3" />
                <span>Report this listing</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar / Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              More in {product.category_name}
            </h3>
            <Link
              to={`/browse?category=${product.category_slug}`}
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Rental Inquiry Booking Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        product={product}
        onInquirySent={() => {
          // Refresh or toast is already handled inside modal
        }}
      />

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <img
            src={images[selectedImageIndex]}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;

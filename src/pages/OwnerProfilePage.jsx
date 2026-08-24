import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Calendar, ShieldCheck, MessageCircle, Phone, Mail, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { userService } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';
import ProductCard from '../components/common/ProductCard.jsx';
import { useToast } from '../components/common/Toast.jsx';

export const OwnerProfilePage = () => {
  const { id } = useParams();
  const toast = useToast();

  const [owner, setOwner] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        setIsLoading(true);
        const res = await userService.getPublicProfile(id);
        if (res.success && res.owner) {
          setOwner(res.owner);
          setProducts(res.products || []);
        }
      } catch (err) {
        toast.error(err.message || 'Owner profile not found.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwner();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading seller profile...</p>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Owner Not Found</h2>
        <p className="text-sm text-slate-500">The requested profile does not exist or has been deactivated.</p>
        <Link to="/browse" className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const waCleanPhone = owner.whatsapp ? owner.whatsapp.replace(/[^0-9]/g, '') : '';
  const waUrl = waCleanPhone ? `https://wa.me/${waCleanPhone}?text=${encodeURIComponent(`Hello ${owner.name}, I am reaching out regarding your rental listings on RentHub.`)}` : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link to="/browse" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Browse</span>
      </Link>

      {/* Owner Header Card */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <img
            src={
              owner.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                owner.name || 'Owner'
              )}&background=10b981&color=fff`
            }
            alt={owner.name}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-emerald-500/20 shadow-md"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{owner.name}</h1>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Owner
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{owner.city}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Member since {formatDate(owner.memberSince)}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Contact buttons if owner enabled */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {owner.whatsappEnabled && waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          )}

          {owner.phoneEnabled && owner.phone && (
            <a
              href={`tel:${owner.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              <Phone className="w-4 h-4 text-slate-600" />
              <span>Call Owner</span>
            </a>
          )}

          {owner.emailEnabled && owner.email && (
            <a
              href={`mailto:${owner.email}?subject=Question regarding your RentHub listings`}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              <Mail className="w-4 h-4 text-slate-600" />
              <span>Email</span>
            </a>
          )}
        </div>
      </div>

      {/* Owner's Products Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Active Listings by {owner.name} ({products.length})</span>
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            <p>This user currently has no active rental listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerProfilePage;

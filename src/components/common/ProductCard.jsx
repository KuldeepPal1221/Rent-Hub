import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, Shield, Eye } from 'lucide-react';
import { formatCurrency, formatPeriod, getConditionBadge } from '../../utils/formatters.js';
import { favoriteService } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';

export const ProductCard = ({ product, onFavoriteToggle }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(!!product.is_favorite);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  const conditionInfo = getConditionBadge(product.condition);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to save items to your favorites.');
      navigate('/login');
      return;
    }

    if (isTogglingFav) return;

    try {
      setIsTogglingFav(true);
      const nextState = !isFavorite;
      setIsFavorite(nextState);

      const res = await favoriteService.toggle(product.id);
      setIsFavorite(res.is_favorite);
      toast.success(res.message);

      if (onFavoriteToggle) {
        onFavoriteToggle(product.id, res.is_favorite);
      }
    } catch (err) {
      setIsFavorite(!isFavorite); // revert on error
      toast.error(err.message || 'Failed to update favorite.');
    } finally {
      setIsTogglingFav(false);
    }
  };

  const imageSrc =
    product.primary_image ||
    (product.images && product.images[0]) ||
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 shadow-sm hover:shadow-card transition-all duration-300 overflow-hidden">
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 block">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-xs backdrop-blur-md ${conditionInfo.bg}`}>
            {product.condition}
          </span>
          {product.availability_status === 'inactive' && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-800/90 text-white backdrop-blur-md">
              Draft
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isTogglingFav}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500 shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Price Tag Overlay on Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl flex items-baseline gap-1 shadow-md">
            <span className="text-base font-black text-emerald-400">
              {formatCurrency(product.rental_price)}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {formatPeriod(product.price_period)}
            </span>
          </div>
        </div>
      </Link>

      {/* Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Location */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md truncate max-w-[140px]">
              {product.category_name || 'General'}
            </span>
            <span className="flex items-center gap-1 text-slate-500 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[110px]">{product.city || 'Local'}</span>
            </span>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product.id}`} className="block group/title">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover/title:text-emerald-600 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Footer: Owner snippet & Details Link */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img
              src={
                product.owner_image ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  product.owner_name || 'Owner'
                )}&background=10b981&color=fff`
              }
              alt={product.owner_name}
              className="w-6 h-6 rounded-full object-cover border border-slate-200"
            />
            <span className="font-medium text-slate-700 truncate max-w-[90px]">
              {product.owner_name}
            </span>
          </div>

          <Link
            to={`/products/${product.id}`}
            className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Details</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

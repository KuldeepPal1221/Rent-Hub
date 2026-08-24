import React, { useState } from 'react';
import { X, Calendar, MessageSquare, User, Mail, Phone, DollarSign, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatPeriod } from '../../utils/formatters.js';
import { inquiryService } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';

export const InquiryModal = ({ isOpen, onClose, product, onInquirySent }) => {
  const { user } = useAuth();
  const toast = useToast();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const fourDaysLater = new Date();
  fourDaysLater.setDate(fourDaysLater.getDate() + 4);
  const fourDaysLaterStr = fourDaysLater.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [endDate, setEndDate] = useState(fourDaysLaterStr);
  const [message, setMessage] = useState(
    `Hello, I would like to rent your "${product?.name}" from ${tomorrowStr} to ${fourDaysLaterStr}. Is it currently available for pickup?`
  );
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !product) return null;

  // Calculate rental duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Estimate cost based on period
  let estimatedCost = 0;
  if (product.price_period === 'month') {
    estimatedCost = (product.rental_price / 30) * totalDays;
  } else if (product.price_period === 'week') {
    estimatedCost = (product.rental_price / 7) * totalDays;
  } else {
    estimatedCost = product.rental_price * totalDays;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error('Please select both rental start and end dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Rental end date must be after start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await inquiryService.create({
        product_id: product.id,
        rental_start_date: startDate,
        rental_end_date: endDate,
        renter_phone: phone,
        message
      });

      setIsSuccess(true);
      toast.success('Inquiry submitted to product owner!');
      if (onInquirySent) onInquirySent();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Failed to submit inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Request Rental Inquiry</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Inquiry Sent!</h4>
            <p className="text-sm text-slate-500 max-w-xs">
              The owner has received your request. You can check updates in your Dashboard under Inquiries.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Product Summary */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
              <img
                src={product.primary_image || (product.images && product.images[0])}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-700">{product.category_name}</p>
                <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                <p className="text-xs text-slate-500">
                  {formatCurrency(product.rental_price)} {formatPeriod(product.price_period)}
                </p>
              </div>
            </div>

            {/* Dates Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Estimated Duration & Cost Card */}
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs">
              <div>
                <span className="text-slate-500">Duration:</span>{' '}
                <strong className="text-slate-900">{totalDays} day{totalDays > 1 ? 's' : ''}</strong>
              </div>
              <div>
                <span className="text-slate-500">Est. Rental:</span>{' '}
                <strong className="text-base text-emerald-700 font-black">{formatCurrency(estimatedCost)}</strong>
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Contact Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                required
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Message to Owner */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message to Owner
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your rental needs, preferred pickup time, or ask questions..."
                className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Security Deposit Note */}
            {product.security_deposit > 0 && (
              <p className="text-[11px] text-slate-500">
                ℹ️ Note: This listing specifies a refundable security deposit of{' '}
                <strong>{formatCurrency(product.security_deposit)}</strong> to be handed during pickup.
              </p>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Rental Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InquiryModal;

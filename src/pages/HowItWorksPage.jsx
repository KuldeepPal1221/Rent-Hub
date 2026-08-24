import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageCircle, CheckCircle2, ShieldCheck, DollarSign, Sparkles, HelpCircle, ArrowRight, Package } from 'lucide-react';

export const HowItWorksPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Guide to RentHub
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          How Our Peer-to-Peer Rental Platform Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Everything you need to know about renting gear from verified neighbors or earning money from your unused equipment.
        </p>
      </div>

      {/* 2 Main Columns: Renter vs Owner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Renting Guide */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">
            <Search className="w-4 h-4" />
            <span>For Renters</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">How to Rent Items</h2>

          <div className="space-y-6 text-sm text-slate-600">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Browse & Compare Locally</h3>
                <p className="text-xs sm:text-sm mt-1 text-slate-500">
                  Search by item type, condition, city, or price. Compare daily, weekly, and monthly rates.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Connect via WhatsApp, Call or Inquiry</h3>
                <p className="text-xs sm:text-sm mt-1 text-slate-500">
                  Click the WhatsApp or Call button to reach out directly, or submit a formal rental inquiry with your desired dates.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pick Up & Inspect Together</h3>
                <p className="text-xs sm:text-sm mt-1 text-slate-500">
                  Meet the owner, inspect the item together, test its functionality, and hand over the optional refundable deposit.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">4</div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Return & Get Deposit Back</h3>
                <p className="text-xs sm:text-sm mt-1 text-slate-500">
                  Return the product on time and in good condition to receive your full deposit back.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/browse"
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-colors"
          >
            <span>Explore Items for Rent</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Listing Guide */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold border border-teal-200">
            <DollarSign className="w-4 h-4" />
            <span>For Item Owners</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">How to Rent Out Items</h2>

          <div className="space-y-6 text-sm text-slate-600">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create Listing with Photos</h3>
                <p className="text-xs sm:text-sm mt-1 text-slate-500">
                  Snap clear photos of your steam press, drill, DSLR, or camping gear. Enter your rental price and location.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Set Your Privacy Controls</h3>
                <p className="text-xs sm:text-sm mt-1 text-slate-500">
                  Choose whether you want WhatsApp chats, phone calls, or only in-app structured inquiries.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Accept Inquiries in Dashboard</h3>
                <p className="text-xs sm:text-sm mt-1 text-slate-500">
                  Review dates and messages in your dashboard. Accept or decline requests with 1 click.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">4</div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Collect Cash & Earn Repeatedly</h3>
                <p className="text-xs sm:text-sm mt-1 text-slate-500">
                  Hand over the item, collect your rental fees, and earn recurring passive income from gear you already own.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/add-product"
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-colors"
          >
            <span>List a Product Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200/80 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900">What if an item is damaged or returned late?</h3>
            <p className="text-slate-500 leading-relaxed">
              We recommend specifying an optional refundable security deposit on high-value items. Test and photograph all items together during handover.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900">Can I hide my phone number from public view?</h3>
            <p className="text-slate-500 leading-relaxed">
              Yes! In your Dashboard Settings, you have complete privacy controls to toggle off Phone or WhatsApp contact anytime.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900">Is there any fee to list a product?</h3>
            <p className="text-slate-500 leading-relaxed">
              Listing your products on RentHub is 100% free with no monthly subscription costs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900">Can I rent and list using the same account?</h3>
            <p className="text-slate-500 leading-relaxed">
              Yes! Every RentHub account has dual capability to both list items as an owner and contact other owners to rent gear.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;

import React from 'react';
import { Layers, ShieldCheck, Heart, Users, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
          <Layers className="w-4 h-4" />
          <span>About RentHub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Empowering Communities to Share More & Waste Less
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          RentHub was created to bridge the gap between people who own specialized gear and neighbors who only need items for a weekend or a single DIY project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Community Driven</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Every product is owned and listed by real people in your city, strengthening local ties.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Sustainability First</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Sharing one lawnmower or camera between 10 families prevents tonnes of manufacturing emissions and e-waste.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Privacy & Control</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            We put owners in complete control of their phone numbers, email addresses, and availability schedules.
          </p>
        </div>
      </div>

      <div className="bg-emerald-900 text-white p-8 sm:p-12 rounded-3xl text-center space-y-4">
        <h2 className="text-2xl font-bold">Have questions or want to partner with us?</h2>
        <p className="text-xs sm:text-sm text-emerald-200 max-w-md mx-auto">
          We'd love to hear from you. Contact our team anytime at support@renthub.local.
        </p>
        <Link
          to="/register"
          className="inline-block px-6 py-3 bg-white text-emerald-900 font-bold text-xs sm:text-sm rounded-xl shadow hover:bg-emerald-50 transition-colors"
        >
          Join RentHub Community
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;

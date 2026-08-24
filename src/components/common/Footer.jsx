import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Heart, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Rent<span className="text-emerald-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The smart, trusted peer-to-peer rental marketplace. Rent tools, electronics, camping gear, appliances, and party equipment directly from verified locals in your community.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-3 py-2 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Community & Privacy First</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/browse" className="hover:text-emerald-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/browse?category=home-appliances" className="hover:text-emerald-400 transition-colors">
                  Home Appliances
                </Link>
              </li>
              <li>
                <Link to="/browse?category=tools" className="hover:text-emerald-400 transition-colors">
                  Power Tools & DIY
                </Link>
              </li>
              <li>
                <Link to="/browse?category=cameras" className="hover:text-emerald-400 transition-colors">
                  Cameras & Video
                </Link>
              </li>
              <li>
                <Link to="/browse?category=sports-equipment" className="hover:text-emerald-400 transition-colors">
                  Camping & Sports
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/add-product" className="hover:text-emerald-400 transition-colors">
                  Rent Out an Item
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Support / Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Contact & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@renthub.local</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+1 (800) 555-RENT</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Available Nationwide</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-10 border-slate-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RentHub Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Rental Agreement Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

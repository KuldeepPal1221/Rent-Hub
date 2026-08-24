import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from './Toast.jsx';
import {
  Layers,
  Search,
  PlusCircle,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  Inbox,
  Settings,
  Menu,
  X,
  ChevronDown,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    toast.info('You have been logged out.');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-emerald-600 font-semibold'
        : 'text-slate-600 hover:text-emerald-600'
    }`;

  // STRICT ADMIN CHECK
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Rent<span className="text-emerald-600">Hub</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200/60">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/browse" className={navLinkClass}>
              Browse Products
            </NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>
              How It Works
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Add Product Button */}
            <Link
              to={isAuthenticated ? "/add-product" : "/login?redirect=/add-product"}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Rent Out Item</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-1">
                {/* Favorites shortcut */}
                <Link
                  to="/dashboard?tab=favorites"
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Favorites"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* User Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <img
                      src={
                        user?.profile_image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.full_name || 'User'
                        )}&background=10b981&color=fff`
                      }
                      alt={user?.full_name}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/30"
                    />
                    <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                      {user?.full_name}
                    </span>
                    {isAdmin && (
                      <span className="text-[9px] uppercase font-extrabold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-float border border-slate-100 py-2 z-50 animate-fade-in divide-y divide-slate-100">
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                            Signed in as
                          </p>
                          {isAdmin && (
                            <span className="text-[10px] uppercase font-black bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                              Master Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user?.full_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        {/* ONLY SHOWN TO ADMIN */}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4 text-rose-600" />
                            <span>Admin Portal</span>
                          </Link>
                        )}

                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>Dashboard & Stats</span>
                        </Link>
                        <Link
                          to="/dashboard?tab=my-products"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>My Listed Products</span>
                        </Link>
                        <Link
                          to="/dashboard?tab=inquiries"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <Inbox className="w-4 h-4 text-slate-400" />
                          <span>Rental Inquiries</span>
                        </Link>
                        <Link
                          to="/dashboard?tab=favorites"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          <span>Saved Favorites</span>
                        </Link>
                        <Link
                          to={`/owner/${user?.id}`}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Public Profile</span>
                        </Link>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard?tab=profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Settings & Privacy</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
              <img
                src={
                  user?.profile_image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.full_name || 'User'
                  )}&background=10b981&color=fff`
                }
                alt={user?.full_name}
                className="w-10 h-10 rounded-full object-cover border border-emerald-500"
              />
              <div className="truncate">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-1">
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-base font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/browse"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-base font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              Browse Products
            </NavLink>
            <NavLink
              to="/how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-base font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              How It Works
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-base font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              About
            </NavLink>

            {isAuthenticated && (
              <>
                <hr className="my-2 border-slate-100" />
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-base font-bold text-rose-700 bg-rose-50 flex items-center gap-2.5"
                  >
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span>Admin Portal</span>
                  </NavLink>
                )}
                <NavLink
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/dashboard?tab=my-products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Package className="w-5 h-5 text-emerald-600" />
                  <span>My Products</span>
                </NavLink>
                <NavLink
                  to="/dashboard?tab=inquiries"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Inbox className="w-5 h-5 text-emerald-600" />
                  <span>Rental Inquiries</span>
                </NavLink>
                <NavLink
                  to="/dashboard?tab=favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span>Favorites</span>
                </NavLink>
                <NavLink
                  to="/dashboard?tab=profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Settings className="w-5 h-5 text-slate-500" />
                  <span>Settings & Privacy</span>
                </NavLink>
              </>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to={isAuthenticated ? "/add-product" : "/login?redirect=/add-product"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Rent Out Your Product</span>
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                Log Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

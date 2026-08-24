import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Inbox,
  Heart,
  User,
  PlusCircle,
  TrendingUp,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  ShieldCheck,
  Lock,
  Loader2,
  Calendar,
  Sparkles,
  ExternalLink,
  Power
} from 'lucide-react';
import { productService, inquiryService, favoriteService, userService, authService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { formatCurrency, formatPeriod, formatDate, getStatusBadge } from '../utils/formatters.js';
import ConfirmModal from '../components/common/ConfirmModal.jsx';
import ProductCard from '../components/common/ProductCard.jsx';

export const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [receivedInquiries, setReceivedInquiries] = useState([]);
  const [sentInquiries, setSentInquiries] = useState([]);
  const [inquirySubTab, setInquirySubTab] = useState('received'); // 'received' | 'sent'
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsapp_number || '');
  const [city, setCity] = useState(user?.city || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');

  // Privacy State
  const [emailContactEnabled, setEmailContactEnabled] = useState(user?.email_contact_enabled !== 0);
  const [phoneContactEnabled, setPhoneContactEnabled] = useState(user?.phone_contact_enabled !== 0);
  const [whatsappContactEnabled, setWhatsappContactEnabled] = useState(user?.whatsapp_contact_enabled !== 0);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Deletion state
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, prodRes, recInqRes, sentInqRes, favRes] = await Promise.all([
        userService.getDashboardStats(),
        productService.getMyListings(),
        inquiryService.getReceived(),
        inquiryService.getSent(),
        favoriteService.getAll()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (prodRes.success) setMyProducts(prodRes.products);
      if (recInqRes.success) setReceivedInquiries(recInqRes.inquiries);
      if (sentInqRes.success) setSentInquiries(sentInqRes.inquiries);
      if (favRes.success) setFavorites(favRes.favorites);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Toggle listing status (active / inactive)
  const handleToggleProductStatus = async (productId) => {
    try {
      const res = await productService.toggleStatus(productId);
      if (res.success) {
        setMyProducts(prev =>
          prev.map(p => (p.id === productId ? { ...p, availability_status: res.status } : p))
        );
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to toggle product status.');
    }
  };

  // Delete product confirmation
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setIsDeletingProduct(true);
      const res = await productService.delete(productToDelete.id);
      if (res.success) {
        setMyProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        toast.success('Product deleted.');
        setProductToDelete(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Update inquiry status
  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const res = await inquiryService.updateStatus(inquiryId, newStatus);
      if (res.success) {
        setReceivedInquiries(prev =>
          prev.map(inq => (inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
        );
        toast.success(`Inquiry marked as ${newStatus}.`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.updateProfile({
        full_name: fullName,
        phone,
        city,
        whatsapp_number: whatsappNumber,
        profile_image: profileImage
      });
      if (res.success) {
        updateUser(res.user);
        toast.success('Profile updated successfully.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    }
  };

  // Update privacy
  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.updatePrivacy({
        email_contact_enabled: emailContactEnabled,
        phone_contact_enabled: phoneContactEnabled,
        whatsapp_contact_enabled: whatsappContactEnabled
      });
      if (res.success) {
        updateUser(res.user);
        toast.success('Contact privacy settings updated.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update privacy settings.');
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    try {
      setIsChangingPassword(true);
      const res = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      if (res.success) {
        toast.success('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading user dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              user?.profile_image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.full_name || 'User'
              )}&background=10b981&color=fff`
            }
            alt={user?.full_name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user?.full_name}</h1>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Member
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.email} • {user?.city} • Member since {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/add-product"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            to={`/owner/${user?.id}`}
            className="p-3 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
            title="View Public Profile"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">My Listings</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalListings || myProducts.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {stats?.activeListings || 0} active now
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Inquiries Received</span>
            <Inbox className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.inquiriesReceived || receivedInquiries.length}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">
            {stats?.pendingInquiries || 0} pending action
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Inquiries Sent</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.inquiriesSent || sentInquiries.length}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">To other owners</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Items</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalFavorites || favorites.length}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">In your favorites</span>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs sm:text-sm font-bold">
        <button
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors shrink-0 ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => handleTabChange('my-products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors shrink-0 ${
            activeTab === 'my-products'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Listed Products ({myProducts.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('inquiries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors shrink-0 ${
            activeTab === 'inquiries'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Inquiries ({receivedInquiries.length + sentInquiries.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('favorites')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors shrink-0 ${
            activeTab === 'favorites'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Favorites ({favorites.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors shrink-0 ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile & Privacy Settings</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Action Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold">Manage Your Rental Inventory</h2>
              <p className="text-xs sm:text-sm text-slate-300">
                You have {myProducts.length} product(s) listed and {receivedInquiries.filter(i => i.status === 'pending').length} pending inquiry request(s).
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/add-product"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition-colors"
              >
                + Rent Out Item
              </Link>
              <button
                onClick={() => handleTabChange('inquiries')}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                View Inquiries
              </button>
            </div>
          </div>

          {/* Recent Listings Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Your Listed Products</h3>
              <button
                onClick={() => handleTabChange('my-products')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                View all ({myProducts.length})
              </button>
            </div>

            {myProducts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-3">
                <p>No products listed yet. Add your first item and start earning today.</p>
                <Link
                  to="/add-product"
                  className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  List a Product
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProducts.slice(0, 3).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MY PRODUCTS TAB */}
      {activeTab === 'my-products' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">My Listed Products</h2>
            <Link
              to="/add-product"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Listing</span>
            </Link>
          </div>

          {myProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-slate-900">No products listed yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Start renting out your iron machine, tools, camera, camping gear, or appliances.
                </p>
              </div>
              <Link
                to="/add-product"
                className="inline-block px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              {myProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={prod.primary_image || (prod.images && prod.images[0])}
                      alt={prod.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {prod.category_name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            prod.availability_status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {prod.availability_status === 'available' ? 'Active' : 'Inactive / Paused'}
                        </span>
                      </div>
                      <Link to={`/products/${prod.id}`} className="hover:underline">
                        <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                          {prod.name}
                        </h4>
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <strong className="text-slate-900 font-black">{formatCurrency(prod.rental_price)}</strong> {formatPeriod(prod.price_period)} • {prod.inquiry_count || 0} inquiry(s) • {prod.views_count || 0} views
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleToggleProductStatus(prod.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                        prod.availability_status === 'available'
                          ? 'text-slate-700 bg-white border-slate-300 hover:bg-slate-100'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      {prod.availability_status === 'available' ? 'Pause Listing' : 'Make Active'}
                    </button>

                    <Link
                      to={`/edit-product/${prod.id}`}
                      className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setProductToDelete(prod)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. INQUIRIES TAB */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Rental Inquiries</h2>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setInquirySubTab('received')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  inquirySubTab === 'received' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Received ({receivedInquiries.length})
              </button>
              <button
                onClick={() => setInquirySubTab('sent')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  inquirySubTab === 'sent' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Sent by Me ({sentInquiries.length})
              </button>
            </div>
          </div>

          {/* Subtab 1: Received Inquiries */}
          {inquirySubTab === 'received' && (
            <div className="space-y-4">
              {receivedInquiries.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p>No rental inquiries received yet. When renters contact you, their requests will appear here.</p>
                </div>
              ) : (
                receivedInquiries.map((inq) => {
                  const statusInfo = getStatusBadge(inq.status);
                  return (
                    <div
                      key={inq.id}
                      className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={inq.product_image || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=300&q=80'}
                            alt={inq.product_name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <Link to={`/products/${inq.product_id}`} className="font-bold text-slate-900 text-sm hover:underline">
                              {inq.product_name}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {formatCurrency(inq.rental_price)} {formatPeriod(inq.price_period)}
                            </p>
                          </div>
                        </div>

                        <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border w-fit ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Renter details & dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block font-semibold">Renter Name & Contact:</span>
                          <strong className="text-slate-900 block mt-0.5">{inq.renter_name}</strong>
                          <span className="text-slate-500 block">{inq.renter_email}</span>
                          {inq.renter_phone && <span className="text-slate-500 block">{inq.renter_phone}</span>}
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block font-semibold">Requested Rental Dates:</span>
                          <strong className="text-slate-900 block mt-0.5">
                            {formatDate(inq.rental_start_date)} &rarr; {formatDate(inq.rental_end_date)}
                          </strong>
                          <span className="text-slate-400 block text-[11px] mt-0.5">
                            Submitted {formatDate(inq.created_at)}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl sm:col-span-1">
                          <span className="text-slate-400 block font-semibold">Renter Message:</span>
                          <p className="text-slate-700 italic mt-0.5 line-clamp-3">"{inq.message}"</p>
                        </div>
                      </div>

                      {/* Owner Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          {inq.renter_phone && (
                            <a
                              href={`https://wa.me/${inq.renter_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hi ${inq.renter_name}, regarding your rental inquiry for ${inq.product_name}...`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp Renter</span>
                            </a>
                          )}
                          <a
                            href={`mailto:${inq.renter_email}?subject=Rental inquiry for ${inq.product_name}`}
                            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </a>
                        </div>

                        {/* Status change controls */}
                        <div className="flex items-center gap-2">
                          {inq.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateInquiryStatus(inq.id, 'accepted')}
                                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                              >
                                Accept Inquiry
                              </button>
                              <button
                                onClick={() => handleUpdateInquiryStatus(inq.id, 'rejected')}
                                className="px-4 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {inq.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'completed')}
                              className="px-4 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                            >
                              Mark Rental Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Subtab 2: Sent Inquiries */}
          {inquirySubTab === 'sent' && (
            <div className="space-y-4">
              {sentInquiries.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p>You have not sent any rental inquiries yet.</p>
                  <Link to="/browse" className="inline-block mt-3 px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl">
                    Browse Products to Rent
                  </Link>
                </div>
              ) : (
                sentInquiries.map((inq) => {
                  const statusInfo = getStatusBadge(inq.status);
                  return (
                    <div
                      key={inq.id}
                      className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={inq.product_image || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=300&q=80'}
                            alt={inq.product_name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <Link to={`/products/${inq.product_id}`} className="font-bold text-slate-900 text-sm hover:underline">
                              {inq.product_name}
                            </Link>
                            <p className="text-xs text-slate-500">Owner: {inq.owner_name}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-600 gap-2">
                        <div>
                          <span>Requested Dates: </span>
                          <strong>{formatDate(inq.rental_start_date)} &rarr; {formatDate(inq.rental_end_date)}</strong>
                        </div>
                        <div>
                          <span>Submitted: {formatDate(inq.created_at)}</span>
                        </div>
                      </div>

                      {inq.message && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl">
                          "{inq.message}"
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-xl font-black text-slate-900">Your Saved Favorites</h2>
          {favorites.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <p>You haven't saved any products to your favorites yet.</p>
              <Link to="/browse" className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl">
                Explore Items to Save
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onFavoriteToggle={(prodId, isFav) => {
                    if (!isFav) {
                      setFavorites(prev => prev.filter(f => f.id !== prodId));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. PROFILE & PRIVACY SETTINGS TAB */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Profile Edit Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Public Profile Details</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Region *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number (Optional)</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Defaults to phone number if empty"
                  className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Privacy Controls & Password Form */}
          <div className="space-y-8">
            {/* Privacy Switches */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Contact Privacy Settings</span>
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                Control which direct contact methods other renters see on your listings.
              </p>

              <form onSubmit={handlePrivacySubmit} className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Allow Direct WhatsApp Contact</span>
                    <span className="text-[11px] text-slate-400 block">Show WhatsApp chat button on your product pages</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappContactEnabled}
                    onChange={(e) => setWhatsappContactEnabled(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Allow Phone Calls</span>
                    <span className="text-[11px] text-slate-400 block">Show Call button with your number on listings</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={phoneContactEnabled}
                    onChange={(e) => setPhoneContactEnabled(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Allow Email Contact</span>
                    <span className="text-[11px] text-slate-400 block">Allow renters to send email inquiries directly</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailContactEnabled}
                    onChange={(e) => setEmailContactEnabled(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  Update Privacy Preferences
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Change Password</span>
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors disabled:opacity-50"
                >
                  {isChangingPassword ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirm Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Rental Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? All associated inquiries and favorites will also be removed.`}
        confirmText="Delete Listing"
        isLoading={isDeletingProduct}
      />
    </div>
  );
};

export default DashboardPage;

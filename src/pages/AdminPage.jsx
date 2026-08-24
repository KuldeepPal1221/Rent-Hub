import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Package,
  Inbox,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Shield,
  Loader2,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { adminService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { formatCurrency, formatPeriod, formatDate } from '../utils/formatters.js';
import ConfirmModal from '../components/common/ConfirmModal.jsx';

export const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'products' | 'inquiries'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal actions
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'user'|'product', item: obj }
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, usersRes, prodsRes, inqsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getProducts(),
        adminService.getInquiries()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (prodsRes.success) setProducts(prodsRes.products);
      if (inqsRes.success) setInquiries(inqsRes.inquiries);
    } catch (err) {
      toast.error(err.message || 'Access denied or admin data load error.');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    const newStatus = targetUser.account_status === 'active' ? 'suspended' : 'active';
    try {
      const res = await adminService.updateUserStatus(targetUser.id, newStatus);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, account_status: newStatus } : u));
        toast.success(`User ${targetUser.full_name} is now ${newStatus}.`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user status.');
    }
  };

  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminService.updateUserRole(targetUser.id, newRole);
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
        toast.success(`Role updated to ${newRole}.`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update role.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      if (itemToDelete.type === 'user') {
        const res = await adminService.deleteUser(itemToDelete.item.id);
        if (res.success) {
          setUsers(prev => prev.filter(u => u.id !== itemToDelete.item.id));
          toast.success('User and associated data permanently deleted.');
        }
      } else if (itemToDelete.type === 'product') {
        const res = await adminService.deleteProduct(itemToDelete.item.id);
        if (res.success) {
          setProducts(prev => prev.filter(p => p.id !== itemToDelete.item.id));
          toast.success('Product listing deleted by admin.');
        }
      }
      setItemToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Deletion failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading Administrator Portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link to="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Platform Admin Portal
              </h1>
              <p className="text-xs text-slate-500">
                Manage user accounts, moderate rental listings, and monitor platform health.
              </p>
            </div>
          </div>
        </div>

        {/* Global Admin Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users or items..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalUsers || users.length}</div>
          <span className="text-[11px] text-slate-500">Registered platform accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalProducts || products.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{stats?.activeProducts || 0} active in marketplace</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Inquiries</span>
            <Inbox className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalInquiries || inquiries.length}</div>
          <span className="text-[11px] text-slate-500">Rental requests processed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Bookmarks</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalFavorites || 0}</div>
          <span className="text-[11px] text-slate-500">User saved items</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
            activeTab === 'users' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({filteredUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
            activeTab === 'products' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>All Products ({filteredProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
            activeTab === 'inquiries' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Inquiry Log ({inquiries.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS TABLE */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Listings</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=10b981&color=fff`}
                          alt={u.full_name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.full_name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span>{u.phone}</span>
                    </td>

                    <td className="px-4 py-4">
                      <span>{u.city}</span>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        u.account_status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.account_status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-900">{u.listings_count || 0}</span> items
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Suspend / Activate */}
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                            u.account_status === 'active'
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {u.account_status === 'active' ? 'Suspend' : 'Activate'}
                        </button>

                        {/* Toggle Admin Role */}
                        <button
                          onClick={() => handleToggleUserRole(u)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                        </button>

                        {/* Delete User */}
                        {u.id !== user?.id && (
                          <button
                            onClick={() => setItemToDelete({ type: 'user', item: u })}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS TABLE */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Owner</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primary_image || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=300&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <Link to={`/products/${p.id}`} className="font-bold text-slate-900 hover:underline max-w-xs truncate block">
                          {p.name}
                        </Link>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-semibold text-emerald-700">
                      {p.category_name}
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-900 block">{p.owner_name}</span>
                      <span className="text-[11px] text-slate-400">{p.owner_email}</span>
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-900">
                      {formatCurrency(p.rental_price)} {formatPeriod(p.price_period)}
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        p.availability_status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.availability_status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setItemToDelete({ type: 'product', item: p })}
                        className="px-3 py-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INQUIRIES LOG */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Owner</th>
                  <th className="px-4 py-3.5">Renter</th>
                  <th className="px-4 py-3.5">Dates</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <Link to={`/products/${inq.product_id}`} className="hover:underline">
                        {inq.product_name}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{inq.owner_name}</td>
                    <td className="px-4 py-4">{inq.renter_name}</td>
                    <td className="px-4 py-4">
                      {formatDate(inq.rental_start_date)} &rarr; {formatDate(inq.rental_end_date)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 font-bold rounded-md capitalize">
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(inq.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={itemToDelete?.type === 'user' ? 'Delete User Account' : 'Delete Product Listing'}
        message={
          itemToDelete?.type === 'user'
            ? `Are you sure you want to permanently delete user "${itemToDelete?.item.full_name}"? All their listed products, favorites, and inquiries will also be wiped.`
            : `Are you sure you want to delete listing "${itemToDelete?.item.name}"?`
        }
        confirmText="Delete Permanently"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminPage;

// Currency formatter
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
};

// Period label formatter
export const formatPeriod = (period) => {
  switch (period) {
    case 'week':
      return '/week';
    case 'month':
      return '/month';
    case 'day':
    default:
      return '/day';
  }
};

// Date formatter
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

// Relative time formatter (e.g. "2 days ago")
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 30) return formatDate(dateString);
    if (diffDay > 1) return `${diffDay} days ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffHour >= 1) return `${diffHour}h ago`;
    if (diffMin >= 1) return `${diffMin}m ago`;
    return 'Just now';
  } catch {
    return dateString;
  }
};

// Condition badge colors
export const getConditionBadge = (condition) => {
  switch (condition) {
    case 'Brand New':
      return { label: 'Brand New', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'Like New':
      return { label: 'Like New', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'Good':
      return { label: 'Good', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'Fair':
      return { label: 'Fair', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    default:
      return { label: condition || 'Good', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
};

// Status badge colors
export const getStatusBadge = (status) => {
  switch (status) {
    case 'available':
      return { label: 'Available', bg: 'bg-emerald-500 text-white' };
    case 'rented':
      return { label: 'Rented Out', bg: 'bg-amber-500 text-white' };
    case 'inactive':
      return { label: 'Inactive / Draft', bg: 'bg-slate-400 text-white' };
    case 'pending':
      return { label: 'Pending', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'accepted':
      return { label: 'Accepted', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'rejected':
      return { label: 'Declined', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'completed':
      return { label: 'Completed', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
};

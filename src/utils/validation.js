export const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Allows +1 555-0192, 555-1234, 1234567890 etc.
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Too short', color: 'bg-slate-200' };
  
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', width: '25%' };
  if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', width: '50%' };
  if (score === 4) return { score: 3, label: 'Good', color: 'bg-teal-500', width: '75%' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-600', width: '100%' };
};

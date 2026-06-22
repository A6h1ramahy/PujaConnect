/**
 * Frontend validation helpers.
 * These are UX-only guards — never rely on these alone.
 * Backend (express-validator) is the authoritative layer.
 */

/** Email: basic RFC-compatible format check */
export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

/**
 * Password strength:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one digit
 */
export const validatePassword = (pw) => {
  if (!pw) return 'Password is required';
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number';
  return null;
};

/** Date: must be a valid date string and must be today or in the future */
export const validateFutureDate = (date) => {
  if (!date) return 'Date is required';
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return 'Please enter a valid date';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed < today) return 'Date must be today or in the future';
  return null;
};

/** Time: must be non-empty */
export const validateTime = (time) => {
  if (!time || !time.trim()) return 'Time is required';
  return null;
};

/**
 * Full booking form validation.
 * Returns an object keyed by field name, with error strings as values.
 * An empty object means the form is valid.
 */
export const validateBookingForm = ({ ritualId, date, time, locationType, address }) => {
  const errors = {};

  if (!ritualId) errors.ritualId = 'Please select a ritual';

  const dateErr = validateFutureDate(date);
  if (dateErr) errors.date = dateErr;

  const timeErr = validateTime(time);
  if (timeErr) errors.time = timeErr;

  if (locationType === 'Home' && (!address || !address.trim())) {
    errors.address = 'Address is required for home ceremonies';
  }

  return errors;
};

/** Registration form validation — returns first error string or null */
export const validateRegisterForm = (form) => {
  const { name, email, password, confirmPassword, role, phone, city, region } = form;
  if (!name || !name.trim()) return 'Full name is required';
  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;
  const pwErr = validatePassword(password);
  if (pwErr) return pwErr;
  if (password !== confirmPassword) return 'Passwords do not match';

  // Phone validation
  if (!phone || !phone.trim()) return 'Phone number is required.';
  if (!/^[0-9]+$/.test(phone) || phone.length < 10 || phone.length > 15) {
    return 'Please enter a valid phone number.';
  }

  // City validation
  if (!city || !city.trim()) return 'City is required.';
  if (city.trim().length < 2) return 'City is required.';

  if (role === 'pandit') {
    if (!region || !region.trim()) return 'State / Region is required';
    if (region.trim().length < 2) return 'State / Region is required';
  }
  return null;
};

/** Login form validation — returns first error string or null */
export const validateLoginForm = ({ email, password }) => {
  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;
  if (!password) return 'Password is required';
  return null;
};

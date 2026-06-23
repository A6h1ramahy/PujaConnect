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

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const ampm = match12[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }
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
export const validateBookingForm = ({ ritualId, date, time, location, address, templeDetails }) => {
  const errors = {};

  if (!ritualId) errors.ritualId = 'Please select a ritual';

  const dateErr = validateFutureDate(date);
  if (dateErr) {
    errors.date = dateErr;
  } else if (date) {
    const timeErr = validateTime(time);
    if (timeErr) {
      errors.time = timeErr;
    } else {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localToday = new Date(now.getTime() - (offset * 60 * 1000));
      const todayStr = localToday.toISOString().slice(0, 10);
      const bookingDateStr = typeof date === 'string' ? date.slice(0, 10) : new Date(date).toISOString().slice(0, 10);

      if (bookingDateStr === todayStr) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const selectedMinutes = parseTimeToMinutes(time);
        if (selectedMinutes !== null && selectedMinutes < currentMinutes + 60) {
          errors.time = 'This booking time is no longer available. Please choose a later time.';
        }
      }
    }
  }

  if (location === 'Home') {
    if (!address) {
      errors.address = 'Address is required.';
    } else {
      if (!address.houseNumber || !address.houseNumber.trim()) errors.houseNumber = 'House / Flat Number is required.';
      if (!address.street || !address.street.trim()) errors.street = 'Street / Area is required.';
      if (!address.city || !address.city.trim()) errors.city = 'City is required.';
      if (!address.state || !address.state.trim()) errors.state = 'State / Region is required.';
      if (!address.pincode || !address.pincode.trim()) {
        errors.pincode = 'Pincode is required.';
      } else if (!/^[0-9]{6}$/.test(address.pincode)) {
        errors.pincode = 'Pincode must be exactly 6 digits.';
      }
    }
  } else if (location === 'Temple') {
    if (!templeDetails) {
      errors.templeDetails = 'Temple details are required.';
    } else {
      if (!templeDetails.templeName || !templeDetails.templeName.trim()) errors.templeName = 'Temple Name is required.';
      if (!templeDetails.templeAddress || !templeDetails.templeAddress.trim()) errors.templeAddress = 'Temple Address is required.';
      if (!templeDetails.city || !templeDetails.city.trim()) errors.city = 'City is required.';
      if (!templeDetails.state || !templeDetails.state.trim()) errors.state = 'State / Region is required.';
      if (!templeDetails.pincode || !templeDetails.pincode.trim()) {
        errors.pincode = 'Pincode is required.';
      } else if (!/^[0-9]{6}$/.test(templeDetails.pincode)) {
        errors.pincode = 'Pincode must be exactly 6 digits.';
      }
      if (!templeDetails.locality || !templeDetails.locality.trim()) errors.locality = 'Temple Area / Locality is required.';
    }
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

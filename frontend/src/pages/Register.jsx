import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiEye, HiEyeOff } from 'react-icons/hi';
import { HiLocationMarker } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { validateRegisterForm } from '../utils/validators';
import PageTransition from '../components/common/PageTransition';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const defaultRole = searchParams.get('role') === 'pandit' ? 'pandit' : 'user';

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: defaultRole, phone: '', city: '', region: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateRegisterForm(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      toast.success(`Welcome to PujaConnect, ${user.name}! 🙏`);
      const redirect =
        user.role === 'pandit' ? '/pandit/dashboard' :
        user.role === 'admin'  ? '/admin/dashboard'  :
        '/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4 py-12 transition-colors duration-300">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-saffron-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl" />
        </div>

        <div className="w-full max-w-lg relative animate-slide-up">
          <div className="card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-saffron-gradient flex items-center justify-center shadow-glow-saffron">
                  <MdOutlineTempleHindu className="text-white text-2xl" />
                </div>
                <span className="text-2xl font-display font-bold text-gradient">PujaConnect</span>
              </Link>
              <h1 className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100">Create Account</h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Join PujaConnect today</p>
            </div>

            {/* Role Toggle */}
            <div id="role-toggle" className="flex rounded-xl overflow-hidden border border-light-border dark:border-dark-border mb-6">
              {['user', 'pandit'].map((r) => (
                <button
                  key={r}
                  type="button"
                  id={`role-${r}`}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                    form.role === r
                      ? 'bg-saffron-gradient text-white'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {r === 'user' ? '🙏 Register as User' : '🛕 Register as Pandit'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} id="register-form" className="space-y-4">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="reg-name" className="label">Full Name</label>
                <div className="relative">
                  <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
                  <input id="reg-name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input-field pl-11" />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="reg-email" className="label">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
                  <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field pl-11" autoComplete="email" />
                </div>
              </div>

              {/* Phone + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-group">
                  <label htmlFor="reg-phone" className="label">
                    {form.role === 'pandit' ? 'Phone Number *' : 'Phone (optional)'}
                  </label>
                  <div className="relative">
                    <HiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
                    <input
                      id="reg-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={form.role === 'pandit' ? '9876543210' : '9876543210'}
                      className="input-field pl-11"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-city" className="label">
                    {form.role === 'pandit' ? 'City *' : 'City (optional)'}
                  </label>
                  <div className="relative">
                    <HiLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
                    <input
                      id="reg-city"
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Bengaluru"
                      className="input-field pl-11"
                    />
                  </div>
                </div>
              </div>

              {/* State / Region (only for Pandit) */}
              {form.role === 'pandit' && (
                <div className="form-group animate-fade-in">
                  <label htmlFor="reg-region" className="label">State / Region *</label>
                  <div className="relative">
                    <HiLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
                    <input
                      id="reg-region"
                      type="text"
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      placeholder="Enter your state or region"
                      className="input-field pl-11"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="form-group">
                <label htmlFor="reg-password" className="label">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
                  <input id="reg-password" type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters (1 uppercase, 1 digit)" className="input-field pl-11 pr-11" autoComplete="new-password" />
                  <button type="button" id="toggle-reg-pwd" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors">
                    {showPwd ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="reg-confirm-password" className="label">Confirm Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
                  <input id="reg-confirm-password" type={showPwd ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input-field pl-11" autoComplete="new-password" />
                </div>
              </div>

              {form.role === 'pandit' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                  📋 Your profile will be reviewed by our team before appearing in listings. You can set up your profile after registration.
                </div>
              )}

              <button type="submit" id="register-submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? 'Creating Account...' : 'Create Account 🙏'}
              </button>
            </form>

            <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" id="go-to-login" className="text-saffron-600 dark:text-saffron-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Register;

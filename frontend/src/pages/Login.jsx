import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/validators';
import PageTransition from '../components/common/PageTransition';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateLoginForm(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 🙏`);
      const redirect =
        user.role === 'admin'  ? '/admin/dashboard'  :
        user.role === 'pandit' ? '/pandit/dashboard' :
        from !== '/login' ? from : '/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4 transition-colors duration-300">
        {/* BG decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-saffron-500/10 dark:bg-saffron-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gold-500/10 dark:bg-gold-500/5 blur-3xl" />
        </div>

        <div className="w-full max-w-md relative animate-slide-up">
          <div className="card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-saffron-gradient flex items-center justify-center shadow-glow-saffron">
                  <MdOutlineTempleHindu className="text-white text-2xl" />
                </div>
                <span className="text-2xl font-display font-bold text-gradient">PujaConnect</span>
              </Link>
              <h1 className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100">Welcome back</h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} id="login-form" className="space-y-4">
              {/* Email */}
              <div className="form-group">
                <label htmlFor="login-email" className="label">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 text-lg" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input-field pl-11"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="login-password" className="label">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 text-lg" />
                  <input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-field pl-11 pr-11"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  >
                    {showPwd ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="login-submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In 🙏'}
              </button>
            </form>

            <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" id="go-to-register" className="text-saffron-600 dark:text-saffron-400 font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;

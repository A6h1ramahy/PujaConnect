import React, { useState } from 'react';
import { HiEye, HiEyeOff, HiShieldCheck, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { changePassword } from '../../api';

/* ── password strength helpers ───────────────────────────────── */
const RULES = [
  { id: 'len',     label: 'At least 8 characters',          test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A–Z)',      test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter (a–z)',      test: (p) => /[a-z]/.test(p) },
  { id: 'num',     label: 'One number (0–9)',                test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$…)',   test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const getStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  const passed = RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: 20,  label: 'Very Weak', color: 'bg-red-500' };
  if (passed === 2) return { score: 40,  label: 'Weak',      color: 'bg-orange-500' };
  if (passed === 3) return { score: 60,  label: 'Fair',      color: 'bg-amber-500' };
  if (passed === 4) return { score: 80,  label: 'Strong',    color: 'bg-emerald-500' };
  return               { score: 100, label: 'Very Strong', color: 'bg-emerald-600' };
};

/* ── eye-toggle input ─────────────────────────────────────────── */
const PasswordInput = ({ id, label, value, onChange, placeholder = '' }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-field pr-11"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════ */
const ChangePasswordForm = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const strength = getStrength(form.newPassword);
  const allRulesPassed = RULES.every((r) => r.test(form.newPassword));
  const passwordsMatch = form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allRulesPassed) {
      toast.error('New password does not meet all requirements');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully 🔒');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header card */}
      <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-light-border dark:border-dark-border">
          <div className="w-10 h-10 rounded-xl bg-saffron-50 dark:bg-saffron-950/20 flex items-center justify-center shrink-0">
            <HiShieldCheck className="text-saffron-500 dark:text-saffron-400 text-xl" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">Security Settings</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Update your account password</p>
          </div>
        </div>

        <form id="change-password-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Current password */}
          <PasswordInput
            id="current-password"
            label="Current Password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            placeholder="Enter your current password"
          />

          {/* New password + strength */}
          <div className="space-y-3">
            <PasswordInput
              id="new-password"
              label="New Password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Create a strong password"
            />

            {/* Strength bar */}
            {form.newPassword && (
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Password Strength</span>
                  <span className={`text-[11px] font-bold ${
                    strength.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                    strength.score >= 60 ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-500 dark:text-red-400'
                  }`}>{strength.label}</span>
                </div>
                <div className="h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}

            {/* Requirements checklist */}
            {form.newPassword && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 animate-fade-in">
                {RULES.map((rule) => {
                  const ok = rule.test(form.newPassword);
                  return (
                    <div key={rule.id} className="flex items-center gap-1.5">
                      {ok
                        ? <HiCheckCircle className="text-emerald-500 text-sm shrink-0" />
                        : <HiXCircle    className="text-stone-300 dark:text-stone-600 text-sm shrink-0" />
                      }
                      <span className={`text-xs ${ok ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-stone-400'}`}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
            />
            {form.confirmPassword && (
              <p className={`text-xs font-medium flex items-center gap-1 animate-fade-in ${
                passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              }`}>
                {passwordsMatch
                  ? <><HiCheckCircle /> Passwords match</>
                  : <><HiXCircle /> Passwords do not match</>
                }
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-light-border dark:border-dark-border">
            <button
              type="submit"
              id="submit-change-password"
              disabled={saving || !form.currentPassword || !allRulesPassed || !passwordsMatch}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating…' : '🔒 Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Security tips */}
      <div className="card p-5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">Security Tips</h3>
        <ul className="space-y-1.5 text-xs text-blue-700 dark:text-blue-400">
          {[
            'Never share your password with anyone.',
            'Use a unique password not used on other sites.',
            'Consider using a password manager.',
            'Change your password regularly for best security.',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-1.5">
              <span className="mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChangePasswordForm;

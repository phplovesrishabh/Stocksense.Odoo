import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Package, Loader2, UserCheck } from 'lucide-react';

const ROLES = [
  { value: 'manager', label: 'Inventory Manager', description: 'Full access — manage products, approve adjustments, view all data' },
  { value: 'staff',   label: 'Warehouse Staff',   description: 'Operational access — receipts, deliveries, submit adjustments' },
];

export default function SignupPage() {
  const navigate = useNavigate();

  const [step, setStep]       = useState(1); // 1 = form, 2 = OTP verification
  const [form, setForm]       = useState({ full_name: '', email: '', password: '', confirm: '', role: 'staff' });
  const [otp,  setOtp]        = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ─── Step 1: Sign up ──────────────────────────────────── */
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!form.full_name.trim()) { toast.error('Please enter your full name.'); return; }
    if (!form.email.trim())     { toast.error('Please enter your email.');     return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return; }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email:    form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.full_name.trim(),
          role:      form.role,
        },
        emailRedirectTo: undefined, // Use OTP flow, not magic link
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Signup failed. Please try again.');
    } else if (data?.session) {
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard');
    } else {
      toast.success('Check your email for the verification code!');
      setStep(2);
    }
  };

  /* ─── Step 2: Verify OTP ───────────────────────────────── */
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { toast.error('Please enter the 6-digit code.'); return; }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: form.email.trim(),
      token: otp.trim(),
      type:  'signup',
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Invalid or expired code. Try again.');
    } else {
      toast.success('Account verified! Welcome to StockSense 🎉');
      navigate('/dashboard');
    }
  };

  /* ─── Resend OTP ───────────────────────────────────────── */
  const handleResend = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: form.email.trim() });
    setLoading(false);
    if (error) { toast.error(error.message); } else { toast.success('New code sent!'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1117] px-4 py-12">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-[#1A1D27] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {step === 1 ? 'Create your account' : 'Verify your email'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {step === 1 ? 'Join StockSense and start managing inventory' : `We sent a 6-digit code to ${form.email}`}
            </p>
          </div>

          {/* ── Step 1: Registration form ── */}
          {step === 1 && (
            <form onSubmit={handleSignup} className="space-y-4" noValidate>
              {/* Full name */}
              <div className="space-y-1.5">
                <label htmlFor="signup-name" className="block text-sm font-medium text-slate-300">Full name</label>
                <input
                  id="signup-name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Alex Johnson"
                  className="w-full rounded-lg bg-[#0F1117] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300">Email address</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="w-full rounded-lg bg-[#0F1117] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {/* Role selector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Your role</label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((r) => (
                    <label
                      key={r.value}
                      htmlFor={`role-${r.value}`}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition
                        ${form.role === r.value
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-white/10 bg-[#0F1117] hover:border-white/20'}`}
                    >
                      <input
                        id={`role-${r.value}`}
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={form.role === r.value}
                        onChange={handleChange}
                        className="mt-0.5 accent-indigo-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                          {r.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{r.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <input
                    id="signup-password"
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-lg bg-[#0F1117] border border-white/10 px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-600
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-300">Confirm password</label>
                <input
                  id="signup-confirm"
                  name="confirm"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-[#0F1117] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {/* Submit */}
              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg
                           bg-gradient-to-r from-indigo-500 to-violet-600
                           hover:from-indigo-400 hover:to-violet-500
                           disabled:opacity-60 disabled:cursor-not-allowed
                           px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25
                           transition-all duration-200 active:scale-[0.98]"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP Verification ── */}
          {step === 2 && (
            <form onSubmit={handleVerify} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="otp-input" className="block text-sm font-medium text-slate-300">
                  Verification code
                </label>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full rounded-lg bg-[#0F1117] border border-white/10 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-slate-700
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <p className="text-xs text-slate-500">
                  Code expires in 10 minutes. Check your spam folder if needed.
                </p>
              </div>

              <button
                id="otp-verify"
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 rounded-lg
                           bg-gradient-to-r from-indigo-500 to-violet-600
                           hover:from-indigo-400 hover:to-violet-500
                           disabled:opacity-40 disabled:cursor-not-allowed
                           px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25
                           transition-all duration-200 active:scale-[0.98]"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Verifying…' : 'Verify & continue'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50"
                >
                  Didn't receive it? Resend code
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

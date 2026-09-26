import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Package, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const STEPS = {
  EMAIL:    1, // User enters email → triggers OTP
  OTP:      2, // User enters the 6-digit OTP
  PASSWORD: 3, // User sets new password
  DONE:     4, // Success state
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep]         = useState(STEPS.EMAIL);
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);

  /* ─── Step 1: Request OTP ──────────────────────────────── */
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Please enter your email address.'); return; }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      // Using OTP flow — Supabase will send a 6-digit code
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Failed to send reset code.');
    } else {
      toast.success('Reset code sent! Check your email.');
      setStep(STEPS.OTP);
    }
  };

  /* ─── Step 2: Verify OTP ───────────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { toast.error('Please enter the 6-digit code.'); return; }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type:  'recovery',
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Invalid or expired code.');
    } else {
      setStep(STEPS.PASSWORD);
    }
  };

  /* ─── Step 3: Set new password ─────────────────────────── */
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { toast.error('Passwords do not match.'); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Failed to update password.');
    } else {
      setStep(STEPS.DONE);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  /* ─── Resend OTP ───────────────────────────────────────── */
  const handleResend = async () => {
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    toast.success('New code sent!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1117] px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-[#1A1D27] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reset password</h1>
            <p className="text-sm text-slate-400 mt-1">
              {step === STEPS.EMAIL    && 'Enter your email to receive a reset code'}
              {step === STEPS.OTP      && `Code sent to ${email}`}
              {step === STEPS.PASSWORD && 'Choose a strong new password'}
              {step === STEPS.DONE     && 'Password updated successfully!'}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[STEPS.EMAIL, STEPS.OTP, STEPS.PASSWORD].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= s ? 'bg-indigo-500 w-8' : 'bg-white/10 w-4'
                }`}
              />
            ))}
          </div>

          {/* ── Step 1: Email ── */}
          {step === STEPS.EMAIL && (
            <form onSubmit={handleRequestOtp} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg bg-[#0F1117] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <button
                id="reset-send-code"
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
                {loading ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="reset-otp" className="block text-sm font-medium text-slate-300">
                  6-digit code
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full rounded-lg bg-[#0F1117] border border-white/10 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-slate-700
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <p className="text-xs text-slate-500">Valid for 10 minutes.</p>
              </div>

              <button
                id="reset-verify-otp"
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
                {loading ? 'Verifying…' : 'Verify code'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep(STEPS.EMAIL)}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === STEPS.PASSWORD && (
            <form onSubmit={handleSetPassword} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-300">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-lg bg-[#0F1117] border border-white/10 px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-600
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-[#0F1117] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-slate-600
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <button
                id="reset-set-password"
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
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}

          {/* ── Step 4: Done ── */}
          {step === STEPS.DONE && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-300 text-sm">
                Your password has been updated. Redirecting to dashboard…
              </p>
            </div>
          )}

          {/* Footer */}
          {step !== STEPS.DONE && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Remember it now?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

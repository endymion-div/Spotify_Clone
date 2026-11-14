import { ArrowLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, loginWithDemoAccount, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setSubmitting(true);
    const ok = await login(email, password, remember);
    setSubmitting(false);
    if (ok) {
      navigate(from, { replace: true });
    } else {
      setError('Unable to sign in with those credentials.');
    }
  };

  const handleDemoLogin = async () => {
    await loginWithDemoAccount();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-[#0B0D11]">
      <div className="w-full max-w-md p-7 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/images/soundify-mark.svg" alt="Soundify" className="w-8 h-8 rounded-lg" />
            <span className="font-display text-lg font-bold text-zinc-900 dark:text-white">
              Soundify
            </span>
          </Link>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {isDemoMode ? 'Demo Mode' : 'Supabase Auth'}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sign in to Soundify</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Your music. Your mood. Your world.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sneha@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <span>Remember me on this device</span>
          </label>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 text-sm font-semibold transition-colors"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-200 dark:border-white/[0.08] w-full" />
          <span className="px-3 text-[11px] uppercase tracking-wider text-zinc-500 bg-white dark:bg-[#13161C]">
            or
          </span>
          <div className="border-t border-zinc-200 dark:border-white/[0.08] w-full" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-300 dark:border-white/15 hover:border-amber-500 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Continue with Demo Account</span>
        </button>

        <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
          New to Soundify?{' '}
          <Link to="/signup" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setSubmitting(true);
    const ok = await signup(name, email, password);
    setSubmitting(false);
    if (ok) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-[#0B0D11]">
      <div className="w-full max-w-md p-7 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] shadow-2xl space-y-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/images/soundify-mark.svg" alt="Soundify" className="w-8 h-8 rounded-lg" />
          <span className="font-display text-lg font-bold text-zinc-900 dark:text-white">
            Soundify
          </span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Save playlists, liked songs, and listening preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sneha Ghosh"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Email address
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sneha@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="signup-confirm" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 text-sm font-semibold transition-colors"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    const ok = await requestPasswordReset(email);
    if (ok) setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-[#0B0D11]">
      <div className="w-full max-w-md p-7 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] shadow-2xl space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Reset password</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Enter your account email and we will send password recovery instructions.
          </p>
        </div>

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-700 dark:text-emerald-300">
            Reset link prepared for <span className="font-semibold">{email}</span>. Check your inbox or return to sign in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sneha@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {error && (
              <p role="alert" className="text-xs font-medium text-rose-500">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-colors"
            >
              Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

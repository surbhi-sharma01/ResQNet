import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';

const DEMO_ACCOUNTS = [
  { label: 'Citizen', email: 'citizen@demo.crisisgrid.app' },
  { label: 'EOC Control', email: 'eoc@demo.crisisgrid.app' },
  { label: 'Rescue Team', email: 'rescue@demo.crisisgrid.app' },
];
const DEMO_PASSWORD = 'Demo@1234';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname || dashboardPathForRole(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: DEMO_PASSWORD });

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-neutral-950">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-neutral-200" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-neutral-200" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-neutral-200" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-10 sm:px-10 lg:grid-cols-[0.85fr_1fr] lg:gap-20 lg:px-16">
        <section className="mx-auto w-full max-w-lg">
          <Link to="/" aria-label="ResQNet home" className="mb-14 inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-neutral-950 bg-neutral-950 text-xl font-semibold text-white">R</span>
            <span className="text-2xl font-bold tracking-tight">ResQNet<span className="text-neutral-400">.</span></span>
          </Link>

          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Disaster response network
          </p>

          <h1 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Stronger Together in Times of Crisis
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-neutral-600">
            Connect. Coordinate. Save Lives.
          </p>

          <div className="mt-10 space-y-6 text-sm text-neutral-700">
            <div className="flex items-start gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-300 text-neutral-950">01</span>
              <div>
                <p className="font-medium text-neutral-950">Emergency response coordination</p>
                <p className="mt-1 text-neutral-500">Bring response teams and communities together.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-300 text-neutral-950">02</span>
              <div>
                <p className="font-medium text-neutral-950">Connected response network</p>
                <p className="mt-1 text-neutral-500">Support faster coordination across response roles.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-300 text-neutral-950">03</span>
              <div>
                <p className="font-medium text-neutral-950">One mission. Greater impact.</p>
                <p className="mt-1 text-neutral-500">Help communities respond when it matters most.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-neutral-200 pt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            ResQNet · Connect. Coordinate. Save Lives.
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl shadow-neutral-200/60 sm:p-9">
          <h2 className="text-3xl font-semibold tracking-tight">Sign in to ResQNet</h2>
          <p className="mt-2 text-sm text-neutral-500">Coordinate faster. Respond smarter.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-200"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-sm text-neutral-800">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-neutral-950 px-4 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="mt-7">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-neutral-200" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Quick access</p>
              <span className="h-px flex-1 bg-neutral-200" />
            </div>

            <p className="mt-4 text-xs leading-5 text-neutral-500">
              Select a role to fill in its demo credentials.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-neutral-950 hover:bg-neutral-50 hover:text-neutral-950"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-7 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
            No account?{' '}
            <Link to="/register" className="font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950">
              Register →
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

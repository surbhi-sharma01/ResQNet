import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';

const ROLE_OPTIONS = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'eoc', label: 'Emergency Operations Center' },
  { value: 'rescue_team', label: 'Rescue Team' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'shelter', label: 'Shelter' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'ngo', label: 'NGO' },
];

const NON_CITIZEN_ROLES = ['eoc', 'hospital', 'shelter', 'rescue_team', 'ngo', 'volunteer'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen', organizationName: '' });
  const [docFile, setDocFile] = useState(null);
  const [docError, setDocError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOrgRole = form.role !== 'citizen' && form.role !== 'volunteer';
  const needsDocument = NON_CITIZEN_ROLES.includes(form.role);

  const handleFileChange = (e) => {
    setDocError('');
    const file = e.target.files?.[0];

    if (!file) {
      setDocFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setDocError('Please upload an image file (photo or scan of your ID/registration).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setDocError('Please keep the file under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setDocFile({ dataUrl: reader.result, fileName: file.name });
    reader.onerror = () => setDocError('Could not read that file — try a different image.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = { ...form };

      if (needsDocument && docFile) {
        payload.verificationDocument = docFile;
      }

      const user = await register(payload);
      navigate(dashboardPathForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950';

  const labelClass =
    'text-xs font-semibold uppercase tracking-wider text-neutral-600';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-10 text-neutral-950 sm:px-8">
      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-neutral-200" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-neutral-200" />

      <section className="relative w-full max-w-lg">
        <Link
          to="/"
          aria-label="ResQNet home"
          className="mb-8 inline-flex items-center gap-3"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-950 text-lg font-semibold text-white">
            R
          </span>
          <span className="text-xl font-bold tracking-tight">
            ResQNet<span className="text-neutral-400">.</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_16px_50px_-30px_rgba(0,0,0,0.2)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Join the response network
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Connect. Coordinate. Save Lives.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="register-name" className={labelClass}>
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="register-email" className={labelClass}>
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="register-password" className={labelClass}>
                Password
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="register-role" className={labelClass}>
                I am a…
              </label>
              <select
                id="register-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {isOrgRole && (
              <div>
                <label htmlFor="register-organization" className={labelClass}>
                  Organization name
                </label>
                <input
                  id="register-organization"
                  type="text"
                  value={form.organizationName}
                  onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Sion Hospital"
                />
              </div>
            )}

            {needsDocument && (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
                <label htmlFor="verification-document" className={labelClass}>
                  Verification document
                </label>

                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  Upload an image of your organization ID or registration certificate.
                  For this demo, an EOC/admin account reviews the document inside the app.
                </p>

                <input
                  id="verification-document"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-3 w-full text-xs text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-950 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-neutral-700"
                />

                {docFile && (
                  <p className="mt-2 text-xs text-neutral-600">
                    ✓ {docFile.fileName} ready to upload
                  </p>
                )}

                {docError && (
                  <p role="alert" className="mt-2 text-xs font-medium text-red-700">
                    {docError}
                  </p>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create account'}
              {!submitting && <span className="ml-2">→</span>}
            </button>
          </form>

          <p className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950"
            >
              Sign in →
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          ResQNet · Disaster Response Network
        </p>
      </section>
    </main>
  );
}
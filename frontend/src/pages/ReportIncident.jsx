
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import SeverityBadge from '../components/SeverityBadge.jsx';

const CATEGORIES = ['flood', 'fire', 'earthquake', 'medical', 'structural', 'other'];

const FALLBACK_LOCATION = {
  lng: 72.8777,
  lat: 19.076,
  label: 'Mumbai (demo default)',
};

export default function ReportIncident() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: 'incident_report',
    title: '',
    description: '',
    category: 'other',
    address: '',
  });

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [locationStatus, setLocationStatus] = useState('detecting');
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
        setLocationStatus('live');
      },
      () => setLocationStatus('denied'),
      { timeout: 6000 }
    );
  }, []);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const jitter = () => (Math.random() - 0.5) * 0.01;
      const incidentLng = coords
        ? coords.lng
        : FALLBACK_LOCATION.lng + jitter();
      const incidentLat = coords
        ? coords.lat
        : FALLBACK_LOCATION.lat + jitter();

      const { data } = await api.post('/incidents', {
        ...form,
        lng: incidentLng,
        lat: incidentLat,
        ...(coords
          ? {
              reporterLng: coords.lng,
              reporterLat: coords.lat,
            }
          : {}),
      });

      return data;
    },
    onSuccess: () => navigate('/citizen'),
  });

  const handleDescriptionBlur = async () => {
    if (form.title.length < 3 || form.description.length < 10) return;

    setPreviewLoading(true);

    try {
      const { data } = await api.post('/ai/classify', {
        title: form.title,
        description: form.description,
      });
      setPreview(data);
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const inputClass =
    'mt-2 w-full rounded-xl border border-[#cdd6cf] bg-[#f7f7f3] px-4 py-3 text-sm text-[#29332d] outline-none transition placeholder:text-[#9aa49c] focus:border-[#789b83] focus:bg-white focus:ring-2 focus:ring-[#789b83]/15';

  const labelClass =
    'text-[10px] font-bold uppercase tracking-[0.16em] text-[#65786b]';

  return (
    <div className="min-h-screen bg-[#e9e9e5] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">

        {/* Page heading */}
        <div className="mb-7">
          <button
            type="button"
            onClick={() => navigate('/citizen')}
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#64776a] transition hover:text-[#304e3b]"
          >
            <span>←</span>
            Back to dashboard
          </button>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8e7dc] text-[#477457]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M12 3v18M3 12h18" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-[#789181]">
                RESQNET · COMMUNITY RESPONSE
              </p>
              <p className="mt-1 text-xs text-[#929b94]">
                Your safety. Your community.
              </p>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-[#29332d] sm:text-4xl">
            Report an incident
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-6 text-[#727d75]">
            Every report helps emergency teams understand what's happening
            and coordinate a faster response.
          </p>
        </div>

        {/* Main form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMutation.mutate();
          }}
          className="overflow-hidden rounded-3xl border border-[#d0d8d1] bg-[#f0f1ed] shadow-[0_8px_30px_rgba(44,57,47,0.07)]"
        >
          {/* Form header */}
          <div className="border-b border-[#d5ddd6] bg-[#e3eae3] px-5 py-5 sm:px-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#587663]">
                  INCIDENT DETAILS
                </p>
                <p className="mt-1 text-xs text-[#829087]">
                  Tell us what is happening.
                </p>
              </div>

              <span className="rounded-full border border-[#c7d8ca] bg-[#edf4ed] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#52765d]">
                New report
              </span>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-7">

            {/* Report type */}
            <div>
              <label className={labelClass}>Choose report type</label>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'sos' })}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    form.type === 'sos'
                      ? 'border-[#d9aaa4] bg-[#f5e6e3] shadow-sm'
                      : 'border-[#d6dcd5] bg-[#e9ebe6] hover:border-[#d9aaa4]'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#efd4cf] text-xl">
                    🆘
                  </span>

                  <span>
                    <span className="block text-sm font-bold text-[#a45149]">
                      SOS Emergency
                    </span>
                    <span className="mt-1 block text-[10px] text-[#927b76]">
                      Immediate danger
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, type: 'incident_report' })
                  }
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    form.type === 'incident_report'
                      ? 'border-[#a9c5b1] bg-[#e1ece3] shadow-sm'
                      : 'border-[#d6dcd5] bg-[#e9ebe6] hover:border-[#a9c5b1]'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d2e3d6] text-xl">
                    📝
                  </span>

                  <span>
                    <span className="block text-sm font-bold text-[#426d50]">
                      Standard report
                    </span>
                    <span className="mt-1 block text-[10px] text-[#849087]">
                      Report an incident
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className={labelClass}>Incident title *</label>

              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className={inputClass}
                placeholder="e.g. Water rising near Hindmata"
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description *</label>

              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                onBlur={handleDescriptionBlur}
                className={`${inputClass} resize-y`}
                placeholder="What's happening, who's affected, and any immediate hazards..."
              />

              <p className="mt-2 text-[10px] text-[#929b94]">
                Include as many useful details as possible.
              </p>
            </div>

            {/* Category and address */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category</label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Address (optional)</label>

                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Nearest landmark"
                />
              </div>
            </div>

            {/* Location status */}
            <div className="rounded-2xl border border-[#d1dcd2] bg-[#e5ece5] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#d2e3d6] text-[#527b60]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1116 0z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#425b49]">
                    Report location
                  </p>

                  {locationStatus === 'detecting' && (
                    <p className="mt-1 text-xs text-[#77867a]">
                      Detecting your location…
                    </p>
                  )}

                  {locationStatus === 'live' && (
                    <p className="mt-1 text-xs leading-5 text-[#527b60]">
                      Using your current device location for this report.
                    </p>
                  )}

                  {locationStatus === 'denied' && (
                    <>
                      <p className="mt-1 text-xs leading-5 text-[#a16e38]">
                        Location unavailable — using {FALLBACK_LOCATION.label}.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setLocationStatus('detecting');
                          navigator.geolocation?.getCurrentPosition(
                            (pos) => {
                              setCoords({
                                lng: pos.coords.longitude,
                                lat: pos.coords.latitude,
                              });
                              setLocationStatus('live');
                            },
                            () => setLocationStatus('denied'),
                            { timeout: 6000 }
                          );
                        }}
                        className="mt-2 rounded-lg border border-[#b9cdbd] bg-[#f0f5f0] px-3 py-1.5 text-[10px] font-bold text-[#52765d] transition hover:bg-[#dce9de]"
                      >
                        Retry location
                      </button>
                    </>
                  )}
                </div>

                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    locationStatus === 'live'
                      ? 'bg-emerald-500'
                      : locationStatus === 'denied'
                        ? 'bg-amber-500'
                        : 'animate-pulse bg-blue-400'
                  }`}
                />
              </div>
            </div>

            {/* AI preview */}
            {(previewLoading || preview) && (
              <div className="rounded-2xl border border-[#c7d8e8] bg-[#e4edf5] p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d2e0ed] text-[#52799d]">
                    ✨
                  </span>

                  <div>
                    <p className="text-xs font-bold text-[#456b8d]">
                      AI report analysis
                    </p>
                    <p className="text-[10px] text-[#7890a4]">
                      Preliminary classification
                    </p>
                  </div>
                </div>

                {previewLoading ? (
                  <p className="mt-3 text-xs text-[#668098]">
                    Analyzing report…
                  </p>
                ) : (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <SeverityBadge
                        severity={preview.suggestedSeverity}
                        pulse={false}
                      />

                      <span className="rounded-lg border border-[#c9d8e5] bg-[#eff4f8] px-2.5 py-1.5 text-[10px] font-semibold text-[#58748b]">
                        Category: {preview.suggestedCategory}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-[#5b7183]">
                      {preview.summary}
                    </p>

                    <p className="mt-2 text-[9px] uppercase tracking-wider text-[#8297a8]">
                      Source: {preview.source}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Submission error */}
            {submitMutation.isError && (
              <div className="rounded-xl border border-[#e5c4bf] bg-[#f7e8e5] px-4 py-3 text-xs leading-5 text-[#a34f48]">
                {submitMutation.error?.response?.data?.message ||
                  'Something went wrong submitting your report.'}
              </div>
            )}

            {/* Submit button */}
            <div className="border-t border-[#d6ddd6] pt-5">
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className={`w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  form.type === 'sos'
                    ? 'bg-[#a94e48] shadow-[#a94e48]/15 hover:bg-[#913f3a]'
                    : 'bg-[#344f3d] shadow-[#344f3d]/15 hover:bg-[#263e2f]'
                }`}
              >
                {submitMutation.isPending
                  ? 'Submitting…'
                  : form.type === 'sos'
                    ? '🆘 Submit SOS emergency'
                    : 'Submit incident report →'}
              </button>

              <p className="mt-3 text-center text-[10px] leading-5 text-[#929b94]">
                Please provide accurate information to help response teams.
              </p>
            </div>
          </div>
        </form>

        <p className="mt-5 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9aa39c]">
          RESQNET · YOUR SAFETY. YOUR COMMUNITY.
        </p>
      </div>
    </div>
  );
}

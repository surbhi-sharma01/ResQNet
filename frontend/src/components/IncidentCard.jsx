
import { useMutation, useQueryClient } from '@tanstack/react-query';
import SeverityBadge from './SeverityBadge.jsx';
import TrustBadge from './TrustBadge.jsx';
import api from '../api/axiosClient.js';
import { useAuth } from '../context/AuthContext.jsx';

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const AUTHORITY_ROLES = ['eoc', 'admin', 'rescue_team'];

const STATUS_STYLES = {
  reported: 'border-amber-200 bg-amber-50 text-amber-800',
  acknowledged: 'border-sky-200 bg-sky-50 text-sky-800',
  dispatched: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  in_progress: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  resolved: 'border-green-200 bg-green-50 text-green-800',
  rejected: 'border-rose-200 bg-rose-50 text-rose-800',
  merged: 'border-slate-200 bg-slate-100 text-slate-600',
};

const CATEGORY_STYLE =
  'border-[#d8e3da] bg-[#edf3ed] text-[#4b6854]';

const buttonBase =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50';

export default function IncidentCard({ incident, onClick, actions }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isCitizen = user?.role?.toLowerCase() === 'citizen';

  const patchIncidentInCache = (updatedIncident) => {
    queryClient.setQueriesData({ queryKey: ['incidents'] }, (old) => {
      if (!old?.incidents) return old;

      return {
        ...old,
        incidents: old.incidents.map((i) =>
          i._id === updatedIncident._id ? updatedIncident : i
        ),
      };
    });
  };

  const crowdVerify = useMutation({
    mutationFn: async (vote) =>
      (
        await api.post(`/incidents/${incident._id}/crowd-verify`, {
          vote,
        })
      ).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  const authorityVerify = useMutation({
    mutationFn: async (status) =>
      (
        await api.patch(
          `/incidents/${incident._id}/authority-verify`,
          { status }
        )
      ).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  const isOwnReport =
    incident.reportedBy?._id === user?._id ||
    incident.reportedBy === user?._id;

  const myVote = incident.crowdVotes?.find(
    (v) => (v.user?._id || v.user) === user?._id
  )?.vote;

  const canActAsAuthority = AUTHORITY_ROLES.includes(user?.role);
  const alreadyDecided =
    incident.authorityVerification?.status !== 'pending';

  const stopCardClick = (e) => e.stopPropagation();

  return (
    <article
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-[#d6e0d8] bg-[#f8f9f5] p-4 shadow-[0_2px_8px_rgba(40,60,45,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a8c0ad] hover:shadow-[0_8px_22px_rgba(40,60,45,0.09)] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#527e62] via-[#8daf97] to-[#d8c8a4]" />

      <div className="pl-2">
        {/* Incident heading and severity */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isCitizen && (
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e3eee5] text-[#52765c]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M12 3v18M3 12h18" />
                  </svg>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#668071]">
                  Community incident
                </span>
              </div>
            )}

            <h3 className="font-display text-sm font-semibold leading-5 text-[#26342c]">
              {incident.title}
            </h3>

            <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-[#68766c]">
              {incident.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <SeverityBadge severity={incident.severity} />
            <TrustBadge verification={incident.verification} />
          </div>
        </div>

        {/* Status, category, location and timestamp */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#e1e7e0] pt-3">
          <span
            className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
              STATUS_STYLES[incident.status] ||
              'border-[#d9e1da] bg-[#eef1ec] text-[#59685d]'
            }`}
          >
            {incident.status.replaceAll('_', ' ')}
          </span>

          <span
            className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide ${CATEGORY_STYLE}`}
          >
            {incident.category}
          </span>

          <span className="flex w-full items-center gap-1.5 pt-1 text-xs text-[#68766c]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5 shrink-0 text-[#638a75]"
            >
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1116 0z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span className="min-w-0 flex-1 break-words">
              {incident.location?.address || 'Location on file'}
            </span>
            <span className="shrink-0 text-[10px] text-[#89938c]">
              {formatTime(incident.createdAt)}
            </span>
          </span>
        </div>

        {/* AI summary */}
        {incident.aiAnalysis?.summary && (
          <div className="mt-4 rounded-xl border border-[#cbdced] bg-[#edf3f9] p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dce8f5] text-[#4779a8]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-4 w-4"
                >
                  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
                  <path d="M19 16l1 2.5 2.5 1-2.5 1L19 23l-1-2.5-2.5-1 2.5-1L19 16z" />
                </svg>
              </span>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#416e9b]">
                  AI insight
                </p>
                <p className="text-[10px] text-[#70879d]">
                  Automated incident assessment
                </p>
              </div>
            </div>

            <p className="mt-2 text-xs leading-5 text-[#4f687e]">
              {incident.aiAnalysis.summary}
            </p>
          </div>
        )}

        {/* Recommended resources for EOC and rescue authorities */}
        {canActAsAuthority &&
          incident.aiAnalysis?.recommendedResources?.length > 0 && (
            <div className="mt-3 rounded-xl border border-[#c9dcd0] bg-[#edf5ef] p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dcebe0] text-[#47765a]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path d="M12 3l8 4v5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7l8-4z" />
                    <path d="m8.5 12 2.3 2.3 4.7-5" />
                  </svg>
                </span>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#416d50]">
                    Recommended deployment
                  </p>
                  <p className="text-[10px] text-[#78917e]">
                    AI-assisted resource planning
                  </p>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {incident.aiAnalysis.recommendedResources.map((r) => (
                  <li
                    key={r.name}
                    className="flex items-start gap-2 text-xs text-[#435b49]"
                  >
                    <span className="mt-px font-bold text-[#38865a]">✓</span>
                    <span>
                      {r.qty > 1 ? `${r.qty}× ${r.name}` : r.name}
                    </span>
                  </li>
                ))}
              </ul>

              {incident.aiAnalysis.etaMinutes && (
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#d5e4d8] pt-2">
                  <span className="text-[10px] text-[#6d8573]">
                    Estimated response time
                  </span>
                  <span className="rounded-md bg-white/80 px-2 py-1 font-mono text-xs font-semibold text-[#386c4b]">
                    {incident.aiAnalysis.etaMinutes} min
                  </span>
                </div>
              )}
            </div>
          )}

        {/* Community verification */}
        {!isOwnReport && incident.status !== 'rejected' && (
          <div
            className="mt-4 border-t border-[#e1e7e0] pt-3"
            onClick={stopCardClick}
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#718078]">
              Community verification
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => crowdVerify.mutate('confirm')}
                disabled={crowdVerify.isPending}
                className={`${buttonBase} ${
                  myVote === 'confirm'
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                    : 'border-[#c9ddce] bg-white text-[#477454] hover:border-emerald-400 hover:bg-emerald-50'
                }`}
              >
                ✓ Confirm
              </button>

              <button
                onClick={() => crowdVerify.mutate('dispute')}
                disabled={crowdVerify.isPending}
                className={`${buttonBase} ${
                  myVote === 'dispute'
                    ? 'border-rose-400 bg-rose-100 text-rose-800'
                    : 'border-[#ead1cd] bg-white text-[#a45d55] hover:border-rose-300 hover:bg-rose-50'
                }`}
              >
                ✕ Dispute
              </button>

              {crowdVerify.isPending && (
                <span className="self-center text-[10px] text-[#78877b]">
                  Submitting…
                </span>
              )}

              {crowdVerify.isError && (
                <span className="self-center text-[10px] text-rose-700">
                  Could not submit vote. Try again.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Authority verification */}
        {canActAsAuthority && !alreadyDecided && (
          <div
            className="mt-3 border-t border-[#e1e7e0] pt-3"
            onClick={stopCardClick}
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#718078]">
              Authority review
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => authorityVerify.mutate('confirmed')}
                disabled={authorityVerify.isPending}
                className={`${buttonBase} border-[#b9d6ef] bg-[#eff6fd] text-[#286ca5] hover:bg-[#dfedfb]`}
              >
                <span>✓</span> Verify report
              </button>

              <button
                onClick={() => authorityVerify.mutate('rejected')}
                disabled={authorityVerify.isPending}
                className={`${buttonBase} border-[#ebc4c0] bg-[#fff2f0] text-[#b7473d] hover:bg-[#fce3df]`}
              >
                <span>✕</span> Reject as fake
              </button>
            </div>

            {authorityVerify.isPending && (
              <p className="mt-2 text-[10px] text-[#78877b]">
                Updating verification…
              </p>
            )}

            {authorityVerify.isError && (
              <p className="mt-2 text-[10px] text-rose-700">
                Could not update verification. Try again.
              </p>
            )}
          </div>
        )}

        {alreadyDecided && incident.authorityVerification?.status && (
          <div className="mt-3 flex items-center gap-2 border-t border-[#e1e7e0] pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718078]">
              Authority review
            </span>
            <span
              className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${
                incident.authorityVerification.status === 'confirmed'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : incident.authorityVerification.status === 'rejected'
                    ? 'border-rose-200 bg-rose-50 text-rose-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {incident.authorityVerification.status.replaceAll('_', ' ')}
            </span>
          </div>
        )}

        {/* Dashboard-specific actions supplied by the parent */}
        {actions && (
          <div
            className="mt-3 flex flex-wrap gap-2 border-t border-[#e1e7e0] pt-3 [&_button]:rounded-lg [&_button]:border [&_button]:!border-[#c9d8cd] [&_button]:!bg-[#eaf2eb] [&_button]:!px-3 [&_button]:!py-2 [&_button]:!text-xs [&_button]:!font-semibold [&_button]:!text-[#416d50] [&_button]:transition-colors [&_button:hover]:!border-[#8fb59a] [&_button:hover]:!bg-[#dcebe0]"
            onClick={stopCardClick}
          >
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';

const ROLE_LABELS = {
  hospital: 'Hospital',
  shelter: 'Shelter',
  rescue_team: 'Rescue Team',
  ngo: 'NGO',
  volunteer: 'Volunteer',
};

const ROLE_STYLES = {
  hospital: 'bg-[#e2edf5] text-[#4d7697] border-[#c8d9e8]',
  shelter: 'bg-[#e1ece4] text-[#52785e] border-[#c9dacd]',
  rescue_team: 'bg-[#eee7d9] text-[#8a7047] border-[#dfd1b7]',
  ngo: 'bg-[#eee4ed] text-[#866784] border-[#ddcddd]',
  volunteer: 'bg-[#e9e9e5] text-[#686f69] border-[#d5d7d1]',
};

const DOC_STATUS_STYLE = {
  not_submitted: {
    label: 'Not submitted',
    className: 'bg-[#e9e9e5] text-[#747b75] border-[#d4d6d0]',
    dot: 'bg-[#929991]',
  },
  pending: {
    label: 'Pending review',
    className: 'bg-[#f5eddb] text-[#96763c] border-[#e7d8b7]',
    dot: 'bg-[#c49a45]',
  },
  approved: {
    label: 'Approved',
    className: 'bg-[#e1eee4] text-[#477456] border-[#c6dccb]',
    dot: 'bg-[#5c9970]',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-[#f5e5e2] text-[#a45149] border-[#e5c7c1]',
    dot: 'bg-[#c56b61]',
  },
};

export default function EmergencyDirectory() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', 'directory'],
    queryFn: async () => (await api.get('/users/directory')).data,
  });

  const reviewDoc = useMutation({
    mutationFn: async ({ id, status }) =>
      (await api.patch(`/users/${id}/verify-document`, { status })).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['users', 'directory'] }),
  });

  const directory = data?.directory || [];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d0d7d0] bg-[#f0f1ed] shadow-[0_4px_18px_rgba(40,50,43,0.05)]">

      {/* Header */}
      <div className="border-b border-[#d5ddd6] bg-[#e4ebe4] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d3e2d7] text-[#52785e]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#29332d]">
                Emergency Directory
              </h2>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#7b8980]">
                Organisation contacts & verification
              </p>
            </div>
          </div>

          <span className="rounded-full border border-[#c8d8cc] bg-[#edf4ed] px-3 py-1.5 text-xs font-bold tabular-nums text-[#52765d]">
            {directory.length} registered
          </span>
        </div>

        <p className="mt-4 text-xs leading-5 text-[#748078]">
          Hospitals, shelters, rescue teams and NGOs, with live facility
          capacity where available. Review submitted organisation documents below.
        </p>
      </div>

      {/* Directory list */}
      <div className="max-h-[420px] space-y-3 overflow-y-auto p-4 sm:p-5">

        {isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-[#d8ded8] bg-[#e9ece7] p-4">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#a9b9ac] border-t-[#52785e]" />
            <p className="text-xs text-[#78847b]">
              Loading emergency directory…
            </p>
          </div>
        )}

        {directory.map((entry) => {
          const status =
            DOC_STATUS_STYLE[entry.documentStatus] ||
            DOC_STATUS_STYLE.not_submitted;

          const roleStyle =
            ROLE_STYLES[entry.role] ||
            ROLE_STYLES.volunteer;

          const capacity = entry.facility;
          const hasCapacity =
            capacity?.capacityTotal > 0;

          const capacityPercent = hasCapacity
            ? Math.min(
                100,
                Math.max(
                  0,
                  (capacity.capacityUsed / capacity.capacityTotal) * 100
                )
              )
            : 0;

          return (
            <article
              key={entry._id}
              className="overflow-hidden rounded-xl border border-[#d8ded7] bg-[#f5f5f1] transition hover:border-[#b9cbbd] hover:shadow-sm"
            >
              <div className="p-4">

                {/* Organisation identity */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-bold text-[#303a33]">
                      {entry.organizationName || entry.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-lg border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${roleStyle}`}
                      >
                        {ROLE_LABELS[entry.role] || entry.role}
                      </span>

                      {entry.phone && (
                        <a
                          href={`tel:${entry.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#66816e] transition hover:text-[#365b41]"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-3.5 w-3.5"
                          >
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.2 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.8a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.84.58 2.8.7a2 2 0 011.73 2.03z" />
                          </svg>
                          {entry.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide ${status.className}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                {/* Facility capacity */}
                {capacity && (
                  <div className="mt-4 rounded-xl border border-[#d7dfd8] bg-[#e9eee9] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#718078]">
                        Facility capacity
                      </p>

                      <span className="text-[10px] font-semibold text-[#5d7664]">
                        {capacity.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-lg font-bold tabular-nums text-[#344d3b]">
                        {capacity.capacityUsed}
                      </span>
                      <span className="text-xs text-[#8a958c]">
                        / {capacity.capacityTotal}
                      </span>
                      <span className="ml-auto text-[10px] font-medium text-[#829087]">
                        {hasCapacity
                          ? `${Math.round(capacityPercent)}% occupied`
                          : 'Capacity not set'}
                      </span>
                    </div>

                    {hasCapacity && (
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#d4ddd5]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            capacityPercent >= 90
                              ? 'bg-[#c87958]'
                              : capacityPercent >= 70
                                ? 'bg-[#c4a35c]'
                                : 'bg-[#6c9b79]'
                          }`}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Document review */}
                {entry.documentStatus === 'pending' && (
                  <div className="mt-4 border-t border-[#e0e3dc] pt-3">
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#96773f]">
                      Document review required
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          reviewDoc.mutate({
                            id: entry._id,
                            status: 'approved',
                          })
                        }
                        disabled={reviewDoc.isPending}
                        className="rounded-lg border border-[#b9d4c0] bg-[#e3eee5] px-3 py-2 text-[10px] font-bold text-[#477354] transition hover:bg-[#d4e7d9] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ✓ Approve document
                      </button>

                      <button
                        onClick={() =>
                          reviewDoc.mutate({
                            id: entry._id,
                            status: 'rejected',
                          })
                        }
                        disabled={reviewDoc.isPending}
                        className="rounded-lg border border-[#e3c3be] bg-[#f5e7e4] px-3 py-2 text-[10px] font-bold text-[#a45249] transition hover:bg-[#efd9d5] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {!isLoading && directory.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#cbd5cc] bg-[#e9ece7] px-5 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dce6dc] text-[#66816e]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
              >
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 9h.01M15 9h.01" />
              </svg>
            </div>

            <p className="mt-3 text-sm font-semibold text-[#4c5d50]">
              No organisations registered yet
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#849087]">
              Hospitals, shelters, rescue teams and NGOs will appear here
              after registering.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

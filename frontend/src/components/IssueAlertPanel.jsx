
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';

const SEVERITIES = [
  {
    value: 'info',
    label: 'Info',
    description: 'General information',
    activeClass: 'border-[#a9c6dc] bg-[#e3edf5] text-[#52799b]',
    dot: 'bg-[#6997ba]',
  },
  {
    value: 'warning',
    label: 'Warning',
    description: 'Caution required',
    activeClass: 'border-[#dfc994] bg-[#f5edda] text-[#96763c]',
    dot: 'bg-[#c49a45]',
  },
  {
    value: 'critical',
    label: 'High risk',
    description: 'Urgent emergency',
    activeClass: 'border-[#e0b6af] bg-[#f5e4e1] text-[#a45149]',
    dot: 'bg-[#c56b61]',
  },
];

const ALERT_STYLES = {
  info: {
    background: 'bg-[#e7eff5]',
    border: 'border-[#cbdce9]',
    text: 'text-[#537794]',
    label: 'INFO',
    dot: 'bg-[#6997ba]',
  },
  warning: {
    background: 'bg-[#f5eedf]',
    border: 'border-[#e7d9ba]',
    text: 'text-[#96763c]',
    label: 'WARNING',
    dot: 'bg-[#c49a45]',
  },
  critical: {
    background: 'bg-[#f5e6e3]',
    border: 'border-[#e5c7c1]',
    text: 'text-[#a45149]',
    label: 'HIGH RISK',
    dot: 'bg-[#c56b61]',
  },
};

export default function IssueAlertPanel() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('warning');

  const { data } = useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: async () => (await api.get('/alerts/active')).data,
  });

  const issue = useMutation({
    mutationFn: async () =>
      (await api.post('/alerts', { message, severity })).data,
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['alerts', 'active'] });
    },
  });

  const dismiss = useMutation({
    mutationFn: async (id) =>
      (await api.patch(`/alerts/${id}/dismiss`)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['alerts', 'active'] }),
  });

  const activeAlerts = data?.alerts || [];

  const selectedSeverity =
    SEVERITIES.find((s) => s.value === severity) || SEVERITIES[1];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d0d7d0] bg-[#f0f1ed] shadow-[0_4px_18px_rgba(40,50,43,0.05)]">

      {/* Header */}
      <div className="border-b border-[#d6ddd6] bg-[#e5ebe5] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d3e2d7] text-[#52785e]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="M4 11v2a1 1 0 001 1h2l4 5V5l-4 5H5a1 1 0 00-1 1z" />
              <path d="M15 9a4 4 0 010 6M17.5 6.5a8 8 0 010 11" />
            </svg>
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#29332d]">
              Emergency Broadcast
            </h2>
            <p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-[#7b8980]">
              EOC · Public communication
            </p>
          </div>

          <span className="ml-auto flex items-center gap-1.5 rounded-full border border-[#c9d9cd] bg-[#edf4ed] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#55765e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#60976e]" />
            Live
          </span>
        </div>

        <p className="mt-4 text-xs leading-5 text-[#748078]">
          Broadcast important emergency notifications to citizens,
          responders and facility dashboards instantly.
        </p>
      </div>

      {/* Broadcast form */}
      <div className="p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) issue.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#68796e]">
              Broadcast message
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Flash flood warning — evacuate low-lying areas near Hindmata immediately."
              className="mt-2 w-full resize-y rounded-xl border border-[#cdd6cf] bg-[#f7f7f3] px-4 py-3 text-sm leading-6 text-[#29332d] outline-none transition placeholder:text-[#9aa49c] focus:border-[#789b83] focus:bg-white focus:ring-2 focus:ring-[#789b83]/15"
            />

            <p className="mt-1.5 text-right text-[10px] text-[#929b94]">
              {message.length}/500 characters
            </p>
          </div>

          {/* Severity selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#68796e]">
              Alert priority
            </label>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSeverity(s.value)}
                  className={`rounded-xl border p-3 text-left transition ${
                    severity === s.value
                      ? s.activeClass
                      : 'border-[#d6dcd5] bg-[#e9ebe6] text-[#7b847d] hover:border-[#bfcbbf]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    <span className="text-[10px] font-bold">
                      {s.label}
                    </span>
                  </span>
                  <span className="mt-1.5 block text-[9px] opacity-75">
                    {s.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected priority preview */}
          <div className={`flex items-center gap-2 rounded-xl border p-3 ${selectedSeverity.activeClass}`}>
            <span className={`h-2 w-2 rounded-full ${selectedSeverity.dot}`} />
            <p className="text-[10px] font-semibold">
              Selected priority: {selectedSeverity.label}
            </p>
          </div>

          {/* Mutation error */}
          {issue.isError && (
            <p className="rounded-xl border border-[#e5c4bf] bg-[#f7e8e5] px-3 py-2 text-xs text-[#a34f48]">
              {issue.error?.response?.data?.message ||
                'Unable to broadcast the alert. Please try again.'}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={issue.isPending || !message.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#344f3d] px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#263e2f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="M4 11v2a1 1 0 001 1h2l4 5V5l-4 5H5a1 1 0 00-1 1z" />
              <path d="M15 9a4 4 0 010 6" />
            </svg>
            {issue.isPending ? 'Broadcasting…' : 'Broadcast now'}
          </button>
        </form>
      </div>

      {/* Active broadcasts */}
      <div className="border-t border-[#d6ddd6] p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#39483d]">
              Active broadcasts
            </h3>
            <p className="mt-1 text-[10px] text-[#89938c]">
              Currently active notifications
            </p>
          </div>

          <span className="rounded-full border border-[#d1dcd2] bg-[#e6ece6] px-2.5 py-1 text-[10px] font-bold tabular-nums text-[#607969]">
            {activeAlerts.length} active
          </span>
        </div>

        {activeAlerts.length > 0 ? (
          <div className="space-y-2">
            {activeAlerts.map((alert) => {
              const style =
                ALERT_STYLES[alert.severity] || ALERT_STYLES.info;

              return (
                <div
                  key={alert._id}
                  className={`rounded-xl border p-3 ${style.background} ${style.border}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${style.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>

                      <p className="mt-2 break-words text-xs leading-5 text-[#45534a]">
                        {alert.message}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => dismiss.mutate(alert._id)}
                      disabled={dismiss.isPending}
                      className="shrink-0 rounded-lg border border-[#d2d7d0] bg-[#f5f5f1]/80 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#788078] transition hover:border-[#d9aaa4] hover:bg-[#f5e5e2] hover:text-[#a45149] disabled:opacity-50"
                    >
                      Retract
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#cbd5cc] bg-[#e9ece7] px-4 py-6 text-center">
            <span className="text-xl">📢</span>
            <p className="mt-2 text-xs font-semibold text-[#65756a]">
              No active broadcasts
            </p>
            <p className="mt-1 text-[10px] text-[#929b94]">
              Your issued emergency alerts will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

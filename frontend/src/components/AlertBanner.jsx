
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useSocket } from '../context/SocketContext.jsx';

const SEVERITY_STYLES = {
  info: {
    background: 'bg-[#e3edf5]',
    border: 'border-[#b9d0e2]',
    text: 'text-[#426782]',
    iconBackground: 'bg-[#cfdfed]',
    icon: 'ℹ',
    label: 'Information',
  },
  warning: {
    background: 'bg-[#f5edda]',
    border: 'border-[#e5d3a5]',
    text: 'text-[#896622]',
    iconBackground: 'bg-[#eadbb6]',
    icon: '⚠',
    label: 'Warning',
  },
  critical: {
    background: 'bg-[#f5e3e1]',
    border: 'border-[#e7bfba]',
    text: 'text-[#a7443d]',
    iconBackground: 'bg-[#ebceca]',
    icon: '!',
    label: 'Critical alert',
  },
};

export default function AlertBanner() {
  const { socket } = useSocket();

  const [alerts, setAlerts] = useState([]);
  const [dismissedLocally, setDismissedLocally] = useState(
    new Set()
  );

  const { data } = useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: async () =>
      (await api.get('/alerts/active')).data,
  });

  useEffect(() => {
    if (data?.alerts) {
      setAlerts(data.alerts);
    }
  }, [data]);

  useEffect(() => {
    if (!socket) return;

    const onNew = (alert) => {
      setAlerts((prev) => [
        alert,
        ...prev.filter((a) => a._id !== alert._id),
      ]);

      setDismissedLocally((prev) => {
        const next = new Set(prev);
        next.delete(alert._id);
        return next;
      });
    };

    const onDismissed = ({ _id }) => {
      setAlerts((prev) =>
        prev.filter((a) => a._id !== _id)
      );

      setDismissedLocally((prev) => {
        const next = new Set(prev);
        next.delete(_id);
        return next;
      });
    };

    socket.on('alert:new', onNew);
    socket.on('alert:dismissed', onDismissed);

    return () => {
      socket.off('alert:new', onNew);
      socket.off('alert:dismissed', onDismissed);
    };
  }, [socket]);

  const visibleAlerts = alerts.filter(
    (a) => !dismissedLocally.has(a._id)
  );

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2 px-4 py-3">
      {visibleAlerts.map((alert) => {
        const style =
          SEVERITY_STYLES[alert.severity] ||
          SEVERITY_STYLES.warning;

        return (
          <div
            key={alert._id}
            role="status"
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 shadow-sm transition ${style.background} ${style.border}`}
          >
            {/* Alert icon */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${style.iconBackground} ${style.text}`}
            >
              {style.icon}
            </div>

            {/* Alert message */}
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex flex-wrap items-center gap-2">
                <span
                  className={`font-mono text-[9px] font-bold uppercase tracking-widest ${style.text}`}
                >
                  {style.label}
                </span>

                {alert.severity === 'critical' && (
                  <span className="rounded-full bg-[#c94c4c] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                    High risk
                  </span>
                )}
              </div>

              <p
                className={`text-xs font-medium leading-relaxed ${style.text}`}
              >
                {alert.message}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={() =>
                setDismissedLocally((prev) =>
                  new Set(prev).add(alert._id)
                )
              }
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-black/5 ${style.text}`}
              aria-label="Dismiss alert"
              title="Dismiss alert"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

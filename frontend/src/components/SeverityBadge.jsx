
const SEVERITY_STYLES = {
  critical: {
    dot: 'bg-red-500',
    text: 'text-red-700',
    background: 'bg-red-50',
    border: 'border-red-200',
    label: 'Critical',
  },
  high: {
    dot: 'bg-orange-500',
    text: 'text-orange-700',
    background: 'bg-orange-50',
    border: 'border-orange-200',
    label: 'High',
  },
  medium: {
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    background: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Medium',
  },
  low: {
    dot: 'bg-emerald-600',
    text: 'text-emerald-700',
    background: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'Low',
  },
};

export default function SeverityBadge({ severity = 'medium', pulse = true }) {
  const style =
    SEVERITY_STYLES[severity?.toLowerCase()] || SEVERITY_STYLES.medium;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider ${style.text} ${style.background} ${style.border}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-pulseBeacon rounded-full opacity-50 ${style.dot}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${style.dot}`} />
      </span>
      {style.label}
    </span>
  );
}

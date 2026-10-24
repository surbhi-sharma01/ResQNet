
const STATE_STYLES = {
  pending: {
    label: 'Pending',
    text: 'text-stone-600',
    background: 'bg-stone-100',
    border: 'border-stone-300',
    dot: 'bg-stone-500',
  },
  suspicious: {
    label: 'Suspicious',
    text: 'text-red-700',
    background: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  verified: {
    label: 'Verified',
    text: 'text-emerald-700',
    background: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
  highly_trusted: {
    label: 'Highly Trusted',
    text: 'text-blue-700',
    background: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
  },
};

export default function TrustBadge({ verification }) {
  if (!verification) return null;

  const style =
    STATE_STYLES[verification.trustState] || STATE_STYLES.pending;

  return (
    <span
      title={`GPS ${verification.gpsScore} · Crowd ${verification.crowdScore} · Authority ${verification.authorityScore} · AI ${verification.aiScore}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wide ${style.text} ${style.background} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />

      <span>{style.label}</span>

      <span className="border-l border-current/20 pl-1.5 opacity-80">
        {verification.trustScore}
      </span>
    </span>
  );
}

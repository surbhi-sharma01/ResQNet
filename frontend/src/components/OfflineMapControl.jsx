
import { useState } from 'react';
import { downloadTilesForOfflineUse } from '../utils/offlineMap.js';

const RADIUS_OPTIONS = [2, 5, 10];

export default function OfflineMapControl({ center }) {
  const [radiusKm, setRadiusKm] = useState(5);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
  });

  const handleDownload = async () => {
    setStatus('downloading');
    setProgress({ completed: 0, total: 0 });

    try {
      const [lat, lng] = center;

      const result = await downloadTilesForOfflineUse(
        { lat, lng, radiusKm },
        (completed, total) =>
          setProgress({ completed, total })
      );

      setProgress({
        completed: result.tilesDownloaded,
        total: result.totalTiles,
      });

      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const percent = progress.total
    ? Math.round(
        (progress.completed / progress.total) * 100
      )
    : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d0d5d2] bg-[#f1f2ef] shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#d8ddda] bg-[#e5ebe8] px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d3e2dc] text-[#376b58]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6.5 9 3l6 3.5L21 3v14.5L15 21l-6-3.5L3 21z" />
            <path d="M9 3v14.5" />
            <path d="M15 6.5V21" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-[#292f2c]">
            Offline map
          </p>
          <p className="mt-0.5 text-[10px] text-[#707a74]">
            Stay prepared, even without internet
          </p>
        </div>

        <span className="rounded-full border border-[#c6d9cf] bg-[#dcebe3] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#397258]">
          Map tools
        </span>
      </div>

      <div className="p-4">
        <p className="text-xs leading-relaxed text-[#626c66]">
          Save the map around your current view in advance.
          You can access the downloaded map tiles later when
          your internet connection is unavailable.
        </p>

        {/* Radius selection */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#69736d]">
              Download radius
            </p>
            <span className="text-[10px] font-medium text-[#75817a]">
              Select area
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                disabled={status === 'downloading'}
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  radiusKm === r
                    ? 'border-[#496e83] bg-[#dce8f0] text-[#34566c] shadow-sm'
                    : 'border-[#d5d9d5] bg-[#e8eae6] text-[#626c66] hover:border-[#9eafa6] hover:bg-[#e1e7e2]'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={status === 'downloading'}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#303c39] px-4 py-3 text-xs font-semibold text-[#f4f5f1] shadow-sm transition hover:bg-[#40534c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'downloading' ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Downloading… {percent}%
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              {status === 'done'
                ? 'Download again'
                : 'Download for offline use'}
            </>
          )}
        </button>

        {/* Download progress */}
        {status === 'downloading' && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-[10px]">
              <span className="font-medium text-[#65716a]">
                Saving map tiles
              </span>
              <span className="font-mono font-bold text-[#426b57]">
                {percent}%
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[#dce2dc]">
              <div
                className="h-full rounded-full bg-[#54866b] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            <p className="mt-2 text-[10px] text-[#758078]">
              {progress.completed} of {progress.total} tiles downloaded
            </p>
          </div>
        )}

        {/* Success message */}
        {status === 'done' && (
          <div className="mt-4 flex gap-3 rounded-xl border border-[#c5ddce] bg-[#e1eee5] p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c8dfd0] text-[#347052]">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-[#32684c]">
                Offline map saved successfully
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#537761]">
                {progress.total} map tiles saved for offline access.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {status === 'error' && (
          <div className="mt-4 flex gap-3 rounded-xl border border-[#ebc9c5] bg-[#f7e7e4] p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0d2ce] text-[#a84d45]">
              !
            </div>
            <div>
              <p className="text-xs font-bold text-[#a3443c]">
                Download unsuccessful
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#925c56]">
                Couldn't download the map. Your browser may not support
                offline storage. Please try again.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';

const ROLES = [
  { number: '01', title: 'Citizen', description: 'Send an SOS, report incidents, and help keep your family safe.', symbol: '↗' },
  { number: '02', title: 'Operations center', description: 'Review incoming reports, prioritize risk, and coordinate resources.', symbol: '⌘' },
  { number: '03', title: 'Rescue team', description: 'Receive assignments and navigate directly to incident locations.', symbol: '＋' },
  { number: '04', title: 'Hospitals', description: 'Share bed availability and prepare for incoming patients.', symbol: '✚' },
  { number: '05', title: 'Shelters', description: 'Keep occupancy and available spaces up to date in real time.', symbol: '⌂' },
];

const INCIDENTS = [
  { level: 'HIGH PRIORITY', title: 'Flooding reported', location: 'Riverside district', time: '02 min ago' },
  { level: 'HIGH PRIORITY', title: 'Medical assistance', location: 'Central avenue', time: '08 min ago' },
  { level: 'MONITORING', title: 'Road obstruction', location: 'North sector', time: '14 min ago' },
];

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true" className="text-lg">{diagonal ? '↗' : '→'}</span>;
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen overflow-hidden bg-white text-neutral-950">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-3" aria-label="ResQNet home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-950 text-lg font-semibold text-white">R</span>            <span className="text-lg font-bold tracking-tight">ResQNet<span className="text-neutral-400">.</span></span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
            <a href="#overview" className="transition hover:text-black">Overview</a>
            <a href="#network" className="transition hover:text-black">Response network</a>
            <a href="#how-it-works" className="transition hover:text-black">How it works</a>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            {user ? (
              <Link to={dashboardPathForRole(user.role)} className="rounded-full bg-neutral-950 px-5 py-2.5 font-medium text-white transition hover:bg-neutral-700">
                Open dashboard <Arrow />
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden px-3 py-2 font-medium text-neutral-700 transition hover:text-black sm:inline">Sign in</Link>
                <Link to="/register" className="rounded-full bg-neutral-950 px-5 py-2.5 font-medium text-white transition hover:bg-neutral-700">
                  Get started <span className="ml-2">↗</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section id="overview" className="mx-auto grid max-w-[1240px] items-center gap-8 px-5 pb-10 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-[0.92fr_1.05fr] lg:gap-10 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
            <span className="h-2 w-2 rounded-full bg-neutral-950" />
            Emergency response network
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl lg:text-[56px]">When every second matters, <span className="text-neutral-400">everyone moves as one.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
            One shared response network for citizens, dispatch teams, hospitals, and shelters. Bring reports and resources together so help can reach people faster.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/register" className="inline-flex items-center gap-5 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700">
              Report an incident <Arrow diagonal />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-5 rounded-full border border-neutral-300 px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-950">
              Explore demo <span aria-hidden="true">▶</span>
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-neutral-950" /> Shared incident visibility</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-neutral-950" /> Coordinated response</span>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-neutral-100 blur-3xl" />
          <div className="relative rounded-[20px] border border-neutral-200 bg-neutral-50 p-2 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-neutral-200 px-2 pb-4 pt-1 sm:px-3">
              <div className="flex items-center gap-2 text-sm font-bold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-neutral-950 text-xs text-white">R</span> Response overview</div>
            </div>
              <div className="grid gap-2 pt-2 sm:grid-cols-[1.15fr_0.85fr]">              <div className="relative min-h-[170px] overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 sm:min-h-[190px]">
               <div className="flex items-center justify-between text-xs font-semibold"><span>Incident activity</span><span className="text-neutral-400">Live map preview</span></div>
                <div className="absolute inset-x-0 bottom-0 top-12 overflow-hidden">
                  <svg viewBox="0 0 500 360" className="h-full w-full" role="img" aria-label="Abstract monochrome map preview">
                    <rect width="500" height="360" fill="#f8f8f8" />
                    <g stroke="#dedede" strokeWidth="2" fill="none">
                      <path d="M-30 60 L160 130 L280 20 L510 105" /><path d="M-30 170 L170 210 L330 110 L530 210" /><path d="M20 370 L140 240 L300 300 L440 190 L520 260" />
                      <path d="M65 -20 L120 110 L80 220 L170 380" /><path d="M220 -20 L250 100 L220 220 L300 380" /><path d="M390 -20 L350 110 L410 220 L380 380" />
                    </g>
                    <g stroke="#e9e9e9" strokeWidth="10" fill="none"><path d="M-20 290 Q120 120 230 190 T520 40" /><path d="M100 -20 Q220 100 300 180 T420 390" /></g>
                    <g fill="#111"><circle cx="132" cy="135" r="13"/><circle cx="132" cy="135" r="4" fill="white"/><circle cx="318" cy="105" r="13"/><circle cx="318" cy="105" r="4" fill="white"/><circle cx="270" cy="255" r="13"/><circle cx="270" cy="255" r="4" fill="white"/></g>
                    <g fill="none" stroke="#111" strokeOpacity=".2"><circle cx="220" cy="180" r="38"/><circle cx="220" cy="180" r="60"/></g>
                    <circle cx="220" cy="180" r="15" fill="#111"/><circle cx="220" cy="180" r="4" fill="white"/>
                  </svg>
                </div>
                <div className="absolute bottom-4 left-4 rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-neutral-950" /><span className="text-xs font-semibold">Incident detected</span></div>
                  <p className="mt-1 pl-4 text-[10px] text-neutral-500">Response team notified</p>
                </div>
              </div>
              <div className="grid gap-3">
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">                  <div className="flex items-center justify-between text-xs font-semibold"><span>Network snapshot</span><span className="text-neutral-400">01 / 04</span></div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[['12','Active incidents'],['08','Rescue teams'],['05','Hospitals'],['14','Shelters']].map(([value,label]) => <div key={label} className="rounded-xl bg-neutral-50 p-2"><div className="text-2xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-[10px] text-neutral-500">{label}</div></div>)}
                  </div>
                </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-3">                   <div className="mb-3 flex items-center justify-between text-xs font-semibold"><span>Recent activity</span><span className="text-neutral-400">Preview</span></div>
                  <div className="space-y-3">
                    {INCIDENTS.map((incident, index) => <div key={incident.title} className="flex gap-3 border-t border-neutral-100 pt-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-xs font-bold">{index === 2 ? '·' : '!'}</span>
                      <div className="min-w-0"><div className="truncate text-xs font-semibold">{incident.title}</div><div className="mt-1 truncate text-[10px] text-neutral-500">{incident.location} · {incident.time}</div><div className="mt-1 text-[9px] font-semibold tracking-wider text-neutral-400">{incident.level}</div></div>
                    </div>)}
                  </div>
                </div>
              </div>
            </div>
            <p className="px-2 pb-1 pt-3 text-[10px] text-neutral-400">Illustrative interface preview · sample figures, not live incident data</p>
          </div>
        </div>
      </section>

      <section id="network" className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">One connected network</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Every role. One response.</h2></div>
            <p className="max-w-md text-sm leading-6 text-neutral-500">Purpose-built tools help each team act on the same picture of an unfolding emergency.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {ROLES.map((role) => <article key={role.title} className="group flex min-h-[190px] flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-lg">
              <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl border border-neutral-200 text-xl">{role.symbol}</span><span className="text-xs tabular-nums text-neutral-400">{role.number}</span></div>
              <h3 className="mt-7 text-sm font-semibold">{role.title}</h3>
              <p className="mt-2 text-xs leading-5 text-neutral-500">{role.description}</p>
              <span className="mt-auto self-end pt-4 text-neutral-400 transition group-hover:text-black"><Arrow diagonal /></span>
            </article>)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-12 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div>
            <p className="font-semibold">Ready to explore the response network?</p>
            <p className="mt-1 text-neutral-500">Create an account to get started.</p>
        </div>
        <div className="flex gap-3">
        <Link to="/register" className="rounded-full bg-neutral-950 px-5 py-3 font-medium text-white transition hover:bg-neutral-700">
          Create account <Arrow diagonal />
        </Link>
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold tracking-tight text-neutral-900">ResQNet<span className="text-neutral-400">.</span></span>
          <span>Emergency operations, thoughtfully connected.</span>
        </div>
      </footer>
    </main>
  );
}

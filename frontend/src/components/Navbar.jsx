
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { dashboardPathForRole } from '../utils/roleRouting.js';
import AlertBanner from './AlertBanner.jsx';
import AssistantChat from './AssistantChat.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const isCitizen = user?.role?.toLowerCase() === 'citizen';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isCitizen) {
    return (
      <>
            <header className="sticky top-0 z-[1000] isolate border-b border-stone-200/80 bg-[#eeefed] px-4 py-3 sm:px-8">          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">

            {/* Brand */}
            <Link
              to={dashboardPathForRole(user.role)}
              className="group flex shrink-0 items-center gap-3"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#242424] text-xl font-black tracking-tight text-[#f5f5f3] shadow-md shadow-neutral-400/30 transition-transform group-hover:-rotate-3">
                R
              </span>

              <span>
                <span className="block text-lg font-black tracking-[-0.06em] text-[#242424]">
                  ResQNet<span className="text-stone-400">.</span>
                </span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500">
                  Citizen network
                </span>
              </span>
            </Link>

            {/* User controls */}
            {user && (
              <div className="flex items-center gap-2 sm:gap-3">

                {/* User profile */}
                <div className="hidden items-center gap-3 rounded-xl border border-stone-200 bg-[#e4e5e2] py-2 pl-2 pr-4 sm:flex">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#333333] text-sm font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  <div>
                    <p className="max-w-[130px] truncate text-xs font-bold text-[#252525]">
                      {user.name}
                    </p>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-stone-500">
                      Citizen account
                    </p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-2 rounded-xl border border-[#333333] bg-[#292929] px-3 py-3 text-xs font-semibold text-white shadow-sm transition-all hover:border-black hover:bg-black sm:px-4"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  >
                    <path
                      d="M10 17l5-5-5-5M15 12H3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3h6a2 2 0 012 2v14a2 2 0 01-2 2h-6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {user && <AlertBanner />}
        {user && <AssistantChat />}
      </>
    );
  }

  return (
    <>
      
<nav className="sticky top-0 z-[1000] isolate flex items-center justify-between gap-3 border-b border-stone-200/80 bg-[#eeefed] px-4 py-3 sm:px-8">
  <Link
    to={user ? dashboardPathForRole(user.role) : '/'}
    className="group flex shrink-0 items-center gap-3"
  >
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#242424] text-lg font-black text-[#f5f5f3] shadow-sm">
      R
    </span>

    <span className="font-display text-lg font-black tracking-[-0.04em] text-[#242424]">
      ResQNet<span className="text-stone-400">.</span>
    </span>
  </Link>

  <div className="flex items-center gap-2 sm:gap-3">
    <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-[#e4e5e2] px-3 py-2 font-mono text-[11px] text-stone-600">
      <span
        className={`h-2 w-2 rounded-full ${
          connected ? 'bg-emerald-600' : 'bg-red-600'
        }`}
      />
      {connected ? 'LIVE' : 'OFFLINE'}
    </span>

    {user && (
      <>
        <span className="hidden rounded-xl border border-stone-200 bg-[#e4e5e2] px-3 py-2 text-xs font-bold text-[#252525] sm:inline">
          {user.name}
        </span>

        <span className="rounded-lg bg-[#dfe4df] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#426b57]">
          {user.role}
        </span>

        <button
          onClick={handleLogout}
          className="rounded-xl border border-[#333333] bg-[#292929] px-3 py-3 text-xs font-semibold text-white transition hover:bg-black sm:px-4"
        >
          Log out
        </button>
      </>
    )}
  </div>
</nav>


      {user && <AlertBanner />}
      {user && <AssistantChat />}
    </>
  );
}

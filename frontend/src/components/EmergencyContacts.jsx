
const CONTACTS = [
  { label: 'National Emergency', number: '112', category: 'ALL EMERGENCIES', primary: true },
  { label: 'Police', number: '100', category: 'LAW & SAFETY' },
  { label: 'Fire Brigade', number: '101', category: 'FIRE & RESCUE' },
  { label: 'Ambulance', number: '108', category: 'MEDICAL' },
  { label: 'Disaster Management', number: '1078', category: 'NDMA HELPLINE' },
  { label: 'Women Helpline', number: '1091', category: 'WOMEN SAFETY' },
];

export default function EmergencyContacts() {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-300 bg-[#f0f0ed] shadow-sm">

      {/* Section heading */}
      <div className="flex flex-col gap-4 border-b border-[#383838] bg-[#242424] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.8a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.84.58 2.8.7A2 2 0 0122 16.92z" />
            </svg>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
              RESQNET · EMERGENCY SUPPORT
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              Emergency contacts
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-3 py-2 sm:self-center">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">
            Important numbers
          </span>
        </div>
      </div>

      {/* Emergency notice */}
      <div className="flex items-start gap-3 border-b border-red-200 bg-[#f8e9e7] px-5 py-4 sm:px-7">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-100 text-xs font-black text-red-700">
          !
        </span>
        <p className="text-xs leading-5 text-red-800 sm:text-sm">
          In a life-threatening situation, contact emergency services directly.
          Do not wait for a response to your submitted report.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid gap-3 bg-[#e6e6e2] p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {CONTACTS.map((contact) => (
          <div
            key={contact.number}
            className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
              contact.primary
                ? 'border-red-200 bg-[#f1e9e7] hover:border-red-300'
                : 'border-stone-300 bg-[#dededb] hover:border-stone-400 hover:bg-[#e5e5e2]'
            }`}
          >
            {/* Subtle top accent */}
            <div className={`absolute left-0 top-0 h-1 w-full ${
              contact.primary ? 'bg-red-500' : 'bg-[#777773]'
            }`} />

            <div className="flex items-center justify-between gap-2">
              <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${
                contact.primary ? 'text-red-600' : 'text-stone-500'
              }`}>
                {contact.category}
              </span>

              {contact.primary && (
                <span className="rounded-md bg-red-100 px-2 py-1 text-[9px] font-bold uppercase text-red-700">
                  Priority
                </span>
              )}
            </div>

            <h3 className="mt-3 min-h-[40px] text-sm font-semibold leading-5 text-[#292929]">
              {contact.label}
            </h3>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className={`text-3xl font-black tracking-tight ${
                contact.primary ? 'text-red-700' : 'text-[#242424]'
              }`}>
                {contact.number}
              </span>

              <a
                href={`tel:${contact.number}`}
                aria-label={`Call ${contact.label} at ${contact.number}`}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 ${
                  contact.primary
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-[#292929] text-white hover:bg-black'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3.5 w-3.5"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.8a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.84.58 2.8.7A2 2 0 0122 16.92z" />
                </svg>
                Call now
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-stone-300 bg-[#e2e2df] px-5 py-3 sm:px-7">
        <p className="text-[10px] leading-5 text-stone-500">
          Keep these emergency numbers accessible. Calling requires an available
          phone connection.
        </p>
      </div>
    </section>
  );
}

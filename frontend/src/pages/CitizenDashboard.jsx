
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useSocket } from '../context/SocketContext.jsx';
import Navbar from '../components/Navbar.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import IncidentCard from '../components/IncidentCard.jsx';
import EmergencyContacts from '../components/EmergencyContacts.jsx';
import OfflineMapControl from '../components/OfflineMapControl.jsx';

const FALLBACK_CENTER = [19.076, 72.8777];

function StatCard({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-stone-300/80 bg-[#e2e2df] p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[#242424]">
        {value}
      </p>
      <p className="mt-1 text-xs text-stone-500">{description}</p>
    </div>
  );
}

export default function CitizenDashboard() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [myLocation, setMyLocation] = useState(FALLBACK_CENTER);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setMyLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setMyLocation(FALLBACK_CENTER),
      { timeout: 6000 }
    );
  }, []);

  const { data: myIncidentsData } = useQuery({
    queryKey: ['incidents', 'mine'],
    queryFn: async () => (await api.get('/incidents?mine=true')).data,
  });

  const { data: facilitiesData } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => (await api.get('/facilities')).data,
  });

  const { data: allIncidentsData } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: async () => (await api.get('/incidents')).data,
  });

  useEffect(() => {
    if (!socket) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    };

    socket.on('incident:new', invalidate);
    socket.on('incident:update', invalidate);
    socket.on('facility:update', invalidate);

    return () => {
      socket.off('incident:new', invalidate);
      socket.off('incident:update', invalidate);
      socket.off('facility:update', invalidate);
    };
  }, [socket, queryClient]);

  const myIncidents = myIncidentsData?.incidents || [];
  const facilities = facilitiesData?.facilities || [];
  const allIncidents = allIncidentsData?.incidents || [];

  const activeReports = myIncidents.filter(
    (incident) => !['resolved', 'rejected'].includes(
      incident.status?.toLowerCase()
    )
  ).length;

  const resolvedReports = myIncidents.filter(
    (incident) => incident.status?.toLowerCase() === 'resolved'
  ).length;

  const verifiedReports = myIncidents.filter(
    (incident) =>
      incident.verification?.status?.toLowerCase() === 'verified' ||
      incident.verification?.status?.toLowerCase() === 'confirmed'
  ).length;

  return (
    <div className="min-h-screen bg-[#e9e9e7] text-[#242424]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Dashboard heading */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-800" />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">
                  RESQNET / CITIZEN PORTAL
                </p>
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-[#202020] sm:text-4xl">
                Your safety. Your community.
              </h1>

              <p className="mt-2 text-sm text-stone-600 sm:text-base">
                Monitor nearby incidents, report emergencies and stay informed.
              </p>
            </div>

            <Link
              to="/citizen/report"
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#252525] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-neutral-400/30 transition-all hover:-translate-y-0.5 hover:bg-black hover:shadow-xl sm:self-center"
            >
              <span className="text-lg">+</span>
              Report incident / SOS
            </Link>
          </div>
        </section>

        {/* Report statistics */}
        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total reports"
            value={myIncidents.length}
            description="Incidents submitted by you"
          />
          <StatCard
            label="Active reports"
            value={activeReports}
            description="Reports not yet resolved"
          />
          <StatCard
            label="Resolved reports"
            value={resolvedReports}
            description="Reports marked as resolved"
          />
        </section>

        {/* Emergency contacts */}
        <section className="mb-8">
          <EmergencyContacts />
        </section>

        {/* Map and reports */}
        <section className="grid items-start gap-6 lg:grid-cols-5">

          {/* Live map */}
          <div className="space-y-4 lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-stone-300 bg-[#f4f4f2] shadow-sm">

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 bg-[#dededb] px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-600">
                      RESQNET / LIVE MONITORING
                    </p>
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-[#242424]">
                    Incident map
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Incidents, nearby shelters and hospitals
                  </p>
                </div>

                <div className="rounded-lg border border-stone-300 bg-[#f3f3f1] px-3 py-2">
                  <p className="text-xs font-semibold text-stone-700">
                    {allIncidents.length} incidents
                  </p>
                </div>
              </div>

              <div className="overflow-hidden bg-[#e3e3e0] p-2">
                <div className="overflow-hidden rounded-xl border border-stone-300">
                  <IncidentMap
                    incidents={allIncidents}
                    facilities={facilities}
                    height="480px"
                  />
                </div>
              </div>
            </div>

            {/* Offline map */}
            <div className="rounded-2xl border border-stone-300 bg-[#f1f1ef] p-4 shadow-sm">
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                  MAP ACCESS
                </p>
                <h3 className="mt-1 text-sm font-bold text-[#242424]">
                  Offline map controls
                </h3>
              </div>
              <OfflineMapControl center={myLocation} />
            </div>
          </div>

          {/* Citizen reports */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
                  YOUR ACTIVITY
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-[#242424]">
                  Your reports
                </h2>
                <p className="mt-1 text-xs text-stone-600">
                  Track the status of incidents you have submitted.
                </p>
              </div>

              <span className="rounded-lg border border-stone-300 bg-[#dededb] px-3 py-1.5 text-xs font-bold text-stone-700">
                {myIncidents.length} total
              </span>
            </div>

            <div className="space-y-4">
              {myIncidents.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-400 bg-[#e2e2df] p-6 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#cececa] text-xl text-stone-700">
                    +
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#292929]">
                    No reports yet
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-stone-600">
                    Reports you submit will appear here with live status updates.
                  </p>
                  <Link
                    to="/citizen/report"
                    className="mt-4 inline-flex rounded-lg bg-[#292929] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black"
                  >
                    Submit your first report
                  </Link>
                </div>
              )}

              {myIncidents.map((incident) => (
                <IncidentCard
                  key={incident._id}
                  incident={incident}
                />
              ))}
            </div>
          </div>

        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-stone-300 py-5">
          <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
              RESQNET · COMMUNITY SAFETY NETWORK
            </p>
            <p className="text-[10px] text-stone-500">
              Stay alert. Stay safe. Help your community.
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}

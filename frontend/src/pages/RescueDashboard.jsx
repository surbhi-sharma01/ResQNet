
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Navbar from '../components/Navbar.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import IncidentCard from '../components/IncidentCard.jsx';

export default function RescueDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  const { data: incidentsData } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: async () => (await api.get('/incidents')).data,
  });

  const patchIncidentInCache = (updatedIncident) => {
    queryClient.setQueriesData({ queryKey: ['incidents'] }, (old) => {
      if (!old?.incidents) return old;
      return {
        ...old,
        incidents: old.incidents.map((i) =>
          i._id === updatedIncident._id ? updatedIncident : i
        ),
      };
    });
  };

  const advanceStatus = useMutation({
    mutationFn: async ({ id, status }) =>
      (await api.patch(`/incidents/${id}/status`, {
        status,
        note: 'Updated by rescue team',
      })).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  const selfAssign = useMutation({
    mutationFn: async ({ id }) =>
      (await api.patch(`/incidents/${id}/status`, {
        status: 'dispatched',
        assignedTeam: user._id,
        note: 'Self-assigned by rescue team',
      })).data,
    onSuccess: (data) => patchIncidentInCache(data.incident),
  });

  useEffect(() => {
    if (!socket) return;

    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: ['incidents'] });

    socket.on('incident:new', invalidate);
    socket.on('incident:update', invalidate);

    return () => {
      socket.off('incident:new', invalidate);
      socket.off('incident:update', invalidate);
    };
  }, [socket, queryClient]);

  const allIncidents = incidentsData?.incidents || [];

  const myAssignments = allIncidents.filter(
    (i) => i.assignedTeam?._id === user?._id
  );

  const unassignedUrgent = allIncidents.filter(
    (i) =>
      !i.assignedTeam &&
      ['critical', 'high'].includes(i.severity) &&
      i.status !== 'resolved'
  );

  const activeAssignments = myAssignments.filter(
    (i) => i.status !== 'resolved'
  ).length;

  const criticalUrgent = unassignedUrgent.filter(
    (i) => i.severity === 'critical'
  ).length;

  const resolvedAssignments = myAssignments.filter(
    (i) => i.status === 'resolved'
  ).length;

  return (
    <div className="min-h-screen bg-[#e9e9e7] text-[#242424]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* Page heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#54866b]" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#54866b]">
                ResQNet · Field Operations
              </p>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
              Rescue Team Console
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#666660]">
              Monitor emergency activity, manage your assignments, and respond
              to urgent incidents in your area.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#c9d9ce] bg-[#e1ebe4] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#54866b] text-lg text-white">
              ✚
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#54866b]">
                Rescue personnel
              </p>
              <p className="text-sm font-semibold text-[#293d30]">
                Field response active
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#d2d2ce] bg-[#f1f1ee] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#666660]">My assignments</p>
              <span className="rounded-lg bg-[#e1e8ef] px-2.5 py-1 text-xs text-[#54799d]">01</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#242424]">
              {myAssignments.length}
            </p>
            <p className="mt-1 text-xs text-[#777770]">Total assigned incidents</p>
          </div>

          <div className="rounded-2xl border border-[#d2d2ce] bg-[#e2ebe4] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#55715e]">Active assignments</p>
              <span className="rounded-lg bg-[#cfe0d3] px-2.5 py-1 text-xs text-[#477457]">02</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#315b40]">
              {activeAssignments}
            </p>
            <p className="mt-1 text-xs text-[#63806a]">Still requiring action</p>
          </div>

          <div className="rounded-2xl border border-[#ead7b6] bg-[#f4ead9] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#8b6a32]">Urgent unassigned</p>
              <span className="rounded-lg bg-[#eddbb8] px-2.5 py-1 text-xs text-[#9a6a20]">03</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#95671f]">
              {unassignedUrgent.length}
            </p>
            <p className="mt-1 text-xs text-[#987c4d]">High and critical priority</p>
          </div>

          <div className="rounded-2xl border border-[#e7c9c6] bg-[#f3e4e1] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#a14e47]">Critical unassigned</p>
              <span className="rounded-lg bg-[#eacbc6] px-2.5 py-1 text-xs text-[#b54d44]">04</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#b54d44]">
              {criticalUrgent}
            </p>
            <p className="mt-1 text-xs text-[#a86a63]">Needs immediate attention</p>
          </div>
        </div>

        {/* Map section */}
        <section className="mb-7 overflow-hidden rounded-2xl border border-[#cececa] bg-[#f0f0ed] shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#d5d5d0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dce8f2] text-[#54799d]">
                  <span className="text-base">⌖</span>
                </span>
                <h2 className="font-bold text-[#292929]">Live Incident Map</h2>
              </div>
              <p className="mt-1 pl-10 text-xs text-[#777770]">
                Select an incident to locate it on the map
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-[#666660]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c94c4c]" />
                Critical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d98a35]" />
                High
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d8b64c]" />
                Medium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#54866b]" />
                Low
              </span>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="overflow-hidden rounded-xl border border-[#d1d1cc]">
              <IncidentMap
                incidents={allIncidents}
                height="500px"
                flyToIncidentId={selectedIncidentId}
              />
            </div>
          </div>
        </section>

        {/* Incident lists */}
        <div className="grid items-start gap-6 lg:grid-cols-2">

          {/* My assignments */}
          <section className="overflow-hidden rounded-2xl border border-[#cfd8d0] bg-[#edf1ed]">
            <div className="flex items-center justify-between border-b border-[#d3ddd4] px-5 py-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#54866b]">
                  Field operations
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#293d30]">
                  My Assignments
                </h2>
              </div>
              <span className="rounded-full bg-[#d5e5d8] px-3 py-1.5 text-xs font-bold text-[#477457]">
                {myAssignments.length}
              </span>
            </div>

            <div className="space-y-3 p-4">
              {myAssignments.map((incident) => (
                <IncidentCard
                  key={incident._id}
                  incident={incident}
                  onClick={() => setSelectedIncidentId(incident._id)}
                  actions={
                    incident.status !== 'resolved' && (
                      <button
                        onClick={() =>
                          advanceStatus.mutate({
                            id: incident._id,
                            status: 'resolved',
                          })
                        }
                        disabled={advanceStatus.isPending}
                        className="rounded-lg border border-[#9bb9a2] bg-[#e0ebe2] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-[#477457] transition hover:bg-[#cfe0d3] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {advanceStatus.isPending ? 'Updating...' : '✓ Mark resolved'}
                      </button>
                    )
                  }
                />
              ))}

              {myAssignments.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#b8cbbd] bg-[#e5ece6] px-4 py-9 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#d5e5d8] text-xl text-[#54866b]">
                    ✓
                  </div>
                  <p className="text-sm font-semibold text-[#405b47]">
                    No assignments yet
                  </p>
                  <p className="mt-1 text-xs text-[#718274]">
                    Your assigned incidents will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-[#d3ddd4] px-5 py-3">
              <p className="text-[10px] font-medium text-[#718274]">
                {resolvedAssignments} resolved · {activeAssignments} still active
              </p>
            </div>
          </section>

          {/* Unassigned urgent */}
          <section className="overflow-hidden rounded-2xl border border-[#e4d5bc] bg-[#f2ede4]">
            <div className="flex items-center justify-between border-b border-[#e6d9c4] px-5 py-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#a67b37]">
                  Priority response
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#51432e]">
                  Unassigned &amp; Urgent
                </h2>
              </div>
              <span className="rounded-full bg-[#ead9b9] px-3 py-1.5 text-xs font-bold text-[#95671f]">
                {unassignedUrgent.length}
              </span>
            </div>

            <div className="space-y-3 p-4">
              {unassignedUrgent.map((incident) => (
                <IncidentCard
                  key={incident._id}
                  incident={incident}
                  onClick={() => setSelectedIncidentId(incident._id)}
                  actions={
                    <button
                      onClick={() => selfAssign.mutate({ id: incident._id })}
                      disabled={selfAssign.isPending}
                      className="rounded-lg border border-[#d2b77e] bg-[#f5e8cc] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wide text-[#8c6427] transition hover:bg-[#ecd9b1] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {selfAssign.isPending ? 'Assigning...' : '+ Self-assign'}
                    </button>
                  }
                />
              ))}

              {unassignedUrgent.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#ddcba9] bg-[#f5eee1] px-4 py-9 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#eadfca] text-xl text-[#a67b37]">
                    ✓
                  </div>
                  <p className="text-sm font-semibold text-[#68583e]">
                    No urgent unassigned incidents
                  </p>
                  <p className="mt-1 text-xs text-[#928064]">
                    New high-priority incidents will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-[#e6d9c4] px-5 py-3">
              <p className="text-[10px] font-medium text-[#927e5e]">
                Prioritize critical incidents before high-priority incidents.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex flex-col gap-2 border-t border-[#d0d0cc] py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666660]">
            RESQNET <span className="font-normal text-[#999991]">· Rescue Operations</span>
          </p>
          <p className="text-[10px] text-[#888880]">
            Stay alert. Respond with care. Save lives.
          </p>
        </footer>
      </main>
    </div>
  );
}

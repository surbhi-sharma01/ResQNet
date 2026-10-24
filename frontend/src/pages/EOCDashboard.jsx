
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useSocket } from '../context/SocketContext.jsx';
import Navbar from '../components/Navbar.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import IncidentCard from '../components/IncidentCard.jsx';
import EmergencyDirectory from '../components/EmergencyDirectory.jsx';
import IssueAlertPanel from '../components/IssueAlertPanel.jsx';

const STATUS_FLOW = [
  'reported',
  'acknowledged',
  'dispatched',
  'in_progress',
  'resolved',
];

const FILTERS = [
  {
    value: '',
    label: 'All',
    active: 'border-[#526b5a] bg-[#344f3d] text-white',
  },
  {
    value: 'critical',
    label: 'Critical',
    active: 'border-[#dfb4ae] bg-[#f5e5e2] text-[#a45149]',
  },
  {
    value: 'high',
    label: 'High',
    active: 'border-[#e5c7a9] bg-[#f5eadf] text-[#a56b35]',
  },
  {
    value: 'medium',
    label: 'Medium',
    active: 'border-[#e4d5a9] bg-[#f5efdE] text-[#92783d]',
  },
  {
    value: 'low',
    label: 'Low',
    active: 'border-[#c5d9c9] bg-[#e3eee5] text-[#4d7959]',
  },
];

function nextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  return idx >= 0 && idx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[idx + 1]
    : null;
}

export default function EOCDashboard() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const [severityFilter, setSeverityFilter] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  const { data: incidentsData } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: async () => (await api.get('/incidents')).data,
    refetchInterval: 30000,
  });

  const { data: facilitiesData } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => (await api.get('/facilities')).data,
  });

  const { data: summaryData } = useQuery({
    queryKey: ['ai', 'situation-summary'],
    queryFn: async () => (await api.get('/ai/situation-summary')).data,
    refetchInterval: 20000,
  });

  const advanceStatus = useMutation({
    mutationFn: async ({ id, status }) =>
      (
        await api.patch(`/incidents/${id}/status`, {
          status,
          note: `Advanced to ${status} by EOC`,
        })
      ).data,

    onSuccess: (data) => {
      queryClient.setQueriesData(
        { queryKey: ['incidents'] },
        (old) => {
          if (!old?.incidents) return old;

          return {
            ...old,
            incidents: old.incidents.map((i) =>
              i._id === data.incident._id ? data.incident : i
            ),
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: ['ai', 'situation-summary'],
      });
    },
  });

  useEffect(() => {
    if (!socket) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({
        queryKey: ['ai', 'situation-summary'],
      });
    };

    socket.on('incident:new', invalidate);
    socket.on('incident:update', invalidate);
    socket.on('incident:escalated', invalidate);

    return () => {
      socket.off('incident:new', invalidate);
      socket.off('incident:update', invalidate);
      socket.off('incident:escalated', invalidate);
    };
  }, [socket, queryClient]);

  const allIncidents = incidentsData?.incidents || [];

  const incidents = allIncidents.filter(
    (i) => !severityFilter || i.severity === severityFilter
  );

  const escalatedIncidents = allIncidents.filter((i) => i.escalated);

  const facilities = facilitiesData?.facilities || [];

  const openIncidents = allIncidents.filter(
    (i) => i.status !== 'resolved'
  ).length;

  const resolvedIncidents = allIncidents.filter(
    (i) => i.status === 'resolved'
  ).length;

  const criticalIncidents = allIncidents.filter(
    (i) => i.severity === 'critical' && i.status !== 'resolved'
  ).length;

  return (
    <div className="min-h-screen bg-[#e9e9e5]">
      <Navbar />

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Dashboard heading */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#629873]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#718578]">
                RESQNET · EMERGENCY OPERATIONS CENTRE
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-[#29332d] sm:text-4xl">
              Operations dashboard
            </h1>

            <p className="mt-2 text-sm text-[#758078]">
              Live picture of every open incident across the region.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c8d9cc] bg-[#e5eee6] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#55745e]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#60976e]" />
              Live monitoring
            </span>

            <span className="rounded-full border border-[#d3d6cf] bg-[#f1f1ed] px-3 py-2 text-[10px] font-semibold text-[#778078]">
              {facilities.length} facilities
            </span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#d3d8d1] bg-[#f1f1ed] p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#849087]">
              Total incidents
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[#303b33]">
              {allIncidents.length}
            </p>
            <p className="mt-1 text-[10px] text-[#929b94]">
              All recorded reports
            </p>
          </div>

          <div className="rounded-2xl border border-[#cbd9ce] bg-[#e6eee7] p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#718978]">
              Open incidents
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[#42674c]">
              {openIncidents}
            </p>
            <p className="mt-1 text-[10px] text-[#819287]">
              Awaiting resolution
            </p>
          </div>

          <div className="rounded-2xl border border-[#e1c9c3] bg-[#f3e8e5] p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a47870]">
              Critical incidents
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[#a45149]">
              {criticalIncidents}
            </p>
            <p className="mt-1 text-[10px] text-[#a68b85]">
              Unresolved critical reports
            </p>
          </div>
        </div>

        {/* Escalated incidents */}
        {escalatedIncidents.length > 0 && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-[#e0bcb6] bg-[#f5e6e3]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8cbc6] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edd2cd] text-[#a45149]">
                  ⚠
                </span>

                <div>
                  <h2 className="text-xs font-bold text-[#a45149]">
                    Escalated incidents
                  </h2>
                  <p className="mt-0.5 text-[10px] text-[#a87972]">
                    Verified critical reports awaiting dispatch
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-[#dfb8b1] bg-[#f9efed] px-3 py-1 text-[10px] font-bold text-[#a45149]">
                {escalatedIncidents.length} escalated
              </span>
            </div>

            <div className="flex flex-wrap gap-2 p-4">
              {escalatedIncidents.map((inc) => (
                <button
                  key={inc._id}
                  type="button"
                  onClick={() => setSelectedIncidentId(inc._id)}
                  className="rounded-xl border border-[#dfbdb7] bg-[#f9efed] px-3 py-2 text-left text-xs font-semibold text-[#87524b] transition hover:border-[#c98c82] hover:bg-white"
                >
                  {inc.title}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* AI situation summary */}
        {summaryData && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-[#cbdce9] bg-[#e5edf4]">
            <div className="flex items-center gap-3 border-b border-[#d0deea] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d3e1ed] text-[#547b9b]">
                ✨
              </div>

              <div>
                <h2 className="text-xs font-bold text-[#456b8d]">
                  AI situation summary
                </h2>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.13em] text-[#8299ab]">
                  Operational intelligence
                </p>
              </div>
            </div>

            <p className="px-4 py-4 text-sm leading-6 text-[#526b80]">
              {summaryData.summary}
            </p>
          </section>
        )}

        {/* Main operational layout */}
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-5">

          {/* Left column */}
          <div className="space-y-6 lg:col-span-3">

            {/* Map */}
            <section className="overflow-hidden rounded-2xl border border-[#d0d7d0] bg-[#f0f1ed] shadow-[0_4px_18px_rgba(40,50,43,0.05)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d6ddd6] bg-[#e5ebe5] px-4 py-4">
                <div>
                  <h2 className="text-sm font-bold text-[#35443a]">
                    Operational map
                  </h2>
                  <p className="mt-1 text-[10px] text-[#849087]">
                    Incident locations and emergency facilities
                  </p>
                </div>

                <span className="rounded-full border border-[#cbd8ce] bg-[#eff4ef] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#64806b]">
                  {incidents.length} visible
                </span>
              </div>

              <div className="p-2 sm:p-3">
                <IncidentMap
                  incidents={incidents}
                  facilities={facilities}
                  height="480px"
                  flyToIncidentId={selectedIncidentId}
                />
              </div>
            </section>

            {/* Broadcast panel */}
            <IssueAlertPanel />

            {/* Directory panel */}
            <EmergencyDirectory />
          </div>

          {/* Right column: incident feed */}
          <section className="min-w-0 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-[#d0d7d0] bg-[#f0f1ed] shadow-[0_4px_18px_rgba(40,50,43,0.05)]">

              <div className="border-b border-[#d6ddd6] bg-[#e5ebe5] p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-[#35443a]">
                      Incident feed
                    </h2>
                    <p className="mt-1 text-[10px] text-[#849087]">
                      Select a report to locate it on the map
                    </p>
                  </div>

                  <span className="rounded-full border border-[#cbd8ce] bg-[#eff4ef] px-3 py-1.5 text-xs font-bold tabular-nums text-[#55765e]">
                    {incidents.length}
                  </span>
                </div>

                {/* Severity filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.value || 'all'}
                      type="button"
                      onClick={() => setSeverityFilter(filter.value)}
                      className={`rounded-lg border px-3 py-2 text-[9px] font-bold uppercase tracking-wide transition ${
                        severityFilter === filter.value
                          ? filter.active
                          : 'border-[#d4d9d2] bg-[#eff0eb] text-[#7d877f] hover:border-[#b8c7ba] hover:text-[#526b59]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Incident list */}
              <div className="max-h-[1000px] space-y-3 overflow-y-auto p-3 sm:p-4">
                {incidents.map((incident) => {
                  const next = nextStatus(incident.status);

                  return (
                    <div
                      key={incident._id}
                      className={`rounded-xl transition ${
                        selectedIncidentId === incident._id
                          ? 'ring-2 ring-[#789b83] ring-offset-2 ring-offset-[#f0f1ed]'
                          : ''
                      }`}
                    >
                      <IncidentCard
                        incident={incident}
                        onClick={() =>
                          setSelectedIncidentId(incident._id)
                        }
                        actions={
                          next && (
                            <button
                              type="button"
                              onClick={() =>
                                advanceStatus.mutate({
                                  id: incident._id,
                                  status: next,
                                })
                              }
                              disabled={advanceStatus.isPending}
                              className="rounded-lg border border-[#b9d0bf] bg-[#e4eee6] px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-[#4e7659] transition hover:border-[#91b69a] hover:bg-[#d6e7da] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Mark {next.replace('_', ' ')} →
                            </button>
                          )
                        }
                      />
                    </div>
                  );
                })}

                {incidents.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[#cbd5cc] bg-[#e9ece7] px-4 py-8 text-center">
                    <span className="text-2xl">📋</span>
                    <p className="mt-3 text-xs font-semibold text-[#65756a]">
                      No matching incidents
                    </p>
                    <p className="mt-1 text-[10px] text-[#929b94]">
                      Try selecting another severity filter.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Feed footer */}
            <div className="mt-3 flex items-center justify-between px-2 text-[9px] uppercase tracking-wider text-[#929b94]">
              <span>Resolved: {resolvedIncidents}</span>
              <span>ResQNet operations</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-[#d1d6cf] py-5 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#929b94]">
            RESQNET · EMERGENCY OPERATIONS CENTRE
          </p>
        </footer>
      </main>
    </div>
  );
}

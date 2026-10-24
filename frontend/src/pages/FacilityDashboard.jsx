
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../api/axiosClient.js';
import { useSocket } from '../context/SocketContext.jsx';
import Navbar from '../components/Navbar.jsx';
import IncidentMap from '../components/IncidentMap.jsx';

const LABELS = {
  hospital: {
    noun: 'Hospital',
    capacityNoun: 'beds',
    resourceHint: 'e.g. ICU, ambulance, oxygen, blood bank',
    accent: '#5486b5',
    light: '#e3edf5',
    border: '#c7d9e8',
    text: '#3f668a',
    icon: '✚',
    description: 'Manage medical capacity and keep emergency responders informed about available beds and resources.',
  },
  shelter: {
    noun: 'Shelter',
    capacityNoun: 'occupants',
    resourceHint: 'e.g. bedding, drinking water, medical tent',
    accent: '#54866b',
    light: '#e2ece4',
    border: '#c8d9cc',
    text: '#477457',
    icon: '⌂',
    description: 'Manage shelter capacity and keep citizens and emergency teams informed about available accommodation.',
  },
};

const FALLBACK_LOCATION = {
  lng: 72.8777,
  lat: 19.076,
  label: 'Mumbai (demo default)',
};

export default function FacilityDashboard({ facilityType }) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const labels = LABELS[facilityType] || LABELS.hospital;

  const { data: mineData, isLoading } = useQuery({
    queryKey: ['facilities', 'mine'],
    queryFn: async () => (await api.get('/facilities/mine')).data,
  });

  const { data: allFacilitiesData } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => (await api.get('/facilities')).data,
  });

  const { data: incidentsData } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: async () => (await api.get('/incidents')).data,
  });

  const facility = mineData?.facility || null;

  const [registerForm, setRegisterForm] = useState({
    name: '',
    address: '',
    capacityTotal: 50,
    contactPhone: '',
    resources: '',
  });

  const [capacityUsed, setCapacityUsed] = useState(0);
  const [status, setStatus] = useState('operational');
  const [locationStatus, setLocationStatus] = useState('detecting');
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
        });
        setLocationStatus('live');
      },
      () => setLocationStatus('denied'),
      { timeout: 6000 }
    );
  }, []);

  useEffect(() => {
    if (facility) {
      setCapacityUsed(facility.capacityUsed);
      setStatus(facility.status);
    }
  }, [facility]);

  useEffect(() => {
    if (!socket) return;

    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: ['facilities'] });

    socket.on('facility:update', invalidate);
    socket.on('facility:new', invalidate);

    return () => {
      socket.off('facility:update', invalidate);
      socket.off('facility:new', invalidate);
    };
  }, [socket, queryClient]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const jitter = () => (Math.random() - 0.5) * 0.02;

      const lng = coords
        ? coords.lng
        : FALLBACK_LOCATION.lng + jitter();

      const lat = coords
        ? coords.lat
        : FALLBACK_LOCATION.lat + jitter();

      const { data } = await api.post('/facilities', {
        type: facilityType,
        name: registerForm.name,
        address: registerForm.address,
        capacityTotal: Number(registerForm.capacityTotal),
        contactPhone: registerForm.contactPhone,
        resources: registerForm.resources
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
        lng,
        lat,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () =>
      (
        await api.patch(`/facilities/${facility._id}/capacity`, {
          capacityUsed: Number(capacityUsed),
          status,
        })
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });

  const occupancyPercent = facility?.capacityTotal
    ? Math.round((capacityUsed / facility.capacityTotal) * 100)
    : 0;

  const occupancyColor =
    occupancyPercent >= 90
      ? '#c94c4c'
      : occupancyPercent >= 60
        ? '#d18a35'
        : '#54866b';

  const statusStyles = {
    operational: 'bg-[#e2ece4] text-[#477457] border-[#c8d9cc]',
    full: 'bg-[#f4ead9] text-[#95671f] border-[#ead7b6]',
    closed: 'bg-[#f3e4e1] text-[#b54d44] border-[#e7c9c6]',
  };

  return (
    <div className="min-h-screen bg-[#e9e9e7] text-[#242424]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: labels.accent }}
              />
              <p
                className="font-mono text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: labels.text }}
              >
                ResQNet · Facility Operations
              </p>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#242424] sm:text-4xl">
              {labels.noun} Portal
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#666660]">
              {labels.description}
            </p>
          </div>

          <div
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{
              backgroundColor: labels.light,
              borderColor: labels.border,
            }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-white"
              style={{ backgroundColor: labels.accent }}
            >
              {labels.icon}
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: labels.text }}
              >
                Facility account
              </p>
              <p className="text-sm font-semibold text-[#29332c]">
                {labels.noun} management
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-[#d2d2ce] bg-[#f1f1ee] p-8 text-center">
            <p className="text-sm text-[#666660]">
              Loading your facility information...
            </p>
          </div>
        ) : !facility ? (

          /* First-time registration */
          <section className="overflow-hidden rounded-2xl border border-[#d2d2ce] bg-[#f1f1ee] shadow-sm">
            <div
              className="border-b px-6 py-5 sm:px-8"
              style={{
                backgroundColor: labels.light,
                borderColor: labels.border,
              }}
            >
              <p
                className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: labels.text }}
              >
                First-time setup
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#292929]">
                Register your {labels.noun.toLowerCase()}
              </h2>
              <p className="mt-1 text-xs text-[#666660]">
                Add your facility details to make it visible on the ResQNet network.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                registerMutation.mutate();
              }}
              className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8"
            >
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#666660]">
                  Facility name
                </label>
                <input
                  required
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, name: e.target.value })
                  }
                  placeholder={`Enter ${labels.noun.toLowerCase()} name`}
                  className="w-full rounded-xl border border-[#cececa] bg-[#e9e9e7] px-4 py-3 text-sm text-[#242424] outline-none transition focus:border-[#8da9bf] focus:ring-2 focus:ring-[#dce8f2]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#666660]">
                  Address
                </label>
                <input
                  value={registerForm.address}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, address: e.target.value })
                  }
                  placeholder="Enter full facility address"
                  className="w-full rounded-xl border border-[#cececa] bg-[#e9e9e7] px-4 py-3 text-sm text-[#242424] outline-none transition focus:border-[#8da9bf] focus:ring-2 focus:ring-[#dce8f2]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#666660]">
                  Total {labels.capacityNoun}
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={registerForm.capacityTotal}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      capacityTotal: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#cececa] bg-[#e9e9e7] px-4 py-3 text-sm text-[#242424] outline-none focus:border-[#8da9bf] focus:ring-2 focus:ring-[#dce8f2]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#666660]">
                  Contact phone
                </label>
                <input
                  value={registerForm.contactPhone}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      contactPhone: e.target.value,
                    })
                  }
                  placeholder="Enter contact number"
                  className="w-full rounded-xl border border-[#cececa] bg-[#e9e9e7] px-4 py-3 text-sm text-[#242424] outline-none focus:border-[#8da9bf] focus:ring-2 focus:ring-[#dce8f2]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#666660]">
                  Available resources
                </label>
                <input
                  value={registerForm.resources}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      resources: e.target.value,
                    })
                  }
                  placeholder={labels.resourceHint}
                  className="w-full rounded-xl border border-[#cececa] bg-[#e9e9e7] px-4 py-3 text-sm text-[#242424] outline-none focus:border-[#8da9bf] focus:ring-2 focus:ring-[#dce8f2]"
                />
                <p className="mt-1.5 text-[11px] text-[#888880]">
                  Separate each resource with a comma.
                </p>
              </div>

              {/* Location status */}
              <div
                className="flex items-center gap-3 rounded-xl border px-4 py-3 sm:col-span-2"
                style={{
                  backgroundColor: labels.light,
                  borderColor: labels.border,
                }}
              >
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-xs font-bold text-[#3d4940]">
                    Facility map location
                  </p>
                  {locationStatus === 'detecting' && (
                    <p className="mt-0.5 text-xs text-[#777770]">
                      Detecting your location...
                    </p>
                  )}
                  {locationStatus === 'live' && (
                    <p className="mt-0.5 text-xs text-[#477457]">
                      Using your current device location.
                    </p>
                  )}
                  {locationStatus === 'denied' && (
                    <p className="mt-0.5 text-xs text-[#95671f]">
                      Location unavailable — will use {FALLBACK_LOCATION.label}.
                    </p>
                  )}
                </div>
              </div>

              {registerMutation.isError && (
                <p className="rounded-xl border border-[#e7c9c6] bg-[#f3e4e1] p-3 text-sm text-[#b54d44] sm:col-span-2">
                  {registerMutation.error?.response?.data?.message ||
                    'Could not register facility.'}
                </p>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: labels.accent }}
                >
                  {registerMutation.isPending
                    ? 'Registering facility...'
                    : `Register ${labels.noun}`}
                </button>
              </div>
            </form>
          </section>

        ) : (

          /* Registered facility dashboard */
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div
                className="rounded-2xl border p-5 shadow-sm"
                style={{
                  backgroundColor: labels.light,
                  borderColor: labels.border,
                }}
              >
                <p className="text-xs font-semibold text-[#666660]">
                  Total {labels.capacityNoun}
                </p>
                <p className="mt-3 text-3xl font-bold text-[#292929]">
                  {facility.capacityTotal}
                </p>
                <p className="mt-1 text-xs text-[#777770]">
                  Registered capacity
                </p>
              </div>

              <div className="rounded-2xl border border-[#d2d2ce] bg-[#f1f1ee] p-5 shadow-sm">
                <p className="text-xs font-semibold text-[#666660]">
                  Currently occupied
                </p>
                <p className="mt-3 text-3xl font-bold text-[#292929]">
                  {capacityUsed}
                </p>
                <p className="mt-1 text-xs text-[#777770]">
                  {occupancyPercent}% of total capacity
                </p>
              </div>

              <div className="rounded-2xl border border-[#c8d9cc] bg-[#e2ece4] p-5 shadow-sm">
                <p className="text-xs font-semibold text-[#55715e]">
                  Available {labels.capacityNoun}
                </p>
                <p className="mt-3 text-3xl font-bold text-[#315b40]">
                  {Math.max(0, facility.capacityTotal - capacityUsed)}
                </p>
                <p className="mt-1 text-xs text-[#63806a]">
                  Remaining capacity
                </p>
              </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-5">

              {/* Capacity management */}
              <section className="overflow-hidden rounded-2xl border border-[#d2d2ce] bg-[#f1f1ee] shadow-sm lg:col-span-2">
                <div
                  className="border-b px-5 py-5"
                  style={{
                    backgroundColor: labels.light,
                    borderColor: labels.border,
                  }}
                >
                  <p
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: labels.text }}
                  >
                    Facility controls
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[#292929]">
                    {facility.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#666660]">
                    {facility.location?.address || 'Facility address not provided'}
                  </p>
                </div>

                <div className="space-y-6 p-5">

                  {/* Occupancy */}
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#33332f]">
                          Occupancy level
                        </p>
                        <p className="mt-0.5 text-xs text-[#777770]">
                          Update current usage
                        </p>
                      </div>
                      <span
                        className="rounded-lg px-3 py-1.5 text-sm font-bold"
                        style={{
                          color: occupancyColor,
                          backgroundColor:
                            occupancyPercent >= 90
                              ? '#f3e4e1'
                              : occupancyPercent >= 60
                                ? '#f4ead9'
                                : '#e2ece4',
                        }}
                      >
                        {occupancyPercent}%
                      </span>
                    </div>

                    <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-[#deded9]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(occupancyPercent, 100)}%`,
                          backgroundColor: occupancyColor,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-medium text-[#888880]">
                      <span>0 {labels.capacityNoun}</span>
                      <span>{facility.capacityTotal} total</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={facility.capacityTotal}
                      value={capacityUsed}
                      onChange={(e) => setCapacityUsed(e.target.value)}
                      className="mt-5 w-full cursor-pointer"
                      style={{ accentColor: labels.accent }}
                    />

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#e9e9e7] px-4 py-3">
                      <span className="text-xs font-semibold text-[#666660]">
                        Current usage
                      </span>
                      <span className="text-sm font-bold text-[#292929]">
                        {capacityUsed} / {facility.capacityTotal}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#666660]">
                      Facility status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-xl border border-[#cececa] bg-[#e9e9e7] px-4 py-3 text-sm text-[#292929] outline-none focus:border-[#8da9bf] focus:ring-2 focus:ring-[#dce8f2]"
                    >
                      <option value="operational">Operational</option>
                      <option value="full">Full</option>
                      <option value="closed">Closed</option>
                    </select>

                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${
                          statusStyles[status] || statusStyles.operational
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: labels.accent }}
                  >
                    {updateMutation.isPending
                      ? 'Saving changes...'
                      : 'Push live update'}
                  </button>

                  {updateMutation.isSuccess && (
                    <p className="rounded-xl border border-[#c8d9cc] bg-[#e2ece4] px-3 py-2.5 text-center text-xs font-medium text-[#477457]">
                      ✓ Facility update broadcast successfully.
                    </p>
                  )}

                  {updateMutation.isError && (
                    <p className="rounded-xl border border-[#e7c9c6] bg-[#f3e4e1] px-3 py-2.5 text-center text-xs text-[#b54d44]">
                      {updateMutation.error?.response?.data?.message ||
                        'Could not update facility information.'}
                    </p>
                  )}
                </div>
              </section>

              {/* Regional map */}
              <section className="overflow-hidden rounded-2xl border border-[#d2d2ce] bg-[#f1f1ee] shadow-sm lg:col-span-3">
                <div className="border-b border-[#d5d5d0] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dce8f2] text-lg text-[#54799d]">
                      ⌖
                    </span>
                    <div>
                      <h2 className="font-bold text-[#292929]">
                        Regional Response Map
                      </h2>
                      <p className="mt-0.5 text-xs text-[#777770]">
                        Your facility, nearby facilities and reported incidents
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <div className="overflow-hidden rounded-xl border border-[#d1d1cc]">
                    <IncidentMap
                      incidents={incidentsData?.incidents || []}
                      facilities={allFacilitiesData?.facilities || []}
                      height="460px"
                    />
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        <footer className="mt-8 flex flex-col gap-2 border-t border-[#d0d0cc] py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666660]">
            RESQNET <span className="font-normal text-[#999991]">· Facility Network</span>
          </p>
          <p className="text-[10px] text-[#888880]">
            Better coordination. Faster relief. Stronger communities.
          </p>
        </footer>
      </main>
    </div>
  );
}

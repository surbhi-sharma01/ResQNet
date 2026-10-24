
import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

// Emergency severity colours
const SEVERITY_COLORS = {
  low: '#43866A',
  medium: '#D8B64C',
  high: '#D98A35',
  critical: '#C94C4C',
};

// Incident category symbols
const CATEGORY_EMOJI = {
  flood: '🌊',
  fire: '🔥',
  earthquake: '🏚️',
  medical: '🚑',
  structural: '🏗️',
  other: '❗',
};

const FADED_STATUSES = ['resolved', 'rejected', 'merged'];

// Create incident markers
function incidentIcon(incident) {
  const severity = incident.severity?.toLowerCase();
  const color =
    SEVERITY_COLORS[severity] || SEVERITY_COLORS.medium;

  const category = incident.category?.toLowerCase();
  const emoji =
    CATEGORY_EMOJI[category] || CATEGORY_EMOJI.other;

  const status = incident.status?.toLowerCase();
  const isFaded = FADED_STATUSES.includes(status);

  const shouldPulse =
    severity === 'critical' && !isFaded;

  return L.divIcon({
    className: '',
    html: `
      <div style="
        position:relative;
        width:38px;
        height:38px;
        display:flex;
        align-items:center;
        justify-content:center;
        opacity:${isFaded ? 0.4 : 1};
        filter:${isFaded ? 'grayscale(0.85)' : 'none'};
      ">
        ${
          shouldPulse
            ? `
              <span
                class="animate-pulseBeacon"
                style="
                  position:absolute;
                  width:38px;
                  height:38px;
                  border-radius:50%;
                  background:${color};
                  opacity:0.35;
                "
              ></span>
            `
            : ''
        }

        <span style="
          position:relative;
          width:30px;
          height:30px;
          border-radius:50%;
          background:${color};
          border:2px solid #ffffff;
          box-shadow:0 2px 7px rgba(0,0,0,0.3);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:14px;
        ">
          ${emoji}
        </span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

// Facility markers
const facilityIcon = (type) => {
  const isHospital = type?.toLowerCase() === 'hospital';

  const color = isHospital
    ? '#5486B5'
    : '#54866B';

  const symbol = isHospital ? '✚' : '⌂';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:25px;
        height:25px;
        border-radius:8px;
        background:${color};
        border:2px solid #ffffff;
        box-shadow:0 2px 7px rgba(0,0,0,0.3);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:14px;
        font-weight:bold;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

// Automatically center the map when real data first arrives
function AutoCenterOnData({ targetCenter, zoom }) {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (!targetCenter || hasCentered.current) return;

    map.setView(targetCenter, zoom);
    hasCentered.current = true;
  }, [targetCenter, zoom, map]);

  return null;
}

// Fly to a selected incident and open its popup
function FlyToIncident({
  incidentId,
  incidents,
  markerRefs,
}) {
  const map = useMap();

  useEffect(() => {
    if (!incidentId) return;

    const incident = incidents.find(
      (i) => i._id === incidentId
    );

    if (!incident?.location?.coordinates) return;

    const [lng, lat] = incident.location.coordinates;

    map.flyTo(
      [lat, lng],
      Math.max(map.getZoom(), 15),
      { duration: 1 }
    );

    const timer = setTimeout(() => {
      markerRefs.current[incidentId]?.openPopup();
    }, 650);

    return () => clearTimeout(timer);
  }, [incidentId, incidents, map, markerRefs]);

  return null;
}

// Calculate map center from available data
function computeDataCenter(incidents, facilities) {
  const points = [
    ...incidents.map((i) => i.location?.coordinates),
    ...facilities.map((f) => f.location?.coordinates),
  ].filter(
    (point) =>
      Array.isArray(point) &&
      point.length >= 2 &&
      Number.isFinite(point[0]) &&
      Number.isFinite(point[1])
  );

  if (points.length === 0) return null;

  const [lngSum, latSum] = points.reduce(
    ([lng, lat], [pLng, pLat]) => [
      lng + pLng,
      lat + pLat,
    ],
    [0, 0]
  );

  return [
    latSum / points.length,
    lngSum / points.length,
  ];
}

// Shared popup styling
const popupCardStyle = {
  fontFamily: 'inherit',
  color: '#292929',
  minWidth: '150px',
};

const popupLabelStyle = {
  marginTop: '5px',
  color: '#777773',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

const popupDescriptionStyle = {
  marginTop: '8px',
  color: '#555550',
  fontSize: '12px',
  lineHeight: '1.5',
};

export default function IncidentMap({
  incidents = [],
  facilities = [],
  center = [19.076, 72.8777],
  zoom = 12,
  height = '100%',
  onIncidentClick,
  flyToIncidentId = null,
}) {
  const dataCenter = computeDataCenter(
    incidents,
    facilities
  );

  const markerRefs = useRef({});

  return (
    <div
      style={{ height }}
      className="overflow-hidden rounded-2xl border border-[#c9d3ce] shadow-sm"
    >
      <MapContainer
        center={dataCenter || center}
        zoom={zoom}
        scrollWheelZoom
        style={{
          width: '100%',
          height: '100%',
          background: '#e9e9e7',
        }}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoCenterOnData
          targetCenter={dataCenter}
          zoom={zoom}
        />

        <FlyToIncident
          incidentId={flyToIncidentId}
          incidents={incidents}
          markerRefs={markerRefs}
        />

        {/* Incident markers */}
        {incidents.map((incident) => {
          const coordinates =
            incident.location?.coordinates;

          if (
            !Array.isArray(coordinates) ||
            coordinates.length < 2
          ) {
            return null;
          }

          const [lng, lat] = coordinates;

          return (
            <Marker
              key={incident._id}
              position={[lat, lng]}
              icon={incidentIcon(incident)}
              ref={(marker) => {
                if (marker) {
                  markerRefs.current[incident._id] = marker;
                }
              }}
              eventHandlers={{
                click: () =>
                  onIncidentClick?.(incident),
              }}
            >
              <Popup>
                <div
                  className="font-body"
                  style={popupCardStyle}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#292929',
                    }}
                  >
                    {incident.title}
                  </p>

                  <p style={popupLabelStyle}>
                    {incident.category} · {incident.severity} ·{' '}
                    {incident.status?.replace('_', ' ')}
                  </p>

                  <p style={popupDescriptionStyle}>
                    {incident.description}
                  </p>

                  {incident.verification && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '8px',
                        borderRadius: '8px',
                        background: '#e5ebe8',
                        color: '#426b57',
                        fontSize: '11px',
                      }}
                    >
                      Trust score:{' '}
                      <strong>
                        {incident.verification.trustScore}
                      </strong>
                      <br />
                      {incident.verification.trustState?.replace(
                        '_',
                        ' '
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Hospital and shelter markers */}
        {facilities.map((facility) => {
          const coordinates =
            facility.location?.coordinates;

          if (
            !Array.isArray(coordinates) ||
            coordinates.length < 2
          ) {
            return null;
          }

          const [lng, lat] = coordinates;

          return (
            <Marker
              key={facility._id}
              position={[lat, lng]}
              icon={facilityIcon(facility.type)}
            >
              <Popup>
                <div
                  className="font-body"
                  style={popupCardStyle}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#292929',
                    }}
                  >
                    {facility.name}
                  </p>

                  <p style={popupLabelStyle}>
                    {facility.type}
                  </p>

                  <div
                    style={{
                      marginTop: '9px',
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#e5ebe8',
                      color: '#426b57',
                      fontSize: '11px',
                    }}
                  >
                    Capacity:{' '}
                    <strong>
                      {facility.capacityUsed}/
                      {facility.capacityTotal}
                    </strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

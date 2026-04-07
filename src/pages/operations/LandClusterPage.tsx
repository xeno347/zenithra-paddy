import React from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import {
  buildClusters,
  clamp,
  getSavedLandClusterConfig,
  landClusterDemoParcels as parcels,
  saveLandClusterConfig,
  type ClusterAlgorithm,
  type LandParcel,
  type LandStatus,
} from "./landClusterDemoData";

function statusPill(status: LandStatus) {
  if (status === "ready") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  if (status === "planned") {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }
  return "bg-rose-50 text-rose-700 ring-rose-200";
}

function statusDot(status: LandStatus) {
  if (status === "ready") return "#16a34a";
  if (status === "planned") return "#2563eb";
  return "#e11d48";
}

function FitAllParcels({ points }: { points: [number, number][] }) {
  const map = useMap();

  React.useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map(([lat, lng]) => L.latLng(lat, lng)));
    map.fitBounds(bounds.pad(0.15));
  }, [map, points]);

  return null;
}

export default function LandClusterPage() {
  const initialConfig = React.useMemo(() => getSavedLandClusterConfig(3, 8), []);
  const [clusterCount, setClusterCount] = React.useState(initialConfig.clusterCount);
  const [clusterRadiusKm, setClusterRadiusKm] = React.useState(initialConfig.clusterRadiusKm);
  const [algorithm, setAlgorithm] = React.useState<ClusterAlgorithm>(initialConfig.algorithm);
  const [lastSavedAt, setLastSavedAt] = React.useState(initialConfig.savedAt);
  const [searchQuery, setSearchQuery] = React.useState("");

  const { clusters, outsideRadius, radiusKm } = React.useMemo(
    () => buildClusters(parcels, clusterCount, clusterRadiusKm, algorithm),
    [clusterCount, clusterRadiusKm, algorithm]
  );

  const filteredClusters = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return clusters;
    
    return clusters
      .map((cluster) => ({
        ...cluster,
        members: cluster.members.filter(
          (parcel) =>
            cluster.id.toLowerCase().includes(query) ||
            parcel.id.toLowerCase().includes(query) ||
            parcel.owner.toLowerCase().includes(query) ||
            parcel.location.toLowerCase().includes(query)
        ),
      }))
      .filter((cluster) => cluster.id.toLowerCase().includes(query) || cluster.members.length > 0);
  }, [clusters, searchQuery]);

  const totalLands = parcels.length;
  const readyLands = parcels.filter((x) => x.status === "ready").length;
  const plannedLands = parcels.filter((x) => x.status === "planned").length;
  const totalArea = parcels.reduce((acc, p) => acc + p.acres, 0);

  const allPoints = parcels.map((p) => p.coordinates);

  function handleSaveClusterInfo() {
    const saved = saveLandClusterConfig(clusterCount, clusterRadiusKm, algorithm);
    setLastSavedAt(saved.savedAt);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 shadow-soft sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight text-slate-900">Land Cluster</div>
            <div className="mt-1 text-sm text-slate-500">
              Build operational land clusters from mapped parcels and monitor collection readiness.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Algorithm</div>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as ClusterAlgorithm)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="kmeans">K-means</option>
                <option value="density">Density (DBSCAN-like)</option>
              </select>
            </label>

            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Cluster count</div>
              <input
                type="number"
                min={1}
                max={parcels.length}
                value={clusterCount}
                onChange={(e) => setClusterCount(clamp(Number(e.target.value) || 1, 1, parcels.length))}
                disabled={algorithm === "density"}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="mt-1 text-[10px] text-slate-500">
                {algorithm === "density" ? "Ignored for density clustering" : "Used only by K-means"}
              </div>
            </label>

            <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Radius per cluster (km)</div>
              <input
                type="number"
                min={1}
                max={50}
                value={clusterRadiusKm}
                onChange={(e) => setClusterRadiusKm(clamp(Number(e.target.value) || 1, 1, 50))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-100/80 px-4 py-2 text-xs font-semibold text-slate-600">
          Satellite map overview of all mapped lands and computed clusters ({algorithm === "kmeans" ? "K-means" : "Density"})
        </div>
        <MapContainer className="h-[460px] w-full" center={[21.2514, 81.6296]} zoom={11} scrollWheelZoom>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri'
          />
          <FitAllParcels points={allPoints} />

          {clusters.map((cluster) => (
            <Circle
              key={cluster.id}
              center={cluster.center}
              radius={radiusKm * 1000}
              pathOptions={{ color: cluster.color, fillColor: cluster.color, fillOpacity: 0.12, weight: 2 }}
            />
          ))}

          {clusters.map((cluster) =>
            cluster.members.map((parcel) => (
              <CircleMarker
                key={parcel.id}
                center={parcel.coordinates}
                radius={7}
                pathOptions={{ color: "#ffffff", weight: 2, fillColor: statusDot(parcel.status), fillOpacity: 1 }}
              >
                <Popup>
                  <div className="text-xs">
                    <div className="font-semibold">{parcel.id} - {parcel.owner}</div>
                    <div>{parcel.location}</div>
                    <div>Area: {parcel.acres} acres</div>
                    <div>Status: {parcel.status.replace("-", " ")}</div>
                    <div className="mt-1 font-semibold text-slate-700">{cluster.id}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))
          )}

          {outsideRadius.map((parcel) => (
            <CircleMarker
              key={`${parcel.id}-outside`}
              center={parcel.coordinates}
              radius={7}
              pathOptions={{ color: "#111827", weight: 2, fillColor: "#f59e0b", fillOpacity: 1 }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold">{parcel.id} - {parcel.owner}</div>
                  <div>{parcel.location}</div>
                  <div>Area: {parcel.acres} acres</div>
                  <div className="mt-1 font-semibold text-amber-700">Outside configured radius</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total lands</div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900">{totalLands}</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Lands ready for collection</div>
          <div className="mt-0.5 text-sm font-semibold text-emerald-700">{readyLands}</div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">Planned lands</div>
          <div className="mt-0.5 text-sm font-semibold text-blue-700">{plannedLands}</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Total area of land</div>
          <div className="mt-0.5 text-sm font-semibold text-amber-700">{totalArea.toFixed(2)} acres</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Save cluster info</div>
          <button
            type="button"
            onClick={handleSaveClusterInfo}
            className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
          >
            Save now
          </button>
          <div className="mt-1 truncate text-[10px] text-slate-500">
            {lastSavedAt ? `Saved: ${new Date(lastSavedAt).toLocaleString()}` : "Not saved yet"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.38fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Clusters and land parcels</div>
              <div className="mt-1 text-xs text-slate-500">
                Search clusters or lands. Lands are listed under each cluster only when inside the configured radius.
              </div>
            </div>

            <input
              type="text"
              placeholder="Search cluster, land ID, owner, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary/30 md:w-64"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filteredClusters.map((cluster) => (
              <div key={cluster.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">{cluster.id}</div>
                  <div className="text-xs text-slate-500">{cluster.members.length} lands</div>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Center: {cluster.center[0].toFixed(4)}, {cluster.center[1].toFixed(4)}
                </div>

                <div className="mt-3 space-y-2">
                  {cluster.members.length ? (
                    cluster.members.map((parcel) => (
                      <div key={parcel.id} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-semibold text-slate-800">{parcel.id} - {parcel.owner}</div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusPill(parcel.status)}`}>
                            {parcel.status === "not-available" ? "Not available" : parcel.status}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">{parcel.location} | {parcel.acres} acres</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 px-2.5 py-3 text-xs text-slate-500">
                      No lands inside this radius.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredClusters.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <div className="text-sm font-semibold text-slate-600">No clusters found</div>
              <div className="mt-1 text-xs text-slate-500">Try adjusting your search query</div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-900">Map legend</div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Ready for collection
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Planned
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Not available
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Outside radius
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Outside configured radius</div>
            <div className="mt-0.5 text-sm font-semibold text-amber-700">{outsideRadius.length}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

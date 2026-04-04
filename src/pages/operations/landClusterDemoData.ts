export type LandStatus = "ready" | "planned" | "not-available";

export type LandParcel = {
  id: string;
  owner: string;
  location: string;
  acres: number;
  status: LandStatus;
  coordinates: [number, number];
};

export type ClusterResult = {
  id: string;
  center: [number, number];
  members: LandParcel[];
  color: string;
};

export type SavedLandClusterConfig = {
  clusterCount: number;
  clusterRadiusKm: number;
  savedAt: string;
};

export const landClusterDemoParcels: LandParcel[] = [
  { id: "LP-101", owner: "Mahesh Patel", location: "Kharora Block", acres: 6.5, status: "ready", coordinates: [21.2809, 81.738] },
  { id: "LP-102", owner: "Ritu Sharma", location: "Tilda", acres: 8.25, status: "ready", coordinates: [21.3239, 81.6643] },
  { id: "LP-103", owner: "Suresh Rao", location: "Abhanpur", acres: 4, status: "planned", coordinates: [21.1948, 81.7725] },
  { id: "LP-104", owner: "Kamalini Devi", location: "Arang", acres: 3.75, status: "not-available", coordinates: [21.1901, 81.9568] },
  { id: "LP-105", owner: "Pradeep Joshi", location: "Mandir Hasaud", acres: 5.2, status: "planned", coordinates: [21.249, 81.873] },
  { id: "LP-106", owner: "Nirmala Bai", location: "Dharsiwa", acres: 7.1, status: "ready", coordinates: [21.3005, 81.7812] },
  { id: "LP-107", owner: "Gopal Verma", location: "Sejbahar", acres: 2.9, status: "not-available", coordinates: [21.2165, 81.7001] },
  { id: "LP-108", owner: "Rekha Sahu", location: "Naya Raipur", acres: 4.6, status: "planned", coordinates: [21.222, 81.8034] },
];

const clusterPalette = ["#6f8a2b", "#0f766e", "#b45309", "#be123c", "#1d4ed8", "#7c3aed"];
const LAND_CLUSTER_CONFIG_KEY = "landCluster.savedConfig.v1";

export function getSavedLandClusterConfig(defaultClusterCount = 3, defaultClusterRadiusKm = 8) {
  const fallback: SavedLandClusterConfig = {
    clusterCount: clamp(defaultClusterCount, 1, landClusterDemoParcels.length),
    clusterRadiusKm: clamp(defaultClusterRadiusKm, 1, 50),
    savedAt: "",
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(LAND_CLUSTER_CONFIG_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<SavedLandClusterConfig>;
    return {
      clusterCount: clamp(Number(parsed.clusterCount) || fallback.clusterCount, 1, landClusterDemoParcels.length),
      clusterRadiusKm: clamp(Number(parsed.clusterRadiusKm) || fallback.clusterRadiusKm, 1, 50),
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
    };
  } catch {
    return fallback;
  }
}

export function saveLandClusterConfig(clusterCount: number, clusterRadiusKm: number) {
  const payload: SavedLandClusterConfig = {
    clusterCount: clamp(clusterCount, 1, landClusterDemoParcels.length),
    clusterRadiusKm: clamp(clusterRadiusKm, 1, 50),
    savedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LAND_CLUSTER_CONFIG_KEY, JSON.stringify(payload));
    } catch {
      // Best-effort persistence only.
    }
  }

  return payload;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = toRadians(b[0] - a[0]);
  const dLon = toRadians(b[1] - a[1]);
  const lat1 = toRadians(a[0]);
  const lat2 = toRadians(b[0]);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function averageCenter(points: [number, number][]) {
  if (!points.length) return [21.2514, 81.6296] as [number, number];
  const [latSum, lngSum] = points.reduce(
    (acc, p) => [acc[0] + p[0], acc[1] + p[1]],
    [0, 0]
  );
  return [latSum / points.length, lngSum / points.length] as [number, number];
}

export function buildClusters(data: LandParcel[], requestedClusters: number, radiusKm: number) {
  const k = clamp(requestedClusters, 1, data.length);
  const safeRadius = clamp(radiusKm, 1, 50);
  const sorted = [...data].sort((a, b) => a.coordinates[0] - b.coordinates[0]);
  const stride = Math.max(1, Math.floor(sorted.length / k));

  let centroids: [number, number][] = Array.from({ length: k }, (_, idx) => {
    const pick = sorted[Math.min(idx * stride, sorted.length - 1)];
    return pick.coordinates;
  });

  for (let i = 0; i < 6; i += 1) {
    const buckets = Array.from({ length: k }, () => [] as LandParcel[]);

    sorted.forEach((parcel) => {
      let nearestIdx = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      centroids.forEach((center, cIdx) => {
        const dist = haversineKm(parcel.coordinates, center);
        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestIdx = cIdx;
        }
      });
      buckets[nearestIdx].push(parcel);
    });

    centroids = centroids.map((center, cIdx) => {
      const points = buckets[cIdx].map((m) => m.coordinates);
      return points.length ? averageCenter(points) : center;
    });
  }

  const clusters: ClusterResult[] = centroids.map((center, idx) => ({
    id: `Cluster ${idx + 1}`,
    center,
    members: [],
    color: clusterPalette[idx % clusterPalette.length],
  }));

  const outsideRadius: LandParcel[] = [];
  sorted.forEach((parcel) => {
    let nearestIdx = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    centroids.forEach((center, cIdx) => {
      const dist = haversineKm(parcel.coordinates, center);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIdx = cIdx;
      }
    });

    if (nearestDistance <= safeRadius) {
      clusters[nearestIdx].members.push(parcel);
    } else {
      outsideRadius.push(parcel);
    }
  });

  return { clusters, outsideRadius, radiusKm: safeRadius };
}
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

export type ClusterAlgorithm = "kmeans" | "density";

export type SavedLandClusterConfig = {
  clusterCount: number;
  clusterRadiusKm: number;
  algorithm: ClusterAlgorithm;
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
  { id: "LP-109", owner: "Arun Tiwari", location: "Kumhari", acres: 6.1, status: "ready", coordinates: [21.2664, 81.6649] },
  { id: "LP-110", owner: "Savita Patel", location: "Bemetara Road", acres: 9.4, status: "planned", coordinates: [21.3182, 81.592] },
  { id: "LP-111", owner: "Mukesh Soni", location: "Urla", acres: 5.8, status: "ready", coordinates: [21.2541, 81.7361] },
  { id: "LP-112", owner: "Shanti Yadav", location: "Changorabhata", acres: 3.9, status: "not-available", coordinates: [21.2453, 81.6174] },
  { id: "LP-113", owner: "Rakesh Dewangan", location: "Bhanpuri", acres: 4.7, status: "planned", coordinates: [21.2712, 81.6577] },
  { id: "LP-114", owner: "Pushpa Verma", location: "Siltara", acres: 7.8, status: "ready", coordinates: [21.3471, 81.7749] },
  { id: "LP-115", owner: "Hemant Agrawal", location: "Nardaha", acres: 5.3, status: "ready", coordinates: [21.2188, 81.8954] },
  { id: "LP-116", owner: "Usha Netam", location: "Paragaon", acres: 2.7, status: "planned", coordinates: [21.1795, 81.8191] },
  { id: "LP-117", owner: "Brijesh Sahu", location: "Kukra", acres: 8.1, status: "ready", coordinates: [21.3618, 81.6913] },
  { id: "LP-118", owner: "Lata Chandrakar", location: "Bilaigarh Link", acres: 6.9, status: "planned", coordinates: [21.2947, 81.8421] },
  { id: "LP-119", owner: "Naresh Patel", location: "Bhatagaon", acres: 3.4, status: "not-available", coordinates: [21.2184, 81.6119] },
  { id: "LP-120", owner: "Suman Sinha", location: "Tatibandh", acres: 4.2, status: "planned", coordinates: [21.2649, 81.6928] },
  { id: "LP-121", owner: "Dileep Kurre", location: "Sarona", acres: 5.1, status: "ready", coordinates: [21.2875, 81.6892] },
  { id: "LP-122", owner: "Kanchan Meshram", location: "Kapa", acres: 6.3, status: "ready", coordinates: [21.2983, 81.6465] },
  { id: "LP-123", owner: "Sukhlal Nishad", location: "Mana Camp", acres: 2.8, status: "not-available", coordinates: [21.2106, 81.7438] },
  { id: "LP-124", owner: "Neelam Kaushik", location: "Dhamtari Road", acres: 7.5, status: "planned", coordinates: [21.1597, 81.7015] },
  { id: "LP-125", owner: "Omprakash Markam", location: "Pacheda", acres: 9.1, status: "ready", coordinates: [21.3336, 81.7232] },
  { id: "LP-126", owner: "Jyoti Patel", location: "Amlidih", acres: 4.4, status: "planned", coordinates: [21.2279, 81.6718] },
  { id: "LP-127", owner: "Rajeshwari Sahu", location: "Devpuri", acres: 5.6, status: "ready", coordinates: [21.2404, 81.7122] },
  { id: "LP-128", owner: "Harishankar Yadav", location: "Patan Road", acres: 8.7, status: "planned", coordinates: [21.3657, 81.6114] },
  { id: "LP-129", owner: "Bharti Manikpuri", location: "Kachna", acres: 3.6, status: "not-available", coordinates: [21.2388, 81.6869] },
  { id: "LP-130", owner: "Sunil Baghel", location: "Boria", acres: 6.8, status: "ready", coordinates: [21.2557, 81.6493] },
];

const clusterPalette = ["#6f8a2b", "#0f766e", "#b45309", "#be123c", "#1d4ed8", "#7c3aed"];
const LAND_CLUSTER_CONFIG_KEY = "landCluster.savedConfig.v1";

export function getSavedLandClusterConfig(
  defaultClusterCount = 3,
  defaultClusterRadiusKm = 8
): SavedLandClusterConfig {
  const fallback: SavedLandClusterConfig = {
    clusterCount: clamp(defaultClusterCount, 1, landClusterDemoParcels.length),
    clusterRadiusKm: clamp(defaultClusterRadiusKm, 1, 50),
    algorithm: "kmeans",
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
      algorithm: parsed.algorithm === "density" ? "density" : "kmeans",
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
    };
  } catch {
    return fallback;
  }
}

export function saveLandClusterConfig(
  clusterCount: number,
  clusterRadiusKm: number,
  algorithm: ClusterAlgorithm = "kmeans"
) {
  const payload: SavedLandClusterConfig = {
    clusterCount: clamp(clusterCount, 1, landClusterDemoParcels.length),
    clusterRadiusKm: clamp(clusterRadiusKm, 1, 50),
    algorithm,
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

function nearestCentroidIndex(point: [number, number], centroids: [number, number][]) {
  let nearestIdx = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  centroids.forEach((center, cIdx) => {
    const dist = haversineKm(point, center);
    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearestIdx = cIdx;
    }
  });

  return { nearestIdx, nearestDistance };
}

function buildKMeansClusters(data: LandParcel[], requestedClusters: number, safeRadius: number) {
  const k = clamp(requestedClusters, 1, data.length);
  const sorted = [...data].sort((a, b) => a.coordinates[0] - b.coordinates[0]);
  const stride = Math.max(1, Math.floor(sorted.length / k));

  let centroids: [number, number][] = Array.from({ length: k }, (_, idx) => {
    const pick = sorted[Math.min(idx * stride, sorted.length - 1)];
    return pick.coordinates;
  });

  for (let i = 0; i < 8; i += 1) {
    const buckets = Array.from({ length: k }, () => [] as LandParcel[]);

    sorted.forEach((parcel) => {
      const { nearestIdx } = nearestCentroidIndex(parcel.coordinates, centroids);
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
    const { nearestIdx, nearestDistance } = nearestCentroidIndex(parcel.coordinates, centroids);

    if (nearestDistance <= safeRadius) {
      clusters[nearestIdx].members.push(parcel);
    } else {
      outsideRadius.push(parcel);
    }
  });

  return { clusters, outsideRadius, radiusKm: safeRadius };
}

function buildDensityClusters(data: LandParcel[], safeRadius: number) {
  const minPoints = 2;
  const assignments = new Array<number>(data.length).fill(-1);
  const visited = new Array<boolean>(data.length).fill(false);

  const regionQuery = (index: number) => {
    const neighbors: number[] = [];
    const point = data[index].coordinates;
    for (let i = 0; i < data.length; i += 1) {
      if (haversineKm(point, data[i].coordinates) <= safeRadius) {
        neighbors.push(i);
      }
    }
    return neighbors;
  };

  let clusterIndex = 0;

  for (let i = 0; i < data.length; i += 1) {
    if (visited[i]) continue;
    visited[i] = true;

    const neighbors = regionQuery(i);
    if (neighbors.length < minPoints) {
      continue;
    }

    assignments[i] = clusterIndex;
    const queue = [...neighbors];
    while (queue.length) {
      const current = queue.shift()!;

      if (!visited[current]) {
        visited[current] = true;
        const currentNeighbors = regionQuery(current);
        if (currentNeighbors.length >= minPoints) {
          currentNeighbors.forEach((candidate) => {
            if (!queue.includes(candidate)) {
              queue.push(candidate);
            }
          });
        }
      }

      if (assignments[current] === -1) {
        assignments[current] = clusterIndex;
      }
    }

    clusterIndex += 1;
  }

  const grouped = new Map<number, LandParcel[]>();
  data.forEach((parcel, idx) => {
    const assigned = assignments[idx];
    if (assigned >= 0) {
      const existing = grouped.get(assigned) ?? [];
      existing.push(parcel);
      grouped.set(assigned, existing);
    }
  });

  const clusters: ClusterResult[] = Array.from(grouped.values()).map((members, idx) => ({
    id: `Cluster ${idx + 1}`,
    center: averageCenter(members.map((m) => m.coordinates)),
    members,
    color: clusterPalette[idx % clusterPalette.length],
  }));

  const outsideRadius = data.filter((_, idx) => assignments[idx] < 0);

  return { clusters, outsideRadius, radiusKm: safeRadius };
}

export function buildClusters(
  data: LandParcel[],
  requestedClusters: number,
  radiusKm: number,
  algorithm: ClusterAlgorithm = "kmeans"
) {
  const safeRadius = clamp(radiusKm, 1, 50);
  if (!data.length) {
    return { clusters: [] as ClusterResult[], outsideRadius: [] as LandParcel[], radiusKm: safeRadius };
  }

  if (algorithm === "density") {
    return buildDensityClusters(data, safeRadius);
  }

  return buildKMeansClusters(data, requestedClusters, safeRadius);
}
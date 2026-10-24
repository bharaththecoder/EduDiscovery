// ============================================================
// EduDiscovery — Authoritative Geographic Coordinates & Projection
// Calibrated for Andhra Pradesh State Geographic Boundaries
// ============================================================

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
}

export type LocationPrecision = 'verified_campus' | 'city_centroid';

export interface UniversityLocation extends LatLng, ProjectedPoint {
  city: string;
  precision: LocationPrecision;
  notes?: string;
}

/**
 * Calibrated geographic bounding box of Andhra Pradesh state
 * Latitude: 12.60° N (Kuppam / Chittoor South) to 19.20° N (Ichchapuram / Srikakulam North)
 * Longitude: 76.70° E (Anantapur West) to 84.80° E (Kalingapatnam / Srikakulam East)
 */
export const AP_BOUNDING_BOX = {
  minLat: 12.60,
  maxLat: 19.20,
  minLng: 76.70,
  maxLng: 84.80,
  canvasWidth: 800,
  canvasHeight: 650,
};

/**
 * Geographic Equirectangular Projection Formula
 * Translates real GPS latitude & longitude to SVG 2D ViewBox coordinates (800x650)
 */
export function projectCoordinates(
  lat: number,
  lng: number,
  width = AP_BOUNDING_BOX.canvasWidth,
  height = AP_BOUNDING_BOX.canvasHeight
): ProjectedPoint {
  const { minLat, maxLat, minLng, maxLng } = AP_BOUNDING_BOX;
  
  // Clamped projection
  const clampedLng = Math.max(minLng, Math.min(maxLng, lng));
  const clampedLat = Math.max(minLat, Math.min(maxLat, lat));

  const x = ((clampedLng - minLng) / (maxLng - minLng)) * width;
  // SVG y=0 corresponds to North (maxLat) and y=height corresponds to South (minLat)
  const y = ((maxLat - clampedLat) / (maxLat - minLat)) * height;

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
}

/**
 * Verified Centroids for all 29 Andhra Pradesh Municipalities in Dataset
 */
export const AP_CITY_CENTROIDS: Record<string, LatLng> = {
  'Amaravati': { lat: 16.5131, lng: 80.5165 },
  'Anantapur': { lat: 14.6819, lng: 77.6006 },
  'Bapatla': { lat: 15.9042, lng: 80.4674 },
  'Bhimavaram': { lat: 16.5449, lng: 81.5212 },
  'Gudlavalleru': { lat: 16.3477, lng: 80.9995 },
  'Guntur': { lat: 16.3067, lng: 80.4365 },
  'Kadapa': { lat: 14.4673, lng: 78.8242 },
  'Kakinada': { lat: 16.9891, lng: 82.2475 },
  'Kuppam': { lat: 12.7485, lng: 78.3644 },
  'Kurnool': { lat: 15.8281, lng: 78.0373 },
  'Machilipatnam': { lat: 16.1875, lng: 81.1389 },
  'Mylavaram': { lat: 16.7647, lng: 80.6382 },
  'Narasaraopeta': { lat: 16.2359, lng: 80.0494 },
  'Nellore': { lat: 14.4426, lng: 79.9865 },
  'Nuzvid': { lat: 16.7850, lng: 80.8461 },
  'Ongole': { lat: 15.5057, lng: 80.0499 },
  'Prasanthi Nilayam': { lat: 14.1672, lng: 77.8115 },
  'Puttur': { lat: 13.4419, lng: 79.5539 },
  'Rajam': { lat: 18.4552, lng: 83.6558 },
  'Rajamahendravaram': { lat: 17.0005, lng: 81.8040 },
  'Rajampet': { lat: 14.1884, lng: 79.1624 },
  'Sri City': { lat: 13.5298, lng: 80.0245 },
  'Surampalem': { lat: 17.0863, lng: 82.0628 },
  'Tadepalligudem': { lat: 16.8126, lng: 81.5262 },
  'Tekkali': { lat: 18.6148, lng: 84.2346 },
  'Tirupati': { lat: 13.6288, lng: 79.4192 },
  'Vijayawada': { lat: 16.5062, lng: 80.6480 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Vizianagaram': { lat: 18.1160, lng: 83.4070 },
};

/**
 * Verified Campus Locations for Major Higher Education Institutions
 */
export const VERIFIED_CAMPUS_LOCATIONS: Record<string, { lat: number; lng: number; notes: string }> = {
  'vit-ap': { lat: 16.4950, lng: 80.5002, notes: 'Beside Inavolu Village, Amaravati Capital Region' },
  'srm-ap': { lat: 16.4628, lng: 80.5085, notes: 'Neerukonda, Mangalagiri Mandal, Amaravati' },
  'kl-university': { lat: 16.4419, lng: 80.6224, notes: 'Green Fields, Vaddeswaram, Guntur District' },
  'gitam': { lat: 17.7813, lng: 83.3776, notes: 'Gandhi Nagar, Rushikonda, Visakhapatnam' },
  'vignan-guntur': { lat: 16.2334, lng: 80.5517, notes: 'Vadlamudi, Chebrolu Mandal, Guntur' },
  'andhra-university': { lat: 17.7297, lng: 83.3197, notes: 'Waltair Uplands, Visakhapatnam' },
  'sv-university': { lat: 13.6300, lng: 79.4000, notes: 'SVU Campus Road, Tirupati' },
  'jntuk': { lat: 16.9789, lng: 82.2415, notes: 'Naghamallithota, Kakinada' },
  'jntua': { lat: 14.6534, lng: 77.6087, notes: 'Sir Mokshagundam Vishveshwariah Road, Anantapur' },
  'rgukt-nuzvid': { lat: 16.7938, lng: 80.8228, notes: 'Mylavaram Road, Nuzvid, Eluru District' },
  'rgukt-rkvalley': { lat: 14.3314, lng: 78.5833, notes: 'Idupulapaya, Vempalli, YSR Kadapa District' },
  'gvp': { lat: 17.8208, lng: 83.3421, notes: 'Madhurawada, Visakhapatnam' },
  'gmrit': { lat: 18.4650, lng: 83.6620, notes: 'GMR Nagar, Rajam, Vizianagaram District' },
  'iit-tirupati': { lat: 13.6845, lng: 79.5539, notes: 'Yerpedu, Tirupati District' },
  'iiit-sricity': { lat: 13.5559, lng: 80.0269, notes: 'Gnan Marg, Sri City, Satyavedu' },
  'iiser-tirupati': { lat: 13.6558, lng: 79.4578, notes: 'Srinivasapuram, Tirupati' },
  'iipe-vizag': { lat: 17.7289, lng: 83.3210, notes: 'AU Campus, Visakhapatnam' },
  'nri-institute': { lat: 16.6341, lng: 80.7951, notes: 'Pothavarappadu, Agiripalli, Eluru District' },
};

/**
 * Resolves trustworthy coordinates for any college in the catalog.
 * If campus coordinates are verified, returns precision: 'verified_campus'.
 * Otherwise returns city centroid with deterministic minor offset to prevent marker stacking.
 */
export function getCollegeLocation(college: { id: string; city: string; name?: string }): UniversityLocation {
  const verified = VERIFIED_CAMPUS_LOCATIONS[college.id];
  if (verified) {
    const proj = projectCoordinates(verified.lat, verified.lng);
    return {
      lat: verified.lat,
      lng: verified.lng,
      x: proj.x,
      y: proj.y,
      city: college.city,
      precision: 'verified_campus',
      notes: verified.notes
    };
  }

  const centroid = AP_CITY_CENTROIDS[college.city] || AP_CITY_CENTROIDS['Vijayawada'];

  // Deterministic micro-jitter based on college ID hash (±0.03 deg ~ 3km)
  // Ensures colleges within the same city don't overlay each other
  let hash = 0;
  for (let i = 0; i < college.id.length; i++) {
    hash = (hash * 31 + college.id.charCodeAt(i)) & 0xffffffff;
  }
  const offsetLat = ((Math.abs(hash % 100) - 50) / 100) * 0.05;
  const offsetLng = ((Math.abs((hash >> 8) % 100) - 50) / 100) * 0.05;

  const lat = centroid.lat + offsetLat;
  const lng = centroid.lng + offsetLng;
  const proj = projectCoordinates(lat, lng);

  return {
    lat: Math.round(lat * 10000) / 10000,
    lng: Math.round(lng * 10000) / 10000,
    x: proj.x,
    y: proj.y,
    city: college.city,
    precision: 'city_centroid',
    notes: `${college.city} Municipal Region Centroid`
  };
}

/**
 * Top district regions for quick cluster filtering
 */
export const AP_MAJOR_DISTRICT_HUBS = [
  { name: 'Visakhapatnam', label: 'Vizag Coast', count: 8 },
  { name: 'Amaravati', label: 'Capital Hub', count: 6 },
  { name: 'Vijayawada', label: 'Krishna Basin', count: 12 },
  { name: 'Guntur', label: 'Guntur Central', count: 9 },
  { name: 'Tirupati', label: 'Rayalaseema South', count: 7 },
  { name: 'Kakinada', label: 'Godavari Coast', count: 5 },
  { name: 'Kurnool', label: 'Tungabhadra', count: 4 },
];

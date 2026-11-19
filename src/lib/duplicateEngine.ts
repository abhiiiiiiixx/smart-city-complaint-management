import { Complaint } from '../types/database';

export interface DuplicateMatch {
  complaint: Complaint;
  similarityType: 'location' | 'ward_and_category';
  distanceMeters?: number;
  reason: string;
}

// Haversine formula to compute distance between two GPS coordinates in meters
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function findPotentialDuplicates(
  newCategoryId: string,
  newWard: string,
  newLat: number,
  newLng: number,
  existingComplaints: Complaint[]
): DuplicateMatch[] {
  // Only look for open/active complaints (not resolved or rejected)
  const activeComplaints = existingComplaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
  );

  const matches: DuplicateMatch[] = [];

  for (const c of activeComplaints) {
    // 1. Same category + GPS location proximity (< 400m)
    if (c.category_id === newCategoryId && c.latitude && c.longitude && newLat && newLng) {
      const dist = getDistanceMeters(newLat, newLng, c.latitude, c.longitude);
      if (dist <= 400) {
        matches.push({
          complaint: c,
          similarityType: 'location',
          distanceMeters: dist,
          reason: `Found an active complaint (#${c.complaint_number}) just ${dist}m away under the same category.`,
        });
        continue;
      }
    }

    // 2. Same category + identical Ward / Area
    if (
      c.category_id === newCategoryId &&
      newWard.trim() !== '' &&
      c.ward_or_area.toLowerCase().includes(newWard.toLowerCase().trim())
    ) {
      matches.push({
        complaint: c,
        similarityType: 'ward_and_category',
        reason: `An active complaint (#${c.complaint_number}: "${c.title}") already exists in ${c.ward_or_area} for this category.`,
      });
    }
  }

  return matches;
}

export type PostType = 'lost' | 'sighting' | 'rescue';
export type Location = { latitude: number; longitude: number };
export type User = { id: string; displayName: string };
export type OwnedPet = { _id: string; name: string; species: string; breed: string; description: string; photos: string[] };
export type PetPost = { _id: string; type: PostType; title: string; description: string; species?: string; photos: string[]; location: { coordinates: [number, number] }; occurredAt: string; createdAt: string; status: 'active' | 'resolved'; author: { _id: string; displayName: string } | null; relatedPost?: string };
export type Comment = { _id: string; text: string; author: { _id: string; displayName: string } | null; createdAt: string; replies?: Comment[] };
export type Alert = { location: { coordinates: [number, number] }; radiusKm: number; types: PostType[] };
export const labels: Record<PostType, string> = { lost: 'Lost pet', sighting: 'Sighting', rescue: 'Found stray' };

export async function api<T>(path: string, options: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, { method: options.method || 'GET', headers: { ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) }, ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}), cache: 'no-store' });
  } catch { throw new Error('Could not reach the server. Please check your connection and try again.'); }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : typeof message === 'string' ? message : 'Something went wrong. Please try again.');
  }
  return data as T;
}

export function currentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Your browser does not support location.'));
    navigator.geolocation.getCurrentPosition(position => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }), error => reject(new Error(error.code === 1 ? 'Location permission was denied. You can enter coordinates instead.' : 'Could not get your location. Please try again or enter coordinates.')), { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
  });
}

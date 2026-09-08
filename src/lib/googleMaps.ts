import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

// Solution tracking attribution ID required for Google Maps Platform
export const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

// Get API Key from environment or fallback for safe initialization
const rawApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';

export const isGoogleMapsConfigured = Boolean(
  rawApiKey &&
  rawApiKey.length > 5 &&
  rawApiKey !== 'MY_GOOGLE_MAPS_API_KEY' &&
  !rawApiKey.includes('placeholder')
);

let optionsConfigured = false;
let loadPromise: Promise<typeof google.maps | null> | null = null;

/**
 * Initializes and loads the Google Maps JavaScript API with dynamic importLibrary support.
 */
export async function loadGoogleMaps(): Promise<typeof google.maps | null> {
  const apiKeyToUse = isGoogleMapsConfigured ? rawApiKey : '';

  if (!optionsConfigured) {
    setOptions({
      key: apiKeyToUse,
      v: 'weekly',
      solutionChannel: GMP_ATTRIBUTION_ID,
    });
    optionsConfigured = true;
  }

  if (!loadPromise) {
    loadPromise = importLibrary('maps')
      .then(() => {
        return window.google?.maps || null;
      })
      .catch((err) => {
        console.warn('Google Maps script loading notice:', err);
        if (typeof window !== 'undefined' && window.google?.maps) {
          return window.google.maps;
        }
        return null;
      });
  }

  return loadPromise;
}

/**
 * Interface representing a Google Review extracted via the Places API (New)
 */
export interface GooglePlaceReview {
  authorName: string;
  authorUri?: string;
  authorPhotoUri?: string;
  rating: number;
  text: string;
  relativePublishTimeDescription?: string;
}

/**
 * Interface representing Place details extracted via Place.fetchFields
 */
export interface GooglePlaceDetails {
  id: string;
  displayName: string;
  formattedAddress: string;
  location?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingCount?: number;
  reviews?: GooglePlaceReview[];
  googleReviewUrl?: string;
}

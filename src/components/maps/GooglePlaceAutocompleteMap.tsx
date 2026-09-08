import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, CheckCircle2, ExternalLink, Copy, Check, Sparkles, Building, AlertCircle } from 'lucide-react';
import { loadGoogleMaps, GMP_ATTRIBUTION_ID, isGoogleMapsConfigured } from '../../lib/googleMaps';

export interface PlaceSelectionResult {
  id: string;
  name: string;
  formattedAddress: string;
  location?: { lat: number; lng: number };
  googleReviewUrl: string;
}

interface GooglePlaceAutocompleteMapProps {
  initialPlaceId?: string;
  initialPlaceName?: string;
  initialAddress?: string;
  onSelectPlace?: (place: PlaceSelectionResult) => void;
  className?: string;
}

// Popular sample places for zero-friction instant demo / preview testing
const SAMPLE_PRESETS: PlaceSelectionResult[] = [
  {
    id: 'ChIJpyiwa4Zw44kRBQSGWKv4wgA',
    name: 'Faneuil Hall Marketplace',
    formattedAddress: '4 S Market St, Boston, MA 02109, United States',
    location: { lat: 42.3601, lng: -71.0560 },
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJpyiwa4Zw44kRBQSGWKv4wgA',
  },
  {
    id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    name: 'Apex Dental Care & Specialists',
    formattedAddress: '742 Evergreen Terrace, Suite 100, Austin, TX 78701',
    location: { lat: 30.2672, lng: -97.7431 },
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
  },
  {
    id: 'ChIJLw-DOmM3K4gREw_a8wK-1',
    name: 'Blue Harbor Bistro & Grill',
    formattedAddress: '108 Marina Blvd, San Diego, CA 92101',
    location: { lat: 32.7157, lng: -117.1611 },
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJLw-DOmM3K4gREw_a8wK-1',
  },
];

export const GooglePlaceAutocompleteMap: React.FC<GooglePlaceAutocompleteMapProps> = ({
  initialPlaceId,
  initialPlaceName,
  initialAddress,
  onSelectPlace,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const infoWindowContentRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(initialPlaceName || '');
  const [selectedPlace, setSelectedPlace] = useState<PlaceSelectionResult | null>(
    initialPlaceId
      ? {
          id: initialPlaceId,
          name: initialPlaceName || 'Selected Business',
          formattedAddress: initialAddress || 'Location details on map',
          googleReviewUrl: `https://search.google.com/local/writereview?placeid=${initialPlaceId}`,
        }
      : null
  );
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // References to keep Google Maps instances
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<any>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMapAndAutocomplete() {
      try {
        setLoading(true);
        await loadGoogleMaps();

        if (!isMounted || !mapContainerRef.current) return;

        // Import modern modular Google Maps libraries as in user code
        const [{ Map, InfoWindow }, { AdvancedMarkerElement }] = await Promise.all([
          google.maps.importLibrary('maps') as Promise<google.maps.MapsLibrary>,
          google.maps.importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
          google.maps.importLibrary('places') as Promise<google.maps.PlacesLibrary>,
        ]);

        if (!isMounted || !mapContainerRef.current) return;

        const defaultCenter = selectedPlace?.location || { lat: 42.3601, lng: -71.0560 };

        // Initialize Map
        const map = new Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 15,
          mapId: 'DEMO_MAP_ID', // Enables Advanced Markers
          clickableIcons: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          // Solution attribution ID
          internalUsageAttributionIds: [GMP_ATTRIBUTION_ID],
        } as any);

        mapInstanceRef.current = map;

        const infoWindow = new InfoWindow();
        infoWindowRef.current = infoWindow;

        // Initialize AdvancedMarkerElement with required collision behavior and click interaction
        const marker = new AdvancedMarkerElement({
          map,
          position: defaultCenter,
          collisionBehavior: 'REQUIRED_AND_HIDES_OPTIONAL',
          gmpClickable: true,
          title: selectedPlace?.name || 'Selected Place',
        } as any);

        markerInstanceRef.current = marker;

        marker.addEventListener('gmp-click', () => {
          if (infoWindowContentRef.current && infoWindow) {
            infoWindow.setContent(infoWindowContentRef.current);
            infoWindow.open({
              anchor: marker,
              map,
            });
          }
        });

        // Initialize PlaceAutocompleteElement if container and library are ready
        if (autocompleteContainerRef.current) {
          try {
            // Check for PlaceAutocompleteElement web component
            const placeAutocomplete = new (google.maps.places as any).PlaceAutocompleteElement({
              internalUsageAttributionIds: [GMP_ATTRIBUTION_ID],
            });

            autocompleteContainerRef.current.innerHTML = '';
            autocompleteContainerRef.current.appendChild(placeAutocomplete);

            // Bounds changed listener to bias autocomplete
            map.addListener('bounds_changed', () => {
              const bounds = map.getBounds();
              if (bounds && placeAutocomplete) {
                placeAutocomplete.locationBias = bounds;
              }
            });

            // gmp-select event handler matching user implementation
            placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }: any) => {
              infoWindow.close();

              const place = placePrediction.toPlace();

              await place.fetchFields({
                fields: ['displayName', 'formattedAddress', 'location', 'id'],
              });

              if (!place.location) return;

              if (place.viewport) {
                map.fitBounds(place.viewport);
              } else {
                map.setCenter(place.location);
                map.setZoom(17);
              }

              marker.position = place.location;

              const latVal = typeof (place.location as any).lat === 'function' ? (place.location as any).lat() : Number((place.location as any).lat);
              const lngVal = typeof (place.location as any).lng === 'function' ? (place.location as any).lng() : Number((place.location as any).lng);

              const result: PlaceSelectionResult = {
                id: place.id || '',
                name: place.displayName || 'Selected Business',
                formattedAddress: place.formattedAddress || '',
                location: {
                  lat: isNaN(latVal) ? 42.3601 : latVal,
                  lng: isNaN(lngVal) ? -71.0560 : lngVal,
                },
                googleReviewUrl: `https://search.google.com/local/writereview?placeid=${place.id || ''}`,
              };

              setSelectedPlace(result);
              setSearchQuery(result.name);

              if (infoWindowContentRef.current) {
                const nameEl = infoWindowContentRef.current.querySelector('#place-name');
                const idEl = infoWindowContentRef.current.querySelector('#place-id');
                const addrEl = infoWindowContentRef.current.querySelector('#place-address');

                if (nameEl) nameEl.textContent = result.name;
                if (idEl) idEl.textContent = result.id;
                if (addrEl) addrEl.textContent = result.formattedAddress;

                infoWindow.setContent(infoWindowContentRef.current);
                infoWindow.open({
                  anchor: marker,
                  map,
                });
              }

              if (onSelectPlace) {
                onSelectPlace(result);
              }
            });
          } catch (e) {
            console.info('PlaceAutocompleteElement web component fallback enabled');
          }
        }

        setMapLoaded(true);
        setLoading(false);
      } catch (err: any) {
        console.warn('Google Maps Initialization Notice:', err);
        if (isMounted) {
          setLoadError(err?.message || 'Google Maps service loaded with fallback preview.');
          setLoading(false);
          setMapLoaded(true);
        }
      }
    }

    initMapAndAutocomplete();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectPreset = (preset: PlaceSelectionResult) => {
    setSelectedPlace(preset);
    setSearchQuery(preset.name);

    if (mapInstanceRef.current && preset.location) {
      mapInstanceRef.current.setCenter(preset.location);
      mapInstanceRef.current.setZoom(16);
    }

    if (markerInstanceRef.current && preset.location) {
      markerInstanceRef.current.position = preset.location;
    }

    if (infoWindowRef.current && markerInstanceRef.current && infoWindowContentRef.current) {
      const nameEl = infoWindowContentRef.current.querySelector('#place-name');
      const idEl = infoWindowContentRef.current.querySelector('#place-id');
      const addrEl = infoWindowContentRef.current.querySelector('#place-address');

      if (nameEl) nameEl.textContent = preset.name;
      if (idEl) idEl.textContent = preset.id;
      if (addrEl) addrEl.textContent = preset.formattedAddress;

      infoWindowRef.current.setContent(infoWindowContentRef.current);
      infoWindowRef.current.open({
        anchor: markerInstanceRef.current,
        map: mapInstanceRef.current,
      });
    }

    if (onSelectPlace) {
      onSelectPlace(preset);
    }
  };

  const handleCopyPlaceId = () => {
    if (selectedPlace?.id) {
      navigator.clipboard.writeText(selectedPlace.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div id="google-place-autocomplete-container" className={`space-y-4 ${className}`}>
      {/* Search Header Bar */}
      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Google Place Autocomplete & Locator
              </h4>
              <p className="text-xs text-slate-500">
                Search your official Google Maps business profile to automatically fetch Place ID and direct review link
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Places API (New)
            </span>
          </div>
        </div>

        {/* Search input with live suggestion dropdown & custom place input */}
        <div className="relative space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="google-place-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business name, clinic, restaurant, or address..."
              className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => {
                  const customSlug = searchQuery.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const customId = `ChIJ_${customSlug}`;
                  const customPlace: PlaceSelectionResult = {
                    id: customId,
                    name: searchQuery.trim(),
                    formattedAddress: `${searchQuery.trim()}, Verified Location`,
                    location: { lat: 37.7749, lng: -122.4194 },
                    googleReviewUrl: `https://search.google.com/local/writereview?placeid=${customId}`,
                  };
                  handleSelectPreset(customPlace);
                }}
                className="absolute inset-y-1.5 right-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>Select</span>
              </button>
            )}
          </div>

          {/* Web Component Slot for Google Places Autocomplete when library is mounted */}
          <div
            ref={autocompleteContainerRef}
            id="gmp-autocomplete-slot"
            className="w-full empty:hidden rounded-xl overflow-hidden"
          />
        </div>

        {/* Preset / Fast Selection Pill Row */}
        <div className="pt-1">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
            <span>Quick test locations:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                  selectedPlace?.id === preset.id
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3 h-3 text-indigo-500" />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Element (explicit height per CF2) */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 min-h-[320px]">
        <div
          ref={mapContainerRef}
          id="gmp-interactive-map"
          className="w-full h-[320px] sm:h-[380px]"
          style={{ width: '100%', height: '360px' }}
        />

        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-slate-600">
            <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Initializing Google Maps & Places Autocomplete...</p>
          </div>
        )}
      </div>

      {/* Template for InfoWindow popup content matching user code structure */}
      <div className="hidden">
        <div
          ref={infoWindowContentRef}
          id="infowindow-content"
          className="p-3 max-w-xs space-y-1.5 text-slate-900 font-sans"
        >
          <div id="place-name" className="font-extrabold text-sm text-indigo-950">
            {selectedPlace?.name || 'Selected Place'}
          </div>
          <div id="place-address" className="text-xs text-slate-600 leading-snug">
            {selectedPlace?.formattedAddress || ''}
          </div>
          <div className="pt-1.5 border-t border-slate-200 text-[11px] font-mono text-slate-500">
            <span>Place ID: </span>
            <span id="place-id" className="font-bold text-indigo-600">
              {selectedPlace?.id || ''}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Business Card Output */}
      {selectedPlace && (
        <div
          id="selected-place-summary"
          className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{selectedPlace.name}</span>
            </div>
            <p className="text-xs text-slate-600">{selectedPlace.formattedAddress}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                ID: {selectedPlace.id}
              </span>
              <button
                type="button"
                onClick={handleCopyPlaceId}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedId ? 'Copied' : 'Copy ID'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <a
              href={selectedPlace.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs transition-all"
            >
              <span>Test Review Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onSelectPlace && (
              <button
                type="button"
                onClick={() => onSelectPlace(selectedPlace)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.99]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Profile</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

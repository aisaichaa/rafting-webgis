import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RaftingProvider } from '@/pages/Dashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Globe, MessageSquare } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RaftingMapProps {
  providers: RaftingProvider[];
  onProviderSelect: (provider: RaftingProvider) => void;
  onReviewClick: () => void;
}

export const RaftingMap = ({ providers, onProviderSelect, onReviewClick }: RaftingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const cityPolylinesRef = useRef<Map<string, L.Polyline>>(new Map());

  const getMarkerColor = (rating: number) => {
    if (rating === 0) return '#9CA3AF'; // Gray for unrated
    if (rating >= 4.5) return '#22C55E'; // Green
    if (rating >= 3.5) return '#EAB308'; // Yellow
    return '#EF4444'; // Red
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return 'No reviews yet';
    return rating.toFixed(1);
  };

  const getMarkerText = (rating: number) => {
    if (rating === 0) return '-';
    return rating.toFixed(1);
  };

  const createCustomIcon = (rating: number) => {
    const color = getMarkerColor(rating);
    return L.divIcon({
      html: `
        <div class="relative">
          <div class="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div class="w-6 h-6 rounded-full" style="background-color: ${color}"></div>
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow text-xs font-medium">
            ${getMarkerText(rating)}
          </div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([-7.4260, 108.1869], 9); // Updated to center on the test location
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Force a resize event to ensure the map renders properly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !providers.length) return;

    // Clear existing layers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    polylinesRef.current.forEach(polyline => polyline.remove());
    polylinesRef.current = [];
    cityPolylinesRef.current.clear();

    // Draw route polylines first
    const uniqueCities = new Map();
    providers.forEach(provider => {
      if (provider.cities.route_coordinates && !uniqueCities.has(provider.cities.id)) {
        uniqueCities.set(provider.cities.id, provider.cities);
      }
    });

    uniqueCities.forEach(city => {
      if (city.route_coordinates) {
        const polyline = L.polyline(city.route_coordinates, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.9,
          dashArray: '10, 15'
        }).addTo(mapInstanceRef.current!);

        polyline.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">${city.name}</h3>
            <p class="text-sm text-gray-600">Rafting Route</p>
          </div>
        `);

        polylinesRef.current.push(polyline);
        cityPolylinesRef.current.set(city.id, polyline);
      }
    });

    // Draw markers
    providers.forEach(provider => {
      const marker = L.marker([provider.latitude, provider.longitude], {
        icon: createCustomIcon(provider.rating)
      }).addTo(mapInstanceRef.current!);

      const popupContent = `
        <div class="p-2 max-w-[250px]">
          <img 
            src="${provider.image_url || '/images/default-destination.jpg'}" 
            alt="${provider.name}"
            class="w-full h-32 object-cover rounded-lg mb-3"
          />
          <div class="space-y-2">
            <div>
              <h3 class="font-semibold text-gray-900 truncate">${provider.name}</h3>
              <p class="text-sm text-gray-600">${provider.cities.name}</p>
            </div>
            <div class="flex items-center">
              ${provider.rating === 0 ? 
                '<span class="text-sm text-gray-500">No reviews yet</span>' :
                `<div class="flex items-center">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="ml-1 text-sm text-gray-600">${provider.rating.toFixed(1)}</span>
                </div>`
              }
            </div>
            <div class="text-sm font-medium text-teal-600">
              Rp ${provider.price_per_person.toLocaleString()}
            </div>
            <div class="flex space-x-2">
              <button onclick="window.viewProviderDetails('${provider.id}')" class="flex-1 bg-teal-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors">
                View Details
              </button>
              ${provider.cities.route_coordinates ? `
                <button onclick="window.showRoute('${provider.cities.id}')" class="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  Show Route
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        onProviderSelect(provider);
      });

      markersRef.current.push(marker);
    });

    // Only fit bounds when initially loading the map
    if (mapInstanceRef.current.getZoom() === 9) { // Default zoom level
      const bounds = L.latLngBounds(
        [...markersRef.current, ...polylinesRef.current].map(layer => {
          if (layer instanceof L.Marker) {
            return layer.getLatLng();
          } else {
            return (layer as L.Polyline).getLatLngs() as L.LatLng[];
          }
        }).flat()
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Global functions for popup buttons
    (window as any).viewProviderDetails = (id: string) => {
      const provider = providers.find(p => p.id === id);
      if (provider) {
        onProviderSelect(provider);
        onReviewClick();
      }
    };

    (window as any).showRoute = (cityId: string) => {
      const polyline = cityPolylinesRef.current.get(cityId);
      if (polyline) {
        // Highlight the route
        polyline.setStyle({
          color: '#dc2626', // Red color for highlight
          weight: 7,
          opacity: 1,
          dashArray: null // Solid line when highlighted
        });

        // Fit bounds to show the route
        const bounds = polyline.getBounds();
        mapInstanceRef.current!.fitBounds(bounds, { padding: [50, 50] });

        // Reset the style after 3 seconds
        setTimeout(() => {
          polyline.setStyle({
            color: '#2563eb',
            weight: 5,
            opacity: 0.9,
            dashArray: '10, 15'
          });
        }, 3000);
      }
    };

    return () => {
      // Clean up global functions
      delete (window as any).viewProviderDetails;
      delete (window as any).showRoute;
    };
  }, [providers, onProviderSelect, onReviewClick]);

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <h3 className="font-semibold mb-3 text-sm">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs">4.5+ stars</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-xs">3.5-4.4 stars</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-xs">Below 3.5</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            <span className="text-xs">No reviews yet</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-1 bg-blue-600 rounded-full" style={{ backgroundImage: 'linear-gradient(to right, #2563eb 50%, transparent 50%)', backgroundSize: '10px 1px' }}></div>
            <span className="text-xs">Rafting Routes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

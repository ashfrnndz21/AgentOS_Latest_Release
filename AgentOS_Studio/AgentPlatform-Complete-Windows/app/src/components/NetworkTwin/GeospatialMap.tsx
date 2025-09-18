
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Satellite, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Jakarta coordinates with explicit typing
const JAKARTA_CENTER: [number, number] = [106.8456, -6.2088];
const JAKARTA_BOUNDS: [[number, number], [number, number]] = [
  [106.6, -6.4], // Southwest coordinates
  [107.0, -6.0]  // Northeast coordinates
];

// Temporary API key placeholder - users should replace this with their own
const MAPBOX_TOKEN = 'pk.enter-your-mapbox-token-here';

interface GeospatialMapProps {
  model: string;
  viewType: string;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({ model, viewType }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [mapLayer, setMapLayer] = useState<'sites' | 'heatmap'>('sites');
  const [apiKey, setApiKey] = useState<string>(MAPBOX_TOKEN);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(
    MAPBOX_TOKEN === 'pk.enter-your-mapbox-token-here'
  );

  // This function adds cell sites to the map
  const addCellSites = (map: mapboxgl.Map) => {
    // Mock data for cell sites in Jakarta (normally this would come from an API)
    const sites = [
      { lng: 106.8225, lat: -6.1751, type: 'macro', status: 'active', congestion: 0.2 },
      { lng: 106.8425, lat: -6.2051, type: 'micro', status: 'active', congestion: 0.8 },
      { lng: 106.7825, lat: -6.1851, type: 'macro', status: 'inactive', congestion: 0 },
      { lng: 106.8625, lat: -6.2251, type: 'small', status: 'active', congestion: 0.5 },
      { lng: 106.8025, lat: -6.1651, type: 'macro', status: 'active', congestion: 0.3 },
      { lng: 106.8825, lat: -6.2451, type: 'micro', status: 'active', congestion: 0.7 },
      { lng: 106.8125, lat: -6.1951, type: 'small', status: 'active', congestion: 0.4 },
      { lng: 106.9025, lat: -6.2651, type: 'macro', status: 'active', congestion: 0.6 },
      { lng: 106.7625, lat: -6.2151, type: 'micro', status: 'inactive', congestion: 0 },
      { lng: 106.8325, lat: -6.2351, type: 'small', status: 'active', congestion: 0.9 },
      // More random sites around Jakarta
      { lng: 106.8277, lat: -6.1792, type: 'macro', status: 'active', congestion: 0.3 },
      { lng: 106.8477, lat: -6.2092, type: 'micro', status: 'active', congestion: 0.5 },
      { lng: 106.7877, lat: -6.1892, type: 'macro', status: 'active', congestion: 0.2 },
      { lng: 106.8677, lat: -6.2292, type: 'small', status: 'active', congestion: 0.6 },
      { lng: 106.8077, lat: -6.1692, type: 'macro', status: 'active', congestion: 0.4 },
      { lng: 106.8877, lat: -6.2492, type: 'micro', status: 'inactive', congestion: 0 },
      { lng: 106.8177, lat: -6.1992, type: 'small', status: 'active', congestion: 0.7 },
      { lng: 106.9077, lat: -6.2692, type: 'macro', status: 'active', congestion: 0.8 },
      { lng: 106.7677, lat: -6.2192, type: 'micro', status: 'active', congestion: 0.3 },
      { lng: 106.8377, lat: -6.2392, type: 'small', status: 'active', congestion: 0.5 },
    ];

    // Add sources and layers only if they don't already exist
    if (!map.getSource('cell-sites')) {
      // Add cell sites as a source
      map.addSource('cell-sites', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: sites.map(site => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [site.lng, site.lat]
            },
            properties: {
              type: site.type,
              status: site.status,
              congestion: site.congestion
            }
          }))
        }
      });
    }

    // Add a layer showing the cell sites
    if (!map.getLayer('cell-sites-layer')) {
      map.addLayer({
        id: 'cell-sites-layer',
        type: 'circle',
        source: 'cell-sites',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'type'], 'macro'], 8,
            ['==', ['get', 'type'], 'micro'], 6,
            4  // small cells
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'status'], 'inactive'], '#8E9196',
            ['>', ['get', 'congestion'], 0.7], '#ea384c',  // high congestion
            ['>', ['get', 'congestion'], 0.4], '#F97316',  // medium congestion
            '#9b87f5'  // low congestion
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      });
    }

    // Add a heatmap layer if it doesn't exist
    if (!map.getLayer('cell-sites-heat')) {
      map.addLayer({
        id: 'cell-sites-heat',
        type: 'heatmap',
        source: 'cell-sites',
        layout: {
          visibility: 'none'
        },
        paint: {
          'heatmap-weight': [
            'interpolate', ['linear'], ['get', 'congestion'],
            0, 0,
            1, 1
          ],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.2, 'rgb(0, 255, 255)',
            0.4, 'rgb(0, 255, 0)',
            0.6, 'rgb(255, 255, 0)',
            0.8, 'rgb(255, 0, 0)'
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.8
        }
      });
    }

    // Add popup on click
    map.on('click', 'cell-sites-layer', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const props = feature.properties;
      if (!props) return;
      
      const coordinates = (feature.geometry as any).coordinates.slice();

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'bg-beam-dark-accent text-white p-2 rounded-md text-xs';
      popupContent.innerHTML = `
        <div class="font-bold border-b border-gray-700 pb-1 mb-1">Cell Site Details</div>
        <div>Type: ${props.type.charAt(0).toUpperCase() + props.type.slice(1)}</div>
        <div>Status: ${props.status.charAt(0).toUpperCase() + props.status.slice(1)}</div>
        <div>Congestion: ${Math.round(props.congestion * 100)}%</div>
      `;

      // Create and add popup
      new mapboxgl.Popup({ closeButton: true, className: 'custom-popup' })
        .setLngLat(coordinates)
        .setDOMContent(popupContent)
        .addTo(map);
    });

    // Change cursor on hover
    map.on('mouseenter', 'cell-sites-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'cell-sites-layer', () => {
      map.getCanvas().style.cursor = '';
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !apiKey || apiKey === 'pk.enter-your-mapbox-token-here') return;

    try {
      mapboxgl.accessToken = apiKey;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: JAKARTA_CENTER,
        zoom: 11,
        bounds: JAKARTA_BOUNDS,
        minZoom: 9,
        maxZoom: 17
      });

      map.current.on('load', () => {
        if (map.current) {
          addCellSites(map.current);
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      
      // Add geolocation control
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }), 'top-right');

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [apiKey]);

  // Handle map style changes
  useEffect(() => {
    if (!map.current) return;
    
    const styleUrl = mapStyle === 'streets' 
      ? 'mapbox://styles/mapbox/streets-v11' 
      : 'mapbox://styles/mapbox/satellite-streets-v11';
    
    map.current.setStyle(styleUrl);
    
    // We need to re-add sources and layers when style changes
    map.current.once('style.load', () => {
      if (map.current) {
        addCellSites(map.current);
        
        // Set visibility based on current layer
        if (map.current.getLayer('cell-sites-layer') && map.current.getLayer('cell-sites-heat')) {
          map.current.setLayoutProperty(
            'cell-sites-layer', 
            'visibility', 
            mapLayer === 'sites' ? 'visible' : 'none'
          );
          map.current.setLayoutProperty(
            'cell-sites-heat', 
            'visibility', 
            mapLayer === 'heatmap' ? 'visible' : 'none'
          );
        }
      }
    });
  }, [mapStyle]);

  // Handle map layer changes
  useEffect(() => {
    if (!map.current) return;
    
    if (map.current.getLayer('cell-sites-layer') && map.current.getLayer('cell-sites-heat')) {
      map.current.setLayoutProperty(
        'cell-sites-layer', 
        'visibility', 
        mapLayer === 'sites' ? 'visible' : 'none'
      );
      map.current.setLayoutProperty(
        'cell-sites-heat', 
        'visibility', 
        mapLayer === 'heatmap' ? 'visible' : 'none'
      );
    }
  }, [mapLayer]);

  // Handle model changes - in a real app, this would update the data based on the selected model
  useEffect(() => {
    if (!map.current || !map.current.getSource('cell-sites')) return;
    
    // Update cell site data based on the selected model
    // This is where you would fetch new data based on the model and update the map
    console.log(`Model changed to: ${model}`);
    
    // For demo purposes, we're just changing the colors slightly based on the model
    const colors = {
      'churn': '#9b87f5',
      'propensity': '#8B5CF6',
      'arpu': '#0EA5E9',
      'apra': '#D946EF'
    };

    // @ts-ignore
    const baseColor = colors[model] || '#9b87f5';
    
    if (map.current.getLayer('cell-sites-layer')) {
      map.current.setPaintProperty('cell-sites-layer', 'circle-color', [
        'case',
        ['==', ['get', 'status'], 'inactive'], '#8E9196',
        ['>', ['get', 'congestion'], 0.7], '#ea384c',
        ['>', ['get', 'congestion'], 0.4], '#F97316',
        baseColor
      ]);
    }
  }, [model]);

  return (
    <div className="w-full h-full flex flex-col">
      {showApiKeyInput && (
        <div className="p-3 bg-beam-dark-accent/50 border border-gray-700/50 rounded-lg mb-3">
          <div className="text-amber-400 text-xs mb-2">
            Please enter your Mapbox API token to enable the map functionality.
            You can get one for free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Mapbox token"
              className="flex-1 p-2 text-sm rounded bg-beam-dark-accent border border-gray-700 text-white"
            />
            <Button 
              size="sm" 
              variant="default" 
              className="bg-ptt-blue hover:bg-blue-600 text-white"
              onClick={() => setShowApiKeyInput(false)}
            >
              Save
            </Button>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Button 
          size="sm" 
          variant={mapStyle === 'streets' ? 'default' : 'outline'} 
          className={`flex items-center gap-2 ${mapStyle === 'streets' ? 'bg-ptt-blue text-white' : 'bg-beam-dark-accent/80 text-white'}`}
          onClick={() => setMapStyle('streets')}
        >
          <MapPin className="h-4 w-4" />
          <span>Street</span>
        </Button>
        <Button 
          size="sm" 
          variant={mapStyle === 'satellite' ? 'default' : 'outline'} 
          className={`flex items-center gap-2 ${mapStyle === 'satellite' ? 'bg-ptt-blue text-white' : 'bg-beam-dark-accent/80 text-white'}`}
          onClick={() => setMapStyle('satellite')}
        >
          <Satellite className="h-4 w-4" />
          <span>Satellite</span>
        </Button>
      </div>
      
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button 
          size="sm" 
          variant={mapLayer === 'sites' ? 'default' : 'outline'} 
          className={`flex items-center gap-2 ${mapLayer === 'sites' ? 'bg-ptt-blue text-white' : 'bg-beam-dark-accent/80 text-white'}`}
          onClick={() => setMapLayer('sites')}
        >
          <MapPin className="h-4 w-4" />
          <span>Sites</span>
        </Button>
        <Button 
          size="sm" 
          variant={mapLayer === 'heatmap' ? 'default' : 'outline'} 
          className={`flex items-center gap-2 ${mapLayer === 'heatmap' ? 'bg-ptt-blue text-white' : 'bg-beam-dark-accent/80 text-white'}`}
          onClick={() => setMapLayer('heatmap')}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Heatmap</span>
        </Button>
      </div>
      
      <div 
        ref={mapContainer} 
        className="flex-1 rounded-lg overflow-hidden" 
        style={{ height: '100%', minHeight: '450px' }}
      />
      
      <div className="absolute bottom-4 left-4 z-10 bg-beam-dark-accent/80 p-2 rounded border border-gray-700/50 text-white text-xs">
        <div className="font-bold mb-1">Legend</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-3 rounded-full bg-9b87f5"></div>
          <span>Low Congestion</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-3 rounded-full bg-F97316"></div>
          <span>Medium Congestion</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-3 rounded-full bg-ea384c"></div>
          <span>High Congestion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-8E9196"></div>
          <span>Inactive</span>
        </div>
      </div>
    </div>
  );
};

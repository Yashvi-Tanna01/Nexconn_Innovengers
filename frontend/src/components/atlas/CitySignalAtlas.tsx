import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AtlasSignal,
  AtlasCandidateCluster,
  ATLAS_SIGNALS,
  ATLAS_CANDIDATE_CLUSTERS,
} from './types';
import { createAtlasMarkerIcon } from './AtlasSymbols';
import { SignalThreadsLayer } from './SignalThreadsLayer';
import { AtlasToolbar } from './AtlasToolbar';
import { AtlasContextPanel } from './AtlasContextPanel';
import { AtlasLegend } from './AtlasLegend';
import { NexconnChatPanel } from '../chat/NexconnChatPanel';

interface CitySignalAtlasProps {
  className?: string;
  onSignalClick?: (signal: AtlasSignal) => void;
  initialSelectedId?: string;
  selectedSignalId?: string;
  externalStatusFilter?: string;
  externalCategoryFilter?: string;
}

// Metropolitan anchor: Bangalore East Municipal Infrastructure Core
const CITY_CENTER: [number, number] = [12.9754, 77.6410];
const DEFAULT_ZOOM = 14;

export const CitySignalAtlas: React.FC<CitySignalAtlasProps> = ({
  className = '',
  onSignalClick,
  initialSelectedId,
  selectedSignalId,
  externalStatusFilter = 'all',
  externalCategoryFilter = 'all',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);

  const effectiveInitialId = selectedSignalId || initialSelectedId;
  const [mapReady, setMapReady] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<AtlasSignal | null>(() => {
    if (effectiveInitialId) {
      return ATLAS_SIGNALS.find((s) => s.id === effectiveInitialId) || null;
    }
    return null;
  });
  const [selectedCluster, setSelectedCluster] = useState<AtlasCandidateCluster | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(externalCategoryFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>(externalStatusFilter);
  const [showThreads, setShowThreads] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string; title: string } | null>(null);
  const [pulseCycle, setPulseCycle] = useState<number>(0);
  const [isLocating, setIsLocating] = useState(false);

  // Sync external filter changes
  useEffect(() => {
    setSelectedStatus(externalStatusFilter);
  }, [externalStatusFilter]);

  useEffect(() => {
    setSelectedCategory(externalCategoryFilter);
  }, [externalCategoryFilter]);

  // Sync external selectedSignalId prop
  useEffect(() => {
    if (selectedSignalId) {
      const match = ATLAS_SIGNALS.find((s) => s.id === selectedSignalId);
      if (match && match.id !== selectedSignal?.id) {
        setSelectedSignal(match);
        setSelectedCluster(null);
        setPulseCycle((prev) => prev + 1);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(match.coordinates, { animate: true, duration: 0.5 });
        }
      }
    } else if (selectedSignalId === '') {
      setSelectedSignal(null);
    }
  }, [selectedSignalId, selectedSignal?.id]);

  // 1. Initialize Leaflet Map Instance Once
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map with smooth inertia and light surface
    const map = L.map(containerRef.current, {
      center: CITY_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false, // Managed by custom AtlasToolbar
      attributionControl: true,
      minZoom: 12,
      maxZoom: 18,
    });

<<<<<<< HEAD
    // CartoDB Positron: Beautiful light territorial intelligence basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> • ANTAH Spatial',
      subdomains: 'abcd',
=======
    // OpenStreetMap provides a keyless basemap for local development.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> • ANTAH Signal Atlas',
>>>>>>> 47ff7f9fca8662f280eb044dc656c922c8a25145
      maxZoom: 19,
    }).addTo(map);

    // Layer groups
    const markersLayer = L.layerGroup().addTo(map);
    const userLocationLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    userLocationLayerRef.current = userLocationLayer;
    mapInstanceRef.current = map;
    setMapReady(true);

    // Click on empty map deselects active inspector
    map.on('click', (e) => {
      // Don't deselect if clicked a marker
      const target = e.originalEvent?.target as HTMLElement;
      if (!target?.closest('.atlas-symbol-wrapper')) {
        setSelectedSignal(null);
        setSelectedCluster(null);
      }
    });

    // Responsive container resize observer with debounced invalidateSize
    let resizeTimer: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ animate: false });
        }
      }, 80);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      userLocationLayerRef.current = null;
    };
  }, []);

  // 2. Filtered Signals
  const filteredSignals = useMemo(() => {
    return ATLAS_SIGNALS.filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'candidate_clusters') {
          if (s.status !== 'candidate_pattern') return false;
        } else if (selectedStatus === 'verified_incidents') {
          if (s.status !== 'verified_incident') return false;
        } else if (selectedStatus === 'resolved') {
          if (s.status !== 'resolved') return false;
        } else if (selectedStatus === 'active_reports') {
          if (s.status === 'resolved') return false;
        } else if (s.status !== selectedStatus) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedStatus]);

  // 3. Selection Handlers
  const handleSelectSignal = useCallback((signal: AtlasSignal) => {
    setSelectedSignal(signal);
    setSelectedCluster(null);
    setPulseCycle((prev) => prev + 1);
    if (onSignalClick) onSignalClick(signal);

    // Pan map gently toward selected signal
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(signal.coordinates, { animate: true, duration: 0.5 });
    }
  }, [onSignalClick]);

  const handleSelectCluster = useCallback((cluster: AtlasCandidateCluster) => {
    setSelectedCluster(cluster);
    setSelectedSignal(null);

    // Fit bounds of connected cluster signals
    if (mapInstanceRef.current && cluster.signals.length >= 2) {
      const s1 = ATLAS_SIGNALS.find((s) => s.id === cluster.signals[0]);
      const s2 = ATLAS_SIGNALS.find((s) => s.id === cluster.signals[1]);
      if (s1 && s2) {
        const bounds = L.latLngBounds([s1.coordinates, s2.coordinates]);
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 16,
          animate: true,
          duration: 0.6,
        });
      }
    }
  }, []);

  const handleSelectSignalById = useCallback((id: string) => {
    const found = ATLAS_SIGNALS.find((s) => s.id === id);
    if (found) {
      handleSelectSignal(found);
    }
  }, [handleSelectSignal]);

  const handleRecenter = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(CITY_CENTER, DEFAULT_ZOOM, {
        animate: true,
        duration: 0.6,
      });
      setSelectedSignal(null);
      setSelectedCluster(null);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    mapInstanceRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapInstanceRef.current?.zoomOut();
  }, []);

  // 4. GPS Geolocation Handler
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      handleRecenter();
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(userCoords, 15, { duration: 1 });

          // Render GPS pulse marker
          if (userLocationLayerRef.current) {
            userLocationLayerRef.current.clearLayers();
            const userPulseIcon = L.divIcon({
              className: 'user-gps-pulse-container',
              html: `
                <div class="relative flex items-center justify-center w-8 h-8">
                  <span class="absolute w-8 h-8 rounded-full bg-[#0284C7]/20 animate-ping"></span>
                  <span class="w-4 h-4 rounded-full bg-[#0284C7] border-2 border-white shadow-md"></span>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
            L.marker(userCoords, { icon: userPulseIcon, title: 'Your Current Position' }).addTo(
              userLocationLayerRef.current
            );
          }
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation unavailable, recentering to Bangalore East', err);
        handleRecenter();
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  }, [handleRecenter]);

  // 5. Synchronize Markers with Leaflet Layer Group
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer || !mapInstanceRef.current) return;

    layer.clearLayers();

    filteredSignals.forEach((sig) => {
      const isSelected = selectedSignal?.id === sig.id;
      const isRelatedToSelected = Boolean(
        (selectedSignal?.relatedSignalId === sig.id) ||
        (selectedCluster?.signals.includes(sig.id))
      );

      const icon = createAtlasMarkerIcon(sig, isSelected, isRelatedToSelected, pulseCycle);
      const marker = L.marker(sig.coordinates, {
        icon,
        title: sig.title,
        zIndexOffset: isSelected ? 1000 : isRelatedToSelected ? 800 : 100,
      });

      marker.on('click', () => {
        handleSelectSignal(sig);
      });

      marker.addTo(layer);
    });
  }, [filteredSignals, selectedSignal, selectedCluster, handleSelectSignal, pulseCycle]);

  return (
    <div
      className={`atlas-container relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden select-none ${className}`}
      style={{ background: '#F0F2EE' }}
    >
      {/* 1. Underlying Leaflet Map Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing z-0"
        style={{ background: '#F0F2EE' }}
      />

      {/* 2. SVG Signal Threads Layer */}
      {mapReady && (
        <SignalThreadsLayer
          map={mapInstanceRef.current}
          signals={ATLAS_SIGNALS}
          clusters={ATLAS_CANDIDATE_CLUSTERS}
          selectedSignalId={selectedSignal?.id || null}
          selectedClusterId={selectedCluster?.id || null}
          onSelectCluster={handleSelectCluster}
          showThreads={showThreads}
        />
      )}

      {/* 3. Floating Map Controls & Category Filter */}
      <AtlasToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
        showThreads={showThreads}
        onToggleThreads={() => setShowThreads((prev) => !prev)}
        showLegend={showLegend}
        onToggleLegend={() => setShowLegend((prev) => !prev)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        totalSignals={filteredSignals.length}
      />

      {/* 4. Contextual Issue Detail Panel (Desktop card / Mobile bottom sheet) */}
      <AtlasContextPanel
        selectedSignal={selectedSignal}
        selectedCluster={selectedCluster}
        onClose={() => {
          setSelectedSignal(null);
          setSelectedCluster(null);
        }}
        onSelectSignalById={handleSelectSignalById}
        onOpenChat={(id, title) => setActiveChat({ id, title })}
      />

      {/* 5. Plain-Language Cartographic Legend */}
      <AtlasLegend
        isOpen={showLegend}
        onClose={() => setShowLegend(false)}
      />

      {/* 6. Nexconn Responder Incident Room Modal */}
      {activeChat && (
        <div className="fixed inset-0 z-[9995] bg-[#182322]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl h-[85vh] flex flex-col">
            <NexconnChatPanel
              incidentId={activeChat.id}
              incidentTitle={activeChat.title}
              onClose={() => setActiveChat(null)}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

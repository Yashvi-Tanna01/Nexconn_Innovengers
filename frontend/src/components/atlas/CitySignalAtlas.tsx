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
}

// Metropolitan anchor: Bangalore East Municipal Infrastructure Core
const CITY_CENTER: [number, number] = [12.9754, 77.6410];
const DEFAULT_ZOOM = 14;

export const CitySignalAtlas: React.FC<CitySignalAtlasProps> = ({
  className = '',
  onSignalClick,
  initialSelectedId,
  selectedSignalId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const effectiveInitialId = selectedSignalId || initialSelectedId;
  const [mapReady, setMapReady] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<AtlasSignal | null>(() => {
    if (effectiveInitialId) {
      return ATLAS_SIGNALS.find((s) => s.id === effectiveInitialId) || ATLAS_SIGNALS[0];
    }
    return ATLAS_SIGNALS[0];
  });
  const [selectedCluster, setSelectedCluster] = useState<AtlasCandidateCluster | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showThreads, setShowThreads] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string; title: string } | null>(null);
  const [pulseCycle, setPulseCycle] = useState<number>(0);

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
    }
  }, [selectedSignalId, selectedSignal?.id]);

  // 1. Initialize Leaflet Map Instance Once
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map with smooth inertia
    const map = L.map(containerRef.current, {
      center: CITY_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false, // Managed by custom AtlasToolbar
      attributionControl: true,
      minZoom: 12,
      maxZoom: 18,
    });

    // OpenStreetMap provides a keyless basemap for local development.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> • ANTAH Signal Atlas',
      maxZoom: 19,
    }).addTo(map);

    // Layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // 2. Filtered Signals
  const filteredSignals = useMemo(() => {
    return ATLAS_SIGNALS.filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
      return true;
    });
  }, [selectedCategory, selectedStatus]);

  // 3. Selection Handlers
  const handleSelectSignal = useCallback((signal: AtlasSignal) => {
    setSelectedSignal(signal);
    setSelectedCluster(null);
    setPulseCycle((prev) => prev + 1);
    if (onSignalClick) onSignalClick(signal);

    // Pan map gently toward selected signal if off-center
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(signal.coordinates, { animate: true, duration: 0.5 });
    }
  }, [onSignalClick]);

  const handleSelectCluster = useCallback((cluster: AtlasCandidateCluster) => {
    setSelectedCluster(cluster);
    setSelectedSignal(null);

    // Zoom/fit bounds of connected cluster signals
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

  // 4. Synchronize Markers with Leaflet Layer Group (Without tearing down the map)
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
      className={`atlas-container relative w-full h-[540px] sm:h-[640px] lg:h-[720px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 bg-[#FBFBF9] shadow-soft-md select-none ${className}`}
    >
      {/* 1. Underlying Leaflet Map Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing z-0"
        style={{ background: '#FBFBF9' }}
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

      {/* 3. Floating Editorial Map Toolbar */}
      <AtlasToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
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

      {/* 4. Contextual Inspection Panel */}
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

      {/* 5. Cartographic Legend */}
      <AtlasLegend
        isOpen={showLegend}
        onClose={() => setShowLegend(false)}
      />

      {/* 6. Nexconn Chat Modal Overlay (if launched from Atlas) */}
      {activeChat && (
        <div className="fixed inset-0 z-[9995] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
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

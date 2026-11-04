/**
 * ANTAH Device Capability & Performance Tier Classifier
 * Dynamically scales 3D graphics, shadow resolution, DPR, and physics
 * to maintain high frame-rate smoothness on Android devices and APK WebViews.
 */

export interface DeviceTier {
  isTouch: boolean;
  isMobile: boolean;
  isLowPower: boolean;
  dpr: [number, number];
  shadowMapSize: number;
  enableComplexShadows: boolean;
  enableVolumetricDust: boolean;
  maxBuildingCount: number;
}

export function detectDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') {
    return {
      isTouch: false,
      isMobile: false,
      isLowPower: false,
      dpr: [1, 1.5],
      shadowMapSize: 1024,
      enableComplexShadows: true,
      enableVolumetricDust: true,
      maxBuildingCount: 38,
    };
  }

  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  const width = window.innerWidth;
  const isMobile = width < 768 || (isTouch && width < 1024);

  // Check CPU cores and device memory if exposed
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  const isLowPower = isMobile || cores <= 4 || memory <= 4;

  // Adaptive DPR: On mobile, 1.0 - 1.25 prevents GPU thermal throttling
  const dpr: [number, number] = isMobile ? [1, 1.25] : [1, 1.5];

  return {
    isTouch,
    isMobile,
    isLowPower,
    dpr,
    shadowMapSize: isLowPower ? 512 : 1024,
    enableComplexShadows: !isLowPower,
    enableVolumetricDust: !isMobile,
    maxBuildingCount: isMobile ? 24 : 38,
  };
}


import { useState, useEffect } from 'react';

export interface PlatformInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isWeb: boolean;
  width: number;
  height: number;
}

export function usePlatform(): PlatformInfo {
  const [platform, setPlatform] = useState<PlatformInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: true,
    isWeb: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 880,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  });

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isAndroidDevice = /android/.test(userAgent);
      const isMobileViewport = width < 768 || isIOSDevice || isAndroidDevice;

      // Check Wails runtime if present
      const wailsObj = (window as unknown as { _wails?: unknown })._wails;
      const isDesktopApp = !!wailsObj && !isIOSDevice && !isAndroidDevice;

      setPlatform({
        isMobile: isMobileViewport,
        isIOS: isIOSDevice,
        isAndroid: isAndroidDevice,
        isDesktop: isDesktopApp || (!isIOSDevice && !isAndroidDevice && width >= 768),
        isWeb: !wailsObj,
        width,
        height,
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return platform;
}

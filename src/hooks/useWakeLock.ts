import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if the Wake Lock API is supported
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported || wakeLock) return;

    try {
      const wakeLockSentinel = await navigator.wakeLock!.request('screen');
      setWakeLock(wakeLockSentinel);
      setIsActive(true);

      // Listen for wake lock release (can happen automatically)
      wakeLockSentinel.addEventListener('release', () => {
        setIsActive(false);
        setWakeLock(null);
      });

      console.log('Screen wake lock activated');
    } catch (error) {
      console.error('Failed to activate screen wake lock:', error);
    }
  }, [isSupported, wakeLock]);

  const releaseWakeLock = useCallback(async () => {
    if (!wakeLock) return;

    try {
      await wakeLock.release();
      setWakeLock(null);
      setIsActive(false);
      console.log('Screen wake lock released');
    } catch (error) {
      console.error('Failed to release screen wake lock:', error);
    }
  }, [wakeLock]);

  // Handle visibility change - reacquire wake lock when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLock) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, wakeLock, requestWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLock) {
        releaseWakeLock();
      }
    };
  }, [wakeLock, releaseWakeLock]);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
}

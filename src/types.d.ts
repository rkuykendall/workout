/// <reference types="vite/client" />

// Screen Wake Lock API types
interface WakeLockSentinel {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
  addEventListener(type: 'release', listener: (event: Event) => void): void;
  removeEventListener(type: 'release', listener: (event: Event) => void): void;
}

interface Navigator {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  };
}

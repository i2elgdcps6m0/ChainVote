import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    relayerSDK?: {
      __initialized__?: boolean;
      initSDK: () => Promise<boolean>;
      createInstance: (config: Record<string, unknown>) => Promise<any>;
      SepoliaConfig: Record<string, unknown>;
    };
  }
}

type FHEStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseFHEReturn {
  instance: any | null;
  status: FHEStatus;
  error: Error | null;
  refresh: () => void;
}

const SDK_URL = 'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js';

/**
 * Load FHE SDK script
 */
const loadSDKScript = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Browser environment required'));
  }

  // SDK already loaded
  if (window.relayerSDK) {
    console.log('[useFHE] SDK already loaded');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Check for existing script
    const existing = document.querySelector(`script[src="${SDK_URL}"]`);
    if (existing) {
      console.log('[useFHE] Script tag exists, waiting...');
      const checkReady = setInterval(() => {
        if (window.relayerSDK) {
          clearInterval(checkReady);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkReady);
        if (!window.relayerSDK) {
          reject(new Error('SDK load timeout'));
        }
      }, 10000);
      return;
    }

    // Create new script
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.type = 'text/javascript';
    script.async = true;

    script.onload = () => {
      console.log('[useFHE] SDK script loaded');
      if (window.relayerSDK) {
        resolve();
      } else {
        reject(new Error('SDK loaded but window.relayerSDK undefined'));
      }
    };

    script.onerror = () => {
      reject(new Error(`Failed to load SDK from ${SDK_URL}`));
    };

    document.head.appendChild(script);
    console.log('[useFHE] Loading SDK script...');
  });
};

/**
 * React Hook for FHE instance management
 * Following official fhevm-react-template pattern
 */
export const useFHE = (provider?: any): UseFHEReturn => {
  const [instance, setInstance] = useState<any | null>(null);
  const [status, setStatus] = useState<FHEStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initializingRef = useRef(false);

  const refresh = useCallback(() => {
    console.log('[useFHE] Refresh requested');
    // Cancel ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setInstance(null);
    setError(null);
    setStatus('idle');
    initializingRef.current = false;
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Skip if already have instance
    if (instance) {
      console.log('[useFHE] Instance already exists');
      return;
    }

    // Skip if already initializing
    if (initializingRef.current) {
      console.log('[useFHE] Already initializing');
      return;
    }

    // Get provider
    const ethereumProvider = provider ||
      (typeof window !== 'undefined' && (
        window.ethereum ||
        (window as any).okxwallet?.provider ||
        (window as any).okxwallet ||
        (window as any).coinbaseWalletExtension
      ));

    if (!ethereumProvider) {
      console.log('[useFHE] No provider available yet');
      return;
    }

    initializingRef.current = true;
    setStatus('loading');
    setError(null);

    // Create abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const { signal } = abortController;

    console.log('[useFHE] Starting initialization...');

    (async () => {
      try {
        // Step 1: Load SDK
        if (signal.aborted) return;
        console.log('[useFHE] Loading SDK...');
        await loadSDKScript();

        if (signal.aborted) return;
        const sdk = window.relayerSDK;
        if (!sdk) {
          throw new Error('SDK not available after loading');
        }

        // Step 2: Initialize SDK (only once)
        if (signal.aborted) return;
        if (!sdk.__initialized__) {
          console.log('[useFHE] Initializing SDK...');
          const initResult = await sdk.initSDK();
          sdk.__initialized__ = initResult;
          if (!initResult) {
            throw new Error('SDK initSDK() failed');
          }
          console.log('[useFHE] SDK initialized');
        } else {
          console.log('[useFHE] SDK already initialized');
        }

        // Step 3: Create instance
        if (signal.aborted) return;
        console.log('[useFHE] Creating FHE instance...');

        const config = {
          ...sdk.SepoliaConfig,
          network: ethereumProvider,
        };

        const fheInstance = await sdk.createInstance(config);

        if (signal.aborted) return;
        console.log('[useFHE] ✅ Instance created successfully');

        setInstance(fheInstance);
        setStatus('ready');
        initializingRef.current = false;
      } catch (err: any) {
        if (signal.aborted) {
          console.log('[useFHE] Initialization aborted');
          return;
        }

        console.error('[useFHE] ❌ Initialization failed:', err);
        setError(err);
        setStatus('error');
        initializingRef.current = false;
      }
    })();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [provider, refreshTrigger, instance]);

  return { instance, status, error, refresh };
};

/**
 * Encrypt vote using FHE instance
 */
export const encryptVoteWithInstance = async (
  instance: any,
  voteValue: bigint,
  contractAddress: string,
  userAddress: string
): Promise<{
  encryptedVote: `0x${string}`;
  proof: `0x${string}`;
}> => {
  if (!instance) {
    throw new Error('FHE instance not ready');
  }

  console.log('[encryptVote] Creating encrypted input...');
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(voteValue);

  console.log('[encryptVote] Encrypting...');
  const { handles, inputProof } = await input.encrypt();

  console.log('[encryptVote] ✅ Encryption complete');

  // Convert to hex strings
  const encryptedVote = `0x${Buffer.from(handles[0]).toString('hex')}` as `0x${string}`;
  const proof = `0x${Buffer.from(inputProof).toString('hex')}` as `0x${string}`;

  return { encryptedVote, proof };
};

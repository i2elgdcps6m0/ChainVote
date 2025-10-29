import { hexlify, getAddress } from "ethers";

declare global {
  interface Window {
    relayerSDK?: {
      __initialized__?: boolean;
      initSDK: () => Promise<boolean>;
      createInstance: (config: Record<string, unknown>) => Promise<any>;
      SepoliaConfig: Record<string, unknown>;
    };
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;
let initPromise: Promise<any> | null = null;
let sdkPromise: Promise<void> | null = null;

const SDK_URL = 'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js';

/**
 * Reset FHE instance (useful for error recovery or wallet change)
 */
export const resetFHEInstance = () => {
  console.log('🔄 Resetting FHE instance...');
  fheInstance = null;
  initPromise = null;
};

/**
 * Check if relayerSDK is properly initialized
 */
const isFhevmInitialized = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (!window.relayerSDK) return false;
  return window.relayerSDK.__initialized__ === true;
};

/**
 * Validate relayerSDK structure
 */
const isValidRelayerSDK = (sdk: any): boolean => {
  return (
    sdk &&
    typeof sdk === 'object' &&
    typeof sdk.initSDK === 'function' &&
    typeof sdk.createInstance === 'function' &&
    sdk.SepoliaConfig &&
    typeof sdk.SepoliaConfig === 'object'
  );
};

/**
 * Dynamically load Zama FHE SDK from CDN
 * Following official fhevm-react-template pattern
 */
const loadSdk = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  // Check if SDK is already loaded and valid
  if (window.relayerSDK) {
    if (!isValidRelayerSDK(window.relayerSDK)) {
      throw new Error('window.relayerSDK is invalid');
    }
    console.log('✅ SDK already loaded');
    return;
  }

  // Use singleton promise to prevent duplicate loading
  if (!sdkPromise) {
    sdkPromise = new Promise<void>((resolve, reject) => {
      // Check if script tag already exists
      const existing = document.querySelector(`script[src="${SDK_URL}"]`) as HTMLScriptElement | null;
      if (existing) {
        console.log('⏳ SDK script tag exists, waiting for load...');
        const checkLoaded = () => {
          if (window.relayerSDK && isValidRelayerSDK(window.relayerSDK)) {
            resolve();
          } else {
            reject(new Error('SDK script exists but window.relayerSDK is invalid'));
          }
        };
        existing.addEventListener('load', checkLoaded);
        existing.addEventListener('error', () => reject(new Error('Failed to load FHE SDK')));
        return;
      }

      // Create and append new script tag to document.head (not body!)
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => {
        if (window.relayerSDK && isValidRelayerSDK(window.relayerSDK)) {
          console.log('✅ SDK loaded successfully');
          resolve();
        } else {
          reject(new Error('SDK loaded but window.relayerSDK is invalid'));
        }
      };

      script.onerror = () => {
        reject(new Error(`Failed to load FHE SDK from ${SDK_URL}`));
      };

      // Append to head, not body (matches official template)
      document.head.appendChild(script);
      console.log('📦 Loading FHE SDK from CDN...');
    });
  }

  return sdkPromise;
};

/**
 * Initialize FHE SDK following official fhevm-react-template pattern
 * Key improvements:
 * - Checks __initialized__ flag to prevent re-initialization
 * - Proper SDK validation
 * - Cleaner instance lifecycle management
 */
export const initializeFHE = async (provider?: any, timeoutMs: number = 60000) => {
  // Return existing instance if available
  if (fheInstance) {
    console.log('🔄 Reusing existing FHE instance');
    return fheInstance;
  }

  // Return ongoing initialization promise
  if (initPromise) {
    console.log('⏳ Waiting for ongoing FHE initialization');
    return initPromise;
  }

  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  // Get Ethereum provider from multiple sources (MetaMask, OKX, Coinbase)
  const ethereumProvider = provider ||
    window.ethereum ||
    (window as any).okxwallet?.provider ||
    (window as any).okxwallet ||
    (window as any).coinbaseWalletExtension;

  if (!ethereumProvider) {
    throw new Error('Ethereum provider not found. Please connect your wallet first.');
  }

  console.log('🔌 Using Ethereum provider:', {
    isOKX: !!(window as any).okxwallet,
    isMetaMask: !!(window.ethereum as any)?.isMetaMask,
  });

  // Create initialization promise with timeout
  initPromise = Promise.race([
    (async () => {
      // Step 1: Load SDK script if not loaded
      await loadSdk();

      const sdk = window.relayerSDK;
      if (!sdk) {
        throw new Error('SDK loaded but window.relayerSDK is undefined');
      }

      // Step 2: Initialize SDK if not already initialized
      if (!isFhevmInitialized()) {
        console.log('🚀 Initializing FHE SDK...');
        const initResult = await sdk.initSDK();
        sdk.__initialized__ = initResult;

        if (!initResult) {
          throw new Error('SDK initSDK() returned false');
        }
        console.log('✅ SDK initialized');
      } else {
        console.log('✅ SDK already initialized');
      }

      // Step 3: Create FHE instance
      console.log('⚙️ Creating FHE instance...');
      const config = {
        ...sdk.SepoliaConfig,
        network: ethereumProvider,
      };

      const instance = await sdk.createInstance(config);
      console.log('✅ FHE instance created for Sepolia');

      fheInstance = instance;
      return instance;
    })(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`FHE initialization timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);

  try {
    const result = await initPromise;
    initPromise = null;
    return result;
  } catch (error: any) {
    initPromise = null;
    fheInstance = null;

    console.error('❌ FHE initialization failed:', error);

    // Provide helpful error messages
    if (error.message?.includes('timeout')) {
      throw new Error(
        `FHE initialization timed out after ${timeoutMs/1000}s. ` +
        `This may be due to slow network connection. Please try again.`
      );
    }

    throw error;
  }
};

/**
 * Encrypt a vote value (always 1 for a single vote)
 * @param voteValue The value to encrypt (should be 1 for a vote)
 * @param contractAddress The ChainVote contract address
 * @param userAddress The voter's address
 * @returns Encrypted vote and proof
 */
export const encryptVote = async (
  voteValue: bigint,
  contractAddress: string,
  userAddress: string,
  provider?: any,
  timeoutMs: number = 60000
): Promise<{
  encryptedVote: `0x${string}`;
  proof: `0x${string}`;
}> => {
  console.log('🔐 Starting vote encryption...');

  const fhe = await initializeFHE(provider);
  const checksumAddress = getAddress(contractAddress);

  console.log('📝 Creating encrypted input...');
  const input = fhe.createEncryptedInput(checksumAddress, userAddress);
  input.add64(voteValue); // euint64 for vote value

  console.log('🔒 Encrypting vote...');

  // Add timeout to encryption process
  const encryptionPromise = input.encrypt();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Vote encryption timeout after ${timeoutMs}ms`)), timeoutMs)
  );

  const { handles, inputProof } = await Promise.race([encryptionPromise, timeoutPromise]) as any;

  console.log('✅ Vote encrypted successfully');

  return {
    encryptedVote: hexlify(handles[0]) as `0x${string}`,
    proof: hexlify(inputProof) as `0x${string}`,
  };
};

import { hexlify, getAddress } from "ethers";

declare global {
  interface Window {
    relayerSDK?: {
      initSDK: () => Promise<void>;
      createInstance: (config: Record<string, unknown>) => Promise<any>;
      SepoliaConfig: Record<string, unknown>;
    };
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;
let initPromise: Promise<any> | null = null;
let sdkPromise: Promise<any> | null = null;

const SDK_URL = 'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js';

/**
 * Dynamically load Zama FHE SDK from CDN
 */
const loadSdk = async (): Promise<any> => {
  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  if (window.relayerSDK) {
    return window.relayerSDK;
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SDK_URL}"]`) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(window.relayerSDK));
        existing.addEventListener('error', () => reject(new Error('Failed to load FHE SDK')));
        return;
      }

      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => {
        if (window.relayerSDK) {
          resolve(window.relayerSDK);
        } else {
          reject(new Error('relayerSDK unavailable after load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load FHE SDK'));
      document.body.appendChild(script);
    });
  }

  return sdkPromise;
};

/**
 * Initialize FHE SDK with timeout and retry logic
 */
export const initializeFHE = async (provider?: any, timeoutMs: number = 90000) => {
  // Return existing instance
  if (fheInstance) {
    console.log('🔄 Reusing existing FHE instance');
    return fheInstance;
  }

  // Return ongoing initialization
  if (initPromise) {
    console.log('⏳ Waiting for ongoing FHE initialization');
    return initPromise;
  }

  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  // Get Ethereum provider from multiple sources
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
      console.log('📦 Loading FHE SDK...');
      const sdk = await loadSdk();

      if (!sdk) {
        throw new Error('FHE SDK not available');
      }

      console.log('🚀 Initializing FHE SDK...');
      await sdk.initSDK();

      console.log('⚙️ Creating FHE instance...');
      const config = {
        ...sdk.SepoliaConfig,
        network: ethereumProvider,
      };

      const instance = await sdk.createInstance(config);
      console.log('✅ FHE instance initialized for Sepolia');

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
  } catch (error) {
    initPromise = null;
    fheInstance = null;
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

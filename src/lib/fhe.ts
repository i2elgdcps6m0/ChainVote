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

export const initializeFHE = async (provider?: any) => {
  if (fheInstance) return fheInstance;

  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires browser environment');
  }

  if (!window.relayerSDK) {
    throw new Error(
      "Zama FHE SDK not loaded. Make sure the SDK script is included in index.html"
    );
  }

  // Get Ethereum provider from multiple sources
  // Priority: passed provider > window.ethereum > window.okxwallet > window.coinbaseWalletExtension
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
    provider: ethereumProvider
  });

  const sdk = window.relayerSDK;
  await sdk.initSDK();

  // Use the built-in SepoliaConfig from the SDK
  const config = {
    ...sdk.SepoliaConfig,
    network: ethereumProvider,
  };

  fheInstance = await sdk.createInstance(config);
  console.log('✅ FHE instance initialized for Sepolia');

  return fheInstance;
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
  provider?: any
): Promise<{
  encryptedVote: `0x${string}`;
  proof: `0x${string}`;
}> => {
  const fhe = await initializeFHE(provider);
  const checksumAddress = getAddress(contractAddress);

  const input = fhe.createEncryptedInput(checksumAddress, userAddress);
  input.add64(voteValue); // euint64 for vote value
  const { handles, inputProof } = await input.encrypt();

  return {
    encryptedVote: hexlify(handles[0]) as `0x${string}`,
    proof: hexlify(inputProof) as `0x${string}`,
  };
};

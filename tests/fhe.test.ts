import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeFHE, encryptVote } from '../src/lib/fhe';

// Mock window.relayerSDK
const mockRelayerSDK = {
  initSDK: vi.fn().mockResolvedValue(true),
  createInstance: vi.fn().mockResolvedValue({
    createEncryptedInput: vi.fn().mockReturnValue({
      add64: vi.fn(),
      encrypt: vi.fn().mockResolvedValue({
        handles: [new Uint8Array([1, 2, 3, 4])],
        inputProof: new Uint8Array([5, 6, 7, 8]),
      }),
    }),
  }),
  SepoliaConfig: {
    chainId: 11155111,
    network: 'sepolia',
  },
};

describe('FHE Module', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup window.relayerSDK
    (global as any).window = {
      relayerSDK: mockRelayerSDK,
      ethereum: {
        isMetaMask: true,
        request: vi.fn(),
      },
    };
  });

  describe('initializeFHE', () => {
    it('should initialize FHE SDK successfully', async () => {
      const fheInstance = await initializeFHE();

      expect(fheInstance).toBeDefined();
      expect(mockRelayerSDK.initSDK).toHaveBeenCalled();
      expect(mockRelayerSDK.createInstance).toHaveBeenCalled();
    });

    it('should reuse existing FHE instance on subsequent calls', async () => {
      const firstInstance = await initializeFHE();
      const secondInstance = await initializeFHE();

      expect(firstInstance).toBe(secondInstance);
      expect(mockRelayerSDK.initSDK).toHaveBeenCalledTimes(1);
    });

    it('should throw error when no Ethereum provider is found', async () => {
      (global as any).window.ethereum = undefined;
      (global as any).window.okxwallet = undefined;

      // Reset fheInstance by reloading module
      vi.resetModules();
      const { initializeFHE: freshInitFHE } = await import('../src/lib/fhe');

      await expect(freshInitFHE()).rejects.toThrow('Ethereum provider not found');
    });

    it('should support OKX wallet provider', async () => {
      (global as any).window.ethereum = undefined;
      (global as any).window.okxwallet = {
        provider: { isOKX: true },
      };

      const fheInstance = await initializeFHE();

      expect(fheInstance).toBeDefined();
      expect(mockRelayerSDK.createInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          network: expect.objectContaining({ isOKX: true }),
        })
      );
    });
  });

  describe('encryptVote', () => {
    it('should encrypt vote value successfully', async () => {
      const voteValue = 1n;
      const contractAddress = '0xA51A41827dA62e60eBeA86291f587c502Ad791F7';
      const userAddress = '0x1234567890123456789012345678901234567890';

      const result = await encryptVote(voteValue, contractAddress, userAddress);

      expect(result).toHaveProperty('encryptedVote');
      expect(result).toHaveProperty('proof');
      expect(result.encryptedVote).toMatch(/^0x[0-9a-fA-F]+$/);
      expect(result.proof).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it('should call FHE SDK methods with correct parameters', async () => {
      const voteValue = 1n;
      const contractAddress = '0xA51A41827dA62e60eBeA86291f587c502Ad791F7';
      const userAddress = '0x1234567890123456789012345678901234567890';

      const mockInput = {
        add64: vi.fn(),
        encrypt: vi.fn().mockResolvedValue({
          handles: [new Uint8Array([1, 2, 3, 4])],
          inputProof: new Uint8Array([5, 6, 7, 8]),
        }),
      };

      const mockCreateInstance = vi.fn().mockResolvedValue({
        createEncryptedInput: vi.fn().mockReturnValue(mockInput),
      });

      mockRelayerSDK.createInstance = mockCreateInstance;

      await encryptVote(voteValue, contractAddress, userAddress);

      expect(mockInput.add64).toHaveBeenCalledWith(voteValue);
      expect(mockInput.encrypt).toHaveBeenCalled();
    });

    it('should handle encryption with different vote values', async () => {
      const contractAddress = '0xA51A41827dA62e60eBeA86291f587c502Ad791F7';
      const userAddress = '0x1234567890123456789012345678901234567890';

      const testCases = [0n, 1n, 100n, 1000000n];

      for (const voteValue of testCases) {
        const result = await encryptVote(voteValue, contractAddress, userAddress);

        expect(result.encryptedVote).toBeDefined();
        expect(result.proof).toBeDefined();
      }
    });

    it('should convert contract address to checksum format', async () => {
      const voteValue = 1n;
      const lowercaseAddress = '0xa51a41827da62e60ebea86291f587c502ad791f7';
      const userAddress = '0x1234567890123456789012345678901234567890';

      const mockCreateInput = vi.fn().mockReturnValue({
        add64: vi.fn(),
        encrypt: vi.fn().mockResolvedValue({
          handles: [new Uint8Array([1, 2, 3, 4])],
          inputProof: new Uint8Array([5, 6, 7, 8]),
        }),
      });

      const mockInstance = {
        createEncryptedInput: mockCreateInput,
      };

      mockRelayerSDK.createInstance = vi.fn().mockResolvedValue(mockInstance);

      await encryptVote(voteValue, lowercaseAddress, userAddress);

      // Should be called with checksummed address
      expect(mockCreateInput).toHaveBeenCalledWith(
        '0xA51A41827dA62e60eBeA86291f587c502Ad791F7',
        userAddress
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle SDK initialization failure', async () => {
      mockRelayerSDK.initSDK = vi.fn().mockRejectedValue(new Error('SDK init failed'));

      vi.resetModules();
      const { initializeFHE: freshInitFHE } = await import('../src/lib/fhe');

      await expect(freshInitFHE()).rejects.toThrow('SDK init failed');
    });

    it('should handle encryption failure', async () => {
      const mockInput = {
        add64: vi.fn(),
        encrypt: vi.fn().mockRejectedValue(new Error('Encryption failed')),
      };

      mockRelayerSDK.createInstance = vi.fn().mockResolvedValue({
        createEncryptedInput: vi.fn().mockReturnValue(mockInput),
      });

      const voteValue = 1n;
      const contractAddress = '0xA51A41827dA62e60eBeA86291f587c502Ad791F7';
      const userAddress = '0x1234567890123456789012345678901234567890';

      await expect(encryptVote(voteValue, contractAddress, userAddress))
        .rejects.toThrow('Encryption failed');
    });
  });
});

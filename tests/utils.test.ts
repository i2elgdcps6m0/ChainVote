import { describe, it, expect } from 'vitest';
import { cn } from '../src/lib/utils';

describe('Utils Module', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;

      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      );

      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
      expect(result).not.toContain('disabled-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('class1', undefined, null, 'class2');

      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).not.toContain('undefined');
      expect(result).not.toContain('null');
    });

    it('should merge tailwind conflicting classes correctly', () => {
      // clsx + tailwind-merge should resolve conflicts
      const result = cn('px-2', 'px-4');

      // Should only contain px-4 (last one wins)
      expect(result).toContain('px-4');
      expect(result).not.toContain('px-2');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');

      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('should handle object notation for conditional classes', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'error': true,
      });

      expect(result).toContain('active');
      expect(result).toContain('error');
      expect(result).not.toContain('disabled');
    });
  });

  describe('Utility Function Edge Cases', () => {
    it('should handle whitespace in class names', () => {
      const result = cn('  class1  ', '  class2  ');

      expect(result.trim()).toBeTruthy();
    });

    it('should handle duplicate class names', () => {
      const result = cn('btn', 'btn', 'btn-primary');

      // Should handle duplicates gracefully
      expect(result).toContain('btn');
      expect(result).toContain('btn-primary');
    });

    it('should handle complex tailwind classes', () => {
      const result = cn(
        'flex items-center justify-between',
        'rounded-lg border border-gray-200',
        'p-4 hover:bg-gray-50'
      );

      expect(result).toContain('flex');
      expect(result).toContain('items-center');
      expect(result).toContain('rounded-lg');
      expect(result).toContain('hover:bg-gray-50');
    });
  });
});

// Additional contract-related utility tests
describe('Contract Address Validation', () => {
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  it('should validate correct Ethereum addresses', () => {
    const validAddresses = [
      '0xA51A41827dA62e60eBeA86291f587c502Ad791F7',
      '0x0000000000000000000000000000000000000000',
      '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
    ];

    validAddresses.forEach(address => {
      expect(isValidAddress(address)).toBe(true);
    });
  });

  it('should reject invalid Ethereum addresses', () => {
    const invalidAddresses = [
      '0xInvalidAddress',
      '0x123', // Too short
      'A51A41827dA62e60eBeA86291f587c502Ad791F7', // Missing 0x
      '0xA51A41827dA62e60eBeA86291f587c502Ad791F7Z', // Invalid character
      '',
      null,
      undefined,
    ];

    invalidAddresses.forEach(address => {
      expect(isValidAddress(address as any)).toBe(false);
    });
  });
});

// Time-related utility tests
describe('Time Utilities', () => {
  describe('formatTimestamp', () => {
    const formatTimestamp = (timestamp: number): string => {
      return new Date(timestamp * 1000).toLocaleString();
    };

    it('should format Unix timestamp correctly', () => {
      const timestamp = 1640000000; // 2021-12-20
      const result = formatTimestamp(timestamp);

      expect(result).toBeTruthy();
      expect(result).toContain('2021');
    });

    it('should handle current timestamp', () => {
      const now = Math.floor(Date.now() / 1000);
      const result = formatTimestamp(now);

      expect(result).toBeTruthy();
    });
  });

  describe('isVotingActive', () => {
    const isVotingActive = (start: number, end: number): boolean => {
      const now = Math.floor(Date.now() / 1000);
      return now >= start && now <= end;
    };

    it('should return true when voting is active', () => {
      const start = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const end = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      expect(isVotingActive(start, end)).toBe(true);
    });

    it('should return false when voting has not started', () => {
      const start = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const end = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now

      expect(isVotingActive(start, end)).toBe(false);
    });

    it('should return false when voting has ended', () => {
      const start = Math.floor(Date.now() / 1000) - 7200; // 2 hours ago
      const end = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      expect(isVotingActive(start, end)).toBe(false);
    });
  });
});

// BigInt formatting tests
describe('BigInt Utilities', () => {
  describe('formatEther', () => {
    const formatEther = (wei: bigint): string => {
      // Simple implementation for testing
      return (Number(wei) / 1e18).toFixed(4);
    };

    it('should format wei to ether correctly', () => {
      const oneEther = 1000000000000000000n;
      expect(formatEther(oneEther)).toBe('1.0000');
    });

    it('should handle zero', () => {
      expect(formatEther(0n)).toBe('0.0000');
    });

    it('should handle small amounts', () => {
      const smallAmount = 100000000000000n; // 0.0001 ETH
      const result = formatEther(smallAmount);
      expect(Number(result)).toBeCloseTo(0.0001, 4);
    });
  });

  describe('parseEther', () => {
    const parseEther = (ether: string): bigint => {
      const value = parseFloat(ether) * 1e18;
      return BigInt(Math.floor(value));
    };

    it('should parse ether to wei correctly', () => {
      const result = parseEther('1.0');
      expect(result).toBe(1000000000000000000n);
    });

    it('should handle decimal values', () => {
      const result = parseEther('0.5');
      expect(result).toBe(500000000000000000n);
    });

    it('should handle small values', () => {
      const result = parseEther('0.0001');
      expect(result).toBe(100000000000000n);
    });
  });
});

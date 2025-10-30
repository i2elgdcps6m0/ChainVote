# ChainVote Unit Tests

Comprehensive test suite for the ChainVote FHE-based voting platform.

## Test Structure

```
tests/
├── fhe.test.ts          # FHE SDK integration tests
├── utils.test.ts        # Utility function tests
├── vote.test.ts         # Voting logic tests
└── README.md            # This file
```

## Test Files

### 1. fhe.test.ts (FHE Module Tests)

Tests for Fully Homomorphic Encryption SDK integration:

- **SDK Initialization**
  - Successful initialization
  - Instance reuse
  - Error handling
  - Multi-wallet support (MetaMask, OKX, Coinbase)

- **Vote Encryption**
  - Encrypt vote values
  - Parameter validation
  - Address checksum conversion
  - Different vote values

- **Edge Cases**
  - SDK initialization failures
  - Encryption errors
  - Missing Ethereum provider

**Key Tests:**
- `should initialize FHE SDK successfully`
- `should encrypt vote value successfully`
- `should support OKX wallet provider`
- `should handle encryption failure`

### 2. utils.test.ts (Utility Functions)

Tests for helper functions and utilities:

- **ClassName Merger (cn)**
  - Class name concatenation
  - Conditional classes
  - Tailwind class conflict resolution
  - Null/undefined handling

- **Contract Address Validation**
  - Valid Ethereum address format
  - Invalid address rejection
  - Checksum validation

- **Time Utilities**
  - Timestamp formatting
  - Voting window status
  - Active/inactive period detection

- **BigInt Operations**
  - Wei to Ether conversion
  - Ether to Wei parsing
  - Precision handling

**Key Tests:**
- `should merge tailwind conflicting classes correctly`
- `should validate correct Ethereum addresses`
- `should format Unix timestamp correctly`
- `should format wei to ether correctly`

### 3. vote.test.ts (Voting Logic)

Tests for core voting functionality:

- **Proposal Creation**
  - Parameter validation
  - Choice array validation
  - Time window verification
  - Name length validation

- **Voting Status**
  - Pending proposals
  - Active proposals
  - Ended proposals
  - Exact boundary times

- **Vote Validation**
  - Choice ID range checking
  - Voter address format
  - Double voting prevention
  - Encrypted data format

- **Results Calculation**
  - Vote percentage calculation
  - Winner determination
  - Tie scenarios
  - Voter turnout

- **Fee Calculation**
  - Proposal fee validation
  - Insufficient fee rejection
  - Fee updates

- **Proposal Management**
  - Filtering by status
  - Sorting by vote count
  - Search functionality

**Key Tests:**
- `should validate proposal creation parameters`
- `should prevent double voting (logic check)`
- `should calculate vote percentages correctly`
- `should determine winner correctly`

## Running Tests

### Install Dependencies

```bash
yarn add -D vitest @vitest/ui @vitest/coverage-v8 jsdom
```

### Run All Tests

```bash
yarn test
```

### Watch Mode

```bash
yarn test:watch
```

### UI Mode

```bash
yarn test:ui
```

### Coverage Report

```bash
yarn test:coverage
```

## Test Commands

Add these to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Configuration

Vitest configuration is in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Test Coverage Goals

- **FHE Module**: >80% coverage
- **Utility Functions**: >90% coverage
- **Voting Logic**: >85% coverage
- **Overall**: >80% coverage

## Mocking Strategy

### FHE SDK Mocking

```typescript
const mockRelayerSDK = {
  initSDK: vi.fn().mockResolvedValue(true),
  createInstance: vi.fn().mockResolvedValue(/* ... */),
  SepoliaConfig: { /* ... */ },
};

global.window = {
  relayerSDK: mockRelayerSDK,
  ethereum: { /* ... */ },
};
```

### Contract Interaction Mocking

For testing contract interactions, mock wagmi hooks:

```typescript
vi.mock('wagmi', () => ({
  useReadContract: vi.fn(),
  useWriteContract: vi.fn(),
  useAccount: vi.fn(),
}));
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Dependencies**: Mock FHE SDK, blockchain, etc.
5. **Edge Cases**: Test boundary conditions and error scenarios
6. **Coverage**: Aim for high code coverage but focus on quality

## Common Issues

### Issue: FHE SDK not mocked properly

**Solution**: Ensure `window.relayerSDK` is mocked in `beforeEach`:

```typescript
beforeEach(() => {
  global.window = { relayerSDK: mockRelayerSDK };
});
```

### Issue: BigInt serialization errors

**Solution**: Use `toString()` for BigInt comparisons:

```typescript
expect(result.toString()).toBe('1000000000000000000');
```

### Issue: Async timing issues

**Solution**: Use `async/await` properly:

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});
```

## Future Test Additions

- [ ] Component integration tests
- [ ] E2E tests with Playwright
- [ ] Contract deployment tests
- [ ] Performance benchmarks
- [ ] Security vulnerability tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Ethereum Testing Guide](https://ethereum.org/en/developers/docs/testing/)

---

**Last Updated**: 2025-10-31
**Test Framework**: Vitest v4.0+
**Coverage**: 85%+ target

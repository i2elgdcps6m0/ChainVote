# ChainVote Contract Deployment

## Setup

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Configure environment variables:
```bash
# Edit .env file and add your private key
PRIVATE_KEY=your_private_key_here
```

## Compile Contract

```bash
npx hardhat compile
```

## Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## After Deployment

1. Copy the deployed contract address from the console output
2. Update `../src/config/contracts.ts` with the new address:
   ```typescript
   ChainVote: "0xYourNewContractAddress"
   ```

## Contract Info

- **Name**: ChainVote
- **Network**: Sepolia Testnet
- **Solidity Version**: 0.8.24
- **FHE Library**: @fhevm/solidity v0.8.0
- **Features**:
  - Anyone can create proposals (0.001 ETH fee)
  - FHE-encrypted voting (euint64)
  - Results decryption after voting ends
  - Double voting prevention

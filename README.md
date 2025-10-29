# ChainVote - Privacy-Preserving On-Chain Voting

<div align="center">

**Fully private on-chain voting platform powered by Fully Homomorphic Encryption (FHE)**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![Zama fhEVM](https://img.shields.io/badge/Zama-fhEVM%200.8.0-purple)](https://docs.zama.ai/fhevm)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [How It Works](#-how-it-works)
- [FHE Encryption Architecture](#-fhe-encryption-architecture)
- [Smart Contract Architecture](#-smart-contract-architecture)
- [Technical Stack](#-technical-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Deployment](#-deployment)
- [Usage](#-usage)
- [Security Considerations](#-security-considerations)
- [License](#-license)

---

## 🎯 Overview

ChainVote is a decentralized voting platform that leverages **Zama's Fully Homomorphic Encryption (FHE)** technology to provide complete privacy for on-chain voting. Unlike traditional blockchain voting systems where votes are publicly visible, ChainVote ensures that individual vote tallies remain encrypted throughout the voting period and are only decrypted after voting concludes.

### Why FHE for Voting?

Traditional blockchain voting faces a fundamental challenge: **vote transparency vs. voter privacy**. ChainVote solves this using FHE:

- ✅ **Votes are encrypted on-chain** - No one can see intermediate vote counts
- ✅ **Homomorphic vote accumulation** - Votes are added without decryption
- ✅ **Verifiable results** - Final results are cryptographically proven
- ✅ **No trusted setup** - Fully decentralized architecture

---

## ⚡ Core Features

### 1. **Permissionless Proposal Creation**
- Anyone can create voting proposals (with anti-spam fee)
- Customizable voting time windows
- Support for 2-10 voting options per proposal
- Immutable proposal details on-chain

### 2. **Encrypted Voting**
- Client-side vote encryption using Zama FHE SDK
- Zero-knowledge proofs for vote validity
- Homomorphic vote accumulation
- Double-voting prevention

### 3. **Privacy-Preserving Vote Counting**
- Vote tallies remain encrypted during voting period
- FHE operations for secure accumulation
- Results only decrypted after voting ends
- Gateway-based decryption with cryptographic proofs

### 4. **User-Friendly Interface**
- Real-time proposal listing
- Wallet integration (MetaMask, WalletConnect)
- Transaction status tracking
- Responsive design

---

## 🔐 How It Works

### Voting Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CHAINVOTE VOTING FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

1. CREATE PROPOSAL (Plaintext)
   ┌──────────────┐
   │   Proposer   │
   └──────┬───────┘
          │ Creates proposal with:
          │ - Name, Details
          │ - Options (2-10 choices)
          │ - Time window
          ↓
   ┌────────────────────┐
   │  Smart Contract    │  Stores proposal metadata
   │  (ChainVote.sol)   │  Initializes euint64 counters
   └────────────────────┘

2. VOTE CASTING (Encrypted)
   ┌──────────────┐
   │    Voter     │
   └──────┬───────┘
          │ Selects option
          ↓
   ┌────────────────────┐
   │  FHE SDK (Client)  │  Encrypts vote value (1)
   │  relayerSDK 0.2.0  │  Generates ZK proof
   └──────┬─────────────┘
          │ encryptedVote + proof
          ↓
   ┌────────────────────┐
   │  Smart Contract    │  FHE.fromExternal(vote, proof)
   │  (ChainVote.sol)   │  encryptedVotes[choice] += vote
   └──────┬─────────────┘  ← Homomorphic Addition
          │
          │ All votes encrypted:
          │ Choice A: euint64(encrypted)
          │ Choice B: euint64(encrypted)
          │ Choice C: euint64(encrypted)
          ↓
   ┌────────────────────┐
   │   Encrypted Votes  │  Stored on-chain
   │   ████████████████ │  Unreadable during voting
   └────────────────────┘

3. RESULTS DECRYPTION (After Voting Ends)
   ┌──────────────┐
   │  Anyone      │
   └──────┬───────┘
          │ Requests decryption
          ↓
   ┌────────────────────┐
   │  Smart Contract    │  FHE.requestDecryption()
   │  (ChainVote.sol)   │  Sends to Zama Gateway
   └──────┬─────────────┘
          │
          ↓
   ┌────────────────────┐
   │  Zama Gateway      │  Decrypts using threshold
   │  (Off-chain)       │  cryptography (MPC)
   └──────┬─────────────┘
          │ Decrypted values + signatures
          ↓
   ┌────────────────────┐
   │  decryptionCallback│  Verifies signatures
   │  (Smart Contract)  │  Publishes results
   └──────┬─────────────┘
          │
          ↓
   ┌────────────────────┐
   │  Public Results    │  Choice A: 42 votes
   │                    │  Choice B: 35 votes
   │                    │  Choice C: 23 votes
   └────────────────────┘
```

---

## 🧮 FHE Encryption Architecture

### Encryption Types Used

ChainVote uses **euint64** (encrypted 64-bit unsigned integer) for vote counting:

```solidity
// In Smart Contract
mapping(uint256 => euint64) encryptedVotes;  // choiceId => encrypted vote count
```

### Client-Side Encryption

```typescript
// Frontend: src/lib/fhe.ts
export const encryptVote = async (
  voteValue: bigint,      // Always 1 (one vote)
  contractAddress: string,
  userAddress: string
) => {
  // 1. Initialize FHE SDK with Sepolia config
  const fhe = await initializeFHE();

  // 2. Create encrypted input
  const input = fhe.createEncryptedInput(contractAddress, userAddress);
  input.add64(voteValue);  // Add 64-bit value

  // 3. Generate encryption + ZK proof
  const { handles, inputProof } = await input.encrypt();

  return {
    encryptedVote: handles[0],  // Encrypted handle
    proof: inputProof           // Zero-knowledge proof
  };
};
```

### On-Chain Homomorphic Operations

```solidity
// Smart Contract: ChainVote.sol

// 1. Import encrypted vote from client
euint64 vote = FHE.fromExternal(encryptedVote, proof);

// 2. Homomorphic addition (without decryption!)
proposal.encryptedVotes[choiceId] = FHE.add(
    proposal.encryptedVotes[choiceId],  // Current encrypted count
    vote                                 // New encrypted vote
);

// 3. Authorize contract to access result
FHE.allowThis(proposal.encryptedVotes[choiceId]);
```

### Decryption Process

```solidity
// 1. Request decryption from Zama Gateway
bytes32[] memory encryptedData = new bytes32[](choicesCount);
for (uint256 i = 0; i < choicesCount; i++) {
    encryptedData[i] = FHE.toBytes32(proposal.encryptedVotes[i]);
}

uint256 requestId = FHE.requestDecryption(
    encryptedData,
    this.decryptionCallback.selector
);

// 2. Gateway decrypts using threshold cryptography (off-chain)

// 3. Callback receives decrypted results with cryptographic proof
function decryptionCallback(
    uint256 requestId,
    bytes memory decryptedData,
    bytes memory decryptionProof
) external {
    // Verify signatures from Zama Gateway
    FHE.checkSignatures(requestId, decryptedData, decryptionProof);

    // Parse and store results
    for (uint256 i = 0; i < choicesCount; i++) {
        uint64 voteCount = parseDecryptedValue(decryptedData, i);
        proposal.publicVotes[i] = voteCount;
    }

    proposal.resultsPublished = true;
}
```

### FHE Security Properties

| Property | Description |
|----------|-------------|
| **Semantic Security** | Encrypted votes reveal no information about plaintext |
| **Homomorphic Addition** | `Enc(a) + Enc(b) = Enc(a + b)` without decryption |
| **Proof Verification** | ZK proofs ensure encrypted values are valid |
| **Threshold Decryption** | No single party can decrypt results |
| **Deterministic Replay** | Same input always produces same ciphertext (for this use case) |

---

## 🏗️ Smart Contract Architecture

### Contract: `ChainVote.sol`

```
ChainVote (inherits SepoliaConfig)
│
├── State Variables
│   ├── proposalCounter (uint256)              - Total proposals count
│   ├── proposalFee (uint256)                  - Anti-spam fee (0.001 ETH)
│   ├── proposals (mapping)                    - ProposalId → Proposal struct
│   ├── pendingDecryptions (mapping)           - Track decryption requests
│   └── decryptionRequestToProposal (mapping)  - RequestId → ProposalId
│
├── Structs
│   └── Proposal
│       ├── name (string)                      - Proposal title
│       ├── details (string)                   - Proposal description
│       ├── choices (string[])                 - Voting options
│       ├── votingStart (uint256)              - Start timestamp
│       ├── votingEnd (uint256)                - End timestamp
│       ├── resultsPublished (bool)            - Results published flag
│       ├── proposer (address)                 - Creator address
│       ├── encryptedVotes (mapping)           - choiceId → euint64
│       ├── publicVotes (mapping)              - choiceId → uint256 (after decryption)
│       ├── voted (mapping)                    - address → bool
│       └── voterCount (uint256)               - Total voters
│
├── Core Functions
│   ├── createProposal()                       - Create new voting proposal
│   │   ├── Validates fee payment
│   │   ├── Validates time window
│   │   ├── Initializes encrypted vote counters
│   │   └── Emits ProposalCreated event
│   │
│   ├── castVote()                             - Submit encrypted vote
│   │   ├── Checks voting time window
│   │   ├── Prevents double voting
│   │   ├── Imports encrypted vote with proof
│   │   ├── Performs homomorphic addition
│   │   └── Emits VoteCast event
│   │
│   ├── requestResultsDecryption()             - Request vote decryption
│   │   ├── Checks voting has ended
│   │   ├── Converts euint64 to bytes32
│   │   ├── Sends decryption request to Gateway
│   │   └── Emits ResultsDecryptionRequested
│   │
│   └── decryptionCallback()                   - Receive decrypted results
│       ├── Verifies Gateway signatures
│       ├── Parses decrypted vote counts
│       ├── Publishes results on-chain
│       └── Emits ResultsPublished event
│
├── View Functions
│   ├── getProposalInfo()                      - Get proposal metadata
│   ├── getProposalResults()                   - Get decrypted results
│   ├── hasVoted()                             - Check if address voted
│   └── getProposalCount()                     - Get total proposals
│
└── Admin Functions
    ├── updateProposalFee()                    - Update creation fee
    └── withdrawFunds()                        - Withdraw contract balance
```

### Key Design Decisions

1. **euint64 for Vote Counts**
   - Sufficient range: 0 to 18,446,744,073,709,551,615 votes
   - Efficient FHE operations
   - Gas-optimized on-chain storage

2. **Proposal Fee Mechanism**
   - Prevents spam proposal creation
   - Default: 0.001 ETH
   - Admin-configurable

3. **Time-Based Voting Windows**
   - `votingStart`: When voting begins
   - `votingEnd`: When voting closes
   - On-chain timestamp enforcement

4. **Decryption Request Pattern**
   - Permissionless: Anyone can request after voting ends
   - Asynchronous: Results arrive via callback
   - Verified: Zama Gateway signatures checked

5. **Double Voting Prevention**
   - `voted` mapping tracks addresses
   - Reverts if address already voted
   - Cannot be bypassed

---

## 💻 Technical Stack

### Smart Contract Layer

| Component | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | 0.8.24 | Smart contract language |
| **Hardhat** | 2.22.15 | Development environment |
| **@fhevm/solidity** | 0.8.0 | Zama FHE library |
| **Zama fhEVM** | Sepolia | FHE-enabled EVM |

### Frontend Layer

| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 18 | UI framework |
| **TypeScript** | 5 | Type-safe development |
| **Vite** | 5 | Build tool |
| **wagmi** | 2.x | Ethereum React hooks |
| **RainbowKit** | Latest | Wallet connection UI |
| **ethers.js** | 6.x | Ethereum utilities |
| **Zama Relayer SDK** | 0.2.0 | FHE encryption SDK |
| **Tailwind CSS** | 3.x | Styling |
| **shadcn/ui** | Latest | UI components |

### Infrastructure

| Component | Purpose |
|-----------|---------|
| **Sepolia Testnet** | Deployment network |
| **Zama Gateway** | FHE decryption service |
| **IPFS** (optional) | Decentralized metadata storage |

---

## 📁 Project Structure

```
ChainVote/
├── deploy-contracts/              # Smart contract deployment
│   ├── src/
│   │   └── ChainVote.sol         # Main voting contract
│   ├── scripts/
│   │   ├── deploy.js             # Deployment script
│   │   └── create-proposals.js   # Test data script
│   ├── hardhat.config.js         # Hardhat configuration
│   └── package.json
│
├── src/                          # Frontend application
│   ├── components/               # React components
│   │   ├── Header.tsx           # Navigation header
│   │   └── ui/                  # shadcn/ui components
│   │
│   ├── pages/                   # Page components
│   │   ├── Index.tsx            # Proposal list page
│   │   ├── VoteDetail.tsx       # Voting page
│   │   ├── CreateVote.tsx       # Create proposal page
│   │   └── About.tsx            # About page
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useChainVote.ts     # Contract interaction hooks
│   │
│   ├── lib/                     # Utilities
│   │   ├── fhe.ts              # FHE encryption functions
│   │   └── wagmi.ts            # Wagmi configuration
│   │
│   ├── config/                  # Configuration
│   │   └── contracts.ts        # Contract ABI & addresses
│   │
│   └── App.tsx                  # Root component
│
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind configuration
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 20.16.0
- **npm** or **yarn**
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Clone Repository

```bash
git clone https://github.com/i2elgdcps6m0/ChainVote.git
cd ChainVote
```

### Install Frontend Dependencies

```bash
npm install
```

### Install Contract Dependencies

```bash
cd deploy-contracts
npm install
cd ..
```

### Environment Variables

Create `.env` in `deploy-contracts/`:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here
```

⚠️ **Never commit your private key!**

---

## 📦 Deployment

### 1. Deploy Smart Contract

```bash
cd deploy-contracts
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat run scripts/deploy.js --network sepolia
```

Expected output:
```
ChainVote deployed to: 0xA51A41827dA62e60eBeA86291f587c502Ad791F7
Proposal fee: 0.001 ETH
Deployment successful!
```

### 2. Update Contract Address

Edit `src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  ChainVote: "0xYourDeployedContractAddress" as `0x${string}`,
};
```

### 3. Create Test Proposals (Optional)

```bash
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat run scripts/create-proposals.js --network sepolia
```

### 4. Start Frontend

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 🎮 Usage

### 1. **Connect Wallet**

Click "Connect Wallet" in the header and select your wallet provider.

### 2. **Browse Proposals**

- **Active** - Currently accepting votes
- **Pending** - Not yet started
- **Ended** - Voting closed, awaiting results

### 3. **Create Proposal**

```
1. Navigate to "Create Vote"
2. Fill in:
   - Title (e.g., "Protocol Upgrade v2.0")
   - Description
   - Start Date & Time
   - End Date & Time
   - Options (2-10 choices)
3. Pay proposal fee (0.001 ETH)
4. Wait for transaction confirmation
```

### 4. **Cast Vote**

```
1. Open a proposal during voting window
2. Select your choice
3. Click "Submit Encrypted Vote"
4. FHE SDK encrypts your vote
5. Approve transaction in wallet
6. Wait for confirmation
```

**What happens behind the scenes:**
- Your vote (value: 1) is encrypted client-side
- Zero-knowledge proof is generated
- Encrypted vote is sent to smart contract
- Contract adds it homomorphically to vote count
- No one can see your choice!

### 5. **View Results**

```
1. After voting ends, click "Request Decryption"
2. Anyone can trigger this
3. Zama Gateway decrypts votes
4. Results appear in ~30-60 seconds
```

---

## 🔒 Security Considerations

### Smart Contract Security

✅ **Double Voting Prevention**
- Addresses tracked in `voted` mapping
- Reverts on duplicate votes

✅ **Time Window Enforcement**
- `duringVoting` modifier checks timestamps
- Cannot vote before start or after end

✅ **Proposal Fee**
- Prevents spam attacks
- Admin-controlled fee adjustment

✅ **Decryption Access Control**
- Only callable after voting ends
- Results published once, immutable

### FHE Security

✅ **Semantic Security**
- Encrypted votes reveal no information about plaintext
- Cannot infer results during voting

✅ **Proof Verification**
- `FHE.fromExternal()` validates ZK proofs
- Prevents malicious encrypted data

✅ **Threshold Decryption**
- Zama Gateway uses MPC (Multi-Party Computation)
- No single entity can decrypt alone

### Known Limitations

⚠️ **Front-Running**
- Proposal metadata is public
- Consider using commit-reveal for sensitive proposals

⚠️ **Gas Costs**
- FHE operations are more expensive than plaintext
- Vote casting: ~300k-500k gas
- Decryption request: ~200k gas

⚠️ **Decryption Latency**
- Results take 30-60 seconds to decrypt
- Gateway processing time varies

---

## 🧪 Testing

### Run Contract Tests

```bash
cd deploy-contracts
npx hardhat test
```

### Test on Sepolia

1. Get Sepolia ETH from faucet
2. Deploy contract
3. Create test proposal
4. Cast votes from multiple accounts
5. Request decryption after voting ends

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- **[Zama](https://zama.ai/)** - For pioneering FHE technology
- **[fhEVM](https://docs.zama.ai/fhevm)** - Ethereum-compatible FHE Virtual Machine
- **[Hardhat](https://hardhat.org/)** - Ethereum development environment
- **[wagmi](https://wagmi.sh/)** - React hooks for Ethereum

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/i2elgdcps6m0/ChainVote/issues)
- **Documentation**: [Zama fhEVM Docs](https://docs.zama.ai/fhevm)
- **Community**: [Zama Discord](https://discord.com/invite/zama)

---

## 🚧 Roadmap

- [ ] Delegation voting support
- [ ] Quadratic voting with FHE
- [ ] IPFS metadata storage
- [ ] Multi-signature proposal creation
- [ ] Mobile-responsive improvements
- [ ] Mainnet deployment

---

<div align="center">

**Built with ❤️ using Zama FHE Technology**

[Documentation](https://docs.zama.ai/fhevm) • [Report Bug](https://github.com/i2elgdcps6m0/ChainVote/issues) • [Request Feature](https://github.com/i2elgdcps6m0/ChainVote/issues)

</div>

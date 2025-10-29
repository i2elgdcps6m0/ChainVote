export const CONTRACTS = {
  ChainVote: "0xA51A41827dA62e60eBeA86291f587c502Ad791F7" as `0x${string}`,
};

export const ABIS = {
  ChainVote: [
    {
      type: "constructor",
      inputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "admin",
      inputs: [],
      outputs: [{ name: "", type: "address", internalType: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "proposalCounter",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "proposalFee",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "createProposal",
      inputs: [
        { name: "name", type: "string", internalType: "string" },
        { name: "details", type: "string", internalType: "string" },
        { name: "choices", type: "string[]", internalType: "string[]" },
        { name: "votingStart", type: "uint256", internalType: "uint256" },
        { name: "votingEnd", type: "uint256", internalType: "uint256" },
      ],
      outputs: [{ name: "proposalId", type: "uint256", internalType: "uint256" }],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "castVote",
      inputs: [
        { name: "proposalId", type: "uint256", internalType: "uint256" },
        { name: "choiceId", type: "uint256", internalType: "uint256" },
        { name: "encryptedVote", type: "bytes32", internalType: "externalEuint64" },
        { name: "proof", type: "bytes", internalType: "bytes" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "requestResultsDecryption",
      inputs: [{ name: "proposalId", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getProposalInfo",
      inputs: [{ name: "proposalId", type: "uint256", internalType: "uint256" }],
      outputs: [
        { name: "name", type: "string", internalType: "string" },
        { name: "details", type: "string", internalType: "string" },
        { name: "choices", type: "string[]", internalType: "string[]" },
        { name: "votingStart", type: "uint256", internalType: "uint256" },
        { name: "votingEnd", type: "uint256", internalType: "uint256" },
        { name: "resultsPublished", type: "bool", internalType: "bool" },
        { name: "proposer", type: "address", internalType: "address" },
        { name: "voterCount", type: "uint256", internalType: "uint256" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getProposalResults",
      inputs: [{ name: "proposalId", type: "uint256", internalType: "uint256" }],
      outputs: [{ name: "votes", type: "uint256[]", internalType: "uint256[]" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "hasVoted",
      inputs: [
        { name: "proposalId", type: "uint256", internalType: "uint256" },
        { name: "voter", type: "address", internalType: "address" },
      ],
      outputs: [{ name: "", type: "bool", internalType: "bool" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getProposalCount",
      inputs: [],
      outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "updateProposalFee",
      inputs: [{ name: "newFee", type: "uint256", internalType: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "withdrawFunds",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "event",
      name: "ProposalCreated",
      inputs: [
        { name: "proposalId", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "proposer", type: "address", indexed: true, internalType: "address" },
        { name: "name", type: "string", indexed: false, internalType: "string" },
        { name: "votingStart", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "votingEnd", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "choicesCount", type: "uint256", indexed: false, internalType: "uint256" },
      ],
    },
    {
      type: "event",
      name: "VoteCast",
      inputs: [
        { name: "proposalId", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "voter", type: "address", indexed: true, internalType: "address" },
        { name: "choiceId", type: "uint256", indexed: true, internalType: "uint256" },
      ],
    },
    {
      type: "event",
      name: "ResultsDecryptionRequested",
      inputs: [
        { name: "proposalId", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "requestId", type: "uint256", indexed: true, internalType: "uint256" },
      ],
    },
    {
      type: "event",
      name: "ResultsPublished",
      inputs: [
        { name: "proposalId", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "votes", type: "uint256[]", indexed: false, internalType: "uint256[]" },
        { name: "totalVoters", type: "uint256", indexed: false, internalType: "uint256" },
      ],
    },
    {
      type: "event",
      name: "ProposalFeeUpdated",
      inputs: [
        { name: "oldFee", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "newFee", type: "uint256", indexed: false, internalType: "uint256" },
      ],
    },
    {
      type: "event",
      name: "FundsWithdrawn",
      inputs: [
        { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "recipient", type: "address", indexed: true, internalType: "address" },
      ],
    },
    {
      type: "error",
      name: "Unauthorized",
      inputs: [],
    },
    {
      type: "error",
      name: "InsufficientFee",
      inputs: [],
    },
    {
      type: "error",
      name: "InvalidProposal",
      inputs: [],
    },
    {
      type: "error",
      name: "InvalidTimeWindow",
      inputs: [],
    },
    {
      type: "error",
      name: "InvalidChoices",
      inputs: [],
    },
    {
      type: "error",
      name: "VotingNotStarted",
      inputs: [],
    },
    {
      type: "error",
      name: "VotingEnded",
      inputs: [],
    },
    {
      type: "error",
      name: "VotingInProgress",
      inputs: [],
    },
    {
      type: "error",
      name: "AlreadyVoted",
      inputs: [],
    },
    {
      type: "error",
      name: "InvalidChoice",
      inputs: [],
    },
    {
      type: "error",
      name: "ResultsAlreadyPublished",
      inputs: [],
    },
    {
      type: "error",
      name: "ResultsNotAvailable",
      inputs: [],
    },
    {
      type: "error",
      name: "DecryptionPending",
      inputs: [],
    },
    {
      type: "error",
      name: "InvalidCallback",
      inputs: [],
    },
    {
      type: "error",
      name: "WithdrawFailed",
      inputs: [],
    },
  ] as const,
};

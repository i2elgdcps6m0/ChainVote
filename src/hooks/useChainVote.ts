import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import { CONTRACTS, ABIS } from "@/config/contracts";
import { encryptVote, initializeFHE } from "@/lib/fhe";
import { parseEther } from "viem";

export function useChainVote() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Read proposal count
  const {
    data: proposalCount,
    refetch: refetchProposalCount,
  } = useReadContract({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    functionName: "getProposalCount",
  });

  // Read proposal fee
  const { data: proposalFee } = useReadContract({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    functionName: "proposalFee",
  });

  /**
   * Get proposal information by ID
   */
  const getProposalInfo = async (proposalId: bigint) => {
    const { data } = await useReadContract({
      address: CONTRACTS.ChainVote,
      abi: ABIS.ChainVote,
      functionName: "getProposalInfo",
      args: [proposalId],
    });
    return data;
  };

  /**
   * Get proposal results (only available after voting ends and results are published)
   */
  const { data: proposalResults, refetch: refetchResults } = useReadContract({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    functionName: "getProposalResults",
    args: [0n], // Default to proposal 0, will be overridden
  });

  /**
   * Check if user has voted
   */
  const { data: hasVoted, refetch: refetchHasVoted } = useReadContract({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    functionName: "hasVoted",
    args: [0n, address as `0x${string}`], // Default args, will be overridden
  });

  /**
   * Create a new proposal
   */
  const createProposal = async (
    name: string,
    details: string,
    choices: string[],
    votingStart: bigint,
    votingEnd: bigint
  ) => {
    if (!address) throw new Error("Wallet not connected");
    if (!proposalFee) throw new Error("Proposal fee not loaded");

    const hash = await writeContractAsync({
      address: CONTRACTS.ChainVote,
      abi: ABIS.ChainVote,
      functionName: "createProposal",
      args: [name, details, choices, votingStart, votingEnd],
      value: proposalFee as bigint,
    });

    return hash;
  };

  /**
   * Cast an encrypted vote
   */
  const castVote = async (proposalId: bigint, choiceId: bigint) => {
    if (!address) throw new Error("Wallet not connected");

    await initializeFHE();

    // Encrypt vote value of 1
    const { encryptedVote, proof } = await encryptVote(
      1n,
      CONTRACTS.ChainVote,
      address
    );

    const hash = await writeContractAsync({
      address: CONTRACTS.ChainVote,
      abi: ABIS.ChainVote,
      functionName: "castVote",
      args: [proposalId, choiceId, encryptedVote, proof],
    });

    return hash;
  };

  /**
   * Request results decryption (only after voting ends)
   */
  const requestResultsDecryption = async (proposalId: bigint) => {
    if (!address) throw new Error("Wallet not connected");

    const hash = await writeContractAsync({
      address: CONTRACTS.ChainVote,
      abi: ABIS.ChainVote,
      functionName: "requestResultsDecryption",
      args: [proposalId],
    });

    return hash;
  };

  // Watch for ProposalCreated events
  useWatchContractEvent({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    eventName: "ProposalCreated",
    onLogs: (logs) => {
      console.log("New proposal created:", logs);
      refetchProposalCount();
    },
  });

  // Watch for VoteCast events
  useWatchContractEvent({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    eventName: "VoteCast",
    onLogs: (logs) => {
      console.log("Vote cast:", logs);
    },
  });

  // Watch for ResultsPublished events
  useWatchContractEvent({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    eventName: "ResultsPublished",
    onLogs: (logs) => {
      console.log("Results published:", logs);
      refetchResults();
    },
  });

  return {
    // State
    proposalCount: proposalCount ? Number(proposalCount) : 0,
    proposalFee,
    proposalResults,
    hasVoted,

    // Actions
    createProposal,
    castVote,
    requestResultsDecryption,
    getProposalInfo,

    // Refetch functions
    refetchProposalCount,
    refetchResults,
    refetchHasVoted,
  };
}

/**
 * Hook to read a specific proposal's info
 */
export function useProposalInfo(proposalId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    functionName: "getProposalInfo",
    args: proposalId !== undefined ? [proposalId] : undefined,
    query: {
      enabled: proposalId !== undefined,
    },
  });

  return {
    proposalInfo: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to read a specific proposal's results
 */
export function useProposalResults(proposalId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    functionName: "getProposalResults",
    args: proposalId !== undefined ? [proposalId] : undefined,
    query: {
      enabled: proposalId !== undefined,
    },
  });

  return {
    results: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if a user has voted on a proposal
 */
export function useHasVoted(proposalId: bigint | undefined, voterAddress: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.ChainVote,
    abi: ABIS.ChainVote,
    functionName: "hasVoted",
    args: proposalId !== undefined && voterAddress ? [proposalId, voterAddress] : undefined,
    query: {
      enabled: proposalId !== undefined && !!voterAddress,
    },
  });

  return {
    hasVoted: data,
    isLoading,
    refetch,
  };
}

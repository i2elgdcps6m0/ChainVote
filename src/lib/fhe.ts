declare global {
  interface Window {
    FHE: any;
  }
}

let fheInstance: any = null;

export const initializeFHE = async () => {
  if (fheInstance) return fheInstance;

  if (!window.FHE) {
    throw new Error(
      "Zama FHE SDK not loaded. Make sure the SDK script is included in index.html"
    );
  }

  fheInstance = window.FHE;
  return fheInstance;
};

export const toHex = (buffer: Uint8Array): `0x${string}` => {
  return `0x${Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
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
  userAddress: string
): Promise<{
  encryptedVote: `0x${string}`;
  proof: `0x${string}`;
}> => {
  const fhe = await initializeFHE();

  const checksumContract = contractAddress.toLowerCase() as `0x${string}`;
  const checksumUser = userAddress.toLowerCase() as `0x${string}`;

  const input = fhe.createEncryptedInput(checksumContract, checksumUser);
  input.add64(voteValue); // euint64 for vote value
  const result = await input.encrypt();

  return {
    encryptedVote: toHex(result.handles[0]),
    proof: toHex(result.inputProof),
  };
};

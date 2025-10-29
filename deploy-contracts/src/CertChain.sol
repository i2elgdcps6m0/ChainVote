// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title CertChain — Public Encrypted Quota Distribution with FHEVM
/// @notice Anyone can create encrypted allocations for any address.
///         Per-user allocations and claims are stored as encrypted values (euint64).
///         Only the recipient can decrypt their own allocation amount.
contract ConfAirdrop is SepoliaConfig {
    // Encrypted per-user allocation and claimed amounts
    mapping(address => euint64) private _allocation;
    mapping(address => euint64) private _claimed;

    event AllocationSet(address indexed creator, address indexed recipient);  // amounts hidden
    event AllocationBatchSet(address indexed creator, uint256 count);         // amounts hidden
    event Claimed(address indexed user);                                       // amount hidden

    error InvalidUser();

    /// @notice Anyone can set (or top-up) a user's encrypted allocation.
    /// @dev `encryptedAmt` is verified/cast by FHE.fromExternal.
    /// @param recipient The address that will receive the encrypted allocation
    /// @param encryptedAmt The encrypted amount (euint64)
    /// @param inputProof The proof for FHE encryption
    function setAllocation(
        address recipient,
        externalEuint64 encryptedAmt,
        bytes calldata inputProof
    ) external {
        if (recipient == address(0)) revert InvalidUser();

        euint64 amt = FHE.fromExternal(encryptedAmt, inputProof);
        _allocation[recipient] = FHE.add(_allocation[recipient], amt);

        FHE.allowThis(_allocation[recipient]);
        FHE.allow(_allocation[recipient], recipient);
        FHE.allow(_allocation[recipient], msg.sender); // Allow creator to view

        emit AllocationSet(msg.sender, recipient);
    }

    /// @notice Anyone can batch set allocations for multiple users.
    /// @dev For simplicity, one encrypted value is applied to all provided users.
    /// @param recipients Array of recipient addresses
    /// @param encryptedAmt The encrypted amount for each recipient (euint64)
    /// @param inputProof The proof for FHE encryption
    function batchSetAllocation(
        address[] calldata recipients,
        externalEuint64 encryptedAmt,
        bytes calldata inputProof
    ) external {
        euint64 amt = FHE.fromExternal(encryptedAmt, inputProof);
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            if (recipient == address(0)) revert InvalidUser();

            _allocation[recipient] = FHE.add(_allocation[recipient], amt);
            FHE.allowThis(_allocation[recipient]);
            FHE.allow(_allocation[recipient], recipient);
            FHE.allow(_allocation[recipient], msg.sender); // Allow creator to view
        }
        emit AllocationBatchSet(msg.sender, recipients.length);
    }

    /// @notice Claim an encrypted amount from caller's allocation. Fails closed if over-claim.
    function claim(
        externalEuint64 encryptedAmt,
        bytes calldata inputProof
    ) external {
        address user = msg.sender;

        // requested amount
        euint64 req = FHE.fromExternal(encryptedAmt, inputProof);

        // remaining = allocation - claimed
        euint64 remaining = FHE.sub(_allocation[user], _claimed[user]);

        // If req <= remaining -> toClaim = req else 0 (fail-closed)
        euint64 toClaim = FHE.select(FHE.le(req, remaining), req, FHE.asEuint64(0));

        // Update claimed
        _claimed[user] = FHE.add(_claimed[user], toClaim);

        // Maintain access policies so user & contract can read their own figures
        FHE.allowThis(_claimed[user]);
        FHE.allow(_claimed[user], user);

        // Also re-allow allocation (not strictly needed every time, but good for UX)
        FHE.allowThis(_allocation[user]);
        FHE.allow(_allocation[user], user);

        emit Claimed(user);
    }

    /// @notice View your encrypted allocation.
    function getMyAllocation() external view returns (euint64) {
        return _allocation[msg.sender];
    }

    /// @notice View your encrypted claimed amount.
    function getMyClaimed() external view returns (euint64) {
        return _claimed[msg.sender];
    }

    /// @notice View your encrypted remaining amount: allocation - claimed.
    function getMyRemaining() external returns (euint64) {
        euint64 remaining = FHE.sub(_allocation[msg.sender], _claimed[msg.sender]);
        FHE.allowThis(remaining);
        FHE.allow(remaining, msg.sender);
        return remaining;
    }
}

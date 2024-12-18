// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

library ShardingTableErrors {
    error NodeAlreadyInTheShardingTable(uint72 identityId);
    error InvalidIndexWithRespectToPreviousNode(
        uint72 identityId,
        uint256 hashRingPosition,
        uint256 prevHashRingPosition
    );
    error InvalidIndexWithRespectToNextNode(uint72 identityId, uint256 hashRingPosition, uint256 nextHashRingPosition);
    error ShardingTableIsFull();
}

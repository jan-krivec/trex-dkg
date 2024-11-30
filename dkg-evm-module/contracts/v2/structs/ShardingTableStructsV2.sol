// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

library ShardingTableStructsV2 {
    struct Node {
        uint256 hashRingPosition;
        bytes nodeId;
        uint72 index;
        uint72 identityId;
    }
}

// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface IScoreFunction {
    function calculateScore(uint256 distance, uint96 stake) external view returns (uint40);

    function calculateDistance(
        uint8 hashFunctionId,
        bytes calldata nodeId,
        bytes calldata keyword
    ) external view returns (uint256);
}

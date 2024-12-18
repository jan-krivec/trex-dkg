// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {HubDependent} from "../abstract/HubDependent.sol";
import {Named} from "../interface/Named.sol";
import {Versioned} from "../interface/Versioned.sol";

abstract contract AbstractAsset is Named, Versioned, HubDependent {
    // solhint-disable-next-line no-empty-blocks
    constructor(address hubAddress) HubDependent(hubAddress) {}

    function getAssertionIds(uint256 tokenId) public view virtual returns (bytes32[] memory);

    function getLatestAssertionId(uint256 tokenId) external view returns (bytes32) {
        bytes32[] memory assertions = getAssertionIds(tokenId);
        return assertions[assertions.length - 1];
    }

    function getAssertionIdByIndex(uint256 tokenId, uint256 index) external view returns (bytes32) {
        bytes32[] memory assertions = getAssertionIds(tokenId);
        return assertions[index];
    }

    function getAssertionIdsLength(uint256 tokenId) external view returns (uint256) {
        return getAssertionIds(tokenId).length;
    }
}

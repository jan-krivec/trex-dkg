// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {AbstractAsset} from "../../abstract/AbstractAsset.sol";
import {Named} from "../../interface/Named.sol";
import {ContentAssetStructs} from "../../structs/assets/ContentAssetStructs.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ContentAssetErrors} from "../../errors/assets/ContentAssetErrors.sol";

contract ContentAssetStorage is AbstractAsset, ERC721 {
    string private constant _NAME = "ContentAssetStorage";
    string private constant _VERSION = "1.0.0";

    uint256 private _tokenId = 1;

    // tokenId => Asset
    mapping(uint256 => ContentAssetStructs.Asset) internal assets;

    // keccak256(tokenId + assertionId + assertionIdIndex) => issuer
    mapping(bytes32 => address) public issuers;

    // solhint-disable-next-line no-empty-blocks
    constructor(address hubAddress) AbstractAsset(hubAddress) ERC721("KnowledgeAssetCollection", "DKG") {}

    function name() public view virtual override(Named, ERC721) returns (string memory) {
        return ERC721.name();
    }

    function version() external pure virtual override returns (string memory) {
        return _VERSION;
    }

    function mint(address to, uint256 tokenId) external onlyContracts {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) external onlyContracts {
        _burn(tokenId);
    }

    function lastTokenId() public view virtual returns (uint256) {
        if (_tokenId == 1) {
            revert ContentAssetErrors.NoMintedAssets();
        }

        unchecked {
            return _tokenId - 1;
        }
    }

    function generateTokenId() external virtual onlyContracts returns (uint256) {
        unchecked {
            return _tokenId++;
        }
    }

    function deleteAsset(uint256 tokenId) external onlyContracts {
        bytes32[] memory assertionIds = assets[tokenId].assertionIds;
        uint256 assertionIdsLength = assertionIds.length;

        for (uint256 i; i < assertionIdsLength; ) {
            delete issuers[_generateAssetAssertionId(tokenId, assertionIds[i], i)];
            unchecked {
                i++;
            }
        }

        delete assets[tokenId];
    }

    function getAsset(uint256 tokenId) external view returns (ContentAssetStructs.Asset memory) {
        return assets[tokenId];
    }

    function setMutability(uint256 tokenId, bool immutable_) external onlyContracts {
        assets[tokenId].immutable_ = immutable_;
    }

    function isMutable(uint256 tokenId) external view returns (bool) {
        return !assets[tokenId].immutable_;
    }

    function pushAssertionId(uint256 tokenId, bytes32 assertionId) external onlyContracts {
        assets[tokenId].assertionIds.push(assertionId);
    }

    function getAssertionIds(uint256 tokenId) public view override returns (bytes32[] memory) {
        return assets[tokenId].assertionIds;
    }

    function setAssertionIssuer(uint256 tokenId, bytes32 assertionId, address issuer) external onlyContracts {
        issuers[_generateAssetAssertionId(tokenId, assertionId, this.getAssertionIdsLength(tokenId))] = issuer;
    }

    function deleteAssertionIssuer(uint256 tokenId, bytes32 assertionId, uint256 index) external onlyContracts {
        delete issuers[_generateAssetAssertionId(tokenId, assertionId, index)];
    }

    function getAssertionIssuer(
        uint256 tokenId,
        bytes32 assertionId,
        uint256 assertionIndex
    ) external view returns (address) {
        return issuers[keccak256(abi.encodePacked(tokenId, assertionId, assertionIndex))];
    }

    function assertionExists(bytes32 assetAssertionId) external view returns (bool) {
        return issuers[assetAssertionId] != address(0);
    }

    function _generateAssetAssertionId(
        uint256 tokenId,
        bytes32 assertionId,
        uint256 index
    ) internal pure virtual returns (bytes32) {
        return keccak256(abi.encodePacked(tokenId, assertionId, index));
    }
}

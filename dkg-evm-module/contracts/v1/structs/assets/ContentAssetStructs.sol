// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

library ContentAssetStructs {
    struct AssetInputArgs {
        string[] contexts;
        string[][] types;
        bytes32 assertionId;
        uint128 size;
        uint32 triplesNumber;
        uint96 chunksNumber;
        uint16 epochsNumber;
        uint96 tokenAmount;
        uint8 scoreFunctionId;
        bool immutable_;
    }

    struct Asset {
        bool immutable_;
        bytes32[] assertionIds;
    }
}

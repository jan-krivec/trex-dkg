// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {Named} from "./interface/Named.sol";
import {Versioned} from "./interface/Versioned.sol";
import {UnorderedNamedContractDynamicSetLib} from "./utils/UnorderedNamedContractDynamicSet.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "../TREX/factory/ITREXFactory.sol";
import "./roles/AgentRole.sol";

contract Hub is Named, Versioned, AgentRole {
    using UnorderedNamedContractDynamicSetLib for UnorderedNamedContractDynamicSetLib.Set;

    event NewContract(string contractName, address newContractAddress);
    event ContractChanged(string contractName, address newContractAddress);
    event NewAssetStorage(string contractName, address newContractAddress);
    event AssetStorageChanged(string contractName, address newContractAddress);

    event ContextEvent(string contextName, string types);

    string private constant _NAME = "Hub";
    string private constant _VERSION = "1.0.0";

    UnorderedNamedContractDynamicSetLib.Set internal contractSet;
    UnorderedNamedContractDynamicSetLib.Set internal assetStorageSet;

    ITREXFactory internal trexFactory;

    constructor (address[] memory agents) {
        for (uint256 i = 0; i < agents.length; i++) {
            addAgent(agents[i]);
        }
    }

    function name() external pure virtual override returns (string memory) {
        return _NAME;
    }

    function version() external pure virtual override returns (string memory) {
        return _VERSION;
    }

    function setTrexFactory(address trexFactoryAddress) external onlyOwner {
        trexFactory = ITREXFactory(trexFactoryAddress);
    }

    function setContractAddress(string calldata contractName, address newContractAddress) external onlyOwner {
        if (contractSet.exists(contractName)) {
            emit ContractChanged(contractName, newContractAddress);
            contractSet.update(contractName, newContractAddress);
        } else {
            emit NewContract(contractName, newContractAddress);
            contractSet.append(contractName, newContractAddress);
        }
    }

    function setAssetStorageAddress(string calldata assetStorageName, address assetStorageAddress) external onlyOwner {
        if (assetStorageSet.exists(assetStorageName)) {
            emit AssetStorageChanged(assetStorageName, assetStorageAddress);
            assetStorageSet.update(assetStorageName, assetStorageAddress);
        } else {
            emit NewAssetStorage(assetStorageName, assetStorageAddress);
            assetStorageSet.append(assetStorageName, assetStorageAddress);
        }
    }

    function getContractAddress(string calldata contractName) external view returns (address) {
        return contractSet.get(contractName).addr;
    }

    function getAssetStorageAddress(string calldata assetStorageName) external view returns (address) {
        return assetStorageSet.get(assetStorageName).addr;
    }

    function getAllContracts() external view returns (UnorderedNamedContractDynamicSetLib.Contract[] memory) {
        return contractSet.getAll();
    }

    function getAllAssetStorages() external view returns (UnorderedNamedContractDynamicSetLib.Contract[] memory) {
        return assetStorageSet.getAll();
    }

    function isContract(string calldata contractName) external view returns (bool) {
        return contractSet.exists(contractName);
    }

    function isContract(address selectedContractAddress) external view returns (bool) {
        return contractSet.exists(selectedContractAddress);
    }

    function isAssetStorage(string calldata assetStorageName) external view returns (bool) {
        return assetStorageSet.exists(assetStorageName);
    }

    function isAssetStorage(address assetStorageAddress) external view returns (bool) {
        return assetStorageSet.exists(assetStorageAddress);
    }

    function checkContextVerified(string[] memory _contexts, string[][] memory _types, address user) external virtual{
        for (uint256 i = 0; i < _contexts.length; i++) {
            string memory joinedTypes = joinStrings(_types[i], ",");
            emit ContextEvent(_contexts[i], joinedTypes);
            require(trexFactory.isContextVerified(_contexts[i], _types[i], user), string(abi.encodePacked("Context is not verified: ", _contexts[i])));
        }
    }

    function joinStrings(string[] memory strings, string memory delimiter) internal pure returns (string memory) {
        bytes memory result;
        for (uint i = 0; i < strings.length; i++) {
            result = abi.encodePacked(result, strings[i]);
            if (i < strings.length - 1) {
                result = abi.encodePacked(result, delimiter);
            }
        }
        return string(result);
    }
}

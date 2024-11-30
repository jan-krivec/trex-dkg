// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {HubV2} from "../Hub.sol";
import {AgentRole} from "../../v1/roles/AgentRole.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract HubDependentInitializableV2 is OwnableUpgradeable {
    HubV2 public hub;

    function __setHub(address hubAddress) internal onlyInitializing {
        require(hubAddress != address(0), "Hub Address cannot be 0x0");

        hub = HubV2(hubAddress);
        __Ownable_init();
    }

    modifier onlyHubOwner() {
        _checkHubOwner();
        _;
    }

    modifier onlyContracts() {
        _checkHub();
        _;
    }

    modifier onlyHubAgent(address _addr) {
        checkOnlyAgent(_addr);
        _;
    }

    function _checkHubOwner() internal view virtual {
        require(msg.sender == hub.owner(), "Fn can only be used by hub owner");
    }

    function _checkHub() internal view virtual {
        require(hub.isContract(msg.sender), "Fn can only be called by the hub");
    }

    function checkOnlyAgent(address _addr) public view virtual {
        require(AgentRole(address(hub)).isAgent(_addr), "Caller must be agent");
    }

    function isHubAgent(address _addr) public view returns (bool) {
        return AgentRole(address(hub)).isAgent(_addr);
    }
}

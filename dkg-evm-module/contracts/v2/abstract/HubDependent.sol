// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import {HubV2} from "../Hub.sol";
import {AgentRole} from "../../v1/roles/AgentRole.sol";

abstract contract HubDependentV2 {
    HubV2 public hub;

    constructor(address hubAddress) {
        require(hubAddress != address(0), "Hub Address cannot be 0x0");

        hub = HubV2(hubAddress);
    }

    modifier onlyHubOwner() {
        _checkHubOwner();
        _;
    }

    modifier onlyContracts() {
        _checkHub();
        _;
    }

    modifier onlyAgent() {
        _checkOnlyAgent();
        _;
    }

    function _checkHubOwner() internal view virtual {
        require(msg.sender == hub.owner(), "Fn can only be used by hub owner");
    }

    function _checkHub() internal view virtual {
        require(hub.isContract(msg.sender), "Fn can only be called by the hub");
    }

    function _checkOnlyAgent() public view virtual {
        require(AgentRole(hub).isAgent(msg.sender), "Caller must be agent");
    }
}

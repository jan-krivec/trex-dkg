// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface ICustodian {
    function getOwners() external view returns (address[] memory);
}

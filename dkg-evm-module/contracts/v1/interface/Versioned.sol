// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface Versioned {
    function version() external view returns (string memory);
}

// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface IHashFunction {
    function hash(bytes calldata data) external pure returns (bytes32);
}

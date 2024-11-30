// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

library TokenErrors {
    error TooLowAllowance(address tokenAddress, uint256 amount);
    error TooLowBalance(address tokenAddress, uint256 amount);
}

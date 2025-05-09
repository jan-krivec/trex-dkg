// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

library ProfileErrors {
    error IdentityAlreadyExists(uint72 identityId, address wallet);
    error TooManyOperationalWallets(uint16 allowed, uint16 provided);
    error EmptyNodeId();
    error NodeIdAlreadyExists(bytes nodeId);
    error EmptySharesTokenName();
    error EmptySharesTokenSymbol();
    error SharesTokenNameAlreadyExists(string tokenName);
    error SharesTokenSymbolAlreadyExists(string tokenSymbol);
    error OperatorFeeOutOfRange(uint8 operatorFee);
    error ZeroAsk();
    error NoOperatorFees(uint72 identityId);
    error ProfileDoesntExist(uint72 identityId);
}

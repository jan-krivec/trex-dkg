// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

library UnorderedNamedContractDynamicSetStructs {
    struct Contract {
        string name;
        address addr;
    }

    struct Set {
        mapping(string => uint256) stringIndexPointers;
        mapping(address => uint256) addressIndexPointers;
        Contract[] contractList;
    }
}

// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

library GeneralStructs {
    struct Contract {
        string name;
        address addr;
    }

    struct ForwardCallInputArgs {
        string contractName;
        bytes[] encodedData;
    }
}

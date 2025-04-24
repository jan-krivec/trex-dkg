// SPDX-License-Identifier: GPL-3.0
//
//                                             :+#####%%%%%%%%%%%%%%+
//                                         .-*@@@%+.:+%@@@@@%%#***%@@%=
//                                     :=*%@@@#=.      :#@@%       *@@@%=
//                       .-+*%@%*-.:+%@@@@@@+.     -*+:  .=#.       :%@@@%-
//                   :=*@@@@%%@@@@@@@@@%@@@-   .=#@@@%@%=             =@@@@#.
//             -=+#%@@%#*=:.  :%@@@@%.   -*@@#*@@@@@@@#=:-              *@@@@+
//            =@@%=:.     :=:   *@@@@@%#-   =%*%@@@@#+-.        =+       :%@@@%-
//           -@@%.     .+@@@     =+=-.         @@#-           +@@@%-       =@@@@%:
//          :@@@.    .+@@#%:                   :    .=*=-::.-%@@@+*@@=       +@@@@#.
//          %@@:    +@%%*                         =%@@@@@@@@@@@#.  .*@%-       +@@@@*.
//         #@@=                                .+@@@@%:=*@@@@@-      :%@%:      .*@@@@+
//        *@@*                                +@@@#-@@%-:%@@*          +@@#.      :%@@@@-
//       -@@%           .:-=++*##%%%@@@@@@@@@@@@*. :@+.@@@%:            .#@@+       =@@@@#:
//      .@@@*-+*#%%%@@@@@@@@@@@@@@@@%%#**@@%@@@.   *@=*@@#                :#@%=      .#@@@@#-
//      -%@@@@@@@@@@@@@@@*+==-:-@@@=    *@# .#@*-=*@@@@%=                 -%@@@*       =@@@@@%-
//         -+%@@@#.   %@%%=   -@@:+@: -@@*    *@@*-::                   -%@@%=.         .*@@@@@#
//            *@@@*  +@* *@@##@@-  #@*@@+    -@@=          .         :+@@@#:           .-+@@@%+-
//             +@@@%*@@:..=@@@@*   .@@@*   .#@#.       .=+-       .=%@@@*.         :+#@@@@*=:
//              =@@@@%@@@@@@@@@@@@@@@@@@@@@@%-      :+#*.       :*@@@%=.       .=#@@@@%+:
//               .%@@=                 .....    .=#@@+.       .#@@@*:       -*%@@@@%+.
//                 +@@#+===---:::...         .=%@@*-         +@@@+.      -*@@@@@%+.
//                  -@@@@@@@@@@@@@@@@@@@@@@%@@@@=          -@@@+      -#@@@@@#=.
//                    ..:::---===+++***###%%%@@@#-       .#@@+     -*@@@@@#=.
//                                           @@@@@@+.   +@@*.   .+@@@@@%=.
//                                          -@@@@@=   =@@%:   -#@@@@%+.
//                                          +@@@@@. =@@@=  .+@@@@@*:
//                                          #@@@@#:%@@#. :*@@@@#-
//                                          @@@@@%@@@= :#@@@@+.
//                                         :@@@@@@@#.:#@@@%-
//                                         +@@@@@@-.*@@@*:
//                                         #@@@@#.=@@@+.
//                                         @@@@+-%@%=
//                                        :@@@#%@%=
//                                        +@@@@%-
//                                        :#%%=
//
/**
 *     NOTICE
 *
 *     The T-REX software is licensed under a proprietary license or the GPL v.3.
 *     If you choose to receive it under the GPL v.3 license, the following applies:
 *     T-REX is a suite of smart contracts implementing the ERC-3643 standard and
 *     developed by Tokeny to manage and transfer financial assets on EVM blockchains
 *
 *     Copyright (C) 2023, Tokeny sàrl.
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
pragma solidity 0.8.17;

interface ITREXFactory {

    /// Types

    struct ContextDetails {
        // if an address is provided, please ensure that the factory is set as owner of the contract
        address[] complianceModules;
        // settings calls for compliance modules
        bytes[] complianceSettings;
    }

    struct ClaimDetails {
        // claim topics required
        uint256[] claimTopics;
        // trusted issuers addresses
        address[] issuers;
        // claims that issuers are allowed to emit, by index, index corresponds to the `issuers` indexes
        uint256[][] issuerClaims;
    }

    /// events

    /// event emitted whenever a single contract is deployed by the factory
    event Deployed(address indexed _addr);

    /// event emitted when the Identity Factory is set
    event IdFactorySet(address _idFactory);

    /// event emitted when the implementation authority of the factory contract is set
    event ImplementationAuthoritySet(address _implementationAuthority);

    /// event emitted by the factory when a full suite of T-REX contracts is deployed
    event TREXSuiteDeployed(address indexed _context, address _mc, string indexed _salt);

    event AgentsSet(address[] _agents);

    /**
     *  @dev setter for implementation authority contract address
     *  the implementation authority contract contains the addresses of all implementation contracts
     *  the proxies created by the factory will use the different implementations available
     *  in the implementation authority contract
     *  Only owner can call.
     *  emits `ImplementationAuthoritySet` event
     *  @param _implementationAuthority The address of the implementation authority smart contract
     */
    function setImplementationAuthority(address _implementationAuthority) external;

    /**
     *  @dev setter for identity factory contract address
     *  the identity factory contract is used by the TREX Factory to deploy the ONCHAINID
     *  of the token in case the ONCHAINID is not specified
     *  Only owner can call.
     *  emits `IdFactorySet` event
     *  @param _idFactory The address of the identity factory contract
     */
    function setIdFactory(address _idFactory) external;

    /**
     *  @dev function used to deploy a new TREX token and set all the parameters as required by the issuer paperwork
     *  this function will deploy and set the contracts as follow :
     *  Token : deploy the token contract (proxy) and set the name, symbol, ONCHAINID, decimals, owner, agents,
     *  IR address , Compliance address
     *  Identity Registry : deploy the IR contract (proxy) and set the owner, agents,
     *  IRS address, TIR address, CTR address
     *  IRS : deploy IRS contract (proxy) if required (address set as 0 in the TokenDetails, bind IRS to IR, set owner
     *  CTR : deploy CTR contract (proxy), set required claims, set owner
     *  TIR : deploy TIR contract (proxy), set trusted issuers, set owner
     *  Compliance: deploy modular compliance, bind with token, add modules, set modules parameters, set owner
     *  All contracts are deployed using CREATE2 opcode, and therefore are deployed at a predetermined address
     *  The address can be the same on all EVM blockchains as long as the factory address is the same as well
     *  Only owner can call.
     *  emits `TREXSuiteDeployed` event
     *  @param _context the salt used to make the contracts deployments with CREATE2
     *  cannot add more than 5 agents on IR and 5 agents on Token
     *  cannot add more than 5 claim topics required and more than 5 trusted issuers
     *  cannot add more than 30 compliance settings transactions
     */
    function deployContext(
        string memory _context,
        ContextDetails calldata _contextDetails,
        ClaimDetails calldata _claimData) external;

    function addContextType(string memory context, string memory typeName, address[] memory issuers, uint256[] memory claimTopics, uint256[][] memory issuerClaims) external;

    /**
     *  @dev getter for implementation authority address
     */
    function getImplementationAuthority() external view returns(address);

    /**
     *  @dev getter for identity factory address
     */
    function getIdFactory() external view returns(address);

    /**
     *  @dev getter for token address corresponding to salt string
     *  @param _salt The salt string that was used to deploy the token
     */
    function getContext(string calldata _salt) external view returns(address);

    function isContextVerified(string memory _context, string[] memory types, address user) external view returns (bool);

    function getContextList() external view returns (string[] memory);

    function registerIdentity(address _userAddress) external;

    function deleteIdentity(address _userAddress) external;
}

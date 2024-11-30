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
 *     developed by Contexty to manage and transfer financial assets on EVM blockchains
 *
 *     Copyright (C) 2023, Contexty sàrl.
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

import "./IContext.sol";
import "@onchain-id/solidity/contracts/interface/IIdentity.sol";
import "../../v1/roles/AgentRoleUpgradeable.sol";

contract Context is IContext, AgentRoleUpgradeable {

    string _contextName;
    IModularCompliance internal _contextCompliance;
    IIdentityRegistry internal _contextIdentityRegistry;

    /**
     *  @dev the constructor initiates the context contract
     *  msg.sender is set automatically as the owner of the smart contract
     *  @param _identityRegistry the address of the Identity registry linked to the context
     *  @param _compliance the address of the compliance contract linked to the context
     *  emits an `UpdatedContextInformation` event
     *  emits an `IdentityRegistryAdded` event
     *  emits a `ComplianceAdded` event
     */
    function init(
        address _identityRegistry,
        address _compliance,
        string memory _context
    ) external initializer {
        // that require is protecting legacy versions of ContextProxy contracts
        // as there was a bug with the initializer modifier on these proxies
        // that check is preventing attackers to call the init functions on those
        // legacy contracts.
        require(owner() == address(0), "already initialized");
        require(
            _identityRegistry != address(0)
            && _compliance != address(0)
        , "invalid argument - zero address");
        require(
            keccak256(abi.encode(_context)) != keccak256(abi.encode(""))
        , "invalid argument - empty string");
        __Ownable_init();
        _contextName = _context;
        setIdentityRegistry(_identityRegistry);
        setCompliance(_compliance);
    }

    /**
     *  @dev See {IContext-identityRegistry}.
     */
    function identityRegistry() external view override returns (IIdentityRegistry) {
        return _contextIdentityRegistry;
    }

    /**
     *  @dev See {IContext-compliance}.
     */
    function compliance() external view override returns (IModularCompliance) {
        return _contextCompliance;
    }

    /**
     *  @dev See {IContext-name}.
     */
    function context() external view override returns (string memory) {
        return _contextName;
    }

    function adresses() external view returns (address identityRegistry,
                                               address modularCompliance,
                                               address trustedIssuersRegistry,
                                               address claimTopicsRegistry) {
        address ir = address(_contextIdentityRegistry);
        address mc = address(_contextCompliance);
        address tir = address(_contextIdentityRegistry.issuersRegistry());
        address ctr = address(_contextIdentityRegistry.topicsRegistry());

        return (ir, mc, tir, ctr);
    }
    /**
     *  @dev See {IContext-setIdentityRegistry}.
     */
    function setIdentityRegistry(address _identityRegistry) public override onlyOwner {
        _contextIdentityRegistry = IIdentityRegistry(_identityRegistry);
        emit IdentityRegistryAdded(_identityRegistry);
    }

    /**
     *  @dev See {IContext-setCompliance}.
     */
    function setCompliance(address _compliance) public override onlyOwner {
        if (address(_contextCompliance) != address(0)) {
            _contextCompliance.unbindContext(address(this));
        }
        _contextCompliance = IModularCompliance(_compliance);
        _contextCompliance.bindContext(address(this));
        emit ComplianceAdded(_compliance);
    }

    function isVerified(address user) external view override returns (bool){
        return _contextIdentityRegistry.isVerified(user);
    }

    function isVerifiedTransfer(address from, address to) external view override returns (bool){
        return _contextIdentityRegistry.isVerified(to) && _contextCompliance.canTransfer(from, to);
    }
}

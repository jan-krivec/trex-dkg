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

import "../../v1/roles/AgentRole.sol";
import "../context/IContext.sol";
import "../registry/interface/IClaimTopicsRegistry.sol";
import "../registry/interface/IIdentityRegistry.sol";
import "../compliance/modular/IModularCompliance.sol";
import "../registry/interface/ITrustedIssuersRegistry.sol";
import "../registry/interface/IIdentityRegistryStorage.sol";
import "../proxy/authority/ITREXImplementationAuthority.sol";
import "../proxy/ClaimTopicsRegistryProxy.sol";
import "../proxy/IdentityRegistryProxy.sol";
import "../proxy/IdentityRegistryStorageProxy.sol";
import "../proxy/TrustedIssuersRegistryProxy.sol";
import "../proxy/ModularComplianceProxy.sol";
import "./ITREXFactory.sol";
import "../../ONCHAINID/factory/IIdFactory.sol";
import "../proxy/ContextProxy.sol";
import "../context/IContext.sol";
import "../../v1/abstract/HubDependent.sol";


contract TREXFactory is ITREXFactory, HubDependent {

    /// the address of the implementation authority contract used in the tokens deployed by the factory
    address private _implementationAuthority;

    IIdentityRegistryStorage internal factoryIdentityRegistryStorage;

    /// the address of the Identity Factory used to deploy token OIDs
    address private _idFactory;

    /// contexts
    mapping(string => address) public contextDeployed;
    string[] public contextKeys;
    mapping(string => uint256) private keyIndex;

    // Removes an existing context
    function removeContext(string memory key) public {
        require(contextDeployed[key] != address(0), "Key does not exist");

        // Delete from mapping
        delete contextDeployed[key];

        // Get index of the key to remove
        uint256 index = keyIndex[key];
        uint256 lastIndex = contextKeys.length - 1;

        // If it's not the last element, swap with the last element
        if (index != lastIndex) {
            string memory lastKey = contextKeys[lastIndex];
            contextKeys[index] = lastKey;
            keyIndex[lastKey] = index;
        }

        // Remove last element from array and delete index
        contextKeys.pop();
        delete keyIndex[key];
    }

    // Returns the list of context keys
    function getContextKeys() public view returns (string[] memory) {
        return contextKeys;
    }

    // solhint-disable-next-line code-complexity, function-max-lines
    constructor(address hubAddress, address implementationAuthority_, address idFactory_) HubDependent (hubAddress) {
        require(implementationAuthority_ != address(0), "invalid argument - zero address");
        // should not be possible to set an implementation authority that is not complete
        require(
            (ITREXImplementationAuthority(implementationAuthority_)).getContextImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getCTRImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getIRImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getIRSImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getMCImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getTIRImplementation() != address(0),
            "invalid Implementation Authority");
        _implementationAuthority = implementationAuthority_;
        emit ImplementationAuthoritySet(implementationAuthority_);
        require(idFactory_ != address(0), "invalid argument - zero address");
        _idFactory = idFactory_;
        emit IdFactorySet(idFactory_);
        factoryIdentityRegistryStorage = IIdentityRegistryStorage(_deployIRS('factoryIdentityRegistryStorage', _implementationAuthority));
    }

    /**
     *  @dev See {ITREXFactory-deployTREXSuite}.
     */
    // solhint-disable-next-line code-complexity, function-max-lines
    function deployContext(string memory _context, ContextDetails calldata _contextDetails, ClaimDetails calldata _claimData)
    external override onlyAgent {
        require(contextDeployed[_context] == address(0)
        , "context already deployed");
        require((_contextDetails.complianceModules).length <= 30
        , "max 30 module actions at deployment");
        require((_contextDetails.complianceModules).length >= (_contextDetails.complianceSettings).length
        , "invalid compliance pattern");

        ITrustedIssuersRegistry tir = ITrustedIssuersRegistry(_deployTIR(_context, _implementationAuthority));
        IClaimTopicsRegistry ctr = IClaimTopicsRegistry(_deployCTR(_context, _implementationAuthority));
        IModularCompliance mc = IModularCompliance(_deployMC(_context, _implementationAuthority));
        IIdentityRegistryStorage irs = factoryIdentityRegistryStorage;
        IIdentityRegistry ir = IIdentityRegistry(_deployIR(_context, _implementationAuthority, address(tir),
            address(ctr), address(irs)));

        IContext context = IContext(_deployContext
            (
                _context,
                _implementationAuthority,
                address(ir),
                address(mc)
            ));

        keyIndex[_context] = contextKeys.length;
        contextKeys.push(_context);

        for (uint256 i = 0; i < (_claimData.claimTopics).length; i++) {
            ctr.addClaimTopic(msg.sender, _claimData.claimTopics[i]);
        }
        for (uint256 i = 0; i < (_claimData.issuers).length; i++) {
            tir.addTrustedIssuer(msg.sender, (_claimData).issuers[i], _claimData.issuerClaims[i]);
        }
        irs.bindIdentityRegistry(address(ir));
        for (uint256 i = 0; i < (_contextDetails.complianceModules).length; i++) {
            if (!mc.isModuleBound(_contextDetails.complianceModules[i])) {
                mc.addModule(msg.sender, _contextDetails.complianceModules[i]);
            }
            if (i < (_contextDetails.complianceSettings).length) {
                mc.callModuleFunction(msg.sender, _contextDetails.complianceSettings[i], _contextDetails.complianceModules[i]);
            }
        }
        contextDeployed[_context] = address(context);
        emit TREXSuiteDeployed(address(context), address(mc), _context);
    }

    function addContextType(string memory _context, string memory typeName, address[] memory issuers, uint256[] memory claimTopics, uint256[][] memory issuerClaims) external override onlyAgent {
        address contextAdr = contextDeployed[_context];
        IContext context = IContext(contextAdr);
        (address modularCompliance, address identityRegistry, address trustedIssuersRegistry, address claimTopicsRegistry) = context.adresses();
        ITrustedIssuersRegistry tir = ITrustedIssuersRegistry(trustedIssuersRegistry);
        IClaimTopicsRegistry ctr = IClaimTopicsRegistry(claimTopicsRegistry);

        for (uint256 i = 0; i < claimTopics.length; i++) {
            ctr.addTypeClaimTopic(msg.sender, typeName, claimTopics[i]);
        }

        for (uint256 i = 0; i < issuers.length; i++) {
            if (tir.isTrustedIssuer(issuers[i])) {
                uint256[] memory trustedIssuerClaimTopics = tir.getTrustedIssuerClaimTopics(issuers[i]);
                tir.updateIssuerClaimTopics(msg.sender,issuers[i], merge(trustedIssuerClaimTopics, issuerClaims[i]));
            } else {
                tir.addTrustedIssuer(msg.sender, issuers[i], issuerClaims[i]);
            }

        }
    }

    /**
     *  @dev See {ITREXFactory-getIdFactory}.
     */
    function getIdFactory() external override view returns(address) {
        return _idFactory;
    }

    /**
     *  @dev See {ITREXFactory-getToken}.
     */
    function getContext(string calldata _context) external override view returns(address) {
        return contextDeployed[_context];
    }

    function getContextInternal(string memory _context) private view returns(address) {
        return contextDeployed[_context];
    }

    /**
     *  @dev See {ITREXFactory-getImplementationAuthority}.
     */
    function getImplementationAuthority() external override view returns(address) {
        return _implementationAuthority;
    }

    /**
     *  @dev See {ITREXFactory-setImplementationAuthority}.
     */
    function setImplementationAuthority(address implementationAuthority_) public override onlyHubOwner {
        require(implementationAuthority_ != address(0), "invalid argument - zero address");
        // should not be possible to set an implementation authority that is not complete
        require(
            (ITREXImplementationAuthority(implementationAuthority_)).getContextImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getCTRImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getIRImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getIRSImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getMCImplementation() != address(0)
            && (ITREXImplementationAuthority(implementationAuthority_)).getTIRImplementation() != address(0),
            "invalid Implementation Authority");
        _implementationAuthority = implementationAuthority_;
        emit ImplementationAuthoritySet(implementationAuthority_);
    }

    /**
     *  @dev See {ITREXFactory-setIdFactory}.
     */
    function setIdFactory(address idFactory_) public override onlyHubOwner {
        require(idFactory_ != address(0), "invalid argument - zero address");
        _idFactory = idFactory_;
        emit IdFactorySet(idFactory_);
    }

    /// deploy function with create2 opcode call
    /// returns the address of the contract created
    function _deploy(string memory salt, bytes memory bytecode) private returns (address) {
        bytes32 saltBytes = bytes32(keccak256(abi.encodePacked(salt)));
        address addr;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let encoded_data := add(0x20, bytecode) // load initialization code.
            let encoded_size := mload(bytecode)     // load init code's length.
            addr := create2(0, encoded_data, encoded_size, saltBytes)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        emit Deployed(addr);
        return addr;
    }

    /// function used to deploy a trusted issuers registry using CREATE2
    function _deployTIR
    (
        string memory _context,
        address implementationAuthority_
    ) private returns (address){
        bytes memory _code = type(TrustedIssuersRegistryProxy).creationCode;
        bytes memory _constructData = abi.encode(address(hub), implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_context, bytecode);
    }

    /// function used to deploy a claim topics registry using CREATE2
    function  _deployCTR
    (
        string memory _context,
        address implementationAuthority_
    ) private returns (address) {
        bytes memory _code = type(ClaimTopicsRegistryProxy).creationCode;
        bytes memory _constructData = abi.encode(address(hub), implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_context, bytecode);
    }

    /// function used to deploy modular compliance contract using CREATE2
    function  _deployMC
    (
        string memory _context,
        address implementationAuthority_
    ) private returns (address) {
        bytes memory _code = type(ModularComplianceProxy).creationCode;
        bytes memory _constructData = abi.encode(address(hub), implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_context, bytecode);
    }

    /// function used to deploy an identity registry storage using CREATE2
    function _deployIRS
    (
        string memory _context,
        address implementationAuthority_
    ) private returns (address) {
        bytes memory _code = type(IdentityRegistryStorageProxy).creationCode;
        bytes memory _constructData = abi.encode(address(hub), implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_context, bytecode);
    }

    /// function used to deploy an identity registry using CREATE2
    function _deployIR
    (
        string memory _context,
        address implementationAuthority_,
        address _trustedIssuersRegistry,
        address _claimTopicsRegistry,
        address _identityStorage
    ) private returns (address) {
        bytes memory _code = type(IdentityRegistryProxy).creationCode;
        require(implementationAuthority_ != address(0) &&
                _trustedIssuersRegistry != address(0) &&
                _claimTopicsRegistry != address(0) &&
                _claimTopicsRegistry != address(0) &&
                _identityStorage != address(0), "Null address!");
        bytes memory _constructData = abi.encode
        (
            address(hub),
            implementationAuthority_,
            _trustedIssuersRegistry,
            _claimTopicsRegistry,
            _identityStorage
        );
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_context, bytecode);
    }

    /// function used to deploy a token using CREATE2
    function _deployContext
    (
        string memory _context,
        address implementationAuthority_,
        address _identityRegistry,
        address _compliance
    ) private returns (address) {
        bytes memory _code = type(ContextProxy).creationCode;
        bytes memory _constructData = abi.encode
        (
            implementationAuthority_,
            _identityRegistry,
            _compliance,
            _context
        );
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_context, bytecode);
    }

    // Returns the list of context keys
    function getContextList() override external view returns (string[] memory) {
        return contextKeys;
    }

    function registerIdentity(
        address _userAddress
    ) external override onlyAgent {
        IIdFactory idFactory = IIdFactory(_idFactory);
        address _identityAddress = idFactory.getIdentity(_userAddress);
        IIdentity _identity = IIdentity(_identityAddress);
        factoryIdentityRegistryStorage.addIdentityToStorage(msg.sender, _userAddress, _identity);
    }

    function deleteIdentity(address _userAddress) external override onlyAgent {
        factoryIdentityRegistryStorage.removeIdentityFromStorage(_userAddress);
    }

    function isContextVerified(string memory _context, string[] memory types, address user) external view override returns (bool) {
        address contextAddress = contextDeployed[_context];
        if (contextAddress != address(0)) {
            IContext context = IContext(contextAddress);
            return context.isVerified(types, user);
        }
        return true;
    }

    function merge(uint[] memory a, uint[] memory b) private pure returns (uint256[] memory) {
        uint[] memory result = new uint[](a.length + b.length);

        for (uint i = 0; i < a.length; i++) {
            result[i] = a[i];
        }

        for (uint j = 0; j < b.length; j++) {
            result[a.length + j] = b[j];
        }

        return result;
    }
}

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

import "../storage/CTRStorage.sol";
import "../interface/IClaimTopicsRegistry.sol";
import "../../../v1/abstract/HubDependentInitializable.sol";


contract ClaimTopicsRegistry is IClaimTopicsRegistry, HubDependentInitializable, CTRStorage {
    // Type-specific claim topics
    mapping(string => uint256[]) private _typeClaimTopics;
    string[] _types;
    mapping(string => mapping(uint256 => bool)) private _typeClaimTopicExists;

    function init(address hubAddress) external initializer {
        __setHub(hubAddress);
    }

    /**
     *  @dev See {IClaimTopicsRegistry-addClaimTopic}.
     */
    function addClaimTopic(uint256 _claimTopic) external override {
        addClaimTopicInternal(msg.sender, _claimTopic);
    }

    function addClaimTopic(address sender, uint256 _claimTopic) external override {
        addClaimTopicInternal(sender, _claimTopic);
    }

    function addClaimTopicInternal(address sender, uint256 _claimTopic) internal {
        checkOnlyAgent(sender);
        uint256 length = _claimTopics.length;
        require(length < 15, "cannot require more than 15 topics");
        for (uint256 i = 0; i < length; i++) {
            require(_claimTopics[i] != _claimTopic, "claimTopic already exists");
        }
        _claimTopics.push(_claimTopic);
        emit ClaimTopicAdded(_claimTopic);
    }

    function addTypeClaimTopic(address sender, string memory typeName, uint256 claimTopic) external override {
        addTypeClaimTopicInternal(sender, typeName, claimTopic);
    }

    function addTypeClaimTopic(string memory typeName, uint256 claimTopic) external override {
        addTypeClaimTopicInternal(msg.sender, typeName, claimTopic);
    }


    function addTypeClaimTopicInternal(address sender, string memory typeName, uint256 claimTopic) internal {
        checkOnlyAgent(sender);
        require(!_typeClaimTopicExists[typeName][claimTopic], "claimTopic already exists for this type");
        require(_typeClaimTopics[typeName].length < 15, "cannot require more than 15 topics per type");

        if (_typeClaimTopics[typeName].length == 0) {
            _types.push(typeName);
        }

        _typeClaimTopics[typeName].push(claimTopic);
        _typeClaimTopicExists[typeName][claimTopic] = true;
    }

    function setTypeClaimTopics(address sender, string calldata typeName, uint256[] calldata claimTopics) external override {
        setTypeClaimTopicInternal(sender, typeName, claimTopics);
    }

    function setTypeClaimTopics(string memory typeName, uint256[] memory claimTopics) external override {
        setTypeClaimTopicInternal(msg.sender, typeName, claimTopics);
    }

    function setTypeClaimTopicInternal(address sender, string memory typeName, uint256[] memory claimTopics) internal {
        checkOnlyAgent(sender);
        require(_typeClaimTopics[typeName].length == 0, "claimTopics already exists for this type");
        require(_typeClaimTopics[typeName].length < 15, "cannot require more than 15 topics per type");

        _typeClaimTopics[typeName] = claimTopics;
        _types.push(typeName);

        for (uint256 i = 0; i < claimTopics.length; i++) {
            _typeClaimTopicExists[typeName][claimTopics[i]] = true;
        }
    }

    function removeTypeClaimTopic(string memory typeName, uint256 claimTopic) external override {
        removeTypeClaimTopicInternal(msg.sender, typeName, claimTopic);
    }

    function removeTypeClaimTopic(address sender, string memory typeName, uint256 claimTopic) external override {
        removeTypeClaimTopicInternal(sender, typeName, claimTopic);
    }

    /**
     * @dev Remove a claim topic for a specific type
     * @param typeName The name of the type
     * @param claimTopic The claim topic to remove
     */
    function removeTypeClaimTopicInternal(address sender, string memory typeName, uint256 claimTopic) internal {
        checkOnlyAgent(sender);
        require(_typeClaimTopicExists[typeName][claimTopic], "claimTopic does not exist for this type");

        uint256[] storage topics = _typeClaimTopics[typeName];
        for (uint256 i = 0; i < topics.length; i++) {
            if (topics[i] == claimTopic) {
                topics[i] = topics[topics.length - 1];
                topics.pop();
                _typeClaimTopicExists[typeName][claimTopic] = false;
                break;
            }
        }
        if (topics.length == 0) {
            string[] storage types = _types;
            for (uint256 i = 0; i < types.length; i++) {
                if (keccak256(bytes(types[i])) == keccak256(bytes(typeName))) {
                    types[i] = types[types.length - 1];
                    types.pop();
                    break;
                }
            }
        }
    }

    function getContextTypes() external override view returns (string[] memory) {
        return _types;
    }

    /**
     * @dev Get claim topics for a specific type
     * @param typeName The name of the type
     * @return Array of claim topics
     */
    function getTypeClaimTopics(string memory typeName) external override view returns (uint256[] memory) {
        return _typeClaimTopics[typeName];
    }

    function getAllTypeClaimTopics() external override view returns (TypeClaimTopics[] memory) {
        uint256 typesLength = _types.length;
        TypeClaimTopics[] memory result = new TypeClaimTopics[](typesLength);

        for (uint i = 0; i < typesLength; i++) {
            string memory typeName = _types[i];
            result[i] = TypeClaimTopics({
            typeName: typeName,
            claimTopics: _typeClaimTopics[typeName]
            });
        }

        return result;
    }

    /**
     * @dev Check if a claim topic exists for a specific type
     * @param typeName The name of the type
     * @param claimTopic The claim topic to check
     * @return True if the claim topic exists for the type
     */
    function hasTypeClaimTopic(string memory typeName, uint256 claimTopic) external view returns (bool) {
        return _typeClaimTopicExists[typeName][claimTopic];
    }

    /**
     *  @dev See {IClaimTopicsRegistry-removeClaimTopic}.
     */
    function removeClaimTopic(uint256 _claimTopic) external override {
        removeClaimTopicInternal(msg.sender, _claimTopic);
    }

    function removeClaimTopic(address sender, uint256 _claimTopic) external override {
        removeClaimTopicInternal(sender, _claimTopic);
    }

    function removeClaimTopicInternal(address sender, uint256 _claimTopic) internal {
        checkOnlyAgent(sender);
        uint256 length = _claimTopics.length;
        for (uint256 i = 0; i < length; i++) {
            if (_claimTopics[i] == _claimTopic) {
                _claimTopics[i] = _claimTopics[length - 1];
                _claimTopics.pop();
                emit ClaimTopicRemoved(_claimTopic);
                break;
            }
        }
    }

    /**
     *  @dev See {IClaimTopicsRegistry-getClaimTopics}.
     */
    function getClaimTopics() external view override returns (uint256[] memory) {
        return _claimTopics;
    }
}

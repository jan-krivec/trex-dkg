// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

library ByteArr {
    function indexOf(bytes32[] storage self, bytes32 item) internal view returns (uint index, bool isThere) {
        for (uint i; i < self.length; i++) {
            if (self[i] == item) {
                return (i, true);
            }
        }
        return (0, false);
    }

    function removeByIndex(bytes32[] storage self, uint256 index) internal returns (bytes32[] memory) {
        require(index < self.length, "Index is out of array length");

        self[index] = self[self.length - 1];
        self.pop();

        return self;
    }

    function getFuncHash(bytes storage _data) internal view returns (bytes4) {
        bytes4 output;
        for (uint i; i < 4; i++) {
            output |= bytes4(_data[i] & 0xFF) >> (i * 8);
        }
        return output;
    }
}

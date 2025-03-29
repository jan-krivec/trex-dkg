// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Roles.sol";

contract AgentRole is Ownable {
    using Roles for Roles.Role;

    Roles.Role private _agents;
    address[] private _agentList;
    mapping(address => uint256) private keyIndex;

    event AgentAdded(address indexed _agent);
    event AgentRemoved(address indexed _agent);

    modifier onlyAgent() {
        require(isAgent(msg.sender), "AgentRole: caller does not have the Agent role");
        _;
    }

    function getAgents() external view returns (address[] memory) {
        return _agentList;
    }

    function addAgent(address _agent) public onlyOwner {
        require(_agent != address(0), "invalid argument - zero address");
        require(!isAgent(_agent), "Agent already exists");
        _agents.add(_agent);
        keyIndex[_agent] = _agentList.length;
        _agentList.push(_agent);
        emit AgentAdded(_agent);
    }

    function removeAgent(address _agent) public onlyOwner {
        require(_agent != address(0), "invalid argument - zero address");
        require(isAgent(_agent), "Agent does not exist");
        uint256 index = keyIndex[_agent];
        uint256 lastIndex = _agentList.length - 1;

        if (index != lastIndex) {
            address lastAgent = _agentList[lastIndex];
            _agentList[index] = lastAgent;
            keyIndex[lastAgent] = index;
        }

        _agentList.pop();
        delete keyIndex[_agent];  // Properly clear the mapping
        _agents.remove(_agent);
        emit AgentRemoved(_agent);
    }

    function isAgent(address _agent) public view returns (bool) {
        return _agents.has(_agent);
    }
}

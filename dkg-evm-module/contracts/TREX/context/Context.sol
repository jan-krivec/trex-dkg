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

    function adresses() external view returns (address _identityRegistry,
                                               address _modularCompliance,
                                               address _trustedIssuersRegistry,
                                               address _claimTopicsRegistry) {
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

    function getTypes() external override view returns (string[] memory) {
        IClaimTopicsRegistry claimTopicsRegistry = IClaimTopicsRegistry(_contextIdentityRegistry.topicsRegistry());
        return claimTopicsRegistry.getContextTypes();
    }

    function isVerified(string[] memory types, address user) external view override returns (bool){
        if (!_contextIdentityRegistry.isVerified(user)) {
            return false;
        }
        return _contextIdentityRegistry.isVerifiedForTypes(user, types);
    }

    function isVerifiedTransfer(string[] memory types, address from, address to) external view override returns (bool){
        return _contextIdentityRegistry.isVerified(to) && _contextCompliance.canTransfer(from, to);
    }
}

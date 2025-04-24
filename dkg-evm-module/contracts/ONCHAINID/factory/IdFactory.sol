// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "../proxy/IdentityProxy.sol";
import "./IIdFactory.sol";
import "../interface/IERC734.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../../v1/abstract/HubDependent.sol";

contract IdFactory is IIdFactory, HubDependent {

    mapping(address => bool) private _tokenFactories;

    // address of the _implementationAuthority contract making the link to the implementation contract
    address private immutable _implementationAuthority;

    // as it is not possible to deploy 2 times the same contract address, this mapping allows us to check which
    // salt is taken and which is not
    mapping(string => bool) private _saltTaken;

    // ONCHAINID of the wallet owner
    mapping(address => address) private _userIdentity;

    // ONCHAINID of the wallet owner
    mapping(address => address) private _claimIssuerMap;
    address[] private _claimIssuers;

    // wallets currently linked to an ONCHAINID
    mapping(address => address[]) private _wallets;

    // ONCHAINID of the asset
    mapping(address => address) private _assetIdentity;

    // asset linked to an ONCHAINID
    mapping(address => address) private _assetAddress;


    // setting
    constructor (address hubAddress, address implementationAuthority_) HubDependent(hubAddress){
        require(implementationAuthority_ != address(0), "invalid argument - zero address");
        _implementationAuthority = implementationAuthority_;
    }

    /**
     *  @dev See {IdFactory-addTokenFactory}.
     */
    function addTokenFactory(address _factory) external override onlyAgent {
        require(_factory != address(0), "invalid argument - zero address");
        require(!isTokenFactory(_factory), "already a factory");
        _tokenFactories[_factory] = true;
        emit TokenFactoryAdded(_factory);
    }

    /**
     *  @dev See {IdFactory-removeTokenFactory}.
     */
    function removeTokenFactory(address _factory) external override onlyAgent {
        require(_factory != address(0), "invalid argument - zero address");
        require(isTokenFactory(_factory), "not a factory");
        _tokenFactories[_factory] = false;
        emit TokenFactoryRemoved(_factory);
    }

    /**
     *  @dev See {IdFactory-createIdentity}.
     */
    function createIdentity(
        address _wallet,
        string memory _salt)
    external onlyAgent override returns (address) {
        require(_wallet != address(0), "invalid argument - zero address");
        require(keccak256(abi.encode(_salt)) != keccak256(abi.encode("")), "invalid argument - empty string");
        string memory oidSalt = string.concat("OID",_salt);
        require (!_saltTaken[oidSalt], "salt already taken");
        require (_userIdentity[_wallet] == address(0), "wallet already linked to an identity");
        address identity = _deployIdentity(oidSalt, _implementationAuthority, _wallet);
        _saltTaken[oidSalt] = true;
        _userIdentity[_wallet] = identity;
        _wallets[identity].push(_wallet);
        emit WalletLinked(_wallet, identity);
        return identity;
    }

    /**
     *  @dev See {IdFactory-createIdentityWithManagementKeys}.
     */
    function createIdentityWithManagementKeys(
        address _wallet,
        string memory _salt,
        bytes32[] memory _managementKeys
    ) external onlyAgent override returns (address) {
        require(_wallet != address(0), "invalid argument - zero address");
        require(keccak256(abi.encode(_salt)) != keccak256(abi.encode("")), "invalid argument - empty string");
        string memory oidSalt = string.concat("OID",_salt);
        require (!_saltTaken[oidSalt], "salt already taken");
        require (_userIdentity[_wallet] == address(0), "wallet already linked to an identity");
        require(_managementKeys.length > 0, "invalid argument - empty list of keys");

        address identity = _deployIdentity(oidSalt, _implementationAuthority, address(this));

        for (uint i = 0; i < _managementKeys.length; i++) {
            require(
                _managementKeys[i] != keccak256(abi.encode(_wallet))
                , "invalid argument - wallet is also listed in management keys");
            IERC734(identity).addKey(
                _managementKeys[i],
                1,
                1
            );
        }

        IERC734(identity).removeKey(
            keccak256(abi.encode(address(this))),
            1
        );

        _saltTaken[oidSalt] = true;
        _userIdentity[_wallet] = identity;
        _wallets[identity].push(_wallet);
        emit WalletLinked(_wallet, identity);

        return identity;
    }

    /**
     *  @dev See {IdFactory-createTokenIdentity}.
     */
    function createAssetIdentity(
        address _asset,
        address _assetOwner,
        string memory _ual)
    external override returns (address) {
        require((isTokenFactory(msg.sender)), "only Factory or owner can call");
        require(_asset != address(0), "invalid argument - zero address");
        require(_assetOwner != address(0), "invalid argument - zero address");
        require(keccak256(abi.encode(_ual)) != keccak256(abi.encode("")), "invalid argument - empty string");
        string memory assetIdSalt = string.concat("Asset",_ual);
        require(!_saltTaken[assetIdSalt], "salt already taken");
        require(_assetIdentity[_asset] == address(0), "asset already linked to an identity");
        address identity = _deployIdentity(assetIdSalt, _implementationAuthority, _assetOwner);
        _saltTaken[assetIdSalt] = true;
        _assetIdentity[_asset] = identity;
        _assetAddress[identity] = _asset;
        emit AssetLinked(_asset, identity);
        return identity;
    }

    /**
     *  @dev See {IdFactory-linkWallet}.
     */
    function linkWallet(address _newWallet) external override {
        require(_newWallet != address(0), "invalid argument - zero address");
        require(_userIdentity[msg.sender] != address(0), "wallet not linked to an identity contract");
        require(_userIdentity[_newWallet] == address(0), "new wallet already linked");
        require(_assetIdentity[_newWallet] == address(0), "invalid argument - asset address");
        address identity = _userIdentity[msg.sender];
        require(_wallets[identity].length < 101, "max amount of wallets per ID exceeded");
        _userIdentity[_newWallet] = identity;
        _wallets[identity].push(_newWallet);
        emit WalletLinked(_newWallet, identity);
    }

    /**
     *  @dev See {IdFactory-unlinkWallet}.
     */
    function unlinkWallet(address _oldWallet) external override {
        require(_oldWallet != address(0), "invalid argument - zero address");
        require(_oldWallet != msg.sender, "cannot be called on sender address");
        require(_userIdentity[msg.sender] == _userIdentity[_oldWallet], "only a linked wallet can unlink");
        address _identity = _userIdentity[_oldWallet];
        delete _userIdentity[_oldWallet];
        uint256 length = _wallets[_identity].length;
        for (uint256 i = 0; i < length; i++) {
            if (_wallets[_identity][i] == _oldWallet) {
                _wallets[_identity][i] = _wallets[_identity][length - 1];
                _wallets[_identity].pop();
                break;
            }
        }
        emit WalletUnlinked(_oldWallet, _identity);
    }

    function getClaimIssuers() external override view returns(Pair[] memory) {
        Pair[] memory pairs = new Pair[](_claimIssuers.length);

        for (uint256 i = 0; i < _claimIssuers.length; i++) {
            address addr1 = _claimIssuers[i];
            address addr2 = _claimIssuerMap[addr1];
            pairs[i] = Pair(addr1, addr2);
        }

        return pairs;
    }

    function getClaimIssuer(address issuer) external override view returns (address) {
        require(_claimIssuerMap[issuer] != address(0), "Issuer is not registered");
        return _claimIssuerMap[issuer];
    }

    function registerClaimIssuer(address add, address claimIssuerAdr) external onlyAgent override{
        require(add != address(0), "invalid argument - zero address");
        require(claimIssuerAdr != address(0), "invalid argument - claimIssuer zero address");
        require(_claimIssuerMap[add] == address(0), "address already linked");

        _claimIssuerMap[add] = claimIssuerAdr;
        _claimIssuers.push(add);

        emit ClaimIssuerRegistered(add, claimIssuerAdr);
    }

    function unregisterClaimIssuer(address add) external onlyAgent override{
        require(add != address(0), "invalid argument - zero address");
        require(_claimIssuerMap[add] != address(0), "claim issuer does not exist");

        _claimIssuerMap[add] = address(0);
        uint256 length = _claimIssuers.length;
        for (uint256 i = 0; i < length; i++) {
            if (_claimIssuers[i] == add) {
                _claimIssuers[i] = _claimIssuers[length - 1];
                _claimIssuers.pop();
            }
        }

        emit ClaimIssuerUnregistered(add);
    }

    /**
     *  @dev See {IdFactory-getIdentity}.
     */
    function getIdentity(address _wallet) external override view returns (address) {
        if(_assetIdentity[_wallet] != address(0)) {
            return _assetIdentity[_wallet];
        }
        else {
            return _userIdentity[_wallet];
        }
    }

    /**
     *  @dev See {IdFactory-isSaltTaken}.
     */
    function isSaltTaken(string calldata _salt) external override view returns (bool) {
        return _saltTaken[_salt];
    }

    /**
     *  @dev See {IdFactory-getWallets}.
     */
    function getWallets(address _identity) external override view returns (address[] memory) {
        return _wallets[_identity];
    }

    /**
     *  @dev See {IdFactory-getToken}.
     */
    function getToken(address _identity) external override view returns (address) {
        return _assetAddress[_identity];
    }

    /**
     *  @dev See {IdFactory-isTokenFactory}.
     */
    function isTokenFactory(address _factory) public override view returns(bool) {
        return _tokenFactories[_factory];
    }

    /**
     *  @dev See {IdFactory-implementationAuthority}.
     */
    function implementationAuthority() public override view returns (address) {
        return _implementationAuthority;
    }

    // deploy function with create2 opcode call
    // returns the address of the contract created
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

    // function used to deploy an identity using CREATE2
    function _deployIdentity
    (
        string memory _salt,
        address implementationAuthority_,
        address _wallet
    ) private returns (address){
        bytes memory _code = type(IdentityProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_, _wallet);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }
}

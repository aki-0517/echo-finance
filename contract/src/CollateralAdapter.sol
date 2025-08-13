// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IPriceFeed.sol";
import "./interfaces/IERC20Extended.sol";

contract CollateralAdapter is Ownable, ReentrancyGuard {
    IPriceFeed public sPriceFeed;
    IERC20Extended public sToken;
    IStakedToken public stSToken;
    
    uint256 public constant PRICE_PRECISION = 1e18;
    uint256 public constant STALENESS_THRESHOLD = 3600; // 1 hour
    
    event PriceFeedUpdated(address indexed newPriceFeed);
    event TokensUpdated(address indexed sToken, address indexed stSToken);
    
    constructor(address _sPriceFeed, address _sToken, address _stSToken) Ownable(msg.sender) {
        require(_sPriceFeed != address(0), "Invalid price feed");
        require(_sToken != address(0), "Invalid S token");
        require(_stSToken != address(0), "Invalid stS token");
        
        sPriceFeed = IPriceFeed(_sPriceFeed);
        sToken = IERC20Extended(_sToken);
        stSToken = IStakedToken(_stSToken);
    }
    
    function setPriceFeed(address _sPriceFeed) external onlyOwner {
        require(_sPriceFeed != address(0), "Invalid price feed");
        sPriceFeed = IPriceFeed(_sPriceFeed);
        emit PriceFeedUpdated(_sPriceFeed);
    }
    
    function setTokens(address _sToken, address _stSToken) external onlyOwner {
        require(_sToken != address(0), "Invalid S token");
        require(_stSToken != address(0), "Invalid stS token");
        sToken = IERC20Extended(_sToken);
        stSToken = IStakedToken(_stSToken);
        emit TokensUpdated(_sToken, _stSToken);
    }
    
    function getSPrice() public view returns (uint256) {
        (, int256 price, , uint256 updatedAt, ) = sPriceFeed.latestRoundData();
        
        require(price > 0, "Invalid price");
        require(block.timestamp - updatedAt <= STALENESS_THRESHOLD, "Price data is stale");
        
        uint8 decimals = sPriceFeed.decimals();
        return uint256(price) * PRICE_PRECISION / (10 ** decimals);
    }
    
    function getStSPrice() public view returns (uint256) {
        uint256 sPrice = getSPrice();
        uint256 exchangeRate = stSToken.exchangeRate();
        return sPrice * exchangeRate / PRICE_PRECISION;
    }
    
    function getCollateralUSDValue(uint256 sAmount, uint256 stSAmount) external view returns (uint256) {
        uint256 sValue = 0;
        uint256 stSValue = 0;
        
        if (sAmount > 0) {
            sValue = sAmount * getSPrice() / PRICE_PRECISION;
        }
        
        if (stSAmount > 0) {
            stSValue = stSAmount * getStSPrice() / PRICE_PRECISION;
        }
        
        return sValue + stSValue;
    }
    
    function getTokenValue(address token, uint256 amount) external view returns (uint256) {
        if (token == address(sToken)) {
            return amount * getSPrice() / PRICE_PRECISION;
        } else if (token == address(stSToken)) {
            return amount * getStSPrice() / PRICE_PRECISION;
        } else {
            revert("Unsupported token");
        }
    }
}
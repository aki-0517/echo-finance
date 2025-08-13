// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../src/interfaces/IERC20Extended.sol";

contract MockSToken is ERC20 {
    uint8 private _decimals;
    
    constructor(string memory name, string memory symbol, uint8 __decimals) ERC20(name, symbol) {
        _decimals = __decimals;
    }
    
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockStSToken is ERC20 {
    uint8 private _decimals;
    uint256 public exchangeRate;
    
    constructor(string memory name, string memory symbol, uint8 __decimals, uint256 _exchangeRate) 
        ERC20(name, symbol) {
        _decimals = __decimals;
        exchangeRate = _exchangeRate;
    }
    
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    function setExchangeRate(uint256 _exchangeRate) external {
        exchangeRate = _exchangeRate;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
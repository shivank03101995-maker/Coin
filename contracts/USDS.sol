// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDS is ERC20, ERC20Burnable, Ownable {
    uint8 private immutable tokenDecimals;

    constructor(address initialOwner, uint256 initialSupply) ERC20("USDT", "USDT") Ownable(initialOwner) {
        require(initialOwner != address(0), "Initial owner is required");
        tokenDecimals = 18;
        _mint(initialOwner, initialSupply * (10 ** uint256(tokenDecimals)));
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Recipient is required");
        _mint(to, amount * (10 ** uint256(tokenDecimals)));
    }

    function decimals() public view override returns (uint8) {
        return tokenDecimals;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TaxVault {
    IERC20 public idrxToken;

    mapping(address => uint256) public taxBalance;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    constructor(address _idrxToken) {
        idrxToken = IERC20(_idrxToken);
    }

    function depositTax(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        
        bool success = idrxToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        taxBalance[msg.sender] += amount;
        
        emit Deposit(msg.sender, amount);
    }

    function withdrawTax(uint256 amount) external {
        require(taxBalance[msg.sender] >= amount, "Insufficient balance");
        
        taxBalance[msg.sender] -= amount;
        
        bool success = idrxToken.transfer(msg.sender, amount);
        require(success, "Transfer failed");
        
        emit Withdraw(msg.sender, amount);
    }
}
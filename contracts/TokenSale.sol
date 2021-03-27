// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import './BatToken.sol';

contract TokenSale {

    address payable owner;
    BatToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(BatToken _tokenContract, uint256 _tokenPrice) public {
        owner = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }
    modifier onlyOwner {
            require(
                msg.sender == owner,
                "Only owner can call this function."
            );
            _;
        }
    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(tokenPrice, _numberOfTokens));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokenSold += _numberOfTokens; 
        emit Sell(msg.sender, _numberOfTokens); 
    }

    function endSale() public onlyOwner{
        require(tokenContract.transfer(owner, tokenContract.balanceOf(address(this))));
        // selfdestruct(owner);
    }

    function multiply(uint x, uint y) internal pure returns(uint z) {
        require(y == 0 || (z = x*y) / y == x);
    }
}
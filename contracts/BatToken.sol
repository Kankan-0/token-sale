// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract BatToken {
    string public name = "BAT Token";
    string public symbol = "BAT";
    uint public totalSupply;
    mapping(address=>uint) public balanceOf;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    constructor (uint _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

}
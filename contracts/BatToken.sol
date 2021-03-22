// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract BatToken {
    //constructor
    //set the total supply
    //read the total supply
    uint public totalSupply;

    constructor () public {
        totalSupply = 1000000;
    }

}
//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}

contract ERC20 is IERC20 {
    uint public override totalSupply;
    mapping(address => uint) public override balanceOf;
    mapping(address => mapping(address => uint)) public override allowance;
    string public name = "minizymint";
    string public symbol = "MINIZY";
    uint8 public decimals = 18;

    function transfer(address recipient, uint amount) public override returns (bool) {
        require(amount > 0, "amount must be more than zero!");
        require(amount <= balanceOf[msg.sender], "amount is more than balanceOf!");

        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) public override returns (bool) {
        require(amount > 0, "amount must be more than zero!");
        require(amount <= balanceOf[msg.sender], "amount is more than balanceOf!");

        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint amount) public override returns (bool) {
        require(amount > 0, "amount must be more than zero!");
        require(amount <= allowance[sender][msg.sender], "amount is more than allowance!");
        require(amount <= balanceOf[sender], "amount is more than balanceOf!");

        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(address to, uint amount) internal {
        require(amount > 0, "amount must be more than zero!");

        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint amount) internal {
        require(amount > 0, "amount must be more than zero!");

        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }
}

contract MagicWallet is ERC20 {
    address _admin;
    
    constructor() {
        _admin = msg.sender;
    }

    function mint() public returns (bool) {
       mint(msg.sender, 100 * 10**uint(decimals));
       return true;
    }

    function burn(uint amount) public returns (bool) {
        require(amount > 0, "amount must be more than zero!");

        burn(msg.sender, amount);
        return true;
    }
 
    function getBalance() public view returns (uint) {
        return address(_admin).balance;
    }
}

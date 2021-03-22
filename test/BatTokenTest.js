const BatToken = artifacts.require("BatToken");

contract('BatToken', (accounts)=>{
    let tokenInstance;
    it('initializes the contract with the current values', ()=> {
        return BatToken.deployed().then(instance => {
            tokenInstance = instance;
            return tokenInstance.name();
        })
        .then(name => {
            assert.equal(name, 'BAT Token', 'Has the correct name');
            return tokenInstance.symbol();
        })
        .then(symbol => {
            assert.equal(symbol, 'BAT', 'Has the  correct symbol');
        })
    })
    
    it('sets the total supply upon deployment', ()=>{
        return BatToken.deployed().then(instance => {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(totalSupply => {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1000000')
            return tokenInstance.balanceOf(accounts[0]);
        }).then(adminBalance => {
            assert.equal(adminBalance.toNumber(), 1000000, 'Admin has the initial supply')
        })
    })

    it('transfers token ownership', ()=>{
        return BatToken.deployed().then(instance => {
            tokenInstance = instance;
            // .call doesnt trigger transaction, just calls the function
            return tokenInstance.transfer.call(accounts[1], 999999999999);
        })
        .then(assert.fail).catch(error=>{
            assert(error.message.indexOf('revert') >=0,'error must contain revert');
            return tokenInstance.transfer.call(accounts[1], 25000);
        }).then(success=>{
            assert.equal(success, true, 'Should return true');
            return tokenInstance.transfer(accounts[1], 25000);
        }).then(reciept=>{
            assert.equal(reciept.logs.length, 1, 'triggers one event');
            assert.equal(reciept.logs[0].event, 'Transfer', 'should be the transfer event');
            assert.equal(reciept.logs[0].args._from, accounts[0], 'the account from which the tokens are transferred');
            assert.equal(reciept.logs[0].args._to, accounts[1], 'the account to which the tokens are transferred');
            assert.equal(reciept.logs[0].args._value, 25000, 'log the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        })
        .then(balance=>{
            assert.equal(balance.toNumber(), 25000, 'adds the amount to receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(balance=>{
            assert.equal(balance.toNumber(), 1000000-25000, 'deducts the amount from sending account');
        })
    })

    it('apporves tokens for delegated transfer', ()=>{
        return BatToken.deployed().then(instance =>{
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1],100);
        }).then(success => {
            assert.equal(success, true,'should return true');
            return tokenInstance.approve(accounts[1],100,{from: accounts[0]});
        }).then(reciept=>{
            assert.equal(reciept.logs.length, 1, 'triggers one event');
            assert.equal(reciept.logs[0].event, 'Approval', 'should be the approve event');
            assert.equal(reciept.logs[0].args._owner, accounts[0], 'the account from which the tokens are transferred');
            assert.equal(reciept.logs[0].args._spender, accounts[1], 'the account to which the tokens are transferred');
            assert.equal(reciept.logs[0].args._value, 100, 'log the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(allowance => {
            assert.equal(allowance.toNumber(), 100, 'stores the allowance')
        })
    })

    it('handles delegated token transfer', ()=>{
        return BatToken.deployed().then(instance =>{
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];

            return tokenInstance.transfer(fromAccount,100, {from: accounts[0]});
        }).then(reciept=>{
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
        }).then(reciept => {
            return tokenInstance.transferFrom(fromAccount, toAccount, 1000, {from: spendingAccount})    
        }).then(assert.fail)
        .catch(err=>{
            assert(err.message.indexOf('revert') >= 0, 'Can not spend amount larger than balance');
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount})
        }).then(assert.fail)
        .catch(err=>{
            assert(err.message.indexOf('revert') >= 0, 'Can not spend amount larger than allowance');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 5, {from: spendingAccount})
        }).then(success=>{
            assert.equal(success, true, 'Should be true');
            return tokenInstance.transferFrom(fromAccount, toAccount, 5, {from: spendingAccount});
        }).then(reciept=> {
            assert.equal(reciept.logs.length, 1, 'triggers one event');
            assert.equal(reciept.logs[0].event, 'Transfer', 'should be the approve event');
            assert.equal(reciept.logs[0].args._from, fromAccount, 'the account from which the tokens are transferred');
            assert.equal(reciept.logs[0].args._to,  toAccount, 'the account to which the tokens are transferred');
            assert.equal(reciept.logs[0].args._value, 5, 'log the transfer amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then(balance => {
            assert.equal(balance.toNumber(), 95, 'deducts from the fromAccount');
            return tokenInstance.balanceOf(toAccount);
        }).then(balance => {
            assert.equal(balance.toNumber(), 5, 'adds to the toAccount');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(allowance => {
            assert.equal(allowance.toNumber(), 5, 'remaining allowance');
        })
    })
})
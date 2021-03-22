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
})
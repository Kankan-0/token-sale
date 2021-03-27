const TokenSale = artifacts.require('TokenSale')
const BatToken = artifacts.require('BatToken')

contract('TokenSale', (accounts)=>{
    let tokenSaleInstance, 
        tokenPrice = 10000000000,
        tokensAvailable = 750000,
        admin = accounts[0], 
        buyer = accounts[7];

    it('initializes the contract with correct values', ()=>{
        return TokenSale.deployed().then(instance => {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(address=>{
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(address=> {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(price=>{
            assert.equal(price, tokenPrice)
        })
    })

    it('facilitates token buying', ()=>{
        let numberOfTokensToBuy = 10;
        let tokenInstance;
        return BatToken.deployed()
        .then(instance => {
            tokenInstance = instance;
            return TokenSale.deployed()
        })
        .then(instance => {
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from:admin})
        }).then(receipt=>{
            return tokenSaleInstance.buyTokens(numberOfTokensToBuy, {from:buyer, value: numberOfTokensToBuy*tokenPrice});
        
        }).then(receipt=>{
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(balance => {
            assert.equal(balance.toNumber(), tokensAvailable-numberOfTokensToBuy);
            return tokenInstance.balanceOf(buyer);
        }).then(balance => {
            assert.equal(balance.toNumber(), numberOfTokensToBuy);
            return tokenSaleInstance.tokenSold();
        }).then(amount=>{
            assert.equal(amount.toString(), numberOfTokensToBuy);
            return tokenSaleInstance.buyTokens(10000000, {from:buyer, value: numberOfTokensToBuy*tokenPrice});
        })
        .then(assert.fail)
        .catch(err=>{
            assert(err.message.indexOf('revert') >= 0, 'Can not buy tokens that are not available for sell.');
            return tokenSaleInstance.buyTokens(numberOfTokensToBuy, {from:buyer, value: 1});
        })
        .then(assert.fail)
        .catch(err=>{
            assert(err.message.indexOf('revert') >= 0, 'msg.value should be equal to tokens*price');
        })
    })

    it('ends the token sale', ()=>{
        return BatToken.deployed()
        .then(instance => {
            tokenInstance = instance;
            return TokenSale.deployed()
        })
        .then(instance => {
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({from: buyer})
        }).then(assert.fail)
        .catch(err=>{
            assert(err.message.indexOf('revert') >= 0, 'should be an admin to end the sale')
            return tokenSaleInstance.endSale({from: admin})
        }).then(receipt => {
            return tokenInstance.balanceOf(admin);
        }).then(balance => {
            assert.equal(balance.toNumber(), 999990, 'returns all unsold tokens to admin')
        })
    })
})
const BatToken = artifacts.require("BatToken");

contract('BatToken', (accounts)=>{
    it('sets the total supply upon deployment', ()=>{
        return BatToken.deployed().then(instance => {
            let tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(totalSupply => {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1000000')
        })
    })
})
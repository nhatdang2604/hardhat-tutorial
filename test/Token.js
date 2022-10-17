const { expect } = require("chai");

describe("Token contract", function () {
    
    it("Deployment should assign the total supply of tokens to the owner", async function () {
        
        const [owner] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        const hardhatToken = await Token.deploy();

        //Compare if the total amount of token is equals with the balance of the 
        //  person who deploying the contract
        const ownerBalance = await hardhatToken.balanceOf(owner.address);
        expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
            
    });

    it("Should transfer token between accounts", async function() {
        
        const [owner, addr1, addr2] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        const hardhatToken = await Token.deploy();

        //Transfer 50 tokens from owner to addr1
        let amountOfTokenTransfered = 50;
        await hardhatToken.transfer(addr1.address, amountOfTokenTransfered);
        //Assert if the balance of addr1 is 50
        expect(await hardhatToken.balanceOf(addr1.address)).to.equal(amountOfTokenTransfered);
        
        //Transfer 50 tokens from addr1 to addr2
        await hardhatToken.connect(addr1).transfer(addr2.address, amountOfTokenTransfered);
        //Assert if the balance of addr1 is 0 and addr2 is 50
        expect(await hardhatToken.balanceOf(addr1.address)).to.equal(0);
        expect(await hardhatToken.balanceOf(addr2.address)).to.equal(amountOfTokenTransfered);
    }); 
});
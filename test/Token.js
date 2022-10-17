
// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("Token contract", function () {
    
    // We define a fixture to reuse the same setup in every test. We use
    // loadFixture to run this setup once, snapshot that state, and reset Hardhat
    // Network to that snapshot in every test.
    async function deployTokenFixture() {

        // Get the ContractFactory and Signers here.
        const [owner, addr1, addr2] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        
        // To deploy our contract, we just have to call Token.deploy() and await
        // its deployed() method, which happens onces its transaction has been
        // mined.
        const hardhatToken = await Token.deploy();
        await hardhatToken.deployed();

        // Fixtures can return anything you consider useful for your tests
        return {Token, hardhatToken, owner, addr1, addr2};
    }

    // You can nest describe calls to create subsections.
    describe("Deployment", function() {

        // `it` is another Mocha function. This is the one you use to define each
        // of your tests. It receives the test name, and a callback function.
        //
        // If the callback function is async, Mocha will `await` it.
        it("Should set the right owner", async function () {
            // We use loadFixture to setup our environment, and then assert that
            // things went well
            const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
    
            // `expect` receives a value and wraps it in an assertion object. These
            // objects have a lot of utility methods to assert values.
    
            // This test expects the owner variable stored in the contract to be
            // equal to our Signer's owner.
            expect(await hardhatToken.owner()).to.equal(owner.address);
        });
  

        it("Deployment should assign the total supply of tokens to the owner", async function () {
        
            const {hardhatToken, owner} = await loadFixture(deployTokenFixture);
    
            //Compare if the total amount of token is equals with the balance of the 
            //  person who deploying the contract
            const ownerBalance = await hardhatToken.balanceOf(owner.address);
            expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
                
        });
    });
    
    describe("Transactions", function() {

        //Regular assertion version
        // it("Should transfer token between accounts", async function() {
            
        //     const {hardhatToken, owner, addr1, addr2} = await loadFixture(deployTokenFixture);

        //     //Transfer 50 tokens from owner to addr1
        //     let amountOfTokenTransfered = 50;
        //     await hardhatToken.transfer(addr1.address, amountOfTokenTransfered);
        //     //Assert if the balance of addr1 is 50
        //     expect(await hardhatToken.balanceOf(addr1.address)).to.equal(amountOfTokenTransfered);
            
        //     //Transfer 50 tokens from addr1 to addr2
        //     await hardhatToken.connect(addr1).transfer(addr2.address, amountOfTokenTransfered);
        //     //Assert if the balance of addr1 is 0 and addr2 is 50
        //     expect(await hardhatToken.balanceOf(addr1.address)).to.equal(0);
        //     expect(await hardhatToken.balanceOf(addr2.address)).to.equal(amountOfTokenTransfered);
        // }); 


        //Transfer assertion async version
        it("Should transfer token between accounts", async function() {
            
            const {hardhatToken, owner, addr1, addr2} = await loadFixture(deployTokenFixture);

            //Transfer 50 tokens from owner to addr1
            let amountOfTokenTransfered = 50;
            await expect(
                hardhatToken.transfer(addr1.address, amountOfTokenTransfered)
                ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-amountOfTokenTransfered , amountOfTokenTransfered]);
            
            //Transfer 50 tokens from addr1 to addr2
            await expect(
                hardhatToken.connect(addr1).transfer(addr2.address, amountOfTokenTransfered)
                ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-amountOfTokenTransfered, amountOfTokenTransfered]);
        }); 

        it("Should emit Transfer event", async function(){
            const {hardhatToken, owner, addr1, addr2} = await loadFixture(deployTokenFixture);

            //Transfer 50 tokens from owner to addr1
            let amountOfTokenTransfered = 50;
            await expect(
                hardhatToken.transfer(addr1.address, amountOfTokenTransfered)
                ).to.emit(hardhatToken, "Transfer")
                .withArgs(owner.address, addr1.address, amountOfTokenTransfered);
           
            // Transfer 50 tokens from addr1 to addr2
            // We use .connect(signer) to send a transaction from another account
            await expect(
                hardhatToken.connect(addr1).transfer(addr2.address, amountOfTokenTransfered)
                ).to.emit(hardhatToken, "Transfer")
                .withArgs(addr1.address, addr2.address, amountOfTokenTransfered);

        });

        it("Should fail if sender doesn't have enought tokens", async function() {
            
            const { hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);
            const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
            const initialAddr1Balance = await hardhatToken.balanceOf(addr1.address);

            // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
            // `require` will evaluate false and revert the transaction.
            await expect(
                hardhatToken.connect(addr1).transfer(owner.address, 1)
                ).to.be.revertedWith("Not enough tokens");
        
            // Owner balance shouldn't have changed.
            expect(
                await hardhatToken.balanceOf(owner.address)
                ).to.equal(initialOwnerBalance);

            
            // Addr1 balance shouldn't have changed.
            expect(
                await hardhatToken.balanceOf(addr1.address)
                ).to.equal(initialAddr1Balance);

            
        });

    });

    
});
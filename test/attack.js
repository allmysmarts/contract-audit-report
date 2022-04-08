const { expect } = require("chai");
const { ethers } = require("hardhat");

const ADDR_0 = "0x0000000000000000000000000000000000000000";

describe("WalletSplitter", function() {
    before(async () => {
        [user1, recv5] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy();
        await token.deployed();

        const Receiver = await ethers.getContractFactory("Receiver");
        recv0 = await Receiver.deploy();
        await recv0.deployed();
        recv1 = await Receiver.deploy();
        await recv1.deployed();
        recv2 = await Receiver.deploy();
        await recv2.deployed();
        recv3 = await Receiver.deploy();
        await recv3.deployed();

        const WalletSplitter = await ethers.getContractFactory("WalletSplitter");
        splitter = await WalletSplitter.deploy(
            recv0.address,
            recv1.address,
            recv2.address,
            recv5.address
        );
        await splitter.deployed();

        await user1.sendTransaction({
            to: splitter.address,
            value: ethers.utils.parseEther("1")
        })

        await user1.sendTransaction({
            to: splitter.address,
            value: 1
        })

        await token.transfer(splitter.address, ethers.utils.parseEther("100"))
    });

    it("Receivers should have 0 balance", async () => {
        balance = await ethers.provider.getBalance(recv1.address)
        expect(balance).to.be.equal(0)
    });

    it("Withdraw should work", async () => {
        await splitter.withdraw({value: 2});

        balance = await ethers.provider.getBalance(recv0.address)
        expect(balance).to.be.gt(0)
        console.log(balance.toString())

        balance = await ethers.provider.getBalance(recv1.address)
        expect(balance).to.be.gt(0)
        console.log(balance.toString())

        balance = await ethers.provider.getBalance(splitter.address)
        expect(balance).to.be.equal(0)
    });

    it("withdrawToken() should work", async () => {
        oldRecv0Balance = await token.balanceOf(recv0.address)
        await splitter.withdrawToken(token.address)
        newRecv0Balance = await token.balanceOf(recv0.address)

        console.log("recv0 token balance: ", ethers.utils.formatEther(oldRecv0Balance))
        console.log("recv0 token balance: ", ethers.utils.formatEther(newRecv0Balance))
    })

    it("updateOwner should replace the owner address", async () => {
        const BadReceiver = await ethers.getContractFactory("BadReceiver");
        badRecv = await BadReceiver.deploy();
        await badRecv.deployed();
        await recv0.updateSplitOwner(splitter.address, badRecv.address)

        // owner0 is replaced into badRecv
        await expect(splitter.withdraw({value: ethers.utils.parseEther("1")})).to.be.reverted;

        // update owner0 into recv0 again
        await badRecv.updateSplitOwner(splitter.address, recv0.address)
        await splitter.withdraw({value: ethers.utils.parseEther("1")})

        // update owner0 into zero address
        await recv0.updateSplitOwner(splitter.address, ADDR_0)
        await expect(splitter.withdraw({value: ethers.utils.parseEther("1")})).not.be.reverted
    })

    it("withdraw() with value of very small amount", async () => {
        await splitter.withdraw({value: 1})
    })
});